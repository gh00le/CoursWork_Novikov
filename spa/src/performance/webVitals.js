import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

const MAX_SAVED_METRICS = 200; // Максимум 200 записей, чтобы localStorage не разрастался при долгой разработке.

function saveMetric(metric) {
  const savedMetrics = JSON.parse(
    localStorage.getItem("coursework_web_vitals") ?? "[]",
  );

  savedMetrics.push({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    timestamp: new Date().toISOString(),
  });

  const limitedMetrics = savedMetrics.slice(-MAX_SAVED_METRICS);

  localStorage.setItem(
    "coursework_web_vitals",
    JSON.stringify(limitedMetrics),
  );

  console.log("[Web Vital]", metric.name, metric.value, metric.rating);
}

export function startWebVitals() {
  onCLS(saveMetric);
  onFCP(saveMetric);
  onINP(saveMetric);
  onLCP(saveMetric);
  onTTFB(saveMetric);
}
