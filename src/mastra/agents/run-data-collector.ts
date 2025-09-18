import { DataCollectorAgent } from './data-collector-agent.js';

async function main() {
  const agent = new DataCollectorAgent();
  console.log('Fetching Bitcoin price...');
  const price = await agent.fetchBitcoinPrice();
  console.log('Bitcoin price:', price);

  console.log('Fetching Bitcoin news...');
  const news = await agent.fetchBitcoinNews();
  console.log('Bitcoin news:', news.slice(0, 3)); // Show top 3 articles
}

main().catch(console.error);
