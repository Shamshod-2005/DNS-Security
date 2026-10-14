import { Loader2, LogOut, ShieldAlert, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isLoading]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden text-slate-800 dark:text-slate-200 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
      >
        {/* Top hazard glowing accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500/0 via-rose-500/80 to-rose-500/0" />

        {/* Ambient red glow in background */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors disabled:opacity-50 cursor-pointer"
          title={t("logoutModal.close", t("common.close", "Yopish"))}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 flex items-center justify-center mb-4 shadow-sm">
          <ShieldAlert className="w-6 h-6 text-rose-500 dark:text-rose-400" />
        </div>

        {/* Title & Description */}
        <h3
          id="logout-modal-title"
          className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight"
        >
          {t("logoutModal.title", t("header.logoutModalTitle", "Tizimdan chiqish"))}
        </h3>

        {/* Active Session Info Box */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          <span>
            {t(
              "logoutModal.description",
              t(
                "header.logoutModalDesc",
                "Barcha saqlanmagan o'zgarishlar yo'qolishi mumkin. Haqiqatan ham akkauntdan chiqmoqchimisiz?"
              )
            )}
          </span>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {t("logoutModal.cancel", t("common.cancel", "Bekor qilish"))}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-medium text-xs transition-all shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("logoutModal.loggingOut", "Chiqilmoqda...")}</span>
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>{t("logoutModal.confirm", t("header.logout", "Chiqish"))}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default LogoutModal;

