import React from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, Layers, ChevronLeft, ChevronRight, ScrollText } from "lucide-react";
import type { LogRow } from "../../../api/types";
import {
  formatTs,
  formatDateTs,
  formatNumber,
  rcodeName,
} from "../../../lib/format";

interface LogTableProps {
  rows: LogRow[];
  total: number | null;
  totalPages: number;
  page: number;
  isLive: boolean;
  isLoading: boolean;
  hideDomain?: boolean;
  showRule?: boolean;
  onPageChange: (newPage: number) => void;
}

export const LogTable: React.FC<LogTableProps> = ({
  rows,
  total,
  totalPages,
  page,
  isLive,
  isLoading,
  hideDomain,
  showRule,
  onPageChange,
}) => {
  const { t } = useTranslation();
  const colCount = 10 + (hideDomain ? -1 : 0) + (showRule ? 1 : 0);

  return (
    <div
      id="dns-request-logs-card"
      className="p-5 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/90 shadow-sm transition-colors space-y-4 flex-1 flex flex-col justify-between min-h-[460px] lg:min-h-[520px]"
    >
      {/* Card Header matching Dashboard sections */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
            <ScrollText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-normal [word-spacing:0.18em]">
                {t("logs.telemetryTitle")}
              </h3>
              {total !== null && (
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  ({t("logs.recordCount", { count: formatNumber(total) })})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto flex-1 flex flex-col min-h-0">
        <table className="w-full text-left text-xs widescreen:text-sm font-mono text-slate-700 dark:text-slate-300 h-full">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-mono text-xs widescreen:text-sm font-semibold tracking-normal border-b border-slate-200 dark:border-slate-800/80">
            <tr>
              <th className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4">{t("logs.time")}</th>
              <th className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4">{t("logs.srcIp")}</th>
              <th className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4">{t("logs.srcPort")}</th>
              <th className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4">{t("logs.dstIp")}</th>
              <th className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4">{t("logs.proto")}</th>
              {!hideDomain && (
                <th className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4">{t("logs.domain")}</th>
              )}
              <th className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4">{t("logs.type")}</th>
              <th className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4">{t("logs.rcode")}</th>
              <th className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4">{t("logs.size")}</th>
              <th className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4">{t("logs.status")}</th>
              {showRule && (
                <th className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4">{t("logs.rule")}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono h-full">
            {isLoading && (
              <tr className="h-full">
                <td
                  colSpan={colCount}
                  className="py-32 text-center text-slate-400 dark:text-slate-500 font-mono text-xs align-middle"
                >
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                    <span>{t("logs.loading")}</span>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && (!rows || rows.length === 0) && (
              <tr className="h-full">
                <td
                  colSpan={colCount}
                  className="py-32 text-center text-slate-400 dark:text-slate-500 font-mono text-xs align-middle"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-400 dark:text-slate-500">
                      <Layers className="w-7 h-7" />
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {t("logs.noRecords")}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {t("logs.noRecordsSub")}
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              rows.map((row, i) => (
                <tr
                  key={`${row.ts}-${row.src_ip}-${i}`}
                  className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                    row.blocked ? "bg-rose-50/40 dark:bg-rose-950/15" : ""
                  }`}
                  title={formatDateTs(row.ts)}
                >
                  {/* Time */}
                  <td className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4 text-slate-500 dark:text-slate-400 font-mono">
                    {formatTs(row.ts)}
                  </td>

                  {/* Src IP */}
                  <td className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4 font-mono text-slate-900 dark:text-slate-200 font-medium">
                    {row.src_ip}
                  </td>

                  {/* Src Port */}
                  <td className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4 text-slate-400 dark:text-slate-500 font-mono">
                    {row.src_port}
                  </td>

                  {/* Dst IP */}
                  <td className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4 font-mono text-slate-700 dark:text-slate-300">
                    {row.dst_ip}
                  </td>

                  {/* Protocol */}
                  <td className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] widescreen:text-xs">
                      {row.protocol}
                    </span>
                  </td>

                  {/* Domain */}
                  {!hideDomain && (
                    <td
                      className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4 text-blue-600 dark:text-blue-400 font-medium font-mono max-w-[240px] widescreen:max-w-[360px] truncate"
                      title={row.domain}
                    >
                      {row.domain || "—"}
                    </td>
                  )}

                  {/* Query Type */}
                  <td className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4">
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono text-[11px] widescreen:text-xs font-bold">
                      {row.qtype_name || "A"}
                    </span>
                  </td>

                  {/* Response Code */}
                  <td className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4 text-slate-600 dark:text-slate-400 text-[11px] widescreen:text-xs">
                    <span
                      className={
                        row.rcode === 0
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-amber-600 dark:text-amber-400 font-semibold"
                      }
                    >
                      {rcodeName(row.rcode)}
                    </span>
                  </td>

                  {/* Packet Size */}
                  <td className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4 text-slate-500 dark:text-slate-400 font-mono">
                    {row.size} B
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4">
                    {row.blocked ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] widescreen:text-xs font-medium font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] widescreen:text-xs font-medium font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        Passed
                      </span>
                    )}
                  </td>

                  {/* Rule (if shown) */}
                  {showRule && (
                    <td
                      className="py-3 widescreen:py-3.5 px-3.5 widescreen:px-4 text-amber-600 dark:text-amber-400 text-[11px] widescreen:text-xs max-w-[160px] widescreen:max-w-[260px] truncate font-mono"
                      title={row.rule}
                    >
                      {row.rule ?? "—"}
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ─── Pager / Pagination ────────────────────────────────────────── */}
      {!isLive && total !== null && totalPages > 1 && (
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 flex-wrap gap-3">
          <div>
            {t("logs.page")}{" "}
            <span className="text-slate-900 dark:text-white font-semibold">
              {page + 1}
            </span>{" "}
            {t("logs.of")}{" "}
            <span className="text-slate-900 dark:text-white font-semibold">
              {totalPages}
            </span>{" "}
            ·{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              {t("logs.totalRecords", { total: formatNumber(total) })}
            </strong>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{t("logs.previous")}</span>
            </button>

            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
            >
              <span>{t("logs.next")}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
