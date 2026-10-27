import csv
import os
import time
from pathlib import Path

import requests

RUNS = int(os.getenv("TTFB_RUNS", "10"))  # количество 10 повторов даёт базовую оценку разброса без долгого замера.
REQUEST_TIMEOUT_SECONDS = 10  # тайм-аут в 10 секунд ограничивает ожидание ответа от локального фронтенда.
PAUSE_BETWEEN_RUNS_SECONDS = 0.5  # пауза в полсекунды снижает вероятность влияния последовательных запросов друг на друга.

TARGETS = [
    {
        "architecture": "SPA",
        "page": "catalog",
        "url": os.getenv("SPA_URL", "http://localhost:5173") + "/catalog",
    },
    {
        "architecture": "MPA",
        "page": "catalog",
        "url": os.getenv("MPA_URL", "http://localhost:3000") + "/catalog",
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

        # requests.response.elapsed измеряет время до получения заголовков ответа.
        # это оценка ttfb на уровне http; браузерный navigation timing измеряется
        # отдельно через lighthouse для той же страницы.
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
