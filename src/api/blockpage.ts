import { api } from "./client";
import type { BlockPageResponse } from "./types";

/**
 * GET /api/blockpage — Blok sahifasi fayli holati va tafsilotlari
 */
export function fetchBlockPage() {
  return api.get<BlockPageResponse>("/api/blockpage");
}

/**
 * POST /api/blockpage/upload — Maxsus .html blok sahifasi faylini yuklash
 */
export function uploadBlockPage(file: File) {
  return api.upload<BlockPageResponse>("/api/blockpage/upload", file, "file");
}

/**
 * POST /api/blockpage/reset — Standart blok sahifasini tiklash
 */
export function resetBlockPage() {
  return api.post<BlockPageResponse>("/api/blockpage/reset", {});
}

export const BLOCKPAGE_URLS = {
  preview: "/api/blockpage/preview",
  download: "/api/blockpage/download",
  ca: "/api/blockpage/ca",
} as const;

