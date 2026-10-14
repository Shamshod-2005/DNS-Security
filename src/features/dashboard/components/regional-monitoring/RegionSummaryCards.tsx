import React from "react";
import type { RegionSummaryStats } from "../../../../types/region";
import { Globe, CheckCircle2, AlertTriangle, ShieldAlert, Server } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatedNumber } from "./AnimatedNumber";

interface RegionSummaryCardsProps {
  summary: RegionSummaryStats;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export const RegionSummaryCards: React.FC<RegionSummaryCardsProps> = ({
  summary,
  selectedFilter,
  onFilterChange,
}) => {
  const { t } = useTranslation();

  const cards = [
    {
      id: "all",
      label: t("regionalMonitoring.summary.totalRegions", "Total regions"),
      value: summary.totalRegions,
      sub: `${summary.totalDnsServers} active servers`,
      icon: Globe,
      color: "text-blue-500 dark:text-blue-400",
      bgClass: "bg-blue-500/10 border-blue-500/20",
      activeClass: "border-blue-500 shadow-md ring-1 ring-blue-500/40 bg-blue-500/5",
    },
    {
      id: "healthy",
      label: t("regionalMonitoring.summary.healthy", "Healthy"),
      value: summary.healthyRegions,
      sub: `${summary.avgAvailability}% avg uptime`,
      icon: CheckCircle2,
      color: "text-emerald-500 dark:text-emerald-400",
      bgClass: "bg-emerald-500/10 border-emerald-500/20",
      activeClass: "border-emerald-500 shadow-md ring-1 ring-emerald-500/40 bg-emerald-500/5",
    },
    {
      id: "warning",
      label: t("regionalMonitoring.summary.warning", "Warning"),
      value: summary.warningRegions,
      sub: "Latency / NXDOMAIN",
      icon: AlertTriangle,
      color: "text-amber-500 dark:text-amber-400",
      bgClass: "bg-amber-500/10 border-amber-500/20",
      activeClass: "border-amber-500 shadow-md ring-1 ring-amber-500/40 bg-amber-500/5",
    },
    {
      id: "critical",
      label: t("regionalMonitoring.summary.critical", "Critical"),
      value: summary.criticalRegions,
      sub: "Transit / loss alerts",
      icon: ShieldAlert,
      color: "text-rose-500 dark:text-rose-400",
      bgClass: "bg-rose-500/10 border-rose-500/20",
      activeClass: "border-rose-500 shadow-md ring-1 ring-rose-500/40 bg-rose-500/5",
    },
    {
      id: "offline",
      label: t("regionalMonitoring.summary.offline", "Offline"),
      value: summary.offlineRegions,
      sub: "Node maintenance",
      icon: Server,
      color: "text-slate-500 dark:text-slate-400",
      bgClass: "bg-slate-500/10 border-slate-500/20",
      activeClass: "border-slate-500 shadow-md ring-1 ring-slate-500/40 bg-slate-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onFilterChange(card.id)}
            className={`p-3.5 rounded-xl bg-white dark:bg-[#11192e] border transition-all duration-200 cursor-pointer select-none hover:-translate-y-0.5 shadow-xs ${
              isSelected
                ? card.activeClass
                : "border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-mono">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${card.bgClass} ${card.color} transition-transform duration-200 hover:scale-110`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
                <AnimatedNumber value={card.value} />
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[90px]">
                {card.sub}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
