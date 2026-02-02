# Backend Development Guide

## Overview

This guide covers the backend architecture, development patterns, and best practices for the FlowversalAI platform. The backend follows a modular, service-oriented architecture built with Fastify, TypeScript, and MongoDB.

## Architecture Overview

### Core Principles

- **Modular Design**: Each feature is self-contained with clear boundaries
- **Dependency Injection**: Services are injected rather than directly imported
- **Type Safety**: Comprehensive TypeScript coverage throughout
- **Separation of Concerns**: Routes, services, models, and types are separated
- **Testability**: Each module can be tested in isolation

### Module Structure

Every backend module follows this consistent structure:

```
modules/{feature}/
├── routes/                 # API route definitions and handlers
│   ├── {feature}.routes.ts    # Main route file with Fastify plugin
│   ├── handlers/             # Individual route handler functions
│   │   └── *.handler.ts      # Handler implementations
│   ├── validators/           # Input validation schemas
│   │   └── *.validator.ts    # Joi or Zod validation schemas
│   ├── types/               # Route-specific TypeScript types
│   │   └── *.types.ts       # Request/response type definitions
│   └── index.ts             # Route module exports
├── services/               # Business logic and data operations
│   ├── {feature}.service.ts     # Main service class
│   ├── {submodule}/            # Sub-service modules (executors, validators, etc.)
│   │   ├── executors/         # Business logic executors
│   │   │   └── *.executor.ts  # Specific execution logic
│   │   ├── validators/        # Business rule validators
│   │   │   └── *.validator.ts # Business validation logic
│   │   └── types/            # Service-specific types
│   │       └── *.types.ts    # Service type definitions
│   └── index.ts              # Service exports
├── models/                 # Database models and schemas
│   ├── {feature}.model.ts      # Mongoose model definitions
│   └── index.ts               # Model exports
├── types/                  # Module-level TypeScript definitions
│   ├── index.ts             # Main type exports
│   └── *.types.ts           # Feature-specific types
└── index.ts               # Module exports
```

## Creating a New Module

### Step 1: Create Module Structure

```bash
# Create module directory
mkdir -p modules/{your-feature}/{routes,services,models,types}

# Create subdirectories as needed
mkdir -p modules/{your-feature}/routes/{handlers,validators,types}
mkdir -p modules/{your-feature}/services/{submodule}/executors
```

### Step 2: Define Types

Create `modules/{your-feature}/types/{your-feature}.types.ts`:

```typescript
// Data transfer objects
export interface CreateYourFeatureDTO {
  name: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UpdateYourFeatureDTO {
  id: string;
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface YourFeatureResponse {
  id: string;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Service interfaces
export interface IYourFeatureService {
  create(data: CreateYourFeatureDTO): Promise<YourFeatureResponse>;
  getById(id: string): Promise<YourFeatureResponse | null>;
  update(data: UpdateYourFeatureDTO): Promise<YourFeatureResponse>;
  delete(id: string): Promise<void>;
  list(filters?: YourFeatureFilters): Promise<YourFeatureResponse[]>;
}

export interface YourFeatureFilters {
  name?: string;
  limit?: number;
  offset?: number;
}
```

### Step 3: Create Mongoose Model

Create `modules/{your-feature}/models/{your-feature}.model.ts`:

```typescript
import { Schema, model, Document } from 'mongoose';

export interface IYourFeature extends Document {
  name: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const YourFeatureSchema = new Schema<IYourFeature>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'your_features'
});

// Indexes
YourFeatureSchema.index({ name: 1 });
YourFeatureSchema.index({ createdAt: -1 });

// Virtuals
YourFeatureSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
YourFeatureSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
});

export const YourFeatureModel = model<IYourFeature>('YourFeature', YourFeatureSchema);
```

### Step 4: Create Validators

Create `modules/{your-feature}/routes/validators/{your-feature}.validator.ts`:

```typescript
import Joi from 'joi';

// Request validation schemas
export const createYourFeatureSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    description: Joi.string().trim().max(500).optional(),
    metadata: Joi.object().optional()
  })
});

export const updateYourFeatureSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }),
  body: Joi.object({
    name: Joi.string().trim().min(1).max(100).optional(),
    description: Joi.string().trim().max(500).optional(),
    metadata: Joi.object().optional()
  })
});

export const getYourFeatureSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  })
});

export const listYourFeaturesSchema = Joi.object({
  query: Joi.object({
    name: Joi.string().optional(),
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0)
  })
});
```

