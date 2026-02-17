import { modelRouterService } from '../../modules/ai/services/ai/model-router.service';
import { pineconeService, QueryResult } from '../vector/pinecone.service';

export interface RetrievalOptions {
  topK?: number;
  minScore?: number;
  userId?: string;
  filter?: Record<string, any>;
  embeddingModel?: 'local' | 'openai' | 'cohere';
}

export interface RAGResponse {
  answer: string;
  sources: Array<{
    text: string;
    score: number;
    metadata?: Record<string, any>;
  }>;
  model: string;
}

export class RetrievalService {
  /**
   * Retrieve relevant documents for a query
   */
  async retrieve(
    query: string,
    options: RetrievalOptions = {}
  ): Promise<QueryResult[]> {
    const topK = options.topK || 10;
    const minScore = options.minScore || 0.7;
    const filter: Record<string, any> = { ...options.filter };

    // Add user filter if provided
    if (options.userId) {
      filter.userId = options.userId;
    }

    // Query Pinecone
    const results = await pineconeService.query(
      query,
      topK,
      Object.keys(filter).length > 0 ? filter : undefined,
      options.embeddingModel || 'local'
    );

    // Filter by minimum score
    return results.filter((result) => result.score >= minScore);
  }

  /**
   * RAG: Retrieve and generate answer
   */
  async retrieveAndGenerate(
    query: string,
    options: RetrievalOptions & {
      modelType?: 'vllm' | 'openrouter' | 'local';
      remoteModel?: 'gpt4' | 'claude' | 'gemini';
      useContext?: boolean;
    } = {}
  ): Promise<RAGResponse> {
    // Retrieve relevant documents
    const retrievedDocs = await this.retrieve(query, options);

    if (retrievedDocs.length === 0) {
      // No relevant documents found, generate answer without context
      const routeResult = await modelRouterService.smartRoute(
        query,
        undefined,
        {
          forceProvider: options.modelType as any,
        }
      );
      
      const response = await routeResult.model.invoke([{ role: 'user', content: query }]);

      return {
        answer: response.content.toString(),
        sources: [],
        model: routeResult.provider,
      };
    }

    // Build context from retrieved documents
    const context = retrievedDocs
      .map((doc, index) => `[${index + 1}] ${doc.text}`)
      .join('\n\n');

    // Generate answer with context
    const prompt = `Based on the following context, answer the question. If the context doesn't contain enough information, say so.

Context:
${context}

Question: ${query}

Answer:`;

    const routeResult = await modelRouterService.smartRoute(
      prompt,
      'You are a helpful assistant that answers questions based on provided context. Cite sources when possible.',
      {
        forceProvider: options.modelType as any,
      }
    );

    const response = await routeResult.model.invoke([
        {
          role: 'system',
          content:
            'You are a helpful assistant that answers questions based on provided context. Cite sources when possible.',
        },
        { role: 'user', content: prompt },
    ]);

    return {
      answer: response.content.toString(),
      sources: retrievedDocs.map((doc) => ({
        text: doc.text || '',
        score: doc.score,
        metadata: doc.metadata,
      })),
      model: routeResult.provider,
    };
  }

  /**
   * Hybrid search: Vector + keyword
   */
  async hybridSearch(
    query: string,
    options: RetrievalOptions = {}
  ): Promise<QueryResult[]> {
    // Vector search
    const vectorResults = await this.retrieve(query, options);

    // TODO: Add keyword search (MongoDB text search or Elasticsearch)
    // For now, return vector results
    return vectorResults;
  }
}

export const retrievalService = new RetrievalService();

