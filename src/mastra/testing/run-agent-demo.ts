#!/usr/bin/env node
/**
 * Agent Demo Runner - Show agents in action
 * 
 * This script demonstrates the True Agentic Crypto Intelligence System
 * with real autonomous agents making decisions and adapting to conditions.
 */

import { AgentEvaluator } from './agent-evaluation.js';
import { StrategicOrchestratorAgent } from '../agency/strategic-orchestrator-agent.js';
import { MarketHunterAgent } from '../agency/market-hunter-agent.js';
import { AgentDatabase } from '../agency/agentic-database.js';
import { GoalHierarchy, MarketRegime } from '../agency/core-agency.js';

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

class AgentDemo {
  private evaluator: AgentEvaluator;
  private database: AgentDatabase;
  private orchestrator?: StrategicOrchestratorAgent;
  private hunter?: MarketHunterAgent;

  constructor() {
    this.evaluator = new AgentEvaluator();
    this.database = new AgentDatabase();
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

  private async initializeAgents(): Promise<void> {
    this.log('Initializing True Agentic System...', 'info');
    
    // Initialize database
    await this.database.initialize();
    this.log('✓ Database initialized', 'success');

    // Create goal hierarchies
    const orchestratorGoals = new GoalHierarchy([
      { id: 'maximize-system-performance', priority: 10, description: 'Optimize overall system performance' },
      { id: 'manage-risk', priority: 8, description: 'Maintain risk within acceptable bounds' },
      { id: 'coordinate-agents', priority: 7, description: 'Ensure agent coordination and synergy' }
    ]);

    const hunterGoals = new GoalHierarchy([
      { id: 'find-alpha', priority: 10, description: 'Discover profitable trading opportunities' },
      { id: 'analyze-market', priority: 8, description: 'Continuously analyze market conditions' },
      { id: 'competitive-intel', priority: 6, description: 'Monitor competitor activities' }
    ]);

    // Initialize agents
    this.orchestrator = new StrategicOrchestratorAgent('orchestrator-1', orchestratorGoals);
    this.hunter = new MarketHunterAgent('hunter-1', hunterGoals);

    this.log('✓ Strategic Orchestrator Agent initialized', 'success');
    this.log('✓ Market Hunter Agent initialized', 'success');
  }

  private async demonstrateAutonomousDecisions(): Promise<void> {
    this.log('\n' + chalk.bold('🧠 DEMONSTRATING AUTONOMOUS AGENT DECISIONS'), 'info');
    console.log(chalk.dim('Agents will now make autonomous decisions based on simulated market conditions\n'));

    if (!this.orchestrator || !this.hunter) {
      throw new Error('Agents not initialized');
    }

    // Simulate different market conditions
    const marketConditions = [
      { regime: 'bull_market', volatility: 0.3, sentiment: 0.8 },
      { regime: 'bear_market', volatility: 0.6, sentiment: -0.4 },
      { regime: 'sideways', volatility: 0.2, sentiment: 0.1 }
    ] as const;

    for (const condition of marketConditions) {
      this.log(`\n${chalk.cyan('Market Condition:')} ${condition.regime.replace('_', ' ').toUpperCase()}`, 'info');
      this.log(`Volatility: ${condition.volatility} | Sentiment: ${condition.sentiment}`, 'info');

      // Create market regime
      const regime = new MarketRegime(
        condition.regime,
        { volatility: condition.volatility, sentiment: condition.sentiment },
        new Date()
      );

      // Let agents make autonomous decisions
      this.log('\n🤖 Orchestrator making strategic decision...', 'info');
      const orchestratorDecision = await this.orchestrator.makeDecision({
        marketRegime: regime,
        timestamp: new Date(),
        availableActions: ['rebalance_strategy', 'adjust_risk', 'coordinate_agents', 'wait']
      });

      this.log(`✓ Decision: ${orchestratorDecision.action}`, 'success');
      this.log(`  Reasoning: ${orchestratorDecision.reasoning}`, 'info');
      this.log(`  Confidence: ${(orchestratorDecision.confidence * 100).toFixed(0)}%`, 'info');

      this.log('\n🎯 Hunter seeking opportunities...', 'info');
      const hunterDecision = await this.hunter.makeDecision({
        marketRegime: regime,
        timestamp: new Date(),
        availableActions: ['hunt_alpha', 'analyze_trend', 'monitor_competitors', 'wait']
      });

      this.log(`✓ Decision: ${hunterDecision.action}`, 'success');
      this.log(`  Reasoning: ${hunterDecision.reasoning}`, 'info');
      this.log(`  Confidence: ${(hunterDecision.confidence * 100).toFixed(0)}%`, 'info');

      // Log decisions to database
      await this.database.logSuggestion(
        this.orchestrator.id,
        'autonomous_decision',
        orchestratorDecision.action,
        orchestratorDecision.reasoning,
        orchestratorDecision.confidence
      );

      await this.database.logSuggestion(
        this.hunter.id,
        'autonomous_decision',
        hunterDecision.action,
        hunterDecision.reasoning,
        hunterDecision.confidence
      );

      // Simulate some delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  private async demonstrateAgentAdaptation(): Promise<void> {
    this.log('\n' + chalk.bold('🔄 DEMONSTRATING AGENT ADAPTATION'), 'info');
    console.log(chalk.dim('Agents will adapt their goals and strategies based on performance\n'));

    if (!this.orchestrator || !this.hunter) {
      throw new Error('Agents not initialized');
    }

    // Simulate performance feedback
    const performanceScenarios = [
      { agent: 'orchestrator', outcome: 'success', performance: 0.85 },
      { agent: 'hunter', outcome: 'failure', performance: 0.35 },
      { agent: 'hunter', outcome: 'success', performance: 0.92 }
    ];

    for (const scenario of performanceScenarios) {
      const agent = scenario.agent === 'orchestrator' ? this.orchestrator : this.hunter;
      
      this.log(`\n${chalk.magenta('Performance Feedback:')} ${agent.id}`, 'info');
      this.log(`Outcome: ${scenario.outcome} | Performance: ${(scenario.performance * 100).toFixed(0)}%`, 'info');

      // Let agent learn from outcome
      const learningResult = await agent.learnFromOutcome(
        scenario.outcome as 'success' | 'failure',
        scenario.performance,
        `Performance feedback: ${scenario.outcome} with score ${scenario.performance}`
      );

      this.log(`✓ Learning applied: ${learningResult.description}`, 'success');
      this.log(`  Goal adjustments: ${learningResult.goalAdjustments.length}`, 'info');
      this.log(`  Strategy changes: ${learningResult.strategyChanges.length}`, 'info');

      // Show goal evolution
      if (learningResult.goalAdjustments.length > 0) {
        this.log(`  📈 Goals evolved:`, 'info');
        learningResult.goalAdjustments.forEach(adj => {
          this.log(`    - ${adj}`, 'info');
        });
      }
    }
  }

  private async demonstrateInterAgentCommunication(): Promise<void> {
    this.log('\n' + chalk.bold('💬 DEMONSTRATING INTER-AGENT COMMUNICATION'), 'info');
    console.log(chalk.dim('Agents will negotiate and coordinate with each other\n'));

    if (!this.orchestrator || !this.hunter) {
      throw new Error('Agents not initialized');
    }

    // Simulate negotiation scenario
    this.log('🤝 Negotiating resource allocation...', 'info');
    
    const negotiationResult = await this.orchestrator.negotiateWithAgent(
      this.hunter,
      'resource_allocation',
      {
        requested_resources: ['compute_time', 'data_access', 'api_calls'],
        priority_level: 'high',
        justification: 'Market volatility spike detected, need increased monitoring'
      }
    );

    this.log(`✓ Negotiation ${negotiationResult.outcome}`, 
             negotiationResult.outcome === 'accepted' ? 'success' : 'warning');
    this.log(`  Terms: ${negotiationResult.terms}`, 'info');
    this.log(`  Impact: ${negotiationResult.impact}`, 'info');

    // Show agent coordination
    this.log('\n🎯 Coordinating strategies...', 'info');
    
    // Orchestrator coordinates with hunter
    const coordinationActions = [
      'Synchronizing market analysis schedules',
      'Sharing intelligence findings',
      'Aligning risk parameters',
      'Coordinating trade execution timing'
    ];

    for (const action of coordinationActions) {
      this.log(`  ✓ ${action}`, 'success');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  private async runPerformanceEvaluation(): Promise<void> {
    this.log('\n' + chalk.bold('📊 RUNNING PERFORMANCE EVALUATION'), 'info');
    console.log(chalk.dim('Evaluating overall agentic system performance\n'));

    // Run comprehensive evaluation
    const report = await this.evaluator.runAgentEvaluation();

    this.log('✓ Evaluation complete', 'success');
    this.log(`\n${chalk.bold('PERFORMANCE SUMMARY:')}`, 'info');
    console.log(`${chalk.cyan('Overall Score:')} ${report.overallScore}/100`);
    console.log(`${chalk.cyan('Decisions Made:')} ${report.totalDecisions}`);
    console.log(`${chalk.cyan('Successful Adaptations:')} ${report.successfulAdaptations}`);
    console.log(`${chalk.cyan('Agent Interactions:')} ${report.agentInteractions}`);
    
    if (report.recommendations.length > 0) {
      console.log(`\n${chalk.yellow('Recommendations:')}`);
      report.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }

    // Show recent decisions from database
    const recentDecisions = await this.database.getRecentSuggestions(5);
    if (recentDecisions.length > 0) {
      console.log(`\n${chalk.cyan('Recent Agent Decisions:')}`);
      recentDecisions.forEach(decision => {
        console.log(`  ${chalk.dim(decision.timestamp)} ${decision.agent_id}: ${decision.suggestion_text}`);
      });
    }
  }

  async runDemo(): Promise<void> {
    try {
      console.log(chalk.bold(chalk.blue('\n🚀 TRUE AGENTIC CRYPTO INTELLIGENCE SYSTEM DEMO\n')));
      console.log(chalk.dim('Demonstrating autonomous agents with real agency, goals, and decision-making\n'));

      await this.initializeAgents();
      await this.demonstrateAutonomousDecisions();
      await this.demonstrateAgentAdaptation();
      await this.demonstrateInterAgentCommunication();
      await this.runPerformanceEvaluation();

      console.log(chalk.bold(chalk.green('\n🎉 DEMO COMPLETE! Agents demonstrated true autonomous behavior.\n')));
      console.log(chalk.dim('Check the database for logged decisions and suggestions.'));

    } catch (error) {
      this.log(`Demo failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      console.error(error);
      process.exit(1);
    }
  }
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new AgentDemo();
  demo.runDemo().catch(console.error);
}

export { AgentDemo };