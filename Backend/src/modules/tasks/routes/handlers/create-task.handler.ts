import { FastifyReply, FastifyRequest } from 'fastify';
import { sanitizeInput, stripHtml } from '../../../../core/utils/sanitizer.util';
import { userService } from '../../../users/services/user.service';
import { taskService } from '../../services/task.service';
import { CreateTaskBody } from '../types/task-routes.types';
import { validateCreateTask } from '../validators/create-task.validator';

export async function createTaskHandler(
  request: FastifyRequest<{ Body: CreateTaskBody }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const body = request.body;

    // === INPUT VALIDATION ===
    const { isValid, errors } = validateCreateTask(body);
    if (!isValid) {
      return reply.code(400).send({
        success: false,
        error: 'Validation Error',
        message: 'Please correct the following errors:',
        details: errors,
      });
    }

    // Labels normalization and validation
    let normalizedLabels: string[] = [];
    if (body.labels !== undefined) {
      normalizedLabels = body.labels.map((label: any, index: number) => {
        // If label is an object with name property, extract the name
        if (typeof label === 'object' && label !== null) {
          if ('name' in label && typeof label.name === 'string') {
            return label.name.trim();
          } else if ('id' in label && typeof label.id === 'string') {
            // Fallback to id if name doesn't exist
            return label.id.trim();
          } else {
            return '';
          }
        } else if (typeof label === 'string') {
          return label.trim();
        } else {
          return '';
        }
      }).filter((label: string) => label.length > 0); // Remove empty labels
    }

    // Selected days normalization (weekly recurring only)
    let normalizedSelectedDays: string[] = [];
    if (body.selectedDays !== undefined && body.recurring === 'Weekly') {
      normalizedSelectedDays = body.selectedDays
        .filter(d => typeof d === 'string')
        .map(d => d.trim())
        .filter(Boolean);
    }

    // === BUSINESS LOGIC VALIDATION ===
    // Use standardized hydrated user from auth.plugin.ts - Author: Sanket
    if (!request.user?.id) {
        return reply.code(401).send({ success: false, error: 'Unauthorized', message: 'Auth required' });
    }
    const userId = request.user.id;

    // BUG-FIX: Enhanced Foreign Key Validation - Sanket
    // 1. Verify board exists and belongs to user
    const board = await taskService.getBoardById(body.boardId!, userId);
    if (!board) {
      return reply.code(404).send({
        success: false,
        error: 'Not Found',
        message: 'Board not found or access denied',
      });
    }

    // 2. Verify project exists and belongs to user
    const projectExists = await taskService.validateProjectOwnership(body.projectId!, userId);
    if (!projectExists) {
      return reply.code(404).send({
        success: false,
        error: 'Not Found',
        message: 'Project not found or access denied',
      });
    }

    // 3. CRITICAL: Verify board actually belongs to the specified project
    // Prevents "orphaned" tasks that point to valid board + valid project but inconsistent relationship
    if (board.projectId.toString() !== body.projectId) {
      return reply.code(400).send({
        success: false,
        error: 'ValidationError',
        message: 'The specified board does not belong to the specified project',
      });
    }

    // === CREATE TASK ===
    // Normalize status if provided
    let normalizedStatus = body.status || 'Todo';
    if (body.status) {
      const statusMap: Record<string, string> = {
        'To do': 'Todo',
        'to do': 'Todo',
        'TO DO': 'Todo',
        'todo': 'Todo',
        'Todo': 'Todo',
        'Backlog': 'Backlog',
        'backlog': 'Backlog',
        'In Progress': 'In Progress',
        'in progress': 'In Progress',
        'IN PROGRESS': 'In Progress',
        'inprogress': 'In Progress',
        'Review': 'Review',
        'review': 'Review',
        'Done': 'Done',
        'done': 'Done',
        'DONE': 'Done',
        'Cancelled': 'Cancelled',
        'cancelled': 'Cancelled',
        'CANCELLED': 'Cancelled',
        'Blocked': 'Blocked',
        'blocked': 'Blocked',
        'BLOCKED': 'Blocked',
      };
      normalizedStatus = statusMap[body.status] || body.status;
    }

    // Normalize startDate if provided (always a string from API)
    const normalizedStartDate: string | undefined = body.startDate || undefined;

    const taskData = {
      name: stripHtml(body.name.trim()),
      description: sanitizeInput(body.description?.trim() || ''),
      assignedTo: body.assignedTo || [],
      status: normalizedStatus,
      priority: body.priority || 'Medium', // Default priority
      labels: normalizedLabels,
      dueDate: body.dueDate,
      startDate: normalizedStartDate,
      recurring: body.recurring || 'Never',
      reminder: body.reminder || 'None',
      selectedDays: normalizedSelectedDays,
      hasWorkflow: body.hasWorkflow || false,
      checklists: body.checklists?.map((list: any) => ({
        ...list,
        name: stripHtml(list.name || ''),
        items: list.items?.map((item: any) => ({
          ...item,
          text: sanitizeInput(item.text || '')
        })) || []
      })) || [],
      comments: body.comments?.map((comment: any) => ({
        ...comment,
        text: sanitizeInput(comment.text || '')
      })) || [],
      attachments: body.attachments || [],
      workflows: body.workflows || [],
      boardId: body.boardId!,
      projectId: body.projectId!,
      createdBy: body.createdBy || {
        id: userId,
        name: request.user.full_name || request.user.email.split('@')[0],
        avatar: (request.user.full_name || request.user.email).charAt(0).toUpperCase()
      },
      order: body.order || 0,
    };

    const task = await taskService.createTask(taskData, userId);

    // === AUDIT LOGGING ===
    request.log.info({
      event: 'task_created',
      userId: request.user!.id,
      projectId: body.projectId,
      boardId: body.boardId,
      taskId: task._id,
      taskName: task.name,
      timestamp: new Date().toISOString(),
    });

    return reply.code(201).send({
      success: true,
      data: {
        id: task._id,
        taskId: task.taskId,
        name: task.name,
        description: task.description,
        assignedTo: task.assignedTo,
        status: task.status,
        priority: task.priority,
        labels: task.labels,
        dueDate: task.dueDate,
        startDate: (task as any).startDate,
        recurring: (task as any).recurring,
        reminder: (task as any).reminder,
        selectedDays: (task as any).selectedDays,
        hasWorkflow: task.hasWorkflow,
        checklists: (task as any).checklists,
        comments: (task as any).comments,
        attachments: (task as any).attachments,
        attachedWorkflows: (task as any).attachedWorkflows,
        boardId: task.boardId,
        projectId: task.projectId,
        createdBy: task.createdBy,
        order: task.order,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
      message: 'Task created successfully',
    });

  } catch (error: any) {
    request.log.error({
      msg: 'Error creating task',
      error: error.message,
      stack: error.stack,
      userId: request.user?.id,
      body: request.body,
    });

    // Handle specific database errors
    if (error.code === 11000) { // Duplicate key error
      return reply.code(409).send({
        success: false,
        error: 'Conflict',
        message: 'A task with this ID already exists',
      });
    }

    return reply.code(500).send({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to create task. Please try again.',
    });
  }
}
