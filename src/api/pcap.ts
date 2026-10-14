import { api } from "./client";
import type {
  PcapStatusResponse,
  PcapStartRequest,
} from "./types";

/**
 * Fetch current PCAP recording status, active sessions, recorded files, and free disk bytes
 */
export async function fetchPcapStatus(): Promise<PcapStatusResponse> {
  return api.get<PcapStatusResponse>("/api/pcap/status");
}

/**
 * Start recording packet capture for selected types with size and count configuration
 */
export async function startPcap(
  req: PcapStartRequest
): Promise<PcapStatusResponse> {
  return api.post<PcapStatusResponse>("/api/pcap/start", req);
}

/**
 * Stop packet capture for a specific type or stop all if type is omitted
 */
export async function stopPcap(type?: string): Promise<PcapStatusResponse> {
  return api.post<PcapStatusResponse>("/api/pcap/stop", type ? { type } : {});
}

/**
 * Permanently delete a recorded .pcap file from disk
 */
export async function deletePcap(file: string): Promise<PcapStatusResponse> {
  return api.post<PcapStatusResponse>("/api/pcap/delete", { file });
}

/**
 * Generate a download URL for a given .pcap file
 */
export function getPcapDownloadUrl(file: string): string {
  return `/api/pcap/download?file=${encodeURIComponent(file)}`;
}

