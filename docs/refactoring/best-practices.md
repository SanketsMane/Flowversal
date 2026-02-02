# Refactoring Best Practices - FlowversalAI

## Overview

This document outlines the best practices established during the comprehensive refactoring of the FlowversalAI codebase. These patterns ensure maintainable, scalable, and high-quality code.

## Architectural Principles

### 1. Single Responsibility Principle (SRP)

**Definition**: Every module, class, or function should have one, and only one, reason to change.

**Backend Example**:
```typescript
// ✅ Good - Single responsibility
export class WorkflowValidationService {
  validateWorkflow(workflow: Workflow): ValidationResult {
    // Only validation logic
  }
}

export class WorkflowExecutionService {
  executeWorkflow(workflow: Workflow): Promise<ExecutionResult> {
    // Only execution orchestration
  }
}

// ❌ Bad - Multiple responsibilities
export class WorkflowService {
  validateWorkflow(workflow: Workflow): ValidationResult {
    // Validation logic
  }

  executeWorkflow(workflow: Workflow): Promise<ExecutionResult> {
    // Execution logic
  }

  sendEmail(to: string, subject: string): Promise<void> {
    // Email logic - different responsibility
  }
}
```

**Frontend Example**:
```typescript
// ✅ Good - Single responsibility components
function TaskList({ tasks, onTaskSelect }: TaskListProps) {
  return (
    <div>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onSelect={onTaskSelect} />
      ))}
    </div>
  );
}

function TaskItem({ task, onSelect }: TaskItemProps) {
  return (
    <div onClick={() => onSelect(task.id)}>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
    </div>
  );
}

// ❌ Bad - Multiple responsibilities
function TaskManager({ projectId }: TaskManagerProps) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  // Data fetching logic
  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  // UI rendering logic
  // Form handling logic
  // State management logic
  // All mixed together...
}
```

### 2. Dependency Inversion Principle (DIP)

**Definition**: Depend on abstractions, not concretions.

```typescript
// ✅ Good - Dependency injection with interfaces
interface IWorkflowRepository {
  save(workflow: Workflow): Promise<void>;
  findById(id: string): Promise<Workflow | null>;
}

interface IWorkflowService {
  createWorkflow(data: CreateWorkflowData): Promise<Workflow>;
}

export class WorkflowService implements IWorkflowService {
  constructor(private repository: IWorkflowRepository) {}

  async createWorkflow(data: CreateWorkflowData): Promise<Workflow> {
    const workflow = new Workflow(data);
    await this.repository.save(workflow);
    return workflow;
  }
}

// ❌ Bad - Direct dependencies
export class WorkflowService {
  private repository = new MongoWorkflowRepository(); // Concrete dependency

  async createWorkflow(data: CreateWorkflowData): Promise<Workflow> {
    // Tightly coupled to MongoDB implementation
  }
}
```

### 3. Interface Segregation Principle (ISP)

**Definition**: Clients should not be forced to depend on interfaces they do not use.

```typescript
// ✅ Good - Segregated interfaces
interface IReadableWorkflowService {
  getWorkflow(id: string): Promise<Workflow>;
  listWorkflows(filters: WorkflowFilters): Promise<Workflow[]>;
}

interface IWritableWorkflowService {
  createWorkflow(data: CreateWorkflowData): Promise<Workflow>;
  updateWorkflow(id: string, data: UpdateWorkflowData): Promise<Workflow>;
  deleteWorkflow(id: string): Promise<void>;
}

interface IWorkflowExecutionService {
  executeWorkflow(id: string, input: any): Promise<ExecutionResult>;
}

// Usage - depend only on needed interfaces
export class WorkflowController {
  constructor(
    private readableService: IReadableWorkflowService,
    private writableService: IWritableWorkflowService,
    private executionService: IWorkflowExecutionService
  ) {}
}

// ❌ Bad - Single large interface
interface IWorkflowService {
  // Read operations
  getWorkflow(id: string): Promise<Workflow>;
  listWorkflows(filters: WorkflowFilters): Promise<Workflow[]>;

  // Write operations
  createWorkflow(data: CreateWorkflowData): Promise<Workflow>;
  updateWorkflow(id: string, data: UpdateWorkflowData): Promise<Workflow>;
  deleteWorkflow(id: string): Promise<void>;

  // Execution operations
  executeWorkflow(id: string, input: any): Promise<ExecutionResult>;

  // Utility operations
  validateWorkflow(workflow: Workflow): ValidationResult;
  exportWorkflow(id: string): Promise<string>;
  importWorkflow(data: string): Promise<Workflow>;
}
```

