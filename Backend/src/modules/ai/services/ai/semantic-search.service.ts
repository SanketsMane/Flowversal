import { retrievalService } from '../../../../services/rag/retrieval.service';

export interface SemanticSearchOptions {
  topK?: number;
  minScore?: number;
  userId?: string;
  filter?: Record<string, any>;
  embeddingModel?: 'local' | 'openai' | 'cohere';
}

export interface SemanticSearchResult {
  id: string;
  text: string;
  score: number;
  metadata?: Record<string, any>;
}

export class SemanticSearchService {
  /**
   * Perform semantic search
   */
  async search(
    query: string,
    options: SemanticSearchOptions = {}
  ): Promise<SemanticSearchResult[]> {
    const results = await retrievalService.retrieve(query, options);

    return results.map((result: any) => ({
      id: result.id,
      text: result.text || '',
      score: result.score,
      metadata: result.metadata,
    }));
  }

  /**
   * Search with relevance filtering
   */
  async searchWithRelevance(
    query: string,
    relevanceThreshold: number = 0.7,
    options: SemanticSearchOptions = {}
  ): Promise<SemanticSearchResult[]> {
    const results = await this.search(query, {
      ...options,
      minScore: relevanceThreshold,
    });

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Rank search results
   */
  rankResults(
    results: SemanticSearchResult[],
    _query: string
  ): SemanticSearchResult[] {
    // Simple ranking: sort by score
    // Can be enhanced with more sophisticated ranking algorithms
    return results.sort((a, b) => b.score - a.score);
  }
}

export const semanticSearchService = new SemanticSearchService();

