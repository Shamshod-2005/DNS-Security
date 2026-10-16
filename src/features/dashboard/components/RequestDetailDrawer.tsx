import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileCheck2,
  Filter,
  ListFilter,
  ShieldAlert,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import type { DnsLogEntry } from "../../../types";
import { ROUTES } from "../../../router/routes";

interface RequestDetailDrawerProps {
  log: DnsLogEntry | null;
  onClose: () => void;
  onBlockDomain?: (domain: string, category: string) => void;
  onIsolateClient?: (clientIp: string, deviceName: string) => void;
}

export const RequestDetailDrawer: React.FC<RequestDetailDrawerProps> = ({
  log,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // ESC tugmasi bosilganda modalni yopish va body scrollini to'xtatish
  useEffect(() => {
    if (!log) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [log, onClose]);

  if (!log) return null;

  const copyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isBlocked = log.action === "BLOCK" || log.action === "SINKHOLE";

  const handleSearchInFilter = () => {
    onClose();
    navigate(`${ROUTES.FILTER}?search=${encodeURIComponent(log.domain)}`);
  };

  const handleViewInLogs = () => {
    onClose();
    navigate(`${ROUTES.QUERY_LOG}?search=${encodeURIComponent(log.domain)}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      {/* 1. Backdrop (Fon ustiga bosilganda yopiladi) */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* 2. Centered Modal Card (O'rtada chiqadigan oyna) */}
      <div
        id="dns-request-inspection-modal"
        className="relative w-full max-w-2xl widescreen:max-w-3xl rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] z-10 overflow-hidden my-auto transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-[#0d1322]/90 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("requestDetail.inspectorTitle")}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                  isBlocked
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {isBlocked
                  ? t("requestDetail.actionBlocked")
                  : t("requestDetail.actionAllowed")}
              </span>
            </div>

            {/* Close (X) button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title={t("requestDetail.closeModal")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Target Domain Title */}
          <div className="mt-3 flex items-baseline justify-between gap-3">
            <h2
              id="request-detail-title"
              className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white tracking-tight break-all"
            >
              {log.domain}
            </h2>
            <button
              onClick={() => copyText(log.domain, "domain")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-200/60 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
              title={t("requestDetail.copyDomain")}
            >
              {copiedField === "domain" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {t("requestDetail.copied")}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t("requestDetail.copy")}</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>{log.fullTimestamp}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {log.responseTimeMs}ms {t("requestDetail.latency")}
            </span>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-700 dark:text-slate-200">
          {/* 1. Threat Intelligence Status Banner */}
          {log.threatIntel ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wide font-mono">
                      {t("requestDetail.threatIntelTitle")}:{" "}
                      {log.threatIntel.threatType}
                    </h4>
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold">
                      {log.threatIntel.confidence}% {t("requestDetail.confidence")}
                    </span>
                  </div>
                  <p className="text-xs text-rose-800 dark:text-rose-300/90 mt-1 leading-relaxed">
                    {log.threatIntel.details}
                  </p>
                  <div className="mt-2 text-[10px] font-mono text-rose-600 dark:text-rose-400/80">
                    {t("requestDetail.feedSource")}: {log.threatIntel.feedSource}
                  </div>
                </div>
              </div>
            </div>
          ) : isBlocked ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wide font-mono">
                  {t("requestDetail.threatIntelTitle")}: {log.category}
                </div>
                <div className="text-xs text-rose-700 dark:text-rose-300/90 mt-0.5">
                  {log.policyApplied}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-emerald-900 dark:text-emerald-200">
                  {t("requestDetail.threatSafeTitle")}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                  {t("requestDetail.threatSafeDesc")}
                </div>
              </div>
            </div>
          )}

          {/* 2. Primary DNS Details Grid */}
          <div className="rounded-xl bg-slate-50 dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 p-4 space-y-3 font-mono text-xs">
            <h4 className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold pb-2 border-b border-slate-200 dark:border-slate-800">
              {t("requestDetail.resolutionParams")}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Client IP */}
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                  {t("requestDetail.clientIp")}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-slate-900 dark:text-slate-200 font-semibold">
                    {log.clientIp}
                  </span>
                  <button
                    onClick={() => copyText(log.clientIp, "clientIp")}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5"
                    title={t("requestDetail.copyClientIp")}
                  >
                    {copiedField === "clientIp" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Device Name */}
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                  {t("requestDetail.deviceName")}
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold mt-0.5 block truncate">
                  {log.device}
                </span>
              </div>

              {/* Query Type */}
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                  {t("requestDetail.queryType")}
                </span>
                <span className="text-slate-900 dark:text-slate-200 font-semibold mt-0.5 block">
                  {log.queryType} (IN)
                </span>
              </div>

              {/* Response Code */}
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                  {t("requestDetail.responseCode")}
                </span>
                <span
                  className={`mt-0.5 font-bold block ${
                    log.responseCode === "NOERROR"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {log.responseCode}
                </span>
              </div>

              {/* Resolved Response */}
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                  {t("requestDetail.resolvedResponse")}
                </span>
                <span className="text-slate-800 dark:text-slate-300 mt-0.5 block truncate">
                  {log.response}
                </span>
              </div>

              {/* Category */}
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                  {t("requestDetail.category")}
                </span>
                <span className="text-slate-800 dark:text-slate-300 mt-0.5 block truncate">
                  {log.category}
                </span>
              </div>

              {/* Server */}
              <div className="col-span-1 sm:col-span-2">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                  {t("requestDetail.server")}
                </span>
                <span className="text-slate-800 dark:text-slate-300 mt-0.5 block truncate">
                  {log.dnsServer}
                </span>
              </div>

              {/* Policy Applied */}
              <div className="col-span-1 sm:col-span-2">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                  {t("requestDetail.policyApplied")}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                  <span className="text-blue-700 dark:text-blue-300 font-medium break-all">
                    {log.policyApplied}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. DNS Resolution Timeline */}
          <div className="rounded-xl bg-slate-50 dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 p-4 space-y-3 font-mono text-xs">
            <h4 className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold pb-2 border-b border-slate-200 dark:border-slate-800">
              {t("requestDetail.pipelineTimeline")}
            </h4>

            <div className="space-y-3.5 relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 ml-1">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-[#0d1322]" />
                <div className="text-slate-900 dark:text-slate-200 font-semibold text-xs">
                  {t("requestDetail.step1Title")}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  {t("requestDetail.step1Desc", {
                    client: `${log.clientIp} (${log.device})`,
                  })}
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-[#0d1322]" />
                <div className="text-slate-900 dark:text-slate-200 font-semibold text-xs">
                  {t("requestDetail.step2Title")}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  {t("requestDetail.step2Desc")}
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div
                  className={`absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-[#0d1322] ${
                    isBlocked ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                />
                <div className="text-slate-900 dark:text-slate-200 font-semibold text-xs">
                  {t("requestDetail.step3Title")}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  {t("requestDetail.step3Desc", {
                    rule: log.policyApplied,
                    action: isBlocked
                      ? t("requestDetail.actionBlocked")
                      : t("requestDetail.actionAllowed"),
                  })}
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 ring-4 ring-white dark:ring-[#0d1322]" />
                <div className="text-slate-900 dark:text-slate-200 font-semibold text-xs">
                  {t("requestDetail.step4Title")}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  {t("requestDetail.step4Desc", {
                    response: log.response,
                    latency: log.responseTimeMs,
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-[#0d1322]/90 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSearchInFilter}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium border border-slate-300 dark:border-slate-700 transition-colors"
            >
              <Filter className="w-3.5 h-3.5 text-blue-500" />
              <span>{t("requestDetail.viewInFilter")}</span>
            </button>
            <button
              onClick={handleViewInLogs}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium border border-slate-300 dark:border-slate-700 transition-colors"
            >
              <ListFilter className="w-3.5 h-3.5 text-blue-500" />
              <span>{t("requestDetail.viewInLogs")}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-semibold transition-colors shadow-sm ml-auto"
          >
            {t("requestDetail.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailDrawer;
