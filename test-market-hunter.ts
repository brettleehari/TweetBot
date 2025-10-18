import { MarketHunterAgent } from './src/mastra/agency/market-hunter-agent';

async function testMarketHunter() {
  console.log('--- Testing MarketHunterAgent ---');
  const hunter = new MarketHunterAgent();
  
  try {
    const discoveries = await hunter.autonomousHunt();
    
    console.log('\n--- Autonomous Hunt Results ---');
    if (discoveries.length > 0) {
      discoveries.forEach(discovery => {
        console.log(`
  Type: ${discovery.type}
  Description: ${discovery.description}
  Alpha Value: ${discovery.alphaValue.toFixed(2)}
  Confidence: ${discovery.confidence.toFixed(2)}
  Urgency: ${discovery.urgency}
  Source: ${discovery.source}
  Insight: ${discovery.actionableInsight}
        `);
      });
    } else {
      console.log('No significant alpha discoveries in this cycle.');
    }
    
  } catch (error) {
    console.error('\n--- An error occurred during the test ---');
    console.error(error);
  }
  
  console.log('\n--- Test Complete ---');
}

testMarketHunter();
