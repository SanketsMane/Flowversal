import axios from 'axios';
import { ExecutionContext } from '../../modules/workflows/services/workflow-execution.service';

export interface HTTPRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  timeout?: number;
}

export interface EmailConfig {
  to: string;
  subject: string;
  body: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
}

export class IntegrationNodeExecutor {
  /**
   * Execute HTTP request node
   */
  async executeHTTPRequestNode(node: any, context: ExecutionContext): Promise<any> {
    const config: HTTPRequestConfig = node.config || {};

    if (!config.url) {
      throw new Error('URL is required for HTTP request node');
    }

    // Resolve URL and variables
    const url = this.resolveVariable(config.url, context);
    const method = (config.method || 'GET').toUpperCase();
    const headers = this.resolveVariables(config.headers || {}, context);
    const body = config.body ? this.resolveVariable(config.body, context) : undefined;
    const params = this.resolveVariables(config.params || {}, context);

    try {
      const response = await axios({
        method: method as any,
        url: url,
        headers: headers,
        data: body,
        params: params,
        timeout: config.timeout || 30000,
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data,
          error: true,
        };
      }
      throw new Error(`HTTP request failed: ${error.message}`);
    }
  }

  /**
   * Execute email node (placeholder - integrate with email service)
   */
  async executeEmailNode(node: any, context: ExecutionContext): Promise<any> {
    const config: EmailConfig = node.config || {};

    if (!config.to || !config.subject || !config.body) {
      throw new Error('Email requires to, subject, and body');
    }

    // Resolve variables
    const to = this.resolveVariable(config.to, context);
    const subject = this.resolveVariable(config.subject, context);
    this.resolveVariable(config.body, context);
    config.from ? this.resolveVariable(config.from, context) : undefined;

    // TODO: Integrate with actual email service (SendGrid, Resend, etc.)
    // For now, return a placeholder response
    console.log(`[Email Node] Would send email to ${to}: ${subject}`);

    return {
      success: true,
      message: 'Email sent (simulated)',
      to: to,
      subject: subject,
      // In production, integrate with email service
      // await emailService.send({ to, subject, body, from })
    };
  }

  /**
   * Execute webhook node
   */
  async executeWebhookNode(node: any, context: ExecutionContext): Promise<any> {
    const config = node.config || {};

    if (!config.url) {
      throw new Error('Webhook URL is required');
    }

    const url = this.resolveVariable(config.url, context);
    const payload = config.payload || context.variables;

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(config.headers || {}),
        },
        timeout: config.timeout || 10000,
      });

      return {
        success: true,
        status: response.status,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(`Webhook failed: ${error.message}`);
    }
  }

  /**
   * Resolve variable from context
   */
  private resolveVariable(value: any, context: ExecutionContext): any {
    if (typeof value === 'string') {
      let resolved = value;

      // Replace context variables
      for (const [key, val] of Object.entries(context.variables)) {
        resolved = resolved.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val));
        resolved = resolved.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(val));
      }

      // Replace step results
      for (const [stepId, result] of context.stepResults.entries()) {
        resolved = resolved.replace(new RegExp(`\\{\\{${stepId}\\}\\}`, 'g'), JSON.stringify(result));
        resolved = resolved.replace(new RegExp(`\\$\\{${stepId}\\}`, 'g'), JSON.stringify(result));
      }

      // Replace input variables
      for (const [key, val] of Object.entries(context.input)) {
        resolved = resolved.replace(new RegExp(`\\{\\{input\\.${key}\\}\\}`, 'g'), String(val));
        resolved = resolved.replace(new RegExp(`\\$\\{input\\.${key}\\}`, 'g'), String(val));
      }

      return resolved;
    }

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map((item) => this.resolveVariable(item, context));
      }
      return this.resolveVariables(value, context);
    }

    return value;
  }

  /**
   * Resolve variables in an object
   */
  private resolveVariables(obj: Record<string, any>, context: ExecutionContext): Record<string, any> {
    const resolved: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = this.resolveVariable(value, context);
    }
    return resolved;
  }
}

export const integrationNodeExecutor = new IntegrationNodeExecutor();

