import { dataCollector } from './data-collector';

describe('Data Collection Agent', () => {
  it('should have correct name and tools', () => {
    expect(dataCollector.name).toBe('data-collector');
    expect(dataCollector.tools).toContain('alpha-vantage-fetcher');
    expect(dataCollector.tools).toContain('coingecko-fetcher');
    expect(dataCollector.tools).toContain('news-api-client');
    expect(dataCollector.tools).toContain('data-validator');
  });

  it('should have priceData capabilities', () => {
    expect(dataCollector.capabilities.priceData.primary).toBe('Alpha Vantage');
    expect(dataCollector.capabilities.priceData.backup).toBe('CoinGecko');
    expect(dataCollector.capabilities.priceData.frequency).toBe('15min');
    expect(dataCollector.capabilities.priceData.validation).toBe('cross-reference');
  });

  it('should have newsData capabilities', () => {
    expect(dataCollector.capabilities.newsData.sources).toEqual(['NewsAPI', 'CryptoPanic']);
    expect(dataCollector.capabilities.newsData.filters).toEqual(['bitcoin', 'btc', 'cryptocurrency']);
    expect(dataCollector.capabilities.newsData.deduplication).toBe('content-hash');
  });
});
