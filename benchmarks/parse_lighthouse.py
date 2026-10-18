from pathlib import Path
import json

import pandas as pd
import matplotlib.pyplot as plt

RESULTS_DIR = Path(__file__).parent / "results"

REPORT_FILES = {
    "SPA": RESULTS_DIR / "spa-lighthouse.report.json",
    "MPA": RESULTS_DIR / "mpa-lighthouse.report.json",
}

MPA_FALLBACK = RESULTS_DIR / "mpa-lighthous.report.json"


def load_report(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def audit_value(report: dict, audit_id: str):
    audit = report.get("audits", {}).get(audit_id, {})
    return audit.get("numericValue")


def collect_metrics(name: str, report: dict) -> dict:
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

    return {
        "architecture": name,
        "performance_score": round(performance_score, 1),
        "fcp_ms": round(audit_value(report, "first-contentful-paint") or 0, 2),
        "lcp_ms": round(audit_value(report, "largest-contentful-paint") or 0, 2),
        "cls": round(audit_value(report, "cumulative-layout-shift") or 0, 4),
        "tbt_ms": round(audit_value(report, "total-blocking-time") or 0, 2),
        "speed_index_ms": round(audit_value(report, "speed-index") or 0, 2),
        "tti_ms": round(audit_value(report, "interactive") or 0, 2),
        "server_response_ms": round(audit_value(report, "server-response-time") or 0, 2),
        "total_transfer_kb": round((audit_value(report, "total-byte-weight") or 0) / 1024, 2),
        "js_transfer_kb": round(js_transfer_bytes / 1024, 2),
    }


def save_chart(data: pd.DataFrame, metric: str, title: str, ylabel: str, filename: str):
    chart_data = data.set_index("architecture")[metric]

    chart_data.plot(kind="bar")
    plt.title(title)
    plt.ylabel(ylabel)
    plt.xlabel("Архитектура")
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(RESULTS_DIR / filename, dpi=160)
    plt.close()


def main():
    if not REPORT_FILES["SPA"].exists():
        raise FileNotFoundError(
            f"Не найден SPA Lighthouse JSON: {REPORT_FILES['SPA']}"
        )

    mpa_path = REPORT_FILES["MPA"]
    if not mpa_path.exists() and MPA_FALLBACK.exists():
        mpa_path = MPA_FALLBACK

    if not mpa_path.exists():
        raise FileNotFoundError(
            "Не найден MPA Lighthouse JSON. Ожидался "
            "mpa-lighthouse.report.json или mpa-lighthous.report.json"
        )

    rows = [
        collect_metrics("SPA", load_report(REPORT_FILES["SPA"])),
        collect_metrics("MPA", load_report(mpa_path)),
    ]

    data = pd.DataFrame(rows)

    output_csv = RESULTS_DIR / "lighthouse_comparison.csv"
    data.to_csv(output_csv, index=False, encoding="utf-8-sig")

    print(data.to_string(index=False))
    print(f"\nТаблица сохранена: {output_csv}")

    save_chart(
        data,
        "performance_score",
        "Lighthouse Performance: SPA и MPA",
        "Баллы",
        "lighthouse_performance.png",
    )

    save_chart(
        data,
        "lcp_ms",
        "Largest Contentful Paint: SPA и MPA",
        "LCP, мс",
        "lighthouse_lcp.png",
    )

    save_chart(
        data,
        "js_transfer_kb",
        "Переданный JavaScript: SPA и MPA",
        "Размер, КБ",
        "lighthouse_js_transfer.png",
    )

    print("Графики сохранены в папке results.")


if __name__ == "__main__":
    main()
