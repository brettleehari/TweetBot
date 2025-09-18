import { ContentCreatorAgent } from './content-creator-agent.js';

async function main() {
  const agent = new ContentCreatorAgent();
  
  console.log('=== Content Creator Agent Demo ===\n');

  // Mock analysis data
  const mockAnalysis = {
    priceData: { price: 109584, change: 2.1 },
    sentiment: { overall: 0.6 },
    priceTrend: { trend: 'bullish', confidence: 0.8 },
    volatility: { volatility: 'medium', percentage: 3.2 },
    signals: {
      overallRecommendation: 'BUY',
      riskLevel: 'MEDIUM',
      signals: [
        { type: 'BUY', reason: 'Strong bullish trend detected' }
      ]
    },
    topNews: { title: 'Major Bitcoin ETF sees record inflows' }
  };

  const mockPriceData = { price: 109584, change: 5.2 };
  const mockNewsItem = {
    title: 'SEC Approves Bitcoin ETF with Record Volume',
    source: { name: 'CoinDesk' }
  };

  try {
    // Test 1: Daily Summary
    console.log('1. Creating Daily Summary...');
    const dailySummary = await agent.createDailySummary(mockAnalysis);
    console.log('📊 Daily Summary:');
    console.log(dailySummary.content);
    console.log('Engagement Score:', dailySummary.engagementPrediction.engagementScore);
    console.log('Predicted Likes:', dailySummary.engagementPrediction.predictedLikes);
    console.log('---\n');

    // Test 2: Price Alert
    console.log('2. Creating Price Alert...');
    const priceAlert = await agent.createPriceAlert(mockPriceData, mockAnalysis);
    console.log('🚨 Price Alert:');
    console.log(priceAlert.content);
    console.log('Engagement Score:', priceAlert.engagementPrediction.engagementScore);
    console.log('---\n');

    // Test 3: News Alert
    console.log('3. Creating News Alert...');
    const newsAlert = await agent.createNewsAlert(mockNewsItem, 85);
    console.log('📰 News Alert:');
    console.log(newsAlert.content);
    console.log('Engagement Score:', newsAlert.engagementPrediction.engagementScore);
    console.log('---\n');

    // Test 4: Market Insight
    console.log('4. Creating Market Insight...');
    const marketInsight = await agent.createMarketInsight(mockAnalysis);
    console.log('🔍 Market Insight:');
    console.log(marketInsight.content);
    console.log('Engagement Score:', marketInsight.engagementPrediction.engagementScore);
    console.log('---\n');

    // Test 5: Content Optimization
    console.log('5. Optimizing Content...');
    const optimized = await agent.optimizeContent(dailySummary);
    console.log('⚡ Optimized Daily Summary:');
    console.log(optimized.content);
    
    if (optimized.engagementPrediction.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      optimized.engagementPrediction.recommendations.forEach((rec: string, i: number) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }

  } catch (error) {
    console.error('❌ Content creation failed:', error instanceof Error ? error.message : String(error));
  }

  console.log('\n=== Content Creator Agent Ready! ===');
}

main().catch(console.error);
