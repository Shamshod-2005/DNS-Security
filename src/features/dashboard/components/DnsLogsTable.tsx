import {
  Activity,
  Check,
  Copy,
  ExternalLink
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DnsLogEntry } from "../../../types";

interface DnsLogsTableProps {
  logs: DnsLogEntry[];
  onSelectLog: (log: DnsLogEntry) => void;
  onViewAllLogs?: () => void;
  liveStreaming?: boolean;
}

export const DnsLogsTable: React.FC<DnsLogsTableProps> = ({
  logs,
  onSelectLog,
  onViewAllLogs,
  liveStreaming = false,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<
    "ALL" | "ALLOW" | "BLOCK" | "SINKHOLE"
  >("ALL");
  const [queryTypeFilter, setQueryTypeFilter] = useState<string>("ALL");
  const [threatFilter, setThreatFilter] = useState<string>("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.clientIp.includes(searchTerm) ||
        log.device.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction =
        actionFilter === "ALL" || log.action === actionFilter;

      const matchesQueryType =
        queryTypeFilter === "ALL" || log.queryType === queryTypeFilter;

      const matchesThreat =
        threatFilter === "ALL" || log.threatLevel === threatFilter;

      return (
        matchesSearch && matchesAction && matchesQueryType && matchesThreat
      );
    });
  }, [logs, searchTerm, actionFilter, queryTypeFilter, threatFilter]);

  // Display top 5 logs
  const topFiveLogs = filteredLogs.slice(0, 5);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDomain(text);
    setTimeout(() => setCopiedDomain(null), 1800);
  };

  const hasActiveFilters =
    actionFilter !== "ALL" ||
    queryTypeFilter !== "ALL" ||
    threatFilter !== "ALL";

  return (
    <div
      id="dns-request-logs-table"
      className="p-5 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/90 shadow-sm transition-colors"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-normal [word-spacing:0.18em]">
                {t("tables.dnsRequestLogs")}
              </h3>
            </div>
          </div>
        </div>

        {onViewAllLogs && (
          <button
            onClick={onViewAllLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-mono font-medium border border-slate-200 dark:border-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>{t("tables.allRequests", { count: logs.length })}</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </button>
        )}
      </div>

      {/* 3 Columns Table: DOMAIN, CLIENT, ACTION */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-sm text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-mono text-xs font-semibold tracking-normal border-b border-slate-200 dark:border-slate-800/80">
            <tr className="h-10">
              <th className="py-2.5 px-3 w-[54%]">{t("tables.domainAndTimestamp")}</th>
              <th className="py-2.5 px-3 w-[26%]">{t("tables.clientDevice")}</th>
              <th className="py-2.5 px-3 w-[20%] text-right">{t("tables.action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
            {topFiveLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="h-[320px] text-center text-slate-400 dark:text-slate-500 font-mono text-sm"
                >
                  {t("tables.noLogsMatch")}
                </td>
              </tr>
            ) : (
              topFiveLogs.map((log) => {
                const isBlocked =
                  log.action === "BLOCK" || log.action === "SINKHOLE";
                return (
                  <tr
                    key={log.id}
                    id={`dns-log-row-${log.id}`}
                    onClick={() => onSelectLog(log)}
                    className="h-[64px] hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* 1. DOMAIN & TIMESTAMP */}
                    <td className="py-2.5 px-3 font-mono">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate block"
                          title={log.domain}
                        >
                          {log.domain}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(log.domain);
                          }}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          title="Copy domain"
                        >
                          {copiedDomain === log.domain ? (
                            <Check className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono text-[11px]">{log.timestamp}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 text-[10px]">
                          {log.queryType}
                        </span>
                      </div>
                    </td>

                    {/* 2. CLIENT (DEVICE & IP) */}
                    <td className="py-2.5 px-3 font-mono">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="text-blue-600 dark:text-blue-300 font-medium px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-xs truncate block"
                          title={log.device}
                        >
                          {log.device}
                        </span>
                      </div>
                    </td>

                    {/* 3. ACTION VERDICT */}
                    <td className="py-2.5 px-3 font-mono text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold font-mono ${
                          isBlocked
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {isBlocked ? "BLOCKED" : "ALLOWED"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
