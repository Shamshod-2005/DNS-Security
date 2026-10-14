import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  PlusCircle,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  manualDomainsSchema,
  type ManualDomainsFormData,
} from "../../../schemas/filter.schema";
import type { FilterManualResponse } from "../../../api/types";

interface AddDomainsCardProps {
  onUploadFile: (file: File) => Promise<FilterManualResponse>;
  onAddManual: (text: string) => Promise<FilterManualResponse>;
  onRefreshFilter: () => void;
}

export const AddDomainsCard: React.FC<AddDomainsCardProps> = ({
  onUploadFile,
  onAddManual,
  onRefreshFilter,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Manual form hook
  const {
    register,
    handleSubmit,
    reset: resetManualForm,
    formState: { errors, isSubmitting },
  } = useForm<ManualDomainsFormData>({
    resolver: zodResolver(manualDomainsSchema),
    defaultValues: { text: "" },
  });

  const [manualFeedback, setManualFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const formatSummary = (d: FilterManualResponse, isUpload: boolean) => {
    const dup = d.duplicates
      ? t("filterPage.upload.skippedDuplicates", { count: d.duplicates })
      : "";
    const res = d.restored
      ? t("filterPage.upload.restored", { count: d.restored })
      : "";
    if (d.added === 0) {
      return t("filterPage.upload.allExist", {
        dup,
        res,
        total: d.total_domains,
      });
    }
    const templateKey = isUpload
      ? "filterPage.upload.uploadedSummary"
      : "filterPage.manual.addedSummary";
    return t(templateKey, {
      added: d.added,
      dup,
      res,
      total: d.total_domains,
    });
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadFeedback(null);
    try {
      const res = await onUploadFile(selectedFile);
      setSelectedFile(null);
      setUploadFeedback({
        type: "success",
        msg: formatSummary(res, true),
      });
      onRefreshFilter();
      setTimeout(() => setUploadFeedback(null), 6000);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } }; message?: string };
      setUploadFeedback({
        type: "error",
        msg: errObj.response?.data?.error || errObj.message || t("filterPage.upload.error"),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onManualSubmit = async (data: ManualDomainsFormData) => {
    setManualFeedback(null);
    try {
      const res = await onAddManual(data.text);
      setManualFeedback({
        type: "success",
        msg: formatSummary(res, false),
      });
      resetManualForm();
      onRefreshFilter();
      setTimeout(() => setManualFeedback(null), 6000);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } }; message?: string };
      setManualFeedback({
        type: "error",
        msg: errObj.response?.data?.error || errObj.message || t("filterPage.manual.error"),
      });
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm flex flex-col gap-4">
      {/* ── Sub-Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "upload"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{t("filterPage.upload.title")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "manual"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{t("filterPage.manual.title")}</span>
        </button>
      </div>

      {/* ── Upload Tab Content ── */}
      {activeTab === "upload" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("filterPage.upload.hint")} (.txt yoki .csv)
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="file"
              accept=".txt,.csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 cursor-pointer"
            />
            <button
              type="button"
              disabled={!selectedFile || isUploading}
              onClick={handleUploadSubmit}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-sm shrink-0"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{t("filterPage.upload.uploadBtn")}</span>
            </button>
          </div>

          {uploadFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                uploadFeedback.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              }`}
            >
              {uploadFeedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{uploadFeedback.msg}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Manual Add Tab Content ── */}
      {activeTab === "manual" && (
        <form onSubmit={handleSubmit(onManualSubmit)} className="flex flex-col gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("filterPage.manual.hint")}
          </p>

          <textarea
            {...register("text")}
            rows={5}
            disabled={isSubmitting}
            placeholder={t("filterPage.manual.placeholder")}
            className="w-full rounded-xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 p-3 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
          />

          {errors.text && (
            <span className="text-xs text-rose-500">{errors.text.message}</span>
          )}

          {manualFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                manualFeedback.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              }`}
            >
              {manualFeedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{manualFeedback.msg}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{t("filterPage.manual.saveBtn")}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

