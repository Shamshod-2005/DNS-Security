import React from "react";
import { useTranslation } from "react-i18next";

export const RegionStatusLegend: React.FC = () => {
  const { t } = useTranslation();

  const statuses = [
    {
      key: "healthy",
      label: t("regionalMonitoring.status.healthy", "Healthy"),
      dotClass: "bg-emerald-500",
      borderClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "warning",
      label: t("regionalMonitoring.status.warning", "Warning"),
      dotClass: "bg-amber-500",
      borderClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      key: "critical",
      label: t("regionalMonitoring.status.critical", "Critical"),
      dotClass: "bg-rose-500",
      borderClass: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    {
      key: "offline",
      label: t("regionalMonitoring.status.offline", "Offline"),
      dotClass: "bg-slate-400",
      borderClass: "border-slate-500/30 bg-slate-500/10 text-slate-500 dark:text-slate-400",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
      {statuses.map((s) => (
        <div
          key={s.key}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${s.borderClass}`}
        >
          <span className={`w-2 h-2 rounded-full ${s.dotClass}`} />
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
};
