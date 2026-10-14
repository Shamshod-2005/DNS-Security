import React, { useState } from "react";
import { MapPin, RefreshCw, Radio } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useRegions,
  useRegionSummary,
  useRegionMetrics,
  useRegionAlerts,
} from "../../../../hooks/useRegions";
import type { Region } from "../../../../types/region";
import { UzbekistanMap } from "./UzbekistanMap";
import { RegionStatusLegend } from "./RegionStatusLegend";
import { RegionSummaryCards } from "./RegionSummaryCards";
import { RegionDetailsPanel } from "./RegionDetailsPanel";
import { RegionMetricsChart } from "./RegionMetricsChart";
import { RegionAlertsList } from "./RegionAlertsList";
import { RegionTable } from "./RegionTable";

export const RegionalDnsMonitoring: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // 1. Data hooks
  const {
    data: regions = [],
    isLoading: isLoadingRegions,
    refetch,
  } = useRegions();
  const { data: summary } = useRegionSummary();
  const { data: alerts = [] } = useRegionAlerts();

  // 2. Local selection states
  const [selectedRegionId, setSelectedRegionId] =
    useState<string>("tashkent-city");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [metricsRange, setMetricsRange] = useState<
    "1h" | "6h" | "24h" | "7d" | "30d"
  >("24h");

  // Selected region object
  const selectedRegion = React.useMemo(() => {
    return (
      regions.find(
        (r) => r.id === selectedRegionId || r.code === selectedRegionId,
      ) ??
      regions[0] ??
      null
    );
  }, [regions, selectedRegionId]);

  // Selected region metrics
  const { data: metrics = [], isLoading: isLoadingMetrics } = useRegionMetrics(
    selectedRegion?.id ?? null,
    metricsRange,
  );

  const selectedRegionName = selectedRegion
    ? currentLang === "uz"
      ? selectedRegion.nameUz
      : currentLang === "ru"
        ? selectedRegion.nameRu
        : selectedRegion.nameEn
    : "Tashkent";

  return (
    <div
      id="regional-dns-monitoring-section"
      className="p-5 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/90 shadow-sm transition-colors space-y-6"
    >
      {/* ─── Module Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-normal [word-spacing:0.18em]">
                {t("regionalMonitoring.title", "Regional DNS monitoring")}
              </h3>
            </div>
          </div>
        </div>


        {/* Status Legend & Demo Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <RegionStatusLegend />
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Refresh regional status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          
        </div>
      </div>

      {/* ─── Summary Cards ─── */}
      {summary && (
        <RegionSummaryCards
          summary={summary}
          selectedFilter={statusFilter}
          onFilterChange={(f) => setStatusFilter(f)}
        />
      )}

      {/* ─── Main Grid: Map (Left) + Details Inspector (Right) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <UzbekistanMap
            regions={regions}
            selectedRegionId={selectedRegionId}
            onSelectRegion={(r) => setSelectedRegionId(r.id)}
          />

          {/* Regional Table underneath map */}
          <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/70">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono mb-2">
              {t(
                "regionalMonitoring.tableTitle",
                "Administrative divisions breakdown",
              )}
            </h4>
            <RegionTable
              regions={regions}
              selectedRegionId={selectedRegionId}
              onSelectRegion={(r) => setSelectedRegionId(r.id)}
              statusFilter={statusFilter}
            />
          </div>
        </div>

        {/* Region Details & Historical Metrics Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedRegion && <RegionDetailsPanel region={selectedRegion} />}

          {/* Historical Metrics Chart */}
          <RegionMetricsChart
            metrics={metrics}
            regionName={selectedRegionName}
            selectedRange={metricsRange}
            onRangeChange={setMetricsRange}
            isLoading={isLoadingMetrics}
          />

          {/* Regional Alerts */}
          <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/70 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {selectedRegionName} —{" "}
                {t("regionalMonitoring.alertsTitle", "Regional alerts")}
              </h4>
            </div>
            <RegionAlertsList
              alerts={alerts}
              selectedRegionCode={selectedRegion?.code}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
