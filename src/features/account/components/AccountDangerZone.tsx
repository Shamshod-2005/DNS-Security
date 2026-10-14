import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";

interface AccountDangerZoneProps {
  onLogout: () => void;
  isLoggingOut: boolean;
}

export const AccountDangerZone: React.FC<AccountDangerZoneProps> = ({
  onLogout,
  isLoggingOut,
}) => {
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="p-6 rounded-2xl bg-rose-500/[0.03] dark:bg-rose-950/20 border border-rose-500/20 shadow-xs space-y-4 transition-colors">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <LogOut className="w-4 h-4" />
            <span>{t("account.logoutTitle")}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            {t("account.logoutDesc")}
          </p>
        </div>

        {!showConfirm ? (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t("account.logoutButton")}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0 animate-in fade-in duration-150">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoggingOut ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <LogOut className="w-3 h-3" />
              )}
              <span>{t("common.confirm")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

