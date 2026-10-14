import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { History, AlertTriangle, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { RetentionResponse } from "../../../api/types";
import { ConfirmModal } from "./ConfirmModal";

interface LogRetentionCardProps {
  retention?: RetentionResponse;
  isLoading?: boolean;
  onSaveRetention: (payload: {
    normal: { enabled: boolean; days: number };
    dot: { enabled: boolean; days: number };
    malicious: { enabled: boolean; days: number };
  }) => Promise<void>;
}

export const LogRetentionCard: React.FC<LogRetentionCardProps> = ({
  retention,
  isLoading = false,
  onSaveRetention,
}) => {
  const { t } = useTranslation();

  const [normalEn, setNormalEn] = useState(false);
  const [normalDays, setNormalDays] = useState<number | "">("");

  const [dotEn, setDotEn] = useState(false);
  const [dotDays, setDotDays] = useState<number | "">("");

  const [maliciousEn, setMaliciousEn] = useState(false);
  const [maliciousDays, setMaliciousDays] = useState<number | "">("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    if (retention) {
      setNormalEn(!!retention.normal?.enabled);
      setNormalDays(retention.normal?.days || "");

      setDotEn(!!retention.dot?.enabled);
      setDotDays(retention.dot?.days || "");

      setMaliciousEn(!!retention.malicious?.enabled);
      setMaliciousDays(retention.malicious?.days || "");
    }
  }, [retention]);

  const handleValidateAndOpenModal = () => {
    setFeedback(null);
    if (normalEn && (!normalDays || Number(normalDays) <= 0)) {
      setFeedback({ type: "error", msg: t("filterPage.retention.normalError") });
      return;
    }
    if (dotEn && (!dotDays || Number(dotDays) <= 0)) {
      setFeedback({ type: "error", msg: t("filterPage.retention.dotError") });
      return;
    }
    if (maliciousEn && (!maliciousDays || Number(maliciousDays) <= 0)) {
      setFeedback({ type: "error", msg: t("filterPage.retention.maliciousError") });
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsApplying(true);
    try {
      await onSaveRetention({
        normal: { enabled: normalEn, days: Number(normalDays) || 0 },
        dot: { enabled: dotEn, days: Number(dotDays) || 0 },
        malicious: { enabled: maliciousEn, days: Number(maliciousDays) || 0 },
      });
      setIsModalOpen(false);
      setFeedback({ type: "success", msg: t("filterPage.retention.saveSuccess") });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } }; message?: string };
      setFeedback({
        type: "error",
        msg: errObj.response?.data?.error || errObj.message || t("filterPage.common.saveError"),
      });
    } finally {
      setIsApplying(false);
    }
  };

  const getConfirmationMessage = () => {
    const lines: string[] = [];
    if (normalEn) lines.push(`• ${t("filterPage.retention.normalDns")}: ${t("filterPage.retention.keepDays", { days: normalDays })}`);
    if (dotEn) lines.push(`• ${t("filterPage.retention.dotDns")}: ${t("filterPage.retention.keepDays", { days: dotDays })}`);
    if (maliciousEn) lines.push(`• ${t("filterPage.retention.maliciousDns")}: ${t("filterPage.retention.keepDays", { days: maliciousDays })}`);

    return (
      <div>
        <p className="mb-2">{t("filterPage.retention.modalPrompt")}</p>
        <ul className="list-disc pl-5 mb-2 font-mono text-xs">
          {lines.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
        <p className="font-semibold text-rose-500">
          {t("filterPage.retention.modalWarning")}
        </p>
      </div>
    );
  };

  const rows = [
    {
      id: "normal",
      label: t("filterPage.retention.normalDns"),
      description: t("filterPage.retention.normalDesc"),
      enabled: normalEn,
      setEnabled: setNormalEn,
      days: normalDays,
      setDays: setNormalDays,
    },
    {
      id: "dot",
      label: t("filterPage.retention.dotDns"),
      description: t("filterPage.retention.dotDesc"),
      enabled: dotEn,
      setEnabled: setDotEn,
      days: dotDays,
      setDays: setDotDays,
    },
    {
      id: "malicious",
      label: t("filterPage.retention.maliciousDns"),
      description: t("filterPage.retention.maliciousDesc"),
      enabled: maliciousEn,
      setEnabled: setMaliciousEn,
      days: maliciousDays,
      setDays: setMaliciousDays,
    },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <History className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {t("filterPage.retention.title")}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("filterPage.retention.hint")}
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {rows.map((row) => (
          <div
            key={row.id}
            className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={row.enabled}
                disabled={isLoading || isApplying}
                onClick={() => row.setEnabled(!row.enabled)}
                className={`mt-0.5 relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  row.enabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    row.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {row.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {row.description}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-8 sm:pl-0">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t("filterPage.retention.keepLast")}
              </span>
              <input
                type="number"
                min={1}
                max={3650}
                disabled={!row.enabled || isLoading || isApplying}
                value={row.days}
                onChange={(e) =>
                  row.setDays(e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))
                }
                placeholder="30"
                className="w-16 rounded-xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs text-center font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 transition-all"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t("filterPage.retention.days")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>{t("filterPage.retention.warning")}</span>
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

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleValidateAndOpenModal}
          disabled={isLoading || isApplying}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
        >
          {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{t("filterPage.retention.apply")}</span>
        </button>
      </div>

      {/* Retention apply confirm modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        title={t("filterPage.retention.modalTitle")}
        message={getConfirmationMessage()}
        confirmLabel={t("filterPage.retention.modalConfirm")}
        isDanger={true}
        isLoading={isApplying}
        onConfirm={handleConfirmSave}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};

