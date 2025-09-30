# Bitcoin Data API Test Suite - Mastra AI Framework Specification

## Overview
This document specifies all tests required to verify live data endpoints for a Bitcoin intelligence agent built with Mastra AI. These tests should run during every iteration to ensure data quality and API availability.

## Test Framework Requirements
- **Framework**: Mastra AI with built-in testing capabilities
- **Language**: TypeScript
- **Test Runner**: Jest (integrates with Mastra)
- **Execution**: Run all tests before agent workflow execution
- **Timeout**: Each API test should timeout after 10 seconds
- **Retry Logic**: Retry failed tests once with exponential backoff
- **Logging**: Use Mastra's built-in logger for all test results
- **Alerts**: Integrate with Mastra workflow triggers for failures

---

## Test Structure for Mastra AI

```typescript
// File: src/tests/bitcoin-data-validation.test.ts

import { Mastra } from '@mastra/core';
import { z } from 'zod'; // Mastra uses Zod for validation

// Initialize Mastra test configuration
const testConfig = {
  timeout: 10000,
  retries: 1,
  logLevel: 'info'
};
```

---

## 1. Price Data API Tests

### 1.1 Alpha Vantage Price Test
```markdown
**Test ID**: PRICE_001
**Priority**: CRITICAL
**Mastra Tool**: Create custom tool or use HTTP client
**API Endpoint**: https://www.alphavantage.co/query

**Zod Schema for Validation**:
```typescript
const AlphaVantagePriceSchema = z.object({
  'Realtime Currency Exchange Rate': z.object({
    '1. From_Currency Code': z.literal('BTC'),
    '5. Exchange Rate': z.string().regex(/^\d+\.?\d*$/),
    '6. Last Refreshed': z.string().datetime(),
    '8. Bid Price': z.string().regex(/^\d+\.?\d*$/),
    '9. Ask Price': z.string().regex(/^\d+\.?\d*$/)
  })
});
```

**Test Implementation**:
```typescript
describe('Alpha Vantage Price API', () => {
  
  test('PRICE_001.1: API Availability', async () => {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    
    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);
  }, 5000);

  test('PRICE_001.2: Response Structure Validation', async () => {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    // Use Zod schema validation
    const result = AlphaVantagePriceSchema.safeParse(data);
    expect(result.success).toBe(true);
    
    if (!result.success) {
      console.error('Validation errors:', result.error.issues);
    }
  });

  test('PRICE_001.3: Data Freshness Check', async () => {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    const lastRefreshed = new Date(data['Realtime Currency Exchange Rate']['6. Last Refreshed']);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastRefreshed.getTime()) / 1000 / 60;
    
    expect(diffMinutes).toBeLessThan(60);
  });

  test('PRICE_001.4: Price Sanity Check', async () => {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    const price = parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
    
    expect(price).toBeGreaterThan(50000);
    expect(price).toBeLessThan(200000);
  });

  test('PRICE_001.5: Bid-Ask Spread Validation', async () => {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    const bid = parseFloat(data['Realtime Currency Exchange Rate']['8. Bid Price']);
    const ask = parseFloat(data['Realtime Currency Exchange Rate']['9. Ask Price']);
    const spread = ((ask - bid) / bid) * 100;
    
    expect(spread).toBeLessThan(1);
  });

  test('PRICE_001.6: Rate Limit Check', () => {
    // Track calls in memory or Redis
    const callsInLastMinute = getAPICallCount('alphavantage', 60);
    expect(callsInLastMinute).toBeLessThan(5);
  });
});
```

**Success Criteria**: All 6 test cases pass
**Fallback**: Use CoinGecko API if Alpha Vantage fails
```

### 1.2 CoinGecko Price Test (Backup)
```markdown
**Test ID**: PRICE_002
**Priority**: HIGH
**API Endpoint**: https://api.coingecko.com/api/v3/simple/price

**Zod Schema**:
```typescript
const CoinGeckoPriceSchema = z.object({
  bitcoin: z.object({
    usd: z.number().min(50000).max(200000),
    usd_24h_change: z.number(),
    usd_24h_vol: z.number().positive(),
    last_updated_at: z.number()
  })
});
```

**Test Implementation**:
```typescript
describe('CoinGecko Price API', () => {
  
  test('PRICE_002.1: API Availability', async () => {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_last_updated_at=true'
    );
    
    expect(response.status).toBe(200);
  });

  test('PRICE_002.2: Response Structure Validation', async () => {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_last_updated_at=true'
    );
    const data = await response.json();
    
    const result = CoinGeckoPriceSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('PRICE_002.3: Data Freshness', async () => {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_last_updated_at=true'
    );
    const data = await response.json();
    
    const lastUpdated = data.bitcoin.last_updated_at * 1000;
    const now = Date.now();
    const diffMinutes = (now - lastUpdated) / 1000 / 60;
    
    expect(diffMinutes).toBeLessThan(10);
  });

  test('PRICE_002.4: Cross-Validation with Alpha Vantage', async () => {
    const coinGeckoPrice = await getCoinGeckoPrice();
    const alphaVantagePrice = await getAlphaVantagePrice();
    
    const priceDiff = Math.abs(coinGeckoPrice - alphaVantagePrice);
    const percentDiff = (priceDiff / alphaVantagePrice) * 100;
    
    // Prices should be within 1% of each other
    expect(percentDiff).toBeLessThan(1);
  });
});
```
```

---

## 2. Technical Indicators API Tests

