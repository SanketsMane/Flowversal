import { taskTypeDetector } from '../../../modules/ai/services/ai/task-type-detector.service';

describe('TaskTypeDetectorService', () => {
  describe('detectTaskType', () => {
    it('should detect structured_json task type', () => {
      const result = taskTypeDetector.detectTaskType({
        prompt: 'Generate a JSON schema for user data with fields for name, email, and age',
      });

      expect(result.taskType).toBe('structured_json');
      expect(result.confidence).toBeGreaterThan(0.1);
      expect(result.detectedKeywords).toContain('json');
    });

    it('should detect code_generation task type', () => {
      const result = taskTypeDetector.detectTaskType({
        prompt: 'Write a Python function to calculate fibonacci numbers',
      });

      expect(result.taskType).toBe('code_generation');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.detectedKeywords).toContain('function');
    });

    it('should detect creative_writing task type', () => {
      const result = taskTypeDetector.detectTaskType({
        prompt: 'Write a compelling story about a robot learning emotions',
      });

      expect(result.taskType).toBe('creative_writing');
      expect(result.confidence).toBeGreaterThan(0.1);
    });

    it('should detect api_execution task type', () => {
      const result = taskTypeDetector.detectTaskType({
        prompt: 'Call the weather API to get current temperature',
      });

      expect(result.taskType).toBe('api_execution');
      expect(result.confidence).toBeGreaterThan(0.1);
    });

    it('should handle unknown prompts gracefully', () => {
      const result = taskTypeDetector.detectTaskType({
        prompt: 'Hello world',
      });

      expect(result.taskType).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });
});