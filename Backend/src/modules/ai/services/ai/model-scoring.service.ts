/**
 * Model Scoring Service
 * Evaluates AI model responses on a 0-100 scale and makes intelligent decisions
 * about accepting, retrying, or falling back to different providers
 */

import { modelScoreService } from '../../models/ModelScore.model';
import {
    ModelDecision,
    ModelScoreResult,
    ResponseEvaluation,
    ScoreFactor,
    TaskType
} from './model-decision.types';

/**
 * Scoring criteria weights by task type
 */
const SCORING_WEIGHTS = {
  // Response Quality (60% of total score)
  response_quality: {
    structured_json: 0.7,    // JSON validity is critical
    code_generation: 0.7,    // Code correctness is paramount
    creative_writing: 0.5,   // Creativity is subjective
    complex_reasoning: 0.6,  // Logic and coherence matter
    api_execution: 0.8,      // Precision for API calls
    data_analysis: 0.6,      // Accuracy and insights
    mathematical_reasoning: 0.8, // Correctness is critical
    conversational_chat: 0.4, // Naturalness matters less than coherence
    real_time_information: 0.6, // Factual accuracy
    multimodal_tasks: 0.5,   // Description accuracy
    safety_critical: 0.9,    // Safety and ethics above all
    cost_optimized: 0.4,     // Quality still matters but less critical
  },

  // Response Time (15% of total score)
  response_time: {
    structured_json: 0.1,    // Speed less critical for JSON
    code_generation: 0.1,    // Accuracy over speed
    creative_writing: 0.15,  // Some speed expectation
    complex_reasoning: 0.1,  // Reasoning takes time
    api_execution: 0.2,      // API calls need to be fast
    data_analysis: 0.1,      // Analysis can take time
    mathematical_reasoning: 0.1, // Calculations need accuracy
    conversational_chat: 0.2, // Chat should be responsive
    real_time_information: 0.15, // Current info should be quick
    multimodal_tasks: 0.1,   // Processing takes time
    safety_critical: 0.05,   // Safety over speed
    cost_optimized: 0.2,     // Speed affects cost efficiency
  },

  // Token Efficiency (15% of total score)
  token_efficiency: {
    structured_json: 0.15,   // Should be concise
    code_generation: 0.15,   // Code should be efficient
    creative_writing: 0.25,  // Creative content can be longer
    complex_reasoning: 0.2,  // Reasoning explanations can be detailed
    api_execution: 0.05,     // API calls should be brief
    data_analysis: 0.2,      // Analysis can be detailed
    mathematical_reasoning: 0.1, // Math should be concise
    conversational_chat: 0.25, // Conversation can be verbose
    real_time_information: 0.2, // Info can be detailed
    multimodal_tasks: 0.3,   // Descriptions can be long
    safety_critical: 0.05,   // Safety explanations should be concise
    cost_optimized: 0.3,     // Efficiency directly affects cost
  },

  // Error Rate (10% of total score)
  error_rate: {
    structured_json: 0.05,   // JSON errors are critical
    code_generation: 0.05,   // Code errors are critical
    creative_writing: 0.1,   // Creative errors are more forgiving
    complex_reasoning: 0.1,  // Logic errors matter
    api_execution: 0.05,     // API errors are critical
    data_analysis: 0.1,      // Analysis errors matter
    mathematical_reasoning: 0.05, // Math errors are critical
    conversational_chat: 0.15, // Chat errors are forgiving
    real_time_information: 0.05, // Factual errors are critical
    multimodal_tasks: 0.1,   // Description errors are moderate
    safety_critical: 0.0,    // Safety errors get separate handling
    cost_optimized: 0.15,    // Errors affect efficiency
  },
};

/**
 * Response time benchmarks (in milliseconds)
 */
const RESPONSE_TIME_BENCHMARKS = {
  excellent: 1000,   // < 1 second
  good: 3000,       // < 3 seconds
  acceptable: 5000, // < 5 seconds
  slow: 10000,      // < 10 seconds
};

