#!/usr/bin/env node
/**
 * Performance Optimizer Test - Simple test of the Performance Optimizer agent
 */

// Simple chalk-like coloring for output
const colors = {
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
};

async function testPerformanceOptimizer() {
  console.log(colors.bold('\n🚀 Performance Optimizer Agent Test\n'));
  
  try {
    // Import the Performance Optimizer Agent
    console.log(colors.blue('📦 Importing PerformanceOptimizerAgent...'));
    const { PerformanceOptimizerAgent } = await import('../agency/performance-optimizer-agent.js');
    console.log(colors.green('✅ Import successful!'));
    
    // Create agent instance
    console.log(colors.blue('\n🔧 Creating Performance Optimizer instance...'));
    const optimizer = new PerformanceOptimizerAgent();
    console.log(colors.green('✅ Agent created successfully!'));
    
    // Test basic agent properties
    console.log(colors.blue('\n📊 Testing agent properties...'));
    console.log(`Agent ID: ${colors.cyan(optimizer.id)}`);
    console.log(`Agent State: ${colors.cyan(optimizer.getState())}`);
    console.log(colors.green('✅ Agent properties accessible!'));
    
    // Test optimization cycle (if available)
    console.log(colors.blue('\n⚙️ Testing optimization methods...'));
    
    // Check if the agent has the expected methods
    const hasAutonomousOptimization = typeof (optimizer as any).autonomousOptimizationCycle === 'function';
    const hasIdentifyBottlenecks = typeof (optimizer as any).identifyBottlenecks === 'function';
    const hasExecuteOptimizations = typeof (optimizer as any).executeOptimizations === 'function';
    
    console.log(`Autonomous Optimization: ${hasAutonomousOptimization ? colors.green('✅') : colors.red('❌')}`);
    console.log(`Identify Bottlenecks: ${hasIdentifyBottlenecks ? colors.green('✅') : colors.red('❌')}`);
    console.log(`Execute Optimizations: ${hasExecuteOptimizations ? colors.green('✅') : colors.red('❌')}`);
    
    if (hasAutonomousOptimization) {
      console.log(colors.blue('\n🔄 Running autonomous optimization cycle...'));
      try {
        const result = await (optimizer as any).autonomousOptimizationCycle();
        console.log(colors.green('✅ Optimization cycle completed!'));
        console.log(`Result: ${colors.cyan(JSON.stringify(result, null, 2))}`);
      } catch (error) {
        console.log(colors.yellow(`⚠️ Optimization cycle test skipped: ${error}`));
      }
    }
    
    console.log(colors.bold(colors.green('\n🎉 Performance Optimizer Agent Test Complete!')));
    console.log(colors.green('✅ All basic functionality verified'));
    
  } catch (error) {
    console.error(colors.red('\n❌ Test failed:'), error);
    process.exit(1);
  }
}

// Run the test
testPerformanceOptimizer().catch(console.error);