### 2.1 RSI Indicator Test
```markdown
**Test ID**: TECH_001
**Priority**: HIGH
**API Endpoint**: Alpha Vantage Technical Indicators

**Zod Schema**:
```typescript
const RSISchema = z.object({
  'Meta Data': z.object({
    '1: Symbol': z.string(),
    '2: Indicator': z.literal('Relative Strength Index (RSI)'),
    '3: Last Refreshed': z.string()
  }),
  'Technical Analysis: RSI': z.record(z.object({
    RSI: z.string().regex(/^\d+\.?\d*$/)
  }))
});
```

**Test Implementation**:
```typescript
describe('RSI Technical Indicator', () => {
  
  test('TECH_001.1: API Availability', async () => {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=RSI&symbol=BTCUSD&interval=daily&time_period=14&series_type=close&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    
    expect(response.status).toBe(200);
  });

  test('TECH_001.2: Response Structure', async () => {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=RSI&symbol=BTCUSD&interval=daily&time_period=14&series_type=close&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    const result = RSISchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('TECH_001.3: RSI Value Range', async () => {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=RSI&symbol=BTCUSD&interval=daily&time_period=14&series_type=close&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    const latestDate = Object.keys(data['Technical Analysis: RSI'])[0];
    const rsiValue = parseFloat(data['Technical Analysis: RSI'][latestDate].RSI);
    
    expect(rsiValue).toBeGreaterThanOrEqual(0);
    expect(rsiValue).toBeLessThanOrEqual(100);
  });

  test('TECH_001.4: Data Completeness', async () => {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=RSI&symbol=BTCUSD&interval=daily&time_period=14&series_type=close&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    const dataPoints = Object.keys(data['Technical Analysis: RSI']).length;
    
    // Should have at least 30 days of data
    expect(dataPoints).toBeGreaterThanOrEqual(30);
  });
});
```
```

### 2.2 MACD Indicator Test
```markdown
**Test ID**: TECH_002
**Priority**: HIGH
**API Endpoint**: Alpha Vantage MACD

**Zod Schema**:
```typescript
const MACDSchema = z.object({
  'Meta Data': z.object({
    '1: Symbol': z.string(),
    '2: Indicator': z.literal('Moving Average Convergence/Divergence (MACD)')
  }),
  'Technical Analysis: MACD': z.record(z.object({
    MACD: z.string().regex(/^-?\d+\.?\d*$/),
    MACD_Signal: z.string().regex(/^-?\d+\.?\d*$/),
    MACD_Hist: z.string().regex(/^-?\d+\.?\d*$/)
  }))
});
```

**Test Implementation**:
```typescript
describe('MACD Technical Indicator', () => {
  
  test('TECH_002.1: API Availability', async () => {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=MACD&symbol=BTCUSD&interval=daily&series_type=close&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    
    expect(response.status).toBe(200);
  });

  test('TECH_002.2: Response Structure', async () => {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=MACD&symbol=BTCUSD&interval=daily&series_type=close&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    const result = MACDSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('TECH_002.3: MACD Values Validity', async () => {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=MACD&symbol=BTCUSD&interval=daily&series_type=close&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    const latestDate = Object.keys(data['Technical Analysis: MACD'])[0];
    const macd = parseFloat(data['Technical Analysis: MACD'][latestDate].MACD);
    const signal = parseFloat(data['Technical Analysis: MACD'][latestDate].MACD_Signal);
    const hist = parseFloat(data['Technical Analysis: MACD'][latestDate].MACD_Hist);
    
    // Histogram should equal MACD - Signal
    const calculatedHist = macd - signal;
    expect(Math.abs(hist - calculatedHist)).toBeLessThan(0.01);
  });
});
```
```

---

## 3. On-Chain Data Tests

### 3.1 Glassnode Exchange Flows Test
```markdown
**Test ID**: ONCHAIN_001
**Priority**: CRITICAL
**API Endpoint**: https://api.glassnode.com/v1/metrics/transactions/transfers_volume_exchanges_net

**Zod Schema**:
```typescript
const GlassnodeExchangeFlowSchema = z.array(z.object({
  t: z.number(), // Unix timestamp
  v: z.number()  // Net flow value
}));
```

**Test Implementation**:
```typescript
describe('Glassnode Exchange Flows', () => {
  
  test('ONCHAIN_001.1: API Availability', async () => {
    const response = await fetch(
      `https://api.glassnode.com/v1/metrics/transactions/transfers_volume_exchanges_net?a=BTC&api_key=${process.env.GLASSNODE_API_KEY}`
    );
    
    expect(response.status).toBe(200);
  });

  test('ONCHAIN_001.2: Response Structure', async () => {
    const response = await fetch(
      `https://api.glassnode.com/v1/metrics/transactions/transfers_volume_exchanges_net?a=BTC&api_key=${process.env.GLASSNODE_API_KEY}`
    );
    const data = await response.json();
    
    const result = GlassnodeExchangeFlowSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('ONCHAIN_001.3: Data Freshness', async () => {
    const response = await fetch(
      `https://api.glassnode.com/v1/metrics/transactions/transfers_volume_exchanges_net?a=BTC&api_key=${process.env.GLASSNODE_API_KEY}`
    );
    const data = await response.json();
    
    const latestTimestamp = data[data.length - 1].t;
    const now = Date.now() / 1000;
    const diffHours = (now - latestTimestamp) / 3600;
    
    // Data should be within last 24 hours
    expect(diffHours).toBeLessThan(24);
  });

  test('ONCHAIN_001.4: Value Sanity Check', async () => {
    const response = await fetch(
      `https://api.glassnode.com/v1/metrics/transactions/transfers_volume_exchanges_net?a=BTC&api_key=${process.env.GLASSNODE_API_KEY}`
    );
    const data = await response.json();
    
    const latestFlow = data[data.length - 1].v;
    
    // Net flow should be reasonable (not more than 50k BTC per day)
    expect(Math.abs(latestFlow)).toBeLessThan(50000);
  });
});
```
```

### 3.2 Active Addresses Test
```markdown
**Test ID**: ONCHAIN_002
**Priority**: HIGH
**API Endpoint**: https://api.glassnode.com/v1/metrics/addresses/active_count

**Test Implementation**:
```typescript
describe('Glassnode Active Addresses', () => {
  
  test('ONCHAIN_002.1: API Availability', async () => {
    const response = await fetch(
      `https://api.glassnode.com/v1/metrics/addresses/active_count?a=BTC&api_key=${process.env.GLASSNODE_API_KEY}`
    );
    
    expect(response.status).toBe(200);
  });

  test('ONCHAIN_002.2: Active Address Count Range', async () => {
    const response = await fetch(
      `https://api.glassnode.com/v1/metrics/addresses/active_count?a=BTC&api_key=${process.env.GLASSNODE_API_KEY}`
    );
    const data = await response.json();
    
    const latestCount = data[data.length - 1].v;
    
    // Active addresses should be between 500k and 2M
    expect(latestCount).toBeGreaterThan(500000);
    expect(latestCount).toBeLessThan(2000000);
  });
});
```
```

---

## 4. Derivatives Market Tests

### 4.1 Coinglass Funding Rate Test
```markdown
**Test ID**: DERIV_001
**Priority**: CRITICAL
**API Endpoint**: https://open-api.coinglass.com/public/v2/funding

**Zod Schema**:
```typescript
const FundingRateSchema = z.object({
  code: z.literal('0'),
  data: z.array(z.object({
    exchangeName: z.string(),
    symbol: z.string(),
    rate: z.string().regex(/^-?\d+\.?\d*$/)
  }))
});
```

**Test Implementation**:
```typescript
describe('Coinglass Funding Rates', () => {
  
  test('DERIV_001.1: API Availability', async () => {
    const response = await fetch(
      'https://open-api.coinglass.com/public/v2/funding',
      {
        headers: {
          'coinglassSecret': process.env.COINGLASS_API_KEY
        }
      }
    );
    
    expect(response.status).toBe(200);
  });

  test('DERIV_001.2: Response Structure', async () => {
    const response = await fetch(
      'https://open-api.coinglass.com/public/v2/funding',
      {
        headers: {
          'coinglassSecret': process.env.COINGLASS_API_KEY
        }
      }
    );
    const data = await response.json();
    
    const result = FundingRateSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('DERIV_001.3: Funding Rate Range', async () => {
    const response = await fetch(
      'https://open-api.coinglass.com/public/v2/funding',
      {
        headers: {
          'coinglassSecret': process.env.COINGLASS_API_KEY
        }
      }
    );
    const data = await response.json();
    
    const btcRates = data.data.filter(item => item.symbol === 'BTC');
    
    btcRates.forEach(exchange => {
      const rate = parseFloat(exchange.rate);
      // Funding rates typically between -0.5% and +0.5%
      expect(rate).toBeGreaterThan(-0.005);
      expect(rate).toBeLessThan(0.005);
    });
  });

  test('DERIV_001.4: Multiple Exchange Coverage', async () => {
    const response = await fetch(
      'https://open-api.coinglass.com/public/v2/funding',
      {
        headers: {
          'coinglassSecret': process.env.COINGLASS_API_KEY
        }
      }
    );
    const data = await response.json();
    
    const btcExchanges = data.data.filter(item => item.symbol === 'BTC');
    
    // Should have data from at least 5 major exchanges
    expect(btcExchanges.length).toBeGreaterThanOrEqual(5);
  });
});
```
```

### 4.2 Open Interest Test
```markdown
**Test ID**: DERIV_002
**Priority**: HIGH
**API Endpoint**: https://open-api.coinglass.com/public/v2/openInterest

**Test Implementation**:
```typescript
describe('Coinglass Open Interest', () => {
  
  test('DERIV_002.1: API Availability', async () => {
    const response = await fetch(
      'https://open-api.coinglass.com/public/v2/openInterest?symbol=BTC',
      {
        headers: {
          'coinglassSecret': process.env.COINGLASS_API_KEY
        }
      }
    );
    
    expect(response.status).toBe(200);
  });

  test('DERIV_002.2: Open Interest Value Range', async () => {
    const response = await fetch(
      'https://open-api.coinglass.com/public/v2/openInterest?symbol=BTC',
      {
        headers: {
          'coinglassSecret': process.env.COINGLASS_API_KEY
        }
      }
    );
    const data = await response.json();
    
    const totalOI = data.data.totalOpenInterest;
    
    // Total OI typically between $10B and $50B
    expect(totalOI).toBeGreaterThan(10000000000);
    expect(totalOI).toBeLessThan(50000000000);
  });
});
```
```

---

## 5. Sentiment Data Tests

### 5.1 Fear & Greed Index Test
```markdown
**Test ID**: SENT_001
**Priority**: HIGH
**API Endpoint**: https://api.alternative.me/fng/

**Zod Schema**:
```typescript
const FearGreedSchema = z.object({
  name: z.literal('Fear and Greed Index'),
  data: z.array(z.object({
    value: z.string().regex(/^\d+$/),
    value_classification: z.enum(['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed']),
    timestamp: z.string()
  }))
});
```

**Test Implementation**:
```typescript
describe('Fear & Greed Index', () => {
  
  test('SENT_001.1: API Availability', async () => {
    const response = await fetch('https://api.alternative.me/fng/');
    
    expect(response.status).toBe(200);
  });

  test('SENT_001.2: Response Structure', async () => {
    const response = await fetch('https://api.alternative.me/fng/');
    const data = await response.json();
    
    const result = FearGreedSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('SENT_001.3: Value Range', async () => {
    const response = await fetch('https://api.alternative.me/fng/');
    const data = await response.json();
    
    const currentValue = parseInt(data.data[0].value);
    
    expect(currentValue).toBeGreaterThanOrEqual(0);
    expect(currentValue).toBeLessThanOrEqual(100);
  });

  test('SENT_001.4: Classification Consistency', async () => {
    const response = await fetch('https://api.alternative.me/fng/');
    const data = await response.json();
    
    const value = parseInt(data.data[0].value);
    const classification = data.data[0].value_classification;
    
    // Verify classification matches value
    if (value <= 25) expect(classification).toBe('Extreme Fear');
    else if (value <= 45) expect(classification).toBe('Fear');
    else if (value <= 55) expect(classification).toBe('Neutral');
    else if (value <= 75) expect(classification).toBe('Greed');
    else expect(classification).toBe('Extreme Greed');
  });
});
```
```

### 5.2 Twitter Sentiment Test (Using Twitter API v2)
```markdown
**Test ID**: SENT_002
**Priority**: MEDIUM
**API Endpoint**: https://api.twitter.com/2/tweets/search/recent

**Test Implementation**:
```typescript
describe('Twitter Bitcoin Sentiment', () => {
  
  test('SENT_002.1: API Availability', async () => {
    const response = await fetch(
      'https://api.twitter.com/2/tweets/search/recent?query=bitcoin&max_results=10',
      {
        headers: {
          'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
        }
      }
    );
    
    expect(response.status).toBe(200);
  });

  test('SENT_002.2: Tweet Data Completeness', async () => {
    const response = await fetch(
      'https://api.twitter.com/2/tweets/search/recent?query=bitcoin&max_results=10&tweet.fields=created_at,public_metrics',
      {
        headers: {
          'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
        }
      }
    );
    const data = await response.json();
    
    expect(data.data).toBeDefined();
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data[0].text).toBeDefined();
    expect(data.data[0].created_at).toBeDefined();
  });

  test('SENT_002.3: Rate Limit Check', async () => {
    // Twitter allows 450 requests per 15 minutes for search
    const callsInLast15Min = getAPICallCount('twitter', 900);
    expect(callsInLast15Min).toBeLessThan(400);
  });
});
```
```

---

## 6. News Data Tests

### 6.1 NewsAPI Bitcoin News Test
```markdown
**Test ID**: NEWS_001
**Priority**: HIGH
**API Endpoint**: https://newsapi.org/v2/everything

**Zod Schema**:
```typescript
const NewsAPISchema = z.object({
  status: z.literal('ok'),
  totalResults: z.number(),
  articles: z.array(z.object({
    source: z.object({
      id: z.string().nullable(),
      name: z.string()
    }),
    title: z.string(),
    description: z.string().nullable(),
    url: z.string().url(),
    publishedAt: z.string().datetime()
  }))
});
```

**Test Implementation**:
```typescript
describe('NewsAPI Bitcoin News', () => {
  
  test('NEWS_001.1: API Availability', async () => {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=bitcoin&apiKey=${process.env.NEWS_API_KEY}`
    );
    
    expect(response.status).toBe(200);
  });

  test('NEWS_001.2: Response Structure', async () => {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=bitcoin&apiKey=${process.env.NEWS_API_KEY}`
    );
    const data = await response.json();
    
    const result = NewsAPISchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('NEWS_001.3: Article Freshness', async () => {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=bitcoin&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.articles.length > 0) {
      const latestArticle = new Date(data.articles[0].publishedAt);
      const now = new Date();
      const diffHours = (now.getTime() - latestArticle.getTime()) / 1000 / 3600;
      
      // Latest article should be within last 24 hours
      expect(diffHours).toBeLessThan(24);
    }
  });

  test('NEWS_001.4: Minimum Article Count', async () => {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=bitcoin&from=${new Date(Date.now() - 24*3600*1000).toISOString()}&apiKey=${process.env.NEWS_API_KEY}`
    );
    const data = await response.json();
    
    // Should have at least 5 articles in last 24 hours
    expect(data.articles.length).toBeGreaterThanOrEqual(5);
  });
});
```
```

---

## 7. Integration Tests

### 7.1 Multi-Source Price Validation Test
```markdown
**Test ID**: INTEG_001
**Priority**: CRITICAL

**Test Implementation**:
```typescript
describe('Multi-Source Price Validation', () => {
  
  test('INTEG_001: Price Consistency Across Sources', async () => {
    const [alphaVantage, coinGecko, binance] = await Promise.all([
      getAlphaVantagePrice(),
      getCoinGeckoPrice(),
      getBinancePrice()
    ]);
    
    // Calculate average price
    const avgPrice = (alphaVantage + coinGecko + binance) / 3;
    
    // Each price should be within 0.5% of average
    const alphaDiff = Math.abs(alphaVantage - avgPrice) / avgPrice * 100;
    const geckoDiff = Math.abs(coinGecko - avgPrice) / avgPrice * 100;
    const binanceDiff = Math.abs(binance - avgPrice) / avgPrice * 100;
    
    expect(alphaDiff).toBeLessThan(0.5);
    expect(geckoDiff).toBeLessThan(0.5);
    expect(binanceDiff).toBeLessThan(0.5);
  });
});
```
```

### 7.2 Signal Confluence Test
```markdown
**Test ID**: INTEG_002
**Priority**: HIGH

**Test Implementation**:
```typescript
describe('Signal Confluence Validation', () => {
  
  test('INTEG_002: Technical + On-Chain + Sentiment Alignment', async () => {
    const [technical, onchain, sentiment, derivatives] = await Promise.all([
      getTechnicalSignals(), // RSI, MACD, etc.
      getOnChainSignals(),   // Exchange flows, active addresses
      getSentimentSignals(), // Fear & Greed, social sentiment
      getDerivativesSignals() // Funding rate, OI
    ]);
    
    // Verify all signal objects have required properties
    expect(technical).toHaveProperty('rsi');
    expect(technical).toHaveProperty('macd');
    expect(onchain).toHaveProperty('exchangeFlow');
    expect(sentiment).toHaveProperty('fearGreedIndex');
    expect(derivatives).toHaveProperty('fundingRate');
    
    // Verify values are within expected ranges
    expect(technical.rsi).toBeGreaterThanOrEqual(0);
    expect(technical.rsi).toBeLessThanOrEqual(100);
    expect(sentiment.fearGreedIndex).toBeGreaterThanOrEqual(0);
    expect(sentiment.fearGreedIndex).toBeLessThanOrEqual(100);
  });
});
```
```

---

## 8. Mastra AI Workflow Integration Tests

### 8.1 Agent Workflow Data Pipeline Test
```markdown
**Test ID**: MASTRA_001
**Priority**: CRITICAL

**Test Implementation**:
```typescript
import { Mastra } from '@mastra/core';
import { Agent } from '@mastra/core';

describe('Mastra Agent Data Pipeline', () => {
  
  let mastra: Mastra;
  let dataCollectorAgent: Agent;
  
  beforeAll(() => {
    mastra = new Mastra({
      agents: {
        dataCollector: dataCollectorAgent
      }
    });
  });

  test('MASTRA_001.1: Agent Initialization', () => {
    expect(dataCollectorAgent).toBeDefined();
    expect(dataCollectorAgent.name).toBe('Data Collector Agent');
  });

  test('MASTRA_001.2: Tool Availability', () => {
    const tools = dataCollectorAgent.getTools();
    
    expect(tools).toContain('fetchBitcoinPrice');
    expect(tools).toContain('fetchTechnicalIndicators');
    expect(tools).toContain('fetchOnChainData');
    expect(tools).toContain('fetchSentimentData');
  });

  test('MASTRA_001.3: Agent Execution Pipeline', async () => {
    const result = await dataCollectorAgent.execute({
      task: 'Collect all Bitcoin market data'
    });
    
    expect(result.status).toBe('success');
    expect(result.data).toHaveProperty('price');
    expect(result.data).toHaveProperty('technical');
    expect(result.data).toHaveProperty('onchain');
    expect(result.data).toHaveProperty('sentiment');
  });

  test('MASTRA_001.4: Error Handling and Fallbacks', async () => {
    // Simulate API failure
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API Error'));
    
    const result = await dataCollectorAgent.execute({
      task: 'Collect all Bitcoin market data'
    });
    
    // Agent should use fallback data sources
    expect(result.status).toBe('success');
    expect(result.warnings).toContain('Used fallback data source');
  });
});
```
```

### 8.2 Mastra Tool Validation Test
```markdown
**Test ID**: MASTRA_002
**Priority**: HIGH

**Test Implementation**:
```typescript
describe('Mastra Tool Validation', () => {
  
  test('MASTRA_002.1: Price Fetcher Tool', async () => {
    const priceTool = mastra.getTool('fetchBitcoinPrice');
    
    const result = await priceTool.execute({});
    
    expect(result).toHaveProperty('price');
    expect(result).toHaveProperty('source');
    expect(result).toHaveProperty('timestamp');
    expect(result.price).toBeGreaterThan(50000);
  });

  test('MASTRA_002.2: Technical Indicator Tool', async () => {
    const techTool = mastra.getTool('fetchTechnicalIndicators');
    
    const result = await techTool.execute({
      indicators: ['RSI', 'MACD', 'BB']
    });
    
    expect(result).toHaveProperty('rsi');
    expect(result).toHaveProperty('macd');
    expect(result).toHaveProperty('bollingerBands');
  });

  test('MASTRA_002.3: On-Chain Data Tool', async () => {
    const onchainTool = mastra.getTool('fetchOnChainData');
    
    const result = await onchainTool.execute({
      metrics: ['exchangeFlows', 'activeAddresses']
    });
    
    expect(result).toHaveProperty('exchangeFlows');
    expect(result).toHaveProperty('activeAddresses');
  });
});
```
```

---

## 9. Performance and Reliability Tests

### 9.1 API Response Time Test
```markdown
**Test ID**: PERF_001
**Priority**: MEDIUM

**Test Implementation**:
```typescript
describe('API Response Time Performance', () => {
  
  test('PERF_001.1: Price API Response Time', async () => {
    const startTime = Date.now();
    
    await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Should respond within 2 seconds
    expect(responseTime).toBeLessThan(2000);
  });

  test('PERF_001.2: On-Chain API Response Time', async () => {
    const startTime = Date.now();
    
    await fetch(
      `https://api.glassnode.com/v1/metrics/transactions/transfers_volume_exchanges_net?a=BTC&api_key=${process.env.GLASSNODE_API_KEY}`
    );
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Should respond within 3 seconds
    expect(responseTime).toBeLessThan(3000);
  });

  test('PERF_001.3: Parallel API Call Performance', async () => {
    const startTime = Date.now();
    
    await Promise.all([
      getAlphaVantagePrice(),
      getGlassnodeData(),
      getCoinglassData(),
      getFearGreedIndex()
    ]);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // All parallel calls should complete within 5 seconds
    expect(totalTime).toBeLessThan(5000);
  });
});
```
```

### 9.2 API Rate Limit Management Test
```markdown
**Test ID**: PERF_002
**Priority**: HIGH

**Test Implementation**:
```typescript
describe('API Rate Limit Management', () => {
  
  test('PERF_002.1: Alpha Vantage Rate Limit Tracking', async () => {
    // Alpha Vantage: 5 calls per minute
    const callCount = await getAPICallCount('alphavantage', 60);
    
    expect(callCount).toBeLessThan(5);
  });

  test('PERF_002.2: Rate Limit Backoff Strategy', async () => {
    // Simulate hitting rate limit
    const calls = [];
    for (let i = 0; i < 6; i++) {
      calls.push(makeAlphaVantageCall());
    }
    
    const results = await Promise.allSettled(calls);
    
    // 6th call should be delayed or queued
    const failedCalls = results.filter(r => r.status === 'rejected');
    expect(failedCalls.length).toBeLessThanOrEqual(1);
  });

  test('PERF_002.3: Glassnode Rate Limit (Professional Tier)', async () => {
    // Glassnode Professional: 10 requests per minute
    const callCount = await getAPICallCount('glassnode', 60);
    
    expect(callCount).toBeLessThan(10);
  });
});
```
```

---

## 10. Data Quality and Anomaly Detection Tests

### 10.1 Price Spike Detection Test
```markdown
**Test ID**: QUALITY_001
**Priority**: HIGH

**Test Implementation**:
```typescript
describe('Price Spike Anomaly Detection', () => {
  
  test('QUALITY_001.1: Detect Unrealistic Price Spikes', async () => {
    const currentPrice = await getCurrentBitcoinPrice();
    const historicalAvg = await get24HourAveragePrice();
    
    const priceChange = Math.abs(currentPrice - historicalAvg) / historicalAvg * 100;
    
    // Alert if price changed more than 20% in 24h (likely data error)
    if (priceChange > 20) {
      console.warn(`Unusual price spike detected: ${priceChange.toFixed(2)}%`);
    }
    
    // Test should not fail, but log warning
    expect(priceChange).toBeLessThan(50); // Absolute max threshold
  });

  test('QUALITY_001.2: Cross-Source Price Validation', async () => {
    const prices = await Promise.all([
      getAlphaVantagePrice(),
      getCoinGeckoPrice(),
      getBinancePrice(),
      getCoinbasePrice()
    ]);
    
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    // Check if any price deviates more than 2% from average
    const outliers = prices.filter(price => {
      const deviation = Math.abs(price - avgPrice) / avgPrice * 100;
      return deviation > 2;
    });
    
    expect(outliers.length).toBe(0);
  });
});
```
```

### 10.2 Data Completeness Test
```markdown
**Test ID**: QUALITY_002
**Priority**: MEDIUM

**Test Implementation**:
```typescript
describe('Data Completeness Validation', () => {
  
  test('QUALITY_002.1: All Required Data Points Present', async () => {
    const marketData = await collectAllMarketData();
    
    const requiredFields = [
      'price.current',
      'price.change24h',
      'volume.24h',
      'technical.rsi',
      'technical.macd',
      'onchain.exchangeFlow',
      'onchain.activeAddresses',
      'sentiment.fearGreed',
      'derivatives.fundingRate'
    ];
    
    requiredFields.forEach(field => {
      const fieldValue = getNestedProperty(marketData, field);
      expect(fieldValue).toBeDefined();
      expect(fieldValue).not.toBeNull();
    });
  });

  test('QUALITY_002.2: Historical Data Depth', async () => {
    const historicalData = await getHistoricalPriceData(30); // 30 days
    
    expect(historicalData.length).toBeGreaterThanOrEqual(30);
    
    // Verify no gaps in data
    for (let i = 1; i < historicalData.length; i++) {
      const timeDiff = historicalData[i].timestamp - historicalData[i-1].timestamp;
      const hoursDiff = timeDiff / 1000 / 3600;
      
      // Should not have gaps larger than 25 hours
      expect(hoursDiff).toBeLessThan(25);
    }
  });
});
```
```

---

## 11. Error Handling and Recovery Tests

### 11.1 API Failure Recovery Test
```markdown
**Test ID**: ERROR_001
**Priority**: CRITICAL

**Test Implementation**:
```typescript
describe('API Failure Recovery', () => {
  
  test('ERROR_001.1: Primary API Failure Fallback', async () => {
    // Mock Alpha Vantage failure
    jest.spyOn(global, 'fetch').mockImplementationOnce(() => 
      Promise.reject(new Error('API Unavailable'))
    );
    
    const price = await getBitcoinPriceWithFallback();
    
    // Should successfully get price from fallback source
    expect(price).toBeGreaterThan(50000);
    expect(price).toBeLessThan(200000);
  });

  test('ERROR_001.2: Multiple Source Failure Handling', async () => {
    // Mock all price sources failing
    jest.spyOn(global, 'fetch').mockImplementation(() => 
      Promise.reject(new Error('Network Error'))
    );
    
    const result = await getBitcoinPriceWithFallback();
    
    // Should return cached price with warning
    expect(result).toHaveProperty('price');
    expect(result).toHaveProperty('warning');
    expect(result.warning).toContain('Using cached data');
  });

  test('ERROR_001.3: Partial Data Failure', async () => {
    // Simulate on-chain data failure but other sources OK
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('glassnode')) {
        return Promise.reject(new Error('Glassnode Error'));
      }
      return Promise.resolve(new Response(JSON.stringify({})));
    });
    
    const marketData = await collectAllMarketData();
    
    // Should have price and technical data
    expect(marketData.price).toBeDefined();
    expect(marketData.technical).toBeDefined();
    
    // On-chain should have warning flag
    expect(marketData.onchain.error).toBe(true);
  });
});
```
```

### 11.2 Timeout Handling Test
```markdown
**Test ID**: ERROR_002
**Priority**: HIGH

**Test Implementation**:
```typescript
describe('API Timeout Handling', () => {
  
  test('ERROR_002.1: Request Timeout After 10 Seconds', async () => {
    // Mock slow API response
    jest.spyOn(global, 'fetch').mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 15000))
    );
    
    const startTime = Date.now();
    
    try {
      await fetchWithTimeout('https://api.example.com', 10000);
      fail('Should have timed out');
    } catch (error) {
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeLessThan(11000);
      expect(error.message).toContain('timeout');
    }
  });

  test('ERROR_002.2: Retry Logic After Timeout', async () => {
    let callCount = 0;
    
    jest.spyOn(global, 'fetch').mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return new Promise(resolve => setTimeout(resolve, 15000));
      }
      return Promise.resolve(new Response(JSON.stringify({ price: 100000 })));
    });
    
    const result = await fetchWithRetry('https://api.example.com', {
      timeout: 10000,
      retries: 1
    });
    
    expect(callCount).toBe(2);
    expect(result).toBeDefined();
  });
});
```
```