### Step 5: Create Service

Create `modules/{your-feature}/services/{your-feature}.service.ts`:

```typescript
import { YourFeatureModel, IYourFeature } from '../models/your-feature.model';
import {
  IYourFeatureService,
  CreateYourFeatureDTO,
  UpdateYourFeatureDTO,
  YourFeatureResponse,
  YourFeatureFilters
} from '../types/your-feature.types';

export class YourFeatureService implements IYourFeatureService {
  async create(data: CreateYourFeatureDTO): Promise<YourFeatureResponse> {
    const yourFeature = new YourFeatureModel(data);
    const saved = await yourFeature.save();

    return {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      metadata: saved.metadata,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt
    };
  }

  async getById(id: string): Promise<YourFeatureResponse | null> {
    const yourFeature = await YourFeatureModel.findById(id);
    if (!yourFeature) return null;

    return {
      id: yourFeature.id,
      name: yourFeature.name,
      description: yourFeature.description,
      metadata: yourFeature.metadata,
      createdAt: yourFeature.createdAt,
      updatedAt: yourFeature.updatedAt
    };
  }

  async update(data: UpdateYourFeatureDTO): Promise<YourFeatureResponse> {
    const { id, ...updateData } = data;
    const yourFeature = await YourFeatureModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!yourFeature) {
      throw new Error('YourFeature not found');
    }

    return {
      id: yourFeature.id,
      name: yourFeature.name,
      description: yourFeature.description,
      metadata: yourFeature.metadata,
      createdAt: yourFeature.createdAt,
      updatedAt: yourFeature.updatedAt
    };
  }

  async delete(id: string): Promise<void> {
    const result = await YourFeatureModel.findByIdAndDelete(id);
    if (!result) {
      throw new Error('YourFeature not found');
    }
  }

  async list(filters: YourFeatureFilters = {}): Promise<YourFeatureResponse[]> {
    const query: any = {};

    if (filters.name) {
      query.name = new RegExp(filters.name, 'i');
    }

    const yourFeatures = await YourFeatureModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 20)
      .skip(filters.offset || 0);

    return yourFeatures.map(yf => ({
      id: yf.id,
      name: yf.name,
      description: yf.description,
      metadata: yf.metadata,
      createdAt: yf.createdAt,
      updatedAt: yf.updatedAt
    }));
  }
}
```

### Step 6: Create Route Handlers

Create `modules/{your-feature}/routes/handlers/{your-feature}.handlers.ts`:

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { YourFeatureService } from '../../services/your-feature.service';
import {
  CreateYourFeatureDTO,
  UpdateYourFeatureDTO,
  YourFeatureFilters
} from '../../types/your-feature.types';

// Type definitions for validated requests
interface CreateYourFeatureRequest {
  Body: CreateYourFeatureDTO;
}

interface UpdateYourFeatureRequest {
  Params: { id: string };
  Body: UpdateYourFeatureDTO;
}

interface GetYourFeatureRequest {
  Params: { id: string };
}

interface ListYourFeaturesRequest {
  Querystring: YourFeatureFilters;
}

export class YourFeatureHandlers {
  constructor(private yourFeatureService: YourFeatureService) {}

  async createYourFeature(
    request: FastifyRequest<CreateYourFeatureRequest>,
    reply: FastifyReply
  ) {
    try {
      const data = request.body;
      const result = await this.yourFeatureService.create(data);

      reply.code(201).send({
        success: true,
        data: result
      });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({
        success: false,
        error: 'Failed to create your feature'
      });
    }
  }

