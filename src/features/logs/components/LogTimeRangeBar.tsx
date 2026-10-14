import React from "react";
import { useTranslation } from "react-i18next";

export const LOG_RANGES = [
  { value: "live", label: "Live" },
  { value: "5m", label: "Last 5 minutes" },
  { value: "10m", label: "Last 10 minutes" },
  { value: "1h", label: "Last 1 hour" },
  { value: "2h", label: "Last 2 hours" },
  { value: "4h", label: "Last 4 hours" },
  { value: "12h", label: "Last 12 hours" },
  { value: "24h", label: "Last 24 hours" },
  { value: "48h", label: "Last 48 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "custom", label: "Custom range" },
] as const;

export type LogRangeValue = (typeof LOG_RANGES)[number]["value"];

interface LogTimeRangeBarProps {
  currentRange: LogRangeValue;
  onRangeChange: (range: LogRangeValue) => void;
}

export const LogTimeRangeBar: React.FC<LogTimeRangeBarProps> = ({
  currentRange,
  onRangeChange,
}) => {
  const { t } = useTranslation();
  const isLive = currentRange === "live";

  return (
    <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/90 shadow-sm transition-colors overflow-x-auto">
      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold shrink-0">
        {t("dashboard.timeInterval")}:
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        {LOG_RANGES.map((r) => {
          const isActive = currentRange === r.value;
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => onRangeChange(r.value)}
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-mono font-medium transition-all shadow-xs cursor-pointer select-none ${
                isActive
                  ? "bg-blue-600 text-white font-semibold border border-blue-500 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80"
              }`}
            >
              <span>{t(`timeIntervals.${r.value}`, { defaultValue: r.label })}</span>
              {r.value === "live" && isLive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
