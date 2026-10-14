import type { RegionMetricPoint } from "../types/region";

export function generateMockRegionMetrics(
  regionId: string,
  range: "1h" | "6h" | "24h" | "7d" | "30d" = "24h"
): RegionMetricPoint[] {
  const pointsCount = range === "1h" ? 12 : range === "6h" ? 24 : range === "24h" ? 24 : range === "7d" ? 14 : 30;
  
  // Base latency depending on status
  let baseMs = 20;
  let baseAvail = 99.9;
  if (regionId === "navoi") {
    baseMs = 380;
    baseAvail = 91.5;
  } else if (regionId === "karakalpakstan") {
    baseMs = 620;
    baseAvail = 65.0;
  } else if (["bukhara", "namangan", "kashkadarya"].includes(regionId)) {
    baseMs = 55;
    baseAvail = 98.2;
  }

  const result: RegionMetricPoint[] = [];
  const now = Date.now();
  const intervalMs =
    range === "1h"
      ? 5 * 60 * 1000
      : range === "6h"
      ? 15 * 60 * 1000
      : range === "24h"
      ? 60 * 60 * 1000
      : range === "7d"
      ? 12 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

  for (let i = pointsCount - 1; i >= 0; i--) {
    const time = new Date(now - i * intervalMs);
    const timeStr =
      range === "1h" || range === "6h" || range === "24h"
        ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : time.toLocaleDateString([], { month: "short", day: "numeric" });

    // Deterministic sine curve variance
    const variance = Math.sin(i * 0.8) * (baseMs * 0.15);
    const latency = Math.max(8, Math.round(baseMs + variance));
    const avail = Math.min(100, Math.max(40, parseFloat((baseAvail + Math.sin(i) * 0.4).toFixed(2))));
    const reqs = Math.round(400 + Math.cos(i * 0.5) * 150);
    const errs = baseMs > 100 ? Math.round(latency * 0.8) : Math.round(Math.random() * 5);

    result.push({
      timestamp: timeStr,
      responseTimeMs: latency,
      availability: avail,
      requests: reqs,
      errors: errs,
    });
  }

  return result;
}
