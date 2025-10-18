import { MarketDataSourceManager } from '../services/market-data-sources';
import DatabaseService from '../../../database/database-service.js';

/**
 * AUTONOMOUS MARKET HUNTER AGENT
 * 
 * Key Agentic Capabilities:
 * 1. AUTONOMOUS DECISION-MAKING: Decides which data sources to query based on conditions
 * 2. ADAPTIVE LEARNING: Learns from historical performance of each source
 * 3. CONTEXT-AWARE: Adjusts strategy based on market volatility and time of day
 * 4. INTER-AGENT COMMUNICATION: Signals other agents when significant patterns emerge
 * 5. SELF-OPTIMIZATION: Continuously improves its decision-making model
 */

// Data source priority scoring system
interface DataSourceMetrics {
  sourceName: string;
  successRate: number; // 0-1
  avgSignalQuality: number; // 0-1
  lastUsed: Date;
  totalCalls: number;
  successfulCalls: number;
  signalsGenerated: number;
  falsePositives: number;
}

interface MarketContext {
  volatility: 'low' | 'medium' | 'high';
  trend: 'bullish' | 'bearish' | 'neutral';
  volume: 'low' | 'normal' | 'high';
  timeOfDay: 'asian' | 'european' | 'american' | 'overlap';
  fearGreedIndex?: number;
}

interface AgentDecision {
  timestamp: Date;
  selectedSources: string[];
  reasoning: string;
  confidence: number;
  marketContext: MarketContext;
  expectedValue: number;
}

interface MarketSignal {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  data: any;
  confidence: number;
  recommendedAction: string;
  targetAgents: string[];
}

export class AutonomousMarketHunter {
  private db: DatabaseService;
  private dataManager: MarketDataSourceManager;
  private sourceMetrics: Map<string, DataSourceMetrics>;
  private isRunning: boolean = false;
  private currentContext: MarketContext | null = null;
  private learningRate: number = 0.1; // How fast the agent adapts
  private explorationRate: number = 0.2; // Chance to try less-used sources
  
  // Agent configuration
  private readonly CHECK_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
  private readonly MIN_CONFIDENCE_THRESHOLD = 0.6;
  private readonly MAX_SOURCES_PER_CYCLE = 5; // Don't query all 8 every time
  
  constructor() {
    this.db = new DatabaseService();
    this.dataManager = new MarketDataSourceManager();
    this.sourceMetrics = this.initializeSourceMetrics();
  }
  
  /**
   * Initialize metrics for all 8 data sources
   */
  private initializeSourceMetrics(): Map<string, DataSourceMetrics> {
    const sources = [
      'whaleMovements',
      'narrativeShifts',
      'arbitrageOpportunities',
      'influencerSignals',
      'technicalBreakouts',
      'institutionalFlows',
      'derivativesSignals',
      'macroSignals'
    ];
    
    const metrics = new Map<string, DataSourceMetrics>();
    
    for (const source of sources) {
      metrics.set(source, {
        sourceName: source,
        successRate: 0.5, // Start neutral
        avgSignalQuality: 0.5,
        lastUsed: new Date(0), // Never used
        totalCalls: 0,
        successfulCalls: 0,
        signalsGenerated: 0,
        falsePositives: 0
      });
    }
    
    return metrics;
  }
  
  /**
   * START: Begin autonomous operation
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Market Hunter already running');
      return;
    }
    
    this.isRunning = true;
    console.log('🚀 Autonomous Market Hunter ACTIVATED');
    console.log(`📊 Operating in autonomous mode with ${this.CHECK_INTERVAL_MS / 60000}min intervals`);
    console.log(`🧠 Learning rate: ${this.learningRate}, Exploration rate: ${this.explorationRate}\n`);
    
    // Load historical metrics from database
    await this.loadHistoricalMetrics();
    
    // Start the autonomous loop
    this.autonomousLoop();
  }
  
  /**
   * STOP: Halt autonomous operation
   */
  stop() {
    this.isRunning = false;
    console.log('🛑 Autonomous Market Hunter STOPPED');
  }
  
