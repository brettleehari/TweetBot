import { Agent } from './Agent.js';
import { tweetComposer } from '../tools/tweet-composer.js';
import { hashtagOptimizer } from '../tools/hashtag-optimizer.js';
import { engagementPredictor } from '../tools/engagement-predictor.js';
import { contentFormatter } from '../tools/content-formatter.js';

export interface ContentTemplate {
  type: 'daily-summary' | 'price-alert' | 'news-alert' | 'market-insight';
  content: string;
  hashtags: string[];
  engagementPrediction: any;
}

export class ContentCreatorAgent extends Agent {
  constructor() {
    super('content-creator', {
      composer: tweetComposer,
      hashtagOptimizer: hashtagOptimizer,
      engagementPredictor: engagementPredictor,
      formatter: contentFormatter,
    });
  }

  async createDailySummary(analysis: any): Promise<ContentTemplate> {
    console.log('📝 Creating daily summary content...');
    
    const content = await this.tools.formatter.formatDailySummary(analysis);
    const hashtags = await this.tools.hashtagOptimizer.generateHashtags(content, analysis);
    const engagementPrediction = await this.tools.engagementPredictor.predictEngagement(content, analysis);
    
    return {
      type: 'daily-summary',
      content,
      hashtags,
      engagementPrediction
    };
  }

  async createPriceAlert(priceData: any, analysis: any): Promise<ContentTemplate> {
    console.log('🚨 Creating price alert content...');
    
    const content = await this.tools.formatter.formatPriceAlert(priceData, analysis);
    const hashtags = await this.tools.hashtagOptimizer.generateHashtags(content, analysis);
    const engagementPrediction = await this.tools.engagementPredictor.predictEngagement(content, analysis);
    
    return {
      type: 'price-alert',
      content,
      hashtags,
      engagementPrediction
    };
  }

  async createNewsAlert(newsItem: any, impactScore: number): Promise<ContentTemplate> {
    console.log('📰 Creating news alert content...');
    
    const content = await this.tools.formatter.formatNewsAlert(newsItem, impactScore);
    const hashtags = ['#Bitcoin', '#BTC', '#News', '#Crypto'];
    const engagementPrediction = await this.tools.engagementPredictor.predictEngagement(content, { impactScore });
    
    return {
      type: 'news-alert',
      content,
      hashtags,
      engagementPrediction
    };
  }

  async createMarketInsight(analysis: any): Promise<ContentTemplate> {
    console.log('🔍 Creating market insight content...');
    
    const content = await this.tools.formatter.formatMarketInsight(analysis);
    const hashtags = await this.tools.hashtagOptimizer.generateHashtags(content, analysis);
    const engagementPrediction = await this.tools.engagementPredictor.predictEngagement(content, analysis);
    
    return {
      type: 'market-insight',
      content,
      hashtags,
      engagementPrediction
    };
  }

  async optimizeContent(template: ContentTemplate): Promise<ContentTemplate> {
    console.log('⚡ Optimizing content for engagement...');
    
    let optimizedContent = await this.tools.composer.optimize(template.content, {
      maxLength: 280,
      engagementTarget: 'high',
      audienceProfile: 'crypto-investors'
    });

    // Apply engagement recommendations
    const recommendations = template.engagementPrediction.recommendations || [];
    if (recommendations.includes('Add a question to encourage engagement') && !optimizedContent.includes('?')) {
      optimizedContent += '\n\nThoughts? 🤔';
    }

    return {
      ...template,
      content: optimizedContent
    };
  }
}
