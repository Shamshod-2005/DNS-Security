import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Radio,
  ShieldAlert,
  ShieldBan,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { fmtBits, fmtBitsParts } from "../../../lib/format";
import type { TimeRange } from "../../../types";

export const RANGE_LABEL_MAP: Record<TimeRange, string> = {
  "60s": "60 seconds",
  "1h": "1 hour",
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
  custom: "Custom range",
};

interface KpiCardsProps {
  stats: {
    totalRequests: number;
    allowedRequests: number;
    blockedRequests: number;
    maliciousRequests: number;
  };
  perSecondStats?: {
    total: number;
    allowed: number;
    blocked: number;
    malicious: number;
  };
  byteStats?: {
    total: number;
    allowed: number;
    blocked: number;
    malicious: number;
  };
  perSecondByteStats?: {
    total: number;
    allowed: number;
    blocked: number;
    malicious: number;
  };
  cardMetric?: "pps" | "bps";
  sparklines?: {
    total: number[];
    allowed: number[];
    blocked: number[];
    malicious: number[];
  };
  rangeStats?: {
    totalRequests: number;
    allowedRequests: number;
    blockedRequests: number;
    maliciousRequests: number;
  };
  rangeByteStats?: {
    total: number;
    allowed: number;
    blocked: number;
    malicious: number;
  };
  timeRange: TimeRange;
  onCardClick: (
    filterType: "all" | "allowed" | "blocked" | "malicious",
  ) => void;
  selectedFilter: "all" | "allowed" | "blocked" | "malicious";
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  stats,

