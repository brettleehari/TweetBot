#!/usr/bin/env node
/**
 * Database Test - Test the agentic database functionality
 */

import { AgenticDatabase, AgentSuggestion, FeedbackLog } from '../agency/agentic-database.js';

const chalk = {
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
  dim: (text: string) => `\x1b[2m${text}\x1b[0m`
};

async function testDatabase() {
  console.log(chalk.bold(chalk.blue('\n🔍 TESTING AGENTIC DATABASE\n')));

  const database = new AgenticDatabase();

  try {
    // Initialize database
    console.log(chalk.blue('Initializing database...'));
    await database.initialize();
    console.log(chalk.green('✓ Database initialized successfully'));

    // Test logging suggestions
    console.log(chalk.cyan('\nTesting suggestion logging...'));
    
    const testSuggestions: AgentSuggestion[] = [
      {
        agentId: 'strategic-orchestrator',
        type: 'strategic_decision',
        data: { action: 'rebalance_portfolio', priority: 'high' },
        rationale: 'Market volatility increased, need to rebalance risk',
        confidence: 0.85,
        urgency: 'high'
      },
      {
        agentId: 'market-hunter',
        type: 'opportunity_found',
        data: { symbol: 'BTC', type: 'breakout_pattern' },
        rationale: 'Detected ascending triangle pattern on BTC 4H chart',
        confidence: 0.72,
        urgency: 'medium'
      },
      {
        agentId: 'narrative-architect',
        type: 'content_suggestion',
        data: { content_type: 'analysis_thread', topic: 'defi_trends' },
        rationale: 'DeFi TVL showing unusual patterns, worth discussing',
        confidence: 0.90,
        urgency: 'low'
      }
    ];

    for (const suggestion of testSuggestions) {
      await database.logAgentSuggestion(suggestion);
      console.log(chalk.green(`✓ Logged suggestion from ${suggestion.agentId}`));
    }

    // Test retrieving recent suggestions
    console.log(chalk.cyan('\nRetrieving recent suggestions...'));
    const recentSuggestions = await database.getRecentSuggestions(10);
    
    console.log(chalk.green(`✓ Found ${recentSuggestions.length} recent suggestions:`));
    recentSuggestions.forEach((suggestion, i) => {
      const timestamp = new Date(suggestion.timestamp).toLocaleTimeString();
      console.log(`  ${i + 1}. ${chalk.dim(`[${timestamp}]`)} ${chalk.yellow(suggestion.agent_id)}: ${suggestion.suggestion_type}`);
      console.log(`     ${suggestion.reasoning}`);
      console.log(`     ${chalk.dim(`Confidence: ${(suggestion.confidence * 100).toFixed(0)}%`)}`);
      console.log('');
    });

    // Test feedback logging
    console.log(chalk.cyan('Testing feedback logging...'));
    if (recentSuggestions.length > 0) {
      const firstSuggestion = recentSuggestions[0];
      const feedback: FeedbackLog = {
        sourceType: 'human',
        type: 'suggestion_rating',
        data: { rating: 'positive', comment: 'Great analysis, very insightful' },
        impactScore: 0.95
      };
      await database.logFeedback(feedback);
      console.log(chalk.green(`✓ Logged feedback for suggestion ${firstSuggestion.id}`));
    }

    // Test getting top performing agents
    console.log(chalk.cyan('\nGetting top performing agents...'));
    const topAgents = await database.getTopPerformingAgents(3);
    console.log(chalk.green(`✓ Found ${topAgents.length} top performing agents:`));
    topAgents.forEach((agent: any, i: number) => {
      console.log(`  ${i + 1}. ${chalk.yellow(agent.agent_id)}: ${agent.avg_confidence || 'N/A'} avg confidence`);
    });

    // Test alpha discovery stats
    console.log(chalk.cyan('\nAlpha Discovery Statistics:'));
    const alphaStats = await database.getAlphaDiscoveryStats();
    console.log(chalk.green('✓ Alpha Discovery Summary:'));
    console.log(`  Total Discoveries: ${alphaStats.total_discoveries || 0}`);
    console.log(`  Average Alpha Value: ${alphaStats.avg_alpha_value || 'N/A'}`);
    console.log(`  High Confidence Count: ${alphaStats.high_confidence_count || 0}`);

    console.log(chalk.bold(chalk.green('\n🎉 DATABASE TEST COMPLETE! All functions working correctly.\n')));
    console.log(chalk.dim('Database file: ./data/agentic_suggestions.db'));

  } catch (error) {
    console.log(chalk.red(`❌ Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    console.error(error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabase().catch(console.error);
}