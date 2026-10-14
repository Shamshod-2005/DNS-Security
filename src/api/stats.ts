import { api } from "./client";
import type { RealtimeResponse, SummaryResponse, DrillResponse } from "./types";
import type { TimeRange } from "../types";

// GET /api/stats/realtime?window=60 — har 1 soniyada chaqiriladi
export function fetchRealtime(window = 60) {
  return api.get<RealtimeResponse>(`/api/stats/realtime?window=${window}`);
}

// GET /api/stats/summary?metric=pps&range=24h — har 15 soniyada chaqiriladi
export function fetchSummary(
  metric: "pps" | "bps" = "pps",
  range: TimeRange = "24h",
) {
  return api.get<SummaryResponse>(
    `/api/stats/summary?metric=${metric}&range=${range}`,
  );
}

// GET /api/stats/drill — top ro'yxatdagi qator bosilganda
export function fetchDrill(
  type: "client" | "domain" | "malicious",
  key: string,
  metric: "pps" | "bps" = "pps",
) {
  return api.get<DrillResponse>(
    `/api/stats/drill?type=${type}&key=${encodeURIComponent(key)}&metric=${metric}`,
  );
}