/**
 * Model Scoring Service
 */
export class ModelScoringService {
  /**
   * Score a model response and make a decision
   */
  async scoreResponse(
    evaluation: ResponseEvaluation,
    userTier: string = 'standard',
    executionId?: string,
    nodeId?: string,
    userId?: string
  ): Promise<ModelScoreResult> {
    const factors = await this.evaluateFactors(evaluation);
    const score = this.calculateWeightedScore(factors, evaluation.taskType);
    const decision = this.makeDecision(score, evaluation.taskType, userTier);
    const reasoning = this.generateReasoning(score, decision, factors);
    const recommendations = this.generateRecommendations(decision, evaluation);

    // Record score in database if context is provided
    if (executionId && nodeId) {
      try {
        await modelScoreService.recordScore({
          executionId,
          nodeId,
          userId,
          provider: evaluation.provider,
          modelName: evaluation.provider, // Model name mapping could be enhanced
          taskType: evaluation.taskType,
          confidence: score,
          decision,
          responseTime: evaluation.responseTime,
          tokenCount: evaluation.tokenCount,
          cost: 0, // Cost calculation could be added
          temperature: evaluation.temperature,
          routingPath: [evaluation.provider], // Could be enhanced with full routing path
          responseQuality: factors.find(f => f.name === 'response_quality')?.score || 50,
          tokenEfficiency: factors.find(f => f.name === 'token_efficiency')?.score || 50,
          errorRate: factors.find(f => f.name === 'error_rate')?.score || 0,
          success: true, // Assume success if we're scoring
          promptLength: evaluation.response?.length || 0,
        });
      } catch (error) {
        // Log but don't fail the scoring
        console.warn('Failed to record model score:', error);
      }
    }

    return {
      score,
      decision,
      reasoning,
      factors,
      recommendations,
    };
  }

  /**
   * Evaluate individual scoring factors
   */
  private async evaluateFactors(evaluation: ResponseEvaluation): Promise<ScoreFactor[]> {
    const factors: ScoreFactor[] = [];

    // Response Quality Factor
    factors.push(await this.evaluateResponseQuality(evaluation));

    // Response Time Factor
    factors.push(this.evaluateResponseTime(evaluation));

    // Token Efficiency Factor
    factors.push(this.evaluateTokenEfficiency(evaluation));

    // Error Rate Factor
    factors.push(this.evaluateErrorRate(evaluation));

    return factors;
  }