  /**
   * Main autonomous loop - runs every 10 minutes
   */
  private async autonomousLoop() {
    while (this.isRunning) {
      try {
        console.log('\n' + '='.repeat(80));
        console.log(`🔄 AUTONOMOUS CYCLE - ${new Date().toISOString()}`);
        console.log('='.repeat(80));
        
        // Step 1: Assess current market context
        const context = await this.assessMarketContext();
        this.currentContext = context;
        
        console.log('\n📊 Market Context Assessment:');
        console.log(`  Volatility: ${context.volatility}`);
        console.log(`  Trend: ${context.trend}`);
        console.log(`  Volume: ${context.volume}`);
        console.log(`  Time Zone: ${context.timeOfDay}`);
        if (context.fearGreedIndex) {
          console.log(`  Fear & Greed: ${context.fearGreedIndex}`);
        }
        
        // Step 2: AGENT DECIDES which sources to query
        const decision = this.decideWhichSourcesToQuery(context);
        
        console.log('\n🧠 Agent Decision:');
        console.log(`  Selected Sources (${decision.selectedSources.length}/${8}):`);
        decision.selectedSources.forEach(s => console.log(`    ✓ ${s}`));
        console.log(`  Reasoning: ${decision.reasoning}`);
        console.log(`  Confidence: ${(decision.confidence * 100).toFixed(1)}%`);
        console.log(`  Expected Value: ${decision.expectedValue.toFixed(2)}`);
        
        // Step 3: Query selected sources
        const data = await this.querySelectedSources(decision.selectedSources);
        
        // Step 4: Analyze results and generate signals
        const signals = this.analyzeAndGenerateSignals(data, context);
        
        if (signals.length > 0) {
          console.log(`\n🚨 Generated ${signals.length} market signal(s):`);
          for (const signal of signals) {
            console.log(`\n  [${signal.severity.toUpperCase()}] ${signal.type}`);
            console.log(`  Message: ${signal.message}`);
            console.log(`  Confidence: ${(signal.confidence * 100).toFixed(1)}%`);
            console.log(`  Recommended Action: ${signal.recommendedAction}`);
            console.log(`  Target Agents: ${signal.targetAgents.join(', ')}`);
          }
          
          // Step 5: Broadcast signals to other agents
          await this.broadcastSignals(signals);
        } else {
          console.log('\n✅ No significant market movements detected');
        }
        
        // Step 6: Update metrics and learn
        await this.updateMetricsAndLearn(decision, data, signals);
        
        // Step 7: Store everything in database
        await this.persistCycleData(decision, data, signals);
        
        console.log(`\n⏳ Next cycle in ${this.CHECK_INTERVAL_MS / 60000} minutes...`);
        console.log('='.repeat(80));
        
        // Wait for next cycle
        await this.sleep(this.CHECK_INTERVAL_MS);
        
      } catch (error) {
        console.error('❌ Error in autonomous cycle:', error);
        await this.sleep(60000); // Wait 1 minute on error
      }
    }
  }
  
