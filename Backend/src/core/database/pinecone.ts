import { Pinecone } from '@pinecone-database/pinecone';
import { databaseConfig } from '../config/database.config';
let pineconeClient: Pinecone | null = null;
let isConnected = false;
export async function connectPinecone(): Promise<Pinecone> {
  if (pineconeClient && isConnected) {
    return pineconeClient;
  }
  try {
    const apiKey = databaseConfig.pinecone.apiKey;
    // Debug: Log API key source (only first few chars for security)
    if (!apiKey) {
      throw new Error('Pinecone API key is missing! Check your .env file.');
    }
    const keyPreview = apiKey.substring(0, 10) + '...';
    // Initialize Pinecone client
    // SDK v6.1.3+ supports serverless keys (pcsk_...) with only API key
    // Legacy keys (pc-...) may still work but are deprecated
    // The new SDK doesn't require environment parameter in TypeScript types
    const isServerless = apiKey.startsWith('pcsk_');
    if (isServerless) {
      // Serverless configuration - only API key needed
      pineconeClient = new Pinecone({
        apiKey: apiKey
      });
    } else {
      // Legacy configuration - try with just API key first
      // If it fails, the error will be caught below
      console.warn('⚠️ Using legacy API key format. Consider migrating to serverless (pcsk_...)');
      pineconeClient = new Pinecone({
        apiKey: apiKey
      });
    }
    // Test connection by listing indexes with timeout
    try {
      const indexList = await Promise.race([
        pineconeClient.listIndexes(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Pinecone connection timeout after 10 seconds')), 10000)
        )
      ]) as any;
      // Handle different API response formats
      let indexNames: string[] = [];
      if (Array.isArray(indexList)) {
        indexNames = indexList.map((i: any) => i.name || i);
      } else if (indexList?.indexes && Array.isArray(indexList.indexes)) {
        indexNames = indexList.indexes.map((i: any) => i.name || i);
      } else if (indexList?.names && Array.isArray(indexList.names)) {
        indexNames = indexList.names;
      }
      // Verify the configured index exists
      const indexExists = indexNames.some((name: string) => 
        name === databaseConfig.pinecone.indexName
      );
      if (!indexExists && indexNames.length > 0) {
        console.warn(
          `⚠️ Warning: Configured index "${databaseConfig.pinecone.indexName}" not found. Available indexes: ${indexNames.join(', ')}`
        );
        console.warn(`💡 Tip: Make sure the index name matches exactly (case-sensitive)`);
      } else if (indexNames.length === 0) {
        console.warn(
          `⚠️ Warning: No indexes found. You may need to create an index "${databaseConfig.pinecone.indexName}" in your Pinecone dashboard.`
        );
      }
      isConnected = true;
      return pineconeClient;
    } catch (listError: any) {
      // If listing fails, still try to get the index (it might exist but listing failed)
      console.warn('⚠️ Could not list indexes, but continuing with connection...');
      console.warn(`Error: ${listError.message || listError}`);
      // Try to access the index directly to verify connection
      try {
        // Just accessing the index doesn't verify it exists, but it initializes it
        pineconeClient.index(databaseConfig.pinecone.indexName);
        isConnected = true;
        return pineconeClient;
      } catch (indexError: any) {
        throw new Error(`Failed to initialize Pinecone index: ${indexError.message || indexError}`);
      }
    }
  } catch (error: any) {
    console.error('❌ Failed to connect to Pinecone:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    // Provide helpful error messages
    if (error.message?.includes('timeout')) {
      console.error('💡 Tip: Check your network connection and firewall settings');
    } else if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      console.error('💡 Tip: Verify your PINECONE_API_KEY in .env file is correct');
      console.error('💡 Tip: Serverless API keys should start with "pcsk_"');
    } else if (error.message?.includes('configuration')) {
      console.error('💡 Tip: Check your PINECONE_INDEX_NAME matches an existing index');
      console.error('💡 Tip: Visit https://app.pinecone.io to verify your index name');
    }
    isConnected = false;
    pineconeClient = null;
    throw error;
  }
}
export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    throw new Error('Pinecone client not initialized. Call connectPinecone() first.');
  }
  return pineconeClient;
}
export function getPineconeIndex() {
  const client = getPineconeClient();
  return client.index(databaseConfig.pinecone.indexName);
}
export function getPineconeConnectionStatus(): boolean {
  return isConnected && pineconeClient !== null;
}
/**
 * Create a Pinecone index with model-based embeddings
 * Uses the new createIndexForModel API
 */
