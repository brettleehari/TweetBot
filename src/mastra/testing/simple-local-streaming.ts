#!/usr/bin/env node
/**
 * Simple Local Live Streaming
 * Basic demo without complex imports
 */

// Simple streaming demo that works without complex dependencies
class SimpleLocalStreamer {
  private actionCounter = 0;
  private agents = new Map();

  constructor() {
    console.log('🚀 SIMPLE LOCAL LIVE STREAMING DEMO');
    console.log('📡 This shows what the web interface would display');
    console.log('🌐 For full web experience, use the GitHub Pages version');
    console.log('');
  }

  registerAgent(agentId: string, agentName: string): void {
    this.agents.set(agentId, { 
      id: agentId, 
      name: agentName, 
      actions: [],
      isActive: false 
    });
    console.log(`📝 Registered agent: ${agentName}`);
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
      timestamp: new Date().toLocaleTimeString(),
      actionType,
      description,
      data,
      confidence: Math.floor(Math.random() * 30 + 70)
    };

    // Log in web-like format
    const emoji = this.getActionEmoji(actionType);
    console.log(`\n🤖 [${agentName}] ${emoji} ${actionType}`);
    console.log(`   📝 ${description}`);
    console.log(`   🎯 Confidence: ${action.confidence}%`);
    console.log(`   ⏰ Time: ${action.timestamp}`);
    
    if (data && typeof data === 'object') {
      console.log(`   📊 Data: ${JSON.stringify(data, null, 2)}`);
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

  getStats(): void {
    console.log(`\n📊 STREAMING STATS:`);
    console.log(`   Total Agents: ${this.agents.size}`);
    console.log(`   Total Actions: ${this.actionCounter}`);
  }
}

class SimpleAgent {
  private agentId: string;
  private agentName: string;
  private streamer: SimpleLocalStreamer;

  constructor(agentId: string, agentName: string, streamer: SimpleLocalStreamer) {
    this.agentId = agentId;
    this.agentName = agentName;
    this.streamer = streamer;
    this.streamer.registerAgent(this.agentId, this.agentName);
  }

  async performDecisionCycle(): Promise<void> {
    // 1. Thinking
    await this.streamer.streamAction(
      this.agentId,
      this.agentName,
      'THINKING',
      'Analyzing current market conditions and identifying trading opportunities'
    );
    await this.delay(1000);

    // 2. Analyzing
    const marketData = {
      btcPrice: Math.floor(42000 + Math.random() * 2000),
      sentiment: Math.round(Math.random() * 100) / 100,
      volume: Math.floor(Math.random() * 1000000000),
      volatility: Math.round((Math.random() * 0.1 + 0.05) * 100) / 100
    };

    await this.streamer.streamAction(
      this.agentId,
      this.agentName,
      'ANALYZING',
      'Processing market indicators, sentiment data, and technical analysis',
      marketData
    );
    await this.delay(1500);

    // 3. Deciding
    const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'AVAX'];
    const actions = ['BUY', 'SELL'];
    
    const decision = {
      action: actions[Math.floor(Math.random() * actions.length)],
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      amount: Math.round(Math.random() * 200) / 100,
      price: Math.floor(42000 + Math.random() * 2000),
      reasoning: this.getRandomReasoning()
    };

    await this.streamer.streamAction(
      this.agentId,
      this.agentName,
      'DECIDING',
      `Decision: ${decision.action} ${decision.amount} ${decision.symbol} @ $${decision.price}`,
      decision
    );
    await this.delay(800);

    // 4. Executing
    await this.streamer.streamAction(
      this.agentId,
      this.agentName,
      'EXECUTING',
      `Executing ${decision.action} order for ${decision.symbol}`,
      {
        status: 'completed',
        executionTime: new Date().toLocaleTimeString(),
        slippage: Math.round(Math.random() * 10) / 1000
      }
    );
    await this.delay(500);

    // 5. Learning
    await this.streamer.streamAction(
      this.agentId,
      this.agentName,
      'LEARNING',
      'Analyzing execution results and updating strategy parameters',
      {
        performance: Math.random() > 0.3 ? 'positive' : 'neutral',
        adjustments: 'minor parameter updates',
        efficiency: Math.round(Math.random() * 30 + 70) + '%'
      }
    );
  }

  private getRandomReasoning(): string {
    const reasonings = [
      'Technical breakout pattern with high volume confirmation',
      'Sentiment analysis indicates bullish market conditions',
      'Cross-exchange arbitrage opportunity detected',
      'Risk-reward ratio optimization suggests position adjustment',
      'Momentum indicators show trend continuation signals',
      'On-chain metrics confirm institutional accumulation',
      'Volatility compression indicates potential price expansion',
      'Market structure analysis suggests optimal entry point'
    ];
    return reasonings[Math.floor(Math.random() * reasonings.length)];
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function runSimpleStreamingDemo(): Promise<void> {
  const streamer = new SimpleLocalStreamer();

  // Create agents
  const agents = [
    new SimpleAgent('strategic-orchestrator', '🎯 Strategic Orchestrator', streamer),
    new SimpleAgent('market-hunter', '🔍 Market Hunter', streamer),
    new SimpleAgent('performance-optimizer', '⚡ Performance Optimizer', streamer),
    new SimpleAgent('narrative-architect', '📝 Narrative Architect', streamer)
  ];

  console.log(`\n✅ Created ${agents.length} agents for live streaming simulation`);
  console.log('⏰ Starting decision cycles in 2 seconds...\n');

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Run 3 cycles
  for (let cycle = 1; cycle <= 3; cycle++) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 CYCLE ${cycle}/3 - Live Agent Decision Streaming`);
    console.log(`${'='.repeat(60)}`);

    // Run agents with slight delays for realism
    for (let i = 0; i < agents.length; i++) {
      if (i > 0) {
        console.log(`\n⏸️ [Brief pause between agents...]`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      await agents[i].performDecisionCycle();
    }

    streamer.getStats();

    if (cycle < 3) {
      console.log(`\n⏳ Waiting 10 seconds before next cycle...\n`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 LIVE STREAMING DEMO COMPLETED!');
  console.log(`${'='.repeat(60)}`);
  console.log('');
  console.log('💡 What you just saw:');
  console.log('   • Real-time agent decision streaming simulation');
  console.log('   • Complete decision lifecycle: THINKING → ANALYZING → DECIDING → EXECUTING → LEARNING');
  console.log('   • Live confidence levels and market data processing');
  console.log('   • Multi-agent concurrent operation with timestamps');
  console.log('');
  console.log('🌐 For the FULL web experience with live updates:');
  console.log('   Visit: https://brettleehari.github.io/TweetBot/live-agent-stream.html');
  console.log('   Or run: ./trading-service.sh start (for production trading)');
  console.log('');
  console.log('📡 This demonstrates exactly what users would see in the web interface!');
}

// Run the demo
runSimpleStreamingDemo().catch(console.error);