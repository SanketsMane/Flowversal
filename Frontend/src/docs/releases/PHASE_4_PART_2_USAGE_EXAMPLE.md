# 🚀 Phase 4 Part 2 - Usage Example

## Quick Start Guide - Workflow Execution Engine

### 1. Simple Execution Example

```typescript
import { useExecution, StepExecutor } from '@/features/workflow-builder';

function SimpleWorkflow() {
  const { startExecution, isExecuting } = useExecution();

  // Define your workflow steps
  const steps: StepExecutor[] = [
    {
      id: 'trigger-1',
      name: 'Form Submitted',
      type: 'trigger',
      execute: async (input) => {
        console.log('Trigger fired!');
        return { 
          triggered: true, 
          timestamp: Date.now(),
          formData: { name: 'John', email: 'john@example.com' }
        };
      },
    },
    {
      id: 'node-1',
      name: 'Process Data',
      type: 'node',
      execute: async (input) => {
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          processed: true,
          userData: input.formData,
          processedAt: Date.now(),
        };
      },
    },
    {
      id: 'tool-1',
      name: 'Send Welcome Email',
      type: 'tool',
      execute: async (input) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return {
          emailSent: true,
          to: input.userData.email,
          sentAt: Date.now(),
        };
      },
    },
  ];

  const handleStart = async () => {
    await startExecution('welcome-workflow', steps, {
      stepDelay: 500, // 500ms between steps
    });
  };

  return (
    <button 
      onClick={handleStart} 
      disabled={isExecuting}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {isExecuting ? 'Running...' : 'Start Workflow'}
    </button>
  );
}
```

---

### 2. Full Execution Panel

```typescript
import { 
  ExecutionPanel,
  useExecution,
  StepExecutor,
} from '@/features/workflow-builder';

export function WorkflowExecutionPage() {
  const { startExecution } = useExecution();

  const steps: StepExecutor[] = [
    {
      id: 'trigger-1',
      name: 'Webhook Received',
      type: 'trigger',
      execute: async (input) => {
        return { 
          event: 'webhook.received',
          payload: input 
        };
      },
    },
    {
      id: 'node-1',
      name: 'Validate Payload',
      type: 'node',
      execute: async (input) => {
        // Validation logic
        const isValid = input.payload?.userId !== undefined;
        if (!isValid) {
          throw new Error('Invalid payload: missing userId');
        }
        return { validated: true, data: input.payload };
      },
    },
    {
      id: 'node-2',
      name: 'Fetch User Data',
      type: 'node',
      execute: async (input) => {
        // Simulate database query
        await new Promise(r => setTimeout(r, 800));
        return {
          user: {
            id: input.data.userId,
            name: 'John Doe',
            email: 'john@example.com',
          },
        };
      },
    },
    {
      id: 'tool-1',
      name: 'Send Notification',
      type: 'tool',
      execute: async (input) => {
        // Simulate API call
        await new Promise(r => setTimeout(r, 1200));
        return {
          notificationSent: true,
          userId: input.user.id,
        };
      },
    },
  ];

  const handleStart = async () => {
    await startExecution('notification-workflow', steps, {
      stepDelay: 1000,
      timeout: 60000,
      logLevel: 'debug',
      variables: {
        environment: 'production',
        version: '1.0.0',
      },
    });
  };

  return (
    <div className="h-screen bg-[#0E0E1F] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-white text-3xl font-bold mb-8">
          Workflow Execution
        </h1>

        {/* Execution Panel with all controls and console */}
        <ExecutionPanel
          onStart={handleStart}
          onConfigChange={() => console.log('Open config dialog')}
        />
      </div>
    </div>
  );
}
```

---

### 3. Individual Components

```typescript
import {
  ExecutionControls,
  ExecutionStatusBar,
  ExecutionConsole,
  ExecutionHistory,
  useExecution,
} from '@/features/workflow-builder';

export function CustomExecutionUI() {
  const { startExecution } = useExecution();

  const handleStart = async () => {
    // Your execution logic
  };

  return (
    <div className="grid grid-cols-2 gap-4 h-screen p-4">
      {/* Left Column */}
      <div className="space-y-4">
        {/* Controls at top */}
        <ExecutionControls
          onStart={handleStart}
          onConfigChange={() => {}}
        />

        {/* Status bar */}
        <ExecutionStatusBar />

        {/* Console takes remaining space */}
        <div className="flex-1 min-h-0">
          <ExecutionConsole />
        </div>
      </div>

      {/* Right Column - History */}
      <div>
        <ExecutionHistory />
      </div>
    </div>
  );
}
```

---

### 4. Custom Step Executors