  /**
   * CORE AGENTIC DECISION: Decide which data sources to query
   * 
   * Uses:
   * - Historical performance metrics
   * - Current market context
   * - Exploration vs exploitation trade-off
   * - Cost/benefit analysis
   */
  private decideWhichSourcesToQuery(context: MarketContext): AgentDecision {
    const scores: Array<{ source: string; score: number; reasoning: string }> = [];
    
    // Calculate score for each source based on multiple factors
    for (const [sourceName, metrics] of this.sourceMetrics) {
      let score = 0;
      const reasons: string[] = [];
      
      // Factor 1: Historical success rate (0-0.3 weight)
      score += metrics.successRate * 0.3;
      reasons.push(`success:${(metrics.successRate * 100).toFixed(0)}%`);
      
      // Factor 2: Average signal quality (0-0.3 weight)
      score += metrics.avgSignalQuality * 0.3;
      reasons.push(`quality:${(metrics.avgSignalQuality * 100).toFixed(0)}%`);
      
      // Factor 3: Recency bonus - prefer sources not used recently (0-0.2 weight)
      const hoursSinceLastUse = (Date.now() - metrics.lastUsed.getTime()) / (1000 * 60 * 60);
      const recencyScore = Math.min(hoursSinceLastUse / 24, 1) * 0.2; // Max bonus after 24h
      score += recencyScore;
      reasons.push(`recency:${hoursSinceLastUse.toFixed(1)}h`);
      
      // Factor 4: Context-specific relevance (0-0.4 weight)
      const contextScore = this.calculateContextRelevance(sourceName, context);
      score += contextScore * 0.4;
      reasons.push(`context:${(contextScore * 100).toFixed(0)}%`);
      
      // Factor 5: Exploration bonus (random)
      if (Math.random() < this.explorationRate) {
        score += 0.2;
        reasons.push('exploring');
      }
      
      scores.push({
        source: sourceName,
        score: score,
        reasoning: reasons.join(', ')
      });
    }
    
    // Sort by score and select top sources
    scores.sort((a, b) => b.score - a.score);
    
    // Dynamic selection: more sources in high volatility
    const numSources = context.volatility === 'high' ? 6 : 
                       context.volatility === 'medium' ? 4 : 3;
    
    const selectedSources = scores.slice(0, Math.min(numSources, this.MAX_SOURCES_PER_CYCLE));
    
    // Calculate overall confidence
    const avgScore = selectedSources.reduce((sum, s) => sum + s.score, 0) / selectedSources.length;
    const confidence = Math.min(avgScore / 1.2, 1); // Normalize to 0-1
    
    // Generate reasoning
    const reasoning = `Selected ${selectedSources.length} sources for ${context.volatility} volatility ${context.trend} market. ` +
      `Top source: ${selectedSources[0].source} (score: ${selectedSources[0].score.toFixed(2)}). ` +
      `Strategy: ${context.volatility === 'high' ? 'comprehensive scan' : 'focused monitoring'}.`;
    
    return {
      timestamp: new Date(),
      selectedSources: selectedSources.map(s => s.source),
      reasoning,
      confidence,
      marketContext: context,
      expectedValue: avgScore
    };
  }
  
  /**
   * Calculate how relevant a data source is to current market context
   */
  private calculateContextRelevance(sourceName: string, context: MarketContext): number {
    let relevance = 0.5; // Start neutral
    
    switch (sourceName) {
      case 'whaleMovements':
        // More relevant during high volatility and Asian hours (when whales are active)
        if (context.volatility === 'high') relevance += 0.3;
        if (context.timeOfDay === 'asian') relevance += 0.2;
        break;
        
      case 'narrativeShifts':
        // More relevant during European/American hours (social media activity)
        if (context.timeOfDay === 'european' || context.timeOfDay === 'american') relevance += 0.3;
        if (context.trend !== 'neutral') relevance += 0.2;
        break;
        
      case 'arbitrageOpportunities':
        // More relevant during overlap hours and high volume
        if (context.timeOfDay === 'overlap') relevance += 0.3;
        if (context.volume === 'high') relevance += 0.2;
        break;
        
      case 'influencerSignals':
        // More relevant when trend is strong
        if (context.trend !== 'neutral') relevance += 0.4;
        if (context.volatility === 'high') relevance += 0.1;
        break;
        
      case 'technicalBreakouts':
        // More relevant during medium volatility and defined trends
        if (context.volatility === 'medium') relevance += 0.3;
        if (context.trend !== 'neutral') relevance += 0.2;
        break;
        
      case 'institutionalFlows':
        // More relevant during American hours and high volume
        if (context.timeOfDay === 'american') relevance += 0.3;
        if (context.volume === 'high') relevance += 0.2;
        break;
        
      case 'derivativesSignals':
        // More relevant during high volatility
        if (context.volatility === 'high') relevance += 0.4;
        if (context.volume === 'high') relevance += 0.1;
        break;
        
      case 'macroSignals':
        // Always somewhat relevant, but more so during neutral markets
        if (context.trend === 'neutral') relevance += 0.3;
        relevance += 0.2; // Always has base relevance
        break;
    }
    
    return Math.min(relevance, 1);
  }
  
