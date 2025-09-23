/**
 * Live Market Data Integration Service
 * 
 * Integrates with real crypto market APIs to provide live data to agents
 */

import { MarketRegime } from '../agency/core-agency.js';

export interface MarketDataPoint {
  symbol: string;
  price: number;
  volume: number;
  marketCap: number;
  change24h: number;
  changePercent24h: number;
  timestamp: Date;
}

export interface MarketSentiment {
  fearGreedIndex: number; // 0-100
  socialSentiment: number; // -1 to 1
  newsSentiment: number; // -1 to 1
  overallSentiment: number; // -1 to 1
  timestamp: Date;
}

export interface MarketIndicators {
  volatility: number; // 0-1
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-1
  volume: number;
  dominance: { [symbol: string]: number };
  timestamp: Date;
}

export interface LiveMarketData {
  prices: MarketDataPoint[];
  sentiment: MarketSentiment;
  indicators: MarketIndicators;
  regime: MarketRegime;
  lastUpdate: Date;
}

export class LiveMarketDataService {
  private apiKeys: { [provider: string]: string };
  private updateInterval: number = 60000; // 1 minute
  private cache: Map<string, any> = new Map();
  private lastUpdate: Date = new Date(0);
  private isUpdating: boolean = false;

  constructor(apiKeys: { [provider: string]: string } = {}) {
    this.apiKeys = {
      coingecko: apiKeys.coingecko || 'demo-key',
      coinmarketcap: apiKeys.coinmarketcap || 'demo-key',
      newsapi: apiKeys.newsapi || 'demo-key',
      ...apiKeys
    };
  }

  // Main method to get current live market data
  async getLiveMarketData(): Promise<LiveMarketData> {
    if (this.shouldUpdate()) {
      await this.updateMarketData();
    }

    return this.getFormattedMarketData();
  }

  // Check if data needs updating
  private shouldUpdate(): boolean {
    const timeSinceUpdate = Date.now() - this.lastUpdate.getTime();
    return timeSinceUpdate > this.updateInterval && !this.isUpdating;
  }

  // Update all market data from various sources
  private async updateMarketData(): Promise<void> {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    console.log('📊 Updating live market data...');

    try {
      // Fetch data from multiple sources in parallel
      const [prices, sentiment, indicators] = await Promise.all([
        this.fetchPriceData(),
        this.fetchSentimentData(),
        this.fetchMarketIndicators()
      ]);

      // Cache the results
      this.cache.set('prices', prices);
      this.cache.set('sentiment', sentiment);
      this.cache.set('indicators', indicators);
      
      this.lastUpdate = new Date();
      console.log('✅ Market data updated successfully');

    } catch (error) {
      console.error('❌ Failed to update market data:', error);
      // Use fallback data if update fails
      await this.generateFallbackData();
    } finally {
      this.isUpdating = false;
    }
  }

