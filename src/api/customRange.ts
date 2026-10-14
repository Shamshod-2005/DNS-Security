/**
 * Custom Date Range API Service
 * Handles historical and custom date range queries for DNS statistics and telemetry.
 */

export interface CustomRangeParams {
  startDate: string; // ISO 8601 string (e.g. "2026-09-01T00:00:00.000Z")
  endDate: string; // ISO 8601 string (e.g. "2026-09-29T23:59:59.999Z")
  resolution?: "1h" | "1d" | "1w"; // Data aggregation resolution
}

export interface CustomRangeSeriesItem {
  time: string;
  queries: number;
  blocked: number;
  allowed: number;
  bytes: number;
}

export interface CustomRangeSummary {
  totalQueries: number;
  allowedQueries: number;
  blockedQueries: number;
  maliciousQueries: number;
  totalBytes: number;
  blockedBytes: number;
}

export interface CustomRangeResponse {
  status: "success" | "error";
  data: {
    summary: CustomRangeSummary;
    series: CustomRangeSeriesItem[];
    params: CustomRangeParams;
  };
}

/**
 * Fetches DNS metrics and statistics for a user-defined custom time range.
 * @param params CustomRangeParams containing ISO 8601 startDate, endDate, and resolution.
 */
export async function fetchCustomRangeStats(
  params: CustomRangeParams,
): Promise<CustomRangeResponse> {
  console.log(
    "%c[API Request] fetchCustomRangeStats() called with parameters:",
    "color: #3b82f6; font-weight: bold;",
    params,
  );

  // TODO: CONNECT REAL BACKEND API HERE
  // Example real implementation:
  // return api.post<CustomRangeResponse>("/api/stats/custom-range", params);

  return new Promise<CustomRangeResponse>((resolve) => {
    setTimeout(() => {
      const start = new Date(params.startDate).getTime();
      const end = new Date(params.endDate).getTime();
      const diffHours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));

      const totalQueries = diffHours * 48200;
      const blockedQueries = Math.round(totalQueries * 0.085);
      const allowedQueries = totalQueries - blockedQueries;
      const maliciousQueries = blockedQueries;
      const totalBytes = totalQueries * 82;
      const blockedBytes = blockedQueries * 64;

      const mockResponse: CustomRangeResponse = {
        status: "success",
        data: {
          summary: {
            totalQueries,
            allowedQueries,
            blockedQueries,
            maliciousQueries,
            totalBytes,
            blockedBytes,
          },
          series: [
            {
              time: params.startDate,
              queries: 1250,
              blocked: 95,
              allowed: 1155,
              bytes: 102500,
            },
            {
              time: params.endDate,
              queries: 1480,
              blocked: 112,
              allowed: 1368,
              bytes: 121360,
            },
          ],
          params,
        },
      };

      console.log(
        "%c[Mock API] fetchCustomRangeStats() response resolved successfully:",
        "color: #10b981; font-weight: bold;",
        mockResponse,
      );

      resolve(mockResponse);
    }, 450);
  });
}
