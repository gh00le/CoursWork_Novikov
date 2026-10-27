import os
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd

RESULTS_DIR = Path(__file__).resolve().parent / "results" / "final_cache"
RAW_FILE = RESULTS_DIR / "lighthouse_cache_raw.csv"
SUMMARY_FILE = RESULTS_DIR / "lighthouse_cache_summary.csv"

GROUP_COLUMNS = ["architecture", "cache_mode"]

METRICS = [
    "performance_score",
    "fcp_ms",
    "lcp_ms",
    "cls",
    "tbt_ms",
    "speed_index_ms",
    "tti_ms",  # Only present in older Lighthouse result files.
    "inp_ms",
    "server_response_ms",
    "total_transfer_kb",
    "js_transfer_kb",
    "request_count",
    "seo_score",
    "accessibility_score",
    "best_practices_score",
]


def build_summary(data: pd.DataFrame) -> pd.DataFrame:
    frames = []

    for metric in (item for item in METRICS if item in data.columns):
        summary = (
            data.groupby(GROUP_COLUMNS)[metric]
            .agg(["mean", "median", "min", "max", "std"])
            .reset_index()
        )

        summary.insert(2, "metric", metric)
        frames.append(summary)

    result = pd.concat(frames, ignore_index=True)
    return result.round(3)


def build_cache_effect_table(data: pd.DataFrame) -> pd.DataFrame:
    rows = []

    for architecture in ("SPA", "MPA"):
        architecture_data = data[data["architecture"] == architecture]

        for metric in (
            item
            for item in ("fcp_ms", "lcp_ms", "speed_index_ms", "inp_ms", "tti_ms")
            if item in data.columns
        ):
            cold_median = architecture_data[
                architecture_data["cache_mode"] == "cold"
            ][metric].median()

            warm_median = architecture_data[
                architecture_data["cache_mode"] == "warm"
            ][metric].median()

            if cold_median == 0:
                improvement_percent = 0
            else:
                improvement_percent = (
                    (cold_median - warm_median) / cold_median * 100
                )

            rows.append(
                {
                    "architecture": architecture,
                    "metric": metric,
                    "cold_median": round(cold_median, 2),
                    "warm_median": round(warm_median, 2),
                    "warm_improvement_percent": round(
                        improvement_percent,
                        2,
                    ),
                }
            )

    return pd.DataFrame(rows)


def save_grouped_chart(
    data: pd.DataFrame,
    metric: str,
    title: str,
    ylabel: str,
    filename: str,
) -> None:
    chart_data = (
        data.groupby(GROUP_COLUMNS)[metric]
        .median()
        .unstack("cache_mode")
    )

    chart_data.plot(kind="bar")
    plt.title(title)
    plt.ylabel(ylabel)
    plt.xlabel("Архитектура")
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(RESULTS_DIR / filename, dpi=160)
    plt.close()


def main() -> None:
    if not RAW_FILE.exists():
        raise FileNotFoundError(
            f"Не найден файл: {RAW_FILE}\n"
            "Сначала выполните benchmark_lighthouse_cache.py"
        )

    data = pd.read_csv(RAW_FILE)

    expected_runs = int(os.getenv("LIGHTHOUSE_RUNS", "30"))

    counts = (
        data.groupby(GROUP_COLUMNS)
        .size()
        .reset_index(name="runs")
    )

    print("Количество прогонов:")
    print(counts.to_string(index=False))

    incomplete = counts[counts["runs"] != expected_runs]

    if not incomplete.empty:
        print(
            f"\nВНИМАНИЕ: не у всех групп ровно {expected_runs} прогонов. "
            "Проверьте эксперимент перед использованием результатов."
        )

    summary = build_summary(data)
    summary.to_csv(
        SUMMARY_FILE,
        index=False,
        encoding="utf-8-sig",
    )

    cache_effect = build_cache_effect_table(data)
    cache_effect.to_csv(
        RESULTS_DIR / "cache_effect.csv",
        index=False,
        encoding="utf-8-sig",
    )

    print("\nВлияние warm Redis на медианные значения:")
    print(cache_effect.to_string(index=False))

    save_grouped_chart(
        data,
        "performance_score",
        "Lighthouse Performance: cold и warm Redis",
        "Баллы",
        "cache_performance_median.png",
    )

    save_grouped_chart(
        data,
        "fcp_ms",
        "FCP: cold и warm Redis",
        "FCP, мс",
        "cache_fcp_median.png",
    )

    save_grouped_chart(
        data,
        "lcp_ms",
        "LCP: cold и warm Redis",
        "LCP, мс",
        "cache_lcp_median.png",
    )

    save_grouped_chart(
        data,
        "speed_index_ms",
        "Speed Index: cold и warm Redis",
        "Speed Index, мс",
        "cache_speed_index_median.png",
    )

    print(f"\nСводная таблица: {SUMMARY_FILE}")
    print(f"Остальные результаты: {RESULTS_DIR}")


if __name__ == "__main__":
    main()
