"""Summarize network-profile measurements and save comparison charts."""

from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd

RESULTS_DIR = Path(__file__).resolve().parent / "results" / "network_profiles"
INPUT_FILE = RESULTS_DIR / "network_profiles.csv"
SUMMARY_FILE = RESULTS_DIR / "network_profiles_summary.csv"


def main() -> None:
    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Не найден {INPUT_FILE}. Сначала запустите benchmark_network_profiles.py."
        )

    data = pd.read_csv(INPUT_FILE)
    metrics = ["performance_score", "fcp_ms", "lcp_ms", "inp_ms", "server_response_ms"]
    summary = (
        data.groupby(["network", "architecture"])[metrics]
        .agg(["mean", "median", "std"])
        .round(2)
    )
    summary.to_csv(SUMMARY_FILE, encoding="utf-8-sig")
    print(summary)
    print(f"Сводная таблица сохранена: {SUMMARY_FILE}")

    for metric, title, ylabel, filename in [
        ("performance_score", "Lighthouse Performance by network", "Score", "performance_by_network.png"),
        ("lcp_ms", "LCP by network profile", "LCP, ms", "lcp_by_network.png"),
        ("server_response_ms", "Server response time by network", "Time, ms", "ttfb_by_network.png"),
    ]:
        chart = data.groupby(["network", "architecture"])[metric].median().unstack()
        chart = chart.reindex(["3G", "4G", "WiFi"])
        chart.plot(kind="bar")
        plt.title(title)
        plt.ylabel(ylabel)
        plt.xlabel("Network profile")
        plt.xticks(rotation=0)
        plt.tight_layout()
        plt.savefig(RESULTS_DIR / filename, dpi=160)
        plt.close()
        print(f"График сохранён: {RESULTS_DIR / filename}")


if __name__ == "__main__":
    main()
