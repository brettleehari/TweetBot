// Core Agency Architecture - Foundational classes for autonomous agent behavior

export interface Goal {
  id: string;
  description: string;
  priority: number;
  measurable: boolean;
  kpis: string[];
  targetValue?: number;
  deadline?: Date;
  parentGoal?: string;
  childGoals?: string[];
  autonomouslyModifiable: boolean;
}

export class GoalHierarchy {
  private goals: Map<string, Goal> = new Map();
  private primaryGoalId: string;
  private secondaryGoalIds: string[] = [];
  private tacticalGoalIds: string[] = [];

  constructor(goalStructure: {
    primary: string;
    secondary: string[];
    tactical: string[];
  }) {
    this.initializeGoalHierarchy(goalStructure);
  }

  private initializeGoalHierarchy(structure: {
    primary: string;
    secondary: string[];
    tactical: string[];
  }): void {
    // Create primary goal
    this.primaryGoalId = this.createGoal({
      description: structure.primary,
      priority: 1,
      measurable: true,
      kpis: ['reputation_score', 'influence_reach', 'trust_index'],
      autonomouslyModifiable: false // Primary goals are more stable
    });

    // Create secondary goals
    structure.secondary.forEach((desc, index) => {
      const goalId = this.createGoal({
        description: desc,
        priority: 2,
        measurable: true,
        kpis: ['engagement_rate', 'follower_growth', 'content_quality'],
        parentGoal: this.primaryGoalId,
        autonomouslyModifiable: true
      });
      this.secondaryGoalIds.push(goalId);
    });

    // Create tactical goals
    structure.tactical.forEach((desc, index) => {
      const parentSecondary = this.secondaryGoalIds[index % this.secondaryGoalIds.length];
      const goalId = this.createGoal({
        description: desc,
        priority: 3,
        measurable: true,
        kpis: ['posting_frequency', 'timing_accuracy', 'risk_management'],
        parentGoal: parentSecondary,
        autonomouslyModifiable: true
      });
      this.tacticalGoalIds.push(goalId);
    });
  }

  createGoal(goalData: Partial<Goal>): string {
    const goalId = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const goal: Goal = {
      id: goalId,
      description: goalData.description || '',
      priority: goalData.priority || 5,
      measurable: goalData.measurable || false,
      kpis: goalData.kpis || [],
      targetValue: goalData.targetValue,
      deadline: goalData.deadline,
      parentGoal: goalData.parentGoal,
      childGoals: goalData.childGoals || [],
      autonomouslyModifiable: goalData.autonomouslyModifiable || true
    };

    this.goals.set(goalId, goal);

    // Update parent goal's children
    if (goalData.parentGoal && this.goals.has(goalData.parentGoal)) {
      const parentGoal = this.goals.get(goalData.parentGoal)!;
      parentGoal.childGoals = parentGoal.childGoals || [];
      parentGoal.childGoals.push(goalId);
    }

    return goalId;
  }

  getGoal(goalId: string): Goal | undefined {
    return this.goals.get(goalId);
  }

  getPrimaryGoal(): Goal | undefined {
    return this.goals.get(this.primaryGoalId);
  }

  getSecondaryGoals(): Goal[] {
    return this.secondaryGoalIds.map(id => this.goals.get(id)!).filter(Boolean);
  }

  getTacticalGoals(): Goal[] {
    return this.tacticalGoalIds.map(id => this.goals.get(id)!).filter(Boolean);
  }

  // AGENCY: Allow autonomous goal modification
  async autonomousGoalEvolution(
    goalId: string, 
    newGoalData: Partial<Goal>,
    reason: string
  ): Promise<boolean> {
    const goal = this.goals.get(goalId);
    if (!goal || !goal.autonomouslyModifiable) {
      return false;
    }

    // Log the autonomous decision
    console.log(`🤖 AUTONOMOUS GOAL EVOLUTION: ${reason}`);
    console.log(`Original: ${goal.description}`);
    console.log(`New: ${newGoalData.description}`);

    // Update goal
    Object.assign(goal, newGoalData);
    return true;
  }

  evaluateGoalProgress(performanceData: any): GoalProgress {
    const progressMap: Map<string, number> = new Map();

    this.goals.forEach((goal, goalId) => {
      if (goal.measurable && goal.kpis.length > 0) {
        const kpiScores = goal.kpis.map(kpi => 
          this.calculateKPIScore(kpi, performanceData)
        );
        const avgScore = kpiScores.reduce((a, b) => a + b, 0) / kpiScores.length;
        progressMap.set(goalId, avgScore);
      }
    });

    return new GoalProgress(this, progressMap);
  }

