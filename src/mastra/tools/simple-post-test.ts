// Simple Twitter posting test
import { TwitterApi } from 'twitter-api-v2';

async function simplePostTest() {
  console.log('Simple Twitter posting test...\n');
  
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_KEY_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  });

  try {
    // Verify authentication first
    const user = await client.v2.me();
    console.log('✅ Authenticated as:', user.data.username);
    
    // Try posting a simple tweet
    console.log('\nAttempting to post tweet...');
    const tweet = await client.v1.tweet('Hello from Bitcoin Intelligence Agent! 🤖 ' + new Date().getTime());
    
    console.log('✅ Tweet posted successfully!');
    console.log('Tweet ID:', tweet.id_str);
    console.log('Tweet text:', tweet.text);
    
    return true;
    
  } catch (error: any) {
    console.log('❌ Failed to post tweet');
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    
    // Common error codes and solutions
    if (error.code === 403) {
      console.log('\n💡 403 Forbidden - Possible causes:');
      console.log('- App permissions set to Read-only (need Read+Write)');
      console.log('- Twitter account not verified (phone/email)');
      console.log('- App may be restricted or suspended');
    } else if (error.code === 401) {
      console.log('\n💡 401 Unauthorized - Check credentials');
    } else if (error.code === 400) {
      console.log('\n💡 400 Bad Request - Invalid request format');
    }
    
    return false;
  }
}

simplePostTest().catch(console.error);
