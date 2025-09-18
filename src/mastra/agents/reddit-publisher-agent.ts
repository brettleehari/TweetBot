import { Agent } from './Agent.js';
import { redditApi } from '../tools/reddit-api.js';
import { redditContentFormatter } from '../tools/reddit-content-formatter.js';
import { redditEngagementTracker } from '../tools/reddit-engagement-tracker.js';
import { analyticsCollector } from '../tools/analytics-collector.js';

export interface RedditPostContent {
  title: string;
  text: string;
  subreddit: string;
}

export interface RedditPostResult {
  success: boolean;
  postId: string;
  url: string;
  subreddit: string;
}

export class RedditPublisherAgent extends Agent {
  constructor() {
    super('reddit-publisher', {
      reddit: redditApi,
      formatter: redditContentFormatter,
      engagementTracker: redditEngagementTracker,
      analytics: analyticsCollector,
    });
  }

  async publishPost(content: RedditPostContent, priority: 'normal' | 'urgent' = 'normal'): Promise<RedditPostResult> {
    try {
      const postData = await this.tools.reddit.post(content.subreddit, content.title, content.text);
      
      await this.tools.engagementTracker.trackPost(postData.id);
      await this.logPublication(postData, content);
      
      return {
        success: true,
        postId: postData.id,
        url: postData.url,
        subreddit: content.subreddit,
      };
    } catch (error) {
      await this.handlePublicationError(error, content, priority);
      throw error;
    }
  }

  async publishBitcoinPriceAlert(price: number, change: number): Promise<RedditPostResult> {
    const formatted = this.tools.formatter.formatBitcoinPriceAlert(price, change);
    const subreddit = Math.abs(change) > 5 ? 'BitcoinMarkets' : 'Bitcoin';
    
    return this.publishPost({
      title: formatted.title,
      text: formatted.text,
      subreddit: subreddit,
    }, Math.abs(change) > 10 ? 'urgent' : 'normal');
  }

  async publishMarketAnalysis(analysis: any): Promise<RedditPostResult> {
    const formatted = this.tools.formatter.formatMarketAnalysis(analysis);
    
    return this.publishPost({
      title: formatted.title,
      text: formatted.text,
      subreddit: 'BitcoinMarkets',
    });
  }

  async publishNewsDigest(news: any[]): Promise<RedditPostResult> {
    const formatted = this.tools.formatter.formatNewsDigest(news);
    
    return this.publishPost({
      title: formatted.title,
      text: formatted.text,
      subreddit: 'CryptoCurrency',
    });
  }

  async trackEngagement(postId: string): Promise<any> {
    const stats = await this.tools.reddit.getPostStats(postId);
    
    await this.tools.analytics.record({
      postId,
      platform: 'reddit',
      timestamp: Date.now(),
      ...stats
    });
    
    return this.tools.engagementTracker.analyzePerformance(stats);
  }

  async getOptimalPostingTime(subreddit: string): Promise<string> {
    const strategy = this.tools.engagementTracker.getPostingStrategy(subreddit);
    const now = new Date();
    const hour = now.getHours();
    
    // Simple logic to pick best time based on current time
    return strategy.bestTimes.find((time: string) => {
      const timeHour = parseInt(time.split(':')[0]);
      return timeHour > hour;
    }) || strategy.bestTimes[0];
  }

  private async logPublication(postData: any, content: RedditPostContent): Promise<void> {
    console.log('Reddit post published:', {
      id: postData.id,
      url: postData.url,
      subreddit: content.subreddit,
      title: content.title.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });
  }

  private async handlePublicationError(error: any, content: RedditPostContent, priority: string): Promise<void> {
    console.error('Reddit publication failed:', {
      error: error.message,
      subreddit: content.subreddit,
      title: content.title,
      priority,
      timestamp: new Date().toISOString()
    });
    
    if (priority === 'urgent') {
      console.log('URGENT: Reddit post failed - manual intervention required');
    }
  }
}