  private calculateKPIScore(kpi: string, data: any): number {
    // Implement KPI scoring logic based on available data
    switch (kpi) {
      case 'reputation_score':
        return data.reputation?.score || 0;
      case 'influence_reach':
        return Math.min(data.social?.reach || 0, 100);
      case 'trust_index':
        return data.reputation?.trust || 0;
      case 'engagement_rate':
        return data.social?.engagement || 0;
      case 'follower_growth':
        return data.social?.followerGrowth || 0;
      case 'content_quality':
        return data.content?.qualityScore || 0;
      case 'posting_frequency':
        return data.posting?.frequency || 0;
      case 'timing_accuracy':
        return data.timing?.accuracy || 0;
      case 'risk_management':
        return data.risk?.managementScore || 0;
      default:
        return 50; // Default middle score
    }
  }
}

export class GoalProgress {
  constructor(
    private goalHierarchy: GoalHierarchy,
    private progressMap: Map<string, number>
  ) {}

  getOverallProgress(): number {
    const primaryGoal = this.goalHierarchy.getPrimaryGoal();
    return primaryGoal ? this.progressMap.get(primaryGoal.id) || 0 : 0;
  }

  getGoalProgress(goalId: string): number {
    return this.progressMap.get(goalId) || 0;
  }

  identifyUnderperformingGoals(threshold: number = 60): Goal[] {
    const underperforming: Goal[] = [];
    
    this.progressMap.forEach((progress, goalId) => {
      if (progress < threshold) {
        const goal = this.goalHierarchy.getGoal(goalId);
        if (goal) underperforming.push(goal);
      }
    });

    return underperforming;
  }
}

export interface ReputationMetrics {
  accuracy: number;        // 0-100
  consistency: number;     // 0-100
  responsiveness: number;  // 0-100
  influence: number;       // 0-100
  trustworthiness: number; // 0-100
  expertise: number;       // 0-100
}

export class ReputationModel {
  private history: ReputationMetrics[] = [];
  private currentReputation: ReputationMetrics;
  private decayRate: number = 0.95; // Weekly decay

  constructor() {
    this.currentReputation = {
      accuracy: 50,
      consistency: 50,
      responsiveness: 50,
      influence: 50,
      trustworthiness: 50,
      expertise: 50
    };
  }

  updateReputation(newMetrics: Partial<ReputationMetrics>): void {
    // Store historical data
    this.history.push({ ...this.currentReputation });

    // Update current reputation with weighted average
    Object.keys(newMetrics).forEach(key => {
      const metric = key as keyof ReputationMetrics;
      if (newMetrics[metric] !== undefined) {
        this.currentReputation[metric] = 
          (this.currentReputation[metric] * 0.7) + (newMetrics[metric]! * 0.3);
      }
    });

    // Apply natural decay to prevent reputation inflation
    this.applyDecay();
  }

  private applyDecay(): void {
    Object.keys(this.currentReputation).forEach(key => {
      const metric = key as keyof ReputationMetrics;
      this.currentReputation[metric] *= this.decayRate;
    });
  }

  getCurrentReputation(): ReputationMetrics {
    return { ...this.currentReputation };
  }

  getHistory(): ReputationMetrics[] {
    return [...this.history];
  }

  getOverallScore(): number {
    const metrics = this.currentReputation;
    return (
      metrics.accuracy * 0.25 +
      metrics.consistency * 0.15 +
      metrics.responsiveness * 0.1 +
      metrics.influence * 0.2 +
      metrics.trustworthiness * 0.2 +
      metrics.expertise * 0.1
    );
  }

  // AGENCY: Autonomous reputation assessment
  assessReputationTrend(): 'improving' | 'declining' | 'stable' {
    if (this.history.length < 3) return 'stable';

    const recent = this.history.slice(-3);
    const recentScores = recent.map(r => this.calculateScore(r));
    const currentScore = this.getOverallScore();

    const trend = recentScores.reduce((sum, score, index) => {
      return sum + (score * (index + 1));
    }, 0) / (recentScores.length * (recentScores.length + 1) / 2);

    if (currentScore > trend + 5) return 'improving';
    if (currentScore < trend - 5) return 'declining';
    return 'stable';
  }