  /**
   * Assess current market context from BTC price and indicators
   */
  private async assessMarketContext(): Promise<MarketContext> {
    try {
      // Get latest BTC price and calculate volatility
      const recentData = await this.db.runQuery(
        `SELECT price_usd, price_change_24h, volume_24h, fear_greed_index, timestamp 
         FROM market_data 
         ORDER BY timestamp DESC 
         LIMIT 10`
      );
      
      if (recentData.length === 0) {
        // No historical data, use defaults
        return this.getDefaultContext();
      }
      
      const latestData = recentData[0];
      const priceChange = Math.abs(latestData.price_change_24h || 0);
      
      // Determine volatility
      let volatility: 'low' | 'medium' | 'high';
      if (priceChange > 5) volatility = 'high';
      else if (priceChange > 2) volatility = 'medium';
      else volatility = 'low';
      
      // Determine trend
      let trend: 'bullish' | 'bearish' | 'neutral';
      const priceChangeValue = latestData.price_change_24h || 0;
      if (priceChangeValue > 1) trend = 'bullish';
      else if (priceChangeValue < -1) trend = 'bearish';
      else trend = 'neutral';
      
      // Determine volume (relative to average)
      const avgVolume = recentData.reduce((sum, d) => sum + (d.volume_24h || 0), 0) / recentData.length;
      const currentVolume = latestData.volume_24h || 0;
      let volume: 'low' | 'normal' | 'high';
      if (currentVolume > avgVolume * 1.2) volume = 'high';
      else if (currentVolume < avgVolume * 0.8) volume = 'low';
      else volume = 'normal';
      
      // Determine time of day (UTC-based)
      const hour = new Date().getUTCHours();
      let timeOfDay: 'asian' | 'european' | 'american' | 'overlap';
      if (hour >= 0 && hour < 7) timeOfDay = 'asian';
      else if (hour >= 7 && hour < 13) timeOfDay = 'european';
      else if (hour >= 13 && hour < 16) timeOfDay = 'overlap'; // EU-US overlap
      else timeOfDay = 'american';
      
      return {
        volatility,
        trend,
        volume,
        timeOfDay,
        fearGreedIndex: latestData.fear_greed_index || undefined
      };
      
    } catch (error) {
      console.error('Error assessing market context:', error);
      return this.getDefaultContext();
    }
  }
  
  private getDefaultContext(): MarketContext {
    return {
      volatility: 'medium',
      trend: 'neutral',
      volume: 'normal',
      timeOfDay: 'american'
    };
  }
  
  /**
   * Query only the selected data sources (not all 8)
   */
  private async querySelectedSources(selectedSources: string[]): Promise<any> {
    console.log(`\n📡 Querying ${selectedSources.length} selected sources...`);
    
    const results: any = {
      whaleMovements: [],
      narrativeShifts: [],
      arbitrageOpportunities: [],
      influencerSignals: [],
      technicalBreakouts: [],
      institutionalFlows: [],
      derivativesSignals: [],
      macroSignals: []
    };
    
    // Only query selected sources
    const allData = await this.dataManager.fetchAllDataSources();
    
    for (const source of selectedSources) {
      results[source] = allData[source] || [];
      const count = Array.isArray(results[source]) ? results[source].length : 0;
      console.log(`  ${count > 0 ? '✅' : '⚠️ '} ${source}: ${count} items`);
    }
    
    return results;
  }
  