---

## 12. Security and Authentication Tests

### 12.1 API Key Validation Test
```markdown
**Test ID**: SEC_001
**Priority**: CRITICAL

**Test Implementation**:
```typescript
describe('API Key Validation', () => {
  
  test('SEC_001.1: All Required API Keys Present', () => {
    const requiredKeys = [
      'ALPHA_VANTAGE_API_KEY',
      'GLASSNODE_API_KEY',
      'COINGLASS_API_KEY',
      'NEWS_API_KEY',
      'TWITTER_BEARER_TOKEN'
    ];
    
    requiredKeys.forEach(key => {
      expect(process.env[key]).toBeDefined();
      expect(process.env[key]).not.toBe('');
    });
  });

  test('SEC_001.2: API Key Format Validation', () => {
    // Alpha Vantage keys are typically alphanumeric, 16 chars
    expect(process.env.ALPHA_VANTAGE_API_KEY).toMatch(/^[A-Z0-9]{16}$/);
    
    // Glassnode keys start with specific prefix
    expect(process.env.GLASSNODE_API_KEY).toMatch(/^[a-zA-Z0-9-_]{32,}$/);
  });

  test('SEC_001.3: API Key Functionality Test', async () => {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    
    const data = await response.json();
    
    // Should not return API key error
    expect(data).not.toHaveProperty('Error Message');
    expect(data).not.toHaveProperty('Note'); // Rate limit message
  });
});
```
```

