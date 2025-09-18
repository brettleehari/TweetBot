import { MarketAnalyzerAgent } from './market-analyzer-agent.js';

async function main() {
  const agent = new MarketAnalyzerAgent();
  
  console.log('=== Market Analyzer Agent Demo ===\n');

  // Mock data for testing
  const mockNews = [
    {
      source: { name: 'CoinDesk' },
      title: 'Bitcoin ETFs See Record Inflows as Institutional Adoption Grows',
      description: 'Major financial institutions are increasing their Bitcoin exposure through ETF investments.',
      publishedAt: new Date().toISOString()
    },
    {
      source: { name: 'Decrypt' },
      title: 'SEC Approves New Bitcoin Trading Rules',
      description: 'Regulatory clarity improves as SEC establishes clearer guidelines for Bitcoin trading.',
      publishedAt: new Date().toISOString()
    },
    {
      source: { name: 'Bitcoin Magazine' },
      title: 'Bitcoin Network Hash Rate Hits All-Time High',
      description: 'Network security reaches new levels as mining participation increases globally.',
      publishedAt: new Date().toISOString()
    }
  ];

  const mockPriceData = { price: 109584.1 };
  const mockPriceHistory = [105000, 107000, 108500, 109000, 109584.1];

  try {
    // Test sentiment analysis
    console.log('1. Analyzing market sentiment...');
    const sentiment = await agent.analyzeSentiment(mockNews);
    console.log('📊 Sentiment Analysis:', sentiment, '\n');

    // Test impact scoring  
    console.log('2. Scoring news impact...');
    const impactScore = await agent.scoreImpact(mockNews, mockPriceData);
    console.log('🎯 Impact Score:', impactScore, '\n');

    // Test comprehensive market analysis
    console.log('3. Running comprehensive market analysis...');
    const fullAnalysis = await agent.analyzeMarket(mockNews, mockPriceData, mockPriceHistory);
    
    console.log('📈 Market Analysis Results:');
    console.log('- Sentiment:', fullAnalysis.sentiment.overall > 0 ? 'Bullish' : 'Bearish', `(${fullAnalysis.sentiment.overall})`);
    console.log('- Impact Score:', fullAnalysis.impactScore);
    console.log('- Price Trend:', fullAnalysis.priceTrend.trend, `(${fullAnalysis.priceTrend.confidence})`);
    console.log('- Volatility:', fullAnalysis.volatility.volatility, `(${fullAnalysis.volatility.percentage.toFixed(2)}%)`);
    console.log('- Trading Signals:', fullAnalysis.signals.signals.length);
    console.log('- Overall Recommendation:', fullAnalysis.signals.overallRecommendation);
    console.log('- Risk Level:', fullAnalysis.signals.riskLevel);

    console.log('\n📋 Generated Signals:');
    fullAnalysis.signals.signals.forEach((signal: any, index: number) => {
      console.log(`${index + 1}. ${signal.type} (${signal.strength}) - ${signal.reason}`);
    });

  } catch (error) {
    console.error('❌ Analysis failed:', error instanceof Error ? error.message : String(error));
    console.log('💡 Note: OpenAI API key may be required for full functionality');
  }

  console.log('\n=== Market Analyzer Agent Ready! ===');
}

main().catch(console.error);
