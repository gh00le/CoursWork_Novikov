import csv
import json
import os
import shutil
import subprocess
import time
from pathlib import Path

import requests

RUNS = int(os.getenv("LIGHTHOUSE_RUNS", "30"))  # количество 30 повторов даёт более устойчивую медиану, чем единичный запуск.
REQUEST_TIMEOUT_SECONDS = 10  # тайм-аут в 10 секунд подходит для локального api и защищает от бесконечного ожидания.
LIGHTHOUSE_TIMEOUT_SECONDS = 120  # тайм-аут в 120 секунд оставляет lighthouse время на анализ при медленной эмуляции.
PAUSE_BETWEEN_RUNS_SECONDS = 1  # пауза в 1 секунду уменьшает влияние слишком плотной серии запусков.

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RESULTS_DIR = Path(__file__).resolve().parent / "results" / "final_cache"
TEMP_DIR = RESULTS_DIR / "tmp"

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

TARGETS = {
    "SPA": os.getenv("SPA_URL", "http://localhost:5173") + "/catalog",
    "MPA": os.getenv("MPA_URL", "http://localhost:3000") + "/catalog",
}

CSV_FILE = RESULTS_DIR / "lighthouse_cache_raw.csv"

FIELDNAMES = [
    "architecture",
    "cache_mode",
    "run",
    "performance_score",
    "fcp_ms",
    "lcp_ms",
    "cls",
    "tbt_ms",
    "speed_index_ms",
    "inp_ms",
    "server_response_ms",
    "total_transfer_kb",
    "js_transfer_kb",
    "request_count",
    "seo_score",
    "accessibility_score",
    "best_practices_score",
]


def find_npx_command() -> str:
    npx_command = shutil.which("npx.cmd") or shutil.which("npx")

    if npx_command is None:
        raise RuntimeError(
            "Не найден npx. Проверьте, что Node.js/npm установлены и доступны в PATH."
        )

    return npx_command


def run_compose_command(*arguments: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["docker", "compose", *arguments],
        cwd=PROJECT_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )


def flush_redis() -> None:
    result = run_compose_command(
        "exec",
        "-T",
        "redis",
        "redis-cli",
        "FLUSHDB",
    )

    if "OK" not in result.stdout:
        raise RuntimeError(f"Redis FLUSHDB завершился неожиданно: {result.stdout}")


