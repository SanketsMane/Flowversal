import { FastifyReply, FastifyRequest } from 'fastify';
import { sanitizeInput, stripHtml } from '../../../../core/utils/sanitizer.util';
import { userService } from '../../../users/services/user.service';
import type { UpdateTaskData } from '../../services/task.service';
import { taskService } from '../../services/task.service';
import { UpdateTaskBody } from '../types/task-routes.types';
import { validateUpdateTask } from '../validators/update-task.validator';

export async function updateTaskHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateTaskBody }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Use cached dbUser if available (from auth middleware), otherwise fetch it
    // This fixes BUG-TASK-003 (N+1 query problem)
    const dbUser = request.user?.dbUser || await userService.getOrCreateUserFromSupabase(request.user!.id);
    const { id } = request.params;
    const body = request.body;

    // === INPUT VALIDATION ===
    const { isValid, errors } = validateUpdateTask(body);
    if (!isValid) {
      return reply.code(400).send({
        success: false,
        error: 'Validation Error',
        message: 'Please correct the following errors:',
        details: errors,
      });
    }

    // Labels normalization and validation
    let normalizedLabels: string[] | undefined = undefined;
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
    let normalizedSelectedDays: string[] | undefined = undefined;
    if (body.selectedDays !== undefined) {
      normalizedSelectedDays = body.selectedDays
        .filter(d => typeof d === 'string')
        .map(d => d.trim())
        .filter(Boolean);
    }

    // Status normalization and validation
    let normalizedStatus: string | undefined = undefined;
    if (body.status !== undefined) {
      // Normalize status variations
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

    // === BUSINESS LOGIC VALIDATION ===
    // Verify task exists and belongs to user
    const existingTask = await taskService.getTaskById(id, dbUser._id.toString());
    if (!existingTask) {
      return reply.code(404).send({
        success: false,
        error: 'Not Found',
        message: 'Task not found or access denied',
      });
    }

    // If boardId is being updated, verify new board exists and belongs to user
    if (body.boardId && body.boardId !== existingTask.boardId.toString()) {
      const boardExists = await taskService.validateBoardOwnership(body.boardId, dbUser._id.toString());
      if (!boardExists) {
        return reply.code(404).send({
          success: false,
          error: 'Not Found',
          message: 'Board not found or access denied',
        });
      }
    }

    // If projectId is being updated, verify new project exists and belongs to user
    if (body.projectId && body.projectId !== existingTask.projectId.toString()) {
      const projectExists = await taskService.validateProjectOwnership(body.projectId, dbUser._id.toString());
      if (!projectExists) {
        return reply.code(404).send({
          success: false,
          error: 'Not Found',
          message: 'Project not found or access denied',
        });
      }
    }

    // === PREPARE UPDATE DATA ===
    const updateData: UpdateTaskData = {};

    if (body.name !== undefined) {
      updateData.name = stripHtml(body.name.trim());
    }

    if (body.description !== undefined) {
      updateData.description = sanitizeInput(body.description?.trim() || '');
    }

    if (body.assignedTo !== undefined) {
      updateData.assignedTo = body.assignedTo;
    }

    if (normalizedStatus !== undefined) {
      updateData.status = normalizedStatus;
    }

    if (body.priority !== undefined) {
      updateData.priority = body.priority;
    }

    if (normalizedLabels !== undefined) {
      updateData.labels = normalizedLabels;
    }

    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate;
    }

    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate;
    }

    if (body.recurring !== undefined) {
      updateData.recurring = body.recurring;
    }

    if (body.reminder !== undefined) {
      updateData.reminder = body.reminder;
    }

    if (normalizedSelectedDays !== undefined) {
      updateData.selectedDays = body.recurring === 'Weekly' ? normalizedSelectedDays : [];
    }

    if (body.hasWorkflow !== undefined) {
      updateData.hasWorkflow = body.hasWorkflow;
    }

    if (body.checklists !== undefined) {
      updateData.checklists = body.checklists.map((list: any) => ({
        ...list,
        name: stripHtml(list.name || ''),
        items: list.items?.map((item: any) => ({
          ...item,
          text: sanitizeInput(item.text || '')
        })) || []
      }));
    }

    if (body.comments !== undefined) {
      updateData.comments = body.comments.map((comment: any) => ({
        ...comment,
        text: sanitizeInput(comment.text || '')
      }));
    }

    if (body.attachments !== undefined) {
      updateData.attachments = body.attachments;
    }

    if (body.workflows !== undefined) {
      updateData.workflows = body.workflows;
    }

    if (body.boardId !== undefined) {
      updateData.boardId = body.boardId;
    }

    if (body.projectId !== undefined) {
      updateData.projectId = body.projectId;
    }

    if (body.order !== undefined) {
      updateData.order = body.order;
    }

    // === UPDATE TASK ===
    const task = await taskService.updateTask(id, dbUser._id.toString(), updateData);

    if (!task) {
      return reply.code(404).send({
        success: false,
        error: 'Not Found',
        message: 'Task not found',
      });
    }

    // === AUDIT LOGGING ===
    request.log.info({
      event: 'task_updated',
      userId: request.user!.id,
      taskId: task._id,
      taskName: task.name,
      changes: Object.keys(updateData),
      timestamp: new Date().toISOString(),
    });

    return reply.send({
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
      message: 'Task updated successfully',
    });

  } catch (error: any) {
    request.log.error({
      msg: 'Error updating task',
      error: error.message,
      stack: error.stack,
      userId: request.user?.id,
      taskId: request.params.id,
      body: request.body,
    });

    // Handle specific database errors
    if (error.name === 'CastError') {
      return reply.code(400).send({
        success: false,
        error: 'Validation Error',
        message: 'Invalid data format',
        details: error.message,
      });
    }

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
      message: 'Failed to update task. Please try again.',
    });
  }
}
