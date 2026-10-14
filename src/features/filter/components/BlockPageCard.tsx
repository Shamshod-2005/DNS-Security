import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Globe,
  Upload,
  Eye,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  FileCode,
} from "lucide-react";
import type { BlockPageResponse, SettingsResponse } from "../../../api/types";
import { BLOCKPAGE_URLS } from "../../../api/blockpage";
import { ConfirmModal } from "./ConfirmModal";

interface BlockPageCardProps {
  settings?: SettingsResponse;
  blockPageInfo?: BlockPageResponse;
  isLoading?: boolean;
  onSaveSinkhole: (payload: {
    sinkhole: number;
    sinkhole_ip: string;
    block_action: number;
    redirect_url: string;
    sinkhole_https: number;
  }) => Promise<void>;
  onUploadHtml: (file: File) => Promise<{ warnings?: string[] }>;
  onResetBlockPage: () => Promise<void>;
}

export const BlockPageCard: React.FC<BlockPageCardProps> = ({
  settings,
  blockPageInfo,
  isLoading = false,
  onSaveSinkhole,
  onUploadHtml,
  onResetBlockPage,
}) => {
  const { t } = useTranslation();

  // Sinkhole configuration state
  const [sinkhole, setSinkhole] = useState(false);
  const [sinkholeIp, setSinkholeIp] = useState("198.51.100.1");
  const [blockAction, setBlockAction] = useState<"0" | "1">("0");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [sinkholeHttps, setSinkholeHttps] = useState(false);

  // Status and feedback
  const [isSavingSinkhole, setIsSavingSinkhole] = useState(false);
  const [sinkholeFeedback, setSinkholeFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{
    type: "success" | "error" | "warn";
    msg: string;
  } | null>(null);

  // Reset modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (settings) {
      setSinkhole(!!settings.sinkhole);
      setSinkholeIp(settings.sinkhole_ip || "198.51.100.1");
      setBlockAction(settings.block_action === 1 ? "1" : "0");
      setRedirectUrl(settings.redirect_url || "");
      setSinkholeHttps(!!settings.sinkhole_https);
    }
  }, [settings]);

  const handleApplySinkhole = async () => {
    setSinkholeFeedback(null);
    setIsSavingSinkhole(true);
    try {
      await onSaveSinkhole({
        sinkhole: sinkhole ? 1 : 0,
        sinkhole_ip: sinkholeIp.trim() || "198.51.100.1",
        block_action: blockAction === "1" ? 1 : 0,
        redirect_url: redirectUrl.trim(),
        sinkhole_https: sinkholeHttps ? 1 : 0,
      });
      setSinkholeFeedback({ type: "success", msg: t("filterPage.common.saved") });
      setTimeout(() => setSinkholeFeedback(null), 4000);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } }; message?: string };
      setSinkholeFeedback({
        type: "error",
        msg: errObj.response?.data?.error || errObj.message || t("filterPage.common.saveError"),
      });
    } finally {
      setIsSavingSinkhole(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadFeedback(null);
    setIsUploading(true);
    try {
      const res = await onUploadHtml(selectedFile);
      setSelectedFile(null);
      const warn = (res?.warnings || []).join(" ");
      setUploadFeedback({
        type: warn ? "warn" : "success",
        msg: warn ? `${t("filterPage.blockpage.uploadSuccess")} (${warn})` : t("filterPage.blockpage.uploadSuccess"),
      });
      setTimeout(() => setUploadFeedback(null), 5000);
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

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await onResetBlockPage();
      setIsResetModalOpen(false);
      setUploadFeedback({
        type: "success",
        msg: t("filterPage.blockpage.resetSuccess"),
      });
      setTimeout(() => setUploadFeedback(null), 4000);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } }; message?: string };
      setUploadFeedback({
        type: "error",
        msg: errObj.response?.data?.error || errObj.message || t("filterPage.common.saveError"),
      });
    } finally {
      setIsResetting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm flex flex-col gap-5">
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
          <Globe className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {t("filterPage.blockpage.title")}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("filterPage.blockpage.hint")}
          </p>
        </div>
      </div>

      {/* ── Main Sinkhole Switch ── */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {t("filterPage.blockpage.showBlockPage")}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("filterPage.blockpage.sinkholeDesc")}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={sinkhole}
          disabled={isLoading || isSavingSinkhole}
          onClick={() => setSinkhole(!sinkhole)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            sinkhole ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              sinkhole ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* ── Sinkhole Configuration Inputs ── */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-300 ${
          sinkhole ? "opacity-100 pointer-events-auto" : "opacity-40 pointer-events-none"
        }`}
      >
        {/* Sinkhole IP */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="sinkhole-ip-input"
            className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
          >
            {t("filterPage.blockpage.sinkholeIp")}
          </label>
          <input
            id="sinkhole-ip-input"
            type="text"
            disabled={!sinkhole || isLoading || isSavingSinkhole}
            value={sinkholeIp}
            onChange={(e) => setSinkholeIp(e.target.value)}
            placeholder="198.51.100.1"
            className="w-full rounded-xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {t("filterPage.blockpage.sinkholeIpHint")}
          </span>
        </div>

        {/* What to serve */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="block-action-select"
            className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
          >
            {t("filterPage.blockpage.whatToServe")}
          </label>
          <select
            id="block-action-select"
            disabled={!sinkhole || isLoading || isSavingSinkhole}
            value={blockAction}
            onChange={(e) => setBlockAction(e.target.value as "0" | "1")}
            className="w-full rounded-xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="0">{t("filterPage.blockpage.actionPage")}</option>
            <option value="1">{t("filterPage.blockpage.actionRedirect")}</option>
          </select>
        </div>

        {/* Redirect URL (Visible if blockAction === '1') */}
        {blockAction === "1" && (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label
              htmlFor="redirect-url-input"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
            >
              {t("filterPage.blockpage.redirectTo")}
            </label>
            <input
              id="redirect-url-input"
              type="text"
              disabled={!sinkhole || isLoading || isSavingSinkhole}
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              placeholder="https://safe-domain.example.com/"
              className="w-full rounded-xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        )}

        {/* Also Answer HTTPS */}
        <div className="flex items-center justify-between sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-xs font-medium text-slate-900 dark:text-white">
              {t("filterPage.blockpage.alsoHttps")}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {t("filterPage.blockpage.httpsDesc")}
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={sinkholeHttps}
            disabled={!sinkhole || isLoading || isSavingSinkhole}
            onClick={() => setSinkholeHttps(!sinkholeHttps)}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              sinkholeHttps ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                sinkholeHttps ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* CA Download hint */}
      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
        <a
          href={BLOCKPAGE_URLS.ca}
          className="text-blue-500 hover:text-blue-600 underline font-medium"
        >
          {t("filterPage.blockpage.downloadCa")}
        </a>
        <span>{t("filterPage.blockpage.caHint")}</span>
      </div>

      {/* Apply Button & Sinkhole Feedback */}
      {sinkholeFeedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            sinkholeFeedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
          }`}
        >
          {sinkholeFeedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{sinkholeFeedback.msg}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleApplySinkhole}
          disabled={isLoading || isSavingSinkhole}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20"
        >
          {isSavingSinkhole ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Globe className="w-4 h-4" />
          )}
          <span>{t("filterPage.blockpage.apply")}</span>
        </button>
      </div>

      {/* ── Page Design Section ── */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-500" />
              <span>{t("filterPage.blockpage.pageDesign")}</span>
            </h4>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {blockPageInfo ? (
                <>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {blockPageInfo.custom
                      ? t("filterPage.blockpage.customPage")
                      : t("filterPage.blockpage.defaultPage")}
                  </span>
                  {" · "}
                  <span>{formatBytes(blockPageInfo.size)}</span>
                  {blockPageInfo.updated && (
                    <span> · {blockPageInfo.updated} {t("filterPage.blockpage.updated")}</span>
                  )}
                  {!blockPageInfo.has_marker && (
                    <span className="text-amber-500 font-medium">
                      {" "}
                      {t("filterPage.blockpage.noMarkerWarning")}
                    </span>
                  )}
                </>
              ) : (
                t("filterPage.blockpage.loadingInfo")
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("filterPage.blockpage.designHint")}
        </p>

        {/* File upload row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="file"
            accept=".html,.htm,text/html"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 cursor-pointer"
          />
          <button
            type="button"
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-sm"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>{t("filterPage.blockpage.uploadPage")}</span>
          </button>
        </div>

        {uploadFeedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              uploadFeedback.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : uploadFeedback.type === "warn"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
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

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <a
            href={BLOCKPAGE_URLS.preview}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t("filterPage.blockpage.preview")}</span>
          </a>

          <a
            href={BLOCKPAGE_URLS.download}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t("filterPage.blockpage.downloadCurrent")}</span>
          </a>

          <button
            type="button"
            disabled={!blockPageInfo?.custom || isResetting}
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t("filterPage.blockpage.restoreDefault")}</span>
          </button>
        </div>
      </div>

      {/* Confirmation modal for Resetting block page */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title={t("filterPage.blockpage.resetModalTitle")}
        message={t("filterPage.blockpage.resetModalMsg")}
        confirmLabel={t("filterPage.blockpage.resetConfirm")}
        isDanger={true}
        isLoading={isResetting}
        onConfirm={handleReset}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};

