import React from "react";
import type { Region } from "../../../../types/region";
import {
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Zap,
  Clock,
  Layers,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatedNumber } from "./AnimatedNumber";

interface RegionDetailsPanelProps {
  region: Region;
}

export const RegionDetailsPanel: React.FC<RegionDetailsPanelProps> = ({ region }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const name =
    currentLang === "uz"
      ? region.nameUz
      : currentLang === "ru"
      ? region.nameRu
      : region.nameEn;

  const statusBadge = {
    healthy: {
      bg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      label: t("regionalMonitoring.status.healthy", "Healthy"),
      icon: CheckCircle2,
      pulseDot: "bg-emerald-500",
    },
    warning: {
      bg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      label: t("regionalMonitoring.status.warning", "Warning"),
      icon: AlertTriangle,
      pulseDot: "bg-amber-500",
    },
    critical: {
      bg: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
      label: t("regionalMonitoring.status.critical", "Critical"),
      icon: ShieldAlert,
      pulseDot: "bg-rose-500",
    },
    offline: {
      bg: "bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/30",
      label: t("regionalMonitoring.status.offline", "Offline"),
      icon: Server,
      pulseDot: "bg-slate-400",
    },
  }[region.status];

  const StatusIcon = statusBadge.icon;

  return (
    <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 space-y-4 backdrop-blur-xs shadow-xs transition-all">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {name}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 font-mono font-semibold">
              {region.code}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-slate-400" />
            {t("regionalMonitoring.demoDataNotice", "Demo data mode")}
          </span>
        </div>

        <div className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 shadow-2xs ${statusBadge.bg}`}>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusBadge.pulseDot}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${statusBadge.pulseDot}`}></span>
          </span>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{statusBadge.label}</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            DNS Servers (<AnimatedNumber value={region.dnsServers} />)
          </span>
          <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
            <AnimatedNumber value={region.availability} decimals={2} />% SLA
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-emerald-500 text-[10px] block">Healthy</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              <AnimatedNumber value={region.healthyServers} />
            </span>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-500 text-[10px] block">Warning</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
              <AnimatedNumber value={region.warningServers} />
            </span>
          </div>
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <span className="text-rose-500 text-[10px] block">Critical</span>
            <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
              <AnimatedNumber value={region.criticalServers} />
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-slate-400 text-[10px] block">Avg Response</span>
          <span className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
            <Activity className="w-4 h-4 text-blue-500" />
            <AnimatedNumber value={region.avgResponseMs} suffix=" ms" />
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-slate-400 text-[10px] block">Throughput (RPS)</span>
          <span className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
            <Zap className="w-4 h-4 text-blue-500" />
            <AnimatedNumber value={region.requestsPerSecond} suffix=" /s" />
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-slate-400 text-[10px] block">24h Queries</span>
          <span className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
            <AnimatedNumber value={region.totalRequests} />
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-slate-400 text-[10px] block">Errors Logged</span>
          <span className={`text-base font-bold mt-0.5 block ${region.errors > 1000 ? "text-rose-500" : "text-slate-400"}`}>
            <AnimatedNumber value={region.errors} />
          </span>
        </div>
      </div>
    </div>
  );
};
