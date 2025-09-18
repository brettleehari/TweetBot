import express from 'express';
import { DataCollectorAgent } from './mastra/agents/data-collector-agent.js';
import { MarketAnalyzerAgent } from './mastra/agents/market-analyzer-agent.js';
import { ContentCreatorAgent } from './mastra/agents/content-creator-agent.js';
import { SocialPublisherAgent } from './mastra/agents/social-publisher-agent.js';
import { ContentTestingGround } from './mastra/testing/test-content-generation.js';

const app = express();
const port = 3000;

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Initialize agents
const dataCollector = new DataCollectorAgent();
const marketAnalyzer = new MarketAnalyzerAgent();
const contentCreator = new ContentCreatorAgent();
const socialPublisher = new SocialPublisherAgent();
const testingGround = new ContentTestingGround();

// API Routes
app.get('/api/bitcoin-price', async (req, res) => {
  try {
    const price = await dataCollector.fetchBitcoinPrice();
    res.json({ success: true, data: price });
  } catch (error) {
    res.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/bitcoin-news', async (req, res) => {
  try {
    const news = await dataCollector.fetchBitcoinNews();
    res.json({ success: true, data: news.slice(0, 5) }); // Limit to 5 articles
  } catch (error) {
    res.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/market-analysis', async (req, res) => {
  try {
    const [price, news] = await Promise.all([
      dataCollector.fetchBitcoinPrice(),
      dataCollector.fetchBitcoinNews()
    ]);
    
    const analysis = await marketAnalyzer.analyzeMarket(news.slice(0, 3), price, [105000, 107000, 108500, price.price]);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/generate-content', async (req, res) => {
  try {
    const [price, news] = await Promise.all([
      dataCollector.fetchBitcoinPrice(),
      dataCollector.fetchBitcoinNews()
    ]);
    
    const analysis = await marketAnalyzer.analyzeMarket(news.slice(0, 3), price, [105000, 107000, 108500, price.price]);
    
    const [dailySummary, priceAlert, marketInsight] = await Promise.all([
      contentCreator.createDailySummary({ ...analysis, priceData: price }),
      contentCreator.createPriceAlert(price, analysis),
      contentCreator.createMarketInsight(analysis)
    ]);
    
    res.json({
      success: true,
      data: {
        dailySummary,
        priceAlert,
        marketInsight
      }
    });
  } catch (error) {
    res.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/agent-status', (req, res) => {
  res.json({
    success: true,
    data: {
      dataCollector: { status: 'active', name: 'Data Collection Agent' },
      marketAnalyzer: { status: 'active', name: 'Market Analyzer Agent' },
      contentCreator: { status: 'active', name: 'Content Creator Agent' },
      socialPublisher: { status: 'limited', name: 'Social Publisher Agent', note: 'Twitter posting disabled - needs API upgrade' }
    }
  });
});

// Testing endpoints
app.get('/api/test-full', async (req, res) => {
  try {
    const results = await testingGround.runFullTest();
    res.json({ success: true, ...results });
  } catch (error) {
    res.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/test-quick', async (req, res) => {
  try {
    // Mock data for quick testing
    const mockPrice = { price: 109584, change24h: 2.1 };
    const mockAnalysis = {
      sentiment: { overall: 'bullish', score: 0.7 },
      priceTrend: { direction: 'bullish', strength: 'strong' },
      volatility: { level: 'medium', value: 0.025 },
      signals: { primary: { action: 'BUY', confidence: 85 } },
      impactScore: 75
    };

    const [dailySummary, priceAlert] = await Promise.all([
      contentCreator.createDailySummary(mockAnalysis),
      contentCreator.createPriceAlert(mockPrice, mockAnalysis)
    ]);

    res.json({
      success: true,
      generatedContent: {
        dailySummary,
        priceAlert
      },
      marketAnalysis: mockAnalysis,
      bitcoinPrice: mockPrice
    });
  } catch (error) {
    res.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/test-daily', async (req, res) => {
  try {
    await testingGround.testSpecificContent('daily');
    // Since testSpecificContent logs to console, we'll recreate the content here
    const [price, news] = await Promise.all([
      dataCollector.fetchBitcoinPrice(),
      dataCollector.fetchBitcoinNews()
    ]);
    
    const priceHistory = Array.from({length: 24}, (_, i) => price.price * (1 + (Math.random() - 0.5) * 0.02));
    const analysis = await marketAnalyzer.analyzeMarket(news.slice(0, 3), price, priceHistory);
    const dailySummary = await contentCreator.createDailySummary(analysis);

    res.json({
      success: true,
      generatedContent: { dailySummary },
      marketAnalysis: analysis,
      bitcoinPrice: price
    });
  } catch (error) {
    res.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/test-price', async (req, res) => {
  try {
    const [price, news] = await Promise.all([
      dataCollector.fetchBitcoinPrice(),
      dataCollector.fetchBitcoinNews()
    ]);
    
    const priceHistory = Array.from({length: 24}, (_, i) => price.price * (1 + (Math.random() - 0.5) * 0.02));
    const analysis = await marketAnalyzer.analyzeMarket(news.slice(0, 3), price, priceHistory);
    const priceAlert = await contentCreator.createPriceAlert(price, analysis);

    res.json({
      success: true,
      generatedContent: { priceAlert },
      marketAnalysis: analysis,
      bitcoinPrice: price
    });
  } catch (error) {
    res.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/test-news', async (req, res) => {
  try {
    const [price, news] = await Promise.all([
      dataCollector.fetchBitcoinPrice(),
      dataCollector.fetchBitcoinNews()
    ]);
    
    const priceHistory = Array.from({length: 24}, (_, i) => price.price * (1 + (Math.random() - 0.5) * 0.02));
    const analysis = await marketAnalyzer.analyzeMarket(news.slice(0, 3), price, priceHistory);
    const newsAlert = await contentCreator.createNewsAlert(news[0], analysis.impactScore);

    res.json({
      success: true,
      generatedContent: { newsAlert },
      marketAnalysis: analysis,
      bitcoinPrice: price
    });
  } catch (error) {
    res.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/test-insight', async (req, res) => {
  try {
    const [price, news] = await Promise.all([
      dataCollector.fetchBitcoinPrice(),
      dataCollector.fetchBitcoinNews()
    ]);
    
    const priceHistory = Array.from({length: 24}, (_, i) => price.price * (1 + (Math.random() - 0.5) * 0.02));
    const analysis = await marketAnalyzer.analyzeMarket(news.slice(0, 3), price, priceHistory);
    const marketInsight = await contentCreator.createMarketInsight(analysis);

    res.json({
      success: true,
      generatedContent: { marketInsight },
      marketAnalysis: analysis,
      bitcoinPrice: price
    });
  } catch (error) {
    res.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Serve the testing page
app.get('/test', (req, res) => {
  res.sendFile('test.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`🤖 Bitcoin Intelligence Agent UI running at http://localhost:${port}`);
  console.log(`📊 Dashboard available at http://localhost:${port}`);
  console.log(`🧪 Testing Ground available at http://localhost:${port}/test`);
});
