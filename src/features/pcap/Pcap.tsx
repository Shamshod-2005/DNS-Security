import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle } from "lucide-react";

import {
  fetchPcapStatus,
  startPcap,
  stopPcap,
  deletePcap,
} from "../../api/pcap";
import type { PcapStartRequest } from "../../api/types";
import {
  PcapHeader,
  PcapDiskBanner,
  PcapCaptureCard,
  PcapFilesCard,
} from "./components";

export default function Pcap() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 5000);
  };

  // ── 1. Real-time Status Query with smart polling ──
  const {
    data: pcapStatus,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["pcap-status"],
    queryFn: fetchPcapStatus,
    // When active sessions are recording, poll every 1.5s for live counters; otherwise every 8s
    refetchInterval: (query) => {
      const isAnyActive = query.state.data?.active;
      return isAnyActive ? 1500 : 8000;
    },
    refetchOnWindowFocus: true,
  });

  // ── 2. Mutations ──
  const startMutation = useMutation({
    mutationFn: (req: PcapStartRequest) => startPcap(req),
    onSuccess: (data) => {
      queryClient.setQueryData(["pcap-status"], data);
      showFeedback("success", t("pcapPage.feedback.started"));
    },
    onError: (err: unknown) => {
      const errObj = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      showFeedback(
        "error",
        errObj.response?.data?.error ||
          errObj.message ||
          t("pcapPage.feedback.errorStart")
      );
    },
  });

  const stopMutation = useMutation({
    mutationFn: (type?: string) => stopPcap(type),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["pcap-status"], data);
      showFeedback(
        "success",
        variables
          ? t("pcapPage.feedback.stopped")
          : t("pcapPage.feedback.stoppedAll")
      );
    },
    onError: (err: unknown) => {
      const errObj = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      showFeedback(
        "error",
        errObj.response?.data?.error ||
          errObj.message ||
          t("pcapPage.feedback.errorStop")
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (fileName: string) => deletePcap(fileName),
    onSuccess: (data, fileName) => {
      queryClient.setQueryData(["pcap-status"], data);
      showFeedback(
        "success",
        t("pcapPage.feedback.deleted", { name: fileName })
      );
    },
    onError: (err: unknown) => {
      const errObj = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      showFeedback(
        "error",
        errObj.response?.data?.error ||
          errObj.message ||
          t("pcapPage.feedback.errorDelete")
      );
    },
  });

  const handleStart = async (req: PcapStartRequest) => {
    await startMutation.mutateAsync(req);
  };

  const handleStop = async (type: string) => {
    await stopMutation.mutateAsync(type);
  };

  const handleStopAll = async () => {
    await stopMutation.mutateAsync(undefined);
  };

  const handleDelete = async (file: string) => {
    await deleteMutation.mutateAsync(file);
  };

  const isActive = !!pcapStatus?.active;
  const activeSessionsCount = pcapStatus?.sessions?.length || 0;

  return (
    <div className="w-full flex flex-col gap-6 pb-12 animate-in fade-in-50 duration-200">
      {/* ── Page Header ── */}
      <PcapHeader
        isActive={isActive}
        activeSessionsCount={activeSessionsCount}
        isFetching={isFetching}
        isStoppingAll={stopMutation.isPending}
        onRefresh={() => refetch()}
        onStopAll={handleStopAll}
      />

      {/* ── Storage Status & Safety Limits Banner ── */}
      <PcapDiskBanner
        freeBytes={pcapStatus?.free_bytes}
        lowDisk={pcapStatus?.low_disk}
      />

      {/* ── Action Feedback Toast Banner ── */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 animate-in fade-in-50 duration-200 shadow-sm ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            )}
            <span className="font-medium">{feedback.msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-60 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Section 1: Capture Controls (3 Streams as Cards) ── */}
      <PcapCaptureCard
        sessions={pcapStatus?.sessions || []}
        lowDisk={pcapStatus?.low_disk}
        isStarting={startMutation.isPending}
        isStopping={stopMutation.isPending}
        onStart={handleStart}
        onStop={handleStop}
      />

      {/* ── Section 2: Recorded PCAP Files List ── */}
      <PcapFilesCard
        files={pcapStatus?.files || []}
        isDeleting={deleteMutation.isPending}
        isStopping={stopMutation.isPending}
        onStop={handleStop}
        onDelete={handleDelete}
      />
    </div>
  );
}