---

## 13. Test Execution Strategy

### 13.1 Test Suite Configuration
```typescript
// File: jest.config.js

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000, // 30 seconds for API tests
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/tests/**'
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true
      }
    }
  }
};
```

### 13.2 Test Execution Order
```markdown
**Priority Execution Order**:
1. **CRITICAL Tests First** (Price, On-Chain, Mastra Integration)
2. **HIGH Priority** (Technical Indicators, Derivatives, Sentiment)
3. **MEDIUM Priority** (Performance, Data Quality)
4. **LOW Priority** (Optional enhancements)

**Failure Strategy**:
- If CRITICAL test fails: STOP execution, alert immediately
- If HIGH test fails: Continue but flag for review
- If MEDIUM/LOW fails: Log warning, continue execution
```

### 13.3 Continuous Testing Schedule
```markdown
**Test Schedule**:
- **Every 5 minutes**: Price API tests (PRICE_001, PRICE_002)
- **Every 15 minutes**: Full technical indicator suite
- **Every 30 minutes**: On-chain data tests
- **Every hour**: Complete integration tests
- **Every 4 hours**: Performance and quality tests
- **Daily**: Full security and compliance audit

**Pre-Agent Execution**:
Run CRITICAL tests before every agent decision:
1. Price data availability (PRICE_001)
2. Data freshness checks
3. Cross-source validation (INTEG_001)
4. Mastra workflow health (MASTRA_001)
```