  /**
   * Evaluate response quality (content correctness, relevance, structure)
   * Enhanced with sophisticated quality analysis and historical learning
   */
  private async evaluateResponseQuality(evaluation: ResponseEvaluation): Promise<ScoreFactor> {
    const { response, taskType, provider } = evaluation;
    let qualityScore = 50; // Start with neutral score
    let reasoning = '';

    // Get historical performance for this provider/task combination
    const historicalScore = await this.getHistoricalProviderScore(provider, taskType, evaluation);

    // Task-specific quality checks with enhanced algorithms
    switch (taskType) {
      case 'structured_json':
        const jsonScore = this.evaluateJsonQuality(response);
        qualityScore = jsonScore;
        reasoning = this.generateDetailedJsonReasoning(jsonScore, response);
        break;

      case 'code_generation':
        const codeScore = this.evaluateCodeQuality(response);
        qualityScore = codeScore;
        reasoning = this.generateDetailedCodeReasoning(codeScore, response);
        break;

      case 'mathematical_reasoning':
        const mathScore = this.evaluateMathQuality(response);
        qualityScore = mathScore;
        reasoning = this.generateDetailedMathReasoning(mathScore, response);
        break;

      case 'api_execution':
        const apiScore = this.evaluateApiQuality(response);
        qualityScore = apiScore;
        reasoning = this.generateDetailedApiReasoning(apiScore, response);
        break;

      case 'safety_critical':
        const safetyScore = this.evaluateSafetyQuality(response);
        qualityScore = safetyScore;
        reasoning = this.generateDetailedSafetyReasoning(safetyScore, response);
        break;

      case 'creative_writing':
        const creativeScore = this.evaluateCreativeQuality(response);
        qualityScore = creativeScore;
        reasoning = this.generateDetailedCreativeReasoning(creativeScore, response);
        break;

      case 'complex_reasoning':
        const reasoningScore = this.evaluateReasoningQuality(response);
        qualityScore = reasoningScore;
        reasoning = this.generateDetailedReasoningQuality(reasoningScore, response);
        break;

      default:
        // Enhanced general quality evaluation
        qualityScore = this.evaluateGeneralQuality(response, taskType);
        reasoning = this.generateDetailedGeneralReasoning(qualityScore, response, taskType);
    }

    // Apply historical performance adjustment
    if (historicalScore !== null) {
      const historicalAdjustment = (historicalScore - 70) * 0.3; // Adjust towards historical average
      qualityScore = Math.max(0, Math.min(100, qualityScore + historicalAdjustment));
      reasoning += ` (historical avg: ${historicalScore.toFixed(1)})`;
    }

    // Provider-specific adjustments with learning
    const providerAdjustment = this.getProviderQualityAdjustment(provider, taskType);
    qualityScore = Math.max(0, Math.min(100, qualityScore + providerAdjustment));

    return {
      name: 'response_quality',
      score: qualityScore,
      weight: SCORING_WEIGHTS.response_quality[taskType] || 0.6,
      reasoning: `${reasoning} (${provider} provider)`,
    };
  }

  /**
   * Evaluate response time performance
   */
  private evaluateResponseTime(evaluation: ResponseEvaluation): ScoreFactor {
    const { responseTime, taskType } = evaluation;

    let timeScore = 100;
    let reasoning = '';

    if (responseTime < RESPONSE_TIME_BENCHMARKS.excellent) {
      timeScore = 100;
      reasoning = 'Excellent response time (< 1s)';
    } else if (responseTime < RESPONSE_TIME_BENCHMARKS.good) {
      timeScore = 90;
      reasoning = 'Good response time (< 3s)';
    } else if (responseTime < RESPONSE_TIME_BENCHMARKS.acceptable) {
      timeScore = 75;
      reasoning = 'Acceptable response time (< 5s)';
    } else if (responseTime < RESPONSE_TIME_BENCHMARKS.slow) {
      timeScore = 50;
      reasoning = 'Slow response time (< 10s)';
    } else {
      timeScore = 25;
      reasoning = 'Very slow response time (> 10s)';
    }

    // Adjust based on task type expectations
    if (taskType === 'conversational_chat' && timeScore < 80) {
      timeScore += 10; // Chat is more forgiving of slower responses
    }

    return {
      name: 'response_time',
      score: timeScore,
      weight: SCORING_WEIGHTS.response_time[taskType] || 0.15,
      reasoning,
    };
  }

  /**
   * Evaluate token efficiency (response length vs. usefulness)
   */
  private evaluateTokenEfficiency(evaluation: ResponseEvaluation): ScoreFactor {
    const { response, tokenCount, taskType } = evaluation;

    if (!tokenCount) {
      return {
        name: 'token_efficiency',
        score: 70, // Neutral score when token count unknown
        weight: SCORING_WEIGHTS.token_efficiency[taskType] || 0.15,
        reasoning: 'Token count not available',
      };
    }

    const charCount = response.length;
    const estimatedTokens = charCount / 4; // Rough estimation
    const efficiency = Math.min(tokenCount, estimatedTokens) / Math.max(tokenCount, estimatedTokens);

    let efficiencyScore = efficiency * 100;

    // Task-specific adjustments
    if (taskType === 'structured_json' && tokenCount > 1000) {
      efficiencyScore -= 20; // JSON should be concise
    }

    if (taskType === 'creative_writing' && tokenCount < 500) {
      efficiencyScore -= 15; // Creative content can be longer
    }

    efficiencyScore = Math.max(0, Math.min(100, efficiencyScore));

    const reasoning = efficiencyScore > 80 ? 'Highly efficient token usage' :
                     efficiencyScore > 60 ? 'Good token efficiency' :
                     'Inefficient token usage';

    return {
      name: 'token_efficiency',
      score: efficiencyScore,
      weight: SCORING_WEIGHTS.token_efficiency[taskType] || 0.15,
      reasoning,
    };
  }

