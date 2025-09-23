#!/usr/bin/env node
/**
 * Live Agent Streaming Service
 * Streams real-time agent actions and decisions to end users
 */

import { EventEmitter } from 'events';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

// Agent Action Types for streaming
interface AgentAction {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  actionType: 'THINKING' | 'ANALYZING' | 'DECIDING' | 'EXECUTING' | 'LEARNING';
  stage: string;
  description: string;
  data?: any;
  confidence?: number;
  progress?: number;
  reasoning?: string;
  nextAction?: string;
}

interface AgentDecision {
  id: string;
  agentId: string;
  timestamp: string;
  decision: any;
  reasoning: string;
  confidence: number;
  expectedOutcome: string;
  executionStatus: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
}

interface StreamingAgentContext {
  agentId: string;
  currentAction?: AgentAction;
  actionQueue: AgentAction[];
  subscribers: Set<any>;
  isActive: boolean;
}

export class LiveAgentStreamer extends EventEmitter {
  private agents: Map<string, StreamingAgentContext> = new Map();
  private wsServer?: WebSocketServer;
  private httpServer?: any;
  private port: number = 3001;
  private actionCounter = 0;
  
  constructor() {
    super();
    this.setupWebSocketServer();
  }

  // Initialize WebSocket server for real-time streaming
  private setupWebSocketServer(): void {
    this.httpServer = createServer();
    this.wsServer = new WebSocketServer({ server: this.httpServer });

    this.wsServer.on('connection', (ws) => {
      console.log('🔗 New client connected to agent stream');
      
      // Send current agent status to new client
      this.sendCurrentStatus(ws);
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error('❌ Invalid message from client:', error);
        }
      });
      
