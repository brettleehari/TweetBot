import { 
  GoalHierarchy, 
  ReputationModel, 
  MarketRegime, 
  AgentGoals, 
  AgentPersonality,
  PerformanceMetrics,
  StrategicDecision,
  AgentConflict,
  Resolution,
  Goal
} from './core-agency.js';

// Enhanced Agent base class with true agency capabilities
export abstract class AgenticAgent {
  protected agentId: string;
  protected goals: GoalHierarchy;
  protected personality: AgentPersonality;
  protected reputation: ReputationModel;
  protected marketRegime: MarketRegime;
  protected autonomyLevel: number = 0.8; // 0-1 scale
  protected learningRate: number = 0.1;
  protected decisionHistory: AgentDecision[] = [];
  protected strategies: Map<string, Strategy> = new Map();
  protected currentStrategy?: Strategy;

  constructor(
    agentId: string,
    initialGoals: any,
    initialPersonality: { [trait: string]: number },
    autonomyLevel: number = 0.8
  ) {
    this.agentId = agentId;
    this.goals = new GoalHierarchy(initialGoals);
    this.personality = new AgentPersonality(initialPersonality);
    this.reputation = new ReputationModel();
    this.marketRegime = new MarketRegime();
    this.autonomyLevel = autonomyLevel;
  }

  // CORE AGENCY METHOD: Autonomous decision-making cycle
  async autonomousDecisionCycle(): Promise<AgentDecision[]> {
    try {
      // 1. Assess current state
      const currentState = await this.assessCurrentState();
      
      // 2. Evaluate goal progress
      const goalProgress = await this.evaluateGoalProgress();
      
      // 3. Analyze environment
      const environmentAnalysis = await this.analyzeEnvironment();
      
      // 4. Generate decision options
      const decisionOptions = await this.generateDecisionOptions(
        currentState, 
        goalProgress, 
        environmentAnalysis
      );
      
      // 5. Make autonomous decisions
      const decisions = await this.makeAutonomousDecisions(decisionOptions);
      
      // 6. Execute decisions
      const executionResults = await this.executeDecisions(decisions);
      
      // 7. Learn from outcomes
      await this.learnFromOutcomes(decisions, executionResults);
      
      // 8. Record decisions in history
      this.decisionHistory.push(...decisions);
      
      return decisions;
    } catch (error) {
      console.error(`❌ Autonomous decision cycle failed for ${this.agentId}:`, error);
      return [];
    }
  }

  // AGENCY: Self-assessment and adaptation
  private async assessCurrentState(): Promise<AgentState> {
    const performanceMetrics = await this.calculatePerformanceMetrics();
    const goalProgress = this.goals.evaluateGoalProgress(performanceMetrics);
    const reputationTrend = this.reputation.assessReputationTrend();
    
    return {
      agentId: this.agentId,
      performanceMetrics,
      goalProgress: goalProgress.getOverallProgress(),
      reputationScore: this.reputation.getOverallScore(),
      reputationTrend,
      personalityProfile: this.personality.getPersonalityProfile(),
      autonomyLevel: this.autonomyLevel,
      strategicEffectiveness: this.calculateStrategicEffectiveness(),
      environmentAdaptation: this.calculateEnvironmentAdaptation()
    };
  }

  private async evaluateGoalProgress(): Promise<GoalEvaluation> {
    const progressData = await this.gatherProgressData();
    const goalProgress = this.goals.evaluateGoalProgress(progressData);
    const underperformingGoals = goalProgress.identifyUnderperformingGoals();
    
    return {
      overallProgress: goalProgress.getOverallProgress(),
      underperformingGoals,
      goalModificationNeeded: underperformingGoals.length > 0,
      strategicPivotRequired: goalProgress.getOverallProgress() < 40
    };
  }

  private async analyzeEnvironment(): Promise<EnvironmentAnalysis> {
    return {
      marketRegime: this.marketRegime.getCurrentRegime(),
      marketConditions: this.marketRegime.getConditions(),
      competitiveLandscape: await this.analyzeCompetition(),
      opportunityLandscape: await this.identifyOpportunities(),
      threatAssessment: await this.assessThreats(),
      resourceAvailability: await this.assessResources()
    };
  }