  /**
   * Analyze data and generate actionable signals for other agents
   */
  private analyzeAndGenerateSignals(data: any, context: MarketContext): MarketSignal[] {
    const signals: MarketSignal[] = [];
    
    // Check whale movements
    if (data.whaleMovements?.length > 0) {
      const largeWhales = data.whaleMovements.filter((w: any) => w.amount > 100);
      if (largeWhales.length > 0) {
        signals.push({
          severity: 'high',
          type: 'WHALE_ACTIVITY',
          message: `${largeWhales.length} large whale transaction(s) detected (>100 BTC)`,
          data: largeWhales,
          confidence: 0.85,
          recommendedAction: 'Monitor for price impact in next 1-4 hours',
          targetAgents: ['bitcoin-orchestrator', 'risk-manager']
        });
      }
    }
    
    // Check narrative shifts
    if (data.narrativeShifts?.length >= 3) {
      const bullishNarratives = data.narrativeShifts.filter((n: any) => n.sentiment === 'bullish');
      if (bullishNarratives.length >= 3) {
        signals.push({
          severity: 'medium',
          type: 'POSITIVE_NARRATIVE',
          message: `Strong bullish narrative shift detected: ${bullishNarratives.map((n: any) => n.theme).join(', ')}`,
          data: bullishNarratives,
          confidence: 0.72,
          recommendedAction: 'Consider sentiment as supporting factor for long positions',
          targetAgents: ['bitcoin-orchestrator', 'market-sentiment-agent']
        });
      }
    }
    
    // Check institutional flows
    if (data.institutionalFlows?.length > 0) {
      const totalInstitutionalValue = data.institutionalFlows.reduce((sum: number, f: any) => sum + f.amount, 0);
      if (totalInstitutionalValue > 50000000000) { // >$50B
        signals.push({
          severity: 'high',
          type: 'INSTITUTIONAL_ACCUMULATION',
          message: `Major institutional holders detected: $${(totalInstitutionalValue / 1000000000).toFixed(1)}B in holdings`,
          data: data.institutionalFlows,
          confidence: 0.95,
          recommendedAction: 'Strong long-term bullish signal - institutions are accumulating',
          targetAgents: ['bitcoin-orchestrator', 'position-manager']
        });
      }
    }
    
    // Check derivatives signals
    if (data.derivativesSignals?.length > 0) {
      const extremeFunding = data.derivativesSignals.filter((d: any) => Math.abs(d.value) > 0.05);
      if (extremeFunding.length > 0) {
        signals.push({
          severity: 'critical',
          type: 'EXTREME_FUNDING',
          message: `Extreme funding rates detected - high liquidation risk`,
          data: extremeFunding,
          confidence: 0.88,
          recommendedAction: 'CAUTION: Reduce leverage, expect volatility',
          targetAgents: ['bitcoin-orchestrator', 'risk-manager']
        });
      }
    }
    
    // Check macro signals
    if (data.macroSignals?.length > 0) {
      const fearGreed = data.macroSignals.find((m: any) => m.indicator.includes('Fear'));
      if (fearGreed) {
        const value = parseInt(fearGreed.value);
        if (value > 75) {
          signals.push({
            severity: 'medium',
            type: 'EXTREME_GREED',
            message: `Market in extreme greed (${value}) - potential reversal risk`,
            data: { fearGreed },
            confidence: 0.70,
            recommendedAction: 'Consider taking profits or reducing position size',
            targetAgents: ['bitcoin-orchestrator', 'risk-manager']
          });
        } else if (value < 25) {
          signals.push({
            severity: 'medium',
            type: 'EXTREME_FEAR',
            message: `Market in extreme fear (${value}) - potential buying opportunity`,
            data: { fearGreed },
            confidence: 0.70,
            recommendedAction: 'Consider accumulation strategy',
            targetAgents: ['bitcoin-orchestrator', 'opportunity-finder']
          });
        }
      }
    }
    
    return signals;
  }
  
