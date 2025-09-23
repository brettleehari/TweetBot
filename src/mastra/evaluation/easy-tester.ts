import { AgentEvaluationSystem, TestScenario } from './agent-evaluator.js';
import { StrategicOrchestratorAgent } from '../agency/strategic-orchestrator-agent.js';
import { MarketHunterAgent } from '../agency/market-hunter-agent.js';

/**
 * Easy-to-use test bench for evaluating agents
 * Provides simple interface for quick agent testing
 */
export class EasyAgentTester {
  private evaluator: AgentEvaluationSystem;
  private predefinedScenarios: Map<string, TestScenario[]>;

  constructor() {
    this.evaluator = new AgentEvaluationSystem();
    this.initializePredefinedScenarios();
  }

  /**
   * Quick test - runs essential tests with minimal setup
   */
  async quickTest(agent: any, agentType?: string): Promise<void> {
    console.log('🚀 QUICK AGENT TEST STARTING...\n');
    
    const scenarios = this.getQuickTestScenarios(agentType);
    await this.evaluator.evaluateAgent(agent, scenarios);
    
    console.log('✅ Quick test completed!');
  }

  /**
   * Full test - comprehensive evaluation with all scenarios
   */
  async fullTest(agent: any, agentType?: string): Promise<void> {
    console.log('🔬 FULL AGENT EVALUATION STARTING...\n');
    
    const scenarios = this.getFullTestScenarios(agentType);
    await this.evaluator.evaluateAgent(agent, scenarios);
    
    console.log('✅ Full evaluation completed!');
  }

  /**
   * Compare multiple agents
   */
  async compareAgents(agents: { agent: any, name: string, type?: string }[]): Promise<void> {
    console.log('⚔️ AGENT COMPARISON STARTING...\n');
    
    const results = [];
    
    for (const { agent, name, type } of agents) {
      console.log(`\n--- Testing ${name} ---`);
      const scenarios = this.getQuickTestScenarios(type);
      const result = await this.evaluator.evaluateAgent(agent, scenarios);
      results.push({ name, result });
    }
    
    // Print comparison
    this.printComparison(results);
    
    console.log('✅ Agent comparison completed!');
  }

  /**
   * Stress test - tests agent under extreme conditions
   */
  async stressTest(agent: any): Promise<void> {
    console.log('💥 STRESS TEST STARTING...\n');
    
    const stressScenarios = this.getStressTestScenarios();
    await this.evaluator.evaluateAgent(agent, stressScenarios);
    
    console.log('✅ Stress test completed!');
  }

  /**
   * Custom test with user-defined scenarios
   */
  async customTest(agent: any, scenarios: TestScenario[]): Promise<void> {
    console.log('🎯 CUSTOM TEST STARTING...\n');
    
    await this.evaluator.evaluateAgent(agent, scenarios);
    
    console.log('✅ Custom test completed!');
  }

  /**
   * Performance benchmark - tests speed and efficiency
   */
  async performanceBenchmark(agent: any): Promise<void> {
    console.log('⚡ PERFORMANCE BENCHMARK STARTING...\n');
    
    const performanceScenarios = this.getPerformanceScenarios();
    const startTime = Date.now();
    
    await this.evaluator.evaluateAgent(agent, performanceScenarios);
    
    const totalTime = Date.now() - startTime;
    console.log(`\n⏱️ Total benchmark time: ${totalTime}ms`);
    console.log('✅ Performance benchmark completed!');
  }

  /**
   * Interactive test mode - allows user to select tests
   */
  async interactiveTest(agent: any): Promise<void> {
    console.log('🎮 INTERACTIVE TEST MODE\n');
    
    console.log('Available test types:');
    console.log('1. Quick Test (5 min)');
    console.log('2. Full Test (15 min)');
    console.log('3. Stress Test (10 min)');
    console.log('4. Performance Benchmark (8 min)');
    
    // For now, default to quick test
    console.log('\n🎯 Running Quick Test (default selection)...\n');
    await this.quickTest(agent);
  }

  /**
   * Test specific capability
   */
  async testCapability(agent: any, capability: string): Promise<void> {
    console.log(`🎯 TESTING ${capability.toUpperCase()} CAPABILITY...\n`);
    
    const scenarios = this.getCapabilityScenarios(capability);
    await this.evaluator.evaluateAgent(agent, scenarios);
    
    console.log(`✅ ${capability} capability test completed!`);
  }