  async getYourFeature(
    request: FastifyRequest<GetYourFeatureRequest>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const result = await this.yourFeatureService.getById(id);

      if (!result) {
        reply.code(404).send({
          success: false,
          error: 'Your feature not found'
        });
        return;
      }

      reply.send({
        success: true,
        data: result
      });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({
        success: false,
        error: 'Failed to get your feature'
      });
    }
  }

  async updateYourFeature(
    request: FastifyRequest<UpdateYourFeatureRequest>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const data = { id, ...request.body };
      const result = await this.yourFeatureService.update(data);

      reply.send({
        success: true,
        data: result
      });
    } catch (error) {
      request.log.error(error);

      if (error.message === 'YourFeature not found') {
        reply.code(404).send({
          success: false,
          error: 'Your feature not found'
        });
        return;
      }

      reply.code(500).send({
        success: false,
        error: 'Failed to update your feature'
      });
    }
  }

  async deleteYourFeature(
    request: FastifyRequest<GetYourFeatureRequest>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      await this.yourFeatureService.delete(id);

      reply.send({
        success: true,
        message: 'Your feature deleted successfully'
      });
    } catch (error) {
      request.log.error(error);

      if (error.message === 'YourFeature not found') {
        reply.code(404).send({
          success: false,
          error: 'Your feature not found'
        });
        return;
      }

      reply.code(500).send({
        success: false,
        error: 'Failed to delete your feature'
      });
    }
  }

  async listYourFeatures(
    request: FastifyRequest<ListYourFeaturesRequest>,
    reply: FastifyReply
  ) {
    try {
      const filters = request.query;
      const result = await this.yourFeatureService.list(filters);

      reply.send({
        success: true,
        data: result
      });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({
        success: false,
        error: 'Failed to list your features'
      });
    }
  }
}
```

### Step 7: Create Routes

Create `modules/{your-feature}/routes/{your-feature}.routes.ts`:

```typescript
import { FastifyPluginAsync } from 'fastify';
import { YourFeatureService } from '../services/your-feature.service';
import { YourFeatureHandlers } from './handlers/your-feature.handlers';
import {
  createYourFeatureSchema,
  updateYourFeatureSchema,
  getYourFeatureSchema,
  listYourFeaturesSchema
} from './validators/your-feature.validator';

const yourFeatureRoutes: FastifyPluginAsync = async (fastify) => {
  // Dependency injection - get service from DI container
  const yourFeatureService = fastify.diContainer.resolve(YourFeatureService);
  const handlers = new YourFeatureHandlers(yourFeatureService);

  // Routes
  fastify.post('/your-features', {
    schema: createYourFeatureSchema,
    handler: handlers.createYourFeature.bind(handlers)
  });

  fastify.get('/your-features', {
    schema: listYourFeaturesSchema,
    handler: handlers.listYourFeatures.bind(handlers)
  });

  fastify.get('/your-features/:id', {
    schema: getYourFeatureSchema,
    handler: handlers.getYourFeature.bind(handlers)
  });

  fastify.put('/your-features/:id', {
    schema: updateYourFeatureSchema,
    handler: handlers.updateYourFeature.bind(handlers)
  });

  fastify.delete('/your-features/:id', {
    schema: getYourFeatureSchema,
    handler: handlers.deleteYourFeature.bind(handlers)
  });
};

export default yourFeatureRoutes;
```

### Step 8: Register Module

Update the main application to register your new module:

```typescript
// In src/app.ts or main server file
import yourFeatureRoutes from './modules/your-feature/routes/your-feature.routes';

// Register routes
fastify.register(yourFeatureRoutes, { prefix: '/api/v1' });
```

### Step 9: Add Tests

Create tests for your module:

```typescript
// modules/{your-feature}/__tests__/{your-feature}.service.test.ts
import { YourFeatureService } from '../services/your-feature.service';
import { YourFeatureModel } from '../models/your-feature.model';

describe('YourFeatureService', () => {
  let service: YourFeatureService;

  beforeEach(() => {
    service = new YourFeatureService();
  });

  describe('create', () => {
    it('should create a new your feature', async () => {
      const data = {
        name: 'Test Feature',
        description: 'Test description'
      };

      const result = await service.create(data);

      expect(result).toBeDefined();
      expect(result.name).toBe(data.name);
      expect(result.description).toBe(data.description);
    });
  });

  // Add more tests...
});
```

## Best Practices

### Error Handling

Always use proper error handling:

```typescript
// ✅ Good - Specific error types
try {
  const result = await someOperation();
  return result;
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    throw new ValidationError('Invalid input data');
  }
  if (error.code === 'NOT_FOUND') {
    throw new NotFoundError('Resource not found');
  }
  throw new InternalServerError('Unexpected error occurred');
}

// ❌ Bad - Generic error handling
try {
  return await someOperation();
} catch (error) {
  throw new Error('Something went wrong');
}
```

### Validation

Use schema validation for all inputs:

```typescript
// ✅ Good - Comprehensive validation
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('admin', 'user', 'moderator').default('user')
});

