import React from "react";
import { useTranslation } from "react-i18next";
import { HardDrive, AlertTriangle, CheckCircle2 } from "lucide-react";

interface PcapDiskBannerProps {
  freeBytes?: number;
  lowDisk?: boolean;
}

const formatBytes = (bytes?: number) => {
  if (bytes === undefined || bytes === null || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const PcapDiskBanner: React.FC<PcapDiskBannerProps> = ({
  freeBytes,
  lowDisk = false,
}) => {
  const { t } = useTranslation();
  const formattedFree = formatBytes(freeBytes);

  return (
    <div
      className={`rounded-2xl border p-4 transition-all shadow-xs ${
        lowDisk
          ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
          : "bg-white dark:bg-[#11192e] border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              lowDisk
                ? "bg-rose-500/20 text-rose-500"
                : "bg-blue-500/10 text-blue-500"
            }`}
          >
            {lowDisk ? (
              <AlertTriangle className="w-4.5 h-4.5" />
            ) : (
              <HardDrive className="w-4.5 h-4.5" />
            )}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{t("pcapPage.disk.requirement")}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lowDisk
                ? t("pcapPage.disk.lowDiskAlert", { size: formattedFree })
                : t("pcapPage.disk.freeNow", { size: formattedFree })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-semibold ${
              lowDisk
                ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            }`}
          >
            {!lowDisk && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            <span>{formattedFree}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

