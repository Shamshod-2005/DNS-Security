import React, { useState, useMemo } from "react";
import type { Region } from "../../../../types/region";
import { Search, ArrowUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RegionTableProps {
  regions: Region[];
  selectedRegionId: string | null;
  onSelectRegion: (region: Region) => void;
  statusFilter: string;
}

export const RegionTable: React.FC<RegionTableProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
  statusFilter,
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"name" | "servers" | "latency" | "availability">("servers");
  const [sortAsc, setSortAsc] = useState(false);

  const filteredRegions = useMemo(() => {
    return regions
      .filter((r) => {
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        const name =
          currentLang === "uz" ? r.nameUz : currentLang === "ru" ? r.nameRu : r.nameEn;
        const matchesSearch =
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.code.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === "name") {
          diff = a.code.localeCompare(b.code);
        } else if (sortField === "servers") {
          diff = a.dnsServers - b.dnsServers;
        } else if (sortField === "latency") {
          diff = a.avgResponseMs - b.avgResponseMs;
        } else if (sortField === "availability") {
          diff = a.availability - b.availability;
        }
        return sortAsc ? diff : -diff;
      });
  }, [regions, statusFilter, searchTerm, sortField, sortAsc, currentLang]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search region or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="overflow-x-auto max-h-72 border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left font-mono text-xs">
          <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900/90 backdrop-blur-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none">
            <tr>
              <th
                onClick={() => toggleSort("name")}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Region</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-2">Status</th>
              <th
                onClick={() => toggleSort("servers")}
                className="py-2.5 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Servers</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort("latency")}
                className="py-2.5 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Latency</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort("availability")}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Uptime</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredRegions.map((r) => {
              const isSelected = selectedRegionId === r.id || selectedRegionId === r.code;
              const name =
                currentLang === "uz" ? r.nameUz : currentLang === "ru" ? r.nameRu : r.nameEn;

              const statusColor = {
                healthy: "bg-emerald-500",
                warning: "bg-amber-500",
                critical: "bg-rose-500",
                offline: "bg-slate-400",
              }[r.status];

              return (
                <tr
                  key={r.id}
                  onClick={() => onSelectRegion(r)}
                  className={`cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "border-l-[3px] border-l-blue-500 bg-blue-500/10 dark:bg-blue-500/15 font-semibold text-blue-600 dark:text-blue-400 shadow-[inset_4px_0_12px_rgba(59,130,246,0.12)]"
                      : "border-l-[3px] border-l-transparent hover:border-l-slate-400/50 dark:hover:border-l-slate-600/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                        {r.code}
                      </span>
                      <span className="truncate max-w-[130px]">{name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        {(r.status === "critical" || r.status === "warning") && (
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColor}`}></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${statusColor}`}></span>
                      </span>
                      <span className="capitalize text-[11px]">{r.status}</span>
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right">{r.dnsServers}</td>
                  <td className="py-2 px-2 text-right font-medium">
                    {r.avgResponseMs} ms
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-500 font-medium">
                    {r.availability}%
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
