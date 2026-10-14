import React from "react";
import { useTranslation } from "react-i18next";
import { ShieldAlert } from "lucide-react";

export const AccountSecurityAdvice: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4 transition-colors">
      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
        <ShieldAlert className="w-4 h-4 text-blue-500" />
        <span>{t("account.securityAdviceTitle")}</span>
      </div>

      <ul className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
        <li className="flex items-start gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
          <span>{t("account.securityAdvice1")}</span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
          <span>{t("account.securityAdvice2")}</span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
          <span>{t("account.securityAdvice3")}</span>
        </li>
      </ul>
    </div>
  );
};