  private async generateDecisionOptions(
    state: AgentState,
    goalEval: GoalEvaluation,
    environment: EnvironmentAnalysis
  ): Promise<DecisionOption[]> {
    const options: DecisionOption[] = [];

    // Goal modification decisions
    if (goalEval.goalModificationNeeded) {
      options.push(...await this.generateGoalModificationOptions(goalEval.underperformingGoals));
    }

    // Strategy adjustment decisions
    if (state.strategicEffectiveness < 0.6) {
      options.push(...await this.generateStrategyOptions(environment));
    }

    // Opportunity pursuit decisions
    if (environment.opportunityLandscape.length > 0) {
      options.push(...await this.generateOpportunityOptions(environment.opportunityLandscape));
    }

    // Threat response decisions
    if (environment.threatAssessment.severity > 0.5) {
      options.push(...await this.generateThreatResponseOptions(environment.threatAssessment));
    }

    // Learning and adaptation decisions
    options.push(...await this.generateLearningOptions(state));

    return options;
  }

  private async makeAutonomousDecisions(options: DecisionOption[]): Promise<AgentDecision[]> {
    const decisions: AgentDecision[] = [];

    // Rank options by expected value considering agent's personality
    const rankedOptions = this.rankDecisionOptions(options);

    // Make decisions based on autonomy level and personality
    for (const option of rankedOptions) {
      const shouldExecute = await this.shouldExecuteDecision(option);
      
      if (shouldExecute) {
        const decision: AgentDecision = {
          id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: option.type,
          description: option.description,
          rationale: option.rationale,
          expectedOutcome: option.expectedValue,
          confidence: option.confidence,
          riskLevel: option.riskLevel,
          urgency: option.urgency,
          executionPlan: option.executionPlan,
          timestamp: new Date(),
          status: 'planned'
        };

        decisions.push(decision);

        // Log autonomous decision
        console.log(`🤖 AUTONOMOUS DECISION (${this.agentId}): ${decision.description}`);
        console.log(`   Rationale: ${decision.rationale}`);
        console.log(`   Confidence: ${decision.confidence}%`);
      }
    }

    return decisions;
  }

  private rankDecisionOptions(options: DecisionOption[]): DecisionOption[] {
    return options
      .map(option => ({
        ...option,
        personalityAlignment: this.calculatePersonalityAlignment(option),
        riskAdjustedValue: this.calculateRiskAdjustedValue(option)
      }))
      .sort((a, b) => {
        // Primary sort by risk-adjusted value
        const valueDiff = b.riskAdjustedValue - a.riskAdjustedValue;
        if (Math.abs(valueDiff) > 0.1) return valueDiff;
        
        // Secondary sort by personality alignment
        return b.personalityAlignment - a.personalityAlignment;
      });
  }

  private calculatePersonalityAlignment(option: DecisionOption): number {
    const traits = this.personality.getAllTraits();
    let alignment = 0;

    // Different decision types align with different personality traits
    switch (option.type) {
      case 'GOAL_MODIFICATION':
        alignment = traits.adaptive || 50;
        break;
      case 'STRATEGY_PIVOT':
        alignment = (traits.analytical + traits.creative) / 2 || 50;
        break;
      case 'OPPORTUNITY_PURSUIT':
        alignment = traits.aggressive || 50;
        break;
      case 'THREAT_RESPONSE':
        alignment = traits.cautious || 50;
        break;
      case 'LEARNING_ADAPTATION':
        alignment = traits.curious || 50;
        break;
      default:
        alignment = 50;
    }

    return alignment / 100; // Normalize to 0-1
  }

  private calculateRiskAdjustedValue(option: DecisionOption): number {
    const riskMultiplier = this.getRiskMultiplier(option.riskLevel);
    return option.expectedValue * riskMultiplier;
  }

  private getRiskMultiplier(riskLevel: 'low' | 'medium' | 'high'): number {
    const riskTolerance = this.personality.getTrait('aggressive') - this.personality.getTrait('cautious');
    
    switch (riskLevel) {
      case 'low':
        return 1.0;
      case 'medium':
        return riskTolerance > 0 ? 1.1 : 0.9;
      case 'high':
        return riskTolerance > 20 ? 1.2 : 0.7;
      default:
        return 1.0;
    }
  }

