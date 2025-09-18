// Check Twitter app permissions and access level
import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';

async function checkAppPermissions() {
  console.log('🔍 Checking Twitter App Permissions & Access Level\n');
  
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_KEY_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  });

  try {
    // Check 1: Basic user info
    console.log('1. Account Information:');
    const user = await client.v2.me();
    console.log('   ✅ Username:', user.data.username);
    console.log('   ✅ Display Name:', user.data.name);
    console.log('   ✅ User ID:', user.data.id);
    console.log('   ✅ Verified:', user.data.verified || false);
    
    // Check 2: App capabilities by testing different endpoints
    console.log('\n2. Testing API Endpoints:');
    
    // Test v2 me endpoint (should work with Essential)
    try {
      await client.v2.me();
      console.log('   ✅ v2.me() - Basic user info: WORKS');
    } catch (e: any) {
      console.log('   ❌ v2.me() - Basic user info: FAILED -', e.message);
    }
    
    // Test v2 search (Essential has limited access)
    try {
      const searchResult = await client.v2.search('test', { max_results: 10 });
      console.log('   ✅ v2.search() - Tweet search: WORKS -', searchResult.data?.data?.length || 0, 'results');
    } catch (e: any) {
      console.log('   ❌ v2.search() - Tweet search: FAILED -', e.message);
    }
    
    // Test v1 tweet (requires Elevated)
    try {
      const testTweet = await client.v1.tweet('Test tweet - will delete immediately');
      console.log('   🎉 v1.tweet() - Posting tweets: WORKS! You have Elevated access!');
      
      // Clean up immediately
      try {
        await client.v1.deleteTweet(testTweet.id_str);
        console.log('   🗑️ Test tweet deleted successfully');
      } catch (e) {
        console.log('   ⚠️ Could not delete test tweet');
      }
      
      return 'ELEVATED';
      
    } catch (e: any) {
      if (e.code === 403) {
        console.log('   ❌ v1.tweet() - Posting tweets: BLOCKED - Essential access only');
      } else {
        console.log('   ❌ v1.tweet() - Posting tweets: ERROR -', e.message);
      }
    }
    
    // Test v2 tweet (also requires Elevated)
    try {
      const testTweet = await client.v2.tweet('Test tweet v2 - will delete immediately');
      console.log('   🎉 v2.tweet() - Posting tweets v2: WORKS! You have Elevated access!');
      
      // Clean up immediately
      try {
        await client.v1.deleteTweet(testTweet.data.id);
        console.log('   🗑️ Test tweet deleted successfully');
      } catch (e) {
        console.log('   ⚠️ Could not delete test tweet');
      }
      
      return 'ELEVATED';
      
    } catch (e: any) {
      if (e.code === 403) {
        console.log('   ❌ v2.tweet() - Posting tweets v2: BLOCKED - Essential access only');
      } else {
        console.log('   ❌ v2.tweet() - Posting tweets v2: ERROR -', e.message);
      }
    }
    
    return 'ESSENTIAL';
    
  } catch (error: any) {
    console.log('❌ Failed to check app permissions:', error.message);
    return 'ERROR';
  }
}

async function checkAppDetails() {
  console.log('\n3. App Configuration Details:');
  console.log('   🔑 API Key:', process.env.TWITTER_API_KEY?.substring(0, 8) + '...');
  console.log('   🔑 API Secret:', process.env.TWITTER_API_KEY_SECRET?.substring(0, 8) + '...');
  console.log('   🎫 Access Token:', process.env.TWITTER_ACCESS_TOKEN?.substring(0, 8) + '...');
  console.log('   🎫 Access Secret:', process.env.TWITTER_ACCESS_TOKEN_SECRET?.substring(0, 8) + '...');
  
  // Check if tokens look valid
  const tokenPattern = /^\d{19}-\w{40}$/;
  const isValidToken = tokenPattern.test(process.env.TWITTER_ACCESS_TOKEN || '');
  console.log('   📋 Token Format:', isValidToken ? 'Valid' : 'Invalid format');
}

async function main() {
  const accessLevel = await checkAppPermissions();
  await checkAppDetails();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 CURRENT STATUS SUMMARY');
  console.log('='.repeat(60));
  
  if (accessLevel === 'ELEVATED') {
    console.log('🎉 SUCCESS: You have ELEVATED access!');
    console.log('   ✅ Can post tweets');
    console.log('   ✅ Full API access');
    console.log('   ✅ Bitcoin Intelligence Agent ready to go live!');
    
  } else if (accessLevel === 'ESSENTIAL') {
    console.log('⚠️  You currently have ESSENTIAL access (read-only)');
    console.log('   ❌ Cannot post tweets');
    console.log('   ❌ Limited API endpoints');
    
    console.log('\n📝 HOW TO CHECK YOUR APPLICATION STATUS:');
    console.log('1. Go to: https://developer.x.com/en/portal/dashboard');
    console.log('2. Look for your app in the dashboard');
    console.log('3. Check the "Access Level" shown next to your app');
    console.log('4. If it shows "Essential" - you need to apply for Elevated');
    console.log('5. If it shows "Elevated" - regenerate your access tokens');
    
    console.log('\n🔗 Quick Links:');
    console.log('   Dashboard: https://developer.x.com/en/portal/dashboard');
    console.log('   Apply for Elevated: https://developer.x.com/en/portal/products/elevated');
    console.log('   App Settings: https://developer.x.com/en/portal/projects-and-apps');
    
  } else {
    console.log('❌ Error checking access level');
    console.log('   Please check your credentials and try again');
  }
  
  console.log('\n🤖 Your Bitcoin Intelligence system is ready - just needs posting permissions!');
}

main().catch(console.error);
