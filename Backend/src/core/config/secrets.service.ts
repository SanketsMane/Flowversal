
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

export class SecretsService {
  private client: SecretsManagerClient;
  private env: string;

  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  /**
   * Fetch a secret from AWS Secrets Manager
   * @param secretName Name of the secret to fetch
   * @returns Parsed secret object or string, or null if not found (in dev)
   */
  async getSecret(secretName: string): Promise<any> {
    // In development, we can skip fetching if not configured, or try anyway
    if (this.env === 'development' && !process.env.AWS_ACCESS_KEY_ID) {
      console.log(`[Secrets] Skipping AWS secret fetch for ${secretName} (AWS credentials not found)`);
      return null;
    }

    try {
      const command = new GetSecretValueCommand({ SecretId: secretName });
      const response = await this.client.send(command);
      
      if (!response.SecretString) {
        throw new Error('SecretString not found');
      }

      try {
        return JSON.parse(response.SecretString);
      } catch {
        return response.SecretString;
      }
    } catch (error) {
      if (this.env === 'development') {
        console.warn(`[Secrets] Could not fetch secret ${secretName}:`, error);
        return null;
      }
      throw error;
    }
  }

  /**
   * Load critical secrets into process.env
   * This allows existing code using process.env to work without changes
   */
  async loadSecretsToEnv(): Promise<void> {
    // Determine secret name based on environment
    // e.g., flowversal/production/backend or flowversal/staging/backend
    const secretName = process.env.AWS_SECRET_NAME || `flowversal/${this.env}/backend`;
    
    console.log(`[Secrets] Attempting to load secrets from ${secretName}...`);
    
    const secrets = await this.getSecret(secretName);
    
    if (secrets) {
      let count = 0;
      // If secrets is an object, map strict keys to process.env
      if (typeof secrets === 'object') {
        for (const [key, value] of Object.entries(secrets)) {
          // Only set if not already set (allow local overrides) OR force override?
          // Usually secrets manager should be source of truth in Prod.
          // Locals overrides in Dev.
          if (!process.env[key] || this.env === 'production') {
            process.env[key] = String(value);
            count++;
          }
        }
      }
      console.log(`[Secrets] Successfully loaded ${count} secrets into environment`);
    } else {
        console.log('[Secrets] No secrets loaded (local fallback)');
    }
  }
}

export const secretsService = new SecretsService();
