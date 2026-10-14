import React from "react";
import type { LogRow } from "../../../api/types";
import { LogHeader, type LogCustomRangeParams } from "./LogHeader";
import type { LogRangeValue } from "./LogTimeRangeBar";
import { LogFilterBar, type LogFilterState } from "./LogFilterBar";
import { LogTable } from "./LogTable";
import type { CustomRangeParams } from "../../../api/customRange";

interface DnsRequestsViewProps {
  title: string;
  rows: LogRow[];
  total: number | null;
  isLoading: boolean;
  isFetching: boolean;
  onRefresh: () => void;
  // Range
  currentRange: LogRangeValue;
  onRangeChange: (range: LogRangeValue) => void;
  customRangeParams?: LogCustomRangeParams | null;
  onCustomRangeApply?: (params: CustomRangeParams) => void;
  // Filter state
  filter: LogFilterState;
  onFilterChange: (newFilter: LogFilterState) => void;
  hasActiveFilters: boolean;
  hideDomain?: boolean;
  showRule?: boolean;
  // Pagination
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const DnsRequestsView: React.FC<DnsRequestsViewProps> = ({
  title,
  rows,
  total,
  isLoading,
  isFetching,
  onRefresh,
  currentRange,
  onRangeChange,
  customRangeParams,
  onCustomRangeApply,
  filter,
  onFilterChange,
  hasActiveFilters,
  hideDomain,
  showRule,
  page,
  totalPages,
  onPageChange,
}) => {
  const isLive = currentRange === "live";

  return (
    <div
      className="pb-12 space-y-6 max-w-full min-h-[calc(100vh-6.5rem)] flex-1 flex flex-col"
      id="dns-requests-view"
    >
      {/* 1. Header with Live Telemetry, Time Range Dropdown, & Refresh Button */}
      <LogHeader
        title={title}
        isLive={isLive}
        hasActiveFilters={hasActiveFilters}
        isFetching={isFetching}
        onRefresh={onRefresh}
        currentRange={currentRange}
        onRangeChange={onRangeChange}
        customRangeParams={customRangeParams}
        onCustomRangeApply={onCustomRangeApply}
      />

      {/* Sections Container */}
      <div className="space-y-6 flex-1 flex flex-col">
        {/* 2. Universal Smart Search & Filter Toolbar */}
        <LogFilterBar
          filter={filter}
          onFilterChange={onFilterChange}
          hideDomain={hideDomain}
        />

        {/* 3. Main Telemetry Table Card & Pagination */}
        <LogTable
          rows={rows}
          total={total}
          totalPages={totalPages}
          page={page}
          isLive={isLive}
          isLoading={isLoading}
          hideDomain={hideDomain}
          showRule={showRule}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