---

## 14. Helper Functions and Utilities

### 14.1 Common Test Utilities
```typescript
// File: src/tests/utils/test-helpers.ts

import { z } from 'zod';

/**
 * Fetch with timeout wrapper
 */
export async function fetchWithTimeout(
  url: string, 
  timeout: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Fetch with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: {
    timeout?: number;
    retries?: number;
    backoff?: number;
  } = {}
): Promise<Response> {
  const { timeout = 10000, retries = 1, backoff = 1000 } = options;
  
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetchWithTimeout(url, timeout);
    } catch (error) {
      if (i === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, backoff * (i + 1)));
    }
  }
  
  throw new Error('All retries failed');
}

/**
 * Get nested property from object
 */
export function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Track API call count
 */
const apiCallTracker = new Map<string, number[]>();

export function trackAPICall(apiName: string): void {
  const now = Date.now();
  if (!apiCallTracker.has(apiName)) {
    apiCallTracker.set(apiName, []);
  }
  apiCallTracker.get(apiName)!.push(now);
}

export function getAPICallCount(apiName: string, windowSeconds: number): number {
  const calls = apiCallTracker.get(apiName) || [];
  const cutoff = Date.now() - (windowSeconds * 1000);
  const recentCalls = calls.filter(timestamp => timestamp > cutoff);
  
  // Update tracker to remove old calls
  apiCallTracker.set(apiName, recentCalls);
  
  return recentCalls.length;
}

/**
 * Validate data freshness
 */
export function isDataFresh(
  timestamp: number | string,
  maxAgeMinutes: number
): boolean {
  const dataTime = typeof timestamp === 'string' 
    ? new Date(timestamp).getTime() 
    : timestamp;
  const now = Date.now();
  const diffMinutes = (now - dataTime) / 1000 / 60;
  
  return diffMinutes <= maxAgeMinutes;
}

/**
 * Calculate price deviation percentage
 */
export function calculateDeviation(value: number, reference: number): number {
  return Math.abs(value - reference) / reference * 100;
}

/**
 * Zod schema validator with detailed error logging
 */
export function validateWithSchema<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  dataSourceName: string
): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    console.error(`Validation failed for ${dataSourceName}:`);
    console.error(JSON.stringify(result.error.issues, null, 2));
    throw new Error(`${dataSourceName} validation failed`);
  }
  
  return result.data;
}
```