```typescript
import { ExecutionEngine, StepExecutor } from '@/features/workflow-builder';

// Create engine instance
const engine = new ExecutionEngine();

// Register custom email sender
engine.registerExecutor({
  id: 'send-email-custom',
  name: 'Send Email (Custom)',
  type: 'tool',
  execute: async (input, context) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: input.email,
          subject: input.subject,
          body: input.body,
        }),
      });

      const data = await response.json();
      return { 
        success: true, 
        messageId: data.id,
        sentAt: Date.now(),
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  },
  validate: (input) => {
    // Validate required fields
    return !!(input?.email && input?.subject && input?.body);
  },
});

// Register custom database query
engine.registerExecutor({
  id: 'db-query',
  name: 'Database Query',
  type: 'node',
  execute: async (input, context) => {
    const { query, params } = input;
    
    // Simulate database query
    await new Promise(r => setTimeout(r, 500));
    
    return {
      rows: [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ],
      rowCount: 2,
    };
  },
});

// Register conditional step
engine.registerExecutor({
  id: 'check-condition',
  name: 'Check Condition',
  type: 'condition',
  execute: async (input, context) => {
    const value = input?.value || 0;
    const threshold = input?.threshold || 100;
    
    const passed = value > threshold;
    
    return {
      condition: passed,
      branch: passed ? 'success' : 'failure',
      value,
      threshold,
    };
  },
  shouldSkip: (context) => {
    // Skip if already checked
    return context.variables.conditionChecked === true;
  },
});
```

---

### 5. Step Indicators on Canvas

```typescript
import { ExecutionStepIndicator, useExecution } from '@/features/workflow-builder';

function WorkflowStepCard({ step }) {
  const { currentExecution } = useExecution();

  // Find step result from execution
  const stepResult = currentExecution?.steps.find(
    s => s.stepId === step.id
  );

  return (
    <div className="relative bg-[#1A1A2E] rounded-lg border border-[#2A2A3E] p-4">
      <h3>{step.name}</h3>
      <p>{step.description}</p>

      {/* Show execution indicator if step is executing */}
      {stepResult && (
        <ExecutionStepIndicator
          status={stepResult.status}
          duration={stepResult.duration}
          error={stepResult.error}
          compact={true} // Small badge in corner
        />
      )}
    </div>
  );
}
```

---

### 6. Real-time Execution Monitoring

```typescript
import { useEffect } from 'react';
import { useExecution } from '@/features/workflow-builder';

function ExecutionMonitor() {
  const { currentExecution, isExecuting } = useExecution();

  // Monitor execution progress
  useEffect(() => {
    if (!currentExecution) return;

    console.log('Execution Status:', currentExecution.status);
    console.log('Current Step:', currentExecution.currentStepIndex);
    console.log('Steps Completed:', currentExecution.steps.filter(s => s.status === 'completed').length);
    console.log('Total Logs:', currentExecution.logs.length);
  }, [currentExecution]);

  // Log when execution starts/stops
  useEffect(() => {
    if (isExecuting) {
      console.log('⚡ Execution started!');
    } else {
      console.log('✅ Execution stopped!');
    }
  }, [isExecuting]);

  return (
    <div className="text-white">
      {isExecuting ? (
        <div>
          <h3>Execution Running</h3>
          <p>Step {currentExecution?.currentStepIndex + 1} of {currentExecution?.steps.length + 1}</p>
          <p>Status: {currentExecution?.status}</p>
        </div>
      ) : (
        <div>No execution running</div>
      )}
    </div>
  );
}
```

---

### 7. Advanced Configuration

```typescript
const config = {
  // Delay between steps (ms)
  stepDelay: 1000,

  // Maximum execution time (ms)
  timeout: 300000, // 5 minutes

  // Retry failed steps
  retryOnError: true,
  maxRetries: 3,

  // Pause at specific steps
  breakpoints: ['node-2', 'tool-1'],

  // Log level (info, success, warning, error, debug)
  logLevel: 'debug' as const,

  // Initial variables
  variables: {
    userId: '123',
    apiKey: process.env.API_KEY,
    environment: 'production',
    features: {
      emailEnabled: true,
      smsEnabled: false,
    },
  },
};

await startExecution('my-workflow', steps, config);
```

---

### 8. Access Execution Data

```typescript
import { useExecution } from '@/features/workflow-builder';

function ExecutionData() {
  const { currentExecution } = useExecution();

  if (!currentExecution) return <div>No execution</div>;

  return (
    <div className="text-white space-y-4">
      {/* Execution Info */}
      <div>
        <h3>Execution Info</h3>
        <p>ID: {currentExecution.executionId}</p>
        <p>Status: {currentExecution.status}</p>
        <p>Duration: {currentExecution.duration}ms</p>
      </div>

      {/* Steps */}
      <div>
        <h3>Steps ({currentExecution.steps.length})</h3>
        {currentExecution.steps.map(step => (
          <div key={step.stepId}>
            {step.stepName}: {step.status} ({step.duration}ms)
          </div>
        ))}
      </div>

      {/* Variables */}
      <div>
        <h3>Variables</h3>
        <pre>{JSON.stringify(currentExecution.variables, null, 2)}</pre>
      </div>

      {/* Logs */}
      <div>
        <h3>Logs ({currentExecution.logs.length})</h3>
        {currentExecution.logs.slice(-5).map(log => (
          <div key={log.id}>
            [{log.level}] {log.message}
          </div>
        ))}
      </div>

      {/* Errors */}
      {currentExecution.errors.length > 0 && (
        <div>
          <h3>Errors</h3>
          {currentExecution.errors.map((error, i) => (
            <div key={i} className="text-red-400">
              {error.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 Complete Working Example

Here's a complete, copy-paste-ready example:

```typescript
'use client';

