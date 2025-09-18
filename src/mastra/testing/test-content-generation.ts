#!/usr/bin/env node

import { DataCollectorAgent } from '../agents/data-collector-agent.js';
import { MarketAnalyzerAgent } from '../agents/market-analyzer-agent.js';
import { ContentCreatorAgent } from '../agents/content-creator-agent.js';

interface TestResults {
  timestamp: string;
  bitcoinPrice: any;
  newsData: any[];
  marketAnalysis: any;
  generatedContent: {
    dailySummary: any;
    priceAlert: any;
    newsAlert: any;
    marketInsight: any;
  };
}

class ContentTestingGround {
  private dataCollector: DataCollectorAgent;
  private marketAnalyzer: MarketAnalyzerAgent;
  private contentCreator: ContentCreatorAgent;

  constructor() {
    this.dataCollector = new DataCollectorAgent();
    this.marketAnalyzer = new MarketAnalyzerAgent();
    this.contentCreator = new ContentCreatorAgent();
  }

  async runFullTest(): Promise<TestResults> {
    console.log('🧪 Starting Content Generation Test...\n');

    try {
      // Step 1: Collect Data
      console.log('📊 Step 1: Collecting Market Data...');
      const bitcoinPrice = await this.dataCollector.fetchBitcoinPrice();
      console.log(`✅ Bitcoin Price: $${bitcoinPrice.price.toLocaleString()}`);

      const newsData = await this.dataCollector.fetchBitcoinNews();
      console.log(`✅ News Articles: ${newsData.length} articles collected\n`);

      // Step 2: Analyze Market
      console.log('🔍 Step 2: Analyzing Market...');
      const priceHistory = await this.generateMockPriceHistory(bitcoinPrice.price);
      const marketAnalysis = await this.marketAnalyzer.analyzeMarket(newsData, bitcoinPrice, priceHistory);
      console.log('✅ Market Analysis Complete\n');

      // Step 3: Generate Content
      console.log('✍️ Step 3: Generating Content...');
      const [dailySummary, priceAlert, newsAlert, marketInsight] = await Promise.all([
        this.contentCreator.createDailySummary(marketAnalysis),
        this.contentCreator.createPriceAlert(bitcoinPrice, marketAnalysis),
        this.contentCreator.createNewsAlert(newsData[0], marketAnalysis.impactScore),
        this.contentCreator.createMarketInsight(marketAnalysis)
      ]);

      console.log('✅ All Content Generated\n');

      const results: TestResults = {
        timestamp: new Date().toISOString(),
        bitcoinPrice,
        newsData,
        marketAnalysis,
        generatedContent: {
          dailySummary,
          priceAlert,
          newsAlert,
          marketInsight
        }
      };

      this.displayResults(results);
      return results;

    } catch (error) {
      console.error('❌ Test Failed:', error);
      throw error;
    }
  }

  private async generateMockPriceHistory(currentPrice: number): Promise<number[]> {
    // Generate realistic price history for the last 24 hours
    const history: number[] = [];
    const volatility = 0.02; // 2% volatility
    
    for (let i = 23; i >= 0; i--) {
      const randomChange = (Math.random() - 0.5) * volatility;
      const price = currentPrice * (1 + randomChange * (i / 24));
      history.push(price);
    }
    
    return history;
  }

