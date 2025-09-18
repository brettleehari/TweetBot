import { RedditPublisherAgent } from './reddit-publisher-agent.js';

async function main() {
  const agent = new RedditPublisherAgent();
  
  console.log('=== Reddit Publisher Agent Demo ===\n');

  // Test 1: Format Bitcoin price alert
  console.log('1. Formatting Bitcoin price alert...');
  const priceAlert = agent.tools.formatter.formatBitcoinPriceAlert(109584, 2.3);
  console.log('Title:', priceAlert.title);
  console.log('Preview:', priceAlert.text.substring(0, 100) + '...\n');

  // Test 2: Format market analysis
  console.log('2. Formatting market analysis...');
  const mockAnalysis = {
    price: 109584,
    trend: 'Bullish',
    sentiment: 'Positive',
    momentum: 'Strong',
    volume: 'Above average',
    technical: 'Bullish breakout'
  };
  const analysis = agent.tools.formatter.formatMarketAnalysis(mockAnalysis);
  console.log('Title:', analysis.title);
  console.log('Preview:', analysis.text.substring(0, 150) + '...\n');

  // Test 3: Get posting strategy
  console.log('3. Getting posting strategies...');
  const bitcoinStrategy = agent.tools.engagementTracker.getPostingStrategy('Bitcoin');
  console.log('Bitcoin subreddit strategy:', bitcoinStrategy);
  
  const marketsStrategy = agent.tools.engagementTracker.getPostingStrategy('BitcoinMarkets');
  console.log('BitcoinMarkets strategy:', marketsStrategy, '\n');

  // Test 4: Analyze mock engagement
  console.log('4. Analyzing mock engagement...');
  const mockStats = {
    upvotes: 150,
    downvotes: 20,
    score: 130,
    comments: 35,
    upvote_ratio: 0.88
  };
  const performance = agent.tools.engagementTracker.analyzePerformance(mockStats);
  console.log('Performance analysis:', performance, '\n');

  // Test 5: Get optimal posting times
  console.log('5. Getting optimal posting times...');
  const bitcoinTime = await agent.getOptimalPostingTime('Bitcoin');
  const marketsTime = await agent.getOptimalPostingTime('BitcoinMarkets');
  console.log('Optimal time for Bitcoin:', bitcoinTime);
  console.log('Optimal time for BitcoinMarkets:', marketsTime, '\n');

  // Test 6: Mock news digest formatting
  console.log('6. Formatting news digest...');
  const mockNews = [
    {
      title: 'Philippines to Consider Strategic Bitcoin Reserve',
      description: 'The bill proposes terms for how the country\'s central bank could be tasked with buying Bitcoin',
      url: 'https://example.com/news1'
    },
    {
      title: 'Bitcoin fees plummet to decade-lows',
      description: 'Bitcoin fees have fallen to their lowest level in more than a decade, reflecting weaker demand',
      url: 'https://example.com/news2'
    }
  ];
  const newsDigest = agent.tools.formatter.formatNewsDigest(mockNews);
  console.log('News digest title:', newsDigest.title);
  console.log('Preview:', newsDigest.text.substring(0, 200) + '...');

  console.log('\n=== Reddit Publisher Agent Ready! ===');
  console.log('Add Reddit API credentials to .env file to enable live posting');
}

main().catch(console.error);
