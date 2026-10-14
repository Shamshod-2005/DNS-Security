import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileCheck2,
  ShieldAlert,
  X,
} from "lucide-react";
import React from "react";
import type { DnsLogEntry } from "../../../types";

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
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  if (!log) return null;

  const copyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isBlocked = log.action === "BLOCK" || log.action === "SINKHOLE";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        id="dns-request-inspection-drawer"
        className="absolute inset-y-0 right-0 max-w-full flex pl-10"
      >
        <div className="w-screen max-w-lg bg-[#0d1322] border-l border-slate-800 shadow-2xl flex flex-col justify-between text-slate-200">
          {/* Header */}
          <div className="p-6 border-b border-slate-800/80 bg-[#11192e]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  DNS Inspection Inspector
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isBlocked
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {log.action}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Domain */}
            <div className="mt-3 flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-bold font-mono text-white tracking-tight break-all">
                {log.domain}
              </h2>
              <button
                onClick={() => copyText(log.domain, "domain")}
                className="text-slate-400 hover:text-blue-400 p-1 rounded hover:bg-slate-800 shrink-0"
                title="Copy domain"
              >
                {copiedField === "domain" ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs font-mono text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{log.fullTimestamp}</span>
              <span className="text-slate-600">•</span>
              <span className="text-blue-400">
                {log.responseTimeMs}ms latency
              </span>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. Threat Intelligence Status Banner */}
            {log.threatIntel ? (
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/50 relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-rose-200 uppercase tracking-wide font-mono">
                        Threat Intel: {log.threatIntel.threatType}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 font-mono text-[10px] font-bold">
                        {log.threatIntel.confidence}% Confidence
                      </span>
                    </div>
                    <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
                      {log.threatIntel.details}
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-rose-400/80">
                      Feed Source: {log.threatIntel.feedSource}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 flex items-center gap-3 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-emerald-200">
                    Threat Reputation: Safe
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    No malicious indicators found across 14 synchronized threat
                    intelligence databases.
                  </div>
                </div>
              </div>
            )}

            {/* 2. Primary DNS Details Grid */}
            <div className="rounded-xl bg-[#11192e] border border-slate-800 p-4 space-y-3 font-mono text-xs">
              <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold font-mono pb-2 border-b border-slate-800">
                Resolution Parameters
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block text-[10px]">
                    Client IP
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-slate-200 font-semibold">
                      {log.clientIp}
                    </span>
                    <button
                      onClick={() => copyText(log.clientIp, "clientIp")}
                      className="text-slate-500 hover:text-white"
                    >
                      {copiedField === "clientIp" ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">
                    Device Name
                  </span>
                  <span className="text-blue-300 font-semibold mt-0.5 block">
                    {log.device}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">
                    Query Type
                  </span>
                  <span className="text-slate-200 font-semibold mt-0.5 block">
                    {log.queryType} (IN)
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">
                    Response Code
                  </span>
                  <span
                    className={`mt-0.5 font-bold block ${
                      log.responseCode === "NOERROR"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {log.responseCode}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">
                    Resolved Response
                  </span>
                  <span className="text-slate-300 mt-0.5 block truncate">
                    {log.response}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">
                    Category
                  </span>
                  <span className="text-slate-300 mt-0.5 block">
                    {log.category}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">
                    Authoritative / Edge Server
                  </span>
                  <span className="text-slate-300 mt-0.5 block truncate">
                    {log.dnsServer}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">
                    Policy Applied
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-blue-300">{log.policyApplied}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. DNS Resolution Timeline */}
            <div className="rounded-xl bg-[#11192e] border border-slate-800 p-4 space-y-3 font-mono text-xs">
              <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold pb-2 border-b border-slate-800">
                DNS Pipeline Timeline
              </h4>

              <div className="space-y-3 relative pl-4 border-l border-slate-800">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <div className="text-slate-200 font-semibold text-xs">
                    1. Ingress UDP Query Received
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    From {log.clientIp} ({log.device}) via Port 53 / DoH
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <div className="text-slate-200 font-semibold text-xs">
                    2. Cache & Threat Intel Lookup
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Queried local Redis cache & live Threat Feed index
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div
                    className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${
                      isBlocked ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                  />
                  <div className="text-slate-200 font-semibold text-xs">
                    3. Policy Enforcement Engine
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Rule matched: &quot;{log.policyApplied}&quot; → Result:{" "}
                    <span
                      className={
                        isBlocked
                          ? "text-rose-400 font-bold"
                          : "text-emerald-400 font-bold"
                      }
                    >
                      {log.action}
                    </span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <div className="text-slate-200 font-semibold text-xs">
                    4. Egress Response Delivered
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Returned {log.response} in {log.responseTimeMs} ms
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-5 border-t border-slate-800/80 bg-[#11192e] flex flex-wrap gap-2">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold border border-slate-700 transition-colors"
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
