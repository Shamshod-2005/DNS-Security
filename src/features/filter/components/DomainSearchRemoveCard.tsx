import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Trash2,
  Undo2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Globe,
} from "lucide-react";
import type { FilterSearchResult } from "../../../api/types";
import { searchFilter } from "../../../api/filter";

interface DomainSearchRemoveCardProps {
  onRemoveDomains: (domains: string[]) => Promise<void>;
  onRefreshFilter: () => void;
}

export const DomainSearchRemoveCard: React.FC<DomainSearchRemoveCardProps> = ({
  onRemoveDomains,
  onRefreshFilter,
}) => {
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FilterSearchResult[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  // Set of domains marked for removal
  const [pendingRemove, setPendingRemove] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Debounced search effect
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setTotalMatches(0);
      setSearchError(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(false);
      try {
        const res = await searchFilter(trimmed);
        setResults(res.results || []);
        setTotalMatches(res.count || 0);
      } catch {
        setSearchError(true);
        setResults([]);
        setTotalMatches(0);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const togglePending = (domain: string) => {
    setPendingRemove((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  };

  const handleUndoAll = () => {
    setPendingRemove(new Set());
  };

  const handleSaveRemovals = async () => {
    const domains = Array.from(pendingRemove);
    if (!domains.length) return;

    setIsSaving(true);
    setFeedback(null);
    try {
      await onRemoveDomains(domains);
      setFeedback({
        type: "success",
        msg: t("filterPage.search.removeSuccess", { count: domains.length }),
      });
      setPendingRemove(new Set());
      // Re-trigger search to reflect updated DB
      if (query.trim()) {
        const res = await searchFilter(query.trim());
        setResults(res.results || []);
        setTotalMatches(res.count || 0);
      }
      onRefreshFilter();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: unknown) {
      const errObj = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      setFeedback({
        type: "error",
        msg:
          errObj.response?.data?.error ||
          errObj.message ||
          t("filterPage.common.saveError"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Sort items so pending removals sink to the bottom or stay highlighted
  const sortedResults = [...results].sort((a, b) => {
    const aP = pendingRemove.has(a.domain) ? 1 : 0;
    const bP = pendingRemove.has(b.domain) ? 1 : 0;
    return aP - bP;
  });

  return (
    <div className="rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm flex flex-col gap-4">
      {/* ── Title ── */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <Search className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {t("filterPage.search.title")}
          </h3>
        </div>
      </div>

      {/* ── Search Input ── */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("filterPage.search.placeholder")}
          className="w-full rounded-xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {isSearching && (
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {/* ── Pending Removals Action Bar ── */}
      {pendingRemove.size > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-rose-600 dark:text-rose-400">
            <span className="font-semibold">
              {t("filterPage.search.markedForRemoval")} ({pendingRemove.size}
              ):{" "}
            </span>
            <span className="font-mono">
              {Array.from(pendingRemove).join(", ")}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleUndoAll}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>{t("filterPage.search.undoAll")}</span>
            </button>
            <button
              type="button"
              onClick={handleSaveRemovals}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-sm"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>
                {t("filterPage.search.saveRemove", {
                  count: pendingRemove.size,
                })}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Feedback banner */}
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

      {/* ── Search Results List ── */}
      {query.trim() && (
        <div className="flex flex-col gap-2">
          {searchError ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0f1d] text-center text-xs text-rose-500">
              {t("filterPage.search.searchError")}
            </div>
          ) : !isSearching && results.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0f1d] text-center text-xs text-slate-500 dark:text-slate-400">
              {t("filterPage.search.noMatches")}
            </div>
          ) : (
            <>
              <div className="text-xs text-slate-500 dark:text-slate-400 px-1">
                {totalMatches} {t("filterPage.search.matches")}{" "}
                {totalMatches > results.length &&
                  t("filterPage.search.showing", { count: results.length })}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                {sortedResults.map((item) => {
                  const isPending = pendingRemove.has(item.domain);
                  return (
                    <div
                      key={item.domain}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        isPending
                          ? "bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/30 opacity-70"
                          : "bg-slate-50 dark:bg-[#0a0f1d] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-xs font-mono font-medium text-slate-900 dark:text-white truncate">
                          {item.domain}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                          {item.source}
                        </span>
                        {isPending && (
                          <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider shrink-0">
                            {t("filterPage.search.willBeRemoved")}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => togglePending(item.domain)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                          isPending
                            ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                        }`}
                      >
                        {isPending
                          ? t("filterPage.search.undo")
                          : t("filterPage.search.remove")}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