      ws.on('close', () => {
        console.log('🔌 Client disconnected from agent stream');
        this.removeClientFromAllSubscriptions(ws);
      });
      
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });
    });

    this.httpServer.listen(this.port, () => {
      console.log(`🌐 Live Agent Streaming Server running on port ${this.port}`);
      console.log(`📡 WebSocket endpoint: ws://localhost:${this.port}`);
    });
  }

  // Register an agent for live streaming
  registerAgent(agentId: string, agentName: string): StreamingAgentContext {
    const context: StreamingAgentContext = {
      agentId,
      actionQueue: [],
      subscribers: new Set(),
      isActive: false
    };
    
    this.agents.set(agentId, context);
    console.log(`📝 Registered agent for streaming: ${agentName} (${agentId})`);
    
    return context;
  }

  // Stream agent thinking process in real-time
  async streamAgentThinking(
    agentId: string, 
    agentName: string,
    thinkingProcess: string,
    stage: string = 'thinking'
  ): Promise<void> {
    const action: AgentAction = {
      id: `action_${++this.actionCounter}`,
      agentId,
      agentName,
      timestamp: new Date().toISOString(),
      actionType: 'THINKING',
      stage,
      description: thinkingProcess,
      progress: Math.random() * 100
    };

    await this.streamAction(action);
  }

  // Stream agent analysis in real-time
  async streamAgentAnalysis(
    agentId: string,
    agentName: string, 
    analysisData: any,
    reasoning: string
  ): Promise<void> {
    const action: AgentAction = {
      id: `action_${++this.actionCounter}`,
      agentId,
      agentName,
      timestamp: new Date().toISOString(),
      actionType: 'ANALYZING',
      stage: 'market_analysis',
      description: `Analyzing ${Object.keys(analysisData).join(', ')}`,
      data: analysisData,
      reasoning,
      confidence: Math.floor(Math.random() * 30 + 70)
    };

    await this.streamAction(action);
  }

  // Stream agent decision-making process
  async streamAgentDecision(
    agentId: string,
    agentName: string,
    decision: any,
    reasoning: string,
    confidence: number
  ): Promise<void> {
    const action: AgentAction = {
      id: `action_${++this.actionCounter}`,
      agentId,
      agentName,
      timestamp: new Date().toISOString(),
      actionType: 'DECIDING',
      stage: 'decision_making',
      description: `Making decision: ${decision.action || decision.type || 'Strategic Decision'}`,
      data: decision,
      reasoning,
      confidence,
      nextAction: 'execution'
    };

    await this.streamAction(action);
  }

  // Stream agent execution process
  async streamAgentExecution(
    agentId: string,
    agentName: string,
    executionDetails: any,
    status: string = 'executing'
  ): Promise<void> {
    const action: AgentAction = {
      id: `action_${++this.actionCounter}`,
      agentId,
      agentName,
      timestamp: new Date().toISOString(),
      actionType: 'EXECUTING',
      stage: 'execution',
      description: `Executing: ${executionDetails.description || 'Action'}`,
      data: executionDetails,
      progress: executionDetails.progress || 50
    };

    await this.streamAction(action);
  }

  // Stream agent learning process
  async streamAgentLearning(
    agentId: string,
    agentName: string,
    learningData: any,
    insights: string
  ): Promise<void> {
    const action: AgentAction = {
      id: `action_${++this.actionCounter}`,
      agentId,
      agentName,
      timestamp: new Date().toISOString(),
      actionType: 'LEARNING',
      stage: 'adaptation',
      description: 'Learning from execution results',
      data: learningData,
      reasoning: insights,
      confidence: Math.floor(Math.random() * 20 + 80)
    };

    await this.streamAction(action);
  }

  // Core streaming method
  private async streamAction(action: AgentAction): Promise<void> {
    const context = this.agents.get(action.agentId);
    if (!context) {
      console.warn(`⚠️ Agent ${action.agentId} not registered for streaming`);
      return;
    }

    // Update context
    context.currentAction = action;
    context.actionQueue.push(action);
    context.isActive = true;

    // Keep only last 10 actions per agent
    if (context.actionQueue.length > 10) {
      context.actionQueue.shift();
    }

    // Broadcast to all WebSocket clients
    this.broadcastAction(action);

    // Emit event for other listeners
    this.emit('agentAction', action);

    // Log to console for debugging
    console.log(`🤖 [${action.agentName}] ${action.actionType}: ${action.description}`);
    
    if (action.reasoning) {
      console.log(`   💭 Reasoning: ${action.reasoning}`);
    }
    
    if (action.confidence) {
      console.log(`   🎯 Confidence: ${action.confidence}%`);
    }
  }

  // Broadcast action to all WebSocket clients
  private broadcastAction(action: AgentAction): void {
    if (!this.wsServer) return;

    const message = JSON.stringify({
      type: 'agent_action',
      data: action
    });

    this.wsServer.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(message);
        } catch (error) {
          console.error('❌ Failed to send message to client:', error);
        }
      }
    });
  }

  // Send current status to new client
  private sendCurrentStatus(ws: any): void {
    const status = {
      type: 'agent_status',
      data: {
        totalAgents: this.agents.size,
        activeAgents: Array.from(this.agents.values()).filter(a => a.isActive).length,
        agents: Array.from(this.agents.entries()).map(([id, context]) => ({
          agentId: id,
          isActive: context.isActive,
          currentAction: context.currentAction,
          queueLength: context.actionQueue.length
        }))
      }
    };

    try {
      ws.send(JSON.stringify(status));
    } catch (error) {
      console.error('❌ Failed to send status to client:', error);
    }
  }

  // Handle client messages
  private handleClientMessage(ws: any, data: any): void {
    switch (data.type) {
      case 'subscribe_agent':
        this.subscribeClientToAgent(ws, data.agentId);
        break;
      case 'unsubscribe_agent':
        this.unsubscribeClientFromAgent(ws, data.agentId);
        break;
      case 'get_agent_history':
        this.sendAgentHistory(ws, data.agentId);
        break;
      default:
        console.warn('⚠️ Unknown message type from client:', data.type);
    }
  }

  // Subscribe client to specific agent
  private subscribeClientToAgent(ws: any, agentId: string): void {
    const context = this.agents.get(agentId);
    if (context) {
      context.subscribers.add(ws);
      console.log(`📡 Client subscribed to agent: ${agentId}`);
    }
  }

  // Unsubscribe client from specific agent
  private unsubscribeClientFromAgent(ws: any, agentId: string): void {
    const context = this.agents.get(agentId);
    if (context) {
      context.subscribers.delete(ws);
      console.log(`📡 Client unsubscribed from agent: ${agentId}`);
    }
  }

  // Remove client from all subscriptions
  private removeClientFromAllSubscriptions(ws: any): void {
    this.agents.forEach((context) => {
      context.subscribers.delete(ws);
    });
  }

  // Send agent history to client
  private sendAgentHistory(ws: any, agentId: string): void {
    const context = this.agents.get(agentId);
    if (context) {
      const message = JSON.stringify({
        type: 'agent_history',
        data: {
          agentId,
          actions: context.actionQueue
        }
      });

      try {
        ws.send(message);
      } catch (error) {
        console.error('❌ Failed to send agent history:', error);
      }
    }
  }

  // Get agent streaming context
  getAgentContext(agentId: string): StreamingAgentContext | undefined {
    return this.agents.get(agentId);
  }

  // Get all active agents
  getActiveAgents(): string[] {
    return Array.from(this.agents.entries())
      .filter(([_, context]) => context.isActive)
      .map(([agentId, _]) => agentId);
  }

  // Close streaming server
  async close(): Promise<void> {
    if (this.wsServer) {
      this.wsServer.close();
    }
    if (this.httpServer) {
      this.httpServer.close();
    }
    console.log('🛑 Live Agent Streaming Server stopped');
  }
}