  /**
   * Monitor agent continuously
   */
  async monitorAgent(agent: any, duration: number = 60000): Promise<void> {
    console.log(`📊 MONITORING AGENT FOR ${duration/1000} SECONDS...\n`);
    
    const interval = 10000; // Test every 10 seconds
    const tests = Math.floor(duration / interval);
    
    for (let i = 0; i < tests; i++) {
      console.log(`\n--- Monitor Test ${i + 1}/${tests} ---`);
      
      const scenarios = this.getMonitoringScenarios();
      await this.evaluator.evaluateAgent(agent, scenarios);
      
      if (i < tests - 1) {
        await this.sleep(interval);
      }
    }
    
    console.log('✅ Agent monitoring completed!');
  }

  // Helper methods
  private initializePredefinedScenarios(): void {
    this.predefinedScenarios = new Map();
    
    // Quick test scenarios (essential tests)
    this.predefinedScenarios.set('quick', [
      {
        name: 'Basic Decision Making',
        description: 'Test fundamental decision-making capabilities',
        type: 'autonomy',
        difficulty: 'easy',
        expectedOutcomes: ['Makes autonomous decisions', 'Provides reasoning']
      },
      {
        name: 'Problem Recognition',
        description: 'Test ability to identify and categorize problems',
        type: 'intelligence',
        difficulty: 'easy',
        expectedOutcomes: ['Identifies core issues', 'Categorizes problems correctly']
      },
      {
        name: 'Basic Adaptation',
        description: 'Test response to simple environmental changes',
        type: 'adaptability',
        difficulty: 'easy',
        expectedOutcomes: ['Adapts strategy', 'Maintains effectiveness']
      }
    ]);

    // Full test scenarios (comprehensive)
    this.predefinedScenarios.set('full', [
      {
        name: 'Complex Strategy Formation',
        description: 'Test development of multi-layered strategies',
        type: 'intelligence',
        difficulty: 'hard',
        expectedOutcomes: ['Develops comprehensive strategy', 'Considers multiple variables']
      },
      {
        name: 'Crisis Management',
        description: 'Test response to critical system failures',
        type: 'adaptability',
        difficulty: 'hard',
        expectedOutcomes: ['Quick crisis response', 'Damage mitigation', 'Recovery planning']
      },
      {
        name: 'Multi-Agent Coordination',
        description: 'Test collaboration with other agents',
        type: 'collaboration',
        difficulty: 'medium',
        expectedOutcomes: ['Effective communication', 'Shared goal achievement']
      },
      {
        name: 'Creative Problem Solving',
        description: 'Test generation of novel solutions',
        type: 'creativity',
        difficulty: 'medium',
        expectedOutcomes: ['Innovative approaches', 'Out-of-box thinking']
      }
    ]);

    // Stress test scenarios
    this.predefinedScenarios.set('stress', [
      {
        name: 'Resource Starvation',
        description: 'Test performance under resource constraints',
        type: 'reliability',
        difficulty: 'hard',
        expectedOutcomes: ['Maintains core functions', 'Graceful degradation']
      },
      {
        name: 'Information Overload',
        description: 'Test handling of excessive data streams',
        type: 'performance',
        difficulty: 'hard',
        expectedOutcomes: ['Filters relevant information', 'Maintains response time']
      },
      {
        name: 'Conflicting Objectives',
        description: 'Test resolution of contradictory goals',
        type: 'autonomy',
        difficulty: 'hard',
        expectedOutcomes: ['Prioritizes objectives', 'Finds balance', 'Makes trade-offs']
      }
    ]);

    // Performance scenarios
    this.predefinedScenarios.set('performance', [
      {
        name: 'High-Speed Decision Making',
        description: 'Test rapid decision capabilities',
        type: 'performance',
        difficulty: 'medium',
        expectedOutcomes: ['Fast response times', 'Maintains accuracy']
      },
      {
        name: 'Concurrent Task Management',
        description: 'Test multitasking capabilities',
        type: 'performance',
        difficulty: 'medium',
        expectedOutcomes: ['Handles multiple tasks', 'Effective prioritization']
      },
      {
        name: 'Memory Efficiency',
        description: 'Test information retention and retrieval',
        type: 'performance',
        difficulty: 'easy',
        expectedOutcomes: ['Efficient memory usage', 'Quick information access']
      }
    ]);

    // Monitoring scenarios
    this.predefinedScenarios.set('monitoring', [
      {
        name: 'Consistency Check',
        description: 'Verify consistent behavior over time',
        type: 'reliability',
        difficulty: 'easy',
        expectedOutcomes: ['Consistent outputs', 'Stable behavior patterns']
      },
      {
        name: 'Performance Drift Detection',
        description: 'Monitor for performance degradation',
        type: 'performance',
        difficulty: 'easy',
        expectedOutcomes: ['Stable performance metrics', 'No significant drift']
      }
    ]);
  }

