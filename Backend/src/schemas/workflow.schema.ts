/**
 * JSON Schemas for Fastify validation
 */

export const createWorkflowSchema = {
  body: {
    type: 'object',
    required: ['name', 'description', 'triggers', 'containers', 'formFields'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
      },
      description: {
        type: 'string',
        maxLength: 1000,
      },
      triggers: {
        type: 'array',
      },
      containers: {
        type: 'array',
      },
      formFields: {
        type: 'array',
      },
      triggerLogic: {
        type: 'array',
      },
      status: {
        type: 'string',
        enum: ['draft', 'published', 'archived'],
      },
      isPublic: {
        type: 'boolean',
      },
      category: {
        type: 'string',
      },
      tags: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      icon: {
        type: 'string',
      },
      coverImage: {
        type: 'string',
      },
    },
  },
};

export const updateWorkflowSchema = {
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
      },
      description: {
        type: 'string',
        maxLength: 1000,
      },
      triggers: {
        type: 'array',
      },
      containers: {
        type: 'array',
      },
      formFields: {
        type: 'array',
      },
      triggerLogic: {
        type: 'array',
      },
      status: {
        type: 'string',
        enum: ['draft', 'published', 'archived'],
      },
      isPublic: {
        type: 'boolean',
      },
      category: {
        type: 'string',
      },
      tags: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      icon: {
        type: 'string',
      },
      coverImage: {
        type: 'string',
      },
    },
  },
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
      },
    },
  },
};

export const getWorkflowSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
      },
    },
  },
};

export const listWorkflowsSchema = {
  querystring: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1,
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20,
      },
      status: {
        type: 'string',
        enum: ['draft', 'published', 'archived'],
      },
      isPublic: {
        type: 'boolean',
      },
      category: {
        type: 'string',
      },
      tags: {
        type: 'string', // Comma-separated tags
      },
      search: {
        type: 'string',
      },
    },
  },
};

