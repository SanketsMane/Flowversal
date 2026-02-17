
import axios, { AxiosInstance } from 'axios';
import { env } from '../../../../core/config/env';
import { logger } from '../../../../shared/utils/logger.util';

export class FlowversalRemoteService {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;
  private enabled: boolean;

  constructor() {
    this.baseUrl = env.FLOWVERSAL_REMOTE_URL || 'http://139.84.155.227:3000/api/tanchat';
    this.apiKey = env.FLOWVERSAL_REMOTE_API_KEY || ''; // Will be populated from .env
    this.enabled = !!this.apiKey;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      timeout: 60000, 
    });
  }

  async chatCompletion(messages: any[], model?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Flowversal Remote API Key is missing');
    }

    try {
      const payload = {
        messages: messages.map(m => ({
            role: m.role,
            content: m.content
        })),
        provider: 'openai', // Defaulting as per example
        model: 'gpt-3.5-turbo', // Verified working model with flat structure
      };

      console.log('[Flowversal Remote] Request Payload:', JSON.stringify(payload, null, 2));

      // Handle full URL if baseUrl doesn't include path
      const url = this.baseUrl.includes('/api/tanchat') ? '' : '/api/tanchat';
      
      const response = await this.client.post(url, payload);

      console.log('[Flowversal Remote] Response Status:', response.status);
      console.log('[Flowversal Remote] Response Data:', JSON.stringify(response.data, null, 2));

      // Simple response handling - adjust based on actual stream/text format
      // The example shows stream, but axios handles data by default unless responseType is stream
      // Assuming for now it returns text or stream we can concat
      
      if (typeof response.data === 'string') {
          const rawData = response.data;
          
          // Check if it's an SSE stream
          if (rawData.includes('data: {')) {
              console.log('[Flowversal Remote] Parsing SSE stream...');
              const lines = rawData.split('\n');
              let fullContent = '';
              
              for (const line of lines) {
                  if (line.trim().startsWith('data: ')) {
                      try {
                          const jsonStr = line.trim().substring(6); // Remove 'data: '
                          if (jsonStr === '[DONE]') continue;
                          
                          const data = JSON.parse(jsonStr);
                          
                          // Fix for stuttering: The upstream API sends accumulated text in 'content' 
                          // and the new chunk in 'delta'. We should append 'delta'.
                          if (data.delta) {
                              fullContent += data.delta;
                          } else if (data.type === 'content' && data.content) {
                              // If no delta, 'content' might be the delta in some providers, 
                              // OR it might be full content. 
                              // Given the logs show content is accumulated, we should NOT append it if we have delta.
                              // If we ONLY have content and it's accumulating, we should essentially replace fullContent
                              // But simpler logic for this specific provider (Ollama-like): trust delta.
                              // If we are here, delta was missing. Let's assume content is the chunk if delta is missing.
                              fullContent += data.content; 
                          } else if (data.content && !data.type) {
                              // Standard OpenAI format usually has choices[0].delta.content
                              fullContent += data.content;
                          }
                      } catch (e) {
                          console.warn('Failed to parse SSE line:', line);
                      }
                  }
              }
              
              console.log('[Flowversal Remote] Parsed Content:', fullContent);
              return fullContent || rawData; // Fallback to raw if parsing yields nothing
          }
          
          return response.data;
      }
      
      // If JSON response (non-stream)
      if (response.data?.response) return response.data.response;
      if (response.data?.content) return response.data.content;
      
      return JSON.stringify(response.data);

    } catch (error: any) {
      logger.error('Flowversal Remote API Error', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }
}

export const flowversalRemoteService = new FlowversalRemoteService();
