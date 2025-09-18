// Twitter API connectivity test
import { twitterApiV2 } from '../tools/twitter-api-v2.js';

async function testTwitterConnectivity() {
  console.log('Testing Twitter API connectivity...\n');
  
  try {
    // Test API access with a public endpoint that works with Bearer token
    const response = await fetch('https://api.twitter.com/2/tweets/search/recent?query=bitcoin&max_results=10', {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Twitter API Connection: SUCCESS');
      console.log(`Found ${data.data?.length || 0} recent Bitcoin tweets`);
      console.log('API access confirmed with Bearer token');
      return true;
    } else {
      const errorData = await response.json();
      console.log('❌ Twitter API Connection: FAILED');
      console.log('Status:', response.status);
      console.log('Error:', errorData);
      
      if (response.status === 429) {
        console.log('💡 Rate limit reached - API is working but needs throttling');
        return true; // API is working, just rate limited
      }
      return false;
    }
    
  } catch (error) {
    console.log('❌ Twitter API Connection: ERROR');
    console.log('Error details:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

testTwitterConnectivity().catch(console.error);
