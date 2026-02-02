/**
 * Pinecone Vector Database Integration
 * Handles vector storage and semantic search for RAG
 */

import { Pinecone } from 'npm:@pinecone-database/pinecone';

// Initialize Pinecone client
let pineconeClient: Pinecone | null = null;
let indexName: string | null = null;

/**
 * Initialize Pinecone client (lazy loading)
 */
async function initPinecone() {
  if (pineconeClient) {
    return { client: pineconeClient, indexName: indexName! };
  }

  const apiKey = Deno.env.get('PINECONE_API_KEY');
  
  if (!apiKey) {
    throw new Error('PINECONE_API_KEY environment variable is not set');
  }

  // Initialize Pinecone with modern API (no environment needed)
  pineconeClient = new Pinecone({
    apiKey: apiKey,
  });

  // Use a default index name or from env
  indexName = Deno.env.get('PINECONE_INDEX_NAME') || 'flowversal-vectors';

  console.log(`Pinecone initialized with index: ${indexName}`);

  return { client: pineconeClient, indexName: indexName };
}

/**
 * Ensure index exists, create if needed
 */
export async function ensureIndex() {
  try {
    const { client, indexName: idxName } = await initPinecone();
    
    // List existing indexes
    const indexes = await client.listIndexes();
    const indexExists = indexes.indexes?.some((idx: any) => idx.name === idxName);

    if (!indexExists) {
      console.log(`Creating Pinecone index: ${idxName}`);
      
      // Create index with 1536 dimensions (OpenAI ada-002 embedding size)
      await client.createIndex({
        name: idxName,
        dimension: 1536,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });

      console.log(`Index ${idxName} created successfully`);
      
      // Wait for index to be ready
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    return true;
  } catch (error: any) {
    console.error('Error ensuring Pinecone index:', error);
    throw error;
  }
}

/**
 * Upsert vectors to Pinecone
 */
export async function upsertVectors(vectors: Array<{
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}>) {
  try {
    const { client, indexName: idxName } = await initPinecone();
    const index = client.index(idxName);

    await index.upsert(vectors);

    console.log(`Upserted ${vectors.length} vectors to Pinecone`);
    return { success: true, count: vectors.length };
  } catch (error: any) {
    console.error('Error upserting vectors:', error);
    throw error;
  }
}

/**
 * Query vectors from Pinecone (semantic search)
 */
export async function queryVectors(
  queryVector: number[],
  topK: number = 5,
  filter?: Record<string, any>,
  namespace?: string
) {
  try {
    const { client, indexName: idxName } = await initPinecone();
    const index = client.index(idxName);

    const queryResponse = await index.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
      includeValues: false,
      filter,
      namespace,
    });

    console.log(`Found ${queryResponse.matches?.length || 0} similar vectors`);
    return queryResponse.matches || [];
  } catch (error: any) {
    console.error('Error querying vectors:', error);
    throw error;
  }
}

/**
 * Delete vectors by ID
 */
export async function deleteVectors(ids: string[], namespace?: string) {
  try {
    const { client, indexName: idxName } = await initPinecone();
    const index = client.index(idxName);

    await index.deleteMany(ids, namespace);

    console.log(`Deleted ${ids.length} vectors from Pinecone`);
    return { success: true, count: ids.length };
  } catch (error: any) {
    console.error('Error deleting vectors:', error);
    throw error;
  }
}

/**
 * Get index stats
 */
export async function getIndexStats() {
  try {
    const { client, indexName: idxName } = await initPinecone();
    const index = client.index(idxName);

    const stats = await index.describeIndexStats();
    return stats;
  } catch (error: any) {
    console.error('Error getting index stats:', error);
    throw error;
  }
}

/**
 * Store workflow with embedding
 */
export async function storeWorkflowEmbedding(
  workflowId: string,
  embedding: number[],
  metadata: {
    name: string;
    description?: string;
    userId: string;
    tags?: string[];
    [key: string]: any;
  }
) {
  try {
    await ensureIndex();
    
    const vector = {
      id: `workflow-${workflowId}`,
      values: embedding,
      metadata: {
        ...metadata,
        type: 'workflow',
        timestamp: new Date().toISOString(),
      },
    };

    await upsertVectors([vector]);
    
    return { success: true, vectorId: vector.id };
  } catch (error: any) {
    console.error('Error storing workflow embedding:', error);
    throw error;
  }
}

/**
 * Search similar workflows
 */
export async function searchSimilarWorkflows(
  queryEmbedding: number[],
  limit: number = 5,
  userId?: string
) {
  try {
    await ensureIndex();
    
    const filter = userId ? { userId, type: 'workflow' } : { type: 'workflow' };
    
    const results = await queryVectors(queryEmbedding, limit, filter);
    
    return results.map((match: any) => ({
      id: match.id?.replace('workflow-', ''),
      score: match.score,
      metadata: match.metadata,
    }));
  } catch (error: any) {
    console.error('Error searching similar workflows:', error);
    throw error;
  }
}