  private calculateScore(metrics: ReputationMetrics): number {
    return (
      metrics.accuracy * 0.25 +
      metrics.consistency * 0.15 +
      metrics.responsiveness * 0.1 +
      metrics.influence * 0.2 +
      metrics.trustworthiness * 0.2 +
      metrics.expertise * 0.1
    );
  }
}

export type MarketRegimeType = 'bull' | 'bear' | 'crab' | 'euphoria' | 'despair' | 'accumulation' | 'distribution';

export interface MarketConditions {
  volatility: 'low' | 'medium' | 'high' | 'extreme';
  volume: 'low' | 'medium' | 'high';
  sentiment: number; // -1 to 1
  momentum: 'bullish' | 'bearish' | 'neutral';
  newsFlow: 'light' | 'moderate' | 'heavy';
  institutionalActivity: 'low' | 'medium' | 'high';
}

export class MarketRegime {
  private currentRegime: MarketRegimeType = 'crab';
  private regimeHistory: { regime: MarketRegimeType; timestamp: Date; duration: number }[] = [];
  private conditions: MarketConditions;
  private confidenceLevel: number = 0.5;

  constructor() {
    this.conditions = {
      volatility: 'medium',
      volume: 'medium',
      sentiment: 0,
      momentum: 'neutral',
      newsFlow: 'moderate',
      institutionalActivity: 'medium'
    };
  }

  updateMarketConditions(newConditions: Partial<MarketConditions>): void {
    Object.assign(this.conditions, newConditions);
    this.reassessMarketRegime();
  }

  private reassessMarketRegime(): void {
    const previousRegime = this.currentRegime;
    const newRegime = this.classifyMarketRegime();
    
    if (newRegime !== previousRegime) {
      // Record regime change
      this.regimeHistory.push({
        regime: previousRegime,
        timestamp: new Date(),
        duration: Date.now() - (this.regimeHistory[this.regimeHistory.length - 1]?.timestamp.getTime() || 0)
      });
      
      this.currentRegime = newRegime;
      console.log(`🔄 MARKET REGIME CHANGE: ${previousRegime} → ${newRegime}`);
    }
  }

  private classifyMarketRegime(): MarketRegimeType {
    const { volatility, sentiment, momentum, volume, newsFlow } = this.conditions;

    // Classification logic based on multiple factors
    if (sentiment > 0.7 && momentum === 'bullish' && volatility === 'high') {
      this.confidenceLevel = 0.9;
      return 'euphoria';
    }
    
    if (sentiment < -0.7 && momentum === 'bearish' && volume === 'high') {
      this.confidenceLevel = 0.9;
      return 'despair';
    }
    
    if (sentiment > 0.3 && momentum === 'bullish') {
      this.confidenceLevel = 0.8;
      return 'bull';
    }
    
    if (sentiment < -0.3 && momentum === 'bearish') {
      this.confidenceLevel = 0.8;
      return 'bear';
    }
    
    if (volatility === 'low' && volume === 'low' && Math.abs(sentiment) < 0.2) {
      this.confidenceLevel = 0.7;
      return sentiment > 0 ? 'accumulation' : 'distribution';
    }

    this.confidenceLevel = 0.6;
    return 'crab';
  }

  getCurrentRegime(): MarketRegimeType {
    return this.currentRegime;
  }

  getConditions(): MarketConditions {
    return { ...this.conditions };
  }

  getConfidenceLevel(): number {
    return this.confidenceLevel;
  }

  getRegimeHistory(): { regime: MarketRegimeType; timestamp: Date; duration: number }[] {
    return [...this.regimeHistory];
  }

  // AGENCY: Predict next likely regime based on patterns
  predictNextRegime(): { regime: MarketRegimeType; probability: number }[] {
    const recentHistory = this.regimeHistory.slice(-10);
    const patterns = this.analyzeRegimePatterns(recentHistory);
    
    return this.calculateRegimeProbabilities(patterns);
  }

  private analyzeRegimePatterns(history: any[]): any {
    // Analyze historical regime transitions to predict future states
    const transitions: Map<string, number> = new Map();
    
    for (let i = 1; i < history.length; i++) {
      const from = history[i - 1].regime;
      const to = history[i].regime;
      const key = `${from}->${to}`;
      transitions.set(key, (transitions.get(key) || 0) + 1);
    }

    return transitions;
  }

