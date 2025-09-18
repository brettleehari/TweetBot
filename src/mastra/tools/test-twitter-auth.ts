// Detailed Twitter authentication test
import { TwitterApi } from 'twitter-api-v2';

async function testTwitterAuth() {
  console.log('Testing Twitter authentication...\n');
  
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_KEY_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
    });

    // First, test if we can read user info
    console.log('1. Testing user authentication...');
    const user = await client.v2.me();
    console.log('✅ Authenticated as:', user.data.name, `(@${user.data.username})`);
    
    // Test read permissions
    console.log('\n2. Testing read permissions...');
    const tweets = await client.v2.search('bitcoin', { max_results: 5 });
    console.log('✅ Read access confirmed - found', tweets.data?.data?.length || 0, 'tweets');
    
    // Test write permissions by checking app permissions
    console.log('\n3. Checking app permissions...');
    try {
      // Try a very simple tweet first
      const testTweet = await client.v2.tweet('Test tweet from Bitcoin Agent 🤖 ' + Date.now());
      console.log('✅ Write access confirmed - Tweet ID:', testTweet.data.id);
      
      // Clean up by deleting the test tweet
      setTimeout(async () => {
        try {
          await client.v2.deleteTweet(testTweet.data.id);
          console.log('🧹 Test tweet deleted');
        } catch (e) {
          console.log('⚠️ Could not delete test tweet (manual cleanup needed)');
        }
      }, 5000);
      
    } catch (writeError: any) {
      console.log('❌ Write access failed:', writeError.message);
      
      if (writeError.message.includes('403')) {
        console.log('\n💡 Possible issues:');
        console.log('- App may not have write permissions enabled');
        console.log('- Account may need to be verified (phone number, etc.)');
        console.log('- App permissions may be read-only');
      }
    }
    
  } catch (error: any) {
    console.log('❌ Authentication failed:', error.message);
    console.log('\n💡 Check these:');
    console.log('- Verify all 4 credentials are correct');
    console.log('- Ensure app has proper permissions');
    console.log('- Check if developer account is approved');
  }
}

testTwitterAuth().catch(console.error);
