import { chatService } from '../modules/ai/services/ai/chat.service';
import { taskService } from '../modules/tasks/services/task.service';
import { userService } from '../modules/users/services/user.service';
import { workflowExecutionService } from '../modules/workflows/services/workflow-execution.service';
import { workflowService } from '../modules/workflows/services/workflow.service';
import { integrationNodeExecutor } from './nodes/integration-node-executor';

export interface CommandResult {
  success: boolean;
  action: string;
  result?: any;
  error?: string;
}

export class CommandExecutionService {
  /**
   * Execute a parsed command
   */
  async executeCommand(
    command: {
      command: string;
      action: 'email' | 'task' | 'workflow' | 'search' | 'unknown';
      parameters: Record<string, any>;
    },
    userId: string
  ): Promise<CommandResult> {
    try {
      switch (command.action) {
        case 'email':
          return await this.executeEmailCommand(command.parameters, userId);
        case 'task':
          return await this.executeTaskCommand(command.parameters, userId);
        case 'workflow':
          return await this.executeWorkflowCommand(command.parameters, userId);
        case 'search':
          return await this.executeSearchCommand(command.parameters, userId);
        default:
          return {
            success: false,
            action: command.action,
            error: 'Unknown command action',
          };
      }
    } catch (error: any) {
      return {
        success: false,
        action: command.action,
        error: error.message || 'Command execution failed',
      };
    }
  }

  /**
   * Execute email command
   */
  private async executeEmailCommand(
    parameters: Record<string, any>,
    userId: string
  ): Promise<CommandResult> {
    const { to, subject, body } = parameters;

    if (!to) {
      return {
        success: false,
        action: 'email',
        error: 'Email recipient (to) is required',
      };
    }

    // Create a mock node for email execution
    const emailNode = {
      type: 'email',
      config: {
        to: to,
        subject: subject || 'Message from Flowversal',
        body: body || '',
      },
    };

    // Create mock execution context
    const mockContext = {
      workflow: { _id: { toString: () => 'command-execution' } },
      execution: {
        _id: { toString: () => 'command-execution' },
        userId: { toString: () => userId },
      },
      input: {},
      variables: {},
      stepResults: new Map(),
    };

    try {
      const result = await integrationNodeExecutor.executeEmailNode(emailNode, mockContext as any);
      return {
        success: true,
        action: 'email',
        result: result,
      };
    } catch (error: any) {
      return {
        success: false,
        action: 'email',
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Execute task command
   */
  private async executeTaskCommand(
    parameters: Record<string, any>,
    userId: string
  ): Promise<CommandResult> {
    const { name, projectId, boardId, description, status, priority } = parameters;

    if (!name) {
      return {
        success: false,
        action: 'task',
        error: 'Task name is required',
      };
    }

    try {
      const dbUser = await userService.getOrCreateUserFromSupabase(userId);
      
      // If projectId is a name, try to find it
      let actualProjectId = projectId;
      let actualBoardId = boardId;

      if (projectId && !projectId.match(/^[0-9a-fA-F]{24}$/)) {
        // Assume it's a project name, find the project
        // For now, we'll require the actual ID
        return {
          success: false,
          action: 'task',
          error: 'Project ID must be provided. Please specify the project ID.',
        };
      }

      if (!actualBoardId && actualProjectId) {
        // Try to get the first board of the project
        // For now, require boardId
        return {
          success: false,
          action: 'task',
          error: 'Board ID must be provided. Please specify the board ID.',
        };
      }

      const task = await taskService.createTask(
        {
          name: name,
          description: description,
          status: status || 'To do',
          priority: priority || 'Medium',
          boardId: actualBoardId,
          projectId: actualProjectId,
        },
        dbUser._id.toString()
      );

      return {
        success: true,
        action: 'task',
        result: {
          taskId: task.taskId,
          id: task._id.toString(),
          name: task.name,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        action: 'task',
        error: error.message || 'Failed to create task',
      };
    }
  }

  /**
   * Execute workflow command
   */
  private async executeWorkflowCommand(
    parameters: Record<string, any>,
    userId: string
  ): Promise<CommandResult> {
    const { workflowName, workflowId, input } = parameters;

    try {
      const dbUser = await userService.getOrCreateUserFromSupabase(userId);
      let actualWorkflowId = workflowId;

      // If workflowName is provided, find workflow by name
      if (workflowName && !actualWorkflowId) {
        const workflows = await workflowService.listWorkflows(
          { userId: dbUser._id.toString() },
          1,
          10
        );
        const workflow = workflows.workflows.find(
          (w) => w.name.toLowerCase() === workflowName.toLowerCase()
        );
        if (workflow) {
          actualWorkflowId = workflow._id.toString();
        } else {
          return {
            success: false,
            action: 'workflow',
            error: `Workflow "${workflowName}" not found`,
          };
        }
      }

      if (!actualWorkflowId) {
        return {
          success: false,
          action: 'workflow',
          error: 'Workflow ID or name is required',
        };
      }

      const execution = await workflowExecutionService.startExecution(
        actualWorkflowId,
        dbUser._id.toString(),
        input || {},
        'manual'
      );

      return {
        success: true,
        action: 'workflow',
        result: {
          executionId: execution._id.toString(),
          status: execution.status,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        action: 'workflow',
        error: error.message || 'Failed to execute workflow',
      };
    }
  }

  /**
   * Execute search command
   */
  private async executeSearchCommand(
    parameters: Record<string, any>,
    userId: string
  ): Promise<CommandResult> {
    const { query } = parameters;

    if (!query) {
      return {
        success: false,
        action: 'search',
        error: 'Search query is required',
      };
    }

    // Use chat service to perform search (could integrate with web search tool)
    // Default to vLLM, will automatically fallback if not configured
    try {
      const searchPrompt = `Search for information about: ${query}`;
      const response = await chatService.chatCompletion({
        messages: [{ role: 'user', content: searchPrompt }],
        modelType: 'vllm', // Will automatically fallback to openrouter if vLLM not configured
        remoteModel: 'claude',
        useLangChain: true,
      });

      return {
        success: true,
        action: 'search',
        result: {
          query: query,
          response: response.response,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        action: 'search',
        error: error.message || 'Failed to perform search',
      };
    }
  }
}

export const commandExecutionService = new CommandExecutionService();

