import React, { useState } from "react";
import type { RegionMetricPoint } from "../../../../types/region";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

interface RegionMetricsChartProps {
  metrics: RegionMetricPoint[];
  regionName: string;
  selectedRange: "1h" | "6h" | "24h" | "7d" | "30d";
  onRangeChange: (range: "1h" | "6h" | "24h" | "7d" | "30d") => void;
  isLoading?: boolean;
}

export const RegionMetricsChart: React.FC<RegionMetricsChartProps> = ({
  metrics,
  regionName,
  selectedRange,
  onRangeChange,
  isLoading,
}) => {
  const [activeMetric, setActiveMetric] = useState<"latency" | "availability">("latency");

  const ranges: Array<{ value: "1h" | "6h" | "24h" | "7d" | "30d"; label: string }> = [
    { value: "1h", label: "1h" },
    { value: "6h", label: "6h" },
    { value: "24h", label: "24h" },
    { value: "7d", label: "7d" },
    { value: "30d", label: "30d" },
  ];

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono flex items-center gap-1.5">
            <span>{regionName}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500 dark:text-slate-400 font-normal">
              {activeMetric === "latency" ? "Response time (ms)" : "Availability (%)"}
            </span>
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 font-mono text-[10px]">
            <button
              onClick={() => setActiveMetric("latency")}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                activeMetric === "latency"
                  ? "bg-blue-500 text-white font-semibold shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Latency
            </button>
            <button
              onClick={() => setActiveMetric("availability")}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                activeMetric === "availability"
                  ? "bg-emerald-500 text-white font-semibold shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Uptime
            </button>
          </div>

          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 font-mono text-[10px]">
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => onRangeChange(r.value)}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  selectedRange === r.value
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-44 w-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400">
            Loading telemetry...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="metricColor" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={activeMetric === "latency" ? "#3b82f6" : "#10b981"}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={activeMetric === "latency" ? "#3b82f6" : "#10b981"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={activeMetric === "availability" ? [80, 100] : ["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey={activeMetric === "latency" ? "responseTimeMs" : "availability"}
                stroke={activeMetric === "latency" ? "#3b82f6" : "#10b981"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#metricColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
