// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthMeResponse {
  username: string;
  must_change: boolean;
}

export interface AuthChangeRequest {
  current_password: string;
  username?: string;
  new_password?: string;
  confirm_password?: string;
}

export interface AuthChangeResponse {
  ok: boolean;
  username: string;
}

// ─── Dashboard statistikasi ───────────────────────────────────────────────────

// Realtime grafik uchun bitta soniya ma'lumoti
export interface RealtimePoint {
  t: number; // Unix vaqt, SONIYADA (ts (logs) dan farqli)
  pkts: number; // barcha so'rovlar soni
  bpkts: number; // bloklangan so'rovlar soni
  bytes: number; // barcha so'rovlar hajmi
  bbytes: number; // bloklangan so'rovlar hajmi
  dot_pkts: number; // shifrlangan DNS soni
  dot_bytes: number; // shifrlangan DNS hajmi
}

// pkts/bytes maydonlari bor, t yo'q (current va totals uchun)
export type RealtimeStats = Omit<RealtimePoint, "t">;

export interface RealtimeResponse {
  series: RealtimePoint[]; // ba'zi soniyalar tushib qolishi mumkin!
  current: RealtimeStats; // oxirgi to'liq soniya
  totals: RealtimeStats; // bugun yarim tundan beri jami
  window: number; // so'ralgan oyna (soniyada)
  now: number; // hozirgi Unix vaqt
}

// Top ro'yxat va drill-down qatori
export interface TopRow {
  name: string;
  count: number;
  bytes: number;
  pct: number;
}

export interface SummaryGeneral {
  queries: number;
  blocked: number;
  passed: number;
  block_rate: number;
  uniq_domains: number;
  uniq_clients: number;
  avg_size: number;
  bytes: number;
  blocked_bytes: number;
  passed_bytes: number;
}

export interface SummaryResponse {
  general: SummaryGeneral;
  top_clients: TopRow[];
  top_domains: TopRow[];
  top_blocked: TopRow[];
  metric: "pps" | "bps";
}

export interface DrillResponse {
  type: "client" | "domain" | "malicious";
  key: string;
  metric: "pps" | "bps";
  total_count: number;
  total_bytes: number;
  count: number;
  items: TopRow[];
}

// ─── Jurnallar ────────────────────────────────────────────────────────────────

export interface LogRow {
  ts: number; // MILLISEKUNDDA! (realtime.t soniyada — adashtirmang)
  src_ip: string;
  dst_ip: string;
  src_port: number;
  dst_port: number;
  protocol: "UDP" | "TCP";
  domain: string;
  qtype: number;
  qtype_name: string;
  rcode: number;
  an_count: number;
  size: number;
  blocked: 0 | 1;
  port_id: number;
  is_response: 0 | 1;
  rule?: string; // faqat malicious=1 da keladi
}

export interface LogsResponse {
  rows: LogRow[];
  total: number | null; // range=live da null bo'ladi → pager ko'rsatilmaydi
  page: number;
  page_size: number;
}

export interface LogsParams {
  malicious?: 0 | 1;
  dot?: 0 | 1;
  range?:
    | "live"
    | "5m"
    | "10m"
    | "1h"
    | "2h"
    | "4h"
    | "12h"
    | "24h"
    | "48h"
    | "7d"
    | "custom";
  start?: string; // ISO sana, faqat range=custom da
  finish?: string; // ISO sana, faqat range=custom da
  page?: number;
  page_size?: number;
  src_ip?: string;
  dst_ip?: string;
  src_port?: number;
  dst_port?: number;
  domain?: string;
  protocol?: "All" | "TCP" | "UDP";
}

// ─── Filter (Blocklist) ───────────────────────────────────────────────────────

export interface FilterFile {
  name: string;
  count: number; // fayldagi domenlar soni
  active: number; // hozir aktiv domenlar soni
  size: number; // fayl hajmi (baytda)
}

export interface FilterResponse {
  files: FilterFile[];
  total_domains: number;
  blocked_total: number;
  blocked_since: string;
}

export interface FilterSearchResult {
  domain: string;
  source: string;
}

export interface FilterSearchResponse {
  results: FilterSearchResult[]; // ko'pi bilan 300 ta
  count: number; // jami topilganlar soni
}

export interface FilterManualResponse {
  ok: boolean;
  name: string;
  added: number;
  duplicates: number;
  restored: number;
  total_domains: number;
}

export interface FilterRemoveResponse {
  ok: boolean;
  removed: number;
  deleted_lists: string[];
  total_domains: number;
}

// ─── Sozlamalar ───────────────────────────────────────────────────────────────

export interface SettingsResponse {
  block_dot: number;
  block_empty: number;
  block_malicious: number;
  match_subdomains: number;
  sinkhole: number;
  block_action: number;
  sinkhole_https: number;
  block_doh: number;
  capture_mode: number; // faqat o'qiladi!
  sinkhole_ip: string;
  redirect_url: string;
}

export interface EncDnsResponse {
  ok: boolean;
  domains: string; // har bir qatorda bitta domen
  ips: string; // har bir qatorda bitta IP
  domain_count: number;
  ip_count: number;
}

export interface RetentionEntry {
  enabled: boolean;
  days: number;
}

export interface RetentionResponse {
  normal: RetentionEntry;
  malicious: RetentionEntry;
  dot: RetentionEntry;
  ok?: boolean;
}

// ─── Block page ───────────────────────────────────────────────────────────────

export interface BlockPageResponse {
  ok: boolean;
  exists: boolean;
  size: number;
  has_marker: boolean; // {{DOMAIN}} belgisi bormi
  custom: boolean; // foydalanuvchi o'zi yuklaganmi
  updated: string;
  warnings?: string[]; // upload da kelishi mumkin
}

// ─── PCAP ─────────────────────────────────────────────────────────────────────

export interface PcapSession {
  type: "dns" | "dot" | "malicious";
  label: string;
  size_limit: number;
  count_limit: number;
  file_index: number;
  cur_bytes: number;
  packets: number;
  started_at: string;
}

export interface PcapFile {
  name: string;
  bytes: number;
  type: string;
  type_key: "dns" | "dot" | "malicious";
  recording: boolean;
  time: string;
}

export interface PcapStatusResponse {
  active: boolean;
  sessions: PcapSession[];
  files: PcapFile[];
  free_bytes: number;
  min_free: number;
  low_disk: boolean;
}

export interface PcapStartRequest {
  types: Array<{
    type: "dns" | "dot" | "malicious";
    size_value: number;
    size_unit: "KB" | "MB" | "GB";
    count: number;
    auto_stop: boolean;
  }>;
}
