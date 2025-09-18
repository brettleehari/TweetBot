import { Agent } from './Agent.js';
import { geminiSentiment } from '../tools/gemini-sentiment.js';
import { impactScorer } from '../tools/impact-scorer.js';
import { trendDetector } from '../tools/trend-detector.js';
import { signalGenerator } from '../tools/signal-generator.js';

export interface MarketAnalysis {
  sentiment: {
    overall: number;
    confidence: number;
    analysis: string;
  };
  impactScore: number;
  priceTrend: any;
  volatility: any;
  signals: any;
  timestamp: string;
}

export class MarketAnalyzerAgent extends Agent {
  constructor() {
    super('market-analyzer', {
      gemini: geminiSentiment,
      impactScorer: impactScorer,
      trendDetector: trendDetector,
      signalGenerator: signalGenerator,
    });
  }

  async analyzeSentiment(newsItems: any[]): Promise<any> {
    const sentimentPrompt = `
      Analyze the sentiment of these Bitcoin news articles.
      Rate overall sentiment from -1 (very bearish) to +1 (very bullish).
      Consider: regulatory changes, adoption, technical developments, market sentiment.
      Respond with just a number between -1 and 1, followed by a brief explanation.
    `;
    
    const analysis = await this.tools.gemini.analyze(sentimentPrompt, newsItems);
    
    // Use the structured response from Gemini
    return {
      overall: analysis.sentiment,
      score: analysis.score,
      confidence: analysis.confidence,
      analysis: analysis.summary,
      keyFactors: analysis.keyFactors,
      newsCount: newsItems.length
    };
  }
  
  async scoreImpact(newsItems: any[], priceData: any): Promise<number> {
    const scores = await Promise.all(
      newsItems.map(item => this.tools.impactScorer.scoreNews(item, priceData))
    );
    
    // Return weighted average, giving more weight to higher scores
    const totalScore = scores.reduce((acc, score) => acc + score, 0);
    return Math.round(totalScore / scores.length);
  }
  
  async analyzeMarket(newsItems: any[], priceData: any, priceHistory: number[] = []): Promise<MarketAnalysis> {
    console.log('🔍 Starting market analysis...');
    
    // Run analyses in parallel
    const [sentiment, impactScore, priceTrend, volatility] = await Promise.all([
      this.analyzeSentiment(newsItems),
      this.scoreImpact(newsItems, priceData),
      this.tools.trendDetector.detectPriceTrends(priceHistory.length > 0 ? priceHistory : [priceData.price]),
      this.tools.trendDetector.detectVolatility(priceHistory.length > 0 ? priceHistory : [priceData.price])
    ]);
    
    // Generate comprehensive analysis
    const analysisData = {
      sentiment,
      impactScore,
      priceTrend,
      volatility
    };
    
    const signals = await this.tools.signalGenerator.generateTradingSignals(analysisData);
    
    console.log('✅ Market analysis complete');
    
    return {
      sentiment,
      impactScore,
      priceTrend,
      volatility,
      signals,
      timestamp: new Date().toISOString()
    };
  }
}