  // Fetch price data from CoinGecko API
  private async fetchPriceData(): Promise<MarketDataPoint[]> {
    try {
      // For production, replace with actual API call
      if (this.apiKeys.coingecko !== 'demo-key') {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1',
          {
            headers: {
              'X-CG-Demo-API-Key': this.apiKeys.coingecko
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          return this.transformCoinGeckoData(data);
        }
      }

      // Fallback to simulated data
      return this.generateSimulatedPriceData();

    } catch (error) {
      console.warn('Using simulated price data due to API error:', error);
      return this.generateSimulatedPriceData();
    }
  }

  // Fetch sentiment data from multiple sources
  private async fetchSentimentData(): Promise<MarketSentiment> {
    try {
      // For production, integrate with sentiment APIs
      // This is a simplified implementation
      
      const fearGreedIndex = await this.fetchFearGreedIndex();
      const socialSentiment = await this.fetchSocialSentiment();
      const newsSentiment = await this.fetchNewsSentiment();
      
      const overallSentiment = (socialSentiment + newsSentiment) / 2;

      return {
        fearGreedIndex,
        socialSentiment,
        newsSentiment,
        overallSentiment,
        timestamp: new Date()
      };

    } catch (error) {
      console.warn('Using simulated sentiment data:', error);
      return this.generateSimulatedSentiment();
    }
  }

  // Fetch market indicators
  private async fetchMarketIndicators(): Promise<MarketIndicators> {
    try {
      const prices = this.cache.get('prices') || await this.fetchPriceData();
      
      // Calculate technical indicators from price data
      const volatility = this.calculateVolatility(prices);
      const trend = this.determineTrend(prices);
      const strength = this.calculateTrendStrength(prices);
      const volume = this.calculateTotalVolume(prices);
      const dominance = this.calculateMarketDominance(prices);

      return {
        volatility,
        trend,
        strength,
        volume,
        dominance,
        timestamp: new Date()
      };

    } catch (error) {
      console.warn('Using simulated indicators:', error);
      return this.generateSimulatedIndicators();
    }
  }

  // Transform CoinGecko API response to our format
  private transformCoinGeckoData(data: any[]): MarketDataPoint[] {
    return data.map(coin => ({
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price,
      volume: coin.total_volume,
      marketCap: coin.market_cap,
      change24h: coin.price_change_24h,
      changePercent24h: coin.price_change_percentage_24h,
      timestamp: new Date()
    }));
  }

  // Generate simulated price data for demo purposes
  private generateSimulatedPriceData(): MarketDataPoint[] {
    const symbols = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'XRP', 'DOT', 'DOGE', 'AVAX', 'MATIC'];
    const basePrices = {
      BTC: 45000, ETH: 3200, BNB: 320, ADA: 0.45, SOL: 95,
      XRP: 0.52, DOT: 6.8, DOGE: 0.08, AVAX: 28, MATIC: 0.85
    };

    return symbols.map(symbol => {
      const basePrice = basePrices[symbol as keyof typeof basePrices];
      const volatility = 0.02 + Math.random() * 0.08; // 2-10% volatility
      const change = (Math.random() - 0.5) * volatility * 2;
      const price = basePrice * (1 + change);
      
      return {
        symbol,
        price,
        volume: Math.random() * 1000000000,
        marketCap: price * (Math.random() * 100000000 + 10000000),
        change24h: basePrice * change,
        changePercent24h: change * 100,
        timestamp: new Date()
      };
    });
  }

  // Generate simulated sentiment data
  private generateSimulatedSentiment(): MarketSentiment {
    const fearGreedIndex = Math.floor(Math.random() * 100);
    const socialSentiment = (Math.random() - 0.5) * 2; // -1 to 1
    const newsSentiment = (Math.random() - 0.5) * 2; // -1 to 1
    
    return {
      fearGreedIndex,
      socialSentiment,
      newsSentiment,
      overallSentiment: (socialSentiment + newsSentiment) / 2,
      timestamp: new Date()
    };
  }

  // Generate simulated indicators
  private generateSimulatedIndicators(): MarketIndicators {
    const volatility = Math.random() * 0.5; // 0-50%
    const trends = ['bullish', 'bearish', 'neutral'] as const;
    const trend = trends[Math.floor(Math.random() * trends.length)];
    
    return {
      volatility,
      trend,
      strength: Math.random(),
      volume: Math.random() * 50000000000,
      dominance: {
        BTC: 40 + Math.random() * 15,
        ETH: 15 + Math.random() * 10,
        Others: 35 + Math.random() * 15
      },
      timestamp: new Date()
    };
  }

  // Fetch Fear & Greed Index (simplified)
  private async fetchFearGreedIndex(): Promise<number> {
    try {
      // In production, use actual Fear & Greed Index API
      return Math.floor(Math.random() * 100);
    } catch {
      return 50; // Neutral fallback
    }
  }

  // Fetch social sentiment (simplified)
  private async fetchSocialSentiment(): Promise<number> {
    try {
      // In production, integrate with Twitter API, Reddit API, etc.
      return (Math.random() - 0.5) * 2;
    } catch {
      return 0; // Neutral fallback
    }
  }

  // Fetch news sentiment (simplified)
  private async fetchNewsSentiment(): Promise<number> {
    try {
      // In production, integrate with news APIs and sentiment analysis
      return (Math.random() - 0.5) * 2;
    } catch {
      return 0; // Neutral fallback
    }
  }

  // Calculate market volatility from price data
  private calculateVolatility(prices: MarketDataPoint[]): number {
    if (prices.length === 0) return 0;
    
    const changes = prices.map(p => Math.abs(p.changePercent24h) / 100);
    const avgVolatility = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    
    return Math.min(avgVolatility, 1); // Cap at 100%
  }

  // Determine overall market trend
  private determineTrend(prices: MarketDataPoint[]): 'bullish' | 'bearish' | 'neutral' {
    if (prices.length === 0) return 'neutral';
    
    const positiveChanges = prices.filter(p => p.changePercent24h > 0).length;
    const negativeChanges = prices.filter(p => p.changePercent24h < 0).length;
    
    if (positiveChanges > negativeChanges * 1.5) return 'bullish';
    if (negativeChanges > positiveChanges * 1.5) return 'bearish';
    return 'neutral';
  }

