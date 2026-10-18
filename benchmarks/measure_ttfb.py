import csv
import time
from pathlib import Path

import requests

RUNS = 10  # Количество повторений одного теста. 10 прогонов уменьшают влияние случайных скачков времени.
REQUEST_TIMEOUT_SECONDS = 10  # Максимальное ожидание одного HTTP-ответа в секундах.
PAUSE_BETWEEN_RUNS_SECONDS = 0.5  # Пауза между запросами в секундах, чтобы тесты не выполнялись слишком плотной серией.

TARGETS = [
    {
        "architecture": "SPA",
        "page": "catalog",
        "url": "http://localhost:4173/catalog",
    },
    {
        "architecture": "MPA",
        "page": "catalog",
        "url": "http://localhost:3000/catalog",
    },
]

OUTPUT_FILE = Path(__file__).parent / "results" / "ttfb.csv"


def measure_target(target):
    rows = []

    for run_number in range(1, RUNS + 1):
        response = requests.get(
            target["url"],
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()

        ttfb_ms = response.elapsed.total_seconds() * 1000

        rows.append(
            {
                "architecture": target["architecture"],
                "page": target["page"],
                "run": run_number,
                "ttfb_ms": round(ttfb_ms, 2),
            }
        )

        time.sleep(PAUSE_BETWEEN_RUNS_SECONDS)

    return rows


def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    all_rows = []

    for target in TARGETS:
        print(f"Измерение {target['architecture']}: {target['url']}")
        all_rows.extend(measure_target(target))

    with OUTPUT_FILE.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=["architecture", "page", "run", "ttfb_ms"],
        )
        writer.writeheader()
        writer.writerows(all_rows)

    print(f"Результаты сохранены: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
