import {
  ArrowUpDown,
  Check,
  Copy,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { BlockedDomainItem } from "../../../types";

interface BlockedDomainsTableProps {
  domains: BlockedDomainItem[];
  onInspectDomain: (domain: BlockedDomainItem) => void;
  onUnblockDomain?: (domainId: string, domainName: string) => void;
  onViewAllClick?: () => void;
}

export const BlockedDomainsTable: React.FC<BlockedDomainsTableProps> = ({
  domains,
  onInspectDomain,
  onViewAllClick,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortField, setSortField] = useState<"requests" | "domain">("requests");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsCategoryDropdownOpen(false);
      }
    }
    if (isCategoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCategoryDropdownOpen]);

  // Extract unique categories for filter
  const categories = useMemo(() => {
    return Array.from(new Set(domains.map((d) => d.category)));
  }, [domains]);

  // Filtering & Sorting
  const filteredDomains = useMemo(() => {
    return domains
      .filter((d) => {
        const matchesSearch = d.domain
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCategory =
          categoryFilter === "ALL" || d.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortField === "requests") {
          return sortOrder === "asc"
            ? a.requests - b.requests
            : b.requests - a.requests;
        } else {
          return sortOrder === "asc"
            ? a.domain.localeCompare(b.domain)
            : b.domain.localeCompare(a.domain);
        }
      });
  }, [domains, searchTerm, categoryFilter, sortField, sortOrder]);

  // Top 5 entries
  const topFiveDomains = filteredDomains.slice(0, 5);

  const handleSort = (field: "requests" | "domain") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDomain(text);
    setTimeout(() => setCopiedDomain(null), 1800);
  };

  return (
    <div
      id="top-blocked-domains-table"
      className="p-5 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/90 shadow-sm transition-colors"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-normal [word-spacing:0.18em]">
                {t("tables.topBlockedDomains")}
              </h3>
            </div>
          </div>
        </div>

        {onViewAllClick && (
          <button
            onClick={onViewAllClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-mono font-medium border border-slate-200 dark:border-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>{t("tables.allDomains", { count: domains.length })}</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </button>
        )}
      </div>

      {/* 3 Columns Table: DOMAIN, CATEGORY, REQUESTS */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-sm text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-mono text-xs font-semibold tracking-normal border-b border-slate-200 dark:border-slate-800/80">
            <tr className="h-10">
              <th
                className="py-2.5 px-3 w-[54%] cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleSort("domain")}
              >
                <div className="flex items-center gap-1.5">
                  <span>{t("tables.domain")}</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                </div>
              </th>
              <th className="py-2.5 px-3 w-[26%]">{t("tables.category")}</th>
              <th
                className="py-2.5 px-3 w-[20%] cursor-pointer hover:text-slate-900 dark:hover:text-white text-right"
                onClick={() => handleSort("requests")}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{t("tables.totalRequests")}</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
            {topFiveDomains.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="h-[320px] text-center text-slate-400 dark:text-slate-500 font-mono text-sm"
                >
                  No blocked domains matching your filter criteria
                </td>
              </tr>
            ) : (
              topFiveDomains.map((item) => {
                return (
                  <tr
                    key={item.id}
                    id={`blocked-domain-row-${item.id}`}
                    className="h-[64px] hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onInspectDomain(item)}
                  >
                    {/* 1. DOMAIN */}
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          title={item.domain}
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors truncate block"
                        >
                          {item.domain}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(item.domain);
                          }}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          title="Copy domain"
                        >
                          {copiedDomain === item.domain ? (
                            <Check className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* 2. CATEGORY & SHARE */}
                    <td className="py-2.5 px-3 font-mono">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          title={item.category}
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 truncate"
                        >
                          {item.category}
                        </span>
                      </div>
                    </td>

                    {/* 3. REQUESTS */}
                    <td className="py-2.5 px-3 font-mono text-right whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white text-[15px]">
                        {item.requests.toLocaleString()}{" "}
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-normal">
                          reqs
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
