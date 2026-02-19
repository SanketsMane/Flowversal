/**
 * Web Search Service using Tavily API
 * Provides real-time internet search results to augment AI responses.
 * Author: Sanket
 */

import axios from 'axios';
import { logger } from '../../../../shared/utils/logger.util';

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

interface TavilyResponse {
  results: TavilySearchResult[];
  answer?: string;
  query: string;
}

export class WebSearchService {
  private readonly apiKey: string;
  private readonly enabled: boolean;

  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY || '';
    // Enable only if API key is configured
    this.enabled = !!this.apiKey;
  }

  /**
   * Detect if a user query requires real-time internet data.
   * Checks for keywords that indicate the model's training data is insufficient.
   */
  needsWebSearch(query: string): boolean {
    const lower = query.toLowerCase();
    const realTimeKeywords = [
      'latest', 'current', 'today', 'now', 'recent', 'news',
      'right now', 'this week', 'this month', 'this year',
      'live', 'update', 'trending', 'happening',
      'price of', 'stock', 'weather', 'score', 'match',
      'who won', 'who is', 'what is the latest',
      'ranking', 'standings', 'results',
    ];
    return realTimeKeywords.some((kw) => lower.includes(kw));
  }

  /**
   * Search the web using Tavily API and return formatted context string.
   * Falls back gracefully if API key is missing or request fails.
   */
  async search(query: string, maxResults: number = 5): Promise<string | null> {
    if (!this.enabled) {
      logger.warn('[WebSearch] Tavily API key not configured — skipping web search');
      return null;
    }

    try {
      const response = await axios.post<TavilyResponse>(
        'https://api.tavily.com/search',
        {
          api_key: this.apiKey,
          query,
          search_depth: 'basic',
          max_results: maxResults,
          include_answer: true,
        },
        { timeout: 10000 }
      );

      const { results, answer } = response.data;

      if (!results || results.length === 0) {
        return null;
      }

      // Build a concise context block to inject into the system prompt
      const lines: string[] = [
        `[Web Search Results for: "${query}"]`,
      ];

      if (answer) {
        lines.push(`Summary: ${answer}`);
        lines.push('');
      }

      results.slice(0, maxResults).forEach((r, i) => {
        lines.push(`${i + 1}. ${r.title}`);
        if (r.published_date) lines.push(`   Date: ${r.published_date}`);
        lines.push(`   ${r.content.slice(0, 300)}...`);
        lines.push(`   Source: ${r.url}`);
        lines.push('');
      });

      lines.push('[End of Web Search Results]');
      return lines.join('\n');
    } catch (error: any) {
      logger.error('[WebSearch] Tavily search failed', { error: error.message });
      return null;
    }
  }
}

export const webSearchService = new WebSearchService();
