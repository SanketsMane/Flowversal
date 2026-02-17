import { handleApiResponse } from '../../../shared/utils/error-handler';
import { buildApiUrl, getAuthHeaders } from '../api.config';

export interface AnalyticsSummaryResponse {
  success: boolean;
  summary: Array<{
    icon?: any;
    label: string;
    value: string;
    change: string;
    color: string;
  }>;
}

export interface UsageOverviewResponse {
  success: boolean;
  data: {
    workflows: number;
    aiAgents: number;
    executions: number;
    projects: number;
    teamMembers: number;
    totalExecutions: number;
    storage: number;
  };
}

/**
 * Fetch dashboard summary stats
 */
export async function fetchAnalyticsSummary(): Promise<AnalyticsSummaryResponse['summary']> {
  const res = await fetch(buildApiUrl('/analytics/summary'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
  });

  await handleApiResponse(res);
  const data: AnalyticsSummaryResponse = await res.json();
  return data.summary;
}

/**
 * Fetch usage overview for subscription modal
 */
export async function fetchUsageOverview(): Promise<UsageOverviewResponse['data']> {
  const res = await fetch(buildApiUrl('/analytics/usage'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
  });

  await handleApiResponse(res);
  const data: UsageOverviewResponse = await res.json();
  return data.data;
}
