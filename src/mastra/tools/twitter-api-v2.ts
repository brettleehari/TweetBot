// Production Twitter API v2 client tool with OAuth 1.0a
import { TwitterApi } from 'twitter-api-v2';

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_KEY_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
});

// Read-write client for posting
const rwClient = twitterClient.readWrite;

export const twitterApiV2 = {
  async post(content: string): Promise<{ id: string; text: string }> {
    const tweet = await rwClient.v2.tweet(content);
    return {
      id: tweet.data.id,
      text: tweet.data.text
    };
  },

  async getMetrics(tweetId: string): Promise<any> {
    const tweet = await twitterClient.v2.singleTweet(tweetId, {
      'tweet.fields': ['public_metrics']
    });
    return tweet.data.public_metrics;
  },

  async searchTweets(query: string, maxResults: number = 10): Promise<any[]> {
    const tweets = await twitterClient.v2.search(query, {
      max_results: maxResults,
      'tweet.fields': ['created_at', 'author_id', 'public_metrics']
    });
    return tweets.data?.data || [];
  }
};
