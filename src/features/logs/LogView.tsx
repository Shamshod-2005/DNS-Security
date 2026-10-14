import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchLogs } from "../../api/logs";
import type { LogsParams } from "../../api/types";
import { DnsRequestsView } from "./components/DnsRequestsView";
import type { LogRangeValue } from "./components/LogTimeRangeBar";
import {
  type LogFilterState,
  EMPTY_FILTER,
} from "./components/LogFilterBar";
import type { CustomRangeParams } from "../../api/customRange";
import { isoWithOffset } from "../../lib/format";
import { usePageVisibility } from "../../hooks/usePageVisibility";

interface LogViewProps {
  title: string;
  params: { malicious?: 0 | 1; dot?: 0 | 1 };
  hideDomain?: boolean;
  showRule?: boolean;
}

const PAGE_SIZE = 25;

export default function LogView({
  title,
  params,
  hideDomain,
  showRule,
}: LogViewProps) {
  const [range, setRange] = useState<LogRangeValue>("live");
  const [customRangeParams, setCustomRangeParams] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [filter, setFilter] = useState<LogFilterState>(EMPTY_FILTER);
  const [page, setPage] = useState(0);

  const [searchParams] = useSearchParams();
  const searchParam =
    searchParams.get("search") || searchParams.get("domain") || "";

  useEffect(() => {
    if (searchParam) {
      setFilter((prev) => ({ ...prev, search: searchParam }));
      setPage(0);
    }
  }, [searchParam]);

  const handleFilterChange = (newFilter: LogFilterState) => {
    setFilter(newFilter);
    setPage(0);
  };

  const isLive = range === "live";

  // Smart resolution of search input:
  // If user typed digits/dots/colons (e.g. 192.168.1.1 or 10.0), search src_ip
  // Otherwise search domain
  const trimmedSearch = filter.search.trim();
  const isIpSearch = /^[\d.:]+$/.test(trimmedSearch);

  const finalDomain =
    !hideDomain && trimmedSearch && !isIpSearch ? trimmedSearch : undefined;
  const finalSrcIp =
    filter.src_ip.trim() || (isIpSearch && trimmedSearch ? trimmedSearch : undefined);

  const queryParams: LogsParams = {
    ...params,
    range,
    start:
      range === "custom" && customRangeParams?.startDate
        ? isoWithOffset(customRangeParams.startDate)
        : undefined,
    finish:
      range === "custom" && customRangeParams?.endDate
        ? isoWithOffset(customRangeParams.endDate)
        : undefined,
    page: isLive ? undefined : page,
    page_size: PAGE_SIZE,
    src_ip: finalSrcIp,
    dst_ip: filter.dst_ip.trim() || undefined,
    src_port: filter.src_port ? Number(filter.src_port) : undefined,
    dst_port: filter.dst_port ? Number(filter.dst_port) : undefined,
    domain: finalDomain,
    protocol: filter.protocol !== "All" ? filter.protocol : undefined,
  };

  const isTabVisible = usePageVisibility();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["logs", queryParams],
    queryFn: () => fetchLogs(queryParams),
    refetchInterval: isLive && isTabVisible ? 2000 : false,
    refetchIntervalInBackground: false,
  });

  const handleRangeChange = (r: LogRangeValue) => {
    setRange(r);
    setPage(0);
  };

  const handleCustomRangeApply = (p: CustomRangeParams) => {
    setRange("custom");
    setCustomRangeParams({
      startDate: p.startDate,
      endDate: p.endDate,
    });
    setPage(0);
  };

  const total = data?.total ?? null;
  const totalPages = total !== null ? Math.ceil(total / PAGE_SIZE) : 0;

  const hasActiveFilters =
    Boolean(filter.search) ||
    Boolean(filter.src_ip) ||
    Boolean(filter.dst_ip) ||
    Boolean(filter.src_port) ||
    Boolean(filter.dst_port) ||
    filter.protocol !== "All";

  return (
    <DnsRequestsView
      title={title}
      rows={data?.rows ?? []}
      total={total}
      isLoading={isLoading}
      isFetching={isFetching}
      onRefresh={() => refetch()}
      currentRange={range}
      onRangeChange={handleRangeChange}
      customRangeParams={customRangeParams}
      onCustomRangeApply={handleCustomRangeApply}
      filter={filter}
      onFilterChange={handleFilterChange}
      hasActiveFilters={hasActiveFilters}
      hideDomain={hideDomain}
      showRule={showRule}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  );
}
