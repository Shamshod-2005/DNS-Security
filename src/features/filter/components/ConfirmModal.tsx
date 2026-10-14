import React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isDanger = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const resolvedConfirmLabel = confirmLabel || t("common.confirm");
  const resolvedCancelLabel = cancelLabel || t("common.cancel");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative flex flex-col gap-4"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger
                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {title}
            </h3>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 whitespace-pre-line">
              {message}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {resolvedCancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
            } disabled:opacity-50`}
          >
            {isLoading ? "..." : resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