// Enhanced Agent wrapper with streaming capabilities
export class StreamingAgentWrapper {
  private agent: any;
  private streamer: LiveAgentStreamer;
  private agentId: string;
  private agentName: string;

  constructor(agent: any, streamer: LiveAgentStreamer, agentName: string) {
    this.agent = agent;
    this.streamer = streamer;
    this.agentId = agent.agentId || agent.name || 'unknown';
    this.agentName = agentName;
    
    // Register with streamer
    this.streamer.registerAgent(this.agentId, this.agentName);
  }

  // Wrap agent.stream() method with live streaming
  async streamWithLiveUpdates(messages: any[]): Promise<any> {
    // Stream thinking process
    await this.streamer.streamAgentThinking(
      this.agentId,
      this.agentName,
      `Processing ${messages.length} message(s)`,
      'input_processing'
    );

    // Stream analysis
    await this.streamer.streamAgentAnalysis(
      this.agentId,
      this.agentName,
      { messageCount: messages.length, inputLength: JSON.stringify(messages).length },
      'Analyzing input context and preparing response strategy'
    );

    // Start execution
    await this.streamer.streamAgentExecution(
      this.agentId,
      this.agentName,
      { description: 'Generating response', stage: 'started' },
      'executing'
    );

    // Call original agent stream method
    const response = await this.agent.stream(messages);
    
    let fullResponse = '';
    let chunkCount = 0;

    // Stream each chunk with progress updates
    const responseStream = {
      textStream: async function* () {
        for await (const chunk of response.textStream) {
          fullResponse += chunk;
          chunkCount++;
          
          // Stream execution progress every 10 chunks
          if (chunkCount % 10 === 0) {
            await streamer.streamAgentExecution(
              agentId,
              agentName,
              { 
                description: 'Generating response', 
                stage: 'streaming',
                progress: Math.min(95, (fullResponse.length / 100) * 10),
                chunksProcessed: chunkCount 
              }
            );
          }
          
          yield chunk;
        }
        
        // Stream completion
        await streamer.streamAgentExecution(
          agentId,
          agentName,
          { 
            description: 'Response completed', 
            stage: 'completed',
            progress: 100,
            totalChunks: chunkCount,
            responseLength: fullResponse.length
          }
        );
        
        // Stream learning
        await streamer.streamAgentLearning(
          agentId,
          agentName,
          { 
            responseLength: fullResponse.length,
            chunks: chunkCount,
            performance: 'successful'
          },
          `Successfully processed and responded with ${fullResponse.length} characters`
        );
      }()
    };

    const { streamer, agentId, agentName } = this;
    return { ...response, textStream: responseStream.textStream };
  }

  // Wrap autonomous decision cycle with streaming
  async autonomousDecisionCycleWithStreaming(): Promise<any[]> {
    if (!this.agent.autonomousDecisionCycle) {
      console.warn(`⚠️ Agent ${this.agentName} doesn't support autonomous decision cycle`);
      return [];
    }

    // Stream decision cycle start
    await this.streamer.streamAgentThinking(
      this.agentId,
      this.agentName,
      'Starting autonomous decision cycle',
      'autonomous_cycle'
    );

    // Execute decision cycle
    const decisions = await this.agent.autonomousDecisionCycle();

    // Stream each decision
    for (const decision of decisions) {
      await this.streamer.streamAgentDecision(
        this.agentId,
        this.agentName,
        decision,
        decision.reasoning || 'Autonomous strategic decision',
        decision.confidence || 85
      );
    }

    return decisions;
  }
}

// Export singleton instance
export const liveAgentStreamer = new LiveAgentStreamer();
export { StreamingAgentWrapper, AgentAction, AgentDecision };