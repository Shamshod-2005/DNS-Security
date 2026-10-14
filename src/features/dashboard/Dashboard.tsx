import {
  fetchCustomRangeStats,
  type CustomRangeParams,
} from "../../api/customRange";
import React, { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { fetchRealtime, fetchSummary } from "../../api/stats";
import { fetchLogs } from "../../api/logs";
import { DashboardView } from "./components/DashboardView";
import type {
  DnsLogEntry,
  BlockedDomainItem,
  ClientDevice,
  TimeRange,
} from "../../types";
import { RequestDetailDrawer } from "./components/RequestDetailDrawer";
import { ROUTES } from "../../router/routes";
import { usePageVisibility } from "../../hooks/usePageVisibility";

const PALETTE = [
  "#3b82f6",
  "#ef4444",
  "#f59e0b",
  "#8b5cf6",
  "#10b981",
  "#06b6d4",
  "#ec4899",
  "#f97316",
];

// Helper to format timestamps to 24-hour HH:mm:ss without AM/PM
const formatTime24 = (timestampMs: number | Date) => {
  const d =
    typeof timestampMs === "number" ? new Date(timestampMs) : timestampMs;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

export default function Dashboard() {
  const navigate = useNavigate();

  // Time range & KPI filter state
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [selectedKpiFilter, setSelectedKpiFilter] = useState<
    "all" | "allowed" | "blocked" | "malicious"
  >("all");

  // Custom Date Range State (persisted for future backend custom range API)
  const [customRangeParams, setCustomRangeParams] = useState<CustomRangeParams>(
    {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
      resolution: "1h",
    },
  );

  // Inspector Drawer state
  const [inspectingLog, setInspectingLog] = useState<DnsLogEntry | null>(null);

  // Live streaming toggle
  const [liveStreaming] = useState(true);

  // Tab ko'rinishini kuzatish (boshqa tabga o'tganda fonda ortiqcha so'rov yubormaslik)
  const isTabVisible = usePageVisibility();
  const shouldPoll = liveStreaming && isTabVisible;

  // Card metric mode: PPS (packets/s) vs BPS (bits/s) - matching legacy #card-metric
  const [cardMetric, setCardMetric] = useState<"pps" | "bps">(() => {
    return (localStorage.getItem("mdns.cardmetric") as "pps" | "bps") || "pps";
  });

  const handleCardMetricChange = (mode: "pps" | "bps") => {
    setCardMetric(mode);
    localStorage.setItem("mdns.cardmetric", mode);
  };

  // 1. Fetch real-time telemetry stream from demo backend (1s polling)
  const { data: rt } = useQuery({
    queryKey: ["realtime"],
    queryFn: () => fetchRealtime(60),
    refetchInterval: shouldPoll ? 1000 : false,
    refetchIntervalInBackground: false,
  });

  // 2. Fetch aggregated summary from demo backend (15s polling)
  const { data: summary } = useQuery({
    queryKey: ["summary", cardMetric, timeRange],
    queryFn: () => fetchSummary(cardMetric, timeRange),
    refetchInterval: shouldPoll ? 15000 : false,
    refetchIntervalInBackground: false,
  });

  // 3. Fetch real live DNS request logs from demo backend (2s polling)
  const { data: liveLogsRes } = useQuery({
    queryKey: ["logs", "live", "dashboard"],
    queryFn: () =>
      fetchLogs({ malicious: 0, dot: 0, range: "live", page_size: 25 }),
    refetchInterval: shouldPoll ? 2000 : false,
    refetchIntervalInBackground: false,
  });

  // 4. Fetch real malicious / blocked logs from demo backend (3s polling)
  const { data: blockedLogsRes } = useQuery({
    queryKey: ["logs", "blocked", "dashboard"],
    queryFn: () => fetchLogs({ malicious: 1, range: "live", page_size: 10 }),
    refetchInterval: shouldPoll ? 3000 : false,
    refetchIntervalInBackground: false,
  });

  // ─── A. Real Backend KPI Stats (24h / Cumulative Today) ──────────────────
  const stats = useMemo(() => {
    const total = summary?.general?.queries ?? rt?.totals?.pkts ?? 0;
    const blocked = summary?.general?.blocked ?? rt?.totals?.bpkts ?? 0;
    const passed = summary?.general?.passed ?? Math.max(0, total - blocked);
    return {
      totalRequests: total,
      allowedRequests: passed,
      blockedRequests: blocked,
      maliciousRequests: blocked,
    };
  }, [summary, rt]);

  // ─── Dynamic Range KPI Stats (Based on selected timeRange) ───────────────
  const rangeStats = useMemo(() => {
    if (timeRange === "60s" && rt?.series && rt.series.length > 0) {
      const sumPkts = rt.series.reduce(
        (acc: number, pt: any) => acc + (pt.pkts || 0),
        0,
      );
      const sumBpkts = rt.series.reduce(
        (acc: number, pt: any) => acc + (pt.bpkts || 0),
        0,
      );
      const sumPassed = Math.max(0, sumPkts - sumBpkts);
      return {
        totalRequests: sumPkts,
        allowedRequests: sumPassed,
        blockedRequests: sumBpkts,
        maliciousRequests: sumBpkts,
      };
    }
    const total = summary?.general?.queries ?? rt?.totals?.pkts ?? 0;
    const blocked = summary?.general?.blocked ?? rt?.totals?.bpkts ?? 0;
    const passed = summary?.general?.passed ?? Math.max(0, total - blocked);
    return {
      totalRequests: total,
      allowedRequests: passed,
      blockedRequests: blocked,
      maliciousRequests: blocked,
    };
  }, [summary, rt, timeRange]);

  // ─── Cumulative Byte Stats for BPS Mode ──────────────────────────────────
  const byteStats = useMemo(() => {
    const totalBytes = summary?.general?.bytes ?? rt?.totals?.bytes ?? 0;
    const blockedBytes =
      summary?.general?.blocked_bytes ?? rt?.totals?.bbytes ?? 0;
    const passedBytes =
      summary?.general?.passed_bytes ?? Math.max(0, totalBytes - blockedBytes);
    return {
      total: totalBytes,
      allowed: passedBytes,
      blocked: blockedBytes,
      malicious: blockedBytes,
    };
  }, [summary, rt]);

  // ─── Dynamic Range Byte Stats for BPS Mode ──────────────────────────────
  const rangeByteStats = useMemo(() => {
    if (timeRange === "60s" && rt?.series && rt.series.length > 0) {
      const sumBytes = rt.series.reduce(
        (acc: number, pt: any) => acc + (pt.bytes || 0),
        0,
      );
      const sumBbytes = rt.series.reduce(
        (acc: number, pt: any) => acc + (pt.bbytes || 0),
        0,
      );
      const sumPassedBytes = Math.max(0, sumBytes - sumBbytes);
      return {
        total: sumBytes,
        allowed: sumPassedBytes,
        blocked: sumBbytes,
        malicious: sumBbytes,
      };
    }
    const totalBytes = summary?.general?.bytes ?? rt?.totals?.bytes ?? 0;
    const blockedBytes =
      summary?.general?.blocked_bytes ?? rt?.totals?.bbytes ?? 0;
    const passedBytes =
      summary?.general?.passed_bytes ?? Math.max(0, totalBytes - blockedBytes);
    return {
      total: totalBytes,
      allowed: passedBytes,
      blocked: blockedBytes,
      malicious: blockedBytes,
    };
  }, [summary, rt, timeRange]);

  // ─── Live Per-Second Rates (Realtime 1s Polling from DPDK) ───────────────
  const perSecondStats = useMemo(() => {
    const curTotal = rt?.current?.pkts ?? 0;
    const curBlocked = rt?.current?.bpkts ?? 0;
    const curPassed = Math.max(0, curTotal - curBlocked);
    return {
      total: curTotal,
      allowed: curPassed,
      blocked: curBlocked,
      malicious: curBlocked,
    };
  }, [rt]);

  // ─── Live Per-Second Byte Rates (DPDK 1s Polling) ────────────────────────
  const perSecondByteStats = useMemo(() => {
    const curTotalBytes = rt?.current?.bytes ?? 0;
    const curBlockedBytes = rt?.current?.bbytes ?? 0;
    const curPassedBytes = Math.max(0, curTotalBytes - curBlockedBytes);
    return {
      total: curTotalBytes,
      allowed: curPassedBytes,
      blocked: curBlockedBytes,
      malicious: curBlockedBytes,
    };
  }, [rt]);

  // ─── Live Sparklines (Last 10 Seconds from Real Series) ───────────────────
  const sparklines = useMemo(() => {
    const recent = (rt?.series ?? []).slice(-10);
    const pad = Math.max(0, 10 - recent.length);
    const empty = Array.from({ length: pad }, () => ({
      pkts: 0,
      bpkts: 0,
      bytes: 0,
      bbytes: 0,
    }));
    const full10 = [...empty, ...recent];

    const isBps = cardMetric === "bps";
    const totalVals = full10.map((p) => (isBps ? p.bytes : p.pkts));
    const allowedVals = full10.map((p) =>
      isBps ? Math.max(0, p.bytes - p.bbytes) : Math.max(0, p.pkts - p.bpkts),
    );
    const blockedVals = full10.map((p) => (isBps ? p.bbytes : p.bpkts));

    const scale = (vals: number[]) => {
      const max = Math.max(...vals, 1);
      return vals.map((v) => Math.max(15, Math.round((v / max) * 100)));
    };

    return {
      total: scale(totalVals),
      allowed: scale(allowedVals),
      blocked: scale(blockedVals),
      malicious: scale(blockedVals),
    };
  }, [rt, cardMetric]);

  // ─── B. Real Backend Area Chart Data (Exact 60-second rolling window) ───────
  const chartData = useMemo(() => {
    const series = rt?.series;
    if (!series || series.length === 0) {
      return [];
    }

    // Eski loyihadagi (app.js:633-649) kabi doimiy 60 soniyalik shkala:
    // Oxirgi vaqt server soatiga (yoki oxirgi nuqtaga) bog'lanadi.
    const N = 60;
    const endSec = (rt.now || Math.floor(Date.now() / 1000)) - 1;
    const map = new Map(series.map((s) => [s.t, s]));

    const result = [];
    for (let i = N - 1; i >= 0; i--) {
      const t = endSec - i;
      const p = map.get(t);
      const timeStr = formatTime24(t * 1000);

      const pkts = p ? (p.pkts || 0) : 0;
      const bpkts = p ? (p.bpkts || 0) : 0;
      const bytes = p ? (p.bytes || 0) : 0;
      const bbytes = p ? (p.bbytes || 0) : 0;

      const total = pkts;
      const blocked = bpkts;
      const passed = Math.max(0, pkts - bpkts);

      const totalBps = bytes * 8;
      const blockedBps = bbytes * 8;
      const passedBps = Math.max(0, (bytes - bbytes) * 8);

      result.push({
        time: timeStr,
        timestamp: t,
        total,
        blocked,
        passed,
        allowed: passed,
        malicious: blocked,
        totalBps,
        blockedBps,
        passedBps,
        allowedBps: passedBps,
        maliciousBps: blockedBps,
      });
    }

    return result;
  }, [rt]);

  // ─── C. Real Backend Blocked Categories Donut Data ───────────────────────
  const categoriesData = useMemo(() => {
    const topBlocked = summary?.top_blocked ?? [];
    if (topBlocked.length === 0) {
      return [
        { name: "Malware & Phishing", value: 0, color: PALETTE[0], percent: 0 },
      ];
    }

    // Top 4 + Others aggregation for clean donut distribution
    const sorted = [...topBlocked].sort(
      (a, b) => (b.count || 0) - (a.count || 0),
    );

    if (sorted.length <= 4) {
      return sorted.map((item, idx) => ({
        name: item.name,
        value: item.count,
        color: PALETTE[idx % PALETTE.length],
        percent: item.pct,
      }));
    }

    const top4 = sorted.slice(0, 4);
    const others = sorted.slice(4);

    const othersCount = others.reduce(
      (sum, item) => sum + (item.count || 0),
      0,
    );
    const top4PctSum = top4.reduce((sum, item) => sum + (item.pct || 0), 0);
    const othersPct = Number(Math.max(0, 100 - top4PctSum).toFixed(2));

    const result = top4.map((item, idx) => ({
      name: item.name,
      value: item.count,
      color: PALETTE[idx % PALETTE.length],
      percent: item.pct,
    }));

    if (othersCount > 0 && othersPct > 0) {
      result.push({
        name: "Others",
        value: othersCount,
        color: "#64748b", // slate-500 neutral color for grouped tail
        percent: othersPct,
      });
    }

    return result;
  }, [summary]);



  // ─── E. Real Backend Blocked Domains List ────────────────────────────────
  const blockedDomains = useMemo<BlockedDomainItem[]>(() => {
    const rows = blockedLogsRes?.rows ?? [];
    if (rows.length > 0) {
      return rows.map((r, idx) => ({
        id: `blk-${r.ts}-${idx}`,
        domain: r.domain || "(empty domain)",
        category: r.rule || "Threat Sinkhole",
        requests: 1,
        threatLevel: "Critical" as const,
        action: "BLOCK" as const,
        lastSeen: formatTime24(r.ts),
        riskScore: 96,
        firstSeen: new Date(r.ts).toISOString().substring(0, 10),
        blockReason: r.rule || "Blocked by malicious filter list",
      }));
    }

    // Fallback to top_blocked if live logs is empty
    return (summary?.top_blocked ?? []).map((b, idx) => ({
      id: `top-blk-${idx}`,
      domain: b.name,
      category: "Threat Domain",
      requests: b.count,
      threatLevel: "Critical" as const,
      action: "BLOCK" as const,
      lastSeen: "Just now",
      riskScore: 92,
      firstSeen: new Date().toISOString().substring(0, 10),
      blockReason: `Top malicious sinkhole (${b.pct}% share)`,
    }));
  }, [blockedLogsRes, summary]);

  // ─── F. Real Backend DNS Logs Table ──────────────────────────────────────
  const dnsLogs = useMemo<DnsLogEntry[]>(() => {
    const rows = liveLogsRes?.rows ?? [];
    return rows.map((r, idx) => {
      const isBlocked = r.blocked === 1;
      const qtype = (
        ["A", "AAAA", "CNAME", "TXT", "MX", "PTR", "SRV", "HTTPS"].includes(
          r.qtype_name,
        )
          ? r.qtype_name
          : "A"
      ) as DnsLogEntry["queryType"];
      const rcode = (
        r.rcode === 0 ? "NOERROR" : "REFUSED"
      ) as DnsLogEntry["responseCode"];

      return {
        id: `log-${r.ts}-${idx}`,
        timestamp: formatTime24(r.ts),
        fullTimestamp: `${new Date(r.ts).toISOString().replace("T", " ").substring(0, 19)} UTC`,
        clientIp: r.src_ip,
        device: r.src_ip,
        deviceType: "workstation" as const,
        domain: r.domain || "(empty)",
        queryType: qtype,
        category: r.rule || (isBlocked ? "Sinkhole Drop" : "Standard DNS"),
        action: isBlocked ? ("BLOCK" as const) : ("ALLOW" as const),
        response: isBlocked ? "0.0.0.0 (Sinkhole)" : `${r.dst_ip}`,
        threatLevel: isBlocked ? ("Critical" as const) : ("Safe" as const),
        dnsServer: `${r.dst_ip}:${r.dst_port}`,
        responseCode: rcode,
        responseTimeMs: 8,
        policyApplied: isBlocked
          ? r.rule || "Policy Drop"
          : "Standard Recursive Forwarder",
      };
    });
  }, [liveLogsRes]);

  // ─── G. Real Backend Top Clients List ────────────────────────────────────
  const clients = useMemo<ClientDevice[]>(() => {
    const topClients = summary?.top_clients ?? [];
    const logs = liveLogsRes?.rows ?? [];

    // Real dynamic calculation: count malicious/blocked queries per client IP from live logs
    const blockedCountByIp = new Map<string, number>();
    for (const log of logs) {
      const isBlocked = log.blocked === 1 || log.rcode === 3 || log.rcode === 5;
      if (isBlocked && log.src_ip) {
        blockedCountByIp.set(
          log.src_ip,
          (blockedCountByIp.get(log.src_ip) ?? 0) + 1,
        );
      }
    }

    return topClients.map((c, idx) => {
      const maliciousCount =
        (c as any).maliciousRequests ?? blockedCountByIp.get(c.name) ?? 0;
      const shareText =
        c.pct !== undefined
          ? `${c.pct}% traffic share`
          : `Endpoint #${idx + 1}`;

      return {
        id: `client-${idx}-${c.name}`,
        name: c.name,
        ip: c.name,
        mac: "-",
        deviceType: "workstation" as const,
        assignedPolicy: "-",
        department: shareText,
        status:
          maliciousCount > 0 ? ("quarantined" as const) : ("active" as const),
        totalRequests: c.count,
        blockedRequests: maliciousCount,
        maliciousRequests: maliciousCount,
        lastActivity: "Live Stream Active",
        trafficPct: c.pct,
        totalBytes: c.bytes,
      };
    });
  }, [summary, liveLogsRes]);

  const handleCustomRangeApply = useCallback(
    async (params: CustomRangeParams) => {
      setCustomRangeParams(params);
      setTimeRange("custom");
      // Send request to API (will be connected to real backend endpoint)
      await fetchCustomRangeStats(params);
    },
    [],
  );

  const handleNavigateTab = (tab: string) => {
    if (tab === "dns-requests" || tab === "dns-logs") {
      navigate(ROUTES.QUERY_LOG);
    } else if (tab === "blocked-domains" || tab === "malicious-requests") {
      navigate(ROUTES.BLOCKED);
    } else if (tab === "clients-devices") {
      navigate(ROUTES.QUERY_LOG);
    } else {
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <>
      <DashboardView
        stats={stats}
        rangeStats={rangeStats}
        rangeByteStats={rangeByteStats}
        perSecondStats={perSecondStats}
        byteStats={byteStats}
        perSecondByteStats={perSecondByteStats}
        cardMetric={cardMetric}
        onCardMetricChange={handleCardMetricChange}
        sparklines={sparklines}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        customRangeParams={customRangeParams}
        onCustomRangeApply={handleCustomRangeApply}
        chartData={chartData}
        categoriesData={categoriesData}
        blockedDomains={blockedDomains}
        dnsLogs={
          selectedKpiFilter === "allowed"
            ? dnsLogs.filter((l) => l.action === "ALLOW")
            : selectedKpiFilter === "blocked"
              ? dnsLogs.filter((l) => l.action === "BLOCK")
              : selectedKpiFilter === "malicious"
                ? dnsLogs.filter((l) => l.threatLevel === "Critical")
                : dnsLogs
        }
        clients={clients}
        selectedKpiFilter={selectedKpiFilter}
        onSelectKpiFilter={setSelectedKpiFilter}
        onInspectLog={(log) => setInspectingLog(log)}
        onInspectDomain={(domain) => {
          const match = dnsLogs.find((l) => l.domain === domain.domain);
          if (match) {
            setInspectingLog(match);
          } else {
            navigate(ROUTES.BLOCKED);
          }
        }}
        onSelectClient={() => navigate(ROUTES.QUERY_LOG)}
        onNavigateTab={handleNavigateTab}
        liveStreaming={liveStreaming}
      />

      <RequestDetailDrawer
        log={inspectingLog}
        onClose={() => setInspectingLog(null)}
      />
    </>
  );
}