### 14.2 Test Data Mocks
```typescript
// File: src/tests/mocks/api-responses.ts

export const mockAlphaVantageResponse = {
  'Realtime Currency Exchange Rate': {
    '1. From_Currency Code': 'BTC',
    '2. From_Currency Name': 'Bitcoin',
    '3. To_Currency Code': 'USD',
    '4. To_Currency Name': 'United States Dollar',
    '5. Exchange Rate': '105432.50000000',
    '6. Last Refreshed': new Date().toISOString(),
    '7. Time Zone': 'UTC',
    '8. Bid Price': '105420.00000000',
    '9. Ask Price': '105445.00000000'
  }
};

export const mockCoinGeckoResponse = {
  bitcoin: {
    usd: 105430,
    usd_24h_change: 2.5,
    usd_24h_vol: 25000000000,
    last_updated_at: Math.floor(Date.now() / 1000)
  }
};

export const mockGlassnodeResponse = [
  {
    t: Math.floor(Date.now() / 1000) - 3600,
    v: -2500.5
  },
  {
    t: Math.floor(Date.now() / 1000),
    v: -3200.8
  }
];

export const mockFearGreedResponse = {
  name: 'Fear and Greed Index',
  data: [
    {
      value: '45',
      value_classification: 'Neutral',
      timestamp: Math.floor(Date.now() / 1000).toString()
    }
  ]
};
```

