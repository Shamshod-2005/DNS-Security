import { Activity, Zap } from "lucide-react";
import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimeRange } from "../../../types";

interface AnalyticsChartsProps {
  timeRange: TimeRange;
  chartData: Array<{
    time: string;
    timestamp?: number;
    total?: number;
    blocked: number;
    passed?: number;
    allowed?: number;
    malicious?: number;
    totalBps?: number;
    blockedBps?: number;
    passedBps?: number;
    allowedBps?: number;
    maliciousBps?: number;
  }>;
  categoriesData: Array<{
    name: string;
    value: number;
    color: string;
    percent: number;
  }>;
  onSelectCategory?: (categoryName: string) => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  chartData,
  categoriesData,
  onSelectCategory,
}) => {
  const [chartMetric, setChartMetric] = useState<"pps" | "bps">("pps");
  const [activeSeries, setActiveSeries] = useState<{
    total: boolean;
    blocked: boolean;
    passed: boolean;
  }>({
    total: true,
    blocked: true,
    passed: true,
  });

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { t } = useTranslation();

  const toggleSeries = (series: "total" | "blocked" | "passed") => {
    setActiveSeries((prev) => ({
      ...prev,
      [series]: !prev[series],
    }));
  };

  const isBps = chartMetric === "bps";

  // Data mapped for PPS vs BPS
  const displayData = chartData.map((d) => ({
    time: d.time,
    timestamp: d.timestamp,
    total: isBps ? (d.totalBps ?? 0) : (d.total ?? 0),
    blocked: isBps ? (d.blockedBps ?? 0) : (d.blocked ?? 0),
    passed: isBps
      ? (d.passedBps ?? d.allowedBps ?? 0)
      : (d.passed ?? d.allowed ?? 0),
  }));

  // Eski loyihadagi (app.js:698-709) kabi qat'iy 5 soniyaga karrali (00, 05, 10, 15, 20...) vaqt belgilari
  const ticks = useMemo(() => {
    if (!displayData || displayData.length === 0) return undefined;
    return displayData
      .filter((d) => {
        if (d.timestamp !== undefined) {
          return d.timestamp % 5 === 0;
        }
        // Fallback: agar timestamp bo'lmasa, time string'ning oxirgi soniyasini tekshiramiz
        const sec = parseInt(d.time.slice(-2), 10);
        return !isNaN(sec) && sec % 5 === 0;
      })
      .map((d) => d.time);
  }, [displayData]);

  // Eski loyihadagi (app.js:625-630) niceMax algoritmi:
  // Shkala har soniyada kichrayib-kattarib sakramaydi, 4 ta tekis oraliqda sobit turadi.
  const niceMax = (v: number) => {
    const raw = Math.max(v, 1) / 4;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    for (const m of [1, 2, 5, 10]) {
      if (m * mag >= raw) return 4 * m * mag;
    }
    return 40 * mag;
  };

  const rawMax = Math.max(
    isBps ? 8 : 5,
    ...displayData.map((d) => d.total || 0),
  );
  const yDomainMax = niceMax(rawMax);

  // Format axis tick
  const formatYAxis = (val: number) => {
    if (isBps) {
      if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}Gb`;
      if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}Mb`;
      if (val >= 1_000) return `${(val / 1_000).toFixed(0)}Kb`;
      return `${val}b`;
    }
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
    return val.toString();
  };

  const formatValue = (val: number) => {
    if (isBps) {
      if (val >= 1_000_000_000)
        return `${(val / 1_000_000_000).toFixed(2)} Gbps`;
      if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} Mbps`;
      if (val >= 1_000) return `${(val / 1_000).toFixed(1)} Kbps`;
      return `${val.toFixed(0)} bps`;
    }
    return `${val.toLocaleString()} reqs/s`;
  };

  // Clean 24-hour time formatter for X-Axis tick (strips any AM/PM)
  const formatTimeTick = (timeStr: string) => {
    if (!timeStr) return "";
    return timeStr.replace(/\s*(AM|PM|am|pm)/gi, "").trim();
  };

  // Custom Area Chart Tooltip
  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/98 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md font-mono text-xs z-50">
          <div className="text-slate-500 dark:text-slate-400 text-[11px] mb-2 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <span className="text-slate-400 dark:text-slate-500 font-normal">
                Time:
              </span>
              <span className="font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/60 dark:border-blue-800/60 font-semibold tracking-wider">
                {typeof label === "string" ? formatTimeTick(label) : label}
              </span>
            </div>
            <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {chartMetric.toUpperCase()}
            </span>
          </div>
          <div className="space-y-1.5">
            {payload.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {item.name}
                  </span>
                </div>
                <div className="font-semibold text-slate-900 dark:text-white font-mono">
                  {formatValue(item.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      id="analytics-section"
    >
      {/* 1. DNS Requests Overview Area Chart (8 cols) */}
      <div className="lg:col-span-8 p-5 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors">
        {/* Top Header Row: Title & Pulse on Left, PPS/BPS Switcher on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-normal [word-spacing:0.18em]">
                {t("dashboard.charts.dnsOverview")}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* PPS / BPS Mode Toggle */}

            <div className="inline-flex  rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-[3px] font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setChartMetric("pps")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  chartMetric === "pps"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>PPS</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMetric("bps")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  chartMetric === "bps"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>BPS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Series Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-3 pb-2 text-xs font-mono">
          <button
            onClick={() => toggleSeries("total")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              activeSeries.total
                ? "bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 text-blue-600 dark:text-blue-400"
                : "bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 line-through opacity-50"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Total queries</span>
          </button>

          <button
            onClick={() => toggleSeries("passed")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              activeSeries.passed
                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 line-through opacity-50"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Passed (clean)</span>
          </button>

          <button
            onClick={() => toggleSeries("blocked")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              activeSeries.blocked
                ? "bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-600 dark:text-rose-400"
                : "bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 line-through opacity-50"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Blocked (threats)</span>
          </button>
        </div>

        {/* Area Chart Container */}
        <div className="h-64 sm:h-72 widescreen:h-96 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={displayData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="time"
                ticks={ticks}
                interval={0}
                stroke="#64748b"
                tickFormatter={formatTimeTick}
                tickLine={false}
                axisLine={{ stroke: "#94a3b833" }}
                dy={6}
                tick={{
                  fill: "#64748b",
                  fontSize: 10,
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#94a3b833" }}
                tickFormatter={formatYAxis}
                fontFamily="monospace"
                domain={[0, yDomainMax]}
                allowDataOverflow={false}
              />
              <Tooltip content={<CustomAreaTooltip />} />
              {activeSeries.total && (
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="none"
                  fillOpacity={0}
                  isAnimationActive={false}
                />
              )}
              {activeSeries.passed && (
                <Area
                  type="monotone"
                  dataKey="passed"
                  name="Passed"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="none"
                  fillOpacity={0}
                  isAnimationActive={false}
                />
              )}
              {activeSeries.blocked && (
                <Area
                  type="monotone"
                  dataKey="blocked"
                  name="Blocked"
                  stroke="#F43F5E"
                  strokeWidth={2}
                  fill="none"
                  fillOpacity={0}
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Requests by Category Donut Chart (4 cols) */}
      <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-normal [word-spacing:0.18em]">
              {t("dashboard.charts.requestsByCategory")}
            </h3>
          </div>
        </div>

        {/* Donut Container */}
        <div className="relative h-56 sm:h-60 widescreen:h-80 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* No floating tooltip covering the donut center - Solution 1 */}
              <Pie
                data={categoriesData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, index) => {
                  if (categoriesData[index]) {
                    setHoveredCategory(categoriesData[index].name);
                  }
                }}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={(entry) =>
                  onSelectCategory &&
                  entry?.name &&
                  onSelectCategory(entry.name)
                }
                cursor="pointer"
              >
                {categoriesData.map((entry) => {
                  const isHovered = hoveredCategory === entry.name;
                  const isOtherHovered = hoveredCategory !== null && !isHovered;
                  return (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={entry.color}
                      stroke={isHovered ? entry.color : "transparent"}
                      strokeWidth={isHovered ? 3 : 1}
                      opacity={isOtherHovered ? 0.4 : 1}
                      className="transition-all duration-200"
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Interactive Center Content - Changes dynamically on hover */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2 select-none animate-in fade-in duration-150">
            {hoveredCategory ? (
              (() => {
                const active = categoriesData.find(
                  (c) => c.name === hoveredCategory,
                );
                if (!active) return null;
                return (
                  <div className="flex flex-col items-center justify-center max-w-[126px]">
                    <div className="flex items-center gap-1.5 max-w-[120px] px-1 truncate mb-0.5">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: active.color }}
                      />
                      <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate font-mono">
                        {active.name}
                      </span>
                    </div>
                    <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono tracking-tight leading-none my-1">
                      {active.percent}%
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {active.value.toLocaleString()} reqs
                    </span>
                  </div>
                );
              })()
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-wider font-semibold">
                  {t("dashboard.charts.category")}
                </span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight leading-none my-1">
                  100%
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {t("dashboard.charts.distribution")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Category Legend list (Top 4 + Others) */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/80 font-mono text-xs">
          {categoriesData.map((cat, idx) => {
            const isLastOdd =
              categoriesData.length % 2 !== 0 &&
              idx === categoriesData.length - 1;
            return (
              <div
                key={cat.name}
                onMouseEnter={() => setHoveredCategory(cat.name)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() =>
                  onSelectCategory &&
                  cat.name !== "Others" &&
                  onSelectCategory(cat.name)
                }
                className={`flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${
                  isLastOdd
                    ? "col-span-2 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/50"
                    : "col-span-1"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <div
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate text-slate-700 dark:text-slate-300 text-[11px]">
                    {cat.name}
                  </span>
                </div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] shrink-0 ml-1">
                  {cat.percent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
