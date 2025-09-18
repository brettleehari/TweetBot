import { Agent } from './Agent.js';
import { alphaVantageFetcher } from '../tools/alpha-vantage-fetcher.js';
import { coinGeckoFetcher } from '../tools/coingecko-fetcher.js';
import { newsApiClient } from '../tools/news-api-client.js';
import { dataValidator } from '../tools/data-validator.js';

export class DataCollectorAgent extends Agent {
  constructor() {
    super('data-collector', {
      alphaVantage: alphaVantageFetcher,
      coinGecko: coinGeckoFetcher,
      newsApi: newsApiClient,
      dataValidator: dataValidator,
    });
  }

  async fetchBitcoinPrice(): Promise<{ price: number }> {
    try {
      const primaryData = await this.tools.alphaVantage.getCurrentPrice('BTC');
      const backupData = await this.tools.coinGecko.getCurrentPrice('bitcoin');
      return this.tools.dataValidator.validateAndMerge(primaryData, backupData);
    } catch (error) {
      await this.notifyOrchestrator('price-fetch-error', error);
      throw error;
    }
  }

  async fetchBitcoinNews(): Promise<any[]> {
    const newsData = await this.tools.newsApi.search('bitcoin');
    // For production, add deduplication/filtering here
    return newsData;
  }
}