## Code Organization Patterns

### 1. Module Structure Pattern

```
modules/{feature}/
├── routes/                 # API endpoints
│   ├── {feature}.routes.ts    # Main route definitions
│   ├── handlers/             # Individual route handlers
│   ├── validators/           # Input validation
│   └── types/               # Route-specific types
├── services/               # Business logic
│   ├── {feature}.service.ts     # Main service
│   ├── {subfeature}/           # Sub-service modules
│   └── index.ts              # Service exports
├── models/                 # Data models
├── types/                  # Module types
└── index.ts               # Module exports
```

### 2. Feature Structure Pattern

```
features/{feature}/
├── components/             # React components
│   ├── {Feature}.tsx          # Main component
│   ├── {subcomponents}/       # Sub-components
│   ├── hooks/                # Component hooks
│   └── types/                # Component types
├── store/                  # State management
├── utils/                  # Feature utilities
├── types/                  # Feature types
└── index.ts               # Feature exports
```

### 3. Component Patterns

#### Container vs Presentational Components

```typescript
// ✅ Good - Presentational component (pure, reusable)
interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showOnlineStatus?: boolean;
}

export const UserAvatar = React.memo<UserAvatarProps>(({
  user,
  size = 'md',
  showOnlineStatus = false
}) => {
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }[size];

  return (
    <div className="relative">
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizeClass} rounded-full`}
      />
      {showOnlineStatus && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
});

// ✅ Good - Container component (handles data and logic)
export function UserProfile({ userId }: UserProfileProps) {
  const { user, isLoading, error } = useUserStore();

  useEffect(() => {
    useUserStore.getState().loadUser(userId);
  }, [userId]);

  if (isLoading) return <UserProfileSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <NotFound />;

  return (
    <div className="user-profile">
      <UserAvatar user={user} size="lg" showOnlineStatus />
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  );
}
```

#### Compound Component Pattern

```typescript
// ✅ Good - Compound components for complex UI
interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface TabListProps {
  children: React.ReactNode;
}

interface TabProps {
  value: string;
  children: React.ReactNode;
}

interface TabContentProps {
  value: string;
  children: React.ReactNode;
}

const TabsContext = React.createContext<{
  activeTab: string;
  onTabChange: (value: string) => void;
} | null>(null);

function Tabs({ children, defaultValue, onValueChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || '');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  return (
    <TabsContext.Provider value={{ activeTab, onTabChange: handleTabChange }}>
      {children}
    </TabsContext.Provider>
  );
}

function TabList({ children }: TabListProps) {
  return <div className="flex border-b">{children}</div>;
}

