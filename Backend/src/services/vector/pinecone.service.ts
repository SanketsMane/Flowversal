import { getPineconeIndex } from '../../core/database/pinecone';
import { embeddingService } from './embedding.service';

export interface VectorMetadata {
  [key: string]: string | number | boolean;
}

export interface VectorDocument {
  id: string;
  text: string;
  metadata?: VectorMetadata;
}

export interface QueryResult {
  id: string;
  score: number;
  metadata?: VectorMetadata;
  text?: string;
}

export class PineconeService {
  /**
   * Upsert vectors to Pinecone
   */
  async upsertVectors(
    vectors: Array<{ id: string; values: number[]; metadata?: VectorMetadata }>
  ): Promise<void> {
    const index = getPineconeIndex();

    try {
      await index.upsert(vectors);
    } catch (error: any) {
      throw new Error(`Pinecone upsert failed: ${error.message}`);
    }
  }

  /**
   * Upsert documents (automatically generates embeddings)
   */
  async upsertDocuments(
    documents: VectorDocument[],
    embeddingModel: 'local' | 'openai' | 'cohere' = 'local'
  ): Promise<void> {
    // Generate embeddings for all documents
    const texts = documents.map((doc) => doc.text);
    const embeddings = await embeddingService.generateEmbeddings(texts, { model: embeddingModel });

    // Prepare vectors for Pinecone
    const vectors = documents.map((doc, index) => ({
      id: doc.id,
      values: embeddings[index],
      metadata: {
        text: doc.text,
        ...doc.metadata,
      },
    }));

    await this.upsertVectors(vectors);
  }

  /**
   * Query similar vectors
   */
  async query(
    queryText: string,
    topK: number = 10,
    filter?: Record<string, any>,
    embeddingModel: 'local' | 'openai' | 'cohere' = 'local'
  ): Promise<QueryResult[]> {
    const index = getPineconeIndex();

    // Generate embedding for query
    const queryEmbedding = await embeddingService.generateEmbedding(queryText, {
      model: embeddingModel,
    });

    try {
      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
        filter: filter,
      });

      return (queryResponse.matches || []).map((match: any) => ({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata,
        text: match.metadata?.text,
      }));
    } catch (error: any) {
      throw new Error(`Pinecone query failed: ${error.message}`);
    }
  }

  /**
   * Delete vectors by IDs
   */
  async deleteVectors(ids: string[]): Promise<void> {
    const index = getPineconeIndex();

    try {
      await index.deleteMany(ids);
    } catch (error: any) {
      throw new Error(`Pinecone delete failed: ${error.message}`);
    }
  }

  /**
   * Delete vectors by metadata filter
   */
  async deleteByFilter(filter: Record<string, any>): Promise<void> {
    const index = getPineconeIndex();

    try {
      await index.deleteMany(filter);
    } catch (error: any) {
      throw new Error(`Pinecone delete by filter failed: ${error.message}`);
    }
  }

  /**
   * Get index stats
   */
  async getStats(): Promise<any> {
    const index = getPineconeIndex();

    try {
      const stats = await index.describeIndexStats();
      return stats;
    } catch (error: any) {
      throw new Error(`Failed to get Pinecone stats: ${error.message}`);
    }
  }
}

export const pineconeService = new PineconeService();

