#!/usr/bin/env node
/**
 * Simple Live Agent Streaming Demo
 * Demonstrates real-time agent action streaming to web interface
 */

import { EventEmitter } from 'events';

// Simple streaming server without complex dependencies
class SimpleAgentStreamer extends EventEmitter {
  private agents: Map<string, any> = new Map();
  private actionCounter = 0;

  registerAgent(agentId: string, agentName: string): void {
    this.agents.set(agentId, { 
      id: agentId, 
      name: agentName, 
      actions: [],
      isActive: false 
    });
    console.log(`📝 Registered agent: ${agentName} (${agentId})`);
  }

  async streamAction(
    agentId: string,
    agentName: string,
    actionType: string,
    description: string,
    data?: any
  ): Promise<void> {
    const action = {
      id: `action_${++this.actionCounter}`,
      agentId,
      agentName,
      timestamp: new Date().toISOString(),
      actionType,
      description,
      data,
      confidence: Math.floor(Math.random() * 30 + 70)
    };

    const agent = this.agents.get(agentId);
    if (agent) {
      agent.actions.push(action);
      agent.isActive = true;
      
      // Keep only last 10 actions
      if (agent.actions.length > 10) {
        agent.actions.shift();
      }
    }

    // Emit for listeners
    this.emit('agentAction', action);

    // Log to console with nice formatting
    console.log(`🤖 [${agentName}] ${this.getActionEmoji(actionType)} ${actionType}: ${description}`);
    if (action.confidence) {
      console.log(`   🎯 Confidence: ${action.confidence}%`);
    }
    if (data && typeof data === 'object') {
      console.log(`   📊 Data:`, JSON.stringify(data, null, 2));
    }
  }

  private getActionEmoji(actionType: string): string {
    const emojis: { [key: string]: string } = {
      'THINKING': '🤔',
      'ANALYZING': '🔍', 
      'DECIDING': '🎯',
      'EXECUTING': '⚡',
      'LEARNING': '🧠'
    };
    return emojis[actionType] || '🤖';
  }

  getAgentStatus(): any {
    return {
      totalAgents: this.agents.size,
      activeAgents: Array.from(this.agents.values()).filter(a => a.isActive).length,
      totalActions: this.actionCounter,
      agents: Array.from(this.agents.values())
    };
  }
}

// Simple agent class for demonstration
class DemoAgent {
  private agentId: string;
  private agentName: string;
  private streamer: SimpleAgentStreamer;

  constructor(agentId: string, agentName: string, streamer: SimpleAgentStreamer) {
    this.agentId = agentId;
    this.agentName = agentName;
    this.streamer = streamer;
    
    // Register with streamer
    this.streamer.registerAgent(this.agentId, this.agentName);
  }

  async performAnalysis(): Promise<void> {
    // Stream thinking
    await this.streamer.streamAction(
      this.agentId,
      this.agentName,
      'THINKING',
      'Starting market analysis and opportunity detection'
    );

    await this.delay(1000);

    // Stream analyzing
    const marketData = {
      btcPrice: 42000 + Math.random() * 2000,
      sentiment: Math.random(),
      volume: Math.random() * 1000000000
    };

    await this.streamer.streamAction(
      this.agentId,
      this.agentName,
      'ANALYZING',
      'Processing market indicators and sentiment data',
      marketData
    );

    await this.delay(1500);

    // Stream decision
    const decision = {
      action: Math.random() > 0.5 ? 'BUY' : 'SELL',
      symbol: ['BTC', 'ETH', 'SOL'][Math.floor(Math.random() * 3)],
      amount: Math.random() * 2,
      confidence: Math.floor(Math.random() * 30 + 70)
    };

    await this.streamer.streamAction(
      this.agentId,
      this.agentName,
      'DECIDING',
      `Decision: ${decision.action} ${decision.amount.toFixed(4)} ${decision.symbol}`,
      decision
    );

    await this.delay(800);

    // Stream execution
    await this.streamer.streamAction(
      this.agentId,
      this.agentName,
      'EXECUTING',
      `Executing ${decision.action} order for ${decision.symbol}`,
      { status: 'completed', executionTime: Date.now() }
    );

    await this.delay(500);

    // Stream learning
    await this.streamer.streamAction(
      this.agentId,
      this.agentName,
      'LEARNING',
      'Analyzing execution results and updating strategy parameters',
      { performance: 'positive', adjustments: 'minor' }
    );
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Demo function
async function runStreamingDemo(): Promise<void> {
  console.log('🚀 STARTING SIMPLE LIVE AGENT STREAMING DEMO\n');

  const streamer = new SimpleAgentStreamer();

  // Create demo agents
  const agents = [
    new DemoAgent('strategic-orchestrator', '🎯 Strategic Orchestrator', streamer),
    new DemoAgent('market-hunter', '🔍 Market Hunter', streamer),
    new DemoAgent('performance-optimizer', '⚡ Performance Optimizer', streamer),
    new DemoAgent('narrative-architect', '📝 Narrative Architect', streamer)
  ];

  console.log(`✅ Created ${agents.length} demo agents\n`);

  // Run concurrent analysis cycles
  for (let cycle = 1; cycle <= 3; cycle++) {
    console.log(`🔄 CYCLE ${cycle}/3 - Running concurrent agent analysis...\n`);
    
    // Run all agents concurrently
    const promises = agents.map(agent => agent.performAnalysis());
    await Promise.all(promises);

    // Show status
    const status = streamer.getAgentStatus();
    console.log('\n📊 CURRENT STATUS:');
    console.log(`   Total Agents: ${status.totalAgents}`);
    console.log(`   Active Agents: ${status.activeAgents}`);
    console.log(`   Total Actions: ${status.totalActions}\n`);

    if (cycle < 3) {
      console.log('⏸️ Waiting 5 seconds before next cycle...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log('🎉 STREAMING DEMO COMPLETED!\n');
  console.log('💡 KEY INSIGHTS:');
  console.log('   • Each agent performed THINKING → ANALYZING → DECIDING → EXECUTING → LEARNING');
  console.log('   • Actions were streamed in real-time with confidence levels and data');
  console.log('   • Multiple agents operated concurrently showing autonomous behavior');
  console.log('   • All agent actions were logged with timestamps and reasoning\n');

  console.log('📡 TO ENABLE LIVE WEB STREAMING:');
  console.log('   1. Add WebSocket server to SimpleAgentStreamer');
  console.log('   2. Open docs/live-agent-stream.html in browser');
  console.log('   3. Connect to ws://localhost:3001 for real-time updates');
  console.log('   4. Watch agents make decisions live on the web interface!');
}

// Run if executed directly
const isMainModule = import.meta?.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runStreamingDemo().catch(console.error);
}

export { SimpleAgentStreamer, DemoAgent, runStreamingDemo };