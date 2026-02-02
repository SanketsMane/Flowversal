# Debugging Guide

## VS Code Debugging

### Backend Debugging

1. Set breakpoints in your TypeScript files
2. Press F5 or select "Debug Backend" from the debug dropdown
3. The server will start in debug mode
4. Breakpoints will be hit when code executes

### Frontend Debugging

1. Start the frontend dev server: `npm run dev`
2. Set breakpoints in your React components
3. Press F5 or select "Debug Frontend" from the debug dropdown
4. Chrome will open with debugging enabled

### Test Debugging

1. Set breakpoints in test files
2. Select "Debug Backend Tests" configuration
3. Run the specific test file
4. Breakpoints will be hit during test execution

## Console Debugging

### Backend

Use the logger utility:
```typescript
import { logger } from '../shared/utils/logger.util';

logger.debug('Debug message', { data });
logger.info('Info message', { data });
logger.error('Error message', error, { context });
```

### Frontend

Use browser console:
```typescript
console.log('Debug message', data);
console.warn('Warning message', data);
console.error('Error message', error);
```

## Performance Debugging

### Backend

Use performance monitoring:
```typescript
import { measureOperation } from '../core/performance/performance-monitor';

measureOperation('operation-name', async () => {
  // Your code here
});
```

### Frontend

Use React DevTools Profiler to identify performance bottlenecks.

## Common Issues

1. **Port already in use**: Change the port in environment variables
2. **Database connection errors**: Check MongoDB is running and connection string is correct
3. **Module not found**: Run `npm install` and check import paths
4. **Type errors**: Run `npm run type-check` to see all TypeScript errors

