import express from 'express';
import path from 'path';

const app = express();
const port = 3000;

// Serve static files from public directory
app.use(express.static('public'));
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Mock API Routes
app.get('/api/bitcoin-price', (req, res) => {
  const mockPrice = {
    price: 95000 + Math.random() * 10000, // Random price between 95k-105k
    change24h: (Math.random() - 0.5) * 10, // Random change between -5% to +5%
    timestamp: Date.now()
  };
  
  res.json({ success: true, data: mockPrice });
});

app.get('/api/bitcoin-news', (req, res) => {
  const mockNews = [
    {
      title: "Bitcoin Hits New All-Time High as Institutional Adoption Grows",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: "CoinDesk"
    },
    {
      title: "Major Investment Fund Allocates 5% to Bitcoin",
      url: "#", 
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      source: "Bloomberg"
    },
    {
      title: "Bitcoin Network Hash Rate Reaches Record Levels",
      url: "#",
      publishedAt: new Date(Date.now() - 7200000).toISOString(), 
      source: "CoinTelegraph"
    },
    {
      title: "Central Bank Digital Currency Development Accelerates",
      url: "#",
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      source: "Reuters"
    },
    {
      title: "Bitcoin Mining Energy Usage Drops 15% Quarter-over-Quarter", 
      url: "#",
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      source: "The Block"
    }
  ];
  
  res.json({ success: true, data: mockNews });
});

app.get('/api/market-analysis', (req, res) => {
  const mockAnalysis = {
    sentiment: "Bullish",
    confidence: 0.78,
    trendDirection: "Upward",
    volatility: "Moderate",
    support: 94000,
    resistance: 107000,
    keyFactors: [
      "Institutional buying pressure",
      "Positive regulatory developments", 
      "Strong network fundamentals",
      "Increasing adoption metrics"
    ],
    prediction: "Short-term consolidation followed by potential breakout"
  };
  
  res.json({ success: true, data: mockAnalysis });
});

app.get('/api/agent-status', (req, res) => {
  res.json({
    success: true,
    data: {
      dataCollector: { status: 'active', name: 'Data Collection Agent' },
      marketAnalyzer: { status: 'active', name: 'Market Analyzer Agent' },
      contentCreator: { status: 'active', name: 'Content Creator Agent' },
      socialPublisher: { status: 'limited', name: 'Social Publisher Agent', note: 'Demo mode - Twitter posting disabled' }
    }
  });
});

app.get('/api/generate-content', (req, res) => {
  const mockContent = {
    dailySummary: {
      content: "🚀 Bitcoin continues its strong momentum today, trading above $100K. Market sentiment remains bullish with increasing institutional interest. Key support at $94K, resistance at $107K. #Bitcoin #Crypto",
      type: "daily_summary"
    },
    priceAlert: {
      content: "⚡ PRICE ALERT: Bitcoin breaks through $100,000! Strong buying pressure continues as institutional adoption accelerates. Watch for potential continuation to $107K resistance. #Bitcoin #PriceAlert",
      type: "price_alert" 
    },
    marketInsight: {
      content: "📊 Market Analysis: Bitcoin's network fundamentals remain strong with hash rate at ATH. Current consolidation phase may lead to next leg up. Key levels: Support $94K, Resistance $107K. #MarketAnalysis",
      type: "market_insight"
    }
  };
  
  res.json({ success: true, data: mockContent });
});

// Start server
app.listen(port, () => {
  console.log(`🤖 Bitcoin Intelligence Agent API running on port ${port}`);
  console.log(`📊 Dashboard available at http://localhost:${port}`);
  console.log(`🔗 API endpoints:`);
  console.log(`   - http://localhost:${port}/api/bitcoin-price`);
  console.log(`   - http://localhost:${port}/api/bitcoin-news`);
  console.log(`   - http://localhost:${port}/api/market-analysis`);
  console.log(`   - http://localhost:${port}/api/agent-status`);
  console.log(`   - http://localhost:${port}/api/generate-content`);
});