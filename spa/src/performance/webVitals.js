import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

const STORAGE_KEY = "coursework_web_vitals";
// лимит в 200 записей подходит для локального анализа и не позволяет хранилищу расти бесконечно.
const MAX_SAVED_METRICS = 200;

function saveMetric(metric) {
  const entry = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    timestamp: new Date().toISOString(),
  };

  try {
    const savedMetrics = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    savedMetrics.push(entry);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(savedMetrics.slice(-MAX_SAVED_METRICS)),
    );
  } catch {
    // сбор метрик не должен ломать магазин, если браузер запрещает доступ к хранилищу.
  }

  console.info("[Web Vital]", entry.name, entry.value, entry.rating);
}

export function startWebVitals() {
  onCLS(saveMetric);
  onFCP(saveMetric);
  onINP(saveMetric);
  onLCP(saveMetric);
  onTTFB(saveMetric);
}
