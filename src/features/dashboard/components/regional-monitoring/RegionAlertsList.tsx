import React from "react";
import type { RegionAlert } from "../../../../types/region";
import { ShieldAlert, AlertTriangle, Info, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RegionAlertsListProps {
  alerts: RegionAlert[];
  selectedRegionCode?: string;
}

export const RegionAlertsList: React.FC<RegionAlertsListProps> = ({
  alerts,
  selectedRegionCode,
}) => {
  const { t } = useTranslation();

  const filteredAlerts = selectedRegionCode
    ? alerts.filter((a) => a.regionCode === selectedRegionCode)
    : alerts;

  if (filteredAlerts.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 text-center font-mono text-xs text-slate-400">
        No active infrastructure alerts for this region. All Anycast nodes operating within normal parameters.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredAlerts.slice(0, 4).map((alert) => {
        const severityConfig = {
          critical: {
            border: "border-rose-500/30 bg-rose-500/10",
            text: "text-rose-600 dark:text-rose-400",
            icon: ShieldAlert,
          },
          warning: {
            border: "border-amber-500/30 bg-amber-500/10",
            text: "text-amber-600 dark:text-amber-400",
            icon: AlertTriangle,
          },
          info: {
            border: "border-blue-500/30 bg-blue-500/10",
            text: "text-blue-600 dark:text-blue-400",
            icon: Info,
          },
        }[alert.severity];

        const Icon = severityConfig.icon;

        return (
          <div
            key={alert.id}
            className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${severityConfig.border}`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${severityConfig.text}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono truncate">
                  {alert.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {alert.createdAt}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 line-clamp-2">
                {alert.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
