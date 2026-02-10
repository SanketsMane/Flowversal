import { FastifyInstance } from 'fastify';
import apiVersioning from '../core/api/api-versioning';
import subscriptionRoutes from '../infrastructure/external/subscription.routes';
import storageRoutes from '../infrastructure/storage/storage.routes';
import chatRoutes from '../modules/ai/routes/ai/chat.routes';
import mcpRoutes from '../modules/ai/routes/ai/mcp.routes';
import ragRoutes from '../modules/ai/routes/ai/rag.routes';
import searchRoutes from '../modules/ai/routes/ai/search.routes';
import workflowAIRoutes from '../modules/ai/routes/ai/workflow.routes';
import { analyticsRoutes, analyticsRoutes as workflowAnalyticsRoutes } from '../modules/analytics/routes/analytics.routes';
import authRoutes from '../modules/auth/routes/auth.routes';
import mfaRoutes from '../modules/auth/routes/mfa.routes';
import creatorRoutes from '../modules/creator/routes/creator.routes';
import boardRoutes from '../modules/projects/routes/board.routes';
import projectRoutes from '../modules/projects/routes/project.routes';
import setupConfigRoutes from '../modules/projects/routes/setup-config.routes';
import templateRoutes from '../modules/projects/routes/template.routes';
import referralRoutes from '../modules/referrals/routes/referral.routes';
import taskRoutes from '../modules/tasks/routes/task.routes';
import userRoutes from '../modules/users/routes/user.routes';
import workflowExecutionRoutes from '../modules/workflows/routes/workflow-execution.routes';
import workflowWebSocketRoutes from '../modules/workflows/routes/workflow-websocket.routes';
import workflowRoutes from '../modules/workflows/routes/workflow.routes';
import healthRoutes from './health.routes';
import inngestRoutes from './inngest.routes';
import v1Routes from './v1';
import v2Routes from './v2';

export async function registerRoutes(fastify: FastifyInstance) {
  // Register API versioning plugin
  await fastify.register(apiVersioning);

  // Health check routes (no auth required)
  await fastify.register(healthRoutes, { prefix: '/api/v1/health' });
  await fastify.register(healthRoutes);

  // Register API v1 routes
  await fastify.register(v1Routes, { prefix: '/api/v1' });

  // Register API v2 routes
  await fastify.register(v2Routes, { prefix: '/api/v2' });

  // Auth routes (no auth required)
  await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  await fastify.register(mfaRoutes, { prefix: '/api/v1/auth/mfa' });

  // User routes (auth required)
  await fastify.register(userRoutes, { prefix: '/api/v1/users' });

  // Workflow routes (auth required)
  await fastify.register(workflowRoutes, { prefix: '/api/v1/workflows' });

  // Workflow execution routes (auth required)
  await fastify.register(workflowExecutionRoutes, { prefix: '/api/v1/workflows' });

  // WebSocket routes for real-time workflow execution updates
  await fastify.register(workflowWebSocketRoutes, { prefix: '/api/v1/workflows' });

  // Human approval routes (auth required)
  // await fastify.register(humanApprovalRoutes, { prefix: '/api/v1' }); // Temporarily disabled

  // Breakpoint routes (auth required)
  // await fastify.register(breakpointRoutes, { prefix: '/api/v1' }); // Temporarily disabled

  // AI routes (auth required)
  await fastify.register(chatRoutes, { prefix: '/api/v1/ai/chat' });
  await fastify.register(workflowAIRoutes, { prefix: '/api/v1/ai' });
  await fastify.register(ragRoutes, { prefix: '/api/v1/ai/rag' });
  await fastify.register(searchRoutes, { prefix: '/api/v1/ai/search' });
  await fastify.register(mcpRoutes, { prefix: '/api/v1/ai/mcp' });

  // Template routes (public read, auth for install)
  await fastify.register(templateRoutes, { prefix: '/api/v1/templates' });

  // Storage routes (auth required)
  await fastify.register(storageRoutes, { prefix: '/api/v1/storage' });

  // Subscription routes (stubbed)
  await fastify.register(subscriptionRoutes, { prefix: '/api/v1/subscription' });

  // Creator routes (earnings, workflows) - Fixes BUG-009
  await fastify.register(creatorRoutes, { prefix: '/api/v1/creator' });

  // Referral routes - Fixes BUG-009
  await fastify.register(referralRoutes, { prefix: '/api/v1/referrals' });

  // Project routes (auth required)
  await fastify.register(projectRoutes, { prefix: '/api/v1/projects' });

  // Board routes (auth required)
  await fastify.register(boardRoutes, { prefix: '/api/v1/projects/boards' });

  // Task routes (auth required)
  await fastify.register(taskRoutes, { prefix: '/api/v1/projects/tasks' });

  // Setup config routes (auth required)
  await fastify.register(setupConfigRoutes, { prefix: '/api/v1/setup-config' });

  // Analytics / BI routes
  // await fastify.register(analyticsRoutes, { prefix: '/api/v1/analytics' }); // Temporarily disabled

  // Enhanced workflow analytics routes
  // await fastify.register(workflowAnalyticsRoutes, { prefix: '/api/v1/analytics/workflow' }); // Temporarily disabled

  // Tool ecosystem routes (auth required)
  // await fastify.register(toolEcosystemRoutes, { prefix: '/api/v1/tools' }); // Temporarily disabled

  // Inngest routes (webhook, no auth required for Inngest)
  await fastify.register(inngestRoutes, { prefix: '/api/inngest' });
}
