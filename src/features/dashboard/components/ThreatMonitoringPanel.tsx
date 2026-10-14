import {
  AlertTriangle,
  Bug,
  Fish,
  Flame,
  Radio
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import type { ThreatLevel, ThreatSummary } from "../../../types";

interface ThreatMonitoringPanelProps {
  threatSummary: ThreatSummary;
  onThreatTypeClick: (type: string) => void;
  onInspectThreat: (threatData: any) => void;
}

export const ThreatMonitoringPanel: React.FC<ThreatMonitoringPanelProps> = ({
  threatSummary,
  onThreatTypeClick,
}) => {
  const { t } = useTranslation();
  const threatCategories = [
    {
      id: "malware",
      label: t("threats.malware"),
      count: threatSummary.malwareRequests,
      percentage: "43.3%",
      severity: "Critical" as ThreatLevel,
      icon: Bug,
      badgeClass:
        "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
      iconBoxClass:
        "bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400",
      hoverBorderClass: "hover:border-rose-400 dark:hover:border-rose-500/50",
      hoverTextClass:
        "group-hover:text-rose-600 dark:group-hover:text-rose-400",
      description: "Ransomware droppers, trojans & infostealers",
      sampleDomain: "malware-example.com",
    },
    {
      id: "phishing",
      label: t("threats.phishing"),
      count: threatSummary.phishingRequests,
      percentage: "28.8%",
      severity: "High" as ThreatLevel,
      icon: Fish,
      badgeClass:
        "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30",
      iconBoxClass:
        "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
      hoverBorderClass: "hover:border-blue-400 dark:hover:border-blue-500/40",
      hoverTextClass:
        "group-hover:text-blue-600 dark:group-hover:text-blue-300",
      description: "Credential harvesters & cloned identity gates",
      sampleDomain: "phishing-example.net",
    },
    {
      id: "c2",
      label: t("threats.c2"),
      count: threatSummary.c2Requests,
      percentage: "18.2%",
      severity: "Critical" as ThreatLevel,
      icon: Radio,
      badgeClass:
        "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30",
      iconBoxClass:
        "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
      hoverBorderClass: "hover:border-blue-400 dark:hover:border-blue-500/40",
      hoverTextClass:
        "group-hover:text-blue-600 dark:group-hover:text-blue-300",
      description: "Cobalt Strike beacons, botnet control channels",
      sampleDomain: "c2-beacon-relay.darknet.top",
    },
    {
      id: "suspicious",
      label: t("threats.suspicious", "Suspicious domains"),
      count: threatSummary.suspiciousDomains,
      percentage: "9.7%",
      severity: "Medium" as ThreatLevel,
      icon: AlertTriangle,
      badgeClass:
        "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30",
      iconBoxClass:
        "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
      hoverBorderClass: "hover:border-blue-400 dark:hover:border-blue-500/40",
      hoverTextClass:
        "group-hover:text-blue-600 dark:group-hover:text-blue-300",
      description: "Newly registered domains & DGA algorithmic names",
      sampleDomain: "suspicious-domain.xyz",
    },
  ];

  return (
    <div
      id="threat-monitoring-panel"
      className="p-5 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/90 shadow-sm relative overflow-hidden transition-colors"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-normal [word-spacing:0.18em]">
                {t("threats.vectorIntelligence")}
              </h3>
            </div>
          </div>
        </div>

        {/* Total threats badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {t("threats.totalBlockedEvents")}
            </span>
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
              {(threatSummary.threatCount ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Threat Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 relative z-10">
        {threatCategories.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onThreatTypeClick(item.label)}
              className={`p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 transition-all duration-200 cursor-pointer group flex flex-col justify-between hover:-translate-y-0.5 shadow-xs ${item.hoverBorderClass}`}
            >
              <div>
                {/* Header: Icon & Severity Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className={`p-2 rounded-xl border transition-transform group-hover:scale-110 ${item.iconBoxClass}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] rounded-md font-mono font-medium border ${item.badgeClass}`}
                  >
                    {item.severity}
                  </span>
                </div>

                {/* Threat Category Title & Count */}
                <div className="mt-3">
                  <h4
                    className={`text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors font-mono ${item.hoverTextClass}`}
                  >
                    {item.label}
                  </h4>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                      {item.count.toLocaleString()}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {item.percentage}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
