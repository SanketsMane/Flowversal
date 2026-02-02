import { WorkflowExecutionService } from '../../../modules/workflows/services/workflow-execution/workflow-execution.service';

describe('WorkflowExecutionService', () => {
  let service: WorkflowExecutionService;

  beforeEach(() => {
    service = new WorkflowExecutionService();
  });

  describe('input validation', () => {
    it('should validate workflow ID format', () => {
      // Test the validateWorkflowId function indirectly through startExecution
      const invalidWorkflowId = 'invalid-id';
      const userId = '507f1f77bcf86cd799439011';

      expect(service.startExecution(invalidWorkflowId, userId)).rejects.toThrow('Workflow ID must be a valid MongoDB ObjectId');
    });

    it('should validate execution ID format', () => {
      // Test the validateExecutionId function indirectly through getExecution
      const invalidExecutionId = 'invalid-id';
      const userId = '507f1f77bcf86cd799439011';

      expect(service.getExecution(invalidExecutionId, userId)).rejects.toThrow('Execution ID must be a valid MongoDB ObjectId');
    });
  });

  describe('service instantiation', () => {
    it('should create a service instance', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(WorkflowExecutionService);
    });
  });
});

