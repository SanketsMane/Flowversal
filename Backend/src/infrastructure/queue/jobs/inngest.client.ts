import { Inngest } from 'inngest';
import { inngestConfig } from '../../../core/config/inngest.config';

export const inngest = new Inngest({
  id: 'flowversal-backend',
  eventKey: inngestConfig.eventKey,
});

// Event definitions
export const events = {
  'workflow/execute': {
    name: 'workflow/execute',
    data: {} as {
      workflowId: string;
      userId: string;
      input?: Record<string, any>;
    },
  },
  'workflow/step': {
    name: 'workflow/step',
    data: {} as {
      executionId: string;
      stepId: string;
      stepData: any;
    },
  },
  'ai/agent': {
    name: 'ai/agent',
    data: {} as {
      agentId: string;
      task: string;
      context?: Record<string, any>;
    },
  },
};

