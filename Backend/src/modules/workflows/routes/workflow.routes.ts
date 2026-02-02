import { FastifyPluginAsync } from 'fastify';
import {
  createWorkflowHandler,
  listWorkflowsHandler,
  getWorkflowHandler,
  updateWorkflowHandler,
  deleteWorkflowHandler,
  publishWorkflowHandler,
  archiveWorkflowHandler,
  testNodeHandler,
  exportWorkflowHandler,
  importWorkflowHandler,
  favoriteWorkflowHandler,
  unfavoriteWorkflowHandler,
  getFavoritesHandler,
} from './handlers';
import { CreateWorkflowBody, UpdateWorkflowBody, ListWorkflowsQuery, TestWorkflowBody, ImportWorkflowBody } from './types/workflow-routes.types';
import {
  createWorkflowSchema,
  updateWorkflowSchema,
  getWorkflowSchema,
  listWorkflowsSchema,
} from '../../../schemas/workflow.schema';

const workflowRoutes: FastifyPluginAsync = async (fastify) => {
  // Create workflow
  fastify.post<{ Body: CreateWorkflowBody }>('/', { schema: createWorkflowSchema }, createWorkflowHandler);

  // List workflows
  fastify.get<{ Querystring: ListWorkflowsQuery }>(
    '/',
    { schema: listWorkflowsSchema },
    listWorkflowsHandler
  );

  // Get workflow by ID
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    { schema: getWorkflowSchema },
    getWorkflowHandler
  );

  // Update workflow
  fastify.put<{ Params: { id: string }; Body: UpdateWorkflowBody }>(
    '/:id',
    { schema: updateWorkflowSchema },
    updateWorkflowHandler
  );

  // Delete workflow
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    { schema: getWorkflowSchema },
    deleteWorkflowHandler
  );

  // Publish workflow
  fastify.post<{ Params: { id: string } }>('/:id/publish', publishWorkflowHandler);

  // Archive workflow
  fastify.post<{ Params: { id: string } }>('/:id/archive', archiveWorkflowHandler);

  // Test single node execution
  fastify.post<{ Params: { id: string; nodeId: string }; Body: TestWorkflowBody }>(
    '/:id/nodes/:nodeId/test',
    testNodeHandler
  );

  // Export workflow
  fastify.get<{ Params: { id: string } }>('/:id/export', exportWorkflowHandler);

  // Import workflow
  fastify.post<{ Body: ImportWorkflowBody }>('/import', importWorkflowHandler);

  // Add workflow to favorites
  fastify.post<{ Params: { id: string } }>('/:id/favorite', favoriteWorkflowHandler);

  // Remove workflow from favorites
  fastify.delete<{ Params: { id: string } }>('/:id/favorite', unfavoriteWorkflowHandler);

  // List favorite workflows
  fastify.get('/favorites', getFavoritesHandler);
};

export default workflowRoutes;