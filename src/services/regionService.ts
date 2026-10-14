import type {
  Region,
  RegionAlert,
  RegionMetricPoint,
  RegionSummaryStats,
} from "../types/region";
import { MOCK_REGIONS } from "../data/mockRegions";
import { generateMockRegionMetrics } from "../data/mockRegionMetrics";
import { MOCK_REGION_ALERTS } from "../data/mockRegionAlerts";
// import { api } from "../api/client"; // Will be enabled when backend is connected

/**
 * ============================================================================
 * REGION MONITORING SERVICE LAYER
 * ============================================================================
 * This service abstracts regional DNS monitoring data.
 * Currently backed by structured mock data.
 *
 * When backend developer implements the endpoints:
 *   GET /api/regions
 *   GET /api/regions/:id
 *   GET /api/regions/summary
 *   GET /api/regions/:id/metrics?range=:range
 *   GET /api/regions/:id/alerts
 *
 * Simply switch the mock returns to the commented `api.get(...)` calls below.
 * The UI and TanStack Query hooks will require ZERO modifications.
 * ============================================================================
 */

export async function getRegions(): Promise<Region[]> {
  // When backend is ready:
  // return api.get<Region[]>("/api/regions");

  // Mock implementation with slight async latency for realistic UX
  await new Promise((resolve) => setTimeout(resolve, 60));
  return [...MOCK_REGIONS];
}

export async function getRegionById(id: string): Promise<Region | null> {
  // When backend is ready:
  // return api.get<Region>(`/api/regions/${id}`);

  await new Promise((resolve) => setTimeout(resolve, 40));
  const found = MOCK_REGIONS.find((r) => r.id === id || r.code === id);
  return found ? { ...found } : null;
}

export async function getRegionSummary(): Promise<RegionSummaryStats> {
  // When backend is ready:
  // return api.get<RegionSummaryStats>("/api/regions/summary");

  await new Promise((resolve) => setTimeout(resolve, 50));
  const total = MOCK_REGIONS.length;
  const healthy = MOCK_REGIONS.filter((r) => r.status === "healthy").length;
  const warning = MOCK_REGIONS.filter((r) => r.status === "warning").length;
  const critical = MOCK_REGIONS.filter((r) => r.status === "critical").length;
  const offline = MOCK_REGIONS.filter((r) => r.status === "offline").length;

  const totalDnsServers = MOCK_REGIONS.reduce((acc, r) => acc + r.dnsServers, 0);
  const avgAvailability = parseFloat(
    (
      MOCK_REGIONS.reduce((acc, r) => acc + r.availability, 0) / (total || 1)
    ).toFixed(2)
  );
  const avgResponseMs = parseFloat(
    (
      MOCK_REGIONS.reduce((acc, r) => acc + r.avgResponseMs, 0) / (total || 1)
    ).toFixed(1)
  );
  const totalRequests24h = MOCK_REGIONS.reduce(
    (acc, r) => acc + r.totalRequests,
    0
  );

  return {
    totalRegions: total,
    healthyRegions: healthy,
    warningRegions: warning,
    criticalRegions: critical,
    offlineRegions: offline,
    totalDnsServers,
    avgAvailability,
    avgResponseMs,
    totalRequests24h,
  };
}

export async function getRegionMetrics(
  id: string,
  range: "1h" | "6h" | "24h" | "7d" | "30d" = "24h"
): Promise<RegionMetricPoint[]> {
  // When backend is ready:
  // return api.get<RegionMetricPoint[]>(`/api/regions/${id}/metrics?range=${range}`);

  await new Promise((resolve) => setTimeout(resolve, 50));
  return generateMockRegionMetrics(id, range);
}

export async function getRegionAlerts(regionId?: string): Promise<RegionAlert[]> {
  // When backend is ready:
  // const url = regionId ? `/api/regions/${regionId}/alerts` : "/api/regions/alerts";
  // return api.get<RegionAlert[]>(url);

  await new Promise((resolve) => setTimeout(resolve, 40));
  if (regionId) {
    return MOCK_REGION_ALERTS.filter(
      (a) => a.regionId === regionId || a.regionCode === regionId
    );
  }
  return [...MOCK_REGION_ALERTS];
}
