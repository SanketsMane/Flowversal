import { pineconeService, VectorDocument } from '../vector/pinecone.service';

export interface DocumentChunk {
  id: string;
  text: string;
  chunkIndex: number;
  metadata?: Record<string, any>;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  userId: string;
  source?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class DocumentService {
  /**
   * Chunk text into smaller pieces for embedding
   */
  chunkText(
    text: string,
    chunkSize: number = 1000,
    chunkOverlap: number = 200
  ): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end);
      chunks.push(chunk);
      start = end - chunkOverlap;
    }

    return chunks;
  }

  /**
   * Process and store document in vector database
   */
  async processDocument(
    document: Document,
    embeddingModel: 'local' | 'openai' | 'cohere' = 'local'
  ): Promise<void> {
    // Chunk the document
    const chunks = this.chunkText(document.content);

    // Create vector documents
    const vectorDocuments: VectorDocument[] = chunks.map((chunk, index) => ({
      id: `${document.id}-chunk-${index}`,
      text: chunk,
      metadata: {
        documentId: document.id,
        title: document.title,
        chunkIndex: index,
        userId: document.userId,
        source: document.source || 'unknown',
        ...document.metadata,
      },
    }));

    // Upsert to Pinecone
    await pineconeService.upsertDocuments(vectorDocuments, embeddingModel);
  }

  /**
   * Delete document from vector database
   */
  async deleteDocument(documentId: string): Promise<void> {
    await pineconeService.deleteByFilter({
      documentId: documentId,
    });
  }

  /**
   * Update document in vector database
   */
  async updateDocument(
    document: Document,
    embeddingModel: 'local' | 'openai' | 'cohere' = 'local'
  ): Promise<void> {
    // Delete old chunks
    await this.deleteDocument(document.id);

    // Process new document
    await this.processDocument(document, embeddingModel);
  }

  /**
   * Get document chunks
   */
  async getDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
    const results = await pineconeService.query('', 1000, {
      documentId: documentId,
    });

    return results
      .map((result) => ({
        id: result.id,
        text: result.text || '',
        chunkIndex: (result.metadata?.chunkIndex as number) || 0,
        metadata: result.metadata,
      }))
      .sort((a, b) => a.chunkIndex - b.chunkIndex);
  }
}

export const documentService = new DocumentService();