  rangeStats,
  rangeByteStats,
  perSecondStats,
  byteStats,
  perSecondByteStats,
  cardMetric = "pps",
  sparklines,
  timeRange = "24h",
  onCardClick,
  selectedFilter,
}) => {
  const isBps = cardMetric === "bps";

  // Compute live per-sec rate and unit
  const liveData = isBps
    ? {
        total: fmtBitsParts((perSecondByteStats?.total ?? 0) * 8, true),
        allowed: fmtBitsParts((perSecondByteStats?.allowed ?? 0) * 8, true),
        blocked: fmtBitsParts((perSecondByteStats?.blocked ?? 0) * 8, true),
        malicious: fmtBitsParts((perSecondByteStats?.malicious ?? 0) * 8, true),
      }
    : {
        total: {
          value: (perSecondStats?.total ?? 0).toLocaleString(),
          unit: "/sec",
        },
        allowed: {
          value: (perSecondStats?.allowed ?? 0).toLocaleString(),
          unit: "/sec",
        },
        blocked: {
          value: (perSecondStats?.blocked ?? 0).toLocaleString(),
          unit: "/sec",
        },
        malicious: {
          value: (perSecondStats?.malicious ?? 0).toLocaleString(),
          unit: "/sec",
        },
      };

  const currentRangeStats = rangeStats || stats;
  const currentRangeByteStats = rangeByteStats || byteStats;

  // Compute dynamic range total
  const totalsData = isBps
    ? {
        total: fmtBits((currentRangeByteStats?.total ?? 0) * 8, false),
        allowed: fmtBits((currentRangeByteStats?.allowed ?? 0) * 8, false),
        blocked: fmtBits((currentRangeByteStats?.blocked ?? 0) * 8, false),
        malicious: fmtBits((currentRangeByteStats?.malicious ?? 0) * 8, false),
      }
    : {
        total: currentRangeStats.totalRequests.toLocaleString(),
        allowed: currentRangeStats.allowedRequests.toLocaleString(),
        blocked: currentRangeStats.blockedRequests.toLocaleString(),
        malicious: currentRangeStats.maliciousRequests.toLocaleString(),
      };

  const passRate =
    stats.totalRequests > 0
      ? ((stats.allowedRequests / stats.totalRequests) * 100).toFixed(1)
      : "100.0";
  const dropRate =
    stats.totalRequests > 0
      ? ((stats.blockedRequests / stats.totalRequests) * 100).toFixed(1)
      : "0.0";
  const { t } = useTranslation();

  const cards = [
    {
      id: "all" as const,
      title: t("dashboard.kpi.totalRequests"),
      pageLabel: "Total requests",
      value: liveData.total.value,
      unit: liveData.total.unit,
      rangeTotal: totalsData.total,
      subtitle: "Live telemetry streaming",
      subtitleColor: "text-blue-600 dark:text-blue-400",
      statusIcon: (
        <Radio className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 animate-pulse shrink-0" />
      ),
      icon: Activity,
      colorTheme: "blue",
      glowClass:
        "hover:border-blue-400 dark:hover:border-blue-500/60 hover:shadow-md hover:bg-slate-50 dark:hover:bg-[#131d36]",
      activeClass:
        "border-blue-500 shadow-md bg-blue-50/50 dark:bg-blue-950/20",
      iconBg:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      sparkline: sparklines?.total ?? [40, 48, 52, 60, 58, 65, 78, 85, 92, 100],
    },
    {
      id: "allowed" as const,
      title: t("dashboard.kpi.allowedRequests"),
      pageLabel: "Allowed requests",
      value: liveData.allowed.value,
      unit: liveData.allowed.unit,
      rangeTotal: totalsData.allowed,
      subtitle: `${passRate}% pass rate`,
      subtitleColor: "text-blue-600 dark:text-blue-400",
      statusIcon: (
        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
      ),
      icon: CheckCircle2,
      colorTheme: "blue",
      glowClass:
        "hover:border-blue-400 dark:hover:border-blue-500/60 hover:shadow-md hover:bg-slate-50 dark:hover:bg-[#131d36]",
      activeClass:
        "border-blue-500 shadow-md bg-blue-50/50 dark:bg-blue-950/20",
      iconBg:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      sparkline: sparklines?.allowed ?? [
        45, 50, 54, 62, 60, 68, 80, 88, 90, 96,
      ],
    },
    {
      id: "blocked" as const,
      title: t("dashboard.kpi.blockedThreats"),
      pageLabel: "Blocked domains",
      value: liveData.blocked.value,
      unit: liveData.blocked.unit,
      rangeTotal: totalsData.blocked,
      subtitle: `${dropRate}% policy drops`,
      subtitleColor: "text-blue-600 dark:text-blue-400",
      statusIcon: (
        <ShieldBan className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
      ),
      icon: ShieldBan,
      colorTheme: "blue",
      glowClass:
        "hover:border-blue-400 dark:hover:border-blue-500/60 hover:shadow-md hover:bg-slate-50 dark:hover:bg-[#131d36]",
      activeClass:
        "border-blue-500 shadow-md bg-blue-50/50 dark:bg-blue-950/20",
      iconBg:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      sparkline: sparklines?.blocked ?? [
        60, 58, 55, 59, 52, 50, 48, 45, 42, 38,
      ],
    },
    {
      id: "malicious" as const,
      title: t("dashboard.kpi.maliciousRequests"),
      pageLabel: "Malicious requests",
      value: liveData.malicious.value,
      unit: liveData.malicious.unit,
      rangeTotal: totalsData.malicious,
      subtitle: "Sinkhole drops active",
      subtitleColor: "text-rose-600 dark:text-rose-400",
      statusIcon: (
        <ShieldAlert className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
      ),
      icon: ShieldAlert,
      colorTheme: "rose",
      glowClass:
        "hover:border-rose-400 dark:hover:border-rose-500/70 hover:shadow-md hover:bg-rose-50/40 dark:hover:bg-[#25131f]",
      activeClass:
        "border-rose-500 shadow-md bg-rose-50/50 dark:bg-rose-950/30",
      iconBg:
        "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 ring-1 ring-rose-500/30",
      sparkline: sparklines?.malicious ?? [
        20, 24, 28, 35, 30, 42, 58, 65, 80, 95,
      ],
    },
  ];

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
      id="kpi-cards-grid"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedFilter === card.id;
        const isMaliciousAlert =
          card.id === "malicious" &&
          (typeof card.value === "number"
            ? card.value > 0
            : parseInt(String(card.value).replace(/,/g, ""), 10) > 0);

        return (
          <div
            key={card.id}
            id={`kpi-card-${card.id}`}
            onClick={() => onCardClick(card.id)}
            title={`Click to open ${card.pageLabel} page`}
            className={`relative p-5 widescreen:p-6 rounded-2xl bg-white dark:bg-[#11192e] border transition-all duration-200 cursor-pointer group select-none shadow-sm hover:-translate-y-0.5 ${
              isMaliciousAlert
                ? "border-rose-500/80 shadow-rose-500/10 shadow-lg dark:bg-[#151226]"
                : ""
            } ${
              isSelected
                ? card.activeClass
                : "border-slate-200 dark:border-slate-800/90 " + card.glowClass
            }`}
          >
            {/* Subtle Drill-Down indicator */}
            <div className="absolute top-2.5 right-2.5">
              <div
                className="p-1 rounded-md bg-slate-100 dark:bg-slate-800/40 group-hover:bg-slate-200 dark:group-hover:bg-slate-700/60 border border-transparent group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-all"
                title={`Open ${card.pageLabel}`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>

            {/* Header row: Card Title & Icon */}
            <div className="flex items-center justify-between pr-7">
              <span className="text-xs widescreen:text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide font-mono">
                {card.title}
              </span>
              <div
                className={`relative p-2 widescreen:p-2.5 rounded-xl transition-transform group-hover:scale-110 ${card.iconBg}`}
              >
                <Icon className="w-4 h-4 widescreen:w-5 widescreen:h-5" />
                {isMaliciousAlert && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                )}
              </div>
            </div>

            {/* Value row: LIVE PER-SECOND (Left) + 24H TOTAL (Right) */}
            <div className="mt-3.5 widescreen:mt-4 flex items-baseline justify-between gap-3">
              <div>
                <div className="text-2xl lg:text-3xl widescreen:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white font-mono group-hover:text-blue-600 dark:group-hover:text-blue-100 transition-colors">
                  {card.value}
                  {card.unit && (
                    <span className="text-xs widescreen:text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">
                      {card.unit}
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Range Total on the Right */}
              <div className="flex flex-col items-end shrink-0 text-right">
                <span className="text-[10px] widescreen:text-xs font-mono tracking-wider text-slate-400 dark:text-slate-500 leading-none mb-1">
                  {RANGE_LABEL_MAP[timeRange] || "24 hours"}
                </span>
                <span className="text-sm widescreen:text-base font-semibold font-mono text-slate-700 dark:text-slate-200 leading-tight">
                  {card.rangeTotal}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
