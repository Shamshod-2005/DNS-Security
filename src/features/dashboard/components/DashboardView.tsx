import { DateRangePickerModal } from "../../../components/common/DateRangePickerModal";
import type { CustomRangeParams } from "../../../api/customRange";
import React from "react";
import { useTranslation } from "react-i18next";
import { Clock, ChevronDown, Check } from "lucide-react";
import type {
  BlockedDomainItem,
  ClientDevice,
  DnsLogEntry,
  TimeRange,
} from "../../../types";
import { KpiCards } from "./KpiCards";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { BlockedDomainsTable } from "./BlockedDomainsTable";
import { DnsLogsTable } from "./DnsLogsTable";
import { TopClientsSection } from "./TopClientsSection";
import { RegionalDnsMonitoring } from "./regional-monitoring/RegionalDnsMonitoring";

interface DashboardViewProps {
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
  onCardMetricChange?: (metric: "pps" | "bps") => void;
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
  onTimeRangeChange: (range: TimeRange) => void;
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
  blockedDomains: BlockedDomainItem[];
  dnsLogs: DnsLogEntry[];
  clients: ClientDevice[];
  selectedKpiFilter: "all" | "allowed" | "blocked" | "malicious";
  onSelectKpiFilter: (
    filter: "all" | "allowed" | "blocked" | "malicious",
  ) => void;
  onInspectLog: (log: DnsLogEntry) => void;
  onInspectDomain: (domain: BlockedDomainItem) => void;
  onSelectClient: (client: ClientDevice) => void;
  onNavigateTab: (tab: any, filter?: any) => void;
  customRangeParams?: CustomRangeParams;
  onCustomRangeApply?: (params: CustomRangeParams) => void;
  liveStreaming: boolean;
}

