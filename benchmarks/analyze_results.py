from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd

RESULTS_FILE = Path(__file__).parent / "results" / "ttfb.csv"
OUTPUT_DIR = Path(__file__).parent / "results"


def main():
    data = pd.read_csv(RESULTS_FILE)

    summary = (
        data.groupby("architecture")["ttfb_ms"]
        .agg(["mean", "median", "min", "max", "std"])
        .round(2)
    )

    print(summary)

    summary.to_csv(OUTPUT_DIR / "ttfb_summary.csv", encoding="utf-8-sig")

    summary["mean"].plot(kind="bar")
    plt.title("Средний TTFB: SPA и MPA")
    plt.ylabel("TTFB, мс")
    plt.xlabel("Архитектура")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "ttfb_mean.png", dpi=160)
    plt.close()

    print(f"Таблица и график сохранены в: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