  private getQuickTestScenarios(agentType?: string): TestScenario[] {
    const baseScenarios = this.predefinedScenarios.get('quick') || [];
    
    // Add agent-specific scenarios
    if (agentType === 'market-hunter') {
      baseScenarios.push({
        name: 'Alpha Detection',
        description: 'Test ability to identify market opportunities',
        type: 'intelligence',
        difficulty: 'medium',
        expectedOutcomes: ['Identifies potential alpha', 'Provides confidence scores']
      });
    } else if (agentType === 'strategic-orchestrator') {
      baseScenarios.push({
        name: 'Agent Coordination',
        description: 'Test meta-agent coordination capabilities',
        type: 'collaboration',
        difficulty: 'medium',
        expectedOutcomes: ['Coordinates sub-agents', 'Resolves conflicts']
      });
    }
    
    return baseScenarios;
  }

  private getFullTestScenarios(agentType?: string): TestScenario[] {
    return [
      ...this.getQuickTestScenarios(agentType),
      ...(this.predefinedScenarios.get('full') || [])
    ];
  }

  private getStressTestScenarios(): TestScenario[] {
    return this.predefinedScenarios.get('stress') || [];
  }

  private getPerformanceScenarios(): TestScenario[] {
    return this.predefinedScenarios.get('performance') || [];
  }

  private getMonitoringScenarios(): TestScenario[] {
    return this.predefinedScenarios.get('monitoring') || [];
  }

  private getCapabilityScenarios(capability: string): TestScenario[] {
    // Return scenarios specific to the requested capability
    const allScenarios = [
      ...(this.predefinedScenarios.get('quick') || []),
      ...(this.predefinedScenarios.get('full') || []),
      ...(this.predefinedScenarios.get('stress') || [])
    ];
    
    return allScenarios.filter(scenario => 
      scenario.type === capability || 
      scenario.name.toLowerCase().includes(capability.toLowerCase())
    );
  }

  private printComparison(results: { name: string, result: any }[]): void {
    console.log('\n📊 AGENT COMPARISON RESULTS');
    console.log('='.repeat(60));
    
    // Sort by overall score
    results.sort((a, b) => b.result.overallScore - a.result.overallScore);
    
    console.log('\n🏆 RANKING:');
    results.forEach((result, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
      console.log(`${medal} ${index + 1}. ${result.name}: ${(result.result.overallScore * 100).toFixed(1)}%`);
    });
    
    console.log('\n📈 DETAILED METRICS:');
    const metrics = ['autonomy', 'intelligence', 'adaptability', 'performance', 'reliability', 'creativity', 'collaboration'];
    
    metrics.forEach(metric => {
      console.log(`\n${metric.charAt(0).toUpperCase() + metric.slice(1)}:`);
      results.forEach(result => {
        const score = result.result.metrics[metric]?.score || 0;
        console.log(`  ${result.name}: ${(score * 100).toFixed(1)}%`);
      });
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public helper methods
  public getAvailableCapabilities(): string[] {
    return ['autonomy', 'intelligence', 'adaptability', 'performance', 'reliability', 'creativity', 'collaboration'];
  }

  public getEvaluationHistory() {
    return this.evaluator.getEvaluationHistory();
  }

  public createCustomScenario(
    name: string,
    description: string,
    type: 'autonomy' | 'intelligence' | 'adaptability' | 'performance' | 'reliability' | 'creativity' | 'collaboration',
    difficulty: 'easy' | 'medium' | 'hard',
    expectedOutcomes: string[]
  ): TestScenario {
    return { name, description, type, difficulty, expectedOutcomes };
  }
}

/**
 * Simple test runner functions for even easier usage
 */

// Quick test any agent
export async function testAgent(agent: any, agentType?: string): Promise<void> {
  const tester = new EasyAgentTester();
  await tester.quickTest(agent, agentType);
}

// Compare two agents quickly
export async function compareAgents(agent1: any, agent2: any, names?: [string, string]): Promise<void> {
  const tester = new EasyAgentTester();
  await tester.compareAgents([
    { agent: agent1, name: names?.[0] || 'Agent 1' },
    { agent: agent2, name: names?.[1] || 'Agent 2' }
  ]);
}

// Test specific capability
export async function testCapability(agent: any, capability: string): Promise<void> {
  const tester = new EasyAgentTester();
  await tester.testCapability(agent, capability);
}

// Stress test
export async function stressTest(agent: any): Promise<void> {
  const tester = new EasyAgentTester();
  await tester.stressTest(agent);
}

// Performance benchmark
export async function benchmarkPerformance(agent: any): Promise<void> {
  const tester = new EasyAgentTester();
  await tester.performanceBenchmark(agent);
}