import { temperatureMapper } from '../../../modules/ai/services/ai/temperature-mapper.service';

describe('TemperatureMapperService', () => {
  describe('getOptimalTemperature', () => {
    it('should return correct temperature for structured_json', async () => {
      const result = await temperatureMapper.getOptimalTemperature('structured_json');

      expect(result.recommendedTemperature).toBe(0.2);
      expect(result.reasoning).toContain('structured json');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.alternatives).toBeDefined();
    });

    it('should return correct temperature for code_generation', async () => {
      const result = await temperatureMapper.getOptimalTemperature('code_generation');

      expect(result.recommendedTemperature).toBe(0.1);
      expect(result.reasoning).toContain('code generation');
    });

    it('should return correct temperature for creative_writing', async () => {
      const result = await temperatureMapper.getOptimalTemperature('creative_writing');

      expect(result.recommendedTemperature).toBe(0.8);
      expect(result.reasoning).toContain('creative writing');
    });

    it('should respect user-specified temperature', async () => {
      const result = await temperatureMapper.getOptimalTemperature('structured_json', undefined, 0.5);

      expect(result.recommendedTemperature).toBe(0.5);
      expect(result.reasoning).toContain('user-specified');
    });

    it('should apply retry adjustments', async () => {
      const normal = await temperatureMapper.getOptimalTemperature('structured_json');
      const retry = await temperatureMapper.getRetryTemperature('structured_json', normal.recommendedTemperature);

      // For structured_json, retry should decrease temperature slightly
      expect(retry.recommendedTemperature).toBeLessThan(normal.recommendedTemperature);
    });
  });

  describe('getTemperatureRange', () => {
    it('should return correct ranges for different task types', () => {
      const jsonRange = temperatureMapper.getTemperatureRange('structured_json');
      const creativeRange = temperatureMapper.getTemperatureRange('creative_writing');

      expect(jsonRange.min).toBe(0.1);
      expect(jsonRange.max).toBe(0.3);
      expect(jsonRange.optimal).toBe(0.2);

      expect(creativeRange.min).toBe(0.6);
      expect(creativeRange.max).toBe(0.9);
      expect(creativeRange.optimal).toBe(0.8);
    });
  });

  describe('validateTemperature', () => {
    it('should validate temperatures within range', () => {
      expect(temperatureMapper.validateTemperature('structured_json', 0.2)).toBe(true);
      expect(temperatureMapper.validateTemperature('structured_json', 0.05)).toBe(false); // Too low
      expect(temperatureMapper.validateTemperature('structured_json', 0.5)).toBe(false);  // Too high
    });
  });
});