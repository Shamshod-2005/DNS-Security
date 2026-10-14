import {
  ExternalLink,
  Laptop,
  Server,
  ShieldAlert,
  Smartphone,
  Users,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import type { ClientDevice } from "../../../types";

interface TopClientsSectionProps {
  clients: ClientDevice[];
  onSelectClient: (client: ClientDevice) => void;
  onViewAllClients?: () => void;
}

export const TopClientsSection: React.FC<TopClientsSectionProps> = ({
  clients,
  onSelectClient,
  onViewAllClients,
}) => {
  const { t } = useTranslation();

  // Sort by total requests descending and take top 5
  const topFiveClients = [...clients]
    .sort((a, b) => b.totalRequests - a.totalRequests)
    .slice(0, 5);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return (
          <Smartphone className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        );
      case "server":
        return <Server className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      default:
        return <Laptop className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      id="top-clients-section"
      className="p-5 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/90 shadow-sm transition-colors"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-normal [word-spacing:0.18em]">
                {t("tables.topClientEndpoints")}
              </h3>
            </div>
          </div>
        </div>

        {onViewAllClients && (
          <button
            onClick={onViewAllClients}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-mono font-medium border border-slate-200 dark:border-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>{t("tables.allDevices", { count: clients.length })}</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </button>
        )}
      </div>

      {/* 3 Columns Table: DEVICE & IP, DEPARTMENT, QUERIES & ACTIVITY */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-sm text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-mono text-xs font-semibold tracking-normal border-b border-slate-200 dark:border-slate-800/80">
            <tr className="h-10">
              <th className="py-2.5 px-3 w-[50%]">{t("tables.deviceAndIp")}</th>
              <th className="py-2.5 px-3 w-[30%]">{t("tables.department")}</th>
              <th className="py-2.5 px-3 w-[20%] text-right">
                {t("tables.totalRequests")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
            {topFiveClients.map((client) => {
              const hasMalicious = client.maliciousRequests > 0;
              const hasDistinctName =
                client.name &&
                client.name.trim() !== "" &&
                client.name !== client.ip;

              return (
                <tr
                  key={client.id}
                  id={`client-row-${client.id}`}
                  onClick={() => onSelectClient(client)}
                  className="h-[64px] hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  {/* 1. DEVICE & IP */}
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
                        {getDeviceIcon(client.deviceType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-sm text-blue-600 dark:text-blue-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors truncate block">
                          {hasDistinctName ? client.name : client.ip}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {client.ip.includes(":") ? "IPv6" : "IPv4"}
                          </span>
                          {hasDistinctName && (
                            <span className="text-[11px] truncate text-slate-400">{client.ip}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 2. TRAFFIC SHARE & SECURITY STATUS */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate">
                        {client.department}
                      </span>
                      {client.totalBytes ? (
                        <span className="text-[11px] text-slate-400 font-mono shrink-0">
                          ({formatBytes(client.totalBytes)})
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-0.5">
                      {hasMalicious ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-mono font-medium">
                          <ShieldAlert className="w-2.5 h-2.5 text-rose-500" />
                          {client.maliciousRequests} Threats
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 text-[10px] font-mono">
                          Clean
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 3. TOTAL QUERIES */}
                  <td className="py-2.5 px-3 font-mono text-right whitespace-nowrap">
                    <div className="font-semibold text-slate-900 dark:text-white text-[15px]">
                      {client.totalRequests.toLocaleString()}{" "}
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-normal">
                        reqs
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
