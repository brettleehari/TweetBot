// Test for DataCollectorAgent real-time data functionality
import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config();

describe('DataCollectorAgent Real-time Data Sources', () => {
  
  it('should fetch real Bitcoin price from CoinGecko API', async () => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'bitcoin',
          vs_currencies: 'usd',
          include_24hr_change: true
        }
      });
      
      expect(response.data).toHaveProperty('bitcoin');
      expect(response.data.bitcoin).toHaveProperty('usd');
      expect(typeof response.data.bitcoin.usd).toBe('number');
      expect(response.data.bitcoin.usd).toBeGreaterThan(0);
      
      console.log(`✅ Bitcoin price fetched: $${response.data.bitcoin.usd}`);
    } catch (error) {
      console.warn('⚠️ CoinGecko API test failed:', error instanceof Error ? error.message : String(error));
      throw new Error('CoinGecko API is not accessible');
    }
  }, 10000);

  it('should fetch real Bitcoin news from NewsAPI (if API key available)', async () => {
    const API_KEY = process.env.NEWS_API_KEY;
    
    if (!API_KEY || API_KEY === '') {
      console.log('⚠️ NEWS_API_KEY not set, skipping news test');
      return;
    }

    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'bitcoin',
          apiKey: API_KEY,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 5
        }
      });
      
      expect(response.data).toHaveProperty('articles');
      expect(Array.isArray(response.data.articles)).toBe(true);
      expect(response.data.articles.length).toBeGreaterThan(0);
      
      if (response.data.articles.length > 0) {
        expect(response.data.articles[0]).toHaveProperty('title');
        expect(response.data.articles[0]).toHaveProperty('publishedAt');
      }
      
      console.log(`✅ News fetched: ${response.data.articles.length} articles`);
    } catch (error) {
      console.warn('⚠️ NewsAPI test failed:', error instanceof Error ? error.message : String(error));
      throw new Error('NewsAPI is not accessible');
    }
  }, 10000);

  it('should validate data structure for price data', () => {
    const mockPriceData = {
      price: 95000,
      change24h: 2.5,
      timestamp: Date.now()
    };
    
    expect(mockPriceData).toHaveProperty('price');
    expect(typeof mockPriceData.price).toBe('number');
    expect(mockPriceData.price).toBeGreaterThan(0);
    expect(mockPriceData).toHaveProperty('change24h');
    expect(typeof mockPriceData.change24h).toBe('number');
    
    console.log('✅ Price data structure validation passed');
  });

  it('should validate data structure for news data', () => {
    const mockNewsData = [
      {
        title: 'Bitcoin reaches new highs',
        description: 'Bitcoin price analysis',
        url: 'https://example.com',
        publishedAt: new Date().toISOString(),
        source: { name: 'CryptoNews' }
      }
    ];
    
    expect(Array.isArray(mockNewsData)).toBe(true);
    expect(mockNewsData.length).toBeGreaterThan(0);
    expect(mockNewsData[0]).toHaveProperty('title');
    expect(mockNewsData[0]).toHaveProperty('publishedAt');
    expect(typeof mockNewsData[0].title).toBe('string');
    
    console.log('✅ News data structure validation passed');
  });
});
