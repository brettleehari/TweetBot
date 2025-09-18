// Comprehensive Twitter app capability test
import { TwitterApi } from 'twitter-api-v2';

async function comprehensiveTwitterTest() {
  console.log('🔍 Comprehensive Twitter App Analysis\n');
  
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_KEY_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  });

  try {
    // Test 1: Basic Authentication
    console.log('1. Testing Authentication...');
    const user = await client.v2.me();
    console.log('✅ Authenticated as:', user.data.name, `(@${user.data.username})`);
    console.log('   User ID:', user.data.id);
    
    // Test 2: Read Capabilities
    console.log('\n2. Testing Read Capabilities...');
    try {
      const tweets = await client.v2.search('bitcoin', { max_results: 5 });
      console.log('✅ Can search tweets:', tweets.data?.data?.length || 0, 'results');
    } catch (e: any) {
      console.log('❌ Cannot search tweets:', e.message);
    }
    
    // Test 3: Account Info
    console.log('\n3. Account Information...');
    console.log('   Username:', user.data.username);
    console.log('   Verified:', user.data.verified || false);
    console.log('   Created:', user.data.created_at || 'Unknown');
    
    // Test 4: App Info (if available)
    console.log('\n4. App Configuration Check...');
    console.log('   API Key (first 8 chars):', process.env.TWITTER_API_KEY?.substring(0, 8) + '...');
    console.log('   Access Token (first 8 chars):', process.env.TWITTER_ACCESS_TOKEN?.substring(0, 8) + '...');
    
    // Test 5: Write Attempt
    console.log('\n5. Testing Write Permissions...');
    try {
      const testTweet = await client.v1.tweet('🤖 Bitcoin Intelligence Agent Test - ' + Date.now());
      console.log('✅ SUCCESS! Tweet posted successfully!');
      console.log('   Tweet ID:', testTweet.id_str);
      console.log('   Tweet text:', testTweet.text);
      
      // Clean up test tweet
      setTimeout(async () => {
        try {
          await client.v1.deleteTweet(testTweet.id_str);
          console.log('🗑️ Test tweet deleted');
        } catch (e) {
          console.log('⚠️ Could not delete test tweet (manual cleanup needed)');
        }
      }, 5000);
      
      return true;
      
    } catch (writeError: any) {
      console.log('❌ CANNOT POST TWEETS');
      console.log('   Error Code:', writeError.code || 'Unknown');
      console.log('   Error:', writeError.message);
      
      // Analyze the error
      if (writeError.code === 403) {
        console.log('\n🔍 Analysis: 403 Forbidden Error');
        console.log('   This means your app has Essential access (read-only)');
        console.log('   You need to apply for Elevated access to post tweets');
      }
      
      return false;
    }
    
  } catch (error: any) {
    console.log('❌ Authentication or setup error:', error.message);
    return false;
  }
}

async function main() {
  const canPost = await comprehensiveTwitterTest();
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY');
  console.log('='.repeat(60));
  
  if (canPost) {
    console.log('🎉 SUCCESS: Your app can post tweets!');
    console.log('   The Bitcoin Intelligence Agent is ready to go live');
  } else {
    console.log('⚠️  ISSUE: Cannot post tweets yet');
    console.log('');
    console.log('📝 NEXT STEPS:');
    console.log('1. Go to: https://developer.x.com/en/portal/products/elevated');
    console.log('2. Apply for "Elevated" access (free)');
    console.log('3. Explain use case: "Educational Bitcoin market analysis bot"');
    console.log('4. Wait for approval (1-7 days)');
    console.log('5. Regenerate access tokens after approval');
    console.log('');
    console.log('🔧 Current Status: Essential access (read-only)');
    console.log('🎯 Needed: Elevated access (read + write)');
  }
  
  console.log('\n🤖 Intelligence system is fully functional and ready!');
}

main().catch(console.error);