def warm_backend_cache() -> None:
    urls = [
        f"{BACKEND_URL}/api/v1/categories",
        f"{BACKEND_URL}/api/v1/products",
    ]

    for url in urls:
        response = requests.get(
            url,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()


def extract_metric(report: dict, audit_id: str):
    audit = report.get("audits", {}).get(audit_id, {})
    return audit.get("numericValue")


def extract_lighthouse_result(
    architecture: str,
    cache_mode: str,
    run_number: int,
    report: dict,
) -> dict:
    performance_score = report["categories"]["performance"]["score"] * 100

    network_items = (
        report.get("audits", {})
        .get("network-requests", {})
        .get("details", {})
        .get("items", [])
    )

    js_transfer_bytes = sum(
        item.get("transferSize", 0)
        for item in network_items
        if item.get("resourceType") == "Script"
    )

    categories = report.get("categories", {})
    return {
        "architecture": architecture,
        "cache_mode": cache_mode,
        "run": run_number,
        "performance_score": round(performance_score, 2),
        "fcp_ms": round(extract_metric(report, "first-contentful-paint") or 0, 2),
        "lcp_ms": round(extract_metric(report, "largest-contentful-paint") or 0, 2),
        "cls": round(extract_metric(report, "cumulative-layout-shift") or 0, 6),
        "tbt_ms": round(extract_metric(report, "total-blocking-time") or 0, 2),
        "speed_index_ms": round(extract_metric(report, "speed-index") or 0, 2),
        "inp_ms": round(extract_metric(report, "interaction-to-next-paint") or 0, 2),
        "server_response_ms": round(
            extract_metric(report, "server-response-time") or 0,
            2,
        ),
        "total_transfer_kb": round(
            (extract_metric(report, "total-byte-weight") or 0) / 1024,
            2,
        ),
        "js_transfer_kb": round(js_transfer_bytes / 1024, 2),
        "request_count": len(network_items),
        "seo_score": round((categories.get("seo", {}).get("score") or 0) * 100, 2),
        "accessibility_score": round(
            (categories.get("accessibility", {}).get("score") or 0) * 100, 2
        ),
        "best_practices_score": round(
            (categories.get("best-practices", {}).get("score") or 0) * 100, 2
        ),
    }


def run_lighthouse(
    npx_command: str,
    architecture: str,
    cache_mode: str,
    run_number: int,
) -> dict:
    url = TARGETS[architecture]

    output_file = TEMP_DIR / (
        f"{architecture.lower()}_{cache_mode}_{run_number:02d}.json"
    )

    command = [
        npx_command,
        "--yes",
        "lighthouse@13.5.0",
        url,
        "--quiet",
        "--only-categories=performance,seo,accessibility,best-practices",
        "--preset=desktop",
        "--output=json",
        f"--output-path={output_file}",
        "--chrome-flags=--headless=new --no-sandbox",
        "--no-enable-error-reporting",
    ]

    subprocess.run(
        command,
        cwd=PROJECT_ROOT,
        check=True,
        timeout=LIGHTHOUSE_TIMEOUT_SECONDS,
    )

    with output_file.open("r", encoding="utf-8") as file:
        report = json.load(file)

    return extract_lighthouse_result(
        architecture,
        cache_mode,
        run_number,
        report,
    )


def append_row(row: dict) -> None:
    file_exists = CSV_FILE.exists()

    with CSV_FILE.open("a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDNAMES)

        if not file_exists:
            writer.writeheader()

        writer.writerow(row)


def prepare_cache(cache_mode: str) -> None:
    flush_redis()

    if cache_mode == "warm":
        warm_backend_cache()


def main() -> None:
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)

    if CSV_FILE.exists():
        raise FileExistsError(
            f"Файл результатов уже существует: {CSV_FILE}\n"
            "Переместите его в архив или удалите перед новым полным экспериментом."
        )

    npx_command = find_npx_command()

    print("Проверка сервисов...")
    requests.get(
        f"{BACKEND_URL}/health",
        timeout=REQUEST_TIMEOUT_SECONDS,
    ).raise_for_status()

    total_runs = RUNS * len(TARGETS) * 2
    completed = 0

    for cache_mode in ("cold", "warm"):
        print(f"\n===== Redis: {cache_mode.upper()} =====")

        for run_number in range(1, RUNS + 1):
            # порядок spa/mpa чередуется, чтобы один вариант не всегда
            # тестировался первым при одинаковой фоновой нагрузке.
            if run_number % 2 == 1:
                architectures = ("SPA", "MPA")
            else:
                architectures = ("MPA", "SPA")

            for architecture in architectures:
                completed += 1
                print(
                    f"[{completed}/{total_runs}] "
                    f"{architecture} | {cache_mode} | run {run_number}/{RUNS}"
                )

                prepare_cache(cache_mode)

                row = run_lighthouse(
                    npx_command=npx_command,
                    architecture=architecture,
                    cache_mode=cache_mode,
                    run_number=run_number,
                )

                append_row(row)

                print(
                    f"  Performance={row['performance_score']}, "
                    f"FCP={row['fcp_ms']} ms, "
                    f"LCP={row['lcp_ms']} ms"
                )

                time.sleep(PAUSE_BETWEEN_RUNS_SECONDS)

    print(f"\nГотово. Сырые результаты: {CSV_FILE}")
    print(
        "Временные Lighthouse JSON оставлены в папке tmp, "
        "чтобы при необходимости можно было проверить отдельный прогон."
    )


if __name__ == "__main__":
    main()
