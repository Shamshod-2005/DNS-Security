import { api } from "./client";
import type { LogsResponse, LogsParams } from "./types";

// URL parametrlarini qurishda bo'sh va 'All' qiymatlarni o'tkazib yuborish
function buildQuery(params: LogsParams): string {
  const p = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== "" && val !== "All") {
      p.set(key, String(val));
    }
  }
  return p.toString();
}

// GET /api/logs — barcha 3 jurnal sahifasi shu funksiyani ishlatadi
export function fetchLogs(params: LogsParams): Promise<LogsResponse> {
  return api.get<LogsResponse>(`/api/logs?${buildQuery(params)}`);
}