import { useState } from 'react';
import {
  ExecutionPanel,
  useExecution,
  StepExecutor,
} from '@/features/workflow-builder';

export default function WorkflowExecutionDemo() {
  const { startExecution, isExecuting } = useExecution();
  const [workflowName, setWorkflowName] = useState('demo-workflow');

  // Define workflow steps
  const steps: StepExecutor[] = [
    {
      id: 'trigger-1',
      name: '🎯 Workflow Triggered',
      type: 'trigger',
      execute: async (input) => {
        return {
          triggered: true,
          timestamp: Date.now(),
          input: input || {},
        };
      },
    },
    {
      id: 'node-1',
      name: '🔄 Process Step 1',
      type: 'node',
      execute: async (input) => {
        // Simulate processing
        await new Promise(r => setTimeout(r, 1000));
        return {
          step: 1,
          processed: true,
          data: { ...input, step1Complete: true },
        };
      },
    },
    {
      id: 'node-2',
      name: '🔄 Process Step 2',
      type: 'node',
      execute: async (input) => {
        await new Promise(r => setTimeout(r, 1500));
        return {
          step: 2,
          processed: true,
          data: { ...input.data, step2Complete: true },
        };
      },
    },
    {
      id: 'condition-1',
      name: '❓ Check Condition',
      type: 'condition',
      execute: async (input) => {
        const shouldContinue = Math.random() > 0.3; // 70% success rate
        return {
          condition: shouldContinue,
          branch: shouldContinue ? 'success' : 'skip',
        };
      },
    },
    {
      id: 'tool-1',
      name: '🛠️ Execute Tool',
      type: 'tool',
      execute: async (input) => {
        await new Promise(r => setTimeout(r, 2000));
        return {
          toolExecuted: true,
          result: 'Tool execution complete',
          timestamp: Date.now(),
        };
      },
      shouldSkip: (context) => {
        // Skip if condition failed
        const lastStep = context.steps[context.steps.length - 1];
        return lastStep?.output?.branch === 'skip';
      },
    },
  ];

  const handleStart = async () => {
    await startExecution(workflowName, steps, {
      stepDelay: 500,
      timeout: 60000,
      logLevel: 'debug',
      variables: {
        startedBy: 'Demo User',
        environment: 'development',
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#0E0E1F] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-4xl font-bold mb-2">
            🚀 Workflow Execution Engine Demo
          </h1>
          <p className="text-[#CFCFE8]">
            Try the execution engine with a sample workflow
          </p>
        </div>

        {/* Workflow Name Input */}
        <div className="mb-4">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="Workflow Name"
            className="px-4 py-2 bg-[#1A1A2E] text-white border border-[#2A2A3E] rounded-lg"
            disabled={isExecuting}
          />
        </div>

        {/* Execution Panel */}
        <ExecutionPanel
          onStart={handleStart}
          onConfigChange={() => alert('Config dialog would open here')}
        />
      </div>
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### Issue: Execution not starting

**Solution:** Make sure you've initialized the execution store:

```typescript
import { useExecution } from '@/features/workflow-builder';

// The useExecution hook auto-initializes the engine
const { startExecution } = useExecution();
```

### Issue: Logs not showing

**Solution:** Check the log level filter in the console:

```typescript
// Make sure you're not filtering out important logs
config: {
  logLevel: 'debug', // Shows all logs
}
```

### Issue: Steps not executing

**Solution:** Make sure steps have valid execute functions:

```typescript
{
  id: 'step-1',
  name: 'My Step',
  type: 'node',
  execute: async (input) => {
    // ✅ Must return something
    return { result: 'success' };
  },
}
```

---

## 💡 Tips & Best Practices

### 1. Always Return Data from Steps
```typescript
// ✅ Good
execute: async (input) => {
  return { success: true, data: input };
}

// ❌ Bad
execute: async (input) => {
  // No return - next step gets undefined
}
```

### 2. Use Variables for Shared Data
```typescript
execute: async (input, context) => {
  // Access shared variables
  const userId = context.variables.userId;
  
  // Store result in variables
  return { processedUserId: userId };
}
```

### 3. Handle Errors Gracefully
```typescript
execute: async (input) => {
  try {
    const result = await apiCall();
    return { success: true, data: result };
  } catch (error) {
    // Throw to mark step as failed
    throw new Error(`API call failed: ${error.message}`);
  }
}
```

### 4. Use shouldSkip for Conditional Logic
```typescript
{
  id: 'send-email',
  name: 'Send Email',
  type: 'tool',
  execute: async (input) => { /* ... */ },
  shouldSkip: (context) => {
    // Skip if email already sent
    return context.variables.emailSent === true;
  },
}
```

---

## 🎉 You're All Set!

The execution engine is now ready to run workflows!

**Next Steps:**
- Try the demo workflow
- Create custom step executors
- Add error handling
- Implement retry logic
- Build variable system (Part 3)

**Happy Executing!** 🚀✨
