import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { InngestCommHandler } from 'inngest';
import { cleanupExpiredBreakpoints, cleanupExpiredBreakpointsManual } from '../infrastructure/queue/jobs/cleanup-expired-breakpoints.job';
import { handleExpiredApprovals, handleExpiredApprovalsManual } from '../infrastructure/queue/jobs/handle-expired-approvals.job';
import { inngest } from '../infrastructure/queue/jobs/inngest.client';
import { scheduleTaskWorkflows } from '../infrastructure/queue/jobs/task-workflow-scheduler.job';
import { executeWorkflow, processWorkflowStep } from '../infrastructure/queue/jobs/workflow-execution.job';
import { logger } from '../shared/utils/logger.util';

const inngestRoutes: FastifyPluginAsync = async (fastify) => {
  // Create Inngest communication handler for serving functions
  // Inngest v3 uses InngestCommHandler with a proper handler function
  const handler = new InngestCommHandler({
    client: inngest,
    functions: [executeWorkflow, processWorkflowStep, scheduleTaskWorkflows, handleExpiredApprovals, handleExpiredApprovalsManual, cleanupExpiredBreakpoints, cleanupExpiredBreakpointsManual],
    frameworkName: 'fastify',
    handler: async (req: any, res: any) => {
      // This handler is called by Inngest to process requests
      // We need to convert between Fastify and standard HTTP formats
      return { req, res };
    },
  } as any);

  // Inngest webhook endpoint for serving functions
  // Inngest will call this endpoint to execute functions
  fastify.all('/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const requestId = (request as any).requestId || 'unknown';
      logger.debug('Inngest webhook received', { 
        requestId,
        method: request.method,
        url: request.url,
      });

      // Convert Fastify request to standard HTTP format for Inngest
      const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
      
      // Get request body (Inngest webhooks use JSON)
      const body = request.body || null;

      // Create a standard request object for Inngest
      const inngestRequest = {
        url: url.toString(),
        method: request.method,
        headers: request.headers as Record<string, string | string[]>,
        body: body,
        query: Object.fromEntries(url.searchParams),
      };

      // Create a response-like object that Inngest can write to
      let responseStatus = 200;
      const responseHeaders: Record<string, string> = {};
      let responseBody: any = null;

      const inngestResponse = {
        status: (code: number) => {
          responseStatus = code;
          return inngestResponse;
        },
        setHeader: (name: string, value: string) => {
          responseHeaders[name] = value;
        },
        send: (data: any) => {
          responseBody = data;
        },
        json: (data: any) => {
          responseBody = data;
          responseHeaders['Content-Type'] = 'application/json';
        },
      };

      // Call Inngest handler - it will process the request and execute functions
      try {
        // The handler processes the request internally
        // We need to manually invoke the handler's process method
        const handlerResult = await (handler as any).handler(inngestRequest, inngestResponse);

        // If handler returns a response directly
        if (handlerResult) {
          if (typeof handlerResult === 'object' && 'status' in handlerResult) {
            responseStatus = handlerResult.status || 200;
            responseBody = handlerResult.body || handlerResult.data || handlerResult;
            if (handlerResult.headers) {
              Object.assign(responseHeaders, handlerResult.headers);
            }
          } else {
            responseBody = handlerResult;
          }
        }

        // Set response headers
        Object.entries(responseHeaders).forEach(([key, value]) => {
          reply.header(key, value);
        });

        // Send response
        reply.status(responseStatus);
        
        if (responseBody !== null) {
          return reply.send(responseBody);
        }

        // Default success response
        return reply.send({ 
          success: true,
          message: 'Inngest function executed',
          requestId,
        });
      } catch (handlerError: any) {
        logger.error('Inngest handler execution error', handlerError, { requestId });
        throw handlerError;
      }
    } catch (error: any) {
      const requestId = (request as any).requestId || 'unknown';
      logger.error('Inngest webhook error', error, { requestId });
      
      return reply.code(500).send({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred processing the request',
        requestId,
      });
    }
  });
};

export default inngestRoutes;

