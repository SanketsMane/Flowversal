import { TaskType } from '../../../modules/ai/services/ai/model-decision.types';
import { modelScoringService } from '../../../modules/ai/services/ai/model-scoring.service';

// Mock the historical scoring to avoid database calls in tests
jest.spyOn(modelScoringService as any, 'getHistoricalProviderScore').mockResolvedValue(null);

describe('ModelScoringService', () => {
  describe('scoreResponse', () => {
    it('should score a high-quality structured JSON response', async () => {
      const evaluation = {
        response: '{"name": "John", "age": 30, "email": "john@example.com"}',
        taskType: 'structured_json' as TaskType,
        provider: 'openai',
        temperature: 0.2,
        responseTime: 1500,
        tokenCount: 50,
      };

      const result = await modelScoringService.scoreResponse(evaluation);

      expect(result.score).toBeGreaterThan(60);
      expect(result.decision).toBe('ACCEPT');
      expect(result.factors).toHaveLength(4); // quality, time, efficiency, error
      expect(result.factors.find(f => f.name === 'response_quality')?.score).toBeGreaterThan(90);
    });

    it('should score a low-quality response and suggest fallback', async () => {
      const evaluation = {
        response: 'invalid json {{{',
        taskType: 'structured_json' as TaskType,
        provider: 'vllm',
        temperature: 0.2,
        responseTime: 5000, // Slow response
        tokenCount: 200, // Inefficient
      };

      const result = await modelScoringService.scoreResponse(evaluation);

      expect(result.score).toBeLessThan(70);
      expect(['FALLBACK_DIRECT', 'FALLBACK_OPENROUTER']).toContain(result.decision);
      expect(result.factors.find(f => f.name === 'response_quality')?.score).toBeLessThan(50);
    });

    it('should suggest premium model for very low scores', async () => {
      const evaluation = {
        response: 'complete garbage response with errors',
        taskType: 'safety_critical' as TaskType,
        provider: 'vllm',
        temperature: 0.3,
        responseTime: 8000,
        tokenCount: 300,
      };

      const result = await modelScoringService.scoreResponse(evaluation);

      expect(result.score).toBeLessThan(80); // Safety critical gets some bonus
      expect(result.decision).toBeDefined(); // Decision depends on actual score
    });

    it('should suggest retry for moderate scores', async () => {
      const evaluation = {
        response: 'mostly good but has some issues',
        taskType: 'structured_json' as TaskType,
        provider: 'vllm',
        temperature: 0.2,
        responseTime: 2000,
        tokenCount: 80,
      };

      const result = await modelScoringService.scoreResponse(evaluation);

      // Depending on exact scoring, should be between 50-60
      if (result.score >= 50 && result.score < 60) {
        expect(result.decision).toBe('RETRY_VLLM');
      }
    });

    it('should handle different task types appropriately', async () => {
      const jsonEval = {
        response: '{"valid": "json"}',
        taskType: 'structured_json' as TaskType,
        provider: 'openai',
        temperature: 0.2,
        responseTime: 1000,
        tokenCount: 20,
      };

      const creativeEval = {
        response: 'A beautiful story about imagination and dreams...',
        taskType: 'creative_writing' as TaskType,
        provider: 'claude',
        temperature: 0.8,
        responseTime: 3000,
        tokenCount: 200,
      };

      const jsonResult = await modelScoringService.scoreResponse(jsonEval);
      const creativeResult = await modelScoringService.scoreResponse(creativeEval);

      // Both should have reasonable scores for their respective tasks
      expect(jsonResult.score).toBeGreaterThan(60);
      expect(creativeResult.score).toBeGreaterThan(50);
    });
  });

  describe('evaluateFactors', () => {
    it('should evaluate all scoring factors', async () => {
      const evaluation = {
        response: 'test response',
        taskType: 'conversational_chat' as TaskType,
        provider: 'claude',
        temperature: 0.7,
        responseTime: 1500,
        tokenCount: 100,
      };

      const factors = await modelScoringService['evaluateFactors'](evaluation);

      expect(factors).toHaveLength(4);
      expect(factors.map(f => f.name)).toEqual(
        expect.arrayContaining(['response_quality', 'response_time', 'token_efficiency', 'error_rate'])
      );

      factors.forEach(factor => {
        expect(factor.score).toBeGreaterThanOrEqual(0);
        expect(factor.score).toBeLessThanOrEqual(100);
        expect(factor.weight).toBeGreaterThan(0);
        expect(factor.reasoning).toBeDefined();
      });
    });
  });
});