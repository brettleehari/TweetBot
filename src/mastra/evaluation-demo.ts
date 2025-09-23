import { EasyAgentTester, testAgent, compareAgents, testCapability, stressTest, benchmarkPerformance } from './evaluation/easy-tester.js';
import { StrategicOrchestratorAgent } from './agency/strategic-orchestrator-agent.js';
import { MarketHunterAgent } from './agency/market-hunter-agent.js';

/**
 * Demo script showing how to use the agent evaluation system
 * Run this to see your agents in action!
 */
async function demonstrateEvaluation() {
  console.log('🚀 AGENT EVALUATION SYSTEM DEMO');
  console.log('='.repeat(50));
  
  // Create test agents
  console.log('\n🤖 Creating test agents...');
  
  const strategicAgent = new StrategicOrchestratorAgent({
    agentId: 'strategic-demo',
    name: 'Strategic Demo Agent',
    personality: {
      riskTolerance: 0.7,
      adaptabilityFactor: 0.8,
      learningRate: 0.6,
      collaborationStyle: 'coordinator',
      decisionMakingStyle: 'analytical'
    }
  });

  const marketAgent = new MarketHunterAgent({
    agentId: 'market-demo',
    name: 'Market Demo Agent',
    personality: {
      riskTolerance: 0.9,
      adaptabilityFactor: 0.7,
      learningRate: 0.8,
      collaborationStyle: 'independent',
      decisionMakingStyle: 'aggressive'
    }
  });

  // Initialize agents
  await strategicAgent.initialize();
  await marketAgent.initialize();
  
  console.log('✅ Agents created and initialized!');

  // Demo 1: Quick test individual agents
  console.log('\n' + '='.repeat(50));
  console.log('📋 DEMO 1: Quick Test Individual Agents');
  console.log('='.repeat(50));
  
  console.log('\n🎯 Testing Strategic Orchestrator Agent...');
  await testAgent(strategicAgent, 'strategic-orchestrator');
  
  console.log('\n🎯 Testing Market Hunter Agent...');
  await testAgent(marketAgent, 'market-hunter');

  // Demo 2: Compare agents
  console.log('\n' + '='.repeat(50));
  console.log('⚔️ DEMO 2: Agent Comparison');
  console.log('='.repeat(50));
  
  await compareAgents(
    strategicAgent, 
    marketAgent, 
    ['Strategic Orchestrator', 'Market Hunter']
  );

  // Demo 3: Test specific capabilities
  console.log('\n' + '='.repeat(50));
  console.log('🎯 DEMO 3: Capability-Specific Testing');
  console.log('='.repeat(50));
  
  console.log('\n🧠 Testing Intelligence Capability...');
  await testCapability(strategicAgent, 'intelligence');
  
  console.log('\n🤖 Testing Autonomy Capability...');
  await testCapability(marketAgent, 'autonomy');

  // Demo 4: Advanced testing options
  console.log('\n' + '='.repeat(50));
  console.log('🔬 DEMO 4: Advanced Testing Options');
  console.log('='.repeat(50));
  
  const tester = new EasyAgentTester();
  
  console.log('\n💥 Running stress test on Strategic Agent...');
  await tester.stressTest(strategicAgent);
  
  console.log('\n⚡ Running performance benchmark on Market Agent...');
  await tester.performanceBenchmark(marketAgent);

  // Demo 5: Custom test scenarios
  console.log('\n' + '='.repeat(50));
  console.log('🎨 DEMO 5: Custom Test Scenarios');
  console.log('='.repeat(50));
  
  const customScenarios = [
    tester.createCustomScenario(
      'Crypto Market Crash Response',
      'Test agent response to sudden 50% market drop',
      'adaptability',
      'hard',
      ['Implements risk management', 'Adjusts strategy', 'Preserves capital']
    ),
    tester.createCustomScenario(
      'Multi-Domain Alpha Discovery',
      'Test ability to find opportunities across different domains',
      'intelligence',
      'medium',
      ['Identifies multiple opportunities', 'Ranks by potential', 'Provides rationale']
    )
  ];
  
  console.log('\n🎯 Running custom crypto-specific tests...');
  await tester.customTest(strategicAgent, customScenarios);

  // Demo 6: Interactive features
  console.log('\n' + '='.repeat(50));
  console.log('🎮 DEMO 6: Interactive Features Available');
  console.log('='.repeat(50));
  
  console.log('\n📚 Available capabilities for testing:');
  const capabilities = tester.getAvailableCapabilities();
  capabilities.forEach((cap, index) => {
    console.log(`  ${index + 1}. ${cap}`);
  });
  
  console.log('\n📊 Evaluation history:');
  const history = tester.getEvaluationHistory();
  console.log(`  Total evaluations run: ${history.length}`);
  
  if (history.length > 0) {
    console.log('  Recent evaluations:');
    history.slice(-3).forEach(record => {
      console.log(`    • ${record.agentId}: ${(record.report.overallScore * 100).toFixed(1)}% (${record.timestamp.toLocaleTimeString()})`);
    });
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 EVALUATION DEMO COMPLETE!');
  console.log('='.repeat(50));
  
  console.log('\n💡 Quick Usage Examples:');
  console.log('  • testAgent(yourAgent, "agent-type")');
  console.log('  • compareAgents(agent1, agent2, ["Name1", "Name2"])');
  console.log('  • testCapability(yourAgent, "intelligence")');
  console.log('  • stressTest(yourAgent)');
  console.log('  • benchmarkPerformance(yourAgent)');
  
  console.log('\n🔧 Advanced Usage:');
  console.log('  • const tester = new EasyAgentTester()');
  console.log('  • await tester.fullTest(yourAgent)');
  console.log('  • await tester.monitorAgent(yourAgent, 60000)');
  console.log('  • await tester.interactiveTest(yourAgent)');
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateEvaluation().catch(console.error);
}

export { demonstrateEvaluation };