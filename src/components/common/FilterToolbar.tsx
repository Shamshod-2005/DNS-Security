import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";

export interface ActiveFilterBadge {
  id: string;
  label: string;
  color?: "blue" | "indigo" | "amber" | "emerald" | "rose" | "purple";
  onRemove: () => void;
}

export interface FilterToolbarProps {
  // Search bar props
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  onClearSearch?: () => void;

  // Popover filter props
  filterPopoverTitle?: string;
  filterPopoverContent?: React.ReactNode;
  activeFilterCount?: number;
  onClearFilters?: () => void;

  // Popover state (optional controlled)
  isPopoverOpen?: boolean;
  onPopoverOpenChange?: (open: boolean) => void;

  // Global reset
  hasAnyFilter?: boolean;
  onClearAll?: () => void;

  // Badges
  badges?: ActiveFilterBadge[];

  // Additional right actions
  actions?: React.ReactNode;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Tezkor qidirish...",
  onClearSearch,
  filterPopoverTitle = "Filtrlash parametrlari",
  filterPopoverContent,
  activeFilterCount = 0,
  onClearFilters,
  isPopoverOpen: controlledPopoverOpen,
  onPopoverOpenChange,
  hasAnyFilter,
  onClearAll,
  badges,
  actions,
}) => {
  const { t } = useTranslation();
  // Internal state if uncontrolled
  const [internalPopoverOpen, setInternalPopoverOpen] = useState(false);
  const isPopoverOpen =
    controlledPopoverOpen !== undefined
      ? controlledPopoverOpen
      : internalPopoverOpen;

  const setPopoverOpen = (open: boolean) => {
    if (onPopoverOpenChange) {
      onPopoverOpenChange(open);
    } else {
      setInternalPopoverOpen(open);
    }
  };

  const popoverRef = useRef<HTMLDivElement>(null);
  const filterBtnRef = useRef<HTMLButtonElement>(null);

  // Click outside & Escape listener
  useEffect(() => {
    if (!isPopoverOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        filterBtnRef.current &&
        !filterBtnRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPopoverOpen]);

  const hasAnyActive =
    hasAnyFilter !== undefined
      ? hasAnyFilter
      : Boolean(searchValue) || activeFilterCount > 0;

  const getBadgeColorClasses = (
    color?: ActiveFilterBadge["color"],
  ): string => {
    switch (color) {
      case "indigo":
        return "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400";
      case "amber":
        return "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400";
      case "emerald":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
      case "rose":
        return "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400";
      case "purple":
        return "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400";
      case "blue":
      default:
        return "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/90 shadow-sm transition-colors space-y-3">
      {/* ─── 1. Main Search & Filter Toolbar ──────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Universal Search Bar */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            className="w-full h-9 pl-10 pr-9 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs transition-colors shadow-xs"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                if (onClearSearch) onClearSearch();
                else onSearchChange("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 rounded transition-colors cursor-pointer"
              title={t("logs.clearSearch")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Optional Filter Popover Button */}
        {filterPopoverContent && (
          <div className="relative shrink-0">
            <button
              ref={filterBtnRef}
              type="button"
              onClick={() => setPopoverOpen(!isPopoverOpen)}
              className={`h-9 px-3.5 rounded-lg border text-xs font-mono font-medium inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer select-none ${
                isPopoverOpen || activeFilterCount > 0
                  ? "border-blue-500 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span>{t("logs.filters")}</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isPopoverOpen ? "rotate-180 text-blue-500 dark:text-blue-400" : ""
                }`}
              />
            </button>

            {/* ─── 2. Popover Content ────────────────────────────────────── */}
            {isPopoverOpen && (
              <div
                ref={popoverRef}
                className="absolute right-0 top-full mt-2 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] overflow-y-auto z-50 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl p-5 space-y-4 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 font-mono text-xs"
              >
                {/* Popover Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                      <Filter className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        {filterPopoverTitle}
                      </h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPopoverOpen(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title={t("logs.close")}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Popover Body */}
                <div className="space-y-3.5">{filterPopoverContent}</div>

                {/* Popover Footer — Tozalash buttoni markazda */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={onClearFilters}
                    disabled={activeFilterCount === 0}
                    className="h-8 px-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-900/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 disabled:opacity-40 disabled:hover:text-slate-600 dark:disabled:hover:text-slate-300 disabled:hover:border-slate-200 dark:disabled:hover:border-slate-800 disabled:hover:bg-transparent transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t("logs.clear")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Optional right actions */}
        {actions}

        {/* Global Toolbar Clear Button */}
        {hasAnyActive && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-900/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-xs font-mono font-medium transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            title={t("logs.clearAll")}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("logs.clear")}</span>
          </button>
        )}
      </div>

      {/* ─── 3. Active Filter Badges (katta va o'qilishi oson text-xs chipslar) ─── */}
      {!isPopoverOpen && badges && badges.length > 0 && (
        <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-150">
          {badges.map((b) => (
            <span
              key={b.id}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium shadow-2xs transition-all ${getBadgeColorClasses(
                b.color,
              )}`}
            >
              <span>{b.label}</span>
              <button
                type="button"
                onClick={b.onRemove}
                className="hover:text-slate-900 dark:hover:text-white cursor-pointer ml-0.5 p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="O'chirish"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

