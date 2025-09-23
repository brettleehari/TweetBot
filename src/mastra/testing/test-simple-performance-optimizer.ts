#!/usr/bin/env node
/**
 * Simple Performance Optimizer Test
 */

import { PerformanceOptimizerAgent } from '../agency/performance-optimizer-agent-simple.js';

const colors = {
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
};

async function testSimplePerformanceOptimizer() {
  console.log(colors.bold('\n🚀 Simple Performance Optimizer Test\n'));
  
  try {
    // Create agent instance
    console.log(colors.blue('🔧 Creating Performance Optimizer instance...'));
    const optimizer = new PerformanceOptimizerAgent();
    console.log(colors.green('✅ Agent created successfully!'));
    
    // Test optimization cycle
    console.log(colors.blue('\n⚙️ Testing autonomous optimization cycle...'));
    const result = await optimizer.autonomousOptimizationCycle();
    console.log(colors.green('✅ Optimization cycle completed!'));
    console.log(`${colors.cyan('Result:')} ${JSON.stringify(result, null, 2)}`);
    
    console.log(colors.bold(colors.green('\n🎉 Simple Performance Optimizer Test Complete!')));
    
  } catch (error) {
    console.error(colors.red('\n❌ Test failed:'), error);
    process.exit(1);
  }
}

testSimplePerformanceOptimizer().catch(console.error);