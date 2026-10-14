import { api } from "./client";
import type { EncDnsResponse, RetentionResponse, SettingsResponse } from "./types";

/**
 * GET /api/settings — Tizim sozlamalari va trafik boshqaruvi
 */
export function fetchSettings() {
  return api.get<SettingsResponse>("/api/settings");
}

/**
 * POST /api/settings — Sozlamalarni yangilash (faqat o'zgargan maydonlarni yuborish kifoya)
 */
export function updateSettings(body: Partial<SettingsResponse>) {
  return api.post<SettingsResponse>("/api/settings", body);
}

/**
 * GET /api/encdns — Shifrlangan DNS resolverlar (domen va IP)
 */
export function fetchEncDns() {
  return api.get<EncDnsResponse>("/api/encdns");
}

/**
 * POST /api/encdns — Shifrlangan DNS resolverlar ro'yxatini yangilash
 */
export function updateEncDns(body: { domains: string; ips: string }) {
  return api.post<EncDnsResponse>("/api/encdns", body);
}

/**
 * GET /api/retention — Loglarni saqlash muddati
 */
export function fetchRetention() {
  return api.get<RetentionResponse>("/api/retention");
}

/**
 * POST /api/retention — Loglarni saqlash muddatini yangilash
 */
export function updateRetention(body: {
  normal: { enabled: boolean; days: number };
  dot: { enabled: boolean; days: number };
  malicious: { enabled: boolean; days: number };
}) {
  return api.post<RetentionResponse>("/api/retention", body);
}

