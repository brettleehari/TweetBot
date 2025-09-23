#!/usr/bin/env node
/**
 * Core Agency Demo - Demonstrate the core concepts of agentic behavior
 * 
 * This script simulates autonomous agents making decisions and
 * demonstrating emergent behavior without complex dependencies.
 */

import { StrategicOrchestratorAgent } from '../agency/strategic-orchestrator-agent.js';
import { MarketHunterAgent } from '../agency/market-hunter-agent.js';
import { PerformanceOptimizerAgent } from '../agency/performance-optimizer-agent.js';
import { AgenticDatabase, AgentSuggestion, StrategicDecisionLog, AlphaDiscoveryLog } from '../agency/agentic-database.js';
import { liveMarketData, LiveMarketDataService } from '../services/live-market-data.js';

const chalk = {
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  magenta: (text: string) => `\x1b[35m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
  dim: (text: string) => `\x1b[2m${text}\x1b[0m`
};

// Simulated Agent Behavior Classes
class SimulatedMarketConditions {
  private currentRegime: 'bull' | 'bear' | 'sideways' = 'sideways';
  private volatility: number = 0.2;
  private sentiment: number = 0.0;

  evolve(): void {
    // Random market evolution
    this.volatility = Math.max(0.1, Math.min(0.8, this.volatility + (Math.random() - 0.5) * 0.1));
    this.sentiment = Math.max(-1, Math.min(1, this.sentiment + (Math.random() - 0.5) * 0.2));
    
    // Determine regime based on conditions
    if (this.sentiment > 0.3 && this.volatility < 0.4) {
      this.currentRegime = 'bull';
    } else if (this.sentiment < -0.3 && this.volatility > 0.5) {
      this.currentRegime = 'bear';
    } else {
      this.currentRegime = 'sideways';
    }
  }

  // Update with live market data
  updateWithLiveData(liveData: any): void {
    try {
      // Use live data to inform simulated conditions
      if (liveData.indicators) {
        this.volatility = Math.min(0.8, liveData.indicators.volatility || this.volatility);
      }
      
      if (liveData.sentiment) {
        this.sentiment = Math.max(-1, Math.min(1, liveData.sentiment.overallSentiment || this.sentiment));
      }
      
      if (liveData.regime && liveData.regime.type) {
        // Map market regime types
        const regimeMap: { [key: string]: 'bull' | 'bear' | 'sideways' } = {
          'bull_market': 'bull',
          'bear_market': 'bear',
          'sideways': 'sideways'
        };
        this.currentRegime = regimeMap[liveData.regime.type] || this.currentRegime;
      } else {
        // Fallback regime determination
        this.evolve();
      }
      
    } catch (error) {
      // If live data processing fails, use normal evolution
      this.evolve();
    }
  }

  getState() {
    return {
      regime: this.currentRegime,
      volatility: this.volatility,
      sentiment: this.sentiment
    };
  }
}

class AutonomousAgentSimulator {
  private database: AgenticDatabase;
  private marketConditions: SimulatedMarketConditions;
  private agentStates: Map<string, any> = new Map();
  private performanceOptimizer: PerformanceOptimizerAgent;
  private marketDataService: LiveMarketDataService;

  constructor() {
    this.database = new AgenticDatabase();
    this.marketConditions = new SimulatedMarketConditions();
    this.performanceOptimizer = new PerformanceOptimizerAgent();
    this.marketDataService = liveMarketData;
    
    // Initialize agent states
    this.agentStates.set('strategic-orchestrator', {
      performance: 0.7,
      confidence: 0.8,
      lastDecision: Date.now(),
      goalAdaptations: 0
    });
    
    this.agentStates.set('market-hunter', {
      performance: 0.6,
      confidence: 0.75,
      lastDecision: Date.now(),
      opportunitiesFound: 0
    });
    
    this.agentStates.set('narrative-architect', {
      performance: 0.8,
      confidence: 0.7,
      lastDecision: Date.now(),
      goalAdaptations: 0
    });

    this.agentStates.set('performance-optimizer', {
      performance: 0.85,
      confidence: 0.9,
      lastDecision: Date.now(),
      goalAdaptations: 0,
      optimizationsCompleted: 0
    });
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };
    
    console.log(`${chalk.dim(`[${timestamp}]`)} ${colors[type]('●')} ${message}`);
  }

  // Simulate autonomous decision-making
  private async simulateAgentDecision(agentId: string): Promise<AgentSuggestion> {
    const state = this.agentStates.get(agentId)!;
    const market = this.marketConditions.getState();
    
    let suggestion: AgentSuggestion;
    
    switch (agentId) {
      case 'strategic-orchestrator':
        suggestion = {
          agentId,
          type: 'strategic_decision',
          data: {
            action: market.regime === 'bull' ? 'increase_exposure' : 
                   market.regime === 'bear' ? 'reduce_risk' : 'maintain_balance',
            market_regime: market.regime,
            volatility: market.volatility
          },
          rationale: `Market regime is ${market.regime} with ${(market.volatility * 100).toFixed(0)}% volatility. Strategic adjustment needed.`,
          confidence: Math.max(0.5, state.confidence + (Math.random() - 0.5) * 0.2),
          urgency: market.volatility > 0.5 ? 'high' : market.volatility > 0.3 ? 'medium' : 'low'
        };
        break;
        
      case 'market-hunter':
        const opportunityType = ['breakout', 'mean_reversion', 'momentum', 'divergence'][Math.floor(Math.random() * 4)];
        suggestion = {
          agentId,
          type: 'alpha_opportunity',
          data: {
            opportunity_type: opportunityType,
            asset: 'BTC',
            timeframe: '4H',
            confidence_score: Math.random() * 0.4 + 0.6
          },
          rationale: `Detected ${opportunityType} pattern in current ${market.regime} market. Volatility at ${(market.volatility * 100).toFixed(1)}% suggests strong signal.`,
          confidence: Math.max(0.4, state.confidence + (Math.random() - 0.5) * 0.3),
          urgency: opportunityType === 'breakout' ? 'high' : 'medium'
        };
        state.opportunitiesFound++;
        break;
        
      case 'narrative-architect':
        const contentTypes = ['analysis_thread', 'market_update', 'educational_post', 'community_engagement'];
        const topics = ['defi_trends', 'btc_analysis', 'altcoin_season', 'macro_factors'];
        suggestion = {
          agentId,
          type: 'content_suggestion',
          data: {
            content_type: contentTypes[Math.floor(Math.random() * contentTypes.length)],
            topic: topics[Math.floor(Math.random() * topics.length)],
            urgency_score: Math.random(),
            engagement_potential: Math.random() * 0.5 + 0.5
          },
          rationale: `Current market sentiment is ${market.sentiment > 0 ? 'positive' : 'negative'}. Content should address ${market.regime} market conditions.`,
          confidence: Math.max(0.6, state.confidence + (Math.random() - 0.5) * 0.15),
          urgency: Math.random() > 0.7 ? 'high' : 'medium'
        };
        state.contentCreated++;
        break;

      case 'performance-optimizer':
        const optimizationTypes = ['response_time', 'success_rate', 'coordination', 'resource_allocation'];
        const targetComponents = ['strategic-orchestrator', 'market-hunter', 'narrative-architect', 'system'];
        suggestion = {
          agentId,
          type: 'system_optimization',
          data: {
            optimization_type: optimizationTypes[Math.floor(Math.random() * optimizationTypes.length)],
            target_component: targetComponents[Math.floor(Math.random() * targetComponents.length)],
            expected_improvement: Math.random() * 20 + 5, // 5-25% improvement
            implementation_time: Math.random() * 300000 + 60000 // 1-5 minutes
          },
          rationale: `System performance analysis indicates potential for optimization. Current system efficiency at ${(state.performance * 100).toFixed(1)}%.`,
          confidence: Math.max(0.7, state.confidence + (Math.random() - 0.5) * 0.1),
          urgency: state.performance < 0.7 ? 'high' : 'medium'
        };
        state.optimizationsCompleted++;
        break;
        
      default:
        throw new Error(`Unknown agent: ${agentId}`);
    }
    
    // Update agent state based on decision
    state.confidence = Math.max(0.3, Math.min(0.95, state.confidence + (Math.random() - 0.5) * 0.1));
    state.lastDecision = Date.now();
    
    return suggestion;
  }

  // Update market conditions with live data integration
  private async updateMarketConditionsWithLiveData(): Promise<void> {
    try {
      // Try to get live market data
      const liveData = await this.marketDataService.getLiveMarketData();
      
      // Update simulated conditions with live data
      this.marketConditions.updateWithLiveData(liveData);
      
    } catch (error) {
      // Fallback to simulated evolution if live data fails
      this.marketConditions.evolve();
    }
  }

  // Simulate agent adaptation based on performance
  private async simulateAgentAdaptation(agentId: string, performance: number): Promise<void> {
    const state = this.agentStates.get(agentId)!;
    
    if (performance > 0.8) {
      // Good performance - increase confidence and maintain approach
      state.confidence = Math.min(0.95, state.confidence * 1.1);
      state.performance = Math.min(1.0, state.performance * 1.05);
      this.log(`${agentId} performing well, increasing confidence to ${(state.confidence * 100).toFixed(0)}%`, 'success');
    } else if (performance < 0.5) {
      // Poor performance - adapt strategy
      state.confidence = Math.max(0.3, state.confidence * 0.9);
      state.goalAdaptations = (state.goalAdaptations || 0) + 1;
      this.log(`${agentId} adapting strategy due to poor performance (adaptation #${state.goalAdaptations})`, 'warning');
    }
  }

  // Simulate inter-agent communication
  private async simulateAgentCommunication(): Promise<void> {
    this.log('🤝 Inter-agent communication initiated', 'info');
    
    const orchestratorState = this.agentStates.get('strategic-orchestrator')!;
    const hunterState = this.agentStates.get('market-hunter')!;
    
    // Simulate resource negotiation
    if (hunterState.opportunitiesFound > 3) {
      this.log('  Market Hunter requesting additional compute resources', 'info');
      this.log('  Strategic Orchestrator evaluating request...', 'info');
      
      const approved = orchestratorState.confidence > 0.7;
      this.log(`  Resource request ${approved ? 'APPROVED' : 'DENIED'}`, approved ? 'success' : 'warning');
      
      if (approved) {
        hunterState.confidence += 0.1;
        orchestratorState.performance += 0.05;
      }
    }
    
    // Simulate strategy alignment
    const market = this.marketConditions.getState();
    if (market.volatility > 0.6) {
      this.log('  High volatility detected, agents synchronizing risk parameters', 'warning');
      this.agentStates.forEach((state, agentId) => {
        state.confidence = Math.max(0.4, state.confidence * 0.9);
      });
    }
  }

  async runAgenticDemo(): Promise<void> {
    try {
      console.log(chalk.bold(chalk.blue('\n🚀 TRUE AGENTIC CRYPTO INTELLIGENCE DEMO\n')));
      console.log(chalk.dim('Simulating autonomous agents with real decision-making and adaptation\n'));

      // Initialize database
      await this.database.initialize();
      this.log('✓ Agentic system initialized', 'success');

      // Run multiple cycles to show agent behavior over time
      for (let cycle = 1; cycle <= 5; cycle++) {
        console.log(chalk.bold(`\n🔄 CYCLE ${cycle}: Market Evolution & Agent Decisions`));
        
        // Evolve market conditions with live data integration
        await this.updateMarketConditionsWithLiveData();
        const market = this.marketConditions.getState();
        this.log(`Market: ${market.regime.toUpperCase()} | Volatility: ${(market.volatility * 100).toFixed(1)}% | Sentiment: ${market.sentiment > 0 ? '+' : ''}${(market.sentiment * 100).toFixed(0)}%`, 'info');

        // Each agent makes autonomous decisions
        const agents = ['strategic-orchestrator', 'market-hunter', 'narrative-architect', 'performance-optimizer'];
        
        for (const agentId of agents) {
          const suggestion = await this.simulateAgentDecision(agentId);
          
          // Log decision to database
          await this.database.logAgentSuggestion(suggestion);
          
          this.log(`🤖 ${agentId}: ${suggestion.type} (${(suggestion.confidence * 100).toFixed(0)}% confidence)`, 'success');
          this.log(`   ${suggestion.rationale}`, 'info');
          
          // Simulate feedback and adaptation
          const performance = Math.random() * 0.6 + 0.4; // Random performance between 0.4-1.0
          await this.simulateAgentAdaptation(agentId, performance);
          
          // Add delay to simulate real-time decision making
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Simulate strategic decisions by orchestrator
        if (cycle % 2 === 0) {
          const strategicDecision: StrategicDecisionLog = {
            type: 'system_optimization',
            rationale: `Cycle ${cycle}: Optimizing system performance based on agent feedback`,
            impact: market.volatility > 0.5 ? 'high' : 'medium',
            urgency: 'medium',
            executionPlan: ['rebalance_agent_resources', 'update_risk_parameters', 'sync_strategies']
          };
          
          await this.database.logStrategicDecision(strategicDecision);
          this.log('🎯 Strategic decision logged: System optimization', 'info');
        }

        // Log alpha discoveries
        if (this.agentStates.get('market-hunter')!.opportunitiesFound > 2) {
          const alphaDiscovery: AlphaDiscoveryLog = {
            type: 'pattern_recognition',
            description: `${market.regime} market pattern detected with ${(market.volatility * 100).toFixed(0)}% volatility`,
            alphaValue: Math.random() * 0.15 + 0.05,
            confidence: Math.random() * 0.3 + 0.7,
            urgency: market.volatility > 0.5 ? 'high' : 'medium',
            source: 'market-hunter',
            discoveryTime: new Date(),
            actionableInsight: `Opportunity for ${market.regime} market positioning`,
            supportingData: { volatility: market.volatility, sentiment: market.sentiment }
          };
          
          await this.database.logAlphaDiscovery(alphaDiscovery);
          this.log('📈 Alpha discovery logged', 'success');
        }

        // Run performance optimization cycle every few cycles
        if (cycle % 3 === 0) {
          try {
            const optimizations = await this.performanceOptimizer.autonomousOptimizationCycle();
            if (optimizations.length > 0) {
              this.log(`⚡ Performance optimization: ${optimizations.length} improvements completed`, 'success');
            }
          } catch (error) {
            this.log(`⚠️ Performance optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warning');
          }
        }

        // Simulate inter-agent communication every few cycles
        if (cycle % 4 === 0) {
          await this.simulateAgentCommunication();
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Show final results
      console.log(chalk.bold('\n📊 FINAL SYSTEM STATE'));
      
      const recentSuggestions = await this.database.getRecentSuggestions(10);
      this.log(`✓ Generated ${recentSuggestions.length} autonomous decisions`, 'success');

      const alphaStats = await this.database.getAlphaDiscoveryStats();
      this.log(`✓ Discovered ${alphaStats.total_discoveries || 0} alpha opportunities`, 'success');

      console.log(chalk.cyan('\nAgent Performance Summary:'));
      this.agentStates.forEach((state, agentId) => {
        console.log(`  ${chalk.yellow(agentId)}: ${(state.confidence * 100).toFixed(0)}% confidence, ${(state.performance * 100).toFixed(0)}% performance`);
      });

      console.log(chalk.cyan('\nRecent Autonomous Decisions:'));
      recentSuggestions.slice(0, 5).forEach((decision, i) => {
        const timestamp = new Date(decision.timestamp).toLocaleTimeString();
        console.log(`  ${i + 1}. ${chalk.dim(`[${timestamp}]`)} ${chalk.yellow(decision.agent_id)}: ${decision.suggestion_type}`);
      });

      console.log(chalk.bold(chalk.green('\n🎉 AGENTIC DEMO COMPLETE!')));
      console.log(chalk.dim('Agents demonstrated:'));
      console.log(chalk.dim('✓ Autonomous decision-making'));
      console.log(chalk.dim('✓ Environmental adaptation'));
      console.log(chalk.dim('✓ Performance-based learning'));
      console.log(chalk.dim('✓ Inter-agent communication'));
      console.log(chalk.dim('✓ Emergent strategic behavior'));
      console.log(chalk.dim('\nDatabase: ./data/agentic_suggestions.db'));

    } catch (error) {
      this.log(`Demo failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      console.error(error);
      process.exit(1);
    }
  }
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new AutonomousAgentSimulator();
  demo.runAgenticDemo().catch(console.error);
}

export { AutonomousAgentSimulator };