// ❌ Bad - No validation
app.post('/users', (req, res) => {
  const user = req.body; // Trusting user input
  // ...
});
```

### Logging

Use structured logging:

```typescript
// ✅ Good - Structured logging
request.log.info({
  event: 'user_created',
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString()
}, 'User account created successfully');

// ❌ Bad - String concatenation
console.log(`User ${user.email} created at ${new Date()}`);
```

### Performance

Implement caching and optimization:

```typescript
// ✅ Good - Cached database queries
class CachedUserService {
  @Cache({ ttl: 300 }) // 5 minutes
  async getUserById(id: string) {
    return await UserModel.findById(id);
  }
}

// ✅ Good - Pagination for large datasets
async listUsers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return await UserModel.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
}
```

## Testing Strategy

### Unit Tests

Test individual functions and classes:

```typescript
describe('UserService', () => {
  let userService: UserService;
  let mockUserModel: jest.Mocked<UserModel>;

  beforeEach(() => {
    mockUserModel = createMock<UserModel>();
    userService = new UserService(mockUserModel);
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData = { email: 'test@example.com', name: 'Test User' };
      mockUserModel.create.mockResolvedValue(userData as any);

      const result = await userService.createUser(userData);

      expect(result).toEqual(userData);
      expect(mockUserModel.create).toHaveBeenCalledWith(userData);
    });
  });
});
```

### Integration Tests

Test module interactions:

```typescript
describe('User API Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create and retrieve a user', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' };

    // Create user
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/users',
      payload: userData
    });

    expect(createResponse.statusCode).toBe(201);
    const createdUser = JSON.parse(createResponse.payload).data;

    // Retrieve user
    const getResponse = await app.inject({
      method: 'GET',
      url: `/api/v1/users/${createdUser.id}`
    });

    expect(getResponse.statusCode).toBe(200);
    const retrievedUser = JSON.parse(getResponse.payload).data;
    expect(retrievedUser.id).toBe(createdUser.id);
  });
});
```

### E2E Tests

Test complete user journeys:

```typescript
describe('User Registration Flow', () => {
  it('should allow user registration and login', async () => {
    // Register user
    await page.goto('/register');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="register-button"]');

    // Verify registration
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Verify login
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
  });
});
```

## Deployment

### Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/flowversal
REDIS_URL=redis://localhost:6379

# Application
NODE_ENV=production
PORT=3002
LOG_LEVEL=info

# Security
JWT_SECRET=your-secure-jwt-secret
BCRYPT_ROUNDS=12

# External Services
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-key
```

### Docker Deployment

```dockerfile
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S flowversal -u 1001

USER flowversal

EXPOSE 3002

CMD ["npm", "start"]
```

## Monitoring and Observability

### Health Checks

```typescript
// Health check endpoint
fastify.get('/health', async (request, reply) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabaseHealth(),
      redis: await checkRedisHealth(),
      external: await checkExternalServices()
    }
  };

  const isHealthy = Object.values(health.services).every(s => s.status === 'ok');
  reply.code(isHealthy ? 200 : 503).send(health);
});
```

### Metrics

```typescript
// Prometheus metrics
import fastifyMetrics from 'fastify-metrics';

fastify.register(fastifyMetrics, {
  endpoint: '/metrics',
  routeMetrics: {
    enabled: true,
    groupStatusCodes: true
  }
});
```

### Logging

```typescript
// Structured logging with Pino
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  }
});
```

## Security Best Practices

### Input Validation

```typescript
// Always validate and sanitize inputs
const sanitizedInput = sanitizeHtml(dirtyInput);
const validatedData = await validateInputSchema(sanitizedInput);
```

### Authentication & Authorization

```typescript
// Use JWT with proper expiration
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Check permissions
if (!user.hasPermission('admin')) {
  throw new ForbiddenError('Insufficient permissions');
}
```

### Data Protection

```typescript
// Hash sensitive data
const hashedPassword = await bcrypt.hash(password, 12);

// Encrypt sensitive fields
const encryptedSSN = encryptField(ssn, process.env.ENCRYPTION_KEY);
```

## Conclusion

Following this guide ensures your backend modules are:

- **Maintainable**: Clear structure and separation of concerns
- **Testable**: Each component can be tested in isolation
- **Scalable**: Modular design allows for easy extension
- **Secure**: Built-in security best practices
- **Performant**: Optimized queries and caching strategies

Remember to always keep the single responsibility principle in mind and maintain consistent patterns across all modules.