function Tab({ value, children }: TabProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');

  const { activeTab, onTabChange } = context;
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => onTabChange(value)}
      className={`px-4 py-2 border-b-2 transition-colors ${
        isActive
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function TabContent({ value, children }: TabContentProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabContent must be used within Tabs');

  const { activeTab } = context;

  if (activeTab !== value) return null;
  return <div>{children}</div>;
}

// Usage
<Tabs defaultValue="profile">
  <TabList>
    <Tab value="profile">Profile</Tab>
    <Tab value="settings">Settings</Tab>
    <Tab value="security">Security</Tab>
  </TabList>

  <TabContent value="profile">
    <ProfileForm />
  </TabContent>

  <TabContent value="settings">
    <SettingsForm />
  </TabContent>

  <TabContent value="security">
    <SecurityForm />
  </TabContent>
</Tabs>
```

## State Management Patterns

### 1. Zustand Store Pattern

```typescript
// ✅ Good - Focused stores with clear separation
interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  filters: TaskFilters;
  isLoading: boolean;
  error: string | null;
}

interface TaskActions {
  loadTasks: (filters?: TaskFilters) => Promise<void>;
  createTask: (data: CreateTaskData) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskData) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  setSelectedTask: (task: Task | null) => void;
  setFilters: (filters: TaskFilters) => void;
}

type TaskStore = TaskState & TaskActions;

export const useTaskStore = create<TaskStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        tasks: [],
        selectedTask: null,
        filters: { status: 'all' },
        isLoading: false,
        error: null,

        // Actions
        loadTasks: async (filters) => {
          set({ isLoading: true, error: null });

          try {
            const appliedFilters = { ...get().filters, ...filters };
            const tasks = await taskApi.getTasks(appliedFilters);

            set({
              tasks,
              filters: appliedFilters,
              isLoading: false
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to load tasks',
              isLoading: false
            });
          }
        },

        createTask: async (data) => {
          set({ isLoading: true, error: null });

          try {
            const newTask = await taskApi.createTask(data);
            const tasks = [...get().tasks, newTask];

            set({
              tasks,
              selectedTask: newTask,
              isLoading: false
            });

            return newTask;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
          }
        },

        // More actions...
      }),
      {
        name: 'task-store',
        partialize: (state) => ({
          filters: state.filters,
          selectedTask: state.selectedTask
        })
      }
    ),
    { name: 'task-store' }
  )
);
```

### 2. Custom Hook Pattern

```typescript
// ✅ Good - Extract complex logic into reusable hooks
interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: any;
  onSubmit: (values: T) => Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validate = useCallback(async () => {
    if (!validationSchema) return true;

    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationError: any) {
      const fieldErrors: Partial<Record<keyof T, string>> = {};
      validationError.inner.forEach((error: any) => {
        fieldErrors[error.path as keyof T] = error.message;
      });
      setErrors(fieldErrors);
      return false;
    }
  }, [values, validationSchema]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validate();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      setIsDirty(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsDirty(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    isDirty,
    setValue,
    handleSubmit,
    reset,
    validate
  };
}
```

## Error Handling Patterns

### 1. Error Boundary Pattern

```typescript
// ✅ Good - React error boundaries
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ComponentType<{ error: Error }> }>,
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div className="error-fallback">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  );
}

// Usage
<ErrorBoundary fallback={CustomErrorFallback}>
  <App />
</ErrorBoundary>
```

### 2. API Error Handling

```typescript
// ✅ Good - Structured API error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;

    throw new ApiError(message, status, error.code, error.response?.data);
  }

  if (error instanceof Error) {
    throw new ApiError(error.message, 500, 'INTERNAL_ERROR');
  }

  throw new ApiError('An unknown error occurred', 500, 'UNKNOWN_ERROR');
}

// Usage in services
export class ApiService {
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axios.request<T>(config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}
```

## Performance Patterns

### 1. React Performance Optimization

```typescript
// ✅ Good - Memoization and optimization
const ExpensiveComponent = React.memo<{
  data: ComplexData;
  onAction: (id: string) => void;
}>(({ data, onAction }) => {
  // Expensive computations
  const processedData = useMemo(() => {
    return data.items.map(item => ({
      ...item,
      computedValue: expensiveCalculation(item)
    }));
  }, [data.items]);

  const handleAction = useCallback((id: string) => {
    onAction(id);
  }, [onAction]);

  return (
    <div>
      {processedData.map(item => (
        <ItemComponent
          key={item.id}
          item={item}
          onAction={handleAction}
        />
      ))}
    </div>
  );
});

// ✅ Good - Lazy loading
const LazyWorkflowBuilder = lazy(() =>
  import('../features/workflows/WorkflowBuilder')
);

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/workflows" element={<LazyWorkflowBuilder />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. Bundle Optimization

```typescript
// ✅ Good - Dynamic imports for code splitting
export function loadWorkflowModule() {
  return import('../features/workflows');
}

export function loadTaskModule() {
  return import('../features/tasks');
}

// Usage
const WorkflowModule = await loadWorkflowModule();
const WorkflowBuilder = WorkflowModule.WorkflowBuilder;
```

## Testing Patterns

### 1. Unit Testing

```typescript
// ✅ Good - Focused unit tests
describe('TaskService', () => {
  let service: TaskService;
  let mockRepository: jest.Mocked<TaskRepository>;

  beforeEach(() => {
    mockRepository = createMock<TaskRepository>();
    service = new TaskService(mockRepository);
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const taskData = { title: 'Test Task', description: 'Test description' };
      const mockTask = { id: '1', ...taskData, createdAt: new Date() };

      mockRepository.create.mockResolvedValue(mockTask);

      const result = await service.createTask(taskData);

      expect(result).toEqual(mockTask);
      expect(mockRepository.create).toHaveBeenCalledWith(taskData);
    });

    it('should throw error for invalid data', async () => {
      const invalidData = { title: '' };

      await expect(service.createTask(invalidData)).rejects.toThrow('Title is required');
    });
  });
});
```

### 2. Component Testing

```typescript
// ✅ Good - Component testing with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskForm } from './TaskForm';

