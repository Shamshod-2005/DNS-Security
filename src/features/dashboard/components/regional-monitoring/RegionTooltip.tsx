import React from "react";
import type { Region } from "../../../../types/region";
import { Server, Activity, ShieldCheck, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RegionTooltipProps {
  region: Region;
  position: { x: number; y: number };
}

export const RegionTooltip: React.FC<RegionTooltipProps> = ({ region, position }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const name =
    currentLang === "uz"
      ? region.nameUz
      : currentLang === "ru"
      ? region.nameRu
      : region.nameEn;

  const statusConfig = {
    healthy: {
      badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      label: "Healthy",
      icon: ShieldCheck,
    },
    warning: {
      badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      label: "Warning",
      icon: AlertTriangle,
    },
    critical: {
      badgeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
      label: "Critical",
      icon: AlertTriangle,
    },
    offline: {
      badgeClass: "bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/30",
      label: "Offline",
      icon: Server,
    },
  }[region.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div
      className="pointer-events-none fixed z-50 transform -translate-x-1/2 -translate-y-full mb-3 w-64 p-3 rounded-xl bg-slate-950/95 text-white shadow-2xl border border-slate-700/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 font-sans"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <div className="text-xs font-bold text-white tracking-wide">{name}</div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            Code: {region.code}
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border flex items-center gap-1 ${statusConfig.badgeClass}`}
        >
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-400 text-[10px] block">DNS Servers</span>
          <span className="text-slate-200 font-bold flex items-center gap-1">
            <Server className="w-3 h-3 text-blue-400" />
            {region.dnsServers} nodes
          </span>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-400 text-[10px] block">Availability</span>
          <span className="text-emerald-400 font-bold">{region.availability}%</span>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 col-span-2 flex items-center justify-between">
          <span className="text-slate-400 text-[10px]">Avg Latency:</span>
          <span className="text-slate-200 font-bold flex items-center gap-1">
            <Activity className="w-3 h-3 text-blue-400" />
            {region.avgResponseMs} ms
          </span>
        </div>
      </div>
    </div>
  );
};
