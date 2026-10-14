import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Filter,
  RefreshCw,
  Clock,
  ChevronDown,
  Check,
  Calendar,
} from "lucide-react";
import { LOG_RANGES, type LogRangeValue } from "./LogTimeRangeBar";
import { DateRangePickerModal } from "../../../components/common/DateRangePickerModal";
import type { CustomRangeParams } from "../../../api/customRange";

export interface LogCustomRangeParams {
  startDate: string;
  endDate: string;
}

interface LogHeaderProps {
  title: string;
  isLive: boolean;
  hasActiveFilters: boolean;
  isFetching: boolean;
  onRefresh: () => void;
  // Time range controls
  currentRange: LogRangeValue;
  onRangeChange: (range: LogRangeValue) => void;
  customRangeParams?: LogCustomRangeParams | null;
  onCustomRangeApply?: (params: CustomRangeParams) => void;
}

export const LogHeader: React.FC<LogHeaderProps> = ({
  title,
  isLive,
  hasActiveFilters,
  isFetching,
  onRefresh,
  currentRange,
  onRangeChange,
  customRangeParams,
  onCustomRangeApply,
}) => {
  const { t } = useTranslation();
  const [isTimeRangeDropdownOpen, setIsTimeRangeDropdownOpen] = useState(false);
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false);
  const timeRangeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        timeRangeDropdownRef.current &&
        !timeRangeDropdownRef.current.contains(e.target as Node)
      ) {
        setIsTimeRangeDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsTimeRangeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const currentRangeLabel =
    currentRange === "custom"
      ? customRangeParams?.startDate
        ? `${new Date(customRangeParams.startDate).toLocaleDateString([], {
            month: "short",
            day: "numeric",
          })} - ${new Date(customRangeParams.endDate).toLocaleDateString([], {
            month: "short",
            day: "numeric",
          })}`
        : t("timeIntervals.custom")
      : t(`timeIntervals.${currentRange}`, { defaultValue: LOG_RANGES.find((opt) => opt.value === currentRange)?.label || "Live" });

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 relative z-20 transition-colors">
      {/* Glow accent contained in its own overflow-hidden layer */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="space-y-1 relative z-10">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-normal [word-spacing:0.18em]">
            {title}
          </h1>

          {hasActiveFilters && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono text-xs flex items-center gap-1">
              <Filter className="w-3 h-3" />
              {t("logs.filtered")}
            </span>
          )}
        </div>
      </div>

      {/* Right Controls matching Dashboard layout */}
      <div className="flex flex-wrap items-center gap-3 self-start xl:self-auto relative z-10 shrink-0">
        {/* Time Range Custom Select Dropdown (Dashboard dizayni) */}
        <div
          className="relative inline-flex items-center"
          ref={timeRangeDropdownRef}
        >
          <button
            type="button"
            id="time-range-select"
            onClick={() => setIsTimeRangeDropdownOpen((prev) => !prev)}
            className={`h-9 pl-3.5 pr-3 min-w-[190px] sm:min-w-[210px] inline-flex items-center justify-between gap-2.5 rounded-lg border text-xs font-mono font-medium transition-all shadow-xs cursor-pointer select-none ${
              isTimeRangeDropdownOpen || currentRange === "custom"
                ? "border-blue-500 bg-white dark:bg-slate-900 text-blue-600 dark:text-white ring-1 ring-blue-500/30"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
            }`}
            title={t("logs.selectTimeRange")}
          >
            <div className="flex items-center gap-2 whitespace-nowrap">
              {currentRange === "custom" ? (
                <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
              )}
              <span className="whitespace-nowrap">{currentRangeLabel}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                isTimeRangeDropdownOpen ? "rotate-180 text-blue-500" : ""
              }`}
            />
          </button>

          {/* Time Range Popover Menu — qat'iy 1 qator (whitespace-nowrap), filtrlardagi select font size (text-xs) */}
          {isTimeRangeDropdownOpen && (
            <div
              className="absolute top-full mt-1.5 right-0 min-w-[280px] sm:min-w-[300px] w-max max-w-[calc(100vw-2rem)] z-50 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xl p-1.5 space-y-0.5 font-mono text-xs animate-in fade-in zoom-in-95 duration-100"
              role="menu"
            >
              {LOG_RANGES.map((item) => {
                const isSelected = currentRange === item.value;
                const isCustom = item.value === "custom";
                return (
                  <React.Fragment key={item.value}>
                    {isCustom && (
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (isCustom) {
                          setIsTimeRangeDropdownOpen(false);
                          setIsDatePickerModalOpen(true);
                        } else {
                          onRangeChange(item.value);
                          setIsTimeRangeDropdownOpen(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer text-left select-none whitespace-nowrap ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 whitespace-nowrap">
                        {item.value === "live" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        )}
                        {isCustom && (
                          <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                        )}
                        <span className="whitespace-nowrap">
                          {t(`timeIntervals.${item.value}`, { defaultValue: item.label })}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-3" />
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* Refresh button — vaqt tanlash tugmasining yonida */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className="h-9 px-3.5 inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white text-xs font-mono font-medium transition-all shadow-xs cursor-pointer disabled:opacity-50"
          title={t("logs.refreshTitle")}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-blue-500 ${isFetching ? "animate-spin" : ""}`}
          />
          <span>{t("logs.refresh")}</span>
        </button>
      </div>

      {/* Date Range Picker Modal (Dashboarddagi komponent) */}
      <DateRangePickerModal
        isOpen={isDatePickerModalOpen}
        onClose={() => setIsDatePickerModalOpen(false)}
        onApply={(params: CustomRangeParams) => {
          onRangeChange("custom");
          if (onCustomRangeApply) {
            onCustomRangeApply(params);
          }
        }}
        initialStartDate={customRangeParams?.startDate}
        initialEndDate={customRangeParams?.endDate}
      />
    </div>
  );
};