describe('TaskForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders form fields correctly', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/title/i);
    const submitButton = screen.getByRole('button', { name: /create task/i });

    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: ''
      });
    });
  });

  it('shows validation errors for empty title', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /create task/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });
});
```

### 3. Integration Testing

```typescript
// ✅ Good - API integration tests
describe('Task API Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/tasks', () => {
    it('creates a new task', async () => {
      const taskData = {
        title: 'Integration Test Task',
        description: 'Testing task creation'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tasks',
        payload: taskData
      });

      expect(response.statusCode).toBe(201);

      const responseBody = JSON.parse(response.payload);
      expect(responseBody.success).toBe(true);
      expect(responseBody.data.title).toBe(taskData.title);
      expect(responseBody.data).toHaveProperty('id');
      expect(responseBody.data).toHaveProperty('createdAt');
    });

    it('returns validation error for invalid data', async () => {
      const invalidData = { title: '' };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tasks',
        payload: invalidData
      });

      expect(response.statusCode).toBe(400);

      const responseBody = JSON.parse(response.payload);
      expect(responseBody.success).toBe(false);
      expect(responseBody.error).toContain('validation');
    });
  });
});
```

## Documentation Patterns

### 1. JSDoc Documentation

```typescript
/**
 * Creates a new workflow with the specified configuration.
 *
 * This function validates the workflow configuration, saves it to the database,
 * and initializes any necessary resources for execution.
 *
 * @param config - The workflow configuration object
 * @param config.name - The unique name for the workflow (3-50 characters)
 * @param config.nodes - Array of workflow nodes (minimum 1 node required)
 * @param config.connections - Array of connections between nodes
 * @param config.settings - Optional workflow settings
 * @returns Promise resolving to the created workflow with generated ID and timestamps
 * @throws {ValidationError} When the workflow configuration is invalid
 * @throws {DuplicateError} When a workflow with the same name already exists
 * @throws {DatabaseError} When there's a database connectivity issue
 *
 * @example
 * ```typescript
 * try {
 *   const workflow = await createWorkflow({
 *     name: 'User Onboarding Flow',
 *     nodes: [
 *       { id: 'start', type: 'trigger', config: { event: 'user.created' } },
 *       { id: 'welcome', type: 'action', config: { action: 'send_email' } }
 *     ],
 *     connections: [
 *       { from: 'start', to: 'welcome', condition: 'always' }
 *     ]
 *   });
 *
 *   console.log('Workflow created:', workflow.id);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.error('Invalid workflow:', error.details);
 *   } else {
 *     console.error('Failed to create workflow:', error.message);
 *   }
 * }
 * ```
 */
export async function createWorkflow(config: WorkflowConfig): Promise<Workflow> {
  // Implementation
}
```

### 2. README Documentation

Each module should have a comprehensive README:

```markdown
# Workflow Module

This module handles workflow creation, execution, and management in FlowversalAI.

## Features

- Workflow creation and validation
- Multi-step workflow execution
- Node-based workflow design
- Real-time execution monitoring
- Error handling and recovery

## Architecture

```
workflow/
├── routes/         # API endpoints
├── services/       # Business logic
├── executors/      # Execution engines
├── validators/     # Input validation
└── types/         # Type definitions
```

## Usage

### Creating a Workflow

```typescript
import { WorkflowService } from './services';

const service = new WorkflowService();
const workflow = await service.createWorkflow({
  name: 'User Registration',
  nodes: [/* workflow nodes */],
  connections: [/* node connections */]
});
```

### Executing a Workflow

```typescript
const result = await service.executeWorkflow(workflowId, inputData);
```

## API Reference

See [API Documentation](./api.md) for complete endpoint reference.
```

## Security Best Practices

### 1. Input Validation

```typescript
// ✅ Good - Comprehensive input validation
import Joi from 'joi';

const createWorkflowSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-_]+$/)
    .required()
    .messages({
      'string.min': 'Workflow name must be at least 3 characters',
      'string.max': 'Workflow name cannot exceed 100 characters',
      'string.pattern.base': 'Workflow name contains invalid characters'
    }),

  nodes: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        type: Joi.string().valid('trigger', 'action', 'condition').required(),
        config: Joi.object().required()
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Workflow must have at least one node'
    }),

  connections: Joi.array()
    .items(
      Joi.object({
        from: Joi.string().required(),
        to: Joi.string().required(),
        condition: Joi.string().optional()
      })
    )
    .optional()
});

