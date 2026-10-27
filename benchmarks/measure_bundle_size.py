"""Measure production JavaScript bundle sizes for the SPA and Next.js builds."""

import csv
import gzip
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_FILE = ROOT / "benchmarks" / "results" / "bundle_size.csv"
ASSET_DIRS = {
    "SPA": ROOT / "spa" / "dist" / "assets",
    "MPA": ROOT / "mpa" / ".next" / "static" / "chunks",
}
FIELDS = ["architecture", "file", "size_bytes", "gzip_bytes"]


def main() -> None:
    rows = []
    for architecture, asset_dir in ASSET_DIRS.items():
        if not asset_dir.exists():
            raise FileNotFoundError(
                f"Не найдены production-файлы {architecture}: {asset_dir}. "
                "Сначала выполните npm run build в соответствующем фронтенде."
            )

        for asset in sorted(asset_dir.rglob("*.js")):
            content = asset.read_bytes()
            rows.append(
                {
                    "architecture": architecture,
                    "file": str(asset.relative_to(ROOT)),
                    "size_bytes": len(content),
                    # уровень 9 даёт максимально плотное gzip-сжатие для сопоставимого размера бандла.
                    "gzip_bytes": len(gzip.compress(content, compresslevel=9)),
                }
            )

        architecture_rows = [row for row in rows if row["architecture"] == architecture]
        rows.append(
            {
                "architecture": architecture,
                "file": "TOTAL",
                "size_bytes": sum(row["size_bytes"] for row in architecture_rows),
                "gzip_bytes": sum(row["gzip_bytes"] for row in architecture_rows),
            }
        )

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Размеры JS-бандлов сохранены: {OUTPUT_FILE}")
    for row in rows:
        if row["file"] == "TOTAL":
            print(
                f"{row['architecture']}: {row['size_bytes'] / 1024:.1f} KB raw, "
                f"{row['gzip_bytes'] / 1024:.1f} KB gzip"
            )


if __name__ == "__main__":
    main()