  private async shouldExecuteDecision(option: DecisionOption): Promise<boolean> {
    // Consider multiple factors for decision execution
    const factors = {
      autonomyLevel: this.autonomyLevel,
      confidence: option.confidence / 100,
      personalityAlignment: this.calculatePersonalityAlignment(option),
      resourceAvailability: await this.checkResourceAvailability(option),
      strategicAlignment: this.calculateStrategicAlignment(option)
    };

    // Calculate execution probability
    const executionProbability = 
      factors.autonomyLevel * 0.3 +
      factors.confidence * 0.25 +
      factors.personalityAlignment * 0.2 +
      factors.resourceAvailability * 0.15 +
      factors.strategicAlignment * 0.1;

    // Add some randomness to prevent deterministic behavior
    const randomFactor = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
    
    return (executionProbability * randomFactor) > 0.6;
  }

  private async executeDecisions(decisions: AgentDecision[]): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];

    for (const decision of decisions) {
      try {
        decision.status = 'executing';
        
        const result = await this.executeSpecificDecision(decision);
        
        decision.status = result.success ? 'completed' : 'failed';
        decision.actualOutcome = result.outcome;
        
        results.push(result);
        
        console.log(`${result.success ? '✅' : '❌'} Decision executed: ${decision.description}`);
        
      } catch (error) {
        decision.status = 'failed';
        decision.error = error instanceof Error ? error.message : 'Unknown error';
        
        results.push({
          decisionId: decision.id,
          success: false,
          outcome: 0,
          error: decision.error,
          timestamp: new Date()
        });
        
        console.error(`❌ Decision execution failed: ${decision.description}`, error);
      }
    }

    return results;
  }

  private async learnFromOutcomes(decisions: AgentDecision[], results: ExecutionResult[]): Promise<void> {
    const performanceData = this.calculatePerformanceFromResults(results);
    
    // Update reputation based on outcomes
    this.reputation.updateReputation({
      accuracy: performanceData.accuracy,
      consistency: performanceData.consistency,
      responsiveness: performanceData.responsiveness
    });

    // Evolve personality based on performance
    const environmentFactor = this.calculateEnvironmentFactor();
    this.personality.evolvePersonality(performanceData, environmentFactor);

    // Update strategies based on success rates
    await this.updateStrategies(decisions, results);

    // Adjust autonomy level based on performance
    this.adjustAutonomyLevel(performanceData);

    console.log(`🧠 LEARNING: ${this.agentId} learned from ${results.length} decision outcomes`);
  }

  // Abstract methods that must be implemented by specific agents
  protected abstract gatherProgressData(): Promise<any>;
  protected abstract analyzeCompetition(): Promise<CompetitiveAnalysis>;
  protected abstract identifyOpportunities(): Promise<Opportunity[]>;
  protected abstract assessThreats(): Promise<ThreatAssessment>;
  protected abstract assessResources(): Promise<ResourceAssessment>;
  protected abstract executeSpecificDecision(decision: AgentDecision): Promise<ExecutionResult>;
  protected abstract calculatePerformanceMetrics(): Promise<PerformanceMetrics>;

  // Helper methods for decision generation
  private async generateGoalModificationOptions(underperformingGoals: Goal[]): Promise<DecisionOption[]> {
    return underperformingGoals.map(goal => ({
      type: 'GOAL_MODIFICATION' as const,
      description: `Modify underperforming goal: ${goal.description}`,
      rationale: `Goal is underperforming (progress < 60%)`,
      expectedValue: 0.7,
      confidence: 75,
      riskLevel: 'medium' as const,
      urgency: 'medium' as const,
      executionPlan: [
        'Analyze root cause of underperformance',
        'Generate alternative goal formulations',
        'Implement goal modification',
        'Monitor improved performance'
      ]
    }));
  }

  private async generateStrategyOptions(environment: EnvironmentAnalysis): Promise<DecisionOption[]> {
    const strategies = await this.identifyAvailableStrategies(environment);
    
    return strategies.map(strategy => ({
      type: 'STRATEGY_PIVOT' as const,
      description: `Pivot to ${strategy.name} strategy`,
      rationale: strategy.rationale,
      expectedValue: strategy.expectedValue,
      confidence: strategy.confidence,
      riskLevel: strategy.riskLevel,
      urgency: 'medium' as const,
      executionPlan: strategy.executionPlan
    }));
  }

  private async generateOpportunityOptions(opportunities: Opportunity[]): Promise<DecisionOption[]> {
    return opportunities
      .filter(opp => opp.probability > 0.6)
      .map(opp => ({
        type: 'OPPORTUNITY_PURSUIT' as const,
        description: `Pursue opportunity: ${opp.description}`,
        rationale: `High-probability opportunity (${(opp.probability * 100).toFixed(0)}%)`,
        expectedValue: opp.expectedValue,
        confidence: opp.probability * 100,
        riskLevel: opp.riskLevel,
        urgency: opp.urgency,
        executionPlan: opp.actionPlan
      }));
  }

  private async generateThreatResponseOptions(threatAssessment: ThreatAssessment): Promise<DecisionOption[]> {
    return threatAssessment.threats.map(threat => ({
      type: 'THREAT_RESPONSE' as const,
      description: `Respond to threat: ${threat.description}`,
      rationale: `Mitigate ${threat.severity} severity threat`,
      expectedValue: threat.severity, // Higher severity = higher value to address
      confidence: 80,
      riskLevel: 'low' as const,
      urgency: threat.urgency,
      executionPlan: threat.mitigationPlan
    }));
  }

  private async generateLearningOptions(state: AgentState): Promise<DecisionOption[]> {
    const learningOpportunities = [];

    if (state.environmentAdaptation < 0.7) {
      learningOpportunities.push({
        type: 'LEARNING_ADAPTATION' as const,
        description: 'Improve environment adaptation',
        rationale: 'Low environment adaptation score',
        expectedValue: 0.8,
        confidence: 85,
        riskLevel: 'low' as const,
        urgency: 'low' as const,
        executionPlan: [
          'Analyze environment patterns',
          'Update adaptation algorithms',
          'Test new adaptation strategies',
          'Implement best-performing adaptations'
        ]
      });
    }

    return learningOpportunities;
  }

  // Utility methods
  private calculateStrategicEffectiveness(): number {
    if (this.decisionHistory.length === 0) return 0.5;
    
    const recentDecisions = this.decisionHistory.slice(-10);
    const successRate = recentDecisions.filter(d => d.status === 'completed').length / recentDecisions.length;
    
    return successRate;
  }

  private calculateEnvironmentAdaptation(): number {
    // Measure how well the agent adapts to market regime changes
    const regimeHistory = this.marketRegime.getRegimeHistory();
    if (regimeHistory.length < 2) return 0.5;
    
    // Calculate adaptation success rate during regime changes
    let adaptationScore = 0.5;
    // Implementation would analyze performance during regime transitions
    
    return adaptationScore;
  }

  private calculateStrategicAlignment(option: DecisionOption): number {
    const primaryGoal = this.goals.getPrimaryGoal();
    if (!primaryGoal) return 0.5;
    
    // Measure how well the decision aligns with primary goal
    // This is a simplified implementation
    return 0.7; // Would be more sophisticated in practice
  }

  private async checkResourceAvailability(option: DecisionOption): Promise<number> {
    // Check if the agent has resources to execute the decision
    // Returns 0-1 based on resource availability
    return 0.8; // Simplified - would check actual resources
  }

  private calculatePerformanceFromResults(results: ExecutionResult[]): PerformanceMetrics {
    const successRate = results.filter(r => r.success).length / results.length;
    
    return {
      successRate: successRate * 100,
      efficiency: 75, // Would calculate based on time/resource usage
      adaptability: 70, // Would measure based on strategy changes
      innovation: 65, // Would measure based on novel approaches
      collaboration: 60 // Would measure based on inter-agent cooperation
    };
  }

  private calculateEnvironmentFactor(): number {
    const conditions = this.marketRegime.getConditions();
    const volatility = conditions.volatility === 'high' ? 1.2 : 
                     conditions.volatility === 'medium' ? 1.0 : 0.8;
    
    return volatility;
  }

  private async updateStrategies(decisions: AgentDecision[], results: ExecutionResult[]): Promise<void> {
    // Update strategy effectiveness based on results
    // This would be more sophisticated in practice
    console.log(`📈 Updated strategies based on ${results.length} outcomes`);
  }

  private adjustAutonomyLevel(performanceData: PerformanceMetrics): void {
    if (performanceData.successRate > 80) {
      this.autonomyLevel = Math.min(1.0, this.autonomyLevel + 0.05);
    } else if (performanceData.successRate < 50) {
      this.autonomyLevel = Math.max(0.3, this.autonomyLevel - 0.05);
    }
  }

  private async identifyAvailableStrategies(environment: EnvironmentAnalysis): Promise<StrategyOption[]> {
    // Identify strategies based on current environment
    return [
      {
        name: 'aggressive',
        rationale: 'Market conditions favor aggressive approach',
        expectedValue: 0.8,
        confidence: 70,
        riskLevel: 'high',
        executionPlan: ['Increase posting frequency', 'Take stronger positions', 'Engage more actively']
      },
      {
        name: 'conservative',
        rationale: 'Market uncertainty suggests conservative approach',
        expectedValue: 0.6,
        confidence: 85,
        riskLevel: 'low',
        executionPlan: ['Focus on quality over quantity', 'Stick to proven strategies', 'Avoid controversial topics']
      }
    ];
  }

  // Public interface for other agents and the orchestrator
  public getAgentId(): string {
    return this.agentId;
  }

  public getCurrentGoals(): GoalHierarchy {
    return this.goals;
  }

  public getPersonality(): AgentPersonality {
    return this.personality;
  }

  public getReputation(): ReputationModel {
    return this.reputation;
  }

  public getAutonomyLevel(): number {
    return this.autonomyLevel;
  }

  public getDecisionHistory(): AgentDecision[] {
    return [...this.decisionHistory];
  }

  // Inter-agent communication
  public async receiveMessage(fromAgent: string, message: AgentMessage): Promise<AgentResponse> {
    return {
      success: true,
      response: `Message received from ${fromAgent}`,
      data: null
    };
  }

  public async negotiateConflict(conflict: AgentConflict): Promise<Resolution> {
    // Default negotiation strategy - can be overridden by specific agents
    return {
      decision: 'Compromise on shared goals',
      rationale: 'Maintaining system harmony',
      compromises: ['Adjust goal priorities', 'Share resources']
    };
  }
}

