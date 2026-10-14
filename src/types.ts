export type ThreatLevel = "Safe" | "Low" | "Medium" | "High" | "Critical";
export type DnsAction = "ALLOW" | "BLOCK" | "SINKHOLE" | "QUARANTINE";
export type TimeRange = "60s" | "1h" | "24h" | "7d" | "30d" | "custom";
export type QueryType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "TXT"
  | "MX"
  | "PTR"
  | "SRV"
  | "HTTPS";

export interface DnsLogEntry {
  id: string;
  timestamp: string; // e.g. "10:24:12"
  fullTimestamp: string;
  clientIp: string;
  device: string;
  deviceType: "workstation" | "laptop" | "server" | "mobile" | "iot";
  domain: string;
  queryType: QueryType;
  category: string;
  action: DnsAction;
  response: string; // resolved IP or "—" or "NXDOMAIN"
  threatLevel: ThreatLevel;
  dnsServer: string;
  responseCode: "NOERROR" | "NXDOMAIN" | "SERVFAIL" | "REFUSED";
  responseTimeMs: number;
  threatIntel?: {
    threatType?:
      | "Malware"
      | "Phishing"
      | "Command & Control"
      | "Suspicious Domain"
      | "Cryptominer"
      | "DGA";
    confidence: number;
    feedSource: string;
    details: string;
  };
  policyApplied: string;
  countryCode?: string;
}

export interface BlockedDomainItem {
  id: string;
  domain: string;
  category: string;
  requests: number;
  threatLevel: ThreatLevel;
  action: DnsAction;
  lastSeen: string;
  riskScore: number;
  firstSeen: string;
  blockReason: string;
}

export interface ClientDevice {
  id: string;
  name: string;
  ip: string;
  mac: string;
  deviceType: "workstation" | "laptop" | "server" | "mobile" | "iot";
  totalRequests: number;
  blockedRequests: number;
  maliciousRequests: number;
  lastActivity: string;
  status: "active" | "quarantined" | "idle";
  department: string;
  assignedPolicy: string;
  trafficPct?: number;
  totalBytes?: number;
}

export interface ThreatSummary {
  threatCount: number;
  malwareRequests: number;
  phishingRequests: number;
  c2Requests: number;
  suspiciousDomains: number;
}

export interface DnsPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  targetClients: string;
  blockedCategories: string[];
  action: DnsAction;
  lastModified: string;
  enforcementCount: number;
}

export interface CategoryRule {
  id: string;
  name: string;
  type: "Security" | "Content" | "Productivity";
  blocked: boolean;
  count: number;
  description: string;
  icon: string;
}

export interface ToastMessage {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "critical" | "warning" | "info" | "success";
  read: boolean;
  threatLevel?: ThreatLevel;
}

export type CorrelationStatus =
  | "Open"
  | "Investigating"
  | "Review"
  | "Resolved"
  | "Ignored";

export type CorrelationPatternType =
  | "Malware Burst"
  | "Phishing Pattern"
  | "High Frequency"
  | "DNS Tunneling"
  | "C2 Beaconing"
  | "DGA Generation"
  | "Multi-Threat Entity";

export interface CorrelationTimelineItem {
  id: string;
  timestamp: string;
  client: string;
  domain: string;
  queryType?: QueryType;
  action: DnsAction;
  threatLevel: ThreatLevel;
  category: string;
  note?: string;
  isTrigger?: boolean;
}

export interface CorrelationDetectionRule {
  name: string;
  conditions: string[];
  window: string;
  threshold: string;
  resultAction: string;
  description: string;
}

export interface CorrelationEvent {
  id: string;
  name: string;
  severity: ThreatLevel;
  client: string;
  clientIp: string;
  department: string;
  pattern: CorrelationPatternType;
  relatedEventsCount: number;
  firstSeen: string;
  lastSeen: string;
  status: CorrelationStatus;
  description: string;
  detectionRule: CorrelationDetectionRule;
  relatedDomains: {
    domain: string;
    category: string;
    threatLevel: ThreatLevel;
    blocked: boolean;
    requestCount: number;
  }[];
  timeline: CorrelationTimelineItem[];
}

export interface TopCorrelatedClient {
  id: string;
  device: string;
  ip: string;
  correlatedEvents: number;
  maliciousRequests: number;
  blockedRequests: number;
  riskLevel: ThreatLevel;
  department: string;
}

export interface TopCorrelatedDomain {
  domain: string;
  category: string;
  requests: number;
  blocked: number;
  clientsCount: number;
  severity: ThreatLevel;
}

// Runtime fallbacks for ESM dev mode
export const DnsLogEntry = {};
export const BlockedDomainItem = {};
export const ClientDevice = {};
export const ThreatSummary = {};
export const DnsPolicy = {};
export const CategoryRule = {};
export const ToastMessage = {};
export const NotificationItem = {};
export const CorrelationEvent = {};
export const TopCorrelatedClient = {};
export const TopCorrelatedDomain = {};
export const CorrelationDetectionRule = {};
