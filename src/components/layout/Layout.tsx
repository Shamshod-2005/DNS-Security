import { useState, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Sidebar, type NavTab } from "./Sidebar";
import { Header } from "./Header";
import { ROUTES } from "../../router/routes";
import { fetchLogs } from "../../api/logs";
import { fetchSummary } from "../../api/stats";
import { BlockDomainModal } from "../common/QuickActionModals";
import type {
  NotificationItem,
  DnsLogEntry,
  BlockedDomainItem,
  ClientDevice,
} from "../../types";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [liveStreaming, setLiveStreaming] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  // Map route to the exact 7 pages
  const path = location.pathname;
  let activeTab: NavTab = "dashboard";
  if (path.includes("querylog")) activeTab = "querylog";
  else if (path.includes("dot")) activeTab = "dot";
  else if (path.includes("blocked")) activeTab = "blocked";
  else if (path.includes("filter")) activeTab = "filter";
  else if (path.includes("pcap")) activeTab = "pcap";
  else if (path.includes("account")) activeTab = "account";

  // Real backend queries for global header search
  const { data: liveLogsRes } = useQuery({
    queryKey: ["logs", "live", "header"],
    queryFn: () =>
      fetchLogs({ malicious: 0, dot: 0, range: "live", page_size: 20 }),
    refetchInterval: liveStreaming ? 3000 : false,
    refetchIntervalInBackground: false,
  });

  const { data: summaryRes } = useQuery({
    queryKey: ["summary", "header"],
    queryFn: () => fetchSummary("pps"),
    refetchInterval: liveStreaming ? 15000 : false,
    refetchIntervalInBackground: false,
  });

  const headerDnsLogs = useMemo<DnsLogEntry[]>(() => {
    return (liveLogsRes?.rows ?? []).map((r, idx) => ({
      id: `hdr-log-${r.ts}-${idx}`,
      timestamp: new Date(r.ts).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      fullTimestamp: new Date(r.ts).toISOString(),
      clientIp: r.src_ip,
      device: r.src_ip,
      deviceType: "workstation" as const,
      domain: r.domain || "",
      queryType: "A" as const,
      category: r.rule || (r.blocked ? "Threat Drop" : "Standard DNS"),
      action: r.blocked ? ("BLOCK" as const) : ("ALLOW" as const),
      response: r.blocked ? "0.0.0.0" : `${r.dst_ip}`,
      threatLevel: r.blocked ? ("Critical" as const) : ("Safe" as const),
      dnsServer: `${r.dst_ip}`,
      responseCode: "NOERROR" as const,
      responseTimeMs: 8,
      policyApplied: "Default Resolver",
    }));
  }, [liveLogsRes]);

  const headerBlockedDomains = useMemo<BlockedDomainItem[]>(() => {
    return (summaryRes?.top_blocked ?? []).map((b, idx) => ({
      id: `hdr-blk-${idx}`,
      domain: b.name,
      category: "Security Threat",
      requests: b.count,
      threatLevel: "Critical" as const,
      action: "BLOCK" as const,
      lastSeen: "Live Stream",
      riskScore: 92,
      firstSeen: new Date().toISOString().substring(0, 10),
      blockReason: `Top malicious sinkhole (${b.pct}% share)`,
    }));
  }, [summaryRes]);

  const headerClients = useMemo<ClientDevice[]>(() => {
    return (summaryRes?.top_clients ?? []).map((c, idx) => ({
      id: `hdr-cli-${idx}`,
      name: c.name,
      ip: c.name,
      mac: "—",
      deviceType: "workstation" as const,
      assignedPolicy: "Standard Policy",
      department: `Host #${idx + 1}`,
      status: "active" as const,
      totalRequests: c.count,
      blockedRequests: 0,
      maliciousRequests: 0,
      lastActivity: "Live",
    }));
  }, [summaryRes]);

  const handleSelectTab = (tab: NavTab) => {
    switch (tab) {
      case "dashboard":
        navigate(ROUTES.DASHBOARD);
        break;
      case "querylog":
        navigate(ROUTES.QUERY_LOG);
        break;
      case "dot":
        navigate(ROUTES.DOT);
        break;
      case "blocked":
        navigate(ROUTES.BLOCKED);
        break;
      case "filter":
        navigate(ROUTES.FILTER);
        break;
      case "pcap":
        navigate(ROUTES.PCAP);
        break;
      case "account":
        navigate(ROUTES.ACCOUNT);
        break;
      default:
        navigate(ROUTES.DASHBOARD);
    }
  };

  const handleSearchSelect = (
    type: "domain" | "ip" | "client",
    value: string,
  ) => {
    navigate(`${ROUTES.QUERY_LOG}?search=${encodeURIComponent(value)}`);
  };

  return (
    <div className="flex h-screen w-screen max-w-full bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-200 overflow-hidden font-sans transition-colors duration-150">
      {/* 1. Left Cyber Sidebar Navigation (Exact 7 pages) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        collapsed={collapsedSidebar}
        onToggleCollapse={() => setCollapsedSidebar(!collapsedSidebar)}
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 max-w-full">
        {/* Top Header */}
        <Header
          onSearchSelect={handleSearchSelect}
          notifications={notifications}
          onMarkNotificationRead={(id) =>
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
            )
          }
          onClearNotifications={() => setNotifications([])}
          liveStreaming={liveStreaming}
          onToggleLiveStream={() => setLiveStreaming(!liveStreaming)}
          onOpenBlockModal={() => setIsBlockModalOpen(true)}
          dnsLogs={headerDnsLogs}
          blockedDomains={headerBlockedDomains}
          clients={headerClients}
        />

        {/* Dynamic View Scroll Area */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden px-6 widescreen:px-10 pt-4 widescreen:pt-6 pb-6 widescreen:pb-10 bg-[#f8fafc] dark:bg-[#0b0f19] transition-colors duration-150 min-w-0 max-w-full flex flex-col"
          id="dashboard-viewport"
        >
          <div className="w-full min-w-0 max-w-full flex-1 flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>

      <BlockDomainModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        initialDomain=""
        initialCategory="Malware"
        onBlock={() => setIsBlockModalOpen(false)}
      />
    </div>
  );
}
