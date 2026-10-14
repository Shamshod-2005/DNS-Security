import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Globe,
  Lock,
  ShieldAlert,
  Play,
  Square,
  Activity,
  Layers,
  Database,
  Radio,
  ChevronDown,
  Check,
} from "lucide-react";
import type { PcapSession, PcapStartRequest } from "../../../api/types";

interface PcapCaptureCardProps {
  sessions: PcapSession[];
  lowDisk?: boolean;
  isStarting: boolean;
  isStopping: boolean;
  onStart: (req: PcapStartRequest) => Promise<void>;
  onStop: (type: string) => Promise<void>;
}

type CaptureType = "dns" | "dot" | "malicious";

interface StreamConfigState {
  sizeValue: string;
  sizeUnit: "KB" | "MB" | "GB";
  countValue: string;
  autoStop: boolean;
}

const formatBytes = (bytes?: number) => {
  if (bytes === undefined || bytes === null || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const UNIT_OPTIONS: Array<"KB" | "MB" | "GB"> = ["KB", "MB", "GB"];

interface UnitSelectProps {
  value: "KB" | "MB" | "GB";
  onChange: (value: "KB" | "MB" | "GB") => void;
  disabled?: boolean;
}

const UnitSelect: React.FC<UnitSelectProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-8.5 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer select-none ${
          isOpen
            ? "bg-blue-50 dark:bg-blue-500/15 border-blue-400 dark:border-blue-500/40 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20"
            : "bg-slate-50 hover:bg-slate-100/80 dark:bg-[#0a0f1d] dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-expanded={isOpen}
      >
        <span>{value}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-500" : "text-slate-400"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-24 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800/90 rounded-xl shadow-xl shadow-slate-900/10 dark:shadow-slate-950/60 p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-0.5">
            {UNIT_OPTIONS.map((unit) => {
              const isSelected = unit === value;
              return (
                <button
                  key={unit}
                  type="button"
                  onClick={() => {
                    onChange(unit);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-mono transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 font-semibold"
                  }`}
                >
                  <span>{unit}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const PcapCaptureCard: React.FC<PcapCaptureCardProps> = ({
  sessions,
  lowDisk = false,
  isStarting,
  isStopping,
  onStart,
  onStop,
}) => {
  const { t } = useTranslation();

  // Local state for each stream's configuration inputs
  const [configs, setConfigs] = useState<
    Record<CaptureType, StreamConfigState>
  >({
    dns: { sizeValue: "10", sizeUnit: "MB", countValue: "0", autoStop: false },
    dot: { sizeValue: "10", sizeUnit: "MB", countValue: "0", autoStop: false },
    malicious: {
      sizeValue: "10",
      sizeUnit: "MB",
      countValue: "0",
      autoStop: false,
    },
  });

  const activeSessionsMap = new Map<string, PcapSession>(
    sessions.map((s) => [s.type, s]),
  );

  const streams: Array<{
    id: CaptureType;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    colorTheme: "blue" | "indigo" | "rose";
  }> = [
    {
      id: "dns",
      title: t("pcapPage.capture.dnsTitle"),
      description: t("pcapPage.capture.dnsDesc"),
      icon: Globe,
      colorTheme: "blue",
    },
    {
      id: "dot",
      title: t("pcapPage.capture.dotTitle"),
      description: t("pcapPage.capture.dotDesc"),
      icon: Lock,
      colorTheme: "indigo",
    },
    {
      id: "malicious",
      title: t("pcapPage.capture.maliciousTitle"),
      description: t("pcapPage.capture.maliciousDesc"),
      icon: ShieldAlert,
      colorTheme: "rose",
    },
  ];

  const handleInputChange = (
    type: CaptureType,
    field: keyof StreamConfigState,
    value: unknown,
  ) => {
    setConfigs((prev) => {
      const updated = { ...prev[type], [field]: value };
      const sz = parseFloat(updated.sizeValue) || 0;
      const cnt = parseInt(updated.countValue, 10) || 0;
      // Auto stop only applies when size > 0 and count <= 0
      if (field === "countValue" && cnt > 0) {
        updated.autoStop = false;
      }
      if (field === "sizeValue" && sz <= 0) {
        updated.autoStop = false;
      }
      return { ...prev, [type]: updated };
    });
  };

  const handleStartCapture = async (type: CaptureType) => {
    const cfg = configs[type];
    const sizeVal = parseFloat(cfg.sizeValue) || 0;
    const countVal = parseInt(cfg.countValue, 10) || 0;

    await onStart({
      types: [
        {
          type,
          size_value: sizeVal,
          size_unit: cfg.sizeUnit,
          count: countVal,
          auto_stop: cfg.autoStop,
        },
      ],
    });
  };

  const getRotationModeLabel = (session: PcapSession) => {
    if (session.size_limit <= 0) return t("pcapPage.capture.modeSingle");
    if (session.count_limit === 1) return t("pcapPage.capture.modeAutoStop");
    if (session.count_limit > 0)
      return `${session.file_index}/${session.count_limit}`;
    return t("pcapPage.capture.modeRotate");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
            <span>{t("pcapPage.capture.title")}</span>
          </h2>
        </div>
      </div>

      {/* ── 3 Modern Stream Capture Cards Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {streams.map((stream) => {
          const Icon = stream.icon;
          const session = activeSessionsMap.get(stream.id);
          const isRecording = !!session;
          const cfg = configs[stream.id];
          const sz = parseFloat(cfg.sizeValue) || 0;
          const cnt = parseInt(cfg.countValue, 10) || 0;
          const canAutoStop = sz > 0 && cnt <= 0;

          return (
            <div
              key={stream.id}
              className={`relative rounded-2xl bg-white dark:bg-[#11192e] border p-5 shadow-sm transition-all flex flex-col justify-between gap-5 ${
                isRecording
                  ? "border-rose-500/40 ring-1 ring-rose-500/20 shadow-rose-500/5"
                  : "border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {/* Header & Status Indicator */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isRecording
                        ? "bg-rose-500/10 text-rose-500"
                        : stream.colorTheme === "blue"
                          ? "bg-blue-500/10 text-blue-500"
                          : stream.colorTheme === "indigo"
                            ? "bg-indigo-500/10 text-indigo-500"
                            : "bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {stream.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {stream.description}
                    </p>
                  </div>
                </div>

                {/* {isRecording ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>{t("pcapPage.status.recording")}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                    <span>
                      {lowDisk
                        ? t("pcapPage.status.lowDisk")
                        : t("pcapPage.status.idle")}
                    </span>
                  </span>
                  
                )} */}
              </div>

              {/* Body: Live telemetry or Configuration inputs */}
              {isRecording ? (
                <div className="rounded-xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-200/80 dark:border-slate-800/80 p-3.5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-blue-500" />
                      <span>Packets</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {session.packets.toLocaleString()}{" "}
                      {t("pcapPage.capture.pktUnit")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Volume</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatBytes(session.cur_bytes)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mode</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {getRotationModeLabel(session)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Size per file */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {t("pcapPage.capture.sizePerFile")}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {t("pcapPage.capture.sizeHint")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={10240}
                        value={cfg.sizeValue}
                        onChange={(e) =>
                          handleInputChange(
                            stream.id,
                            "sizeValue",
                            e.target.value,
                          )
                        }
                        placeholder="10"
                        className="w-full h-8.5 rounded-xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 px-3 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <UnitSelect
                        value={cfg.sizeUnit}
                        onChange={(val) =>
                          handleInputChange(stream.id, "sizeUnit", val)
                        }
                      />
                    </div>
                  </div>

                  {/* Number of files */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {t("pcapPage.capture.numFiles")}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {t("pcapPage.capture.numHint")}
                      </span>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      value={cfg.countValue}
                      onChange={(e) =>
                        handleInputChange(
                          stream.id,
                          "countValue",
                          e.target.value,
                        )
                      }
                      placeholder="0"
                      className="w-full h-8.5 rounded-xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 px-3 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  {/* Auto stop checkbox */}
                  <label
                    className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
                      canAutoStop
                        ? "bg-slate-50 dark:bg-[#0a0f1d] border-slate-200 dark:border-slate-800 cursor-pointer"
                        : "bg-slate-50/50 dark:bg-slate-900/40 border-transparent opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {t("pcapPage.capture.autoStop")}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {t("pcapPage.capture.autoStopHint")}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={cfg.autoStop}
                      disabled={!canAutoStop}
                      onChange={(e) =>
                        handleInputChange(
                          stream.id,
                          "autoStop",
                          e.target.checked,
                        )
                      }
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                    />
                  </label>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                {isRecording ? (
                  <button
                    type="button"
                    onClick={() => onStop(stream.id)}
                    disabled={isStopping}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {isStopping ? "..." : t("pcapPage.capture.stop")}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartCapture(stream.id)}
                    disabled={isStarting || lowDisk}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {isStarting ? "..." : t("pcapPage.capture.start")}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