---

## 15. Monitoring and Alerting

### 15.1 Test Result Logging
```typescript
// File: src/tests/monitoring/test-logger.ts

import { Logger } from '@mastra/core';

export class TestResultLogger {
  private logger: Logger;
  
  constructor() {
    this.logger = new Logger({ component: 'API-Tests' });
  }
  
  logTestResult(testId: string, status: 'PASS' | 'FAIL' | 'WARN', details: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      testId,
      status,
      details
    };
    
    if (status === 'FAIL') {
      this.logger.error(`Test ${testId} FAILED`, logEntry);
      this.sendAlert(testId, details);
    } else if (status === 'WARN') {
      this.logger.warn(`Test ${testId} WARNING`, logEntry);
    } else {
      this.logger.info(`Test ${testId} PASSED`, logEntry);
    }
    
    // Store in database or send to monitoring service
    this.storeTestResult(logEntry);
  }
  
  private async sendAlert(testId: string, details: any) {
    // Integrate with Discord/Slack/Email
    if (testId.startsWith('CRITICAL')) {
      // Send immediate alert
      await this.sendUrgentNotification(testId, details);
    }
  }
  
  private async storeTestResult(logEntry: any) {
    // Store in database for historical analysis
    // Could use Mastra's built-in storage or external DB
  }
}
```