export async function createPineconeIndex(options: {
  name: string;
  cloud?: 'aws' | 'gcp' | 'azure';
  region?: string;
  embedModel?: string;
  fieldMap?: Record<string, string>;
  waitUntilReady?: boolean;
}): Promise<void> {
  const client = getPineconeClient();
  try {
    // Type assertion needed - createIndexForModel is available in newer SDK versions
    await (client as any).createIndexForModel({
      name: options.name,
      cloud: options.cloud || 'aws',
      region: options.region || 'us-east-1',
      embed: {
        model: options.embedModel || 'llama-text-embed-v2',
        fieldMap: options.fieldMap || { text: 'chunk_text' },
      },
      waitUntilReady: options.waitUntilReady !== false,
    });
  } catch (error: any) {
    throw new Error(`Failed to create Pinecone index: ${error.message}`);
  }
}
/**
 * Upsert records to Pinecone index
 * Uses the new upsertRecords API with record format
 */
export async function upsertPineconeRecords(
  records: Array<{
    _id: string;
    [key: string]: any; // Additional fields like chunk_text, category, etc.
  }>,
  namespace?: string
): Promise<void> {
  const index = getPineconeIndex();
  const targetIndex = namespace ? index.namespace(namespace) : index;
  try {
    // Type assertion needed - upsertRecords is available in newer SDK versions
    await (targetIndex as any).upsertRecords(records);
  } catch (error: any) {
    throw new Error(`Failed to upsert records to Pinecone: ${error.message}`);
  }
}
/**
 * Semantic search using the new searchRecords API
 * Automatically handles text input and embedding generation
 */
export async function searchPineconeRecords(
  query: string,
  options: {
    topK?: number;
    namespace?: string;
    rerank?: {
      model?: string;
      topN?: number;
      rankFields?: string[];
    };
  } = {}
): Promise<any> {
  const index = getPineconeIndex();
  const targetIndex = options.namespace ? index.namespace(options.namespace) : index;
  try {
    const searchOptions: any = {
      query: {
        topK: options.topK || 5,
        inputs: { text: query },
      },
    };
    // Add reranking if specified
    if (options.rerank) {
      searchOptions.rerank = {
        model: options.rerank.model || 'bge-reranker-v2-m3',
        topN: options.rerank.topN || options.topK || 5,
        rankFields: options.rerank.rankFields || ['chunk_text'],
      };
    }
    // Type assertion needed - searchRecords is available in newer SDK versions
    const results = await (targetIndex as any).searchRecords(searchOptions);
    return results;
  } catch (error: any) {
    throw new Error(`Failed to search Pinecone records: ${error.message}`);
  }
}
/**
 * Get index statistics
 */
export async function getPineconeIndexStats(namespace?: string): Promise<any> {
  const index = getPineconeIndex();
  const targetIndex = namespace ? index.namespace(namespace) : index;
  try {
    const stats = await targetIndex.describeIndexStats();
    return stats;
  } catch (error: any) {
    throw new Error(`Failed to get Pinecone index stats: ${error.message}`);
  }
}
/**
 * Delete records by IDs
 */
export async function deletePineconeRecords(
  ids: string[],
  namespace?: string
): Promise<void> {
  const index = getPineconeIndex();
  const targetIndex = namespace ? index.namespace(namespace) : index;
  try {
    await targetIndex.deleteMany(ids);
  } catch (error: any) {
    throw new Error(`Failed to delete Pinecone records: ${error.message}`);
  }
}
