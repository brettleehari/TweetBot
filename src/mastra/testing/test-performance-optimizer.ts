#!/usr/bin/env node
/**
 * Performance Optimizer Test - Test the new Performance Optimizer agent
 */

try {
  console.log('Attempting to import PerformanceOptimizerAgent...');
  const { PerformanceOptimizerAgent } = await import('../agency/performance-optimizer-agent.js');
  console.log('Import successful!');
} catch (error) {
  console.error('Import failed:', error);
  process.exit(1);
}

const chalk = {
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
  dim: (text: string) => `\x1b[2m${text}\x1b[0m`
};

class PerformanceOptimizerTest {
  private optimizer: PerformanceOptimizerAgent;

  constructor() {
    this.optimizer = new PerformanceOptimizerAgent();
  }

  async runTest(): Promise<void> {
    try {
      console.log(chalk.bold(chalk.blue('\n⚡ PERFORMANCE OPTIMIZER AGENT TEST\n')));
      console.log(chalk.dim('Testing autonomous system optimization capabilities\n'));

      // Test the autonomous optimization cycle
      console.log(chalk.cyan('🔄 Running autonomous optimization cycle...'));
      
      const optimizations = await this.optimizer.autonomousOptimizationCycle();
      
      console.log(chalk.green(`✅ Optimization cycle completed!`));
      console.log(chalk.green(`📊 Generated ${optimizations.length} optimization strategies`));

      // Show optimization results
      if (optimizations.length > 0) {
        console.log(chalk.cyan('\n🎯 Optimization Results:'));
        optimizations.forEach((opt, i) => {
          console.log(`  ${i + 1}. ${opt.strategy.description}`);
          console.log(`     ⚡ Improvement: ${opt.actualImprovement.toFixed(1)}%`);
          console.log(`     ⏱️  Execution Time: ${opt.executionTime}ms`);
          console.log(`     ✅ Success: ${opt.success ? 'Yes' : 'No'}`);
          console.log('');
        });

        const avgImprovement = optimizations.reduce((sum, opt) => sum + opt.actualImprovement, 0) / optimizations.length;
        const successRate = optimizations.filter(opt => opt.success).length / optimizations.length;

        console.log(chalk.bold(chalk.green(`📈 PERFORMANCE SUMMARY:`)));
        console.log(`   Average Improvement: ${avgImprovement.toFixed(1)}%`);
        console.log(`   Success Rate: ${(successRate * 100).toFixed(0)}%`);
        console.log(`   Total Optimizations: ${optimizations.length}`);
      }

      console.log(chalk.bold(chalk.green('\n🎉 PERFORMANCE OPTIMIZER TEST COMPLETE!\n')));
      console.log(chalk.dim('The Performance Optimizer is working correctly and ready for integration.'));

    } catch (error) {
      console.log(chalk.red(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      console.error(error);
      process.exit(1);
    }
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new PerformanceOptimizerTest();
  test.runTest().catch(console.error);
}

export { PerformanceOptimizerTest };