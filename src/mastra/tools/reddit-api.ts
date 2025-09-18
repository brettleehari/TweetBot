// Production Reddit API client tool
import axios from 'axios';

const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const USERNAME = process.env.REDDIT_USERNAME;
const PASSWORD = process.env.REDDIT_PASSWORD;
const USER_AGENT = 'BitcoinBot/1.0.0';

let accessToken: string | null = null;

export const redditApi = {
  async authenticate(): Promise<string> {
    if (accessToken) return accessToken;
    
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      new URLSearchParams({
        grant_type: 'password',
        username: USERNAME!,
        password: PASSWORD!,
      }),
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    accessToken = response.data.access_token;
    return accessToken!;
  },

  async post(subreddit: string, title: string, text: string): Promise<{ id: string; url: string }> {
    const token = await this.authenticate();
    
    const response = await axios.post(
      'https://oauth.reddit.com/api/submit',
      new URLSearchParams({
        sr: subreddit,
        kind: 'self',
        title: title,
        text: text,
        api_type: 'json',
      }),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    const data = response.data.json.data;
    return {
      id: data.id,
      url: data.url,
    };
  },

  async getPostStats(postId: string): Promise<any> {
    const token = await this.authenticate();
    
    const response = await axios.get(
      `https://oauth.reddit.com/api/info?id=t3_${postId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': USER_AGENT,
        },
      }
    );
    
    const post = response.data.data.children[0].data;
    return {
      upvotes: post.ups,
      downvotes: post.downs,
      score: post.score,
      comments: post.num_comments,
      upvote_ratio: post.upvote_ratio,
    };
  },

  async comment(postId: string, text: string): Promise<{ id: string }> {
    const token = await this.authenticate();
    
    const response = await axios.post(
      'https://oauth.reddit.com/api/comment',
      new URLSearchParams({
        thing_id: `t3_${postId}`,
        text: text,
        api_type: 'json',
      }),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    return { id: response.data.json.data.things[0].data.id };
  },
};
