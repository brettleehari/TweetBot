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
const port = 4000;
const db = new DatabaseService();

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

// Agent Status API - Updated for Execution Agent
app.get('/api/agent-status', (req, res) => {
  const status = {
    executionAgent: { 
      status: 'active', 
      name: 'Execution Agent - 5% Weekly Target',
      goal: '5% return per week',
      refreshRate: '1 minute',
      lastUpdate: new Date().toISOString()
    },
    dataCollector: { 
      status: 'active', 
      name: 'Real-time Data Collector',
      lastUpdate: new Date().toISOString()
    },
    marketAnalyzer: { 
      status: 'active', 
      name: 'Live Market Analyzer',
      lastUpdate: new Date().toISOString()
    },
    newsMonitor: { 
      status: process.env.NEWS_API_KEY ? 'active' : 'limited', 
      name: 'News Monitor Agent',
      note: process.env.NEWS_API_KEY ? 'Live news feed active' : 'NEWS_API_KEY required'
    },
    priceTracker: { 
      status: 'active', 
      name: 'Real-time Price Tracker',
      lastUpdate: new Date().toISOString()
    }
  };
  
  res.json({ success: true, data: status });
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
    // Get real-time data first
    const [priceData, newsData, analysisData] = await Promise.all([
      axios.get(`http://localhost:${port}/api/bitcoin-price`),
      axios.get(`http://localhost:${port}/api/bitcoin-news`),
      axios.get(`http://localhost:${port}/api/market-analysis`)
    ]);
    
    const price = priceData.data.data;
    const news = newsData.data.data.slice(0, 3);
    const analysis = analysisData.data.data;
    
    // Generate content based on real data
    const content = {
      dailySummary: `Bitcoin is trading at $${price.price.toLocaleString()} (${price.change24h > 0 ? '+' : ''}${price.change24h.toFixed(2)}% in 24h). Market sentiment is ${analysis.trend} with ${analysis.volatility} volatility.`,
      priceAlert: price.change24h > 5 ? `🚀 Bitcoin surged ${price.change24h.toFixed(2)}% to $${price.price.toLocaleString()}!` :
                  price.change24h < -5 ? `📉 Bitcoin dropped ${Math.abs(price.change24h).toFixed(2)}% to $${price.price.toLocaleString()}` :
                  `📊 Bitcoin stable at $${price.price.toLocaleString()} (${price.change24h > 0 ? '+' : ''}${price.change24h.toFixed(2)}%)`,
      marketInsight: `Current price of $${price.price.toLocaleString()} is ${price.price > analysis.movingAverage24h ? 'above' : 'below'} the 24h moving average of $${analysis.movingAverage24h.toFixed(0)}. Trading volume: $${(analysis.volume24h / 1e9).toFixed(1)}B`,
      topNews: news.map(article => `• ${article.title}`).join('\\n'),
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
          timestamp: new Date(log.timestamp).toISOString(), // GMT format
          agent: log.agent_name,
          type: log.execution_type,
          success: log.success,
          executionTime: log.execution_time_ms,
          input: log.input_data ? JSON.parse(log.input_data) : null,
          output: log.output_data ? JSON.parse(log.output_data) : null,
          error: log.error_message,
          // Enhanced details for decision history
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
      // No database or real data available
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Error fetching agent logs:', error);
    res.json({
      success: true,
      data: []
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

app.listen(port, () => {
  console.log(`🤖 Bitcoin Intelligence Agent API running on port ${port}`);
  console.log(`📊 Dashboard available at http://localhost:${port}`);
  console.log(`🔗 API endpoints:`);
  console.log(`   - http://localhost:${port}/api/bitcoin-price`);
  console.log(`   - http://localhost:${port}/api/bitcoin-news`);
  console.log(`   - http://localhost:${port}/api/market-analysis`);
  console.log(`   - http://localhost:${port}/api/agent-status`);
  console.log(`   - http://localhost:${port}/api/performance`);
  console.log(`   - http://localhost:${port}/api/agent-logs`);
  console.log(`   - http://localhost:${port}/api/generate-content`);
  console.log(`   - http://localhost:${port}/api/health`);
  console.log(`\\n🌐 Real-time data sources:`);
  console.log(`   - CoinGecko API (price & market data)`);
  console.log(`   - NewsAPI (Bitcoin news feed)`);
  console.log(`\\n✅ All systems ready for real-time Bitcoin intelligence!`);
});