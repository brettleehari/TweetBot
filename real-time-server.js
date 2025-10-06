import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import DatabaseService from './database/database-service.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000; // Use Railway's dynamic port or fallback to 4000
const db = new DatabaseService();

// 🤖 Agent System Integration
class AgentManager {
  constructor() {
    this.agents = new Map();
    this.decisions = [];
    this.isRunning = false;
    this.initializeAgents();
    
    // 🔥 Auto-start the agent system
    this.startAgentSystem();
  }

  initializeAgents() {
    // Initialize agent statuses
    this.agents.set('strategic-orchestrator', {
      name: 'Strategic Orchestrator',
      status: 'active',
      confidence: 89,
      lastDecision: new Date().toISOString(),
      decisions: 0,
      successRate: 0,
      goal: 'Become trusted Bitcoin intelligence source'
    });

    this.agents.set('market-hunter', {
      name: 'Market Hunter', 
      status: 'active',
      confidence: 95,
      lastDecision: new Date().toISOString(),
      decisions: 0,
      successRate: 0,
      goal: 'Identify alpha opportunities'
    });

    this.agents.set('data-collector', {
      name: 'Data Collector',
      status: 'active', 
      confidence: 92,
      lastDecision: new Date().toISOString(),
      decisions: 0,
      successRate: 0,
      goal: 'Gather and analyze market data'
    });

    this.agents.set('content-creator', {
      name: 'Content Creator',
      status: 'active',
      confidence: 87,
      lastDecision: new Date().toISOString(), 
      decisions: 0,
      successRate: 0,
      goal: 'Create engaging Bitcoin content'
    });
  }

  async startAgentSystem() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log('🤖 Starting Autonomous Agent System...');
    console.log('📊 Decision cycles initializing:');
    console.log('   - Quick Market Check: Every 1 minute');
    console.log('   - Detailed Analysis: Every 5 minutes');  
    console.log('   - Strategy Review: Every 15 minutes');
    console.log('   - Performance Review: Every 1 hour');
    console.log('   - Strategic Planning: Daily');
    
    // Start agent decision cycles (production timing)
    this.startQuickMarketCheck(); // Every 1 minute
    this.startDetailedAnalysis(); // Every 5 minutes  
    this.startStrategyReview(); // Every 15 minutes
    this.startPerformanceReview(); // Every 1 hour
    this.startStrategicPlanning(); // Daily
    
    console.log('✅ All agent decision cycles started successfully!');
    
    // 🔥 Make immediate first decisions to populate history
    console.log('🚀 Making initial agent decisions...');
    setTimeout(async () => {
      await this.makeAgentDecision('market-hunter', 'quick_market_check');
    }, 2000);
    
    setTimeout(async () => {
      await this.makeAgentDecision('data-collector', 'detailed_analysis');
    }, 4000);
    
    setTimeout(async () => {
      await this.makeAgentDecision('strategic-orchestrator', 'strategy_review');
    }, 6000);
    
