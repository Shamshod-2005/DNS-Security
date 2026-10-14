import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  ShieldCheck,
  Check,
  Copy,
  AlertCircle,
  Fingerprint,
  Sparkles,
} from "lucide-react";
import type { AuthMeResponse } from "../../../api/types";

interface AccountProfileCardProps {
  user?: AuthMeResponse;
  isLoading: boolean;
}

export const AccountProfileCard: React.FC<AccountProfileCardProps> = ({
  user,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopyUsername = () => {
    if (user?.username) {
      navigator.clipboard.writeText(user.username);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const username = user?.username ?? "admin";
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="p-6 widescreen:p-8 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-5 transition-colors">
      <div className="flex items-center gap-4">
        {/* Avatar with gradient and online status indicator */}
        <div className="relative">
          <div className="w-16 h-16 widescreen:w-20 widescreen:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white text-2xl widescreen:text-3xl font-bold shadow-lg shadow-blue-500/20 uppercase select-none">
            {initial}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#11192e] flex items-center justify-center p-0.5">
            <div className="w-full h-full rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Username and SecOps badge */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg widescreen:text-xl font-bold text-slate-900 dark:text-white truncate font-mono">
              {isLoading ? "..." : username}
            </h3>
            <button
              type="button"
              onClick={handleCopyUsername}
              title="Copy username"
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <p className="text-xs widescreen:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
            <Fingerprint className="w-3.5 h-3.5 text-blue-500" />
            {t("account.secopsAccess")}
          </p>
        </div>
      </div>

      {/* Password change required warning banner if flagged */}
      {user?.must_change && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">
              {t("account.passwordChangeRequired")}
            </span>
            <span>
              {t("account.passwordChangeWarning")}
            </span>
          </div>
        </div>
      )}

      {/* Session attributes */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3 text-xs">
        <div className="flex items-center justify-between py-1 text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-mono">
            <User className="w-3.5 h-3.5" />
            {t("account.user")}
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
            {username}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t("account.accessLevel")}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-semibold border border-blue-500/20">
            {t("account.rootAdmin")}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            {t("account.authentication")}
          </span>
          <span className="text-slate-700 dark:text-slate-300 font-mono font-medium">
            {t("account.cookieSession")}
          </span>
        </div>
      </div>
    </div>
  );
};

