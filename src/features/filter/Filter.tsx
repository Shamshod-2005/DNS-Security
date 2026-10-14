import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  ListFilter,
  Sliders,
  Globe,
  History,
} from "lucide-react";

import {
  fetchFilter,
  uploadFilterFile,
  addManualDomains,
  removeFilterDomains,
  deleteFilterFile,
} from "../../api/filter";
import {
  fetchSettings,
  updateSettings,
  fetchEncDns,
  updateEncDns,
  fetchRetention,
  updateRetention,
} from "../../api/settings";
import {
  fetchBlockPage,
  uploadBlockPage,
  resetBlockPage,
} from "../../api/blockpage";

import {
  FilterKpiCards,
  TrafficControlsCard,
  EncryptedDnsCard,
  BlockPageCard,
  LogRetentionCard,
  DomainSearchRemoveCard,
  AddDomainsCard,
  SavedListsCard,
} from "./components";

type FilterTab = "blocklist" | "traffic" | "blockpage" | "retention";

export default function Filter() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<FilterTab>("blocklist");

  // ── 1. Data Fetching Queries ──
  const {
    data: filterData,
    isLoading: isFilterLoading,
    isFetching: isFilterFetching,
    refetch: refetchFilter,
  } = useQuery({
    queryKey: ["filter"],
    queryFn: fetchFilter,
  });

  const {
    data: settingsData,
    isLoading: isSettingsLoading,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const {
    data: encDnsData,
    isLoading: isEncDnsLoading,
    refetch: refetchEncDns,
  } = useQuery({
    queryKey: ["encdns"],
    queryFn: fetchEncDns,
  });

  const {
    data: blockPageData,
    isLoading: isBlockPageLoading,
    refetch: refetchBlockPage,
  } = useQuery({
    queryKey: ["blockpage"],
    queryFn: fetchBlockPage,
  });

  const {
    data: retentionData,
    isLoading: isRetentionLoading,
    refetch: refetchRetention,
  } = useQuery({
    queryKey: ["retention"],
    queryFn: fetchRetention,
  });

  // ── 2. Mutations ──
  const settingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], data);
    },
  });

  const encDnsMutation = useMutation({
    mutationFn: updateEncDns,
    onSuccess: (data) => {
      queryClient.setQueryData(["encdns"], data);
    },
  });

  const retentionMutation = useMutation({
    mutationFn: updateRetention,
    onSuccess: (data) => {
      queryClient.setQueryData(["retention"], data);
    },
  });

  const handleRefreshAll = () => {
    refetchFilter();
    refetchSettings();
    refetchEncDns();
    refetchBlockPage();
    refetchRetention();
  };

  const tabs: {
    id: FilterTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
  }[] = [
    {
      id: "blocklist",
      label: t("filterPage.tabs.blocklist"),
      icon: ListFilter,
      badge: filterData?.total_domains
        ? `${filterData.total_domains.toLocaleString()}`
        : undefined,
    },
    {
      id: "traffic",
      label: t("filterPage.tabs.traffic"),
      icon: Sliders,
    },
    {
      id: "blockpage",
      label: t("filterPage.tabs.blockpage"),
      icon: Globe,
    },
    {
      id: "retention",
      label: t("filterPage.tabs.retention"),
      icon: History,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* ── Page Header matching Dashboard & QueryLog layout ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 relative z-20 transition-colors">
        {/* Glow accent contained in its own overflow-hidden layer */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-normal [word-spacing:0.18em]">
              {t("filterPage.title")}
            </h1>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start xl:self-auto relative z-10 shrink-0">
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isFilterFetching}
            className="h-9 px-3.5 inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white text-xs font-mono font-medium transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-blue-500 ${isFilterFetching ? "animate-spin" : ""}`}
            />
            <span>{t("filterPage.refresh")}</span>
          </button>
        </div>
      </div>

      {/* ── Top KPI Overview ── */}
      <FilterKpiCards
        totalDomains={filterData?.total_domains}
        blockedTotal={filterData?.blocked_total}
        blockedSince={filterData?.blocked_since}
        isLoading={isFilterLoading}
      />

      {/* ── Modern Enterprise Navigation Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-1 ring-blue-500/30"
                  : "bg-white dark:bg-[#11192e] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content Views ── */}
      <div className="w-full">
        {/* ── TAB 1: BLOCKLIST MANAGEMENT ── */}
        {activeTab === "blocklist" && (
          <div className="flex flex-col gap-6 animate-in fade-in-50 duration-200">
            {/* Search & batch remove */}
            <DomainSearchRemoveCard
              onRemoveDomains={async (domains) => {
                await removeFilterDomains(domains);
                refetchFilter();
              }}
              onRefreshFilter={refetchFilter}
            />

            {/* Add / Upload domains */}
            <AddDomainsCard
              onUploadFile={uploadFilterFile}
              onAddManual={addManualDomains}
              onRefreshFilter={refetchFilter}
            />

            {/* Saved lists table */}
            <SavedListsCard
              files={filterData?.files}
              settings={settingsData}
              isLoading={isFilterLoading}
              onUpdateSubdomains={async (val) => {
                await settingsMutation.mutateAsync({
                  match_subdomains: val ? 1 : 0,
                });
              }}
              onDeleteFile={async (name) => {
                await deleteFilterFile(name);
                refetchFilter();
              }}
              onRefreshFilter={refetchFilter}
            />
          </div>
        )}

        {/* ── TAB 2: TRAFFIC CONTROLS & ENCRYPTED DNS ── */}
        {activeTab === "traffic" && (
          <div className="flex flex-col gap-6 animate-in fade-in-50 duration-200">
            <TrafficControlsCard
              settings={settingsData}
              isLoading={isSettingsLoading}
              isUpdating={settingsMutation.isPending}
              onUpdate={(key, val) =>
                settingsMutation.mutateAsync({ [key]: val })
              }
            />

            <EncryptedDnsCard
              data={encDnsData}
              isLoading={isEncDnsLoading}
              isSaving={encDnsMutation.isPending}
              onSave={async (payload) => {
                await encDnsMutation.mutateAsync(payload);
              }}
            />
          </div>
        )}

        {/* ── TAB 3: BLOCK PAGE (DNS SINKHOLE) ── */}
        {activeTab === "blockpage" && (
          <div className="flex flex-col gap-6 animate-in fade-in-50 duration-200">
            <BlockPageCard
              settings={settingsData}
              blockPageInfo={blockPageData}
              isLoading={isSettingsLoading || isBlockPageLoading}
              onSaveSinkhole={async (payload) => {
                await settingsMutation.mutateAsync(payload);
              }}
              onUploadHtml={async (file) => {
                const res = await uploadBlockPage(file);
                queryClient.setQueryData(["blockpage"], res);
                return res;
              }}
              onResetBlockPage={async () => {
                const res = await resetBlockPage();
                queryClient.setQueryData(["blockpage"], res);
              }}
            />
          </div>
        )}

        {/* ── TAB 4: LOG RETENTION ── */}
        {activeTab === "retention" && (
          <div className="flex flex-col gap-6 animate-in fade-in-50 duration-200">
            <LogRetentionCard
              retention={retentionData}
              isLoading={isRetentionLoading}
              onSaveRetention={async (payload) => {
                await retentionMutation.mutateAsync(payload);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