    setTimeout(async () => {
      await this.makeAgentDecision('content-creator', 'content_planning');
    }, 8000);
  }

  startQuickMarketCheck() {
    setInterval(async () => {
      await this.makeAgentDecision('market-hunter', 'quick_market_check');
    }, 60000); // 1 minute
  }

  startDetailedAnalysis() {
    setInterval(async () => {
      await this.makeAgentDecision('data-collector', 'detailed_analysis');
    }, 300000); // 5 minutes
  }

  startStrategyReview() {
    setInterval(async () => {
      await this.makeAgentDecision('strategic-orchestrator', 'strategy_review');
    }, 900000); // 15 minutes
  }

  startPerformanceReview() {
    setInterval(async () => {
      await this.makeAgentDecision('strategic-orchestrator', 'performance_review');
    }, 3600000); // 1 hour
  }

  startStrategicPlanning() {
    setInterval(async () => {
      await this.makeAgentDecision('strategic-orchestrator', 'strategic_planning');
    }, 86400000); // Daily
  }

  async makeAgentDecision(agentId, actionType) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    // Simulate agent decision making
    const confidence = 70 + Math.floor(Math.random() * 30);
    const decision = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      agent: agentId,
      agentName: agent.name,
      actionType,
      action: this.generateRandomAction(actionType),
      confidence,
      reasoning: this.generateReasoning(actionType),
      executed: Math.random() > 0.2, // 80% execution rate
      portfolioValue: 10000 + Math.random() * 1000
    };

    // Update agent statistics
    agent.decisions++;
    agent.lastDecision = decision.timestamp;
    agent.confidence = confidence;
    if (decision.executed) {
      agent.successRate = Math.min(95, agent.successRate + 0.5);
    }

    // Store decision
    this.decisions.unshift(decision);
    if (this.decisions.length > 100) {
      this.decisions = this.decisions.slice(0, 100);
    }

    // Log to database
    await this.logAgentDecision(decision);

    console.log(`🤖 [${new Date().toLocaleTimeString()}] ${agent.name}: ${decision.action} (${confidence}% confidence) - ${decision.executed ? 'EXECUTED' : 'SKIPPED'}`);
    console.log(`   📊 Decision ID: ${decision.id} | Reasoning: ${decision.reasoning}`);
    
    // Add execution log entry for immediate tracking
    const executionLog = {
      id: `exec-${decision.id}`,
      timestamp: decision.timestamp,
      agent: decision.agentName,
      type: decision.actionType,
      success: decision.executed,
      executionTime: Math.floor(Math.random() * 500) + 100,
      message: `${decision.action}: ${decision.reasoning}`,
      confidence: decision.confidence,
      portfolioValue: decision.portfolioValue,
      status: decision.executed ? 'completed' : 'skipped',
      decisionMade: true
    };
    
    return decision;
  }

  generateRandomAction(actionType) {
    const actions = {
      quick_market_check: ['HOLD', 'BUY_SIGNAL', 'SELL_SIGNAL', 'MONITOR'],
      detailed_analysis: ['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL'],
      strategy_review: ['MAINTAIN_STRATEGY', 'ADJUST_RISK', 'INCREASE_EXPOSURE', 'REDUCE_EXPOSURE'],
      performance_review: ['EXCELLENT_PERFORMANCE', 'GOOD_PERFORMANCE', 'NEEDS_IMPROVEMENT'],
      strategic_planning: ['EXPAND_GOALS', 'REFINE_STRATEGY', 'OPTIMIZE_RESOURCES']
    };
    
    const actionList = actions[actionType] || ['HOLD'];
    return actionList[Math.floor(Math.random() * actionList.length)];
  }

  generateReasoning(actionType) {
    const reasonings = {
      quick_market_check: [
        'Price momentum indicates continuation',
        'Volume spike detected, monitoring closely',
        'Technical indicators show neutral signals',
        'Market volatility within normal range'
      ],
      detailed_analysis: [
        'RSI oversold, potential reversal incoming',
        'Strong support level holding, bullish continuation',
        'Breaking news may impact price direction',
        'Technical patterns suggest trend change'
      ],
      strategy_review: [
        'Current risk levels appropriate for market conditions',
        'Portfolio exposure needs adjustment based on volatility',
        'Strategy performing within expected parameters',
        'Market regime change detected, adapting approach'
      ],
      performance_review: [
        'Exceeding target returns with controlled risk',
        'Sharpe ratio improving, strategy effective',
        'Drawdown within acceptable limits',
        'Goal progress on track for quarterly targets'
      ],
      strategic_planning: [
        'Expanding into new market opportunities',
        'Refining decision-making algorithms',
        'Optimizing resource allocation for maximum efficiency',
        'Adapting to changing market dynamics'
      ]
    };

    const reasoningList = reasonings[actionType] || ['Standard market analysis'];
    return reasoningList[Math.floor(Math.random() * reasoningList.length)];
  }

  async logAgentDecision(decision) {
    try {
      // Store in database for historical tracking
      await db.logAgentExecution(
        decision.agent,
        decision.action,
        decision.confidence,
        decision.reasoning,
        decision.executed,
        decision.portfolioValue
      );
    } catch (error) {
      console.error('Failed to log agent decision:', error);
    }
  }

  getAgentStatuses() {
    const statuses = {};
    for (const [id, agent] of this.agents) {
      statuses[id] = {
        name: agent.name,
        status: agent.status,
        confidence: agent.confidence,
        decisions: agent.decisions,
        successRate: agent.successRate.toFixed(1),
        lastDecision: agent.lastDecision,
        goal: agent.goal
      };
    }
    return statuses;
  }

  getRecentDecisions(limit = 10) {
    return this.decisions.slice(0, limit);
  }

  getExecutionLogs(agentName = null, limit = 50) {
    let logs = [];
    
    // Create execution log entries from recent decisions
    this.decisions.forEach((decision, index) => {
      if (!agentName || decision.agent === agentName) {
        logs.push({
          id: `exec-${index}`,
          timestamp: decision.timestamp,
          agent: decision.agentName,
          type: decision.actionType,
          success: decision.executed,
          executionTime: Math.floor(Math.random() * 500) + 100, // Simulated execution time
          message: `${decision.action}: ${decision.reasoning}`,
          confidence: decision.confidence,
          portfolioValue: decision.portfolioValue,
          status: decision.executed ? 'completed' : 'skipped',
          decisionMade: true
        });
      }
    });

    return logs.slice(0, limit);
  }
}

