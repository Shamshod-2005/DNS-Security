import { useQuery } from "@tanstack/react-query";
import {
  getRegions,
  getRegionById,
  getRegionSummary,
  getRegionMetrics,
  getRegionAlerts,
} from "../services/regionService";

export const REGION_QUERY_KEYS = {
  all: ["regions"] as const,
  list: () => [...REGION_QUERY_KEYS.all, "list"] as const,
  detail: (id: string) => [...REGION_QUERY_KEYS.all, "detail", id] as const,
  summary: () => [...REGION_QUERY_KEYS.all, "summary"] as const,
  metrics: (id: string, range: string) =>
    [...REGION_QUERY_KEYS.all, "metrics", id, range] as const,
  alerts: (regionId?: string) =>
    [...REGION_QUERY_KEYS.all, "alerts", regionId ?? "all"] as const,
};

export function useRegions() {
  return useQuery({
    queryKey: REGION_QUERY_KEYS.list(),
    queryFn: getRegions,
    staleTime: 60 * 1000,
  });
}

export function useRegion(id: string | null) {
  return useQuery({
    queryKey: REGION_QUERY_KEYS.detail(id ?? ""),
    queryFn: () => getRegionById(id!),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

export function useRegionSummary() {
  return useQuery({
    queryKey: REGION_QUERY_KEYS.summary(),
    queryFn: getRegionSummary,
    staleTime: 60 * 1000,
  });
}

export function useRegionMetrics(
  id: string | null,
  range: "1h" | "6h" | "24h" | "7d" | "30d" = "24h"
) {
  return useQuery({
    queryKey: REGION_QUERY_KEYS.metrics(id ?? "", range),
    queryFn: () => getRegionMetrics(id!, range),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

export function useRegionAlerts(regionId?: string) {
  return useQuery({
    queryKey: REGION_QUERY_KEYS.alerts(regionId),
    queryFn: () => getRegionAlerts(regionId),
    staleTime: 60 * 1000,
  });
}
