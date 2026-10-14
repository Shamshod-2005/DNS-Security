import React from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";

interface AccountHeaderProps {
  role?: string;
  status?: string;
}

export const AccountHeader: React.FC<AccountHeaderProps> = ({
  role,
  status,
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/80 shadow-xs overflow-hidden transition-colors">
      {/* Background Radial Glow Accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t("account.title")}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              {role || t("account.role")}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {t("account.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs font-mono text-slate-600 dark:text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>{status || t("account.status")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

