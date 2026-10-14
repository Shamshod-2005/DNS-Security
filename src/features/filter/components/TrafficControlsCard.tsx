import React from "react";
import { useTranslation } from "react-i18next";
import { Shield, Lock, Globe, AlertCircle, Loader2 } from "lucide-react";
import type { SettingsResponse } from "../../../api/types";

interface TrafficControlsCardProps {
  settings?: SettingsResponse;
  isLoading?: boolean;
  isUpdating?: boolean;
  onUpdate: (key: keyof SettingsResponse, value: number) => void;
}

export const TrafficControlsCard: React.FC<TrafficControlsCardProps> = ({
  settings,
  isLoading = false,
  isUpdating = false,
  onUpdate,
}) => {
  const { t } = useTranslation();

  const controls = [
    {
      key: "block_malicious" as keyof SettingsResponse,
      label: t("filterPage.traffic.blockMalicious"),
      description: t("filterPage.traffic.blockMaliciousDesc"),
      icon: Shield,
      checked: !!settings?.block_malicious,
      activeColor: "bg-rose-600",
    },
    {
      key: "block_dot" as keyof SettingsResponse,
      label: t("filterPage.traffic.blockDot"),
      description: t("filterPage.traffic.blockDotDesc"),
      icon: Lock,
      checked: !!settings?.block_dot,
      activeColor: "bg-blue-600",
    },
    {
      key: "block_doh" as keyof SettingsResponse,
      label: t("filterPage.traffic.blockDoh"),
      description: t("filterPage.traffic.blockDohDesc"),
      icon: Globe,
      checked: !!settings?.block_doh,
      activeColor: "bg-blue-600",
    },
    {
      key: "block_empty" as keyof SettingsResponse,
      label: t("filterPage.traffic.blockEmpty"),
      description: t("filterPage.traffic.blockEmptyDesc"),
      icon: AlertCircle,
      checked: !!settings?.block_empty,
      activeColor: "bg-amber-600",
    },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          {t("filterPage.traffic.title")}
        </h3>
        {isUpdating && (
          <div className="flex items-center gap-1.5 text-xs text-blue-500 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>{t("filterPage.common.saving")}</span>
          </div>
        )}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {controls.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>

              {/* Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={item.checked}
                disabled={isLoading || isUpdating}
                onClick={() => onUpdate(item.key, item.checked ? 0 : 1)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  item.checked ? item.activeColor : "bg-slate-300 dark:bg-slate-700"
                } disabled:opacity-50`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    item.checked ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

