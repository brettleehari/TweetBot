#!/usr/bin/env node

/**
 * ENHANCED EXECUTION AGENT with Market Intelligence Integration
 * Integrates Market Hunter and Market Analyzer for informed decisions
 */

import DatabaseService from './database/database-service.js';
import axios from 'axios';

class IntelligentExecutionAgent {
  constructor() {
    this.db = new DatabaseService();
    this.weeklyTargetReturn = 0.05; // 5% per week
    this.refreshInterval = 1 * 60 * 1000; // 1 minute
    this.startingValue = 10000;
    this.weekStartTime = Date.now();
    this.weeklyTarget = this.startingValue * (1 + this.weeklyTargetReturn);
    this.isRunning = false;
    this.tradingInterval = null;
    
    // Market intelligence cache
    this.marketIntelligence = {
      lastUpdate: 0,
      cacheDuration: 5 * 60 * 1000, // 5 minutes cache
      price: null,
      news: [],
      analysis: null
    };
  }

  async start() {
    if (this.isRunning) {
      console.log('🔄 Intelligent Execution Agent already running...');
      return;
    }

    this.isRunning = true;
    console.log('🧠 STARTING INTELLIGENT EXECUTION AGENT');
    console.log('💰 Managing $10K corpus with AI-powered decisions');
    console.log('📊 Interval: Every 1 minute');
    console.log('🎯 Weekly Goal: 5% return (Target: $' + this.weeklyTarget.toFixed(2) + ')');
    console.log('📈 Market Intelligence: NEWS + SENTIMENT + TECHNICAL ANALYSIS');
    console.log('🛑 Press Ctrl+C to stop\n');

    // Make immediate decision
    await this.makeIntelligentDecision();

    // Set up continuous trading (every 1 minute)
    this.tradingInterval = setInterval(async () => {
      if (this.isRunning) {
        try {
          await this.makeIntelligentDecision();
        } catch (error) {
          console.error('❌ Error in intelligent decision:', error.message);
        }
      }
    }, this.refreshInterval);

    // Graceful shutdown
    process.on('SIGINT', () => {
      this.stop();
    });
  }

  stop() {
    this.isRunning = false;
    if (this.tradingInterval) {
      clearInterval(this.tradingInterval);
      this.tradingInterval = null;
    }
    console.log('✅ Intelligent Execution Agent stopped');
    process.exit(0);
  }

  async makeIntelligentDecision() {
    const timestamp = new Date().toLocaleString();
    const startTime = Date.now();
    
    try {
      console.log(`\n🧠 [${timestamp}] Gathering Market Intelligence...`);
      
      // 1. Get current portfolio and market intelligence
      const [portfolio, marketIntel] = await Promise.all([
        this.db.getCurrentPortfolio(),
        this.gatherMarketIntelligence()
      ]);

      // 2. Calculate progress toward weekly goal
      const progressMetrics = this.calculateWeeklyProgress(portfolio);
      
      // 3. Generate INTELLIGENT decision using market data
      const decision = await this.generateIntelligentDecision(
        progressMetrics, 
        marketIntel, 
        portfolio
      );
      
      console.log(`\n🤖 [${timestamp}] Intelligent Execution Agent Decision:`);
      console.log(`   📊 Weekly Progress: ${progressMetrics.progressPercent}% (${progressMetrics.daysRemaining} days left)`);
      console.log(`   🎯 Target: $${this.weeklyTarget.toFixed(2)} | Current: $${(portfolio?.total_value_usd || 10000).toFixed(2)}`);
      console.log(`   📈 Market Sentiment: ${marketIntel.sentiment.overall} (${marketIntel.sentiment.score})`);
      console.log(`   📰 News Impact: ${marketIntel.impactScore}/100`);
      console.log(`   🔥 Market Trend: ${marketIntel.analysis.trend} | Volatility: ${marketIntel.analysis.volatility}`);
      console.log(`   ${decision.action.toUpperCase()} ${decision.amount.toFixed(4)} BTC @ $${decision.price.toFixed(2)}`);
      console.log(`   Reason: ${decision.reasoning}`);
      console.log(`   Confidence: ${decision.confidence}% | Urgency: ${decision.urgency}`);

      // 4. Execute decision if not HOLD
      let executed = false;
      if (decision.action !== 'HOLD') {
        executed = await this.executeDecision(decision, portfolio);
      }

      const executionTime = Date.now() - startTime;

      // 5. Log comprehensive decision to database
      await this.db.logAgentExecution(
        'Intelligent Execution Agent',
        'trading_decision',
        {
          progressMetrics,
          marketIntelligence: {
            sentiment: marketIntel.sentiment,
            impactScore: marketIntel.impactScore,
            trend: marketIntel.analysis.trend,
            volatility: marketIntel.analysis.volatility,
            newsCount: marketIntel.news.length
          },
          portfolioValue: portfolio?.total_value_usd || 10000
        },
        {
          action: decision.action,
          amount: decision.amount,
          price: decision.price,
          confidence: decision.confidence,
          reasoning: decision.reasoning,
          urgency: decision.urgency,
          executed: executed,
          marketBasis: decision.marketBasis
        },
        true,
        executionTime
      );

      console.log(`✅ Intelligent decision logged to database`);
      
    } catch (error) {
      console.error(`❌ [${timestamp}] Intelligent decision error:`, error.message);
    }
  }