  private displayResults(results: TestResults): void {
    console.log('\n' + '='.repeat(80));
    console.log('📋 CONTENT GENERATION TEST RESULTS');
    console.log('='.repeat(80));

    // Market Data Summary
    console.log('\n📊 MARKET DATA:');
    console.log(`• Bitcoin Price: $${results.bitcoinPrice.price.toLocaleString()}`);
    console.log(`• News Articles: ${results.newsData.length}`);
    console.log(`• Analysis Timestamp: ${results.timestamp}`);

    // Market Analysis
    console.log('\n🔍 MARKET ANALYSIS:');
    console.log(`• Sentiment: ${results.marketAnalysis.sentiment.overall} (${results.marketAnalysis.sentiment.score})`);
    console.log(`• Price Trend: ${results.marketAnalysis.priceTrend.direction}`);
    console.log(`• Volatility: ${results.marketAnalysis.volatility.level}`);
    console.log(`• Trading Signal: ${results.marketAnalysis.signals.primary.action} (${results.marketAnalysis.signals.primary.confidence}% confidence)`);
    console.log(`• Impact Score: ${results.marketAnalysis.impactScore}/100`);

    // Generated Content
    console.log('\n✍️ GENERATED CONTENT:');
    
    console.log('\n1️⃣ DAILY SUMMARY:');
    console.log(`Engagement Score: ${results.generatedContent.dailySummary.engagementPrediction}/100`);
    console.log('─'.repeat(40));
    console.log(results.generatedContent.dailySummary.content);
    if (results.generatedContent.dailySummary.hashtags?.length > 0) {
      console.log(`\nHashtags: ${results.generatedContent.dailySummary.hashtags.join(' ')}`);
    }

    console.log('\n2️⃣ PRICE ALERT:');
    console.log(`Engagement Score: ${results.generatedContent.priceAlert.engagementPrediction}/100`);
    console.log('─'.repeat(40));
    console.log(results.generatedContent.priceAlert.content);
    if (results.generatedContent.priceAlert.hashtags?.length > 0) {
      console.log(`\nHashtags: ${results.generatedContent.priceAlert.hashtags.join(' ')}`);
    }

    console.log('\n3️⃣ NEWS ALERT:');
    console.log(`Engagement Score: ${results.generatedContent.newsAlert.engagementPrediction}/100`);
    console.log('─'.repeat(40));
    console.log(results.generatedContent.newsAlert.content);
    if (results.generatedContent.newsAlert.hashtags?.length > 0) {
      console.log(`\nHashtags: ${results.generatedContent.newsAlert.hashtags.join(' ')}`);
    }

    console.log('\n4️⃣ MARKET INSIGHT:');
    console.log(`Engagement Score: ${results.generatedContent.marketInsight.engagementPrediction}/100`);
    console.log('─'.repeat(40));
    console.log(results.generatedContent.marketInsight.content);
    if (results.generatedContent.marketInsight.hashtags?.length > 0) {
      console.log(`\nHashtags: ${results.generatedContent.marketInsight.hashtags.join(' ')}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎯 PERFORMANCE SUMMARY:');
    const avgEngagement = [
      results.generatedContent.dailySummary.engagementPrediction,
      results.generatedContent.priceAlert.engagementPrediction,
      results.generatedContent.newsAlert.engagementPrediction,
      results.generatedContent.marketInsight.engagementPrediction
    ].reduce((a, b) => a + b, 0) / 4;

    console.log(`• Average Engagement Score: ${avgEngagement.toFixed(1)}/100`);
    console.log(`• Content Pieces Generated: 4`);
    console.log(`• Trading Signal Confidence: ${results.marketAnalysis.signals.primary.confidence}%`);
    console.log(`• Market Impact Score: ${results.marketAnalysis.impactScore}/100`);
    console.log('='.repeat(80));
  }

  async runQuickTest(): Promise<void> {
    console.log('⚡ Running Quick Content Test...\n');

    try {
      // Use mock data for faster testing
      const mockPrice = { price: 109584, change24h: 2.1 };
      const mockNews = [
        {
          title: "Major Bitcoin ETF sees record inflows as institutional adoption grows",
          description: "BlackRock's Bitcoin ETF recorded its largest single-day inflow...",
          source: "CoinDesk",
          publishedAt: new Date().toISOString()
        }
      ];
      
      const mockAnalysis = {
        sentiment: { overall: 'bullish', score: 0.7 },
        priceTrend: { direction: 'bullish', strength: 'strong' },
        volatility: { level: 'medium', value: 0.025 },
        signals: { primary: { action: 'BUY', confidence: 85 } },
        impactScore: 75
      };

      console.log('✍️ Generating content with mock data...');
      const [dailySummary, priceAlert] = await Promise.all([
        this.contentCreator.createDailySummary(mockAnalysis),
        this.contentCreator.createPriceAlert(mockPrice, mockAnalysis)
      ]);

      console.log('\n📋 QUICK TEST RESULTS:');
      console.log('─'.repeat(50));
      console.log('\n📊 Daily Summary:');
      console.log(`Engagement: ${dailySummary.engagementPrediction}/100`);
      console.log(dailySummary.content);

      console.log('\n🚨 Price Alert:');
      console.log(`Engagement: ${priceAlert.engagementPrediction}/100`);
      console.log(priceAlert.content);
      console.log('─'.repeat(50));

    } catch (error) {
      console.error('❌ Quick test failed:', error);
    }
  }

  async testSpecificContent(contentType: string): Promise<void> {
    console.log(`🎯 Testing ${contentType} content generation...\n`);

    try {
      // Collect real data
      const bitcoinPrice = await this.dataCollector.fetchBitcoinPrice();
      const newsData = await this.dataCollector.fetchBitcoinNews();
      const priceHistory = await this.generateMockPriceHistory(bitcoinPrice.price);
      const marketAnalysis = await this.marketAnalyzer.analyzeMarket(newsData, bitcoinPrice, priceHistory);

      let content: any;
      switch (contentType.toLowerCase()) {
        case 'daily':
        case 'summary':
          content = await this.contentCreator.createDailySummary(marketAnalysis);
          break;
        case 'price':
        case 'alert':
          content = await this.contentCreator.createPriceAlert(bitcoinPrice, marketAnalysis);
          break;
        case 'news':
          content = await this.contentCreator.createNewsAlert(newsData[0], marketAnalysis.impactScore);
          break;
        case 'insight':
        case 'market':
          content = await this.contentCreator.createMarketInsight(marketAnalysis);
          break;
        default:
          throw new Error(`Unknown content type: ${contentType}`);
      }

      console.log(`📋 ${contentType.toUpperCase()} CONTENT TEST:`);
      console.log('─'.repeat(50));
      console.log(`Engagement Score: ${content.engagementPrediction}/100`);
      console.log(`Content Type: ${content.type}`);
      console.log('\nGenerated Content:');
      console.log(content.content);
      if (content.hashtags?.length > 0) {
        console.log(`\nHashtags: ${content.hashtags.join(' ')}`);
      }
      console.log('─'.repeat(50));

    } catch (error) {
      console.error('❌ Content test failed:', error);
    }
  }
}

// CLI Interface
async function main() {
  const tester = new ContentTestingGround();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('🧪 Bitcoin Intelligence Content Testing Ground');
    console.log('Usage: npm run test-content [command] [options]\n');
    console.log('Commands:');
    console.log('  full       - Run complete test with real data');
    console.log('  quick      - Run quick test with mock data');
    console.log('  daily      - Test daily summary generation');
    console.log('  price      - Test price alert generation');
    console.log('  news       - Test news alert generation');
    console.log('  insight    - Test market insight generation');
    return;
  }

  const command = args[0].toLowerCase();

  switch (command) {
    case 'full':
      await tester.runFullTest();
      break;
    case 'quick':
      await tester.runQuickTest();
      break;
    case 'daily':
    case 'price':
    case 'news':
    case 'insight':
      await tester.testSpecificContent(command);
      break;
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Use: npm run test-content to see available commands');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ContentTestingGround };
