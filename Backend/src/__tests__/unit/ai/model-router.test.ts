import { modelRouterService } from '../../../modules/ai/services/ai/model-router.service';

// Mock the dependencies
jest.mock('../../../modules/ai/services/ai/task-type-detector.service', () => ({
  taskTypeDetector: {
    detectTaskType: jest.fn(),
  },
}));

jest.mock('../../../modules/ai/services/ai/temperature-mapper.service', () => ({
  temperatureMapper: {
    getOptimalTemperature: jest.fn(),
  },
}));

jest.mock('../../../modules/ai/services/ai/model-scoring.service', () => ({
  modelScoringService: {
    scoreResponse: jest.fn(),
  },
}));

jest.mock('../../../modules/ai/services/ai/model-factory', () => ({
  ModelFactory: {
    createVLLMModel: jest.fn(),
    createDirectOpenAIModel: jest.fn(),
    createDirectClaudeModel: jest.fn(),
  },
}));

describe('ModelRouterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    const { taskTypeDetector } = require('../../../modules/ai/services/ai/task-type-detector.service');
    const { temperatureMapper } = require('../../../modules/ai/services/ai/temperature-mapper.service');
    const { modelScoringService } = require('../../../modules/ai/services/ai/model-scoring.service');
    const { ModelFactory } = require('../../../modules/ai/services/ai/model-factory');

    taskTypeDetector.detectTaskType.mockResolvedValue({
      taskType: 'structured_json',
      confidence: 0.9,
    });

    temperatureMapper.getOptimalTemperature.mockReturnValue({
      recommendedTemperature: 0.2,
      reasoning: 'Optimal for JSON',
      confidence: 0.9,
      alternatives: [0.1, 0.3],
    });

    modelScoringService.scoreResponse.mockResolvedValue({
      score: 85,
      decision: 'ACCEPT',
      reasoning: 'High quality response',
      factors: [],
      recommendations: [],
    });

    ModelFactory.createVLLMModel.mockReturnValue({
      constructor: { name: 'ChatOpenAI' },
    });
  });

  describe('smartRoute', () => {
    it('should route to vLLM for high-confidence tasks', async () => {
      const result = await modelRouterService.smartRoute(
        'Generate JSON for user data',
        'You are a JSON expert'
      );

      expect(result.provider).toBe('vllm');
      expect(result.temperature).toBe(0.2);
      expect(result.confidence).toBe(85);
      expect(result.routingPath).toContain('vllm');
    });

    it('should handle fallback when vLLM scores low', async () => {
      const { modelScoringService } = require('../../../modules/ai/services/ai/model-scoring.service');
      const { ModelFactory } = require('../../../modules/ai/services/ai/model-factory');

      // Mock low vLLM score
      modelScoringService.scoreResponse.mockResolvedValueOnce({
        score: 45,
        decision: 'FALLBACK_DIRECT',
        reasoning: 'Low quality response',
        factors: [],
        recommendations: [],
      });

      // Mock fallback to OpenAI
      ModelFactory.createDirectOpenAIModel.mockReturnValue({
        constructor: { name: 'ChatOpenAI' },
      });

      modelScoringService.scoreResponse.mockResolvedValueOnce({
        score: 78,
        decision: 'ACCEPT',
        reasoning: 'Good fallback response',
        factors: [],
        recommendations: [],
      });

      const result = await modelRouterService.smartRoute(
        'Generate JSON for user data'
      );

      expect(result.routingPath).toContain('vllm');
      expect(result.routingPath).toContain('openai');
      expect(result.confidence).toBe(78);
    });

    it('should force premium model for critical tasks with low scores', async () => {
      const { taskTypeDetector } = require('../../../modules/ai/services/ai/task-type-detector.service');
      const { modelScoringService } = require('../../../modules/ai/services/ai/model-scoring.service');

      taskTypeDetector.detectTaskType.mockResolvedValue({
        taskType: 'safety_critical',
        confidence: 0.9,
      });

      modelScoringService.scoreResponse.mockResolvedValue({
        score: 35,
        decision: 'FORCE_PREMIUM',
        reasoning: 'Critical task needs premium model',
        factors: [],
        recommendations: [],
      });

      const result = await modelRouterService.smartRoute(
        'Handle sensitive user data'
      );

      expect(result.routingPath.length).toBeGreaterThan(1);
    });

    it('should respect forced provider', async () => {
      const result = await modelRouterService.smartRoute(
        'Test prompt',
        undefined,
        { forceProvider: 'openai' }
      );

      // Should skip vLLM and go directly to OpenAI
      expect(result.routingPath).toContain('openai');
    });

    it('should handle retry scenarios', async () => {
      const { modelScoringService } = require('../../../modules/ai/services/ai/model-scoring.service');
      const { temperatureMapper } = require('../../../modules/ai/services/ai/temperature-mapper.service');

      // First call returns RETRY_VLLM
      modelScoringService.scoreResponse.mockResolvedValueOnce({
        score: 55,
        decision: 'RETRY_VLLM',
        reasoning: 'Needs retry',
        factors: [],
        recommendations: [],
      });

      // Second call succeeds
      modelScoringService.scoreResponse.mockResolvedValueOnce({
        score: 82,
        decision: 'ACCEPT',
        reasoning: 'Retry successful',
        factors: [],
        recommendations: [],
      });

      // Mock retry temperature
      temperatureMapper.getRetryTemperature = jest.fn().mockReturnValue({
        recommendedTemperature: 0.15,
        reasoning: 'Retry temperature',
        confidence: 0.7,
        alternatives: [0.1, 0.2],
      });

      const result = await modelRouterService.smartRoute(
        'Generate JSON data'
      );

      expect(temperatureMapper.getRetryTemperature).toHaveBeenCalled();
      expect(result.confidence).toBe(82);
    });
  });

  describe('getRoutingStats', () => {
    it('should return routing statistics', () => {
      const stats = modelRouterService.getRoutingStats();

      expect(stats).toHaveProperty('availableProviders');
      expect(stats).toHaveProperty('taskTypeMappings');
      expect(stats).toHaveProperty('successRates');
      expect(Array.isArray(stats.availableProviders)).toBe(true);
    });
  });
});