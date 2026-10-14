import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Check } from "lucide-react";
import {
  FilterToolbar,
  type ActiveFilterBadge,
} from "../../../components/common/FilterToolbar";

export interface LogFilterState {
  search: string; // Universal search (Domen yoki IP)
  src_ip: string;
  dst_ip: string;
  src_port: string;
  dst_port: string;
  protocol: "All" | "TCP" | "UDP";
}

export const EMPTY_FILTER: LogFilterState = {
  search: "",
  src_ip: "",
  dst_ip: "",
  src_port: "",
  dst_port: "",
  protocol: "All",
};

interface LogFilterBarProps {
  filter: LogFilterState;
  onFilterChange: (newFilter: LogFilterState) => void;
  hideDomain?: boolean;
}

export const LogFilterBar: React.FC<LogFilterBarProps> = ({
  filter,
  onFilterChange,
  hideDomain,
}) => {
  const { t } = useTranslation();
  // Local state to allow instant keystrokes with smooth debounced API dispatch
  const [localFilter, setLocalFilter] = useState<LogFilterState>(filter);

  // Custom protocol dropdown state
  const [isProtoOpen, setIsProtoOpen] = useState(false);
  const protoRef = useRef<HTMLDivElement>(null);

  // Keep local filter in sync when parent resets or changes filter externally
  useEffect(() => {
    setLocalFilter(filter);
  }, [filter]);

  // Debounced auto-search for all text inputs (search, IPs, ports)
  useEffect(() => {
    const isDifferent =
      localFilter.search !== filter.search ||
      localFilter.src_ip !== filter.src_ip ||
      localFilter.dst_ip !== filter.dst_ip ||
      localFilter.src_port !== filter.src_port ||
      localFilter.dst_port !== filter.dst_port ||
      localFilter.protocol !== filter.protocol;

    if (!isDifferent) return;

    const timer = setTimeout(() => {
      onFilterChange(localFilter);
    }, 320);

    return () => clearTimeout(timer);
  }, [localFilter, filter, onFilterChange]);

  // Click outside listener for Protocol custom dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (protoRef.current && !protoRef.current.contains(e.target as Node)) {
        setIsProtoOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProtoOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleFieldChange = useCallback(
    (field: keyof LogFilterState, value: string) => {
      setLocalFilter((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleProtocolSelect = useCallback(
    (val: LogFilterState["protocol"]) => {
      const updated = { ...localFilter, protocol: val };
      setLocalFilter(updated);
      onFilterChange(updated);
    },
    [localFilter, onFilterChange],
  );

  const handleClearAdvanced = () => {
    const cleared: LogFilterState = {
      ...localFilter,
      src_ip: "",
      dst_ip: "",
      src_port: "",
      dst_port: "",
      protocol: "All",
    };
    setLocalFilter(cleared);
    onFilterChange(cleared);
  };

  const handleClearAll = () => {
    setLocalFilter(EMPTY_FILTER);
    onFilterChange(EMPTY_FILTER);
  };

  const handleRemoveField = (field: keyof LogFilterState) => {
    const next = {
      ...localFilter,
      [field]: field === "protocol" ? "All" : "",
    };
    setLocalFilter(next);
    onFilterChange(next);
  };

  const activeAdvancedCount =
    (localFilter.src_ip ? 1 : 0) +
    (localFilter.dst_ip ? 1 : 0) +
    (localFilter.src_port ? 1 : 0) +
    (localFilter.dst_port ? 1 : 0) +
    (localFilter.protocol !== "All" ? 1 : 0);

  // Badges (faqat popover ichidagi parametrlar uchun, qidiruv inputining o'zida matn ko'rinib turadi)
  const badges: ActiveFilterBadge[] = [];
  if (localFilter.src_ip) {
    badges.push({
      id: "src_ip",
      label: `Src IP: ${localFilter.src_ip}`,
      color: "indigo",
      onRemove: () => handleRemoveField("src_ip"),
    });
  }
  if (localFilter.dst_ip) {
    badges.push({
      id: "dst_ip",
      label: `Dst IP: ${localFilter.dst_ip}`,
      color: "indigo",
      onRemove: () => handleRemoveField("dst_ip"),
    });
  }
  if (localFilter.src_port) {
    badges.push({
      id: "src_port",
      label: `Src Port: ${localFilter.src_port}`,
      color: "amber",
      onRemove: () => handleRemoveField("src_port"),
    });
  }
  if (localFilter.dst_port) {
    badges.push({
      id: "dst_port",
      label: `Dst Port: ${localFilter.dst_port}`,
      color: "amber",
      onRemove: () => handleRemoveField("dst_port"),
    });
  }
  if (localFilter.protocol !== "All") {
    badges.push({
      id: "protocol",
      label: `${t("logs.protocol")}: ${localFilter.protocol}`,
      color: "emerald",
      onRemove: () => handleRemoveField("protocol"),
    });
  }

  // Popover content — har bir maydon alohida qatorda, ixcham va toza
  const popoverContent = (
    <div className="space-y-3.5 font-mono text-xs">
      {/* 1. Source IP */}
      <div>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
          {t("logs.sourceIp")}
        </label>
        <input
          type="text"
          placeholder={t("logs.exampleIp")}
          value={localFilter.src_ip}
          onChange={(e) => handleFieldChange("src_ip", e.target.value)}
          className="w-full h-9 px-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-xs font-mono transition-colors shadow-2xs"
        />
      </div>

      {/* 2. Destination IP */}
      <div>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
          {t("logs.destinationIp")}
        </label>
        <input
          type="text"
          placeholder={t("logs.exampleDstIp")}
          value={localFilter.dst_ip}
          onChange={(e) => handleFieldChange("dst_ip", e.target.value)}
          className="w-full h-9 px-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-xs font-mono transition-colors shadow-2xs"
        />
      </div>

      {/* 3. Source Port */}
      <div>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
          {t("logs.sourcePort")}
        </label>
        <input
          type="text"
          placeholder={t("logs.examplePort")}
          value={localFilter.src_port}
          onChange={(e) => handleFieldChange("src_port", e.target.value)}
          className="w-full h-9 px-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-xs font-mono transition-colors shadow-2xs"
        />
      </div>

      {/* 4. Destination Port */}
      <div>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
          {t("logs.destinationPort")}
        </label>
        <input
          type="text"
          placeholder={t("logs.examplePort")}
          value={localFilter.dst_port}
          onChange={(e) => handleFieldChange("dst_port", e.target.value)}
          className="w-full h-9 px-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-xs font-mono transition-colors shadow-2xs"
        />
      </div>

      {/* 5. Protokol — Custom Styled Dropdown */}
      <div className="relative" ref={protoRef}>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
          {t("logs.protocol")}
        </label>
        <button
          type="button"
          onClick={() => setIsProtoOpen((prev) => !prev)}
          className={`w-full h-9 px-3.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-all cursor-pointer shadow-2xs select-none ${
            isProtoOpen
              ? "bg-white dark:bg-slate-900 border-blue-500 ring-1 ring-blue-500/20 text-slate-900 dark:text-white"
              : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <span className="truncate">
            {localFilter.protocol === "All"
              ? t("logs.allProtocols")
              : localFilter.protocol}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ml-1.5 ${
              isProtoOpen ? "rotate-180 text-blue-500" : ""
            }`}
          />
        </button>

        {isProtoOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 font-mono text-xs">
            {[
              { value: "All" as const, label: t("logs.allProtocols") },
              { value: "UDP" as const, label: "UDP" },
              { value: "TCP" as const, label: "TCP" },
            ].map((opt) => {
              const isSelected = localFilter.protocol === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    handleProtocolSelect(opt.value);
                    setIsProtoOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left select-none ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <FilterToolbar
      searchValue={localFilter.search}
      onSearchChange={(val) => handleFieldChange("search", val)}
      searchPlaceholder={
        hideDomain
          ? t("logs.searchIpPlaceholder")
          : t("logs.searchPlaceholder")
      }
      onClearSearch={() => handleRemoveField("search")}
      filterPopoverTitle={t("logs.filtering")}
      filterPopoverContent={popoverContent}
      activeFilterCount={activeAdvancedCount}
      onClearFilters={handleClearAdvanced}
      onClearAll={handleClearAll}
      badges={badges}
    />
  );
};