// Supporting interfaces and types
export interface AgentState {
  agentId: string;
  performanceMetrics: PerformanceMetrics;
  goalProgress: number;
  reputationScore: number;
  reputationTrend: 'improving' | 'declining' | 'stable';
  personalityProfile: string;
  autonomyLevel: number;
  strategicEffectiveness: number;
  environmentAdaptation: number;
}

export interface GoalEvaluation {
  overallProgress: number;
  underperformingGoals: Goal[];
  goalModificationNeeded: boolean;
  strategicPivotRequired: boolean;
}

export interface EnvironmentAnalysis {
  marketRegime: string;
  marketConditions: any;
  competitiveLandscape: CompetitiveAnalysis;
  opportunityLandscape: Opportunity[];
  threatAssessment: ThreatAssessment;
  resourceAvailability: ResourceAssessment;
}

export interface DecisionOption {
  type: 'GOAL_MODIFICATION' | 'STRATEGY_PIVOT' | 'OPPORTUNITY_PURSUIT' | 'THREAT_RESPONSE' | 'LEARNING_ADAPTATION';
  description: string;
  rationale: string;
  expectedValue: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  executionPlan: string[];
}

export interface AgentDecision {
  id: string;
  type: string;
  description: string;
  rationale: string;
  expectedOutcome: number;
  actualOutcome?: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  executionPlan: string[];
  timestamp: Date;
  status: 'planned' | 'executing' | 'completed' | 'failed';
  error?: string;
}

export interface ExecutionResult {
  decisionId: string;
  success: boolean;
  outcome: number;
  error?: string;
  timestamp: Date;
}

export interface CompetitiveAnalysis {
  competitors: string[];
  relativePosition: number;
  differentiationOpportunities: string[];
}

export interface Opportunity {
  description: string;
  probability: number;
  expectedValue: number;
  riskLevel: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  actionPlan: string[];
}

export interface ThreatAssessment {
  severity: number;
  threats: Array<{
    description: string;
    severity: number;
    urgency: 'low' | 'medium' | 'high';
    mitigationPlan: string[];
  }>;
}

export interface ResourceAssessment {
  computational: number;
  data: number;
  api: number;
  human: number;
}

export interface StrategyOption {
  name: string;
  rationale: string;
  expectedValue: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  executionPlan: string[];
}

export interface Strategy {
  name: string;
  effectiveness: number;
  lastUsed: Date;
  successRate: number;
}

export interface AgentMessage {
  type: string;
  content: any;
  urgency: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export interface AgentResponse {
  success: boolean;
  response: string;
  data: any;
}