// Usage
export async function validateWorkflowData(data: unknown): Promise<WorkflowData> {
  const { error, value } = createWorkflowSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new ValidationError('Invalid workflow data', error.details);
  }

  return value;
}
```

### 2. Authentication & Authorization

```typescript
// ✅ Good - Proper auth checks
export class WorkflowController {
  @authenticate()
  @authorize(['workflow:read'])
  async getWorkflow(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user.id;

    // Check if user owns the workflow or has access
    const workflow = await this.workflowService.getWorkflow(id, userId);

    if (!workflow) {
      throw new NotFoundError('Workflow not found');
    }

    reply.send({
      success: true,
      data: workflow
    });
  }

  @authenticate()
  @authorize(['workflow:create'])
  async createWorkflow(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as CreateWorkflowData;
    const userId = request.user.id;

    const workflow = await this.workflowService.createWorkflow(data, userId);

    reply.code(201).send({
      success: true,
      data: workflow
    });
  }
}
```

### 3. Data Sanitization

```typescript
// ✅ Good - Input sanitization
import DOMPurify from 'dompurify';
import validator from 'validator';

export function sanitizeUserInput(input: string): string {
  // Remove HTML tags
  const cleanHtml = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });

  // Escape special characters
  const escaped = validator.escape(cleanHtml);

  // Trim whitespace
  return escaped.trim();
}

export function sanitizeWorkflowName(name: string): string {
  return name
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .substring(0, 100); // Limit length
}
```

## Monitoring and Logging

### 1. Structured Logging

```typescript
// ✅ Good - Structured logging with context
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
    log: (obj) => ({
      ...obj,
      timestamp: new Date().toISOString(),
      service: 'flowversal-ai'
    })
  }
});

// Usage
export class WorkflowService {
  async executeWorkflow(workflowId: string, input: any) {
    const executionId = generateId();

    logger.info({
      event: 'workflow_execution_started',
      workflowId,
      executionId,
      inputSize: JSON.stringify(input).length
    }, 'Starting workflow execution');

    try {
      const result = await this.executeWorkflowInternal(workflowId, input);

      logger.info({
        event: 'workflow_execution_completed',
        workflowId,
        executionId,
        duration: Date.now() - startTime,
        outputSize: JSON.stringify(result).length
      }, 'Workflow execution completed successfully');

      return result;
    } catch (error) {
      logger.error({
        event: 'workflow_execution_failed',
        workflowId,
        executionId,
        error: error.message,
        stack: error.stack
      }, 'Workflow execution failed');

      throw error;
    }
  }
}
```

### 2. Performance Monitoring

```typescript
// ✅ Good - Performance monitoring
export function withPerformanceMonitoring<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operation: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = process.hrtime.bigint();

    try {
      const result = await fn(...args);

      const duration = Number(process.hrtime.bigint() - startTime) / 1e6; // Convert to milliseconds

      logger.info({
        event: 'operation_completed',
        operation,
        duration,
        success: true
      }, `${operation} completed in ${duration.toFixed(2)}ms`);

      // Record metrics
      metrics.recordHistogram('operation_duration', duration, { operation });
      metrics.incrementCounter('operation_success', { operation });

      return result;
    } catch (error) {
      const duration = Number(process.hrtime.bigint() - startTime) / 1e6;

      logger.error({
        event: 'operation_failed',
        operation,
        duration,
        error: error.message
      }, `${operation} failed after ${duration.toFixed(2)}ms`);

      metrics.incrementCounter('operation_error', { operation, error_type: error.name });

      throw error;
    }
  };
}

// Usage
export class WorkflowService {
  executeWorkflow = withPerformanceMonitoring(
    this.executeWorkflowInternal.bind(this),
    'workflow_execution'
  );
}
```

## Conclusion

Following these best practices ensures:

- **Maintainable Code**: Clear structure and separation of concerns
- **Reliable Systems**: Comprehensive error handling and testing
- **Secure Applications**: Proper input validation and authentication
- **Performant Solutions**: Optimized rendering and efficient data handling
- **Scalable Architecture**: Modular design that grows with requirements

The patterns established during the refactoring provide a solid foundation for future development and ensure consistent, high-quality code across the entire FlowversalAI platform.
