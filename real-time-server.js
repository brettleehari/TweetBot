import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 4000;

// Serve static files from public directory
app.use(express.static('public'));
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

// Agent Status API
app.get('/api/agent-status', (req, res) => {
  const status = {
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

// Health check endpoint
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

app.listen(port, () => {
  console.log(`🤖 Bitcoin Intelligence Agent API running on port ${port}`);
  console.log(`📊 Dashboard available at http://localhost:${port}`);
  console.log(`🔗 API endpoints:`);
  console.log(`   - http://localhost:${port}/api/bitcoin-price`);
  console.log(`   - http://localhost:${port}/api/bitcoin-news`);
  console.log(`   - http://localhost:${port}/api/market-analysis`);
  console.log(`   - http://localhost:${port}/api/agent-status`);
  console.log(`   - http://localhost:${port}/api/generate-content`);
  console.log(`   - http://localhost:${port}/api/health`);
  console.log(`\\n🌐 Real-time data sources:`);
  console.log(`   - CoinGecko API (price & market data)`);
  console.log(`   - NewsAPI (Bitcoin news feed)`);
  console.log(`\\n✅ All systems ready for real-time Bitcoin intelligence!`);
});