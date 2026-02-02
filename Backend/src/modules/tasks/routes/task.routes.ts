import { FastifyPluginAsync } from 'fastify';
import {
  createTaskHandler,
  listTasksHandler,
  getTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  attachWorkflowHandler,
  detachWorkflowHandler,
  getWorkflowsHandler,
  executeWorkflowHandler,
} from './handlers';
import { CreateTaskBody, UpdateTaskBody, ListTasksQuery } from './types/task-routes.types';

const taskRoutes: FastifyPluginAsync = async (fastify) => {
  // Create task
  fastify.post<{ Body: CreateTaskBody }>('/', createTaskHandler);

  // List tasks
  fastify.get<{ Querystring: ListTasksQuery }>('/', listTasksHandler);

  // Get task by ID
  fastify.get<{ Params: { id: string } }>('/:id', getTaskHandler);

  // Update task
  fastify.put<{ Params: { id: string }; Body: UpdateTaskBody }>('/:id', updateTaskHandler);

  // Delete task
  fastify.delete<{ Params: { id: string } }>('/:id', deleteTaskHandler);

  // Attach workflow to task
  fastify.post<{ Params: { id: string }; Body: { workflowId: string; config?: any } }>(
    '/:id/workflows',
    attachWorkflowHandler
  );

  // Detach workflow from task
  fastify.delete<{ Params: { id: string; workflowId: string } }>(
    '/:id/workflows/:workflowId',
    detachWorkflowHandler
  );

  // Get attached workflows for task
  fastify.get<{ Params: { id: string } }>('/:id/workflows', getWorkflowsHandler);

  // Manually trigger workflow for task
  fastify.post<{ Params: { id: string; workflowId: string }; Body: { input?: Record<string, any> } }>(
    '/:id/workflows/:workflowId/execute',
    executeWorkflowHandler
  );
};

export default taskRoutes;