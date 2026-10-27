"""Run Lighthouse comparisons under simulated 3G, 4G, and Wi-Fi networks."""

import csv
import json
import os
import shutil
import subprocess
import time
from pathlib import Path

RUNS = int(os.getenv("NETWORK_RUNS", "5"))  # 5 повторов ограничивают длительность сетевого теста; для финала можно увеличить NETWORK_RUNS.
TIMEOUT_SECONDS = 180  # тайм-аут в 180 секунд нужен для профиля 3g, где lighthouse анализирует страницу дольше.
ROOT = Path(__file__).resolve().parent
RESULTS_DIR = ROOT / "results" / "network_profiles"
RAW_DIR = RESULTS_DIR / "raw"
OUTPUT_FILE = RESULTS_DIR / "network_profiles.csv"

TARGETS = {
    "SPA": os.getenv("SPA_URL", "http://localhost:5173") + "/catalog",
    "MPA": os.getenv("MPA_URL", "http://localhost:3000") + "/catalog",
}

# параметры являются приближёнными профилями для повторяемого эксперимента, а не точными
# измерениями реального мобильного оператора или wi-fi сети.
# профиль 3g: задержка 150 мс, пропускная способность 1600 кбит/с, замедление cpu в 4 раза.
# профиль 4g: задержка 40 мс, пропускная способность 9000 кбит/с, замедление cpu в 1.5 раза.
# профиль wi-fi: задержка 10 мс, пропускная способность 30000 кбит/с, без замедления cpu.
NETWORKS = {
    "3G": {"rtt_ms": 150, "throughput_kbps": 1600, "cpu_slowdown": 4},
    "4G": {"rtt_ms": 40, "throughput_kbps": 9000, "cpu_slowdown": 1.5},
    "WiFi": {"rtt_ms": 10, "throughput_kbps": 30000, "cpu_slowdown": 1},
}

FIELDS = [
    "architecture",
    "network",
    "run",
    "performance_score",
    "fcp_ms",
    "lcp_ms",
    "inp_ms",
    "cls",
    "server_response_ms",
    "total_transfer_kb",
    "js_transfer_kb",
    "request_count",
    "seo_score",
]


def npx_command() -> str:
    command = shutil.which("npx.cmd") or shutil.which("npx")
    if command is None:
        raise RuntimeError("Не найден npx. Установите Node.js и npm.")
    return command


def metric(report: dict, audit_id: str) -> float:
    return report.get("audits", {}).get(audit_id, {}).get("numericValue") or 0


def read_metrics(report: dict, architecture: str, network: str, run: int) -> dict:
    audits = report.get("audits", {})
    requests = audits.get("network-requests", {}).get("details", {}).get("items", [])
    js_bytes = sum(
        item.get("transferSize", 0)
        for item in requests
        if item.get("resourceType") == "Script"
    )
    categories = report.get("categories", {})

    return {
        "architecture": architecture,
        "network": network,
        "run": run,
        "performance_score": round(
            (categories.get("performance", {}).get("score") or 0) * 100, 2
        ),
        "fcp_ms": round(metric(report, "first-contentful-paint"), 2),
        "lcp_ms": round(metric(report, "largest-contentful-paint"), 2),
        "inp_ms": round(metric(report, "interaction-to-next-paint"), 2),
        "cls": round(metric(report, "cumulative-layout-shift"), 6),
        "server_response_ms": round(metric(report, "server-response-time"), 2),
        "total_transfer_kb": round(metric(report, "total-byte-weight") / 1024, 2),
        "js_transfer_kb": round(js_bytes / 1024, 2),
        "request_count": len(requests),
        "seo_score": round((categories.get("seo", {}).get("score") or 0) * 100, 2),
    }


def run_one(command: str, architecture: str, network: str, run: int) -> dict:
    profile = NETWORKS[network]
    output = RAW_DIR / f"{architecture.lower()}_{network.lower()}_{run:02d}.json"
    cli = [
        command,
        "--yes",
        "lighthouse@13.5.0",
        TARGETS[architecture],
        "--quiet",
        "--only-categories=performance,seo",
        "--preset=desktop",
        "--throttling-method=devtools",
        f"--throttling.rttMs={profile['rtt_ms']}",
        f"--throttling.throughputKbps={profile['throughput_kbps']}",
        f"--throttling.cpuSlowdownMultiplier={profile['cpu_slowdown']}",
        "--output=json",
        f"--output-path={output}",
        "--chrome-flags=--headless=new --no-sandbox",
        "--no-enable-error-reporting",
    ]
    subprocess.run(cli, cwd=ROOT.parent, check=True, timeout=TIMEOUT_SECONDS)
    with output.open(encoding="utf-8") as file:
        report = json.load(file)
    return read_metrics(report, architecture, network, run)


def main() -> None:
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    if OUTPUT_FILE.exists():
        raise FileExistsError(
            f"Файл уже существует: {OUTPUT_FILE}. Переместите его перед новым запуском."
        )

    command = npx_command()
    rows = []
    total = len(TARGETS) * len(NETWORKS) * RUNS
    completed = 0

    for network in NETWORKS:
        for run in range(1, RUNS + 1):
            architectures = ("SPA", "MPA") if run % 2 else ("MPA", "SPA")
            for architecture in architectures:
                completed += 1
                print(f"[{completed}/{total}] {architecture} / {network} / run {run}")
                rows.append(run_one(command, architecture, network, run))
                time.sleep(0.5)

    with OUTPUT_FILE.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Результаты сохранены в {OUTPUT_FILE}")
    print("Для сводной таблицы и графиков запустите: python analyze_network_profiles.py")


if __name__ == "__main__":
    main()
