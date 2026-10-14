import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { EncDnsResponse } from "../../../api/types";

interface EncryptedDnsCardProps {
  data?: EncDnsResponse;
  isLoading?: boolean;
  isSaving?: boolean;
  onSave: (payload: { domains: string; ips: string }) => Promise<void>;
}

export const EncryptedDnsCard: React.FC<EncryptedDnsCardProps> = ({
  data,
  isLoading = false,
  isSaving = false,
  onSave,
}) => {
  const { t } = useTranslation();
  const [domains, setDomains] = useState("");
  const [ips, setIps] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    if (data) {
      setDomains(data.domains || "");
      setIps(data.ips || "");
    }
  }, [data]);

  const domainCount = domains
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#")).length;

  const ipCount = ips
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#")).length;

  const handleSave = async () => {
    setFeedback(null);
    try {
      await onSave({ domains, ips });
      setFeedback({ type: "success", msg: t("filterPage.encdns.saveSuccess") });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } }; message?: string };
      const msg = errObj.response?.data?.error || errObj.message || t("filterPage.common.saveError");
      setFeedback({ type: "error", msg });
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {t("filterPage.encdns.title")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t("filterPage.encdns.hint")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Resolver Names */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="enc-domains-input"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
            >
              {t("filterPage.encdns.resolverNames")}
            </label>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {domainCount} {t("filterPage.common.countUnit")}
            </span>
          </div>
          <textarea
            id="enc-domains-input"
            rows={8}
            spellCheck={false}
            disabled={isLoading || isSaving}
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
            placeholder="dns.google&#10;cloudflare-dns.com"
            className="w-full rounded-xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 p-3 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
          />
        </div>

        {/* Resolver Addresses */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="enc-ips-input"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
            >
              {t("filterPage.encdns.resolverIps")}
            </label>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {ipCount} {t("filterPage.common.countUnit")}
            </span>
          </div>
          <textarea
            id="enc-ips-input"
            rows={8}
            spellCheck={false}
            disabled={isLoading || isSaving}
            value={ips}
            onChange={(e) => setIps(e.target.value)}
            placeholder="1.1.1.1&#10;8.8.8.8/32"
            className="w-full rounded-xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 p-3 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
          />
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading || isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{t("filterPage.encdns.saveLists")}</span>
        </button>
      </div>
    </div>
  );
};