  async gatherMarketIntelligence() {
    const now = Date.now();
    
    // Use cache if still fresh
    if (now - this.marketIntelligence.lastUpdate < this.marketIntelligence.cacheDuration) {
      console.log('📊 Using cached market intelligence');
      return this.marketIntelligence;
    }

    console.log('🔍 Fetching fresh market intelligence...');

    try {
      // Parallel fetch of market data
      const [priceResponse, newsResponse, analysisResponse] = await Promise.all([
        axios.get('http://localhost:4000/api/bitcoin-price'),
        axios.get('http://localhost:4000/api/bitcoin-news'),
        axios.get('http://localhost:4000/api/market-analysis')
      ]);

      // Process market intelligence
      const intelligence = {
        lastUpdate: now,
        price: priceResponse.data.data,
        news: newsResponse.data.data || [],
        analysis: analysisResponse.data.data,
        
        // Simplified sentiment analysis
        sentiment: this.analyzeSentiment(newsResponse.data.data || []),
        impactScore: this.calculateImpactScore(newsResponse.data.data || []),
        
        // Market strength indicators
        priceStrength: this.calculatePriceStrength(priceResponse.data.data),
        marketMomentum: this.calculateMomentum(analysisResponse.data.data)
      };

      this.marketIntelligence = intelligence;
      console.log(`✅ Market intelligence updated: ${intelligence.news.length} news items, sentiment ${intelligence.sentiment.score}`);
      
      return intelligence;

    } catch (error) {
      console.error('❌ Failed to gather market intelligence:', error.message);
      
      // Return minimal intelligence with current price
      const fallbackPrice = await this.getCurrentBTCPrice();
      return {
        lastUpdate: now,
        price: { price: fallbackPrice, change24h: 0 },
        news: [],
        analysis: { trend: 'neutral', volatility: 'medium' },
        sentiment: { overall: 'neutral', score: 0 },
        impactScore: 50,
        priceStrength: 0.5,
        marketMomentum: 0.5
      };
    }
  }

  analyzeSentiment(newsItems) {
    if (!newsItems || newsItems.length === 0) {
      return { overall: 'neutral', score: 0, confidence: 0 };
    }

    // Simple sentiment analysis based on keywords
    const positiveKeywords = ['surge', 'bull', 'rise', 'gain', 'positive', 'adoption', 'institutional', 'ETF', 'approve'];
    const negativeKeywords = ['drop', 'bear', 'fall', 'decline', 'negative', 'regulation', 'ban', 'crash', 'fear'];

    let sentimentScore = 0;
    let totalWords = 0;

    newsItems.forEach(item => {
      const text = (item.title + ' ' + (item.description || '')).toLowerCase();
      
      positiveKeywords.forEach(keyword => {
        if (text.includes(keyword)) sentimentScore += 1;
        totalWords += 1;
      });
      
      negativeKeywords.forEach(keyword => {
        if (text.includes(keyword)) sentimentScore -= 1;
        totalWords += 1;
      });
    });

    const normalizedScore = totalWords > 0 ? sentimentScore / Math.max(totalWords, 1) : 0;
    const overall = normalizedScore > 0.1 ? 'bullish' : normalizedScore < -0.1 ? 'bearish' : 'neutral';

    return {
      overall,
      score: normalizedScore,
      confidence: Math.min(totalWords / 10, 1), // Higher confidence with more data
      newsCount: newsItems.length
    };
  }

  calculateImpactScore(newsItems) {
    if (!newsItems || newsItems.length === 0) return 50;

    // Score based on news recency and source credibility
    const now = Date.now();
    let totalImpact = 0;

    newsItems.forEach(item => {
      const hoursOld = (now - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60);
      const recencyScore = Math.max(0, 1 - (hoursOld / 24)); // Score decreases over 24 hours
      
      // Source credibility (simplified)
      const sourceScore = item.source.includes('CoinDesk') || item.source.includes('Reuters') ? 1.0 : 0.7;
      
      totalImpact += recencyScore * sourceScore;
    });

    return Math.min(100, (totalImpact / newsItems.length) * 100);
  }

