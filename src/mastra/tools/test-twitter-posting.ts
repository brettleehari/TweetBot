// Test Twitter posting with OAuth credentials
import { twitterApiV2 } from '../tools/twitter-api-v2.js';

async function testTwitterPosting() {
  console.log('Testing Twitter posting with OAuth credentials...\n');
  
  try {
    // Test posting a tweet
    const testContent = '🤖 Testing Bitcoin Intelligence Agent - Market analysis active! #Bitcoin #AI #Testing ' + new Date().getTime();
    
    console.log('Posting test tweet:', testContent);
    const result = await twitterApiV2.post(testContent);
    
    console.log('✅ Tweet posted successfully!');
    console.log('Tweet ID:', result.id);
    console.log('Tweet text:', result.text);
    
    // Test getting metrics (wait a moment for the tweet to be processed)
    setTimeout(async () => {
      try {
        const metrics = await twitterApiV2.getMetrics(result.id);
        console.log('\n📊 Tweet metrics:', metrics);
      } catch (error) {
        console.log('⚠️ Could not fetch metrics yet (tweet may be too new)');
      }
    }, 3000);
    
    return true;
    
  } catch (error) {
    console.log('❌ Twitter posting failed:');
    console.log('Error:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      console.log('💡 Check your OAuth credentials in .env file');
    }
    return false;
  }
}

testTwitterPosting().catch(console.error);