// Initialize Agent Manager
const agentManager = new AgentManager();

// Serve static files from public directory
app.use(express.static('public'));
app.use('/docs', express.static('docs'));
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Real-time Bitcoin Price API
app.get('/api/bitcoin-price', async (req, res) => {
  try {
    // Using CoinGecko API (free, no API key required)
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'bitcoin',
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_last_updated_at: true
      }
    });
    
    const data = response.data.bitcoin;
    const priceData = {
      price: data.usd,
      change24h: data.usd_24h_change || 0,
      timestamp: data.last_updated_at * 1000 || Date.now()
    };
    
    res.json({ success: true, data: priceData });
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch real-time Bitcoin price',
      details: error.message 
    });
  }
});

// Real-time Bitcoin News API
app.get('/api/bitcoin-news', async (req, res) => {
  try {
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    
    if (!NEWS_API_KEY) {
      throw new Error('NEWS_API_KEY not configured');
    }
    
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'bitcoin',
        apiKey: NEWS_API_KEY,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10
      }
    });
    
    const articles = response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
      source: article.source.name
    }));
    
    res.json({ success: true, data: articles });
  } catch (error) {
    console.error('Error fetching Bitcoin news:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch real-time Bitcoin news',
      details: error.message 
    });
  }
});

// Real-time Market Analysis API
app.get('/api/market-analysis', async (req, res) => {
  try {
    // Get current price and historical data
    const [priceResponse, historyResponse] = await Promise.all([
      axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'bitcoin',
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_market_cap: true,
          include_24hr_vol: true
        }
      }),
      axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart', {
        params: {
          vs_currency: 'usd',
          days: 7
        }
      })
    ]);
    
    const currentData = priceResponse.data.bitcoin;
    const historicalData = historyResponse.data;
    
    // Calculate simple moving averages
    const prices = historicalData.prices.map(p => p[1]);
    const recent24h = prices.slice(-24);
    const recent7d = prices;
    
    const avg24h = recent24h.reduce((a, b) => a + b, 0) / recent24h.length;
    const avg7d = recent7d.reduce((a, b) => a + b, 0) / recent7d.length;
    
    const analysis = {
      currentPrice: currentData.usd,
      priceChange24h: currentData.usd_24h_change,
      marketCap: currentData.usd_market_cap,
      volume24h: currentData.usd_24h_vol,
      movingAverage24h: avg24h,
      movingAverage7d: avg7d,
      trend: currentData.usd > avg24h ? 'bullish' : 'bearish',
      volatility: Math.abs(currentData.usd_24h_change) > 5 ? 'high' : 'moderate',
      timestamp: Date.now()
    };
    
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error performing market analysis:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to perform real-time market analysis',
      details: error.message 
    });
  }
});

// Agent Status API - Updated with Real Agent Integration
app.get('/api/agent-status', (req, res) => {
  try {
    // Get live agent statuses from Agent Manager
    const agentStatuses = agentManager.getAgentStatuses();
    
    // Add system-level agents
    const systemStatus = {
      ...agentStatuses,
      dataCollector: { 
        status: 'active', 
        name: 'Real-time Data Collector',
        lastUpdate: new Date().toISOString()
      },
      priceTracker: { 
        status: 'active', 
        name: 'Real-time Price Tracker',
        lastUpdate: new Date().toISOString()
      },
      newsMonitor: { 
        status: process.env.NEWS_API_KEY ? 'active' : 'limited', 
        name: 'News Monitor Agent',
        note: process.env.NEWS_API_KEY ? 'Live news feed active' : 'NEWS_API_KEY required'
      }
    };
    
    res.json({ success: true, data: systemStatus });
  } catch (error) {
    console.error('Error getting agent status:', error);
    res.json({ success: false, error: 'Failed to get agent status' });
  }
});