  calculatePriceStrength(priceData) {
    if (!priceData || !priceData.change24h) return 0.5;
    
    // Normalize 24h change to 0-1 scale
    const change = priceData.change24h;
    if (change > 5) return 1.0;      // Very strong
    if (change > 2) return 0.8;      // Strong
    if (change > 0) return 0.6;      // Positive
    if (change > -2) return 0.4;     // Weak negative
    if (change > -5) return 0.2;     // Negative
    return 0.0;                       // Very negative
  }

  calculateMomentum(analysisData) {
    if (!analysisData) return 0.5;
    
    let momentum = 0.5; // Neutral baseline
    
    if (analysisData.trend === 'bullish') momentum += 0.3;
    if (analysisData.trend === 'bearish') momentum -= 0.3;
    
    if (analysisData.volatility === 'high') momentum += 0.1; // High volatility can indicate momentum
    if (analysisData.volatility === 'low') momentum -= 0.1;
    
    return Math.max(0, Math.min(1, momentum));
  }

  async generateIntelligentDecision(progressMetrics, marketIntel, portfolio) {
    const cashBalance = portfolio?.usd_balance || 10000;
    const btcHoldings = portfolio?.btc_holdings || 0;
    const btcPrice = marketIntel.price.price;
    
    // Combine goal progress with market intelligence
    let action = 'HOLD';
    let reasoning = 'Analyzing market conditions';
    let confidence = 60;
    let amount = 0;
    let marketBasis = [];

    // Market Intelligence Factors
    const sentimentFactor = marketIntel.sentiment.score;
    const impactFactor = marketIntel.impactScore / 100;
    const priceFactor = marketIntel.priceStrength;
    const momentumFactor = marketIntel.marketMomentum;

    // Combined market score (0-1)
    const marketScore = (sentimentFactor + impactFactor + priceFactor + momentumFactor) / 4;
    marketBasis.push(`Market Score: ${(marketScore * 100).toFixed(1)}%`);
    marketBasis.push(`Sentiment: ${marketIntel.sentiment.overall} (${marketIntel.sentiment.score.toFixed(2)})`);
    marketBasis.push(`Impact: ${marketIntel.impactScore}/100`);
    marketBasis.push(`Price Strength: ${(priceFactor * 100).toFixed(1)}%`);

    // INTELLIGENT DECISION LOGIC
    if (!progressMetrics.isOnTrack) {
      // Behind target - be more aggressive if market supports it
      if (progressMetrics.urgency === 'HIGH') {
        if (marketScore > 0.6) {
          action = 'BUY';
          reasoning = `URGENT BUY: Behind target with strong market signals. Market score ${(marketScore * 100).toFixed(1)}%`;
          confidence = 90;
          amount = Math.min(cashBalance * 0.5, 4000) / btcPrice;
        } else if (marketScore > 0.4) {
          action = 'BUY';
          reasoning = `URGENT BUY: Behind target, moderate market signals. Calculated risk.`;
          confidence = 75;
          amount = Math.min(cashBalance * 0.3, 2500) / btcPrice;
        } else {
          action = 'HOLD';
          reasoning = `HOLD: Behind target but poor market conditions. Waiting for better entry.`;
          confidence = 80;
        }
      } else if (progressMetrics.urgency === 'MEDIUM') {
        if (marketScore > 0.6) {
          action = 'BUY';
          reasoning = `BUY: Behind target, strong market momentum supports position.`;
          confidence = 85;
          amount = Math.min(cashBalance * 0.3, 2000) / btcPrice;
        } else {
          action = marketScore > 0.4 ? 'BUY' : 'HOLD';
          reasoning = marketScore > 0.4 ? 
            'BUY: Behind target, moderate market signals' : 
            'HOLD: Behind target but weak market signals';
          confidence = 70;
          amount = marketScore > 0.4 ? Math.min(cashBalance * 0.2, 1500) / btcPrice : 0;
        }
      } else {
        // Low urgency - only buy with very strong market signals
        if (marketScore > 0.7) {
          action = 'BUY';
          reasoning = `BUY: Strong market signals override minor target lag.`;
          confidence = 80;
          amount = Math.min(cashBalance * 0.2, 1000) / btcPrice;
        } else {
          action = 'HOLD';
          reasoning = `HOLD: Slightly behind target, waiting for stronger market signals.`;
          confidence = 75;
        }
      }
    } else {
      // On track or ahead - be more selective
      if (progressMetrics.currentReturn >= progressMetrics.targetReturn) {
        if (marketScore < 0.3) {
          action = 'SELL';
          reasoning = `SELL: Target achieved, poor market signals suggest profit-taking.`;
          confidence = 90;
          amount = btcHoldings * 0.3;
        } else {
          action = 'HOLD';
          reasoning = `HOLD: Target achieved, maintaining position with decent market conditions.`;
          confidence = 85;
        }
      } else {
        // On track - normal market-based decisions
        if (marketScore > 0.7) {
          action = 'BUY';
          reasoning = `BUY: On track with excellent market signals. Capitalizing on momentum.`;
          confidence = 85;
          amount = Math.min(cashBalance * 0.2, 1200) / btcPrice;
        } else if (marketScore < 0.3) {
          action = btcHoldings > 0 ? 'SELL' : 'HOLD';
          reasoning = btcHoldings > 0 ? 
            'SELL: Poor market signals, reducing exposure' : 
            'HOLD: Poor market signals, staying in cash';
          confidence = 80;
          amount = btcHoldings > 0 ? btcHoldings * 0.2 : 0;
        } else {
          action = 'HOLD';
          reasoning = `HOLD: On track with neutral market signals. Maintaining position.`;
          confidence = 75;
        }
      }
    }

    // Risk management
    if (action !== 'HOLD' && amount < 0.001) {
      action = 'HOLD';
      reasoning = 'Position size too small, maintaining current allocation';
      amount = 0;
    }

    return {
      action,
      amount: Math.max(0, amount),
      price: btcPrice,
      confidence,
      reasoning,
      urgency: progressMetrics.urgency,
      marketBasis: marketBasis.join(' | '),
      timestamp: new Date().toISOString()
    };
  }

