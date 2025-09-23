import { AgenticDatabase, AgentSuggestion, AgentPerformanceLog, SystemMetricsLog } from './agentic-database';
import { StrategicOrchestratorAgent } from './strategic-orchestrator-agent';
import { MarketHunterAgent } from './market-hunter-agent';
import { AgenticAgent } from './agentic-agent';
import { GoalHierarchy, MarketRegime, ReputationModel } from './core-agency';

/**
 * Incremental Test Bench for Agentic Crypto Intelligence System
 * 
 * This test bench allows incremental testing and development of the agentic system
 * with comprehensive logging, performance tracking, and feedback collection.
 */
export class AgenticTestBench {
  private database: AgenticDatabase;
  private orchestrator: StrategicOrchestratorAgent;
  private marketHunter: MarketHunterAgent;
  private testAgents: Map<string, AgenticAgent> = new Map();
  private testResults: TestResult[] = [];
  private isRunning: boolean = false;
  private testSessionId: string;

  constructor() {
    this.database = new AgenticDatabase();
    this.testSessionId = this.generateSessionId();
    this.initializeTestAgents();
  }

  private generateSessionId(): string {
    return `test-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTestAgents(): void {
    // Create test orchestrator
    this.orchestrator = new StrategicOrchestratorAgent('test-orchestrator', {
      aggressiveness: 0.7,
      riskTolerance: 0.6,
      adaptability: 0.8,
      learningRate: 0.5
    });

    // Create test market hunter
    this.marketHunter = new MarketHunterAgent('test-market-hunter', {
      aggressiveness: 0.8,
      riskTolerance: 0.7,
      adaptability: 0.9,
      learningRate: 0.6
    });

    // Register agents
    this.testAgents.set('orchestrator', this.orchestrator);
    this.testAgents.set('market-hunter', this.marketHunter);
  }

  async initialize(): Promise<void> {
    try {
      console.log('🧪 Initializing Agentic Test Bench...');
      
      // Initialize database
      await this.database.initialize();
      
      // Initialize test agents
      for (const [agentId, agent] of this.testAgents) {
        // Initialize with test goals
        const testGoals = this.createTestGoals(agentId);
        agent.goals = new GoalHierarchy(testGoals);
        
        // Set up test market regime
        const testRegime = this.createTestMarketRegime();
        agent.setMarketRegime(testRegime);
        
        console.log(`✅ Initialized test agent: ${agentId}`);
      }

      console.log('🎯 Test Bench initialized successfully');
      console.log(`📊 Session ID: ${this.testSessionId}`);
      
    } catch (error) {
      console.error('❌ Test Bench initialization failed:', error);
      throw error;
    }
  }

  private createTestGoals(agentId: string): any[] {
    const baseGoals = [
      {
        id: `${agentId}-test-goal-1`,
        description: `Test autonomous decision making for ${agentId}`,
        priority: 0.8,
        status: 'active',
        targetMetric: 'decision_quality',
        targetValue: 0.7,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      },
      {
        id: `${agentId}-test-goal-2`,
        description: `Test adaptive learning for ${agentId}`,
        priority: 0.6,
        status: 'active',
        targetMetric: 'learning_rate',
        targetValue: 0.5,
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
      }
    ];

    // Add agent-specific goals
    if (agentId === 'orchestrator') {
      baseGoals.push({
        id: `${agentId}-strategic-goal`,
        description: 'Test strategic oversight and conflict resolution',
        priority: 0.9,
        status: 'active',
        targetMetric: 'conflict_resolution_rate',
        targetValue: 0.8,
        deadline: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours
      });
    } else if (agentId === 'market-hunter') {
      baseGoals.push({
        id: `${agentId}-alpha-goal`,
        description: 'Test alpha discovery and validation',
        priority: 0.85,
        status: 'active',
        targetMetric: 'alpha_discovery_rate',
        targetValue: 0.3,
        deadline: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours
      });
    }

    return baseGoals;
  }

  private createTestMarketRegime(): MarketRegime {
    return new MarketRegime({
      state: 'volatile',
      volatility: 0.7,
      trend: 'sideways',
      volume: 0.6,
      sentiment: 0.4,
      timestamp: new Date()
    });
  }

  // Test execution methods
  async runIncrementalTest(testType: TestType, duration: number = 300000): Promise<TestResult> {
    console.log(`🔬 Starting incremental test: ${testType} (${duration/1000}s)`);
    
    const testResult: TestResult = {
      id: `${testType}-${Date.now()}`,
      sessionId: this.testSessionId,
      type: testType,
      startTime: new Date(),
      status: 'running',
      metrics: {},
      suggestions: [],
      feedback: []
    };

    this.testResults.push(testResult);
    this.isRunning = true;

    try {
      switch (testType) {
        case 'autonomous-decision':
          await this.testAutonomousDecisionMaking(testResult, duration);
          break;
        case 'strategic-oversight':
          await this.testStrategicOversight(testResult, duration);
          break;
        case 'alpha-discovery':
          await this.testAlphaDiscovery(testResult, duration);
          break;
        case 'inter-agent-communication':
          await this.testInterAgentCommunication(testResult, duration);
          break;
        case 'learning-adaptation':
          await this.testLearningAdaptation(testResult, duration);
          break;
        case 'full-system':
          await this.testFullSystem(testResult, duration);
          break;
        default:
          throw new Error(`Unknown test type: ${testType}`);
      }

      testResult.endTime = new Date();
      testResult.status = 'completed';
      testResult.duration = testResult.endTime.getTime() - testResult.startTime.getTime();

      console.log(`✅ Test completed: ${testType} (${testResult.duration}ms)`);
      
      // Log system metrics
      await this.logSystemMetrics(testResult);
      
      return testResult;

    } catch (error) {
      testResult.endTime = new Date();
      testResult.status = 'failed';
      testResult.error = error.message;
      
      console.error(`❌ Test failed: ${testType}`, error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  private async testAutonomousDecisionMaking(testResult: TestResult, duration: number): Promise<void> {
    console.log('🤖 Testing autonomous decision making...');
    
    const endTime = Date.now() + duration;
    let decisionCount = 0;
    let successfulDecisions = 0;

    while (Date.now() < endTime && this.isRunning) {
      for (const [agentId, agent] of this.testAgents) {
        try {
          // Trigger autonomous decision cycle
          const decisions = await agent.autonomousDecisionCycle();
          decisionCount++;

          if (decisions && decisions.length > 0) {
            successfulDecisions++;
            
            // Log each decision as a suggestion
            for (const decision of decisions) {
              const suggestion: AgentSuggestion = {
                agentId: agentId,
                type: 'autonomous-decision',
                data: decision,
                confidence: decision.confidence || 0.5,
                urgency: decision.urgency || 'medium',
                expectedValue: decision.expectedValue,
                rationale: decision.rationale || 'Autonomous decision making test'
              };

              const suggestionId = await this.database.logAgentSuggestion(suggestion);
              testResult.suggestions.push({ id: suggestionId, ...suggestion });
            }
          }

        } catch (error) {
          console.error(`Decision error for ${agentId}:`, error);
        }

        // Brief pause between agent cycles
        await this.sleep(1000);
      }

      // Pause between rounds
      await this.sleep(5000);
    }

    testResult.metrics = {
      totalDecisions: decisionCount,
      successfulDecisions: successfulDecisions,
      successRate: decisionCount > 0 ? successfulDecisions / decisionCount : 0,
      decisionsPerMinute: (decisionCount / (duration / 60000))
    };
  }

  private async testStrategicOversight(testResult: TestResult, duration: number): Promise<void> {
    console.log('🎯 Testing strategic oversight...');
    
    const endTime = Date.now() + duration;
    let strategicCycles = 0;
    let conflictsDetected = 0;
    let conflictsResolved = 0;

    while (Date.now() < endTime && this.isRunning) {
      try {
        // Run strategic cycle
        const strategicResult = await this.orchestrator.autonomousStrategicCycle();
        strategicCycles++;

        if (strategicResult) {
          // Log strategic decision
          const suggestion: AgentSuggestion = {
            agentId: 'orchestrator',
            type: 'strategic-decision',
            data: strategicResult,
            confidence: strategicResult.confidence || 0.7,
            urgency: strategicResult.urgency || 'high',
            expectedValue: strategicResult.expectedImpact,
            rationale: strategicResult.rationale || 'Strategic oversight test'
          };

          const suggestionId = await this.database.logAgentSuggestion(suggestion);
          testResult.suggestions.push({ id: suggestionId, ...suggestion });

          // Track conflicts
          if (strategicResult.conflictsDetected) {
            conflictsDetected += strategicResult.conflictsDetected;
          }
          if (strategicResult.conflictsResolved) {
            conflictsResolved += strategicResult.conflictsResolved;
          }
        }

      } catch (error) {
        console.error('Strategic oversight error:', error);
      }

      await this.sleep(10000); // 10 second cycles
    }

    testResult.metrics = {
      strategicCycles: strategicCycles,
      conflictsDetected: conflictsDetected,
      conflictsResolved: conflictsResolved,
      conflictResolutionRate: conflictsDetected > 0 ? conflictsResolved / conflictsDetected : 0,
      cyclesPerMinute: (strategicCycles / (duration / 60000))
    };
  }

  private async testAlphaDiscovery(testResult: TestResult, duration: number): Promise<void> {
    console.log('🎯 Testing alpha discovery...');
    
    const endTime = Date.now() + duration;
    let huntCycles = 0;
    let alphaDiscoveries = 0;

    while (Date.now() < endTime && this.isRunning) {
      try {
        // Run hunt cycle
        const huntResult = await this.marketHunter.autonomousHunt();
        huntCycles++;

        if (huntResult && huntResult.discoveries && huntResult.discoveries.length > 0) {
          alphaDiscoveries += huntResult.discoveries.length;

          // Log each discovery
          for (const discovery of huntResult.discoveries) {
            const suggestion: AgentSuggestion = {
              agentId: 'market-hunter',
              type: 'alpha-discovery',
              data: discovery,
              confidence: discovery.confidence || 0.6,
              urgency: discovery.urgency || 'medium',
              expectedValue: discovery.alphaValue,
              rationale: discovery.rationale || 'Alpha discovery test'
            };

            const suggestionId = await this.database.logAgentSuggestion(suggestion);
            testResult.suggestions.push({ id: suggestionId, ...suggestion });

            // Also log to alpha discoveries table
            await this.database.logAlphaDiscovery({
              type: discovery.type || 'test-discovery',
              description: discovery.description || 'Test alpha discovery',
              alphaValue: discovery.alphaValue || 0.1,
              confidence: discovery.confidence || 0.6,
              urgency: discovery.urgency || 'medium',
              source: 'test-market-hunter',
              discoveryTime: new Date(),
              actionableInsight: discovery.actionableInsight || 'Test insight',
              supportingData: discovery.supportingData || {}
            });
          }
        }

      } catch (error) {
        console.error('Alpha discovery error:', error);
      }

      await this.sleep(15000); // 15 second cycles
    }

    testResult.metrics = {
      huntCycles: huntCycles,
      alphaDiscoveries: alphaDiscoveries,
      discoveriesPerCycle: huntCycles > 0 ? alphaDiscoveries / huntCycles : 0,
      cyclesPerMinute: (huntCycles / (duration / 60000))
    };
  }

  private async testInterAgentCommunication(testResult: TestResult, duration: number): Promise<void> {
    console.log('💬 Testing inter-agent communication...');
    
    const endTime = Date.now() + duration;
    let communicationEvents = 0;
    let successfulCommunications = 0;

    while (Date.now() < endTime && this.isRunning) {
      try {
        // Simulate communication between orchestrator and market hunter
        const marketInsight = await this.marketHunter.autonomousHunt();
        
        if (marketInsight) {
          communicationEvents++;
          
          // Pass insight to orchestrator for strategic consideration
          const strategicResponse = await this.orchestrator.processSubAgentUpdate(
            'market-hunter', 
            marketInsight
          );
          
          if (strategicResponse) {
            successfulCommunications++;
            
            const suggestion: AgentSuggestion = {
              agentId: 'orchestrator',
              type: 'inter-agent-response',
              data: {
                trigger: marketInsight,
                response: strategicResponse
              },
              confidence: strategicResponse.confidence || 0.6,
              urgency: strategicResponse.urgency || 'medium',
              rationale: 'Inter-agent communication test response'
            };

            const suggestionId = await this.database.logAgentSuggestion(suggestion);
            testResult.suggestions.push({ id: suggestionId, ...suggestion });
          }
        }

      } catch (error) {
        console.error('Inter-agent communication error:', error);
      }

      await this.sleep(20000); // 20 second cycles
    }

    testResult.metrics = {
      communicationEvents: communicationEvents,
      successfulCommunications: successfulCommunications,
      communicationSuccessRate: communicationEvents > 0 ? successfulCommunications / communicationEvents : 0,
      eventsPerMinute: (communicationEvents / (duration / 60000))
    };
  }

  private async testLearningAdaptation(testResult: TestResult, duration: number): Promise<void> {
    console.log('🧠 Testing learning and adaptation...');
    
    const endTime = Date.now() + duration;
    let learningCycles = 0;
    let adaptations = 0;

    // Capture initial state
    const initialStates = new Map();
    for (const [agentId, agent] of this.testAgents) {
      initialStates.set(agentId, {
        personality: { ...agent.personality },
        reputation: agent.reputation.getCurrentScore(),
        goals: agent.goals.getAllGoals().length
      });
    }

    while (Date.now() < endTime && this.isRunning) {
      for (const [agentId, agent] of this.testAgents) {
        try {
          // Simulate learning from outcomes
          const outcome = {
            success: Math.random() > 0.3, // 70% success rate
            value: Math.random() * 100,
            feedback: Math.random() > 0.5 ? 'positive' : 'constructive'
          };

          await agent.learnFromOutcomes([outcome]);
          learningCycles++;

          // Check for adaptations
          const currentState = {
            personality: { ...agent.personality },
            reputation: agent.reputation.getCurrentScore(),
            goals: agent.goals.getAllGoals().length
          };

          const initialState = initialStates.get(agentId);
          if (this.hasSignificantChange(initialState, currentState)) {
            adaptations++;
            
            const suggestion: AgentSuggestion = {
              agentId: agentId,
              type: 'adaptation',
              data: {
                before: initialState,
                after: currentState,
                change: this.calculateChange(initialState, currentState)
              },
              confidence: 0.8,
              urgency: 'low',
              rationale: 'Learning adaptation detected'
            };

            const suggestionId = await this.database.logAgentSuggestion(suggestion);
            testResult.suggestions.push({ id: suggestionId, ...suggestion });
          }

        } catch (error) {
          console.error(`Learning error for ${agentId}:`, error);
        }
      }

      await this.sleep(10000); // 10 second cycles
    }

    testResult.metrics = {
      learningCycles: learningCycles,
      adaptations: adaptations,
      adaptationRate: learningCycles > 0 ? adaptations / learningCycles : 0,
      cyclesPerMinute: (learningCycles / (duration / 60000))
    };
  }

  private async testFullSystem(testResult: TestResult, duration: number): Promise<void> {
    console.log('🌟 Testing full system integration...');
    
    // Run all test types concurrently for shorter durations
    const subDuration = duration / 4;
    
    const tests = [
      this.testAutonomousDecisionMaking({ ...testResult, suggestions: [], metrics: {} }, subDuration),
      this.testStrategicOversight({ ...testResult, suggestions: [], metrics: {} }, subDuration),
      this.testAlphaDiscovery({ ...testResult, suggestions: [], metrics: {} }, subDuration),
      this.testInterAgentCommunication({ ...testResult, suggestions: [], metrics: {} }, subDuration)
    ];

    const results = await Promise.allSettled(tests);
    
    // Aggregate results
    let totalSuggestions = 0;
    const aggregatedMetrics: any = {};
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const testNames = ['autonomous-decision', 'strategic-oversight', 'alpha-discovery', 'inter-agent-communication'];
        aggregatedMetrics[testNames[index]] = result.value;
        totalSuggestions += result.value.suggestions?.length || 0;
      }
    });

    testResult.metrics = {
      ...aggregatedMetrics,
      totalSuggestions: totalSuggestions,
      systemEfficiency: this.calculateSystemEfficiency(aggregatedMetrics)
    };
  }

  // Helper methods
  private hasSignificantChange(before: any, after: any): boolean {
    // Simple change detection - can be made more sophisticated
    const reputationChange = Math.abs(after.reputation - before.reputation);
    const goalChange = Math.abs(after.goals - before.goals);
    
    return reputationChange > 0.1 || goalChange > 0;
  }

  private calculateChange(before: any, after: any): any {
    return {
      reputationDelta: after.reputation - before.reputation,
      goalDelta: after.goals - before.goals,
      personalityChanges: this.comparePersonalities(before.personality, after.personality)
    };
  }

  private comparePersonalities(before: any, after: any): any {
    const changes: any = {};
    for (const key in before) {
      if (Math.abs(after[key] - before[key]) > 0.05) {
        changes[key] = {
          before: before[key],
          after: after[key],
          delta: after[key] - before[key]
        };
      }
    }
    return changes;
  }

  private calculateSystemEfficiency(metrics: any): number {
    // Simple efficiency calculation
    let totalEfficiency = 0;
    let count = 0;

    if (metrics['autonomous-decision']?.successRate) {
      totalEfficiency += metrics['autonomous-decision'].successRate;
      count++;
    }
    if (metrics['strategic-oversight']?.conflictResolutionRate) {
      totalEfficiency += metrics['strategic-oversight'].conflictResolutionRate;
      count++;
    }
    if (metrics['alpha-discovery']?.discoveriesPerCycle) {
      totalEfficiency += Math.min(metrics['alpha-discovery'].discoveriesPerCycle, 1);
      count++;
    }
    if (metrics['inter-agent-communication']?.communicationSuccessRate) {
      totalEfficiency += metrics['inter-agent-communication'].communicationSuccessRate;
      count++;
    }

    return count > 0 ? totalEfficiency / count : 0;
  }

  private async logSystemMetrics(testResult: TestResult): Promise<void> {
    const systemMetrics: SystemMetricsLog = {
      overallPerformance: testResult.metrics.systemEfficiency || 0,
      agentCount: this.testAgents.size,
      activeConflicts: 0, // Would be calculated from actual conflicts
      resolvedConflicts: testResult.metrics.conflictsResolved || 0,
      emergentBehaviors: this.detectEmergentBehaviors(testResult),
      strategicDecisions: testResult.metrics.strategicCycles || 0,
      systemEfficiency: testResult.metrics.systemEfficiency || 0
    };

    await this.database.logSystemMetrics(systemMetrics);
  }

  private detectEmergentBehaviors(testResult: TestResult): string[] {
    const behaviors: string[] = [];
    
    // Analyze patterns in suggestions to detect emergent behaviors
    const suggestionTypes = testResult.suggestions.map(s => s.type);
    const typeFrequency = suggestionTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as any);

    // Look for unexpected patterns
    if (typeFrequency['autonomous-decision'] > typeFrequency['strategic-decision']) {
      behaviors.push('high-autonomy-tendency');
    }
    if (typeFrequency['alpha-discovery'] > 5) {
      behaviors.push('aggressive-alpha-hunting');
    }
    if (typeFrequency['adaptation'] > 0) {
      behaviors.push('active-learning');
    }

    return behaviors;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Feedback collection methods
  async collectHumanFeedback(suggestionId: number, feedback: string, score: number): Promise<void> {
    await this.database.updateSuggestionFeedback(suggestionId, feedback, score);
    
    // Log feedback for learning
    await this.database.logFeedback({
      sourceType: 'human',
      type: 'suggestion_rating',
      data: { suggestionId, feedback, score },
      impactScore: score
    });

    console.log(`💭 Human feedback collected for suggestion ${suggestionId}: ${score}/10`);
  }

  async generateVisualizationData(): Promise<VisualizationData> {
    const [
      recentSuggestions,
      systemMetrics,
      alphaStats,
      feedbackSummary,
      topAgents,
      underperforming
    ] = await Promise.all([
      this.database.getRecentSuggestions(100),
      this.database.getSystemMetricsHistory(7),
      this.database.getAlphaDiscoveryStats(),
      this.database.getFeedbackSummary(),
      this.database.getTopPerformingAgents(5),
      this.database.getUnderperformingAreas()
    ]);

    return {
      sessionId: this.testSessionId,
      timestamp: new Date(),
      suggestions: recentSuggestions,
      systemMetrics: systemMetrics,
      alphaStats: alphaStats,
      feedbackSummary: feedbackSummary,
      topPerformingAgents: topAgents,
      underperformingAreas: underperforming,
      testResults: this.testResults
    };
  }

  // Strategic feedback for top agent
  async generateStrategicFeedback(): Promise<StrategicFeedback> {
    const visualizationData = await this.generateVisualizationData();
    
    const feedback: StrategicFeedback = {
      timestamp: new Date(),
      overallPerformance: this.calculateOverallPerformance(visualizationData),
      agentRecommendations: this.generateAgentRecommendations(visualizationData),
      systemRecommendations: this.generateSystemRecommendations(visualizationData),
      emergentInsights: this.generateEmergentInsights(visualizationData),
      actionPriorities: this.generateActionPriorities(visualizationData)
    };

    // Log strategic feedback
    await this.database.logFeedback({
      sourceType: 'system',
      targetAgent: 'orchestrator',
      type: 'strategic_feedback',
      data: feedback,
      impactScore: feedback.overallPerformance
    });

    return feedback;
  }

  private calculateOverallPerformance(data: VisualizationData): number {
    // Calculate overall system performance from multiple metrics
    const avgFeedbackScore = data.feedbackSummary?.avg_score || 0;
    const alphaValidationRate = data.alphaStats?.avg_validation_outcome || 0;
    const systemEfficiency = data.systemMetrics.length > 0 
      ? data.systemMetrics[0].system_efficiency || 0 
      : 0;

    return (avgFeedbackScore / 10 + alphaValidationRate + systemEfficiency) / 3;
  }

  private generateAgentRecommendations(data: VisualizationData): AgentRecommendation[] {
    const recommendations: AgentRecommendation[] = [];

    // Recommendations for top performers
    data.topPerformingAgents.forEach(agent => {
      if (agent.avg_feedback_score > 8) {
        recommendations.push({
          agentId: agent.agent_id,
          type: 'enhancement',
          priority: 'medium',
          recommendation: `Increase autonomy level for ${agent.agent_id} - consistently high performance`,
          expectedImpact: 'positive'
        });
      }
    });

    // Recommendations for underperformers
    data.underperformingAreas.forEach(area => {
      recommendations.push({
        agentId: area.agent_id,
        type: 'improvement',
        priority: 'high',
        recommendation: `Focus on ${area.suggestion_type} quality for ${area.agent_id} - low avg score: ${area.avg_score}`,
        expectedImpact: 'critical'
      });
    });

    return recommendations;
  }

  private generateSystemRecommendations(data: VisualizationData): SystemRecommendation[] {
    const recommendations: SystemRecommendation[] = [];

    // System-wide recommendations based on metrics
    if (data.feedbackSummary?.avg_score < 6) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        recommendation: 'Overall system performance below threshold - consider retraining or goal adjustment',
        expectedImpact: 'critical'
      });
    }

    if (data.alphaStats?.avg_confidence < 0.6) {
      recommendations.push({
        type: 'confidence',
        priority: 'medium',
        recommendation: 'Alpha discovery confidence low - improve market analysis algorithms',
        expectedImpact: 'moderate'
      });
    }

    return recommendations;
  }

  private generateEmergentInsights(data: VisualizationData): EmergentInsight[] {
    const insights: EmergentInsight[] = [];

    // Pattern analysis for emergent behaviors
    const suggestionTypes = data.suggestions.reduce((acc, s) => {
      acc[s.suggestion_type] = (acc[s.suggestion_type] || 0) + 1;
      return acc;
    }, {} as any);

    const dominantType = Object.keys(suggestionTypes).reduce((a, b) => 
      suggestionTypes[a] > suggestionTypes[b] ? a : b
    );

    insights.push({
      type: 'behavioral_pattern',
      description: `Dominant suggestion type: ${dominantType} (${suggestionTypes[dominantType]} occurrences)`,
      significance: 'medium',
      actionable: true
    });

    return insights;
  }

  private generateActionPriorities(data: VisualizationData): ActionPriority[] {
    const priorities: ActionPriority[] = [];

    // Prioritize actions based on data analysis
    if (data.feedbackSummary?.low_score_count > data.feedbackSummary?.high_score_count) {
      priorities.push({
        action: 'Improve suggestion quality across all agents',
        priority: 1,
        urgency: 'high',
        expectedImpact: 'high',
        timeframe: '24 hours'
      });
    }

    if (data.alphaStats?.validated_count / data.alphaStats?.total_discoveries < 0.5) {
      priorities.push({
        action: 'Enhance alpha validation mechanisms',
        priority: 2,
        urgency: 'medium',
        expectedImpact: 'medium',
        timeframe: '48 hours'
      });
    }

    return priorities;
  }

  async shutdown(): Promise<void> {
    this.isRunning = false;
    await this.database.close();
    console.log('🔒 Test Bench shutdown complete');
  }
}

// Type definitions
export type TestType = 
  | 'autonomous-decision'
  | 'strategic-oversight'
  | 'alpha-discovery'
  | 'inter-agent-communication'
  | 'learning-adaptation'
  | 'full-system';

export interface TestResult {
  id: string;
  sessionId: string;
  type: TestType;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'running' | 'completed' | 'failed';
  metrics: any;
  suggestions: any[];
  feedback: any[];
  error?: string;
}

export interface VisualizationData {
  sessionId: string;
  timestamp: Date;
  suggestions: any[];
  systemMetrics: any[];
  alphaStats: any;
  feedbackSummary: any;
  topPerformingAgents: any[];
  underperformingAreas: any[];
  testResults: TestResult[];
}

export interface StrategicFeedback {
  timestamp: Date;
  overallPerformance: number;
  agentRecommendations: AgentRecommendation[];
  systemRecommendations: SystemRecommendation[];
  emergentInsights: EmergentInsight[];
  actionPriorities: ActionPriority[];
}

export interface AgentRecommendation {
  agentId: string;
  type: 'enhancement' | 'improvement' | 'adjustment';
  priority: 'low' | 'medium' | 'high';
  recommendation: string;
  expectedImpact: 'positive' | 'moderate' | 'critical';
}

export interface SystemRecommendation {
  type: 'performance' | 'confidence' | 'efficiency' | 'learning';
  priority: 'low' | 'medium' | 'high';
  recommendation: string;
  expectedImpact: 'positive' | 'moderate' | 'critical';
}

export interface EmergentInsight {
  type: 'behavioral_pattern' | 'performance_trend' | 'system_evolution';
  description: string;
  significance: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export interface ActionPriority {
  action: string;
  priority: number;
  urgency: 'low' | 'medium' | 'high';
  expectedImpact: 'low' | 'medium' | 'high';
  timeframe: string;
}