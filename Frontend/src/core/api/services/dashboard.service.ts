// Dashboard/Creator Earnings Service - Fixes BUG-009
// Author: Sanket

import api from '@/shared/lib/api-client';

export interface EarningsData {
  totalEarnings: number;
  currentMonthEarnings: number;
  pendingBalance: number;
  totalUsers: number;
}

export interface TopWorkflow {
  id: string;
  name: string;
  installations: number;
  earnings: number;
}

export interface ReferralStats {
  totalReferrals: number;
  activeCreators: number;
  bonusEarned: number;
  pendingBonus: number;
}

export interface ReferralData {
  code: string;
  link: string;
  stats: ReferralStats;
}

/**
 * Dashboard Service
 * Provides API integration for creator earnings dashboard and referral system
 */
class DashboardService {
  /**
   * Get creator earnings data
   */
  async getEarnings(): Promise<{ success: boolean; data?: EarningsData; error?: string }> {
    try {
      const response = await api.get<any>('/api/v1/creator/earnings');
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error || 'Failed to fetch earnings' };
    } catch (error: any) {
      console.error('[DashboardService] Error fetching earnings:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  /**
   * Get top performing workflows
   */
  async getTopWorkflows(): Promise<{ success: boolean; data?: TopWorkflow[]; error?: string }> {
    try {
      const response = await api.get<any>('/api/v1/creator/top-workflows');
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error || 'Failed to fetch workflows' };
    } catch (error: any) {
      console.error('[DashboardService] Error fetching workflows:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  /**
   * Get referral information
   */
  async getReferralData(): Promise<{ success: boolean; data?: ReferralData; error?: string }> {
    try {
      const response = await api.get<any>('/api/v1/referrals/me');
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error || 'Failed to fetch referral data' };
    } catch (error: any) {
      console.error('[DashboardService] Error fetching referral data:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }
}

export const dashboardService = new DashboardService();
