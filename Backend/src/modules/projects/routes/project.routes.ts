import { FastifyPluginAsync } from 'fastify';
import { sanitizeInput, stripHtml } from '../../../core/utils/sanitizer.util';
import { userService } from '../../users/services/user.service';
import { projectService } from '../services/project.service';
interface CreateProjectBody {
  name: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  configuration?: Record<string, any>;
}
interface UpdateProjectBody {
  name?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  configuration?: Record<string, any>;
}
interface ListProjectsQuery {
  search?: string;
}
const projectRoutes: FastifyPluginAsync = async (fastify) => {
  // Create project with best practices
  fastify.post<{ Body: CreateProjectBody }>('/', async (request, reply) => {
    try {
      const body = request.body as CreateProjectBody;
      const name = stripHtml(body.name);
      const description = sanitizeInput(body.description || '');
      const { icon, iconColor, configuration } = body;
      // === INPUT VALIDATION ===
      const validationErrors: string[] = [];
      if (!name || typeof name !== 'string') {
        validationErrors.push('Project name is required and must be a string');
      } else if (name.trim().length === 0) {
        validationErrors.push('Project name cannot be empty');
      } else if (name.trim().length > 100) {
        validationErrors.push('Project name must be less than 100 characters');
      }
      if (description && typeof description !== 'string') {
        validationErrors.push('Description must be a string');
      } else if (description && description.length > 500) {
        validationErrors.push('Description must be less than 500 characters');
      }
      if (icon && typeof icon !== 'string') {
        validationErrors.push('Icon must be a string');
      }
      if (iconColor && typeof iconColor !== 'string') {
        validationErrors.push('Icon color must be a string');
      }
      if (validationErrors.length > 0) {
        return reply.code(400).send({
          success: false,
          error: 'Validation Error',
          message: 'Please correct the following errors:',
          details: validationErrors,
        });
      }
      // === BUSINESS LOGIC VALIDATION ===
      const dbUser = await userService.getOrCreateUserFromSupabase(request.user!.id, request.user);
      // Check for duplicate project names for this user
      const existingProject = await projectService.getProjectByNameAndUser(name.trim(), dbUser._id.toString());
      if (existingProject) {
        return reply.code(409).send({
          success: false,
          error: 'Conflict',
          message: 'A project with this name already exists',
        });
      }
      // === CREATE PROJECT ===
      const projectData = {
          name: name.trim(),
        description: description?.trim() || '',
        icon: icon || '📁', // Default icon
        iconColor: iconColor || '#6366f1', // Default indigo color
        configuration: configuration || {},
      };
      const project = await projectService.createProject(projectData, dbUser._id.toString());
      // === AUDIT LOGGING ===
      fastify.log.info({
        event: 'project_created',
        userId: request.user!.id,
        projectId: project._id,
        projectName: project.name,
        timestamp: new Date().toISOString(),
      });
      return reply.code(201).send({
        success: true,
        data: {
          id: project._id,
          name: project.name,
          description: project.description,
          icon: project.icon,
          iconColor: project.iconColor,
          configuration: project.configuration,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
        message: 'Project created successfully',
      });
    } catch (error: any) {
      fastify.log.error({
        msg: 'Error creating project',
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
          message: 'A project with this name already exists',
        });
      }
      return reply.code(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create project. Please try again.',
      });
    }
  });
  // List projects
  fastify.get<{ Querystring: ListProjectsQuery }>('/', async (request, reply) => {
    try {
      const dbUser = await userService.getOrCreateUserFromSupabase(request.user!.id, request.user);
      const query = request.query as ListProjectsQuery;
      const projects = await projectService.getProjects(dbUser._id.toString(), query.search);
      return reply.send({
        success: true,
        data: projects,
        count: projects.length,
      });
    } catch (error: any) {
      fastify.log.error('Error listing projects:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch projects. Please try again.',
        details: error.message,
      });
    }
  });
  // Get project by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const dbUser = await userService.getOrCreateUserFromSupabase(request.user!.id, request.user);
      const { id } = request.params;
      const project = await projectService.getProjectById(id, dbUser._id.toString());
      if (!project) {
        return reply.code(404).send({
          success: false,
          error: 'Not Found',
          message: 'Project not found',
        });
      }
      return reply.send({
        success: true,
        data: project,
      });
    } catch (error: any) {
      fastify.log.error('Error getting project:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch project. Please try again.',
        details: error.message,
      });
    }
  });
  // Update project
  fastify.put<{ Params: { id: string }; Body: UpdateProjectBody }>('/:id', async (request, reply) => {
    try {
      const dbUser = await userService.getOrCreateUserFromSupabase(request.user!.id, request.user);
      const { id } = request.params;
      const updateData = request.body as UpdateProjectBody;
      
      if (updateData.name) updateData.name = stripHtml(updateData.name);
      if (updateData.description) updateData.description = sanitizeInput(updateData.description);

      if (updateData.name !== undefined && !updateData.name.trim()) {
        return reply.code(400).send({
          success: false,
          error: 'Validation Error',
          message: 'Project name cannot be empty',
        });
      }
      const project = await projectService.updateProject(id, dbUser._id.toString(), updateData);
      if (!project) {
        return reply.code(404).send({
          success: false,
          error: 'Not Found',
          message: 'Project not found',
        });
      }
      return reply.send({
        success: true,
        data: project,
        message: 'Project updated successfully',
      });
    } catch (error: any) {
      fastify.log.error('Error updating project:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update project. Please try again.',
        details: error.message,
      });
    }
  });
  // Delete project
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const dbUser = await userService.getOrCreateUserFromSupabase(request.user!.id, request.user);
      const { id } = request.params;
      const result = await projectService.deleteProject(id, dbUser._id.toString());
      return reply.send({
        success: true,
        message: 'Project deleted successfully',
        deleted: result,
      });
    } catch (error: any) {
      fastify.log.error('Error deleting project:', error);
      if (error.message === 'Project not found') {
        return reply.code(404).send({
          success: false,
          error: 'Not Found',
          message: 'Project not found',
        });
      }
      return reply.code(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to delete project. Please try again.',
        details: error.message,
      });
    }
  });
};
export default projectRoutes;
