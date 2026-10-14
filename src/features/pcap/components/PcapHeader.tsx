import React from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, Square } from "lucide-react";

interface PcapHeaderProps {
  isActive: boolean;
  activeSessionsCount: number;
  isFetching: boolean;
  isStoppingAll: boolean;
  onRefresh: () => void;
  onStopAll: () => void;
}

export const PcapHeader: React.FC<PcapHeaderProps> = ({
  isActive,
  activeSessionsCount,
  isFetching,
  isStoppingAll,
  onRefresh,
  onStopAll,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 relative z-20 transition-colors">
      {/* Glow accent contained in its own overflow-hidden layer */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="space-y-1 relative z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-normal [word-spacing:0.18em]">
            {t("pcapPage.title")}
          </h1>
        </div>
      </div>

      {/* Right Controls matching Dashboard & Filter layout */}
      <div className="flex flex-wrap items-center gap-2.5 self-start xl:self-auto relative z-10 shrink-0">
        {/* Stop all button — visible when any capture is active */}
        {isActive && (
          <button
            type="button"
            onClick={onStopAll}
            disabled={isStoppingAll}
            className="h-9 px-3.5 inline-flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>{isStoppingAll ? "..." : t("pcapPage.stopAll")}</span>
          </button>
        )}

        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className="h-9 px-3.5 inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white text-xs font-mono font-medium transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-blue-500 ${isFetching ? "animate-spin" : ""}`}
          />
          <span>{t("pcapPage.refresh")}</span>
        </button>
      </div>
    </div>
  );
};