  private calculateRegimeProbabilities(patterns: Map<string, number>): { regime: MarketRegimeType; probability: number }[] {
    const allRegimes: MarketRegimeType[] = ['bull', 'bear', 'crab', 'euphoria', 'despair', 'accumulation', 'distribution'];
    const currentRegime = this.currentRegime;
    
    const probabilities = allRegimes.map(regime => {
      const transitionKey = `${currentRegime}->${regime}`;
      const count = patterns.get(transitionKey) || 0;
      const totalTransitions = Array.from(patterns.values()).reduce((a, b) => a + b, 0);
      
      return {
        regime,
        probability: totalTransitions > 0 ? count / totalTransitions : 1 / allRegimes.length
      };
    });

    return probabilities.sort((a, b) => b.probability - a.probability);
  }
}

export interface AgentGoals {
  primary: string;
  kpis: string[];
  adaptiveThresholds: boolean;
  personalityTraits?: string[];
  riskTolerance?: 'low' | 'medium' | 'high';
  competitiveMode?: boolean;
}

export interface PerformanceMetrics {
  successRate: number;
  efficiency: number;
  adaptability: number;
  innovation: number;
  collaboration: number;
}

export class AgentPersonality {
  private traits: Map<string, number> = new Map(); // Trait -> Strength (0-100)
  private evolutionHistory: { timestamp: Date; traits: Map<string, number> }[] = [];

  constructor(initialTraits: { [trait: string]: number }) {
    Object.entries(initialTraits).forEach(([trait, strength]) => {
      this.traits.set(trait, Math.max(0, Math.min(100, strength)));
    });
  }

  getTrait(trait: string): number {
    return this.traits.get(trait) || 0;
  }

  getAllTraits(): { [trait: string]: number } {
    return Object.fromEntries(this.traits);
  }

  // AGENCY: Autonomous personality evolution based on performance
  evolvePersonality(performanceData: PerformanceMetrics, environmentFactor: number): boolean {
    const previousTraits = new Map(this.traits);
    let hasEvolved = false;

    // Record current state before evolution
    this.evolutionHistory.push({
      timestamp: new Date(),
      traits: new Map(this.traits)
    });

    // Evolve traits based on performance
    this.traits.forEach((currentStrength, trait) => {
      const evolutionFactor = this.calculateEvolutionFactor(trait, performanceData, environmentFactor);
      const newStrength = Math.max(0, Math.min(100, currentStrength + evolutionFactor));
      
      if (Math.abs(newStrength - currentStrength) > 2) {
        this.traits.set(trait, newStrength);
        hasEvolved = true;
      }
    });

    if (hasEvolved) {
      console.log(`🧬 PERSONALITY EVOLUTION: Agent traits evolved based on performance`);
    }

    return hasEvolved;
  }

  private calculateEvolutionFactor(trait: string, performance: PerformanceMetrics, environmentFactor: number): number {
    // Different traits evolve based on different performance aspects
    let factor = 0;

    switch (trait) {
      case 'analytical':
        factor = (performance.successRate - 50) * 0.1;
        break;
      case 'creative':
        factor = (performance.innovation - 50) * 0.1;
        break;
      case 'social':
        factor = (performance.collaboration - 50) * 0.1;
        break;
      case 'aggressive':
        factor = (performance.efficiency - 50) * 0.1;
        break;
      case 'cautious':
        factor = (50 - performance.efficiency) * 0.1;
        break;
      case 'adaptive':
        factor = (performance.adaptability - 50) * 0.1;
        break;
      default:
        factor = (performance.successRate - 50) * 0.05;
    }

    // Environmental factor influences evolution speed
    return factor * environmentFactor;
  }

  getPersonalityProfile(): string {
    const dominantTraits = Array.from(this.traits.entries())
      .filter(([_, strength]) => strength > 60)
      .sort(([_, a], [__, b]) => b - a)
      .map(([trait, _]) => trait);

    return dominantTraits.slice(0, 3).join(', ') || 'balanced';
  }
}

// Export types for use by agents
export interface StrategicDecision {
  type: 'GOAL_ADJUSTMENT' | 'STRATEGY_PIVOT' | 'RESOURCE_ALLOCATION' | 'CONFLICT_RESOLUTION';
  target: string; // Agent or system component
  rationale: string;
  impact: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  executionPlan: string[];
}

export interface AgentConflict {
  agents: string[];
  conflictType: 'GOAL_CONFLICT' | 'RESOURCE_CONFLICT' | 'STRATEGY_CONFLICT';
  description: string;
  severity: 'low' | 'medium' | 'high';
  impactedGoals: string[];
}

export interface Resolution {
  decision: string;
  rationale: string;
  compromises: string[];
  newGoals?: Partial<Goal>[];
}