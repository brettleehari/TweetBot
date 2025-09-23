#!/usr/bin/env node
/**
 * Simple Agent Demo - Show agents in action
 * 
 * This script demonstrates the current agent implementations
 * with autonomous decision-making and database logging.
 */

import { StrategicOrchestratorAgent } from '../agency/strategic-orchestrator-agent.js';
import { MarketHunterAgent } from '../agency/market-hunter-agent.js';
import { AgenticDatabase } from '../agency/agentic-database.js';

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

class SimpleAgentDemo {
  private database: AgenticDatabase;
  private orchestrator?: StrategicOrchestratorAgent;
  private hunter?: MarketHunterAgent;

  constructor() {
    this.database = new AgenticDatabase();
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

  private async initializeSystem(): Promise<void> {
    this.log('Initializing Agentic System...', 'info');
    
    // Initialize database
    await this.database.initialize();
    this.log('✓ Database initialized', 'success');

    // Initialize agents
    this.orchestrator = new StrategicOrchestratorAgent();
    this.hunter = new MarketHunterAgent();

    this.log('✓ Strategic Orchestrator Agent initialized', 'success');
    this.log('✓ Market Hunter Agent initialized', 'success');
  }

  private async demonstrateAutonomousDecisions(): Promise<void> {
    this.log('\n' + chalk.bold('🧠 DEMONSTRATING AUTONOMOUS AGENT DECISIONS'), 'info');
    console.log(chalk.dim('Agents will make autonomous decisions and log them to database\n'));

    if (!this.orchestrator || !this.hunter) {
      throw new Error('Agents not initialized');
    }

    // Demonstrate orchestrator autonomous cycle
    this.log('🎯 Strategic Orchestrator running autonomous cycle...', 'info');
    try {
      const strategicDecisions = await this.orchestrator.autonomousStrategicCycle();
      this.log(`✓ Made ${strategicDecisions.length} strategic decisions`, 'success');
      
      // Log the decisions
      for (const decision of strategicDecisions) {
        await this.database.logSuggestion(
          'strategic-orchestrator',
          'strategic_decision',
          JSON.stringify(decision),
          decision.reasoning || 'Strategic decision made',
          decision.confidence || 0.8
        );
        this.log(`  - ${decision.action}: ${decision.reasoning}`, 'info');
      }
    } catch (error) {
      this.log(`Orchestrator cycle failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warning');
    }

    // Give some time between agent runs
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Demonstrate hunter autonomous cycle
    this.log('\n🎯 Market Hunter running autonomous hunt...', 'info');
    try {
      const huntResults = await this.hunter.autonomousHunt();
      this.log(`✓ Found ${huntResults.opportunities.length} opportunities`, 'success');
      this.log(`✓ Identified ${huntResults.threats.length} threats`, 'success');
      
      // Log the hunt results
      await this.database.logSuggestion(
        'market-hunter',
        'hunt_results',
        JSON.stringify(huntResults),
        `Found ${huntResults.opportunities.length} opportunities, ${huntResults.threats.length} threats`,
        huntResults.confidence
      );

      // Show some opportunities
      if (huntResults.opportunities.length > 0) {
        this.log('  📈 Top opportunities found:', 'info');
        huntResults.opportunities.slice(0, 3).forEach((opp, i) => {
          this.log(`    ${i + 1}. ${opp.description} (${opp.type})`, 'info');
        });
      }

      // Show threats
      if (huntResults.threats.length > 0) {
        this.log('  ⚠️  Threats identified:', 'warning');
        huntResults.threats.slice(0, 2).forEach((threat, i) => {
          this.log(`    ${i + 1}. ${threat.description} (${threat.severity})`, 'warning');
        });
      }

    } catch (error) {
      this.log(`Hunter cycle failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warning');
    }
  }

  private async demonstrateAdaptation(): Promise<void> {
    this.log('\n' + chalk.bold('🔄 DEMONSTRATING AGENT ADAPTATION'), 'info');
    console.log(chalk.dim('Agents will adapt to changing market conditions\n'));

    if (!this.orchestrator || !this.hunter) {
      throw new Error('Agents not initialized');
    }

    // Simulate market condition changes
    const marketConditions = [
      { name: 'Bull Market Surge', volatility: 0.3, sentiment: 0.8 },
      { name: 'Bear Market Crash', volatility: 0.7, sentiment: -0.6 },
      { name: 'Sideways Consolidation', volatility: 0.15, sentiment: 0.1 }
    ];

    for (const condition of marketConditions) {
      this.log(`\n${chalk.cyan('Market Condition:')} ${condition.name}`, 'info');
      this.log(`Volatility: ${condition.volatility} | Sentiment: ${condition.sentiment}`, 'info');

      // Let orchestrator adapt to conditions
      try {
        const adaptationResult = await this.orchestrator.adaptToMarketConditions({
          volatility: condition.volatility,
          sentiment: condition.sentiment,
          trend: condition.sentiment > 0 ? 'bullish' : condition.sentiment < -0.3 ? 'bearish' : 'neutral'
        });

        this.log(`✓ Orchestrator adapted strategy`, 'success');
        this.log(`  New approach: ${adaptationResult.newStrategy}`, 'info');

        // Log adaptation
        await this.database.logSuggestion(
          'strategic-orchestrator',
          'adaptation',
          JSON.stringify(adaptationResult),
          `Adapted to ${condition.name}`,
          0.85
        );

      } catch (error) {
        this.log(`Orchestrator adaptation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warning');
      }

      // Let hunter adapt to conditions
      try {
        const hunterAdaptation = await this.hunter.adaptToMarketRegime(
          condition.sentiment > 0 ? 'bull_market' : 
          condition.sentiment < -0.3 ? 'bear_market' : 'sideways'
        );

        this.log(`✓ Hunter adapted to regime`, 'success');
        this.log(`  Strategy shift: ${hunterAdaptation.strategyChanges.join(', ')}`, 'info');

        // Log hunter adaptation
        await this.database.logSuggestion(
          'market-hunter',
          'regime_adaptation',
          JSON.stringify(hunterAdaptation),
          `Adapted to ${condition.name}`,
          0.8
        );

      } catch (error) {
        this.log(`Hunter adaptation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warning');
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  private async showDatabaseSummary(): Promise<void> {
    this.log('\n' + chalk.bold('📊 DATABASE SUMMARY'), 'info');
    console.log(chalk.dim('Recent agent activities logged to database\n'));

    try {
      const recentSuggestions = await this.database.getRecentSuggestions(10);
      
      if (recentSuggestions.length > 0) {
        this.log(`✓ Found ${recentSuggestions.length} recent activities`, 'success');
        console.log(`\n${chalk.cyan('Recent Agent Activities:')}`);
        
        recentSuggestions.forEach((suggestion, i) => {
          const timestamp = new Date(suggestion.timestamp).toLocaleTimeString();
          console.log(`  ${i + 1}. ${chalk.dim(`[${timestamp}]`)} ${chalk.yellow(suggestion.agent_id)}: ${suggestion.suggestion_type}`);
          console.log(`     ${suggestion.reasoning || 'No reasoning provided'}`);
          console.log(`     ${chalk.dim(`Confidence: ${(suggestion.confidence * 100).toFixed(0)}%`)}`);
          console.log('');
        });
      } else {
        this.log('No recent activities found in database', 'warning');
      }

      // Show database stats
      const stats = await this.database.getSystemStats();
      console.log(`${chalk.cyan('System Statistics:')}`);
      console.log(`  Total Suggestions: ${stats.totalSuggestions}`);
      console.log(`  Active Agents: ${stats.activeAgents}`);
      console.log(`  Average Confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`);

    } catch (error) {
      this.log(`Database summary failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  async runDemo(): Promise<void> {
    try {
      console.log(chalk.bold(chalk.blue('\n🚀 AGENTIC CRYPTO INTELLIGENCE SYSTEM DEMO\n')));
      console.log(chalk.dim('Demonstrating autonomous agents with decision-making and adaptation\n'));

      await this.initializeSystem();
      await this.demonstrateAutonomousDecisions();
      await this.demonstrateAdaptation();
      await this.showDatabaseSummary();

      console.log(chalk.bold(chalk.green('\n🎉 DEMO COMPLETE! Agents demonstrated autonomous behavior.\n')));
      console.log(chalk.dim('Check ./data/agentic_suggestions.db for all logged activities.'));

    } catch (error) {
      this.log(`Demo failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      console.error(error);
      process.exit(1);
    }
  }
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new SimpleAgentDemo();
  demo.runDemo().catch(console.error);
}

export { SimpleAgentDemo };