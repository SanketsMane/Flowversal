import { FastifyRequest, FastifyReply } from 'fastify';
import { WorkflowModel } from '../../models/Workflow.model';
import { userService } from '../../../users/services/user.service';
import { getNodeAdapter } from '../../../../services/workflow/langgraph-node-adapters';
import { LangGraphWorkflowState } from '../../../../services/workflow/langgraph-state.types';
import { TestWorkflowBody } from '../types/workflow-routes.types';

export async function testNodeHandler(
  request: FastifyRequest<{ Params: { id: string; nodeId: string }; Body: TestWorkflowBody }>,
  reply: FastifyReply
): Promise<void> {
  if (!request.user) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'User not authenticated',
    });
  }

  try {
    const dbUser = await userService.getOrCreateUserFromSupabase(request.user.id);
    const workflow = await WorkflowModel.findById(request.params.id);

    if (!workflow) {
      return reply.code(404).send({
        error: 'Not Found',
        message: 'Workflow not found',
      });
    }

    // Verify user owns the workflow
    if (workflow.userId.toString() !== dbUser._id.toString()) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'You do not have permission to test nodes in this workflow',
      });
    }

    // Find the node in the workflow
    let targetNode: any = null;

    for (const container of workflow.containers || []) {
      if (container.nodes && Array.isArray(container.nodes)) {
        const node = container.nodes.find((n: any) => n.id === request.params.nodeId);
        if (node) {
          targetNode = node;
          break;
        }
      }
      // Also check if container itself matches
      if (container.id === request.params.nodeId) {
        targetNode = container;
        break;
      }
    }

    if (!targetNode) {
      return reply.code(404).send({
        error: 'Not Found',
        message: `Node with ID ${request.params.nodeId} not found in workflow`,
      });
    }

    // Create mock execution context
    const mockContext = request.body.mockContext || {};
    const mockExecution = {
      _id: { toString: () => 'test-execution-id' },
      userId: { toString: () => dbUser._id.toString() },
      input: mockContext.input || {},
      triggeredBy: 'manual' as const,
      triggerData: mockContext.triggerData,
    };

    // Create mock state for node execution
    const mockState: LangGraphWorkflowState = {
      workflowId: workflow._id.toString(),
      userId: dbUser._id.toString(),
      executionId: 'test-execution-id',
      status: 'running',
      triggers: workflow.triggers || [],
      containers: workflow.containers || [],
      input: mockContext.input || {},
      variables: { ...mockContext.input, ...mockContext.variables },
      nodeResults: new Map(),
      steps: [],
      branchConditions: new Map(),
      activeBranches: [],
      errors: [],
      aiTokensUsed: 0,
      apiCallsMade: 0,
      totalSteps: 0,
      stepsExecuted: 0,
      triggeredBy: 'manual',
      triggerData: mockContext.triggerData,
    };

    // Get node adapter
    const nodeAdapter = getNodeAdapter(request.params.nodeId, targetNode, workflow, mockExecution as any);

    // Execute node
    const startTime = Date.now();
    let result: any;
    let error: any = null;

    try {
      const stateUpdate = await nodeAdapter(mockState);
      result = stateUpdate.nodeResults?.get(request.params.nodeId) || stateUpdate.variables?.[request.params.nodeId];
    } catch (err: any) {
      error = {
        message: err.message,
        stack: err.stack,
      };
    }

    const duration = Date.now() - startTime;

    return reply.send({
      success: !error,
      data: {
        nodeId: request.params.nodeId,
        nodeType: targetNode.type || 'unknown',
        result: result,
        error: error,
        duration: duration,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    request.log.error('Error testing node:', error);
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: error.message || 'Failed to test node',
    });
  }
}
