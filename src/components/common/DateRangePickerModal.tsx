import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CustomRangeParams } from "../../api/customRange";

export interface DateRangePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (params: CustomRangeParams) => void;
  initialStartDate?: string;
  initialEndDate?: string;
  initialResolution?: "1h" | "1d" | "1w";
}

export const DateRangePickerModal: React.FC<DateRangePickerModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialStartDate,
  initialEndDate,
  initialResolution = "1h",
}) => {
  const { t } = useTranslation();
  const toDateInputString = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const [startDateStr, setStartDateStr] = useState<string>(() => {
    if (initialStartDate) return toDateInputString(new Date(initialStartDate));
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return toDateInputString(d);
  });

  const [endDateStr, setEndDateStr] = useState<string>(() => {
    if (initialEndDate) return toDateInputString(new Date(initialEndDate));
    return toDateInputString(new Date());
  });

  const [resolution, setResolution] = useState<"1h" | "1d" | "1w">(
    initialResolution,
  );

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    return initialStartDate ? new Date(initialStartDate) : new Date();
  });

  useEffect(() => {
    if (isOpen) {
      if (initialStartDate) {
        setStartDateStr(toDateInputString(new Date(initialStartDate)));
        setCurrentMonth(new Date(initialStartDate));
      }
      if (initialEndDate) {
        setEndDateStr(toDateInputString(new Date(initialEndDate)));
      }
      if (initialResolution) {
        setResolution(initialResolution);
      }
    }
  }, [isOpen, initialStartDate, initialEndDate, initialResolution]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDayClick = (dayNumber: number) => {
    const selectedDate = new Date(year, month, dayNumber);
    const selectedStr = toDateInputString(selectedDate);

    const start = new Date(startDateStr);

    if (!startDateStr || (startDateStr && endDateStr)) {
      setStartDateStr(selectedStr);
      setEndDateStr("");
    } else if (startDateStr && !endDateStr) {
      if (selectedDate < start) {
        setStartDateStr(selectedStr);
        setEndDateStr(startDateStr);
      } else {
        setEndDateStr(selectedStr);
      }
    }
  };

  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    setStartDateStr(toDateInputString(start));
    setEndDateStr(toDateInputString(end));
    setCurrentMonth(start);
  };

  const applyThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setStartDateStr(toDateInputString(start));
    setEndDateStr(toDateInputString(now));
    setCurrentMonth(start);
  };

  const handleApply = () => {
    const start = startDateStr
      ? new Date(`${startDateStr}T00:00:00.000Z`)
      : new Date();
    const end = endDateStr
      ? new Date(`${endDateStr}T23:59:59.999Z`)
      : new Date();

    const finalStart = start < end ? start : end;
    const finalEnd = start < end ? end : start;

    onApply({
      startDate: finalStart.toISOString(),
      endDate: finalEnd.toISOString(),
      resolution,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {t("datePicker.title")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select custom start and end dates for analytics telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 flex flex-col justify-between space-y-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-4 md:pb-0 md:pr-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 font-mono">
                Quick presets
              </span>
              <div className="space-y-1.5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => applyPreset(1)}
                  className="w-full text-left px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Last 24 hours
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(7)}
                  className="w-full text-left px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Last 7 days
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(14)}
                  className="w-full text-left px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Last 14 days
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(30)}
                  className="w-full text-left px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Last 30 days
                </button>
                <button
                  type="button"
                  onClick={applyThisMonth}
                  className="w-full text-left px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  This month
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Resolution
              </span>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setResolution("1h")}
                  className={`py-1.5 px-2 rounded-lg text-center font-medium transition-all ${
                    resolution === "1h"
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/60 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  1h (Hourly)
                </button>
                <button
                  type="button"
                  onClick={() => setResolution("1d")}
                  className={`py-1.5 px-2 rounded-lg text-center font-medium transition-all ${
                    resolution === "1d"
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/60 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  1d (Daily)
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1 font-medium">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1 font-medium">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {monthNames[month]} {year}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-xs font-mono">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-7" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = toDateInputString(
                    new Date(year, month, dayNum),
                  );
                  const isStart = dateStr === startDateStr;
                  const isEnd = dateStr === endDateStr;
                  const inRange =
                    startDateStr &&
                    endDateStr &&
                    dateStr > startDateStr &&
                    dateStr < endDateStr;

                  let cellClass =
                    "h-7 flex items-center justify-center rounded-lg cursor-pointer transition-all text-slate-700 dark:text-slate-300 hover:bg-blue-500/20";

                  if (isStart || isEnd) {
                    cellClass =
                      "h-7 flex items-center justify-center rounded-lg cursor-pointer bg-blue-600 text-white font-bold shadow-xs";
                  } else if (inRange) {
                    cellClass =
                      "h-7 flex items-center justify-center rounded-md bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium";
                  }

                  return (
                    <div
                      key={dayNum}
                      onClick={() => handleDayClick(dayNum)}
                      className={cellClass}
                    >
                      {dayNum}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Range:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {startDateStr || "Select start"} → {endDateStr || "Select end"}{" "}
                ({resolution})
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-[#0c1222]/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!startDateStr}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Range</span>
          </button>
        </div>
      </div>
    </div>
  );
};