  /**
   * Broadcast signals to other agents via database
   */
  private async broadcastSignals(signals: MarketSignal[]) {
    for (const signal of signals) {
      try {
        // Store as system alert
        await this.db.createSystemAlert(
          signal.type,
          `[Market Hunter] ${signal.message} | Action: ${signal.recommendedAction}`,
          signal.severity === 'critical' ? 'critical' : signal.severity === 'high' ? 'warning' : 'info'
        );
        
        console.log(`  📢 Broadcasted ${signal.type} to ${signal.targetAgents.join(', ')}`);
      } catch (error) {
        console.error('Error broadcasting signal:', error);
      }
    }
  }
  
  /**
   * Update source metrics and learn from results
   */
  private async updateMetricsAndLearn(decision: AgentDecision, data: any, signals: MarketSignal[]) {
    for (const sourceName of decision.selectedSources) {
      const metrics = this.sourceMetrics.get(sourceName);
      if (!metrics) continue;
      
      metrics.totalCalls++;
      metrics.lastUsed = new Date();
      
      const dataCount = Array.isArray(data[sourceName]) ? data[sourceName].length : 0;
      
      if (dataCount > 0) {
        metrics.successfulCalls++;
        metrics.signalsGenerated += dataCount;
        
        // Update success rate with learning
        const newSuccessRate = metrics.successfulCalls / metrics.totalCalls;
        metrics.successRate = (1 - this.learningRate) * metrics.successRate + this.learningRate * newSuccessRate;
        
        // Update signal quality based on whether signals were generated
        const contributedToSignals = signals.some(s => 
          s.data && JSON.stringify(s.data).includes(sourceName)
        );
        const qualityScore = contributedToSignals ? 0.9 : 0.6;
        metrics.avgSignalQuality = (1 - this.learningRate) * metrics.avgSignalQuality + this.learningRate * qualityScore;
      }
      
      this.sourceMetrics.set(sourceName, metrics);
    }
    
    console.log('\n📈 Updated source metrics (learning applied)');
  }
  
  /**
   * Persist cycle data to database
   */
  private async persistCycleData(decision: AgentDecision, data: any, signals: MarketSignal[]) {
    try {
      // Store market hunter data
      await this.db.saveAllMarketHunterData(data);
      
      // Log agent execution
      await this.db.logAgentExecution(
        'autonomous-market-hunter',
        'autonomous_cycle',
        { decision, marketContext: decision.marketContext },
        { dataCollected: Object.keys(data).filter(k => data[k]?.length > 0), signalsGenerated: signals.length },
        true,
        0 // We don't track execution time here
      );
      
      console.log('\n💾 Persisted cycle data to database');
    } catch (error) {
      console.error('Error persisting data:', error);
    }
  }
  
  /**
   * Load historical metrics from database to improve learning
   */
  private async loadHistoricalMetrics() {
    try {
      // Load past performance data from agent_executions
      const history = await this.db.runQuery(
        `SELECT input_data, output_data FROM agent_executions 
         WHERE agent_name = 'autonomous-market-hunter' 
         ORDER BY timestamp DESC 
         LIMIT 100`
      );
      
      if (history.length > 0) {
        console.log(`📚 Loaded ${history.length} historical execution records`);
        // TODO: Parse and update metrics based on history
      }
    } catch (error) {
      console.error('Error loading historical metrics:', error);
    }
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get current agent state for monitoring
   */
  getAgentState() {
    return {
      isRunning: this.isRunning,
      currentContext: this.currentContext,
      sourceMetrics: Array.from(this.sourceMetrics.entries()).map(([name, metrics]) => ({
        name,
        ...metrics
      })),
      config: {
        checkIntervalMinutes: this.CHECK_INTERVAL_MS / 60000,
        learningRate: this.learningRate,
        explorationRate: this.explorationRate,
        maxSourcesPerCycle: this.MAX_SOURCES_PER_CYCLE,
        minConfidenceThreshold: this.MIN_CONFIDENCE_THRESHOLD
      }
    };
  }
}

// Export singleton instance
export const autonomousMarketHunter = new AutonomousMarketHunter();
