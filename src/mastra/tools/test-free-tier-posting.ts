// Test Twitter v2 API posting with Free tier access
import { TwitterApi } from 'twitter-api-v2';

async function testFreeTierPosting() {
  console.log('🆓 Testing Twitter Free Tier v2 API Posting\n');
  
  // Try OAuth 2.0 with Client ID/Secret (newer method)
  if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
    console.log('1. Testing with OAuth 2.0 (Client ID/Secret)...');
    
    try {
      const client = new TwitterApi({
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
      });
      
      // Note: OAuth 2.0 requires user authentication flow for posting
      console.log('   ℹ️  OAuth 2.0 requires user authentication flow for posting');
      console.log('   ℹ️  This method needs interactive authentication');
      
    } catch (e: any) {
      console.log('   ❌ OAuth 2.0 setup failed:', e.message);
    }
  }
  
  // Try OAuth 1.0a (traditional method)
  console.log('\n2. Testing with OAuth 1.0a (API Key/Secret + Access Tokens)...');
  
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_KEY_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  });

  try {
    // Test authentication first
    const user = await client.v2.me();
    console.log('   ✅ Authenticated as:', user.data.username);
    
    // Try v2 tweet posting (might work with Free tier)
    console.log('\n3. Attempting v2 tweet...');
    try {
      const tweet = await client.v2.tweet('🤖 Testing Bitcoin Intelligence Agent v2 API - ' + Date.now());
      console.log('   🎉 SUCCESS! v2 tweet posted!');
      console.log('   Tweet ID:', tweet.data.id);
      console.log('   Tweet text:', tweet.data.text);
      
      // Clean up test tweet
      setTimeout(async () => {
        try {
          await client.v2.deleteTweet(tweet.data.id);
          console.log('   🗑️ Test tweet cleaned up');
        } catch (e) {
          console.log('   ⚠️ Could not delete test tweet');
        }
      }, 3000);
      
      return true;
      
    } catch (e: any) {
      console.log('   ❌ v2 tweet failed:', e.message);
      console.log('   Error code:', e.code);
      
      // Try v1 as fallback
      console.log('\n4. Trying v1 tweet as fallback...');
      try {
        const tweet = await client.v1.tweet('🤖 Testing Bitcoin Intelligence Agent v1 API - ' + Date.now());
        console.log('   🎉 SUCCESS! v1 tweet posted!');
        console.log('   Tweet ID:', tweet.id_str);
        console.log('   Tweet text:', tweet.text);
        
        // Clean up test tweet
        setTimeout(async () => {
          try {
            await client.v1.deleteTweet(tweet.id_str);
            console.log('   🗑️ Test tweet cleaned up');
          } catch (e) {
            console.log('   ⚠️ Could not delete test tweet');
          }
        }, 3000);
        
        return true;
        
      } catch (e: any) {
        console.log('   ❌ v1 tweet also failed:', e.message);
        console.log('   Error code:', e.code);
        return false;
      }
    }
    
  } catch (error: any) {
    console.log('   ❌ Authentication failed:', error.message);
    return false;
  }
}

async function checkUsageStats() {
  console.log('\n5. Checking API Usage (if possible)...');
  
  // Note: Usage stats might not be available through API
  console.log('   ℹ️  Free tier limits:');
  console.log('   📊 Posts: 100 retrievals per month');
  console.log('   ✍️  Writes: 500 posts per month');
  console.log('   🔄 Rate limit: Likely lower than paid tiers');
}

async function main() {
  const canPost = await testFreeTierPosting();
  await checkUsageStats();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FREE TIER POSTING ANALYSIS');
  console.log('='.repeat(60));
  
  if (canPost) {
    console.log('🎉 SUCCESS: Free tier posting works!');
    console.log('   ✅ Your Bitcoin Intelligence Agent can post tweets');
    console.log('   📈 500 tweets per month available');
    console.log('   🤖 Ready to go live!');
    
  } else {
    console.log('❌ Free tier posting not working');
    console.log('');
    console.log('💡 Possible issues:');
    console.log('   1. App permissions might still be read-only');
    console.log('   2. Need to regenerate access tokens');
    console.log('   3. Account verification required');
    console.log('   4. Free tier might have different authentication requirements');
    console.log('');
    console.log('🔧 Try these steps:');
    console.log('   1. Go to Twitter Developer Dashboard');
    console.log('   2. Check app permissions (should be Read+Write)');
    console.log('   3. Regenerate access tokens');
    console.log('   4. Ensure Twitter account is verified');
  }
}

main().catch(console.error);
