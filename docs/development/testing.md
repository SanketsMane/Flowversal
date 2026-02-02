# Testing Guide

## Overview

This guide covers testing strategies and best practices for the FlowversalAI platform.

## Backend Testing

### Unit Tests

Unit tests are located in `App/Backend/src/__tests__/unit/` and test individual functions and classes in isolation.

**Example:**
```typescript
import { WorkflowExecutionService } from '../../../modules/workflows/services/workflow-execution/workflow-execution.service';

describe('WorkflowExecutionService', () => {
  let service: WorkflowExecutionService;

  beforeEach(() => {
    service = new WorkflowExecutionService();
  });

  it('should execute a workflow with valid input', async () => {
    // Test implementation
  });
});
```

### Integration Tests

Integration tests are located in `App/Backend/src/__tests__/integration/` and test API endpoints and module interactions.

**Running Tests:**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Frontend Testing

### Component Tests

Component tests use Vitest and React Testing Library.

**Example:**
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/shared/components/ui/button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### E2E Tests

E2E tests use Playwright to test complete user workflows.

**Running Tests:**
```bash
# Run unit tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Best Practices

1. **Write tests first** (TDD) when possible
2. **Test behavior, not implementation**
3. **Keep tests isolated** - each test should be independent
4. **Use descriptive test names** - they should explain what is being tested
5. **Mock external dependencies** - don't make real API calls in unit tests
6. **Maintain high coverage** - aim for 80%+ coverage on critical paths

