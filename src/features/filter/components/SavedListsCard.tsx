import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
} from "lucide-react";
import type { FilterFile, SettingsResponse } from "../../../api/types";
import { getFilterDownloadUrl } from "../../../api/filter";
import { ConfirmModal } from "./ConfirmModal";

const PAGE_SIZE = 6;

interface SavedListsCardProps {
  files?: FilterFile[];
  settings?: SettingsResponse;
  isLoading?: boolean;
  onUpdateSubdomains: (enabled: boolean) => Promise<void>;
  onDeleteFile: (name: string) => Promise<void>;
  onRefreshFilter: () => void;
}

export const SavedListsCard: React.FC<SavedListsCardProps> = ({
  files = [],
  settings,
  isLoading = false,
  onUpdateSubdomains,
  onDeleteFile,
  onRefreshFilter,
}) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);

  // Subdomain match state
  const matchSubdomains = !!settings?.match_subdomains;
  const [isUpdatingSubdomains, setIsUpdatingSubdomains] = useState(false);

  // File delete state
  const [fileToDelete, setFileToDelete] = useState<FilterFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const totalPages = Math.max(1, Math.ceil(files.length / PAGE_SIZE));
  const currentFiles = files.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleToggleSubdomains = async () => {
    setIsUpdatingSubdomains(true);
    try {
      await onUpdateSubdomains(!matchSubdomains);
    } catch {
      // Ignored or handled by parent
    } finally {
      setIsUpdatingSubdomains(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    setFeedback(null);
    try {
      await onDeleteFile(fileToDelete.name);
      setFeedback({
        type: "success",
        msg: t("filterPage.savedLists.deleteSuccess", { name: fileToDelete.name }),
      });
      setFileToDelete(null);
      onRefreshFilter();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } }; message?: string };
      setFeedback({
        type: "error",
        msg: errObj.response?.data?.error || errObj.message || t("filterPage.savedLists.deleteError"),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/80 p-5 widescreen:p-6 shadow-sm flex flex-col gap-4">
      {/* ── Header with Subdomains Toggle ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base widescreen:text-lg font-semibold text-slate-900 dark:text-white">
              {t("filterPage.savedLists.title")}
            </h3>
            <span className="text-xs widescreen:text-sm text-slate-500 dark:text-slate-400">
              {t("filterPage.savedLists.totalLists", { count: files.length })}
            </span>
          </div>
        </div>

        {/* Match subdomains toggle */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#0a0f1d] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-right">
            <div className="text-xs widescreen:text-sm font-semibold text-slate-900 dark:text-white">
              {t("filterPage.savedLists.matchSubdomains")}
            </div>
            <div className="text-[11px] widescreen:text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {t("filterPage.savedLists.matchSubdomainsDesc")}
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={matchSubdomains}
            disabled={isLoading || isUpdatingSubdomains}
            onClick={handleToggleSubdomains}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              matchSubdomains ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                matchSubdomains ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
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

      {/* ── Files List ── */}
      {files.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
          {t("filterPage.savedLists.noLists")}
        </div>
      ) : (
        <div className="space-y-2">
          {currentFiles.map((file) => {
            const hasRemovals = file.active < file.count;
            return (
              <div
                key={file.name}
                className="p-3 widescreen:p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start gap-2.5 overflow-hidden">
                  <FileText className="w-4 h-4 widescreen:w-5 widescreen:h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-xs widescreen:text-sm font-mono font-medium text-slate-900 dark:text-white truncate">
                      {file.name}
                    </div>
                    <div className="text-[11px] widescreen:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {hasRemovals ? (
                        <>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {file.active.toLocaleString()}
                          </span>{" "}
                          {t("filterPage.savedLists.activeOf", {
                            total: file.count.toLocaleString(),
                          })}{" "}
                          <span className="text-rose-500">
                            (
                            {t("filterPage.savedLists.removed", {
                              count: (file.count - file.active).toLocaleString(),
                            })}
                            )
                          </span>
                        </>
                      ) : (
                        <span>
                          {t("filterPage.savedLists.domains", {
                            count: file.count.toLocaleString(),
                          })}
                        </span>
                      )}
                      {" · "}
                      <span>{formatBytes(file.size)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <a
                    href={getFilterDownloadUrl(file.name)}
                    className="flex items-center gap-1 px-2.5 widescreen:px-3 py-1.5 widescreen:py-2 rounded-lg text-xs widescreen:text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 widescreen:w-4 widescreen:h-4" />
                    <span>{t("filterPage.savedLists.download")}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setFileToDelete(file)}
                    className="flex items-center gap-1 px-2.5 widescreen:px-3 py-1.5 widescreen:py-2 rounded-lg text-xs widescreen:text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 widescreen:w-4 widescreen:h-4" />
                    <span>{t("filterPage.savedLists.delete")}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {files.length > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {t("filterPage.savedLists.pageInfo", {
              current: currentPage + 1,
              total: totalPages,
            })}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 0}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmModal
        isOpen={!!fileToDelete}
        title={t("filterPage.savedLists.deleteModalTitle")}
        message={
          fileToDelete
            ? t("filterPage.savedLists.deleteModalMsg", {
                name: fileToDelete.name,
                count: fileToDelete.active.toLocaleString(),
              })
            : ""
        }
        confirmLabel={t("filterPage.savedLists.delete")}
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setFileToDelete(null)}
      />
    </div>
  );
};