export const TIME_RANGE_OPTIONS: Array<{
  value: TimeRange;
  label: string;
}> = [
  {
    value: "60s",
    label: "60 seconds",
  },
  {
    value: "1h",
    label: "1 hour",
  },
  {
    value: "24h",
    label: "1 day",
  },
  {
    value: "7d",
    label: "1 week",
  },
  {
    value: "30d",
    label: "1 month",
  },
  {
    value: "custom",
    label: "Custom range",
  },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  rangeStats,
  rangeByteStats,
  perSecondStats,
  byteStats,
  perSecondByteStats,
  cardMetric = "pps",
  onCardMetricChange,
  sparklines,
  timeRange,
  onTimeRangeChange,
  chartData,
  categoriesData,
  blockedDomains,
  dnsLogs,
  clients,
  selectedKpiFilter,
  onInspectLog,
  onInspectDomain,
  onSelectClient,
  onNavigateTab,
  liveStreaming,
  customRangeParams,
  onCustomRangeApply,
}) => {
  const { t } = useTranslation();
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] =
    React.useState(false);

  // Custom Dropdown state for Card Metric (PPS / BPS)
  const [isMetricDropdownOpen, setIsMetricDropdownOpen] = React.useState(false);
  const metricDropdownRef = React.useRef<HTMLDivElement>(null);

  // Custom Dropdown state for Time Range (60s / 1h / 24h / 7d / 30d)
  const [isTimeRangeDropdownOpen, setIsTimeRangeDropdownOpen] =
    React.useState(false);
  const timeRangeDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        metricDropdownRef.current &&
        !metricDropdownRef.current.contains(e.target as Node)
      ) {
        setIsMetricDropdownOpen(false);
      }
      if (
        timeRangeDropdownRef.current &&
        !timeRangeDropdownRef.current.contains(e.target as Node)
      ) {
        setIsTimeRangeDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMetricDropdownOpen(false);
        setIsTimeRangeDropdownOpen(false);
      }
    };
    if (isMetricDropdownOpen || isTimeRangeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMetricDropdownOpen, isTimeRangeDropdownOpen]);

  return (
    <div
      className="pb-12 space-y-4 max-w-full overflow-x-hidden"
      id="dashboard-main-view"
    >
      {/* 1. Welcome / Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4    relative z-20 transition-colors">
        {/* Glow accent contained in its own overflow-hidden layer */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-normal [word-spacing:0.18em]">
              {t("dashboard.title")}
            </h1>
          </div>
        </div>

        {/* Controls: Card Metric Selector & Time Range Selector */}
        <div className="flex flex-wrap items-center gap-3 self-start xl:self-auto relative z-10 shrink-0">
          {/* Card Metric Custom Select Dropdown */}
          <div
            className="relative inline-flex items-center"
            ref={metricDropdownRef}
          >
            <button
              type="button"
              id="card-metric"
              onClick={() => setIsMetricDropdownOpen((prev) => !prev)}
              className={`h-9 pl-3.5 pr-3 inline-flex items-center gap-2.5 rounded-lg border text-xs font-mono font-medium transition-all shadow-xs cursor-pointer select-none ${
                isMetricDropdownOpen
                  ? "border-blue-500 bg-white dark:bg-slate-900 text-blue-600 dark:text-white ring-1 ring-blue-500/30"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Cards: packets/s or bits/s"
            >
              <span>
                {cardMetric === "bps" ? "BPS (bits/s)" : "PPS (packets/s)"}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  isMetricDropdownOpen ? "rotate-180 text-blue-500" : ""
                }`}
              />
            </button>

            {/* Custom Popover Menu */}
            {isMetricDropdownOpen && (
              <div
                className="absolute top-full mt-2 left-0 min-w-[200px] z-50 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-white/98 dark:bg-[#0f172a]/95 backdrop-blur-md shadow-2xl p-1.5 font-mono text-xs overflow-hidden"
                role="menu"
              >
                <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800/70 mb-1 flex items-center justify-between">
                  <span>Card Metric</span>
                  <span className="text-[9px] text-blue-500 dark:text-blue-400/80 font-normal">
                    Realtime
                  </span>
                </div>
                {[
                  {
                    value: "pps" as const,
                    label: "PPS (packets/s)",
                    desc: "Query packet rates",
                  },
                  {
                    value: "bps" as const,
                    label: "BPS (bits/s)",
                    desc: "Bandwidth traffic volume",
                  },
                ].map((item) => {
                  const isSelected = cardMetric === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        onCardMetricChange?.(item.value);
                        setIsMetricDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/30 shadow-xs"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white border border-transparent"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs">{item.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                          {item.desc}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {/* Time Range Custom Select Dropdown */}
          <div
            className="relative inline-flex items-center"
            ref={timeRangeDropdownRef}
          >
            <button
              type="button"
              id="time-range-select"
              onClick={() => setIsTimeRangeDropdownOpen((prev) => !prev)}
              className={`h-9 pl-3.5 pr-3 inline-flex items-center gap-2 rounded-lg border text-xs font-mono font-medium transition-all shadow-xs cursor-pointer select-none ${
                isTimeRangeDropdownOpen
                  ? "border-blue-500 bg-white dark:bg-slate-900 text-blue-600 dark:text-white ring-1 ring-blue-500/30"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
              }`}
              title={t("dashboard.timeInterval")}
            >
              <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
              <span>
                {timeRange === "custom"
                  ? customRangeParams?.startDate
                    ? `${new Date(customRangeParams.startDate).toLocaleDateString([], { month: "short", day: "numeric" })} - ${new Date(customRangeParams.endDate).toLocaleDateString([], { month: "short", day: "numeric" })}`
                    : t("timeIntervals.custom")
                  : t(`timeIntervals.${timeRange}`, {
                      defaultValue:
                        TIME_RANGE_OPTIONS.find((opt) => opt.value === timeRange)?.label || "1 day",
                    })}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  isTimeRangeDropdownOpen ? "rotate-180 text-blue-500" : ""
                }`}
              />
            </button>

            {/* Custom Popover Menu */}
            {isTimeRangeDropdownOpen && (
              <div
                className="absolute top-full mt-2 right-0 min-w-[210px] z-50 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-white/98 dark:bg-[#0f172a]/95 backdrop-blur-md shadow-2xl p-1.5 font-mono text-xs overflow-hidden"
                role="menu"
              >
                <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800/70 mb-1 flex items-center justify-between">
                  <span>{t("dashboard.timeInterval")}</span>
                  <span className="text-[9px] text-blue-500 dark:text-blue-400/80 font-normal">
                    Filter
                  </span>
                </div>
                {TIME_RANGE_OPTIONS.map((item) => {
                  const isSelected = timeRange === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        if (item.value === "custom") {
                          setIsTimeRangeDropdownOpen(false);
                          setIsDatePickerModalOpen(true);
                        } else {
                          onTimeRangeChange(item.value);
                          setIsTimeRangeDropdownOpen(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/30 shadow-xs"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white border border-transparent"
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">
                            {t(`timeIntervals.${item.value}`, { defaultValue: item.label })}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 2. 4 Interactive KPI Cards */}
        <KpiCards
          stats={stats}
          rangeStats={rangeStats}
          rangeByteStats={rangeByteStats}
          perSecondStats={perSecondStats}
          byteStats={byteStats}
          perSecondByteStats={perSecondByteStats}
          cardMetric={cardMetric}
          sparklines={sparklines}
          timeRange={timeRange}
          onCardClick={(filterType: string) => {
            if (filterType === "all") {
              onNavigateTab("dns-requests", "ALL");
            } else if (filterType === "allowed") {
              onNavigateTab("dns-requests", "ALLOW");
            } else if (filterType === "blocked") {
              onNavigateTab("blocked-domains");
            } else if (filterType === "malicious") {
              onNavigateTab("malicious-requests");
            }
          }}
          selectedFilter={selectedKpiFilter}
        />

        {/* 4. Analytics Section (Requests Overview Chart + Category Donut Chart) */}
        <AnalyticsCharts
          timeRange={timeRange}
          chartData={chartData}
          categoriesData={categoriesData}
          onSelectCategory={() => onNavigateTab("blocked-domains")}
        />

        {/* 5. Regional DNS Monitoring Section (Uzbekistan Map & Infrastructure) */}
        {/*umumiy DNS uchun qushiladigan qism */}
        {/* <RegionalDnsMonitoring /> */}

        {/* 6, 7, 8. Dashboard Bottom Tables: odatiy ekranda (noutbuk/monitor) USTMA-UST, faqat katta ekranda (>= 1800px) YONMA-YON 3 ta ustun */}
        <div className="grid grid-cols-1 widescreen:grid-cols-3 gap-6 items-stretch">
          <div className="flex flex-col h-full">
            <BlockedDomainsTable
              domains={blockedDomains}
              onInspectDomain={onInspectDomain}
              onViewAllClick={() => onNavigateTab("blocked-domains")}
            />
          </div>

          <div className="flex flex-col h-full">
            <DnsLogsTable
              logs={dnsLogs}
              onSelectLog={onInspectLog}
              onViewAllLogs={() => onNavigateTab("dns-logs")}
              liveStreaming={liveStreaming}
            />
          </div>

          <div className="flex flex-col h-full">
            <TopClientsSection
              clients={clients}
              onSelectClient={onSelectClient}
              onViewAllClients={() => onNavigateTab("clients-devices")}
            />
          </div>
        </div>
        <DateRangePickerModal
          isOpen={isDatePickerModalOpen}
          onClose={() => setIsDatePickerModalOpen(false)}
          onApply={(params: CustomRangeParams) => {
            onTimeRangeChange("custom");
            if (onCustomRangeApply) {
              onCustomRangeApply(params);
            }
          }}
          initialStartDate={customRangeParams?.startDate}
          initialEndDate={customRangeParams?.endDate}
          initialResolution={customRangeParams?.resolution}
        />
      </div>
    </div>
  );
};
