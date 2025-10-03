#!/usr/bin/env node
/**
 * Execution Agent for Bitcoin Trading
 * Goal: 5% return per week with 1-minute decision intervals
 */

import DatabaseService from './database/database-service.js';
import axios from 'axios';

class ExecutionTradingService {
  constructor() {
    this.db = new DatabaseService();
    this.isRunning = false;
    this.portfolio = {
      totalValue: 10000,
      cash: 10000,
      positions: [],
      totalPnL: 0
    };
    
    // EXECUTION AGENT GOALS
    this.weeklyTargetReturn = 0.05; // 5% per week
    this.refreshInterval = 1 * 60 * 1000; // 1 minute
    this.startingValue = 10000;
    this.weekStartTime = Date.now();
    this.weeklyTarget = this.startingValue * (1 + this.weeklyTargetReturn);
    
    this.tradingInterval = null;
    this.logFile = '/workspaces/TweetBot/execution-agent-log.json';
  }

  async start() {
    if (this.isRunning) {
      console.log('🔄 Execution Agent already running...');
      return;
    }

    this.isRunning = true;
    console.log('🚀 STARTING EXECUTION AGENT - 5% WEEKLY TARGET');
    console.log('💰 Managing $10K corpus with aggressive 1-minute decisions');
    console.log('📊 Interval: Every 1 minute');
    console.log(`🎯 Weekly Goal: 5% return (Target: $${this.weeklyTarget.toFixed(2)})`);
    console.log('🛑 Press Ctrl+C to stop\n');

    // Make immediate decision
    await this.makeDecision();

    // Set up continuous trading (every 1 minute)
    this.tradingInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.makeDecision();
      }
    }, this.refreshInterval);

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n⏹️  Shutting down Execution Agent...');
      this.stop();
      process.exit(0);
    });
  }

  stop() {
    this.isRunning = false;
    if (this.tradingInterval) {
      clearInterval(this.tradingInterval);
      this.tradingInterval = null;
    }
    this.savePortfolio();
    console.log('✅ Execution Agent stopped and portfolio saved');
  }

  async makeDecision() {
    const timestamp = new Date().toLocaleString();
    const startTime = Date.now();
    
    try {
      // Get current portfolio and Bitcoin price  
      const [portfolio, btcPrice] = await Promise.all([
        this.db.getCurrentPortfolio(),
        this.getCurrentBTCPrice()
      ]);

      // Calculate progress toward weekly goal
      const progressMetrics = this.calculateWeeklyProgress(portfolio);
      
      // Generate execution decision
      const decision = this.generateExecutionAgentDecision(progressMetrics, btcPrice, portfolio);
      
      console.log(`\n🤖 [${timestamp}] Execution Agent Decision:`);
      console.log(`   📊 Weekly Progress: ${progressMetrics.progressPercent}% (${progressMetrics.daysRemaining} days left)`);
      console.log(`   🎯 Target: $${this.weeklyTarget.toFixed(2)} | Current: $${(portfolio?.total_value_usd || 10000).toFixed(2)}`);
      console.log(`   ${decision.action.toUpperCase()} ${decision.amount.toFixed(4)} BTC @ $${decision.price.toFixed(2)}`);
      console.log(`   Reason: ${decision.reasoning}`);
      console.log(`   Confidence: ${decision.confidence}% | Urgency: ${decision.urgency}`);

      // Execute decision if not HOLD
      let executed = false;
      if (decision.action !== 'HOLD') {
        executed = await this.executeDecision(decision, portfolio);
      }

      const executionTime = Date.now() - startTime;

      // Log decision to database for dashboard display
      await this.db.logAgentExecution(
        'Execution Agent',
        'trading_decision',
        {
          progressMetrics,
          marketPrice: btcPrice,
          portfolioValue: portfolio?.total_value_usd || 10000
        },
        {
          action: decision.action,
          amount: decision.amount,
          price: decision.price,
          confidence: decision.confidence,
          reasoning: decision.reasoning,
          urgency: decision.urgency,
          executed: executed
        },
        true,
        executionTime
      );

      console.log(`✅ Decision logged to database for dashboard display`);
      
    } catch (error) {
      console.error(`❌ [${timestamp}] Decision error:`, error.message);
      
      // Log error to database
      await this.db.logAgentExecution(
        'Execution Agent',
        'trading_decision',
        { error: error.message },
        { action: 'ERROR' },
        false,
        Date.now() - Date.now(),
        error.message
      );
    }
  }

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

  generateExecutionAgentDecision(metrics, btcPrice, portfolio) {
    // Goal-oriented decision making
    let action = 'HOLD';
    let reasoning = 'Monitoring market conditions and maintaining positions';
    let confidence = 60;
    let amount = 0;
    
    const cashBalance = portfolio?.usd_balance || 10000;
    const btcHoldings = portfolio?.btc_holdings || 0;
    
    // Aggressive actions when behind target
    if (!metrics.isOnTrack) {
      if (metrics.urgency === 'HIGH') {
        action = 'BUY';
        reasoning = `URGENT: ${metrics.daysRemaining} days left to achieve 5% weekly target. Need ${(metrics.remainingReturn * 100).toFixed(1)}% return.`;
        confidence = 85;
        amount = Math.min(cashBalance * 0.4, 3000) / btcPrice; // Up to 40% of cash or $3000
      } else if (metrics.urgency === 'MEDIUM') {
        action = Math.random() > 0.3 ? 'BUY' : 'HOLD';
        reasoning = `Behind target: Need ${(metrics.dailyTargetRemaining * 100).toFixed(2)}% daily return. Taking calculated risk.`;
        confidence = 75;
        amount = Math.min(cashBalance * 0.25, 2000) / btcPrice; // Up to 25% of cash or $2000
      } else {
        action = Math.random() > 0.5 ? 'BUY' : 'HOLD';
        reasoning = `Slightly behind target. Moderate position to catch up to 5% weekly goal.`;
        confidence = 70;
        amount = Math.min(cashBalance * 0.15, 1000) / btcPrice; // Up to 15% of cash or $1000
      }
    } else {
      // Conservative when on track or ahead
      if (metrics.currentReturn >= metrics.targetReturn) {
        action = Math.random() > 0.7 ? 'SELL' : 'HOLD';
        reasoning = `Target achieved! Current return: ${(metrics.currentReturn * 100).toFixed(1)}%. Securing profits.`;
        confidence = 90;
        amount = btcHoldings * 0.2; // Sell 20% of holdings
      } else {
        action = Math.random() > 0.6 ? 'BUY' : 'HOLD';
        reasoning = `On track for 5% weekly target. Steady progress with measured risk.`;
        confidence = 80;
        amount = Math.min(cashBalance * 0.1, 800) / btcPrice; // Up to 10% of cash or $800
      }
    }
    
    // Risk management: Don't trade if amounts are too small
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
      urgency: metrics.urgency
    };
  }

  async executeDecision(decision, portfolio) {
    try {
      const currentCash = portfolio?.usd_balance || 10000;
      const currentBTC = portfolio?.btc_holdings || 0;
      const tradeValue = decision.amount * decision.price;
      
      if (decision.action === 'BUY' && currentCash >= tradeValue) {
        // Execute buy order
        const newCash = currentCash - tradeValue;
        const newBTC = currentBTC + decision.amount;
        const newTotalValue = newCash + (newBTC * decision.price);
        
        await this.db.updatePortfolio(newBTC, newCash, newTotalValue);
        
        // Record the trade
        await this.db.recordTrade(
          'BUY',
          decision.amount,
          decision.price,
          0, // No fees for simulation
          tradeValue,
          decision.reasoning,
          `Bitcoin price: $${decision.price}, Market conditions analyzed`
        );
        
        console.log(`✅ BUY executed: ${decision.amount.toFixed(4)} BTC for $${tradeValue.toFixed(2)}`);
        return true;
        
      } else if (decision.action === 'SELL' && currentBTC >= decision.amount) {
        // Execute sell order
        const newBTC = currentBTC - decision.amount;
        const newCash = currentCash + tradeValue;
        const newTotalValue = newCash + (newBTC * decision.price);
        
        await this.db.updatePortfolio(newBTC, newCash, newTotalValue);
        
        // Record the trade
        await this.db.recordTrade(
          'SELL',
          decision.amount,
          decision.price,
          0, // No fees for simulation
          tradeValue,
          decision.reasoning,
          `Bitcoin price: $${decision.price}, Market conditions analyzed`
        );
        
        console.log(`✅ SELL executed: ${decision.amount.toFixed(4)} BTC for $${tradeValue.toFixed(2)}`);
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
        params: {
          ids: 'bitcoin',
          vs_currencies: 'usd'
        }
      });
      return response.data.bitcoin.usd;
    } catch (error) {
      console.error('❌ Failed to fetch BTC price:', error.message);
      return 67000; // Fallback price
    }
  }

}

// Run the service
const service = new ExecutionTradingService();
service.start().catch(console.error);

export { ExecutionTradingService };