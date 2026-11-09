import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import type { Metric } from "web-vitals";
const STORAGE_KEY = "coursework_web_vitals";
// Лимит 200 записей предотвращает неограниченный рост localStorage.
const MAX_SAVED_METRICS = 200;
function saveMetric(metric: Metric) {
  const entry = { name: metric.name, value: metric.value, rating: metric.rating, timestamp: new Date().toISOString() };
  try {
    const savedMetrics = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as (typeof entry)[];
    savedMetrics.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMetrics.slice(-MAX_SAVED_METRICS)));
  } catch { /* Сбор метрик не должен ломать приложение. */ }
  console.info("[Web Vital]", entry.name, entry.value, entry.rating);
}
export function startWebVitals() {
  onCLS(saveMetric); onFCP(saveMetric); onINP(saveMetric); onLCP(saveMetric); onTTFB(saveMetric);
}
