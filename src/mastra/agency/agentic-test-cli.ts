#!/usr/bin/env node

import { AgenticTestBench, TestType } from './agentic-test-bench';
import readline from 'readline';

/**
 * CLI Interface for Agentic Test Bench
 * 
 * Provides an interactive command-line interface for testing and monitoring
 * the agentic crypto intelligence system.
 */
class AgenticTestCLI {
  private testBench: AgenticTestBench;
  private rl: readline.Interface;
  private isRunning: boolean = false;

  constructor() {
    this.testBench = new AgenticTestBench();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Agentic Test Bench CLI...');
      await this.testBench.initialize();
      console.log('✅ Test Bench ready!\n');
      this.showMenu();
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    }
  }

  private showMenu(): void {
    console.log('\n📋 AGENTIC TEST BENCH - MAIN MENU');
    console.log('=====================================');
    console.log('1. Run Autonomous Decision Test');
    console.log('2. Run Strategic Oversight Test');
    console.log('3. Run Alpha Discovery Test');
    console.log('4. Run Inter-Agent Communication Test');
    console.log('5. Run Learning Adaptation Test');
    console.log('6. Run Full System Test');
    console.log('7. View Recent Suggestions');
    console.log('8. Collect Feedback on Suggestion');
    console.log('9. Generate Visualization Data');
    console.log('10. Generate Strategic Feedback Report');
    console.log('11. View System Status');
    console.log('0. Exit');
    console.log('=====================================');

    this.rl.question('\nSelect an option (0-11): ', (answer) => {
      this.handleMenuChoice(answer.trim());
    });
  }

  private async handleMenuChoice(choice: string): Promise<void> {
    try {
      switch (choice) {
        case '1':
          await this.runTest('autonomous-decision');
          break;
        case '2':
          await this.runTest('strategic-oversight');
          break;
        case '3':
          await this.runTest('alpha-discovery');
          break;
        case '4':
          await this.runTest('inter-agent-communication');
          break;
        case '5':
          await this.runTest('learning-adaptation');
          break;
        case '6':
          await this.runTest('full-system');
          break;
        case '7':
          await this.viewRecentSuggestions();
          break;
        case '8':
          await this.collectFeedback();
          break;
        case '9':
          await this.generateVisualizationData();
          break;
        case '10':
          await this.generateStrategicFeedback();
          break;
        case '11':
          await this.viewSystemStatus();
          break;
        case '0':
          await this.exit();
          return;
        default:
          console.log('❌ Invalid option. Please select 0-11.');
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }

    this.showMenu();
  }

  private async runTest(testType: TestType): Promise<void> {
    console.log(`\n🧪 Starting ${testType} test...`);
    
    // Get duration from user
    const duration = await this.askQuestion('Enter test duration in seconds (default 60): ');
    const durationMs = (parseInt(duration) || 60) * 1000;

    console.log(`⏱️  Running test for ${durationMs/1000} seconds...\n`);

    try {
      const result = await this.testBench.runIncrementalTest(testType, durationMs);
      
      console.log('\n✅ Test completed successfully!');
      console.log('📊 Results:');
      console.log(`   • Test ID: ${result.id}`);
      console.log(`   • Duration: ${result.duration}ms`);
      console.log(`   • Status: ${result.status}`);
      console.log(`   • Suggestions generated: ${result.suggestions.length}`);
      
      if (result.metrics) {
        console.log('   • Key metrics:');
        Object.entries(result.metrics).forEach(([key, value]) => {
          console.log(`     - ${key}: ${typeof value === 'number' ? value.toFixed(3) : value}`);
        });
      }

      if (result.suggestions.length > 0) {
        console.log('\n💡 Recent suggestions (showing first 3):');
        result.suggestions.slice(0, 3).forEach((suggestion, index) => {
          console.log(`   ${index + 1}. [${suggestion.agentId}] ${suggestion.type}`);
          console.log(`      Confidence: ${suggestion.confidence.toFixed(2)}, Urgency: ${suggestion.urgency}`);
          console.log(`      Rationale: ${suggestion.rationale.substring(0, 80)}...`);
        });
      }

    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
    }
  }

  private async viewRecentSuggestions(): Promise<void> {
    console.log('\n📝 Retrieving recent suggestions...');
    
    try {
      const visualizationData = await this.testBench.generateVisualizationData();
      const suggestions = visualizationData.suggestions.slice(0, 10);

      if (suggestions.length === 0) {
        console.log('No suggestions found. Run some tests first!');
        return;
      }

      console.log(`\n📋 Recent Suggestions (${suggestions.length}):`);
      console.log('=====================================');

      suggestions.forEach((suggestion, index) => {
        console.log(`\n${index + 1}. ID: ${suggestion.id} | Agent: ${suggestion.agent_id}`);
        console.log(`   Type: ${suggestion.suggestion_type}`);
        console.log(`   Confidence: ${suggestion.confidence.toFixed(2)}`);
        console.log(`   Urgency: ${suggestion.urgency}`);
        console.log(`   Time: ${new Date(suggestion.timestamp).toLocaleString()}`);
        console.log(`   Rationale: ${suggestion.rationale}`);
        
        if (suggestion.feedback_score) {
          console.log(`   ⭐ Feedback Score: ${suggestion.feedback_score}/10`);
        } else {
          console.log(`   ⏳ No feedback yet`);
        }
      });

    } catch (error) {
      console.error(`❌ Error retrieving suggestions: ${error.message}`);
    }
  }

  private async collectFeedback(): Promise<void> {
    console.log('\n💭 Collect Feedback on Suggestion');
    console.log('==================================');

    try {
      const suggestionId = await this.askQuestion('Enter suggestion ID: ');
      const id = parseInt(suggestionId);
      
      if (isNaN(id)) {
        console.log('❌ Invalid suggestion ID. Please enter a number.');
        return;
      }

      const feedback = await this.askQuestion('Enter your feedback: ');
      const scoreStr = await this.askQuestion('Rate the suggestion (1-10): ');
      const score = parseInt(scoreStr);

      if (isNaN(score) || score < 1 || score > 10) {
        console.log('❌ Invalid score. Please enter a number between 1 and 10.');
        return;
      }

      await this.testBench.collectHumanFeedback(id, feedback, score);
      console.log(`✅ Feedback collected for suggestion ${id}!`);

    } catch (error) {
      console.error(`❌ Error collecting feedback: ${error.message}`);
    }
  }

  private async generateVisualizationData(): Promise<void> {
    console.log('\n📊 Generating Visualization Data...');
    
    try {
      const data = await this.testBench.generateVisualizationData();
      
      console.log('\n📈 VISUALIZATION DATA SUMMARY');
      console.log('==============================');
      console.log(`Session ID: ${data.sessionId}`);
      console.log(`Generated: ${data.timestamp.toLocaleString()}`);
      console.log(`Total Suggestions: ${data.suggestions.length}`);
      console.log(`System Metrics Records: ${data.systemMetrics.length}`);
      console.log(`Test Results: ${data.testResults.length}`);

      if (data.feedbackSummary) {
        console.log('\n📋 Feedback Summary:');
        console.log(`   • Total Feedback: ${data.feedbackSummary.total_feedback || 0}`);
        console.log(`   • Average Score: ${(data.feedbackSummary.avg_score || 0).toFixed(2)}/10`);
        console.log(`   • High Scores (≥8): ${data.feedbackSummary.high_score_count || 0}`);
        console.log(`   • Low Scores (≤5): ${data.feedbackSummary.low_score_count || 0}`);
      }

      if (data.alphaStats) {
        console.log('\n🎯 Alpha Discovery Stats:');
        console.log(`   • Total Discoveries: ${data.alphaStats.total_discoveries || 0}`);
        console.log(`   • Average Alpha Value: ${(data.alphaStats.avg_alpha_value || 0).toFixed(3)}`);
        console.log(`   • Average Confidence: ${(data.alphaStats.avg_confidence || 0).toFixed(3)}`);
        console.log(`   • Validated: ${data.alphaStats.validated_count || 0}`);
      }

      if (data.topPerformingAgents.length > 0) {
        console.log('\n🏆 Top Performing Agents:');
        data.topPerformingAgents.forEach((agent, index) => {
          console.log(`   ${index + 1}. ${agent.agent_id} - Score: ${agent.avg_feedback_score.toFixed(2)}`);
        });
      }

      console.log('\n💾 Full data saved to database for visualization tools.');

    } catch (error) {
      console.error(`❌ Error generating visualization data: ${error.message}`);
    }
  }

  private async generateStrategicFeedback(): Promise<void> {
    console.log('\n🎯 Generating Strategic Feedback Report...');
    
    try {
      const feedback = await this.testBench.generateStrategicFeedback();
      
      console.log('\n📊 STRATEGIC FEEDBACK REPORT');
      console.log('=============================');
      console.log(`Generated: ${feedback.timestamp.toLocaleString()}`);
      console.log(`Overall Performance: ${(feedback.overallPerformance * 100).toFixed(1)}%`);

      if (feedback.agentRecommendations.length > 0) {
        console.log('\n🤖 Agent Recommendations:');
        feedback.agentRecommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.agentId}`);
          console.log(`      ${rec.recommendation}`);
          console.log(`      Expected Impact: ${rec.expectedImpact}`);
        });
      }

      if (feedback.systemRecommendations.length > 0) {
        console.log('\n⚙️ System Recommendations:');
        feedback.systemRecommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.type}`);
          console.log(`      ${rec.recommendation}`);
          console.log(`      Expected Impact: ${rec.expectedImpact}`);
        });
      }

      if (feedback.emergentInsights.length > 0) {
        console.log('\n🧠 Emergent Insights:');
        feedback.emergentInsights.forEach((insight, index) => {
          console.log(`   ${index + 1}. [${insight.significance.toUpperCase()}] ${insight.type}`);
          console.log(`      ${insight.description}`);
          console.log(`      Actionable: ${insight.actionable ? 'Yes' : 'No'}`);
        });
      }

      if (feedback.actionPriorities.length > 0) {
        console.log('\n📋 Action Priorities:');
        feedback.actionPriorities.forEach((action, index) => {
          console.log(`   ${action.priority}. [${action.urgency.toUpperCase()}] ${action.action}`);
          console.log(`      Expected Impact: ${action.expectedImpact}`);
          console.log(`      Timeframe: ${action.timeframe}`);
        });
      }

      console.log('\n💾 Strategic feedback logged to database.');

    } catch (error) {
      console.error(`❌ Error generating strategic feedback: ${error.message}`);
    }
  }

  private async viewSystemStatus(): Promise<void> {
    console.log('\n⚡ SYSTEM STATUS');
    console.log('================');
    
    try {
      const data = await this.testBench.generateVisualizationData();
      
      console.log(`Status: ${this.isRunning ? '🟢 Running' : '🔴 Idle'}`);
      console.log(`Session: ${data.sessionId}`);
      console.log(`Last Update: ${data.timestamp.toLocaleString()}`);
      
      // Calculate some basic stats
      const recentSuggestions = data.suggestions.filter(s => 
        new Date(s.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      
      console.log(`\n📊 24-Hour Activity:`);
      console.log(`   • Suggestions: ${recentSuggestions.length}`);
      console.log(`   • Tests Run: ${data.testResults.length}`);
      
      if (data.feedbackSummary?.avg_score) {
        console.log(`   • Avg Feedback Score: ${data.feedbackSummary.avg_score.toFixed(2)}/10`);
      }

      // Memory usage
      const memUsage = process.memoryUsage();
      console.log(`\n💾 Memory Usage:`);
      console.log(`   • RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   • Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   • Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);

    } catch (error) {
      console.error(`❌ Error retrieving system status: ${error.message}`);
    }
  }

  private async askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  private async exit(): Promise<void> {
    console.log('\n🔒 Shutting down Test Bench...');
    
    try {
      await this.testBench.shutdown();
      this.rl.close();
      console.log('✅ Shutdown complete. Goodbye!\n');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new AgenticTestCLI();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n⚡ Received interrupt signal...');
    await cli['exit']();
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n⚡ Received termination signal...');
    await cli['exit']();
  });

  // Start CLI
  cli.initialize().catch((error) => {
    console.error('❌ CLI startup failed:', error);
    process.exit(1);
  });
}

export { AgenticTestCLI };