  /**
   * Evaluate error rate and reliability
   */
  private evaluateErrorRate(evaluation: ResponseEvaluation): ScoreFactor {
    const { errorCount = 0, taskType } = evaluation;

    let errorScore = 100 - (errorCount * 20); // Each error reduces score by 20
    errorScore = Math.max(0, Math.min(100, errorScore));

    const reasoning = errorCount === 0 ? 'No errors detected' :
                     errorCount === 1 ? 'Minor error detected' :
                     `${errorCount} errors detected`;

    return {
      name: 'error_rate',
      score: errorScore,
      weight: SCORING_WEIGHTS.error_rate[taskType] || 0.1,
      reasoning,
    };
  }

  /**
   * Calculate weighted total score
   */
  private calculateWeightedScore(factors: ScoreFactor[], taskType: TaskType): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const factor of factors) {
      const weight = SCORING_WEIGHTS[factor.name as keyof typeof SCORING_WEIGHTS]?.[taskType] || factor.weight;
      totalScore += factor.score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
  }

  /**
   * Make decision based on score
   */
  private makeDecision(score: number, taskType: TaskType, userTier: string): ModelDecision {
    // Premium tier gets more lenient scoring
    const isPremium = userTier === 'premium' || userTier === 'enterprise';
    const adjustedScore = isPremium ? score + 5 : score;

    if (adjustedScore >= 60) {
      return 'ACCEPT';
    } else if (adjustedScore >= 50) {
      return 'RETRY_VLLM';
    } else if (adjustedScore >= 40) {
      return 'FALLBACK_DIRECT';
    } else {
      // For safety-critical tasks, always use premium models
      if (taskType === 'safety_critical') {
        return 'FORCE_PREMIUM';
      }
      return 'FALLBACK_OPENROUTER';
    }
  }

  /**
   * Generate reasoning for the decision
   */
  private generateReasoning(score: number, decision: ModelDecision, factors: ScoreFactor[]): string {
    const scoreText = `Score: ${score}/100`;
    let decisionText = '';

    switch (decision) {
      case 'ACCEPT':
        decisionText = 'Response quality meets requirements';
        break;
      case 'RETRY_VLLM':
        decisionText = 'Retrying vLLM with temperature adjustment may improve results';
        break;
      case 'FALLBACK_DIRECT':
        decisionText = 'Trying direct API providers for better performance';
        break;
      case 'FALLBACK_OPENROUTER':
        decisionText = 'Falling back to OpenRouter for broader model access';
        break;
      case 'FALLBACK_VLLM_TUNED':
        decisionText = 'Final attempt with heavily tuned vLLM parameters';
        break;
      case 'FORCE_PREMIUM':
        decisionText = 'Using premium models (Claude/GPT-4) for critical requirements';
        break;
    }

    const topFactors = factors
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(f => `${f.name}: ${f.score}`)
      .join(', ');

    return `${scoreText}. ${decisionText}. Key factors: ${topFactors}`;
  }

  /**
   * Generate recommendations for improvement
   */
  private generateRecommendations(decision: ModelDecision, evaluation: ResponseEvaluation): string[] {
    const recommendations: string[] = [];

    switch (decision) {
      case 'RETRY_VLLM':
        recommendations.push('Retry with lower temperature for more precise output');
        recommendations.push('Consider adjusting system prompt for clearer instructions');
        break;

      case 'FALLBACK_DIRECT':
        recommendations.push('Switching to direct API providers for better task-specific performance');
        recommendations.push('OpenAI recommended for structured tasks, Claude for creative tasks');
        break;

      case 'FALLBACK_OPENROUTER':
        recommendations.push('Using OpenRouter for access to premium models via single API');
        recommendations.push('Consider upgrading to premium tier for better performance');
        break;

      case 'FORCE_PREMIUM':
        recommendations.push('Critical task requires premium model (Claude or GPT-4)');
        recommendations.push('Consider upgrading account tier for consistent premium access');
        break;
    }

    // Add general recommendations based on factors
    if (evaluation.responseTime > RESPONSE_TIME_BENCHMARKS.acceptable) {
      recommendations.push('Consider faster models for time-sensitive tasks');
    }

    return recommendations;
  }

  // Helper methods for quality evaluation

  private evaluateJsonQuality(response: string): number {
    try {
      JSON.parse(response);
      return 95; // Valid JSON
    } catch {
      // Check if it's mostly valid JSON with minor issues
      const jsonLike = response.trim();
      if (jsonLike.startsWith('{') && jsonLike.endsWith('}')) {
        return 70; // Structure looks right but has syntax errors
      }
      return 30; // Not JSON-like at all
    }
  }

  private evaluateCodeQuality(response: string): number {
    // Basic code quality checks
    let score = 50;

    // Check for basic syntax indicators
    if (response.includes('function') || response.includes('class') || response.includes('import')) {
      score += 20;
    }

    // Check for balanced braces/brackets
    const openBraces = (response.match(/\{/g) || []).length;
    const closeBraces = (response.match(/\}/g) || []).length;
    if (Math.abs(openBraces - closeBraces) <= 1) {
      score += 15;
    }

    // Check for error handling
    if (response.includes('try') || response.includes('catch') || response.includes('error')) {
      score += 10;
    }

    return Math.min(100, score);
  }

  private evaluateMathQuality(response: string): number {
    // Check for mathematical reasoning indicators
    let score = 50;

    if (response.includes('=') || response.includes('×') || response.includes('÷')) {
      score += 20; // Has mathematical operations
    }

    if (response.includes('therefore') || response.includes('thus') || response.includes('hence')) {
      score += 15; // Has logical connectors
    }

    if (/\d+\s*[+\-×÷=]\s*\d+/.test(response)) {
      score += 15; // Has actual calculations
    }

    return Math.min(100, score);
  }

  private evaluateApiQuality(response: string): number {
    let score = 50;

    // Check for API-like patterns
    if (response.includes('GET') || response.includes('POST') || response.includes('PUT')) {
      score += 20;
    }

    if (response.includes('endpoint') || response.includes('url') || response.includes('api')) {
      score += 15;
    }

    if (response.includes('headers') || response.includes('parameters')) {
      score += 10;
    }

    return Math.min(100, score);
  }

  private evaluateSafetyQuality(response: string): number {
    // Safety scoring is complex - this is a simplified version
    let score = 80; // Start high, reduce for concerning content

    const concerningTerms = ['hack', 'exploit', 'illegal', 'dangerous', 'harmful'];
    for (const term of concerningTerms) {
      if (response.toLowerCase().includes(term)) {
        score -= 30;
      }
    }

    // Bonus for safety-conscious language
    if (response.includes('ethical') || response.includes('responsible') || response.includes('safe')) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Evaluate creative writing quality
   */
  private evaluateCreativeQuality(response: string): number {
    let score = 60; // Start with moderate score for creative tasks

    // Engagement and flow indicators
    const engagementWords = ['imagine', 'picture', 'feel', 'experience', 'wonder', 'beautiful', 'amazing'];
    const flowIndicators = ['however', 'therefore', 'moreover', 'furthermore', 'in addition', 'consequently'];

    let engagementScore = 0;
    engagementWords.forEach(word => {
      if (response.toLowerCase().includes(word)) engagementScore += 2;
    });

    let flowScore = 0;
    flowIndicators.forEach(word => {
      if (response.toLowerCase().includes(word)) flowScore += 3;
    });

    // Originality check (avoiding generic phrases)
    const genericPhrases = ['in conclusion', 'to summarize', 'in summary', 'let me tell you'];
    let originalityPenalty = 0;
    genericPhrases.forEach(phrase => {
      if (response.toLowerCase().includes(phrase)) originalityPenalty += 5;
    });

    // Length appropriateness for creative content
    const wordCount = response.split(' ').length;
    if (wordCount > 50 && wordCount < 500) {
      score += 10; // Good length for creative content
    } else if (wordCount > 1000) {
      score -= 10; // Too long
    }

    score += Math.min(20, engagementScore);
    score += Math.min(15, flowScore);
    score -= Math.min(20, originalityPenalty);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Evaluate complex reasoning quality
   */
  private evaluateReasoningQuality(response: string): number {
    let score = 50; // Start neutral for reasoning tasks

    // Logical structure indicators
    const logicalConnectors = ['because', 'therefore', 'thus', 'hence', 'consequently', 'accordingly'];
    const reasoningPatterns = ['first', 'second', 'third', 'next', 'finally', 'step', 'stage'];

    let logicScore = 0;
    logicalConnectors.forEach(word => {
      if (response.toLowerCase().includes(word)) logicScore += 2;
    });

    let structureScore = 0;
    reasoningPatterns.forEach(word => {
      if (response.toLowerCase().includes(word)) structureScore += 3;
    });

    // Evidence and justification
    const evidenceWords = ['evidence', 'data', 'research', 'study', 'analysis', 'based on'];
    let evidenceScore = 0;
    evidenceWords.forEach(word => {
      if (response.toLowerCase().includes(word)) evidenceScore += 4;
    });

    // Avoid logical fallacies (basic detection)
    const fallacyIndicators = ['always', 'never', 'everyone knows', 'obviously'];
    let fallacyPenalty = 0;
    fallacyIndicators.forEach(word => {
      if (response.toLowerCase().includes(word)) fallacyPenalty += 3;
    });

    // Depth and thoroughness
    const wordCount = response.split(' ').length;
    if (wordCount > 300 && wordCount < 1500) {
      score += 15; // Good depth for reasoning
    }

    score += Math.min(25, logicScore);
    score += Math.min(20, structureScore);
    score += Math.min(20, evidenceScore);
    score -= Math.min(15, fallacyPenalty);

    return Math.max(0, Math.min(100, score));
  }

  private evaluateGeneralQuality(response: string, taskType: TaskType): number {
    let score = 70; // Neutral starting point

    // Length appropriateness
    const length = response.length;
    if (taskType === 'conversational_chat' && length > 1000) {
      score -= 10; // Chat responses should be concise
    }

    if (taskType === 'complex_reasoning' && length < 500) {
      score -= 15; // Reasoning should be detailed
    }

    // Coherence check
    if (response.includes('?') && !response.includes('.')) {
      score -= 10; // Incomplete sentences
    }

    // Relevance check (basic keyword matching for task type)
    const taskKeywords = this.getTaskKeywords(taskType);
    let relevanceScore = 0;
    taskKeywords.forEach(keyword => {
      if (response.toLowerCase().includes(keyword)) relevanceScore += 2;
    });
    score += Math.min(10, relevanceScore);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get relevant keywords for a task type
   */
  private getTaskKeywords(taskType: TaskType): string[] {
    const keywordMap: Record<TaskType, string[]> = {
      structured_json: ['json', 'schema', 'structure', 'format'],
      code_generation: ['function', 'class', 'code', 'syntax', 'import'],
      creative_writing: ['story', 'imagine', 'feel', 'beautiful', 'amazing'],
      complex_reasoning: ['because', 'therefore', 'analysis', 'reason', 'logic'],
      api_execution: ['api', 'endpoint', 'request', 'response', 'call'],
      data_analysis: ['data', 'analysis', 'insights', 'metrics', 'trend'],
      mathematical_reasoning: ['calculate', 'equation', 'solve', 'result', 'proof'],
      conversational_chat: ['hello', 'thank', 'please', 'help', 'understand'],
      real_time_information: ['today', 'current', 'latest', 'recent', 'now'],
      multimodal_tasks: ['image', 'video', 'audio', 'visual', 'content'],
      safety_critical: ['safe', 'secure', 'private', 'ethical', 'responsible'],
      cost_optimized: ['efficient', 'budget', 'cost', 'optimize', 'save'],
    };

    return keywordMap[taskType] || [];
  }

  /**
   * Get historical performance score for provider/task combination
   */
  private async getHistoricalProviderScore(provider: string, taskType: TaskType, evaluation?: ResponseEvaluation): Promise<number | null> {
    try {
      // For basic scoring without execution context, return null
      // Historical scoring requires execution context
      if (!evaluation) return null;

      const result = await modelScoreService.getAnalytics({
        provider,
        taskType,
        days: 7, // Last 7 days
      });

      if (result && result.length > 0) {
        // Calculate weighted average (more recent scores have higher weight)
        const scores = result.slice(0, 10); // Last 10 executions
        let weightedSum = 0;
        let totalWeight = 0;

        scores.forEach((item, index) => {
          const weight = 1 / (index + 1); // Recent items have higher weight
          weightedSum += item.avgConfidence * weight;
          totalWeight += weight;
        });

        return totalWeight > 0 ? weightedSum / totalWeight : null;
      }

      return null;
    } catch (error) {
      console.warn('Failed to get historical score:', error);
      return null;
    }
  }

  /**
   * Enhanced detailed reasoning generators
   */
  private generateDetailedJsonReasoning(score: number, response: string): string {
    if (score > 90) return 'Perfectly valid JSON with optimal structure and formatting';
    if (score > 80) return 'Valid JSON with good structure and minor formatting optimizations possible';
    if (score > 70) return 'Valid JSON but could benefit from better formatting';
    if (score > 60) return 'JSON is parseable but has structural issues';
    if (score > 40) return 'JSON has syntax errors but basic structure is recognizable';
    return 'Severe JSON formatting issues detected';
  }

  private generateDetailedCodeReasoning(score: number, response: string): string {
    if (score > 90) return 'Exceptional code quality with perfect syntax, good practices, and efficient algorithms';
    if (score > 80) return 'High-quality code with correct syntax and good structure';
    if (score > 70) return 'Functional code with correct syntax but could improve structure';
    if (score > 60) return 'Code runs but has syntax issues or poor practices';
    if (score > 40) return 'Code has significant syntax errors or logic flaws';
    return 'Code has critical syntax errors and logic problems';
  }

  private generateDetailedMathReasoning(score: number, response: string): string {
    if (score > 90) return 'Mathematically perfect with clear step-by-step reasoning';
    if (score > 80) return 'Mathematically correct with good explanation';
    if (score > 70) return 'Mathematically sound but explanation could be clearer';
    if (score > 60) return 'Mostly correct but has calculation or reasoning errors';
    if (score > 40) return 'Has mathematical errors or unclear reasoning';
    return 'Significant mathematical errors or complete lack of reasoning';
  }

  private generateDetailedApiReasoning(score: number, response: string): string {
    if (score > 90) return 'Perfect API call structure with correct parameters and format';
    if (score > 80) return 'Well-formed API call with proper structure';
    if (score > 70) return 'Functional API call but could be more precise';
    if (score > 60) return 'API call works but has formatting issues';
    if (score > 40) return 'API call has structural problems';
    return 'API call format is incorrect or incomplete';
  }

  private generateDetailedSafetyReasoning(score: number, response: string): string {
    if (score > 95) return 'Extremely safe and ethical response with perfect consideration';
    if (score > 90) return 'Highly safe response with excellent ethical guidelines';
    if (score > 80) return 'Safe response with good ethical considerations';
    if (score > 70) return 'Generally safe but could improve ethical handling';
    if (score > 60) return 'Some safety concerns present';
    return 'Significant safety or ethical issues detected';
  }

  private generateDetailedCreativeReasoning(score: number, response: string): string {
    if (score > 90) return 'Exceptionally creative with excellent flow, engagement, and originality';
    if (score > 80) return 'Highly creative with good engagement and flow';
    if (score > 70) return 'Creative content with decent engagement';
    if (score > 60) return 'Some creative elements but lacks engagement';
    if (score > 40) return 'Limited creativity and engagement';
    return 'Lacks creativity and engagement significantly';
  }

  private generateDetailedReasoningQuality(score: number, response: string): string {
    if (score > 90) return 'Outstanding logical reasoning with clear, step-by-step analysis';
    if (score > 80) return 'Excellent reasoning with good logical flow';
    if (score > 70) return 'Good reasoning with logical structure';
    if (score > 60) return 'Basic reasoning present but could be more thorough';
    if (score > 40) return 'Weak reasoning with logical gaps';
    return 'Poor reasoning with significant logical flaws';
  }

  private generateDetailedGeneralReasoning(score: number, response: string, taskType: TaskType): string {
    const taskName = taskType.replace('_', ' ');
    if (score > 80) return `Excellent ${taskName} response with high relevance and quality`;
    if (score > 70) return `Good ${taskName} response with solid relevance`;
    if (score > 60) return `Decent ${taskName} response but could be more relevant`;
    if (score > 50) return `Basic ${taskName} response with some relevance issues`;
    if (score > 30) return `Poor ${taskName} response with low relevance`;
    return `Very poor ${taskName} response lacking relevance and quality`;
  }

  private getProviderQualityAdjustment(provider: string, taskType: TaskType): number {
    // Enhanced provider-specific quality adjustments based on extensive testing
    const adjustments: Record<string, Partial<Record<TaskType, number>>> = {
      openai: {
        structured_json: 12,      // GPT-4 JSON mode is exceptional
        code_generation: 8,       // Excellent code generation
        complex_reasoning: 10,    // Superior reasoning capabilities
        data_analysis: 9,         // Great at data insights
        mathematical_reasoning: 9, // Very strong math
        api_execution: 5,         // Good but expensive
        safety_critical: 8,       // Strong safety measures
        creative_writing: 6,      // Good but not the best
      },
      claude: {
        creative_writing: 15,     // Exceptional creativity
        conversational_chat: 12,  // Natural conversations
        safety_critical: 18,      // Designed for safety
        complex_reasoning: 12,    // Excellent reasoning
        data_analysis: 10,        // Strong analysis
        multimodal_tasks: 8,      // Good multimodal
        structured_json: 6,       // Good but not JSON-focused
      },
      gemini: {
        multimodal_tasks: 18,     // Best multimodal
        api_execution: 8,         // Cost-effective for APIs
        cost_optimized: 15,       // Most cost-effective
        mathematical_reasoning: 10, // Strong math
        real_time_information: 12, // Good at current info
        data_analysis: 7,         // Decent analysis
        structured_json: 4,       // Limited JSON mode
      },
      grok: {
        real_time_information: 15, // Excellent current events
        conversational_chat: 13,   // Very conversational
        code_generation: 6,        // Decent coding
        creative_writing: 10,      // Creative and fun
        safety_critical: 7,        // Good safety
      },
      deepseek: {
        code_generation: 12,      // Specialized in coding
        mathematical_reasoning: 8, // Good at math
        cost_optimized: 12,       // Very cost-effective
        api_execution: 6,         // Decent API handling
        structured_json: 5,       // Basic JSON
      },
    };

    return adjustments[provider]?.[taskType] || 0;
  }
}

export const modelScoringService = new ModelScoringService();