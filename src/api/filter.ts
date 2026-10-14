import { api } from "./client";
import type {
  FilterManualResponse,
  FilterRemoveResponse,
  FilterResponse,
  FilterSearchResponse,
} from "./types";

/**
 * GET /api/filter — Saqlangan ro'yxatlar va statistika
 */
export function fetchFilter() {
  return api.get<FilterResponse>("/api/filter");
}

/**
 * GET /api/filter/search?q=... — Blocklist ichidan domen qidirish
 */
export function searchFilter(query: string) {
  return api.get<FilterSearchResponse>(
    `/api/filter/search?q=${encodeURIComponent(query)}`
  );
}

/**
 * POST /api/filter/manual — Domenlarni qo'lda qatorlar shaklida qo'shish
 */
export function addManualDomains(text: string) {
  return api.post<FilterManualResponse>("/api/filter/manual", { text });
}

/**
 * POST /api/filter/upload — .txt yoki .csv faylni yuklash
 */
export function uploadFilterFile(file: File) {
  return api.upload<FilterManualResponse>("/api/filter/upload", file, "file");
}

/**
 * POST /api/filter/remove — Domenlarni blocklistdan o'chirish (exclusions ga qo'shish)
 */
export function removeFilterDomains(domains: string[]) {
  return api.post<FilterRemoveResponse>("/api/filter/remove", { domains });
}

/**
 * POST /api/filter/delete — Saqlangan ro'yxat faylini o'chirish
 */
export function deleteFilterFile(name: string) {
  return api.post<{ ok: boolean; total_domains: number }>("/api/filter/delete", {
    name,
  });
}

/**
 * Saqlangan ro'yxat faylini yuklab olish havolasi
 */
export function getFilterDownloadUrl(name: string): string {
  return `/api/filter/download?name=${encodeURIComponent(name)}`;
}
