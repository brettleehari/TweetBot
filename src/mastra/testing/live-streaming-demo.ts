#!/usr/bin/env node
/**
 * Demo: Live Agent Streaming Integration
 * Shows how to integrate live streaming with existing Mastra agents
 */

import { liveAgentStreamer, StreamingAgentWrapper } from '../services/live-agent-streamer.js';
import { weatherAgent } from '../agents/weather-agent.js';

// Simulate an enhanced agent with streaming capabilities
class StreamingTradingAgent {
  private agentId: string;
  private agentName: string;

  constructor(agentId: string, agentName: string) {
    this.agentId = agentId;
    this.agentName = agentName;
    
    // Register with live streamer
    liveAgentStreamer.registerAgent(this.agentId, this.agentName);
  }

  async analyzeMarket(): Promise<any> {
    // Stream thinking process
    await liveAgentStreamer.streamAgentThinking(
      this.agentId,
      this.agentName,
      'Starting comprehensive market analysis...',
      'market_analysis_init'
    );

    // Simulate data gathering
    await this.simulateDelay(1000);
    
    // Stream analysis
    const marketData = {
      btcPrice: 42150,
      volatility: 0.65,
      sentiment: 0.7,
      volume: 1250000000
    };

    await liveAgentStreamer.streamAgentAnalysis(
      this.agentId,
      this.agentName,
      marketData,
      'Analyzing BTC price action, market sentiment, and trading volume indicators'
    );

    // Simulate processing time
    await this.simulateDelay(1500);

    // Stream decision making
    const decision = {
      action: 'BUY',
      symbol: 'BTC',
      confidence: 87,
      reasoning: 'Strong technical breakout with high volume confirmation'
    };

    await liveAgentStreamer.streamAgentDecision(
      this.agentId,
      this.agentName,
      decision,
      decision.reasoning,
      decision.confidence
    );

    // Simulate execution
    await this.simulateDelay(800);

    await liveAgentStreamer.streamAgentExecution(
      this.agentId,
      this.agentName,
      {
        description: 'Executing BTC buy order',
        amount: 0.5,
        price: 42150,
        status: 'completed'
      }
    );

    // Stream learning
    await liveAgentStreamer.streamAgentLearning(
      this.agentId,
      this.agentName,
      {
        executionSuccess: true,
        marketResponse: 'positive',
        adjustments: 'none required'
      },
      'Trade executed successfully, market responded positively to our analysis'
    );

    return decision;
  }

  async autonomousDecisionCycle(): Promise<any[]> {
    const decisions = [];

    // Stream autonomous cycle start
    await liveAgentStreamer.streamAgentThinking(
      this.agentId,
      this.agentName,
      'Beginning autonomous decision cycle - evaluating opportunities',
      'autonomous_cycle'
    );

    // Make multiple decisions
    for (let i = 1; i <= 3; i++) {
      await this.simulateDelay(2000);
      
      const decision = await this.analyzeMarket();
      decisions.push(decision);
      
      // Brief pause between decisions
      if (i < 3) {
        await liveAgentStreamer.streamAgentThinking(
          this.agentId,
          this.agentName,
          `Preparing next analysis (${i + 1}/3)...`,
          'preparation'
        );
      }
    }

    return decisions;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Demo function to show live streaming in action
async function runLiveStreamingDemo(): Promise<void> {
  console.log('🚀 STARTING LIVE AGENT STREAMING DEMO\n');
  console.log('📡 WebSocket server running on ws://localhost:3001');
  console.log('🌐 Open http://localhost:3000/live-agent-stream.html to view live stream\n');

  // Create streaming agents
  const strategicAgent = new StreamingTradingAgent('strategic-orchestrator', '🎯 Strategic Orchestrator');
  const marketHunter = new StreamingTradingAgent('market-hunter', '🔍 Market Hunter');
  const performanceOptimizer = new StreamingTradingAgent('performance-optimizer', '⚡ Performance Optimizer');

  // Create wrapper for existing weather agent (demo)
  const weatherWrapper = new StreamingAgentWrapper(
    weatherAgent, 
    liveAgentStreamer, 
    '🌤️ Weather Agent'
  );

  console.log('✅ Created 4 streaming agents');
  console.log('⏰ Starting autonomous cycles every 30 seconds...\n');

  // Run concurrent autonomous cycles
  const runConcurrentDemo = async () => {
    const promises = [
      strategicAgent.autonomousDecisionCycle(),
      marketHunter.autonomousDecisionCycle(),
      performanceOptimizer.autonomousDecisionCycle()
    ];

    await Promise.all(promises);
  };

  // Run demo cycles
  for (let cycle = 1; cycle <= 5; cycle++) {
    console.log(`🔄 CYCLE ${cycle}/5 - Running concurrent agent decisions...`);
    
    await runConcurrentDemo();
    
    if (cycle < 5) {
      console.log(`⏸️ Waiting 30 seconds before next cycle...\n`);
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }

  console.log('\n🎉 Live streaming demo completed!');
  console.log('📊 Check the web interface for full action history');
  console.log('🛑 Keep server running to continue streaming...');

  // Keep process alive for continuous streaming
  setInterval(() => {
    console.log(`⏰ [${new Date().toLocaleTimeString()}] Streaming server active - agents ready for actions`);
  }, 60000); // Status every minute
}

// Run the demo if this file is executed directly
const isMainModule = import.meta?.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runLiveStreamingDemo().catch(console.error);
}

export { StreamingTradingAgent, runLiveStreamingDemo };