  // ... (rest of the methods remain the same as the original execution agent)
  
  calculateWeeklyProgress(portfolio) {
    const currentTime = Date.now();
    const weekElapsed = (currentTime - this.weekStartTime) / (7 * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.max(0, 7 - Math.floor(weekElapsed * 7));
    
    const currentValue = portfolio?.total_value_usd || 10000;
    const currentReturn = (currentValue - this.startingValue) / this.startingValue;
    const targetReturn = this.weeklyTargetReturn;
    const progressPercent = (currentReturn / targetReturn * 100).toFixed(1);
    
    const remainingReturn = targetReturn - currentReturn;
    const dailyTargetRemaining = remainingReturn / Math.max(1, daysRemaining);
    
    return {
      currentReturn,
      targetReturn,
      progressPercent,
      daysRemaining,
      remainingReturn,
      dailyTargetRemaining,
      weekElapsed,
      isOnTrack: currentReturn >= (targetReturn * weekElapsed),
      urgency: daysRemaining <= 2 ? 'HIGH' : daysRemaining <= 4 ? 'MEDIUM' : 'LOW'
    };
  }

  async executeDecision(decision, portfolio) {
    try {
      const currentCash = portfolio?.usd_balance || 10000;
      const currentBTC = portfolio?.btc_holdings || 0;
      const tradeValue = decision.amount * decision.price;
      
      if (decision.action === 'BUY' && currentCash >= tradeValue) {
        const newCash = currentCash - tradeValue;
        const newBTC = currentBTC + decision.amount;
        const newTotalValue = newCash + (newBTC * decision.price);
        
        await this.db.updatePortfolio(newBTC, newCash, newTotalValue);
        await this.db.recordTrade('BUY', decision.amount, decision.price, 0, tradeValue, decision.reasoning, decision.marketBasis);
        
        console.log(`✅ INTELLIGENT BUY: ${decision.amount.toFixed(4)} BTC for $${tradeValue.toFixed(2)}`);
        return true;
        
      } else if (decision.action === 'SELL' && currentBTC >= decision.amount) {
        const newBTC = currentBTC - decision.amount;
        const newCash = currentCash + tradeValue;
        const newTotalValue = newCash + (newBTC * decision.price);
        
        await this.db.updatePortfolio(newBTC, newCash, newTotalValue);
        await this.db.recordTrade('SELL', decision.amount, decision.price, 0, tradeValue, decision.reasoning, decision.marketBasis);
        
        console.log(`✅ INTELLIGENT SELL: ${decision.amount.toFixed(4)} BTC for $${tradeValue.toFixed(2)}`);
        return true;
        
      } else {
        console.log(`❌ Cannot execute ${decision.action}: Insufficient ${decision.action === 'BUY' ? 'cash' : 'BTC'}`);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Trade execution failed:', error.message);
      return false;
    }
  }

  async getCurrentBTCPrice() {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: { ids: 'bitcoin', vs_currencies: 'usd' }
      });
      return response.data.bitcoin.usd;
    } catch (error) {
      console.error('❌ Failed to fetch BTC price:', error.message);
      return 67000; // Fallback price
    }
  }
}

// Start the Intelligent Execution Agent
const agent = new IntelligentExecutionAgent();
agent.start().catch(console.error);

export default IntelligentExecutionAgent;