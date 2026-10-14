import React from "react";
import { useTranslation } from "react-i18next";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface FilterKpiCardsProps {
  totalDomains?: number;
  blockedTotal?: number;
  blockedSince?: string | null;
  isLoading?: boolean;
}

export const FilterKpiCards: React.FC<FilterKpiCardsProps> = ({
  totalDomains = 0,
  blockedTotal = 0,
  blockedSince,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* ── Malicious domains in active blocklist ── */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/80 p-5 widescreen:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base widescreen:text-lg font-semibold text-slate-700 dark:text-slate-200">
            {t("filterPage.kpi.maliciousDomains")}
          </span>
          <div className="w-8 h-8 widescreen:w-10 widescreen:h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 widescreen:w-5 widescreen:h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl widescreen:text-4xl font-extrabold font-mono tracking-tight text-rose-600 dark:text-rose-400">
            {isLoading ? "—" : totalDomains.toLocaleString()}
          </span>
        </div>
        <div className="mt-1 text-xs widescreen:text-sm text-slate-500 dark:text-slate-400">
          {t("filterPage.kpi.inActiveBlocklist")}
        </div>
      </div>

      {/* ── Blocked requests ── */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/80 p-5 widescreen:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base widescreen:text-lg font-semibold text-slate-700 dark:text-slate-200">
            {t("filterPage.kpi.blockedRequests")}
          </span>
          <div className="w-8 h-8 widescreen:w-10 widescreen:h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 widescreen:w-5 widescreen:h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl widescreen:text-4xl font-extrabold font-mono tracking-tight text-blue-600 dark:text-blue-400">
            {isLoading ? "—" : blockedTotal.toLocaleString()}
          </span>
        </div>
        <div className="mt-1 text-xs widescreen:text-sm text-slate-500 dark:text-slate-400">
          {blockedSince
            ? `${blockedSince} — ${t("filterPage.kpi.since")}`
            : t("filterPage.kpi.nothingBlockedYet")}
        </div>
      </div>
    </div>
  );
};

