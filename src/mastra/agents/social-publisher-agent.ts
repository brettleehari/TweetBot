import { Agent } from './Agent.js';
import { twitterApiV2 } from '../tools/twitter-api-v2.js';
import { engagementTracker } from '../tools/engagement-tracker.js';
import { postingScheduler } from '../tools/posting-scheduler.js';
import { analyticsCollector } from '../tools/analytics-collector.js';

export interface TweetContent {
  text: string;
  hashtags?: string[];
}

export interface TweetResult {
  success: boolean;
  tweetId: string;
  scheduledTracking: boolean;
}

export class SocialPublisherAgent extends Agent {
  constructor() {
    super('social-publisher', {
      twitter: twitterApiV2,
      engagementTracker: engagementTracker,
      scheduler: postingScheduler,
      analytics: analyticsCollector,
    });
  }

  async publishTweet(content: TweetContent, priority: 'normal' | 'urgent' = 'normal'): Promise<TweetResult> {
    try {
      const tweetText = content.hashtags 
        ? `${content.text} ${content.hashtags.join(' ')}`
        : content.text;

      const tweetData = await this.tools.twitter.post(tweetText);
      
      await this.tools.engagementTracker.scheduleTracking(tweetData.id);
      await this.logPublication(tweetData, content);
      
      return {
        success: true,
        tweetId: tweetData.id,
        scheduledTracking: true
      };
    } catch (error) {
      await this.handlePublicationError(error, content, priority);
      throw error;
    }
  }
  
  async trackEngagement(tweetId: string): Promise<any> {
    const metrics = await this.tools.twitter.getMetrics(tweetId);
    
    await this.tools.analytics.record({
      tweetId,
      timestamp: Date.now(),
      ...metrics
    });
    
    return this.tools.engagementTracker.analyzePerformance(metrics);
  }

  async schedulePost(content: TweetContent, time?: string): Promise<any> {
    const scheduledTime = time || await this.tools.scheduler.getOptimalPostTime();
    return this.tools.scheduler.schedulePost(content.text, scheduledTime);
  }

  private async logPublication(tweetData: any, content: TweetContent): Promise<void> {
    console.log('Tweet published:', {
      id: tweetData.id,
      text: tweetData.text,
      timestamp: new Date().toISOString()
    });
  }

  private async handlePublicationError(error: any, content: TweetContent, priority: string): Promise<void> {
    console.error('Publication failed:', {
      error: error.message,
      content: content.text,
      priority,
      timestamp: new Date().toISOString()
    });
    
    if (priority === 'urgent') {
      // In production, this would trigger alerts
      console.log('URGENT: Tweet publication failed - manual intervention required');
    }
  }
}
