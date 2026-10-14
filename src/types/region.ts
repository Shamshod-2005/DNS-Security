export type RegionStatus = "healthy" | "warning" | "critical" | "offline";

export interface Region {
  id: string;
  code: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  status: RegionStatus;
  dnsServers: number;
  healthyServers: number;
  warningServers: number;
  criticalServers: number;
  avgResponseMs: number;
  availability: number;
  requestsPerSecond: number;
  totalRequests: number;
  errors: number;
  lastUpdated: string;
  centerLabel?: { x: number; y: number };
}

export interface RegionMetricPoint {
  timestamp: string;
  responseTimeMs: number;
  availability: number;
  requests: number;
  errors: number;
}

export interface RegionAlert {
  id: string;
  regionId: string;
  regionCode: string;
  regionName: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface RegionSummaryStats {
  totalRegions: number;
  healthyRegions: number;
  warningRegions: number;
  criticalRegions: number;
  offlineRegions: number;
  totalDnsServers: number;
  avgAvailability: number;
  avgResponseMs: number;
  totalRequests24h: number;
}
