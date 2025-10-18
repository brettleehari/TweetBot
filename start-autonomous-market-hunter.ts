import { autonomousMarketHunter } from './src/mastra/agency/autonomous-market-hunter';

/**
 * Start the Autonomous Market Hunter Agent
 * 
 * This agent will:
 * - Run every 10 minutes autonomously
 * - Decide which data sources to query based on market conditions
 * - Learn from historical performance
 * - Generate signals for other agents
 * - Adapt strategy over time
 */

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        🤖 AUTONOMOUS MARKET HUNTER AGENT v1.0                ║
║                                                               ║
║  Truly Agentic Bitcoin Market Intelligence System            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

console.log('⚙️  Agent Configuration:');
console.log('  • Check Interval: 10 minutes');
console.log('  • Decision Making: Autonomous');
console.log('  • Learning: Adaptive (10% learning rate)');
console.log('  • Exploration: 20% chance to try new sources');
console.log('  • Max Sources/Cycle: 5 out of 8');
console.log('');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down Autonomous Market Hunter...');
  autonomousMarketHunter.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down Autonomous Market Hunter...');
  autonomousMarketHunter.stop();
  process.exit(0);
});

// Start the agent
autonomousMarketHunter.start().catch(error => {
  console.error('❌ Fatal error starting Market Hunter:', error);
  process.exit(1);
});

console.log('\n💡 TIP: The agent will make its first decision within 10 minutes.');
console.log('💡 Monitor the logs to see autonomous decision-making in action.');
console.log('💡 Press Ctrl+C to stop the agent.\n');
