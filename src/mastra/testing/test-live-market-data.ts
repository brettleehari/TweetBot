#!/usr/bin/env node
/**
 * Live Market Data Test
 */

const colors = {
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
};

async function testLiveMarketData() {
  console.log(colors.bold('\n📊 Live Market Data Integration Test\n'));
  
  try {
    console.log(colors.blue('📦 Importing LiveMarketDataService...'));
    const { LiveMarketDataService } = await import('../services/live-market-data.js');
    console.log(colors.green('✅ Import successful!'));
    
    console.log(colors.blue('\n🔧 Creating service instance...'));
    const service = new LiveMarketDataService();
    console.log(colors.green('✅ Service created!'));
    
    console.log(colors.blue('\n🌐 Fetching live market data...'));
    const marketData = await service.getLiveMarketData();
    console.log(colors.green('✅ Market data retrieved!'));
    
    console.log(colors.cyan('\n📈 Sample Market Data:'));
    
    if (marketData.prices && marketData.prices.length > 0) {
      const btc = marketData.prices.find(p => p.symbol === 'BTC');
      if (btc) {
        console.log(`Bitcoin Price: $${colors.yellow(btc.price.toLocaleString())}`);
        console.log(`24h Change: ${colors.yellow(btc.change24h.toFixed(2))}%`);
      }
    }
    
    if (marketData.sentiment) {
      console.log(`Market Sentiment: ${colors.yellow(marketData.sentiment.overallSentiment.toFixed(2))}`);
    }
    
    console.log(`Last Update: ${colors.yellow(marketData.lastUpdate.toISOString())}`);
    
    console.log(colors.bold(colors.green('\n🎉 Live Market Data Test Complete!')));
    
  } catch (error) {
    console.error(colors.red('\n❌ Test failed:'));
    console.error(colors.red('Error message:'), error.message);
    console.error(colors.red('Stack trace:'), error.stack);
    process.exit(1);
  }
}

testLiveMarketData().catch(console.error);