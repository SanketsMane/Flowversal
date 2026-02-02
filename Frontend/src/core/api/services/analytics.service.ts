import { buildApiUrl, getAuthHeaders } from '../api.config';
import { handleApiResponse } from '../../../shared/utils/error-handler';

export interface AnalyticsSummaryResponse {
  summary: {
    users: { total: number };
    workflows: { total: number };
    executions: {
      total: number;
      successful: number;
      failed: number;
      successRate: number;
      last30d: number;
      avgDurationMs: number;
    };
  };
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummaryResponse['summary']> {
  const res = await fetch(buildApiUrl('/analytics/summary'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  await handleApiResponse(res);
  const data: AnalyticsSummaryResponse = await res.json();
  return data.summary;
}

