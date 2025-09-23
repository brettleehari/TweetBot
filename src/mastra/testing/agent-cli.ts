#!/usr/bin/env node
/**
 * Agent CLI - Interactive command line interface for the agentic system
 */

import { AgenticDatabase } from '../agency/agentic-database.js';
import { AutonomousAgentSimulator } from './core-agency-demo.js';

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

class AgentCLI {
  private database: AgenticDatabase;

  constructor() {
    this.database = new AgenticDatabase();
  }

  private async showHeader(): Promise<void> {
    console.log(chalk.bold(chalk.blue('\n🤖 AGENTIC CRYPTO INTELLIGENCE CLI\n')));
    console.log(chalk.dim('Interactive interface for the autonomous agent system\n'));
  }

  private async showStatus(): Promise<void> {
    await this.database.initialize();
    
    console.log(chalk.bold('📊 SYSTEM STATUS'));
    
    // Recent suggestions
    const recentSuggestions = await this.database.getRecentSuggestions(5);
    console.log(chalk.cyan(`\nRecent Agent Activity (${recentSuggestions.length} items):`));
    
    if (recentSuggestions.length > 0) {
      recentSuggestions.forEach((suggestion, i) => {
        const timestamp = new Date(suggestion.timestamp).toLocaleTimeString();
        const confidence = (suggestion.confidence * 100).toFixed(0);
        console.log(`  ${i + 1}. ${chalk.dim(`[${timestamp}]`)} ${chalk.yellow(suggestion.agent_id)}: ${suggestion.suggestion_type} (${confidence}%)`);
      });
    } else {
      console.log(chalk.dim('  No recent activity found'));
    }

    // Alpha discoveries
    const alphaStats = await this.database.getAlphaDiscoveryStats();
    console.log(chalk.cyan(`\nAlpha Intelligence:`));
    console.log(`  Total Discoveries: ${alphaStats.total_discoveries || 0}`);
    console.log(`  High Confidence: ${alphaStats.high_confidence_count || 0}`);
    if (alphaStats.avg_alpha_value) {
      console.log(`  Average Alpha Value: ${(alphaStats.avg_alpha_value * 100).toFixed(2)}%`);
    }

    // Top agents
    const topAgents = await this.database.getTopPerformingAgents(3);
    console.log(chalk.cyan(`\nTop Performing Agents:`));
    if (topAgents.length > 0) {
      topAgents.forEach((agent: any, i: number) => {
        console.log(`  ${i + 1}. ${chalk.yellow(agent.agent_id)}: ${agent.suggestion_count || 0} suggestions`);
      });
    } else {
      console.log(chalk.dim('  No agent performance data available'));
    }
  }

  private async runDemo(): Promise<void> {
    console.log(chalk.cyan('\n🚀 Starting agent demo...\n'));
    const simulator = new AutonomousAgentSimulator();
    await simulator.runAgenticDemo();
  }

  private async queryAgents(query: string): Promise<void> {
    await this.database.initialize();
    
    console.log(chalk.cyan(`\n🔍 Searching for: "${query}"\n`));
    
    // Search in recent suggestions
    const recentSuggestions = await this.database.getRecentSuggestions(20);
    const filteredSuggestions = recentSuggestions.filter(s => 
      s.agent_id.includes(query.toLowerCase()) || 
      s.suggestion_type.includes(query.toLowerCase()) ||
      (s.suggestion_data && s.suggestion_data.includes(query.toLowerCase()))
    );

    if (filteredSuggestions.length > 0) {
      console.log(chalk.green(`Found ${filteredSuggestions.length} matching suggestions:`));
      filteredSuggestions.forEach((suggestion, i) => {
        const timestamp = new Date(suggestion.timestamp).toLocaleTimeString();
        const confidence = (suggestion.confidence * 100).toFixed(0);
        console.log(`  ${i + 1}. ${chalk.dim(`[${timestamp}]`)} ${chalk.yellow(suggestion.agent_id)}: ${suggestion.suggestion_type}`);
        console.log(`     Confidence: ${confidence}% | ${suggestion.rationale || 'No rationale'}`);
        console.log('');
      });
    } else {
      console.log(chalk.dim('No matching suggestions found'));
    }
  }

  private showHelp(): void {
    console.log(chalk.cyan('\n📖 AVAILABLE COMMANDS:\n'));
    console.log('  status    - Show current system status and recent activity');
    console.log('  demo      - Run a full agent demonstration');
    console.log('  query <term> - Search agent suggestions for specific term');
    console.log('  help      - Show this help message');
    console.log('  exit      - Exit the CLI');
    console.log('');
  }

  async run(): Promise<void> {
    await this.showHeader();
    
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      // Interactive mode
      this.showHelp();
      await this.showStatus();
      return;
    }

    const command = args[0].toLowerCase();
    
    try {
      switch (command) {
        case 'status':
          await this.showStatus();
          break;
          
        case 'demo':
          await this.runDemo();
          break;
          
        case 'query':
          if (args.length < 2) {
            console.log(chalk.red('Usage: query <search_term>'));
            return;
          }
          await this.queryAgents(args[1]);
          break;
          
        case 'help':
          this.showHelp();
          break;
          
        default:
          console.log(chalk.red(`Unknown command: ${command}`));
          this.showHelp();
      }
    } catch (error) {
      console.log(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new AgentCLI();
  cli.run().catch(console.error);
}

export { AgentCLI };