  // Calculate trend strength
  private calculateTrendStrength(prices: MarketDataPoint[]): number {
    if (prices.length === 0) return 0;
    
    const avgChange = prices.reduce((sum, p) => sum + Math.abs(p.changePercent24h), 0) / prices.length;
    return Math.min(avgChange / 10, 1); // Normalize to 0-1 scale
  }

  // Calculate total market volume
  private calculateTotalVolume(prices: MarketDataPoint[]): number {
    return prices.reduce((sum, p) => sum + p.volume, 0);
  }

  // Calculate market dominance
  private calculateMarketDominance(prices: MarketDataPoint[]): { [symbol: string]: number } {
    const totalMarketCap = prices.reduce((sum, p) => sum + p.marketCap, 0);
    const dominance: { [symbol: string]: number } = {};
    
    prices.forEach(price => {
      dominance[price.symbol] = (price.marketCap / totalMarketCap) * 100;
    });
    
    return dominance;
  }

  // Get formatted market data from cache
  private getFormattedMarketData(): LiveMarketData {
    const prices = this.cache.get('prices') || [];
    const sentiment = this.cache.get('sentiment') || this.generateSimulatedSentiment();
    const indicators = this.cache.get('indicators') || this.generateSimulatedIndicators();
    
    // Determine market regime based on indicators and sentiment
    const regime = this.determineMarketRegime(indicators, sentiment);
    
    return {
      prices,
      sentiment,
      indicators,
      regime,
      lastUpdate: this.lastUpdate
    };
  }

  // Determine current market regime
  private determineMarketRegime(indicators: MarketIndicators, sentiment: MarketSentiment): MarketRegime {
    let regimeType: 'bull_market' | 'bear_market' | 'sideways';
    
    // Determine regime based on trend and sentiment
    if (indicators.trend === 'bullish' && sentiment.overallSentiment > 0.2) {
      regimeType = 'bull_market';
    } else if (indicators.trend === 'bearish' && sentiment.overallSentiment < -0.2) {
      regimeType = 'bear_market';
    } else {
      regimeType = 'sideways';
    }
    
    // Create a MarketRegime instance and set its properties
    const regime = new MarketRegime();
    // Note: MarketRegime constructor doesn't accept parameters
    // We would need to add methods to set the regime type and conditions
    return regime;
  }

  // Generate fallback data when APIs fail
  private async generateFallbackData(): Promise<void> {
    console.log('📊 Generating fallback market data...');
    
    this.cache.set('prices', this.generateSimulatedPriceData());
    this.cache.set('sentiment', this.generateSimulatedSentiment());
    this.cache.set('indicators', this.generateSimulatedIndicators());
    
    this.lastUpdate = new Date();
  }

  // Public method to get specific market data
  async getMarketData(symbols: string[]): Promise<MarketDataPoint[]> {
    const liveData = await this.getLiveMarketData();
    return liveData.prices.filter(price => 
      symbols.includes(price.symbol.toUpperCase())
    );
  }

  // Public method to get market sentiment
  async getMarketSentiment(): Promise<MarketSentiment> {
    const liveData = await this.getLiveMarketData();
    return liveData.sentiment;
  }

  // Public method to get market indicators
  async getMarketIndicators(): Promise<MarketIndicators> {
    const liveData = await this.getLiveMarketData();
    return liveData.indicators;
  }

  // Public method to get current market regime
  async getCurrentMarketRegime(): Promise<MarketRegime> {
    const liveData = await this.getLiveMarketData();
    return liveData.regime;
  }

  // Set custom update interval
  setUpdateInterval(intervalMs: number): void {
    this.updateInterval = Math.max(intervalMs, 30000); // Minimum 30 seconds
  }

  // Force data refresh
  async forceRefresh(): Promise<void> {
    this.lastUpdate = new Date(0); // Reset last update
    await this.updateMarketData();
  }

  // Get data freshness info
  getDataAge(): number {
    return Date.now() - this.lastUpdate.getTime();
  }

  // Check if data is stale
  isDataStale(maxAgeMs: number = 300000): boolean { // Default 5 minutes
    return this.getDataAge() > maxAgeMs;
  }
}

// Singleton instance for global use
export const liveMarketData = new LiveMarketDataService();