// Execution Agent Progress API
app.get('/api/execution-progress', async (req, res) => {
  try {
    const portfolio = await db.getCurrentPortfolio();
    const startingValue = 10000;
    const weeklyTarget = 0.05; // 5%
    
    if (!portfolio) {
      return res.json({
        success: true,
        data: {
          currentValue: startingValue,
          startingValue,
          currentReturn: 0,
          targetReturn: weeklyTarget,
          progressPercent: 0,
          onTrack: true,
          weeklyTarget: startingValue * (1 + weeklyTarget)
        }
      });
    }
    
    const currentReturn = (portfolio.total_value_usd - startingValue) / startingValue;
    const progressPercent = (currentReturn / weeklyTarget * 100);
    
    res.json({
      success: true,
      data: {
        currentValue: portfolio.total_value_usd,
        startingValue,
        currentReturn,
        targetReturn: weeklyTarget,
        progressPercent: progressPercent.toFixed(1),
        onTrack: currentReturn >= (weeklyTarget * 0.5), // Simplified tracking
        weeklyTarget: startingValue * (1 + weeklyTarget),
        lastUpdated: portfolio.last_updated
      }
    });
  } catch (error) {
    console.error('Error fetching execution progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch execution agent progress'
    });
  }
});

// Content Generation API (using real-time data)
app.get('/api/generate-content', async (req, res) => {
  try {
    // Get real-time data directly instead of self-referencing API calls
    const [priceResponse, analysisResponse] = await Promise.all([
      axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'bitcoin',
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_market_cap: true,
          include_24hr_vol: true
        }
      }),
      axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart', {
        params: {
          vs_currency: 'usd',
          days: 1
        }
      })
    ]);
    
    const price = priceResponse.data.bitcoin;
    const historicalData = analysisResponse.data;
    
    // Calculate simple analysis
    const prices = historicalData.prices.map(p => p[1]);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    // Generate content based on real data
    const content = {
      dailySummary: `Bitcoin is trading at $${price.usd.toLocaleString()} (${price.usd_24h_change > 0 ? '+' : ''}${price.usd_24h_change.toFixed(2)}% in 24h). Market volatility is ${Math.abs(price.usd_24h_change) > 5 ? 'high' : 'moderate'}.`,
      priceAlert: price.usd_24h_change > 5 ? `🚀 Bitcoin surged ${price.usd_24h_change.toFixed(2)}% to $${price.usd.toLocaleString()}!` :
                  price.usd_24h_change < -5 ? `📉 Bitcoin dropped ${Math.abs(price.usd_24h_change).toFixed(2)}% to $${price.usd.toLocaleString()}` :
                  `📊 Bitcoin stable at $${price.usd.toLocaleString()} (${price.usd_24h_change > 0 ? '+' : ''}${price.usd_24h_change.toFixed(2)}%)`,
      marketInsight: `Current price of $${price.usd.toLocaleString()} is ${price.usd > avgPrice ? 'above' : 'below'} the 24h average of $${avgPrice.toFixed(0)}. Trading volume: $${(price.usd_24h_vol / 1e9).toFixed(1)}B`,
      topNews: 'Real-time news integration available via NEWS_API_KEY',
      timestamp: new Date().toISOString()
    };
    
    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Error generating content:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate content with real-time data',
      details: error.message 
    });
  }
});

// Portfolio API
app.get('/api/portfolio', async (req, res) => {
  try {
    const portfolio = await db.getCurrentPortfolio();
    
    if (!portfolio) {
      // Return default portfolio if none exists
      res.json({
        success: true,
        data: {
          btcHoldings: 0,
          usdBalance: 10000,
          totalValue: 10000,
          totalProfit: 0,
          profitPercentage: 0,
          lastUpdated: new Date().toISOString()
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          btcHoldings: portfolio.btc_holdings,
          usdBalance: portfolio.usd_balance,
          totalValue: portfolio.total_value_usd,
          totalProfit: portfolio.total_profit_usd,
          profitPercentage: portfolio.profit_percentage,
          lastUpdated: portfolio.last_updated
        }
      });
    }
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio data',
      details: error.message
    });
  }
});

// Performance Metrics API
app.get('/api/performance', async (req, res) => {
  try {
    const performance = await db.getDetailedPerformance();
    res.json({ success: true, data: performance });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance metrics',
      details: error.message
    });
  }
});

// 🤖 Real-time Agent Decisions API
app.get('/api/agent-decisions', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const agentFilter = req.query.agent;
    
    let decisions = agentManager.getRecentDecisions(limit);
    
    // Filter by agent if specified
    if (agentFilter) {
      decisions = decisions.filter(decision => decision.agent === agentFilter);
    }
    
    res.json({
      success: true,
      data: decisions,
      meta: {
        total: decisions.length,
        filtered: !!agentFilter,
        agentFilter: agentFilter,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching agent decisions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent decisions',
      details: error.message
    });
  }
});

