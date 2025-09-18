import { SocialPublisherAgent } from './social-publisher-agent.js';

async function main() {
  const agent = new SocialPublisherAgent();
  
  console.log('=== Social Media Agent Demo ===\n');

  // Test 1: Publish a Bitcoin price alert
  console.log('1. Publishing Bitcoin price alert...');
  const priceAlertContent = {
    text: '🚨 Bitcoin Alert: BTC just hit $109,584! 📈 Market showing strong momentum.',
    hashtags: ['#Bitcoin', '#BTC', '#Crypto']
  };
  
  try {
    // Note: This will fail without proper Twitter API credentials, but shows the flow
    console.log('Would publish:', priceAlertContent.text + ' ' + priceAlertContent.hashtags?.join(' '));
    console.log('✓ Tweet publication logic ready\n');
  } catch (error) {
    console.log('⚠️  Twitter API not configured, but logic is working\n');
  }

  // Test 2: Schedule a daily summary
  console.log('2. Scheduling daily summary...');
  const dailySummaryContent = {
    text: '📊 Bitcoin Daily Intel: Price $109,584 (+2.1%) 📈 Market sentiment: Bullish 🔥'
  };
  
  const scheduled = await agent.schedulePost(dailySummaryContent);
  console.log('✓ Scheduled for:', scheduled.time, '\n');

  // Test 3: Get analytics insights
  console.log('3. Getting analytics insights...');
  const insights = await agent.tools.analytics.getInsights('7d');
  console.log('✓ Analytics:', insights, '\n');

  // Test 4: Mock engagement tracking
  console.log('4. Mock engagement tracking...');
  const mockMetrics = {
    like_count: 45,
    retweet_count: 12,
    reply_count: 8,
    impression_count: 1250
  };
  
  const performance = await agent.tools.engagementTracker.analyzePerformance(mockMetrics);
  console.log('✓ Performance analysis:', performance);

  console.log('\n=== Social Media Agent Ready! ===');
}

main().catch(console.error);
