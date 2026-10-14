import React from "react";
import {
  Users,
  Globe,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TopRow } from "../../../api/types";

interface TopSummaryPanelsProps {
  topClients: TopRow[];
  topDomains: TopRow[];
  topBlocked: TopRow[];
  cardMetric?: "pps" | "bps";
  onSelectClient?: (clientIp: string) => void;
  onInspectDomain?: (domainName: string) => void;
  onInspectBlockedDomain?: (domainName: string) => void;
  onViewAllClients?: () => void;
  onViewAllBlocked?: () => void;
}

export const TopSummaryPanels: React.FC<TopSummaryPanelsProps> = ({
  topClients,
  topDomains,
  topBlocked,
  cardMetric = "pps",
  onSelectClient,
  onInspectDomain,
  onInspectBlockedDomain,
  onViewAllClients,
  onViewAllBlocked,
}) => {
  const { t } = useTranslation();
  const isBps = cardMetric === "bps";

  const formatVal = (item: TopRow) => {
    if (isBps) {
      const bytes = item.bytes || 0;
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return item.count.toLocaleString();
  };

  const countHeader = isBps ? "TRAFFIC" : "REQUEST COUNT";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {/* ??? CARD 1: TOP 10 CLIENTS ??? */}
      <div
        id="panel-top-clients"
        className="p-5 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/90 shadow-sm transition-all flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t("tables.topClients", "Top 10 clients")}
                  </h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">
                    {t("tables.mostDnsRequests", "MOST DNS REQUESTS")}
                  </span>
                </div>
              </div>
            </div>

            {onViewAllClients && (
              <button
                onClick={onViewAllClients}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="View all clients"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Table Headers */}
          <div className="flex items-center justify-between pt-3 pb-1.5 text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider select-none">
            <span>IP</span>
            <span>{countHeader}</span>
          </div>

          {/* Rows List */}
          <div className="space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/40">
            {(!topClients || topClients.length === 0) ? (
              <div className="py-8 text-center text-xs font-mono text-slate-400">
                No client data available
              </div>
            ) : (
              topClients.slice(0, 10).map((it) => (
                <div
                  key={`client-${it.name}`}
                  onClick={() => onSelectClient?.(it.name)}
                  className="pt-2 pb-1.5 px-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium truncate max-w-[170px]">
                      {it.name}
                    </span>
                    <div className="flex items-baseline gap-1.5 shrink-0">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatVal(it)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {it.pct}%
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(3, it.pct))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ??? CARD 2: TOP 10 REQUESTED DOMAINS ??? */}
      <div
        id="panel-top-domains"
        className="p-5 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/90 shadow-sm transition-all flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t("tables.topRequestedDomains", "Top 10 requested domains")}
                </h3>
              </div>
            </div>
          </div>

          {/* Table Headers */}
          <div className="flex items-center justify-between pt-3 pb-1.5 text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider select-none">
            <span>DOMAIN</span>
            <span>{countHeader}</span>
          </div>

          {/* Rows List */}
          <div className="space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/40">
            {(!topDomains || topDomains.length === 0) ? (
              <div className="py-8 text-center text-xs font-mono text-slate-400">
                No domain queries logged
              </div>
            ) : (
              topDomains.slice(0, 10).map((it) => (
                <div
                  key={`domain-${it.name}`}
                  onClick={() => onInspectDomain?.(it.name)}
                  className="pt-2 pb-1.5 px-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium truncate max-w-[170px]" title={it.name}>
                      {it.name}
                    </span>
                    <div className="flex items-baseline gap-1.5 shrink-0">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatVal(it)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {it.pct}%
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(3, it.pct))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ??? CARD 3: TOP 10 MALICIOUS DOMAINS (BLOCKED) ??? */}
      <div
        id="panel-top-blocked"
        className="p-5 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/90 shadow-sm transition-all flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t("tables.topMaliciousDomains", "Top 10 malicious domains")}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-mono font-semibold uppercase">
                    {t("threats.blocked", "BLOCKED")}
                  </span>
                </div>
              </div>
            </div>

            {onViewAllBlocked && (
              <button
                onClick={onViewAllBlocked}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="View all blocked domains"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Table Headers */}
          <div className="flex items-center justify-between pt-3 pb-1.5 text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider select-none">
            <span>DOMAIN</span>
            <span>{countHeader}</span>
          </div>

          {/* Rows List */}
          <div className="space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/40">
            {(!topBlocked || topBlocked.length === 0) ? (
              <div className="py-8 text-center text-xs font-mono text-slate-400">
                No blocked domains detected
              </div>
            ) : (
              topBlocked.slice(0, 10).map((it) => (
                <div
                  key={`blocked-${it.name}`}
                  onClick={() => onInspectBlockedDomain?.(it.name)}
                  className="pt-2 pb-1.5 px-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors font-medium truncate max-w-[170px]" title={it.name}>
                      {it.name}
                    </span>
                    <div className="flex items-baseline gap-1.5 shrink-0">
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        {formatVal(it)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {it.pct}%
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar (Red) */}
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(3, it.pct))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