### 15.2 Health Dashboard Endpoint
```typescript
// File: src/api/health.ts

import express from 'express';

export const healthRouter = express.Router();

healthRouter.get('/health/data-sources', async (req, res) => {
  const healthStatus = {
    timestamp: new Date().toISOString(),
    sources: {
      alphaVantage: await testAlphaVantageHealth(),
      coinGecko: await testCoinGeckoHealth(),
      glassnode: await testGlassnodeHealth(),
      coinglass: await testCoinglassHealth(),
      newsAPI: await testNewsAPIHealth()
    },
    overall: 'healthy' // Calculate based on critical sources
  };
  
  res.json(healthStatus);
});
```

---

## Summary Checklist

### Pre-Deployment Verification
- [ ] All CRITICAL tests passing
- [ ] API keys configured and validated
- [ ] Fallback mechanisms tested
- [ ] Rate limits configured correctly
- [ ] Error handling verified
- [ ] Logging and monitoring active

### Before Each Agent Execution
- [ ] Run PRICE_001 and PRICE_002
- [ ] Verify data freshness (< 60 min)
- [ ] Check multi-source price consistency
- [ ] Validate Mastra workflow health

### Daily Maintenance
- [ ] Review failed test logs
- [ ] Check API rate limit usage
- [ ] Verify data quality metrics
- [ ] Update test thresholds if needed

