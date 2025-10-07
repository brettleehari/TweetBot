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

// The AgentManager class has been removed as it was for mock data.
// Real agent logic is handled by true-agentic-orchestrator.js
// and data is served from the database.

// The AgentManager class has been removed. Real agent logic is now database-driven.

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

// Agent Status API - Fetches real agent data from the database
app.get('/api/agent-status', async (req, res) => {
  try {
    // Fetch agent execution data from the database
    const agentExecutions = await db.getAgentExecutions(null, 100); // Get last 100 executions for all agents
    
    // Process the data to create a status summary for each agent
    const agentStatuses = {};
    agentExecutions.forEach(exec => {
      if (!agentStatuses[exec.agent_name]) {
        agentStatuses[exec.agent_name] = {
          name: exec.agent_name,
          status: 'active', // Assuming active if there are recent executions
          confidence: 0,
          decisions: 0,
          successRate: 0,
          lastDecision: new Date(0).toISOString(),
          goal: 'Dynamic Goal from Orchestrator' // Placeholder
        };
      }
      
      const agent = agentStatuses[exec.agent_name];
      agent.decisions++;
      if (exec.success) {
        agent.successRate++;
      }
      if (new Date(exec.timestamp) > new Date(agent.lastDecision)) {
        agent.lastDecision = new Date(exec.timestamp).toISOString();
        try {
          const input = JSON.parse(exec.input_data);
          agent.confidence = input.confidence || agent.confidence;
        } catch(e) { /* ignore parse error */ }
      }
    });

    // Finalize calculations
    for (const agentName in agentStatuses) {
      const agent = agentStatuses[agentName];
      agent.successRate = agent.decisions > 0 ? (agent.successRate / agent.decisions) * 100 : 0;
      agent.successRate = agent.successRate.toFixed(1);
    }

    res.json({ success: true, data: agentStatuses });
  } catch (error) {
    console.error('Error getting agent status:', error);
    res.status(500).json({ success: false, error: 'Failed to get agent status from database' });
  }
});

// Execution Agent Progress API
app.get('/api/execution-progress', async (req, res) => {
  try {
    const portfolio = await db.getLivePortfolio();
    const startingValue = 10000; // This is the initial value set in the DB
    const weeklyTarget = 0.05; // 5%

    if (!portfolio) {
      // This case should not be hit if the DB is initialized correctly
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found. Database may not be initialized.'
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
    const portfolio = await db.getLivePortfolio();
    
    if (!portfolio) {
      // This should technically not be hit if initDatabase is correct
      res.status(404).json({
        success: false,
        error: 'Portfolio not found.'
      });
    } else {
      // Calculate total profit and percentage for the response
      const initialInvestment = 10000;
      const totalProfit = portfolio.total_value_usd - initialInvestment;
      const profitPercentage = (totalProfit / initialInvestment) * 100;

      res.json({
        success: true,
        data: {
          btcHoldings: portfolio.btc_balance,
          usdBalance: portfolio.usd_balance,
          totalValue: portfolio.total_value_usd,
          totalProfit: totalProfit,
          profitPercentage: profitPercentage,
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
    // getDetailedPerformance now returns history as well
    const performanceData = await db.getDetailedPerformance();
    res.json({ success: true, data: performanceData });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance metrics',
      details: error.message
    });
  }
});

// --- SCHEDULERS ---
// Schedule portfolio snapshots every 15 minutes
setInterval(() => {
    console.log('📸 Taking portfolio snapshot...');
    db.recordPortfolioSnapshot().catch(err => {
        console.error('Failed to record portfolio snapshot:', err);
    });
}, 900000); // 15 minutes


// 🤖 Real-time Agent Decisions API
app.get('/api/agent-decisions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const agentFilter = req.query.agent;

    // Fetch decisions directly from the database log
    const decisions = await db.getAgentExecutions(agentFilter, limit);

    res.json({
      success: true,
      data: decisions.map(d => {
        try {
          const inputs = JSON.parse(d.input_data || '{}');
          return {
            id: d.id,
            timestamp: d.timestamp,
            agent: d.agent_name,
            agentName: d.agent_name,
            actionType: d.execution_type,
            action: inputs.action || 'N/A',
            confidence: inputs.confidence || 0,
            reasoning: inputs.reasoning || 'N/A',
            executed: d.success,
            portfolioValue: inputs.portfolioValue || 0
          };
        } catch (e) {
          return { id: d.id, error: 'Failed to parse decision data' };
        }
      }),
      meta: {
        total: decisions.length,
        filtered: !!agentFilter,
        agentFilter: agentFilter,
        timestamp: new Date().toISOString(),
        source: 'database'
      }
    });
  } catch (error) {
    console.error('Error fetching agent decisions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent decisions from database',
      details: error.message
    });
  }
});

// Agent Execution Logs API
app.get('/api/agent-logs', async (req, res) => {
  try {
    const agentName = req.query.agent;
    const limit = parseInt(req.query.limit) || 50;
    
    // Data is now sourced exclusively from the database
    const logs = await db.getAgentExecutions(agentName, limit);
    res.json({
      success: true,
      data: logs.map(log => {
        let details = null;
        try {
          const input = JSON.parse(log.input_data || '{}');
          details = {
            action: input.action,
            confidence: input.confidence,
            reasoning: input.reasoning,
          };
        } catch(e) { /* ignore */ }

        return {
          id: log.id,
          timestamp: new Date(log.timestamp).toISOString(),
          agent: log.agent_name,
          type: log.execution_type,
          success: log.success,
          executionTime: log.execution_time_ms,
          input: log.input_data ? JSON.parse(log.input_data) : null,
          output: log.output_data ? JSON.parse(log.output_data) : null,
          error: log.error_message,
          details: details
        };
      }),
      meta: {
        source: 'database',
        total: logs.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching agent logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent logs from database',
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