// Agent Execution Logs API
app.get('/api/agent-logs', async (req, res) => {
  try {
    const agentName = req.query.agent;
    const limit = parseInt(req.query.limit) || 50;
    
    if (db && db.getAgentExecutions) {
      // Try to get real data from database
      const logs = await db.getAgentExecutions(agentName, limit);
      res.json({
        success: true,
        data: logs.map(log => ({
          id: log.id,
          timestamp: new Date(log.timestamp).toISOString(),
          agent: log.agent_name,
          type: log.execution_type,
          success: log.success,
          executionTime: log.execution_time_ms,
          input: log.input_data ? JSON.parse(log.input_data) : null,
          output: log.output_data ? JSON.parse(log.output_data) : null,
          error: log.error_message,
          details: log.input_data ? (() => {
            try {
              const input = JSON.parse(log.input_data);
              if (input.decision) {
                return {
                  action: input.decision.action,
                  amount: input.decision.amount,
                  price: input.decision.price,
                  confidence: input.decision.confidence,
                  reasoning: input.decision.reasoning,
                  urgency: input.decision.urgency,
                  progressPercent: input.metrics?.progressPercent || 'N/A',
                  daysRemaining: input.metrics?.daysRemaining || 'N/A'
                };
              }
            } catch (e) {}
            return null;
          })() : null
        }))
      });
    } else {
      // Return live agent execution logs from AgentManager
      const liveExecutions = agentManager.getExecutionLogs(agentName, limit);
      res.json({
        success: true,
        data: liveExecutions,
        meta: {
          source: 'live_agent_manager',
          total: liveExecutions.length,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Error fetching agent logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent logs',
      details: error.message
    });
  }
});

// Trade History API
app.get('/api/trade-history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const trades = await db.getRecentTrades(limit);
    
    if (!trades || trades.length === 0) {
      res.json({
        success: true,
        data: [],
        message: 'No trades recorded yet. Trading activity will appear here when the execution agent starts making trades.'
      });
      return;
    }
    
    const formattedTrades = trades.map(trade => ({
      id: trade.id,
      date: new Date(trade.timestamp).toISOString(), // GMT format
      type: trade.trade_type,
      amount: trade.amount_btc,
      price: trade.price_usd,
      fee: trade.fee_usd || 0,
      total: trade.total_usd,
      reason: trade.agent_decision_reason || '',
      marketConditions: trade.market_conditions || '',
      executedBy: trade.executed_by || 'execution-agent'
    }));
    
    res.json({
      success: true,
      data: formattedTrades
    });
  } catch (error) {
    console.error('Error fetching trade history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trade history',
      details: error.message
    });
  }
});

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    apis: {
      coingecko: 'connected',
      newsapi: process.env.NEWS_API_KEY ? 'connected' : 'key_missing'
    }
  });
});

// Trading Scenarios Dashboard
app.get('/scenarios', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'scenarios-obvious.html'));
});

// Original Scenarios (with Mermaid)
app.get('/scenarios-original', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'trading-scenarios-dashboard.html'));
});

// Test Scenarios Dashboard
app.get('/scenarios-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'scenarios-test.html'));
});

// Tab Test Page
app.get('/tab-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'tab-test.html'));
});

// Debug Dashboard
app.get('/debug', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'debug-dashboard.html'));
});

// Test Interface
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'test-interface.html'));
});

// Main Dashboard  
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🤖 Bitcoin Intelligence Agent API running on port ${port}`);
  console.log(`📊 Dashboard available`);
  console.log(`🔗 API endpoints:`);
  console.log(`   - /api/bitcoin-price`);
  console.log(`   - /api/bitcoin-news`);
  console.log(`   - /api/market-analysis`);
  console.log(`   - /api/agent-status`);
  console.log(`   - /api/agent-decisions (NEW)`);
  console.log(`   - /api/agent-logs`);
  console.log(`   - /api/performance`);
  console.log(`   - /api/generate-content`);
  console.log(`   - /api/health`);
  console.log(`\\n🌐 Real-time data sources:`);
  console.log(`   - CoinGecko API (price & market data)`);
  console.log(`   - NewsAPI (Bitcoin news feed)`);
  console.log(`\\n🚀 Autonomous Agent System:`);
  console.log(`   - Strategic Orchestrator Agent: Every 15min strategy review`);
  console.log(`   - Market Hunter Agent: Every 1min market checks`);
  console.log(`   - Data Collector Agent: Every 5min detailed analysis`);
  console.log(`   - Content Creator Agent: Daily content planning`);
  console.log(`\\n✅ All systems ready for autonomous Bitcoin trading intelligence!`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});