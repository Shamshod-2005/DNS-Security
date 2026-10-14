import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Download,
  Trash2,
  Square,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  FolderArchive,
} from "lucide-react";
import type { PcapFile } from "../../../api/types";
import { getPcapDownloadUrl } from "../../../api/pcap";
import { ConfirmModal } from "../../filter/components/ConfirmModal";

interface PcapFilesCardProps {
  files: PcapFile[];
  isDeleting: boolean;
  isStopping: boolean;
  onStop: (type: string) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
}

const PAGE_SIZE = 10;

const formatBytes = (bytes?: number) => {
  if (bytes === undefined || bytes === null || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const PcapFilesCard: React.FC<PcapFilesCardProps> = ({
  files,
  isDeleting,
  isStopping,
  onStop,
  onDelete,
}) => {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [fileToDelete, setFileToDelete] = useState<PcapFile | null>(null);

  // Filtered files
  const filteredFiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return files;
    return files.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q) ||
        f.time.toLowerCase().includes(q)
    );
  }, [files, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages - 1);
  const pageFiles = filteredFiles.slice(
    safeCurrentPage * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE + PAGE_SIZE
  );

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    await onDelete(fileToDelete.name);
    setFileToDelete(null);
  };

  const getTypeBadgeStyle = (typeKey: string) => {
    switch (typeKey) {
      case "dns":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "dot":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case "malicious":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/80 p-5 widescreen:p-6 shadow-sm flex flex-col gap-4">
      {/* ── Header with Title, Search & Info ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <FolderArchive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base widescreen:text-lg font-semibold text-slate-900 dark:text-white">
              {t("pcapPage.files.title")}
            </h3>
            <span className="text-xs widescreen:text-sm text-slate-500 dark:text-slate-400">
              {t("pcapPage.files.subtitle", { count: files.length })}
            </span>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64 widescreen:sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
            placeholder="Search .pcap files..."
            className="w-full pl-9 pr-3 py-1.5 widescreen:py-2 rounded-xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 text-xs widescreen:text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* ── Table view of files ── */}
      {filteredFiles.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
          <FileText className="w-10 h-10 stroke-[1.25] text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t("pcapPage.files.empty")}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs widescreen:text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold uppercase text-[10px] widescreen:text-xs tracking-wider">
                <th className="pb-3 widescreen:pb-3.5 pr-4">{t("pcapPage.files.fileName")}</th>
                <th className="pb-3 widescreen:pb-3.5 px-3">{t("pcapPage.files.streamType")}</th>
                <th className="pb-3 widescreen:pb-3.5 px-3">{t("pcapPage.files.fileSize")}</th>
                <th className="pb-3 widescreen:pb-3.5 px-3">{t("pcapPage.files.fileStatus")}</th>
                <th className="pb-3 widescreen:pb-3.5 px-3">{t("pcapPage.files.time")}</th>
                <th className="pb-3 widescreen:pb-3.5 pl-3 text-right">{t("pcapPage.files.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {pageFiles.map((file) => {
                const isInterrupted = file.name.includes("--interrupted");

                return (
                  <tr
                    key={file.name}
                    className="hover:bg-slate-50/70 dark:hover:bg-[#0a0f1d]/50 transition-colors group"
                  >
                    {/* File name */}
                    <td className="py-3 widescreen:py-3.5 pr-4 font-mono font-medium text-slate-900 dark:text-white truncate max-w-[280px] widescreen:max-w-[400px]">
                      <div className="flex items-center gap-2">
                        {file.recording && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                        )}
                        <span className="truncate" title={file.name}>
                          {file.name}
                        </span>
                      </div>
                    </td>

                    {/* Stream Type */}
                    <td className="py-3 widescreen:py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[11px] widescreen:text-xs font-semibold border ${getTypeBadgeStyle(
                          file.type_key
                        )}`}
                      >
                        {file.type}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="py-3 widescreen:py-3.5 px-3 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatBytes(file.bytes)}
                    </td>

                    {/* Status */}
                    <td className="py-3 widescreen:py-3.5 px-3 whitespace-nowrap">
                      {file.recording ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] widescreen:text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{t("pcapPage.status.recording")}</span>
                        </span>
                      ) : isInterrupted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] widescreen:text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{t("pcapPage.status.interrupted")}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] widescreen:text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t("pcapPage.status.ready")}</span>
                        </span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 widescreen:py-3.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px] widescreen:text-xs whitespace-nowrap">
                      {file.time}
                    </td>

                    {/* Actions */}
                    <td className="py-3 widescreen:py-3.5 pl-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={getPcapDownloadUrl(file.name)}
                          download={file.name}
                          className="inline-flex items-center gap-1 px-2.5 widescreen:px-3 py-1.5 widescreen:py-2 rounded-lg text-xs widescreen:text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
                          title="Download PCAP file"
                        >
                          <Download className="w-3.5 h-3.5 widescreen:w-4 widescreen:h-4" />
                          <span>{t("pcapPage.files.download")}</span>
                        </a>

                        {file.recording ? (
                          <button
                            type="button"
                            onClick={() => onStop(file.type_key)}
                            disabled={isStopping}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
                            title="Stop capture"
                          >
                            <Square className="w-3.5 h-3.5 fill-current" />
                            <span>{t("pcapPage.capture.stop")}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setFileToDelete(file)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
                            title="Delete PCAP file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t("pcapPage.files.delete")}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {filteredFiles.length > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {t("pcapPage.files.pageInfo", {
              current: safeCurrentPage + 1,
              total: totalPages,
            })}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safeCurrentPage <= 0}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={safeCurrentPage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmModal
        isOpen={!!fileToDelete}
        title={t("pcapPage.files.deleteModalTitle")}
        message={
          fileToDelete
            ? t("pcapPage.files.deleteModalPrompt", {
                name: fileToDelete.name,
              })
            : ""
        }
        confirmLabel={t("pcapPage.files.delete")}
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setFileToDelete(null)}
      />
    </div>
  );
};

