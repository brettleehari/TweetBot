#!/usr/bin/env node
/**
 * Local Live Streaming Server
 * Runs WebSocket server locally with agent demo
 */

import { EventEmitter } from 'events';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple HTTP server to serve the live streaming page
class LocalStreamingServer {
  private httpServer: any;
  private wsServer: WebSocketServer;
  private port: number = 3001;
  private agents: Map<string, any> = new Map();
  private actionCounter = 0;

  constructor() {
    this.setupHttpServer();
    this.setupWebSocketServer();
  }

  private setupHttpServer(): void {
    this.httpServer = createServer((req, res) => {
      // Enable CORS for local development
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      if (req.url === '/' || req.url === '/live-agent-stream.html') {
        try {
          // Serve the live streaming HTML page
          const htmlPath = path.join(__dirname, '../../docs/live-agent-stream.html');
          const html = readFileSync(htmlPath, 'utf-8');
          
          // Update WebSocket URL for local development
          const updatedHtml = html.replace('ws://localhost:3001', `ws://localhost:${this.port}`);
          
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(updatedHtml);
        } catch (error) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Live streaming page not found');
        }
      } else if (req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'running',
          agents: this.agents.size,
          actions: this.actionCounter,
          port: this.port
        }));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      }
    });
  }

  private setupWebSocketServer(): void {
    this.wsServer = new WebSocketServer({ server: this.httpServer });

    this.wsServer.on('connection', (ws) => {
      console.log('🔗 Client connected to live stream');
      
      // Send current status
      this.sendStatusToClient(ws);
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('📨 Received message:', data);
        } catch (error) {
          console.error('❌ Invalid message:', error);
        }
      });
      
      ws.on('close', () => {
        console.log('🔌 Client disconnected');
      });
    });
  }

  start(): void {
    this.httpServer.listen(this.port, () => {
      console.log('🚀 LOCAL LIVE STREAMING SERVER STARTED');
      console.log('📡 WebSocket Server: ws://localhost:' + this.port);
      console.log('🌐 Web Interface: http://localhost:' + this.port);
      console.log('📊 Status Endpoint: http://localhost:' + this.port + '/status');
      console.log('');
    });
  }

  // Stream agent action to all connected clients
  streamAction(action: any): void {
    this.actionCounter++;
    
    // Update agent registry
    if (!this.agents.has(action.agentId)) {
      this.agents.set(action.agentId, {
        id: action.agentId,
        name: action.agentName,
        actions: [],
        isActive: true
      });
    }

    const agent = this.agents.get(action.agentId);
    agent.actions.push(action);
    
    // Keep only last 10 actions
    if (agent.actions.length > 10) {
      agent.actions.shift();
    }

    // Broadcast to all WebSocket clients
    const message = JSON.stringify({
      type: 'agent_action',
      data: action
    });

    this.wsServer.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(message);
        } catch (error) {
          console.error('❌ Failed to send to client:', error);
        }
      }
    });

    // Log to console
    console.log(`🤖 [${action.agentName}] ${this.getActionEmoji(action.actionType)} ${action.actionType}: ${action.description}`);
  }

  private sendStatusToClient(ws: any): void {
    const status = {
      type: 'agent_status',
      data: {
        totalAgents: this.agents.size,
        activeAgents: Array.from(this.agents.values()).filter(a => a.isActive).length,
        totalActions: this.actionCounter,
        agents: Array.from(this.agents.values())
      }
    };

    try {
      ws.send(JSON.stringify(status));
    } catch (error) {
      console.error('❌ Failed to send status:', error);
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
}

// Demo agent for local streaming
class LocalDemoAgent {
  private agentId: string;
  private agentName: string;
  private server: LocalStreamingServer;

  constructor(agentId: string, agentName: string, server: LocalStreamingServer) {
    this.agentId = agentId;
    this.agentName = agentName;
    this.server = server;
  }

  async runDecisionCycle(): Promise<void> {
    // 1. Thinking
    await this.streamAction('THINKING', 'Analyzing current market conditions and identifying opportunities');
    await this.delay(1500);

    // 2. Analyzing
    const marketData = {
      btcPrice: 42000 + Math.random() * 2000,
      sentiment: Math.random(),
      volume: Math.random() * 1000000000,
      volatility: Math.random() * 0.1 + 0.05
    };

    await this.streamAction('ANALYZING', 'Processing market indicators and sentiment analysis', marketData);
    await this.delay(2000);

    // 3. Deciding
    const decision = {
      action: Math.random() > 0.5 ? 'BUY' : 'SELL',
      symbol: ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'][Math.floor(Math.random() * 5)],
      amount: Math.random() * 2,
      confidence: Math.floor(Math.random() * 30 + 70),
      reasoning: this.getRandomReasoning()
    };

    await this.streamAction('DECIDING', `Decision: ${decision.action} ${decision.amount.toFixed(4)} ${decision.symbol}`, decision);
    await this.delay(1000);

    // 4. Executing
    await this.streamAction('EXECUTING', `Executing ${decision.action} order for ${decision.symbol}`, {
      status: 'completed',
      executionTime: Date.now(),
      slippage: Math.random() * 0.01
    });
    await this.delay(800);

    // 5. Learning
    await this.streamAction('LEARNING', 'Analyzing execution results and updating strategy parameters', {
      performance: Math.random() > 0.3 ? 'positive' : 'negative',
      adjustments: 'strategy parameters updated',
      learningRate: Math.random() * 0.1
    });
  }

  private async streamAction(actionType: string, description: string, data?: any): Promise<void> {
    const action = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      agentId: this.agentId,
      agentName: this.agentName,
      timestamp: new Date().toISOString(),
      actionType,
      description,
      data,
      confidence: Math.floor(Math.random() * 30 + 70),
      reasoning: data?.reasoning || this.getRandomReasoning()
    };

    this.server.streamAction(action);
  }

  private getRandomReasoning(): string {
    const reasonings = [
      'Technical indicators show strong bullish momentum',
      'Market sentiment analysis indicates positive outlook',
      'Cross-market arbitrage opportunity detected',
      'Risk-adjusted position sizing optimization',
      'Momentum exhaustion signals warrant position adjustment',
      'Institutional flow patterns suggest accumulation phase',
      'Volatility compression indicates potential breakout',
      'On-chain metrics confirm fundamental strength'
    ];
    return reasonings[Math.floor(Math.random() * reasonings.length)];
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main function to run local streaming demo
async function runLocalStreamingDemo(): Promise<void> {
  const server = new LocalStreamingServer();
  server.start();

  // Create demo agents
  const agents = [
    new LocalDemoAgent('strategic-orchestrator', '🎯 Strategic Orchestrator', server),
    new LocalDemoAgent('market-hunter', '🔍 Market Hunter', server),
    new LocalDemoAgent('performance-optimizer', '⚡ Performance Optimizer', server),
    new LocalDemoAgent('narrative-architect', '📝 Narrative Architect', server)
  ];

  console.log(`✅ Created ${agents.length} demo agents for live streaming`);
  console.log('🌐 Open http://localhost:3001 in your browser to watch live!');
  console.log('⏰ Agents will start making decisions in 5 seconds...\n');

  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Run continuous agent cycles
  let cycle = 1;
  const runCycle = async () => {
    console.log(`\n🔄 CYCLE ${cycle} - Running agent decision cycles...`);
    
    // Run agents with random delays to make it more realistic
    const promises = agents.map(async (agent, index) => {
      await new Promise(resolve => setTimeout(resolve, index * 2000)); // Stagger starts
      await agent.runDecisionCycle();
    });

    await Promise.all(promises);
    cycle++;

    console.log(`✅ Cycle ${cycle - 1} completed. Next cycle in 15 seconds...`);
    
    // Schedule next cycle
    setTimeout(runCycle, 15000);
  };

  // Start the first cycle
  runCycle();

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping local streaming server...');
    process.exit(0);
  });
}

// Run if executed directly
const isMainModule = import.meta?.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runLocalStreamingDemo().catch(console.error);
}

export { LocalStreamingServer, LocalDemoAgent };