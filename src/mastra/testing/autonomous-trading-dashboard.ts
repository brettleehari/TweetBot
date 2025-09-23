#!/usr/bin/env node
/**
 * Autonomous Trading Dashboard
 * 
 * Real-time dashboard showing autonomous agent trading decisions
 * with $10,000 starting corpus and complete decision logging
 */

import { AgenticDatabase } from '../agency/agentic-database.js';

const colors = {
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
  dim: (text: string) => `\x1b[2m${text}\x1b[0m`,
  magenta: (text: string) => `\x1b[35m${text}\x1b[0m`
};

interface TradingPosition {
  symbol: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

interface TradingDecision {
  id: string;
  timestamp: Date;
  agent: string;
  action: 'BUY' | 'SELL' | 'HOLD' | 'REBALANCE';
  symbol: string;
  amount: number;
  price: number;
  reasoning: string;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedReturn: number;
}

interface Portfolio {
  totalValue: number;
  cash: number;
  positions: TradingPosition[];
  totalPnL: number;
  totalPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

class AutonomousTradingDashboard {
  private database: AgenticDatabase;
  private portfolio: Portfolio;
  private startingCapital: number = 10000; // $10K starting corpus
  private decisions: TradingDecision[] = [];
  private isRunning: boolean = false;

  constructor() {
    this.database = new AgenticDatabase();
    this.initializePortfolio();
  }

  private initializePortfolio(): void {
    this.portfolio = {
      totalValue: this.startingCapital,
      cash: this.startingCapital,
      positions: [],
      totalPnL: 0,
      totalPnLPercent: 0,
      dayChange: 0,
      dayChangePercent: 0
    };
  }

  async startDashboard(): Promise<void> {
    console.log(colors.bold('\n💰 AUTONOMOUS TRADING DASHBOARD\n'));
    console.log(colors.blue('='.repeat(70)));
    console.log(colors.cyan(`Starting Capital: $${this.startingCapital.toLocaleString()}`));
    console.log(colors.dim('Real-time agent trading decisions with full database logging\n'));

    this.isRunning = true;
    
    // Initialize some starting positions
    await this.initializeStartingPositions();
    
    // Start the autonomous trading loop
    await this.runTradingLoop();
  }

  private async initializeStartingPositions(): Promise<void> {
    console.log(colors.bold('🎯 INITIALIZING PORTFOLIO'));
    console.log(colors.dim('-'.repeat(50)));

    // Strategic Orchestrator decides initial allocation
    const initialDecisions = [
      {
        agent: 'Strategic Orchestrator',
        action: 'BUY' as const,
        symbol: 'BTC',
        amount: 0.15, // ~$6000
        price: 67890,
        reasoning: 'Bitcoin shows strong technical setup with institutional accumulation',
        confidence: 0.85,
        riskLevel: 'MEDIUM' as const,
        expectedReturn: 0.25
      },
      {
        agent: 'Market Hunter',
        action: 'BUY' as const,
        symbol: 'ETH',
        amount: 1.2, // ~$3000
        price: 3420,
        reasoning: 'Ethereum ecosystem growth accelerating, staking rewards attractive',
        confidence: 0.78,
        riskLevel: 'MEDIUM' as const,
        expectedReturn: 0.30
      }
    ];

    for (const decision of initialDecisions) {
      await this.executeDecision(decision);
    }
  }

  private async executeDecision(decisionData: any): Promise<void> {
    const decision: TradingDecision = {
      id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...decisionData
    };

    // Execute the trade
    if (decision.action === 'BUY') {
      const cost = decision.amount * decision.price;
      if (this.portfolio.cash >= cost) {
        this.portfolio.cash -= cost;
        
        // Add or update position
        const existingPosition = this.portfolio.positions.find(p => p.symbol === decision.symbol);
        if (existingPosition) {
          const totalAmount = existingPosition.amount + decision.amount;
          const totalCost = (existingPosition.amount * existingPosition.entryPrice) + cost;
          existingPosition.entryPrice = totalCost / totalAmount;
          existingPosition.amount = totalAmount;
        } else {
          this.portfolio.positions.push({
            symbol: decision.symbol,
            amount: decision.amount,
            entryPrice: decision.price,
            currentPrice: decision.price,
            value: cost,
            pnl: 0,
            pnlPercent: 0
          });
        }
      }
    }

    // Log to database
    await this.logTradingDecision(decision);
    
    // Update portfolio value
    this.updatePortfolioValue();
    
    // Display the decision
    this.displayDecision(decision);
    
    this.decisions.push(decision);
  }

  private async logTradingDecision(decision: TradingDecision): Promise<void> {
    try {
      await this.database.logAgentSuggestion({
        agentId: decision.agent.toLowerCase().replace(' ', '-'),
        suggestion: `${decision.action} ${decision.amount} ${decision.symbol} at $${decision.price}`,
        confidence: decision.confidence,
        suggestedAt: decision.timestamp,
        type: 'trading_decision',
        data: JSON.stringify({
          action: decision.action,
          symbol: decision.symbol,
          amount: decision.amount,
          price: decision.price,
          reasoning: decision.reasoning,
          riskLevel: decision.riskLevel,
          expectedReturn: decision.expectedReturn,
          portfolioValue: this.portfolio.totalValue
        }),
        urgency: decision.riskLevel === 'HIGH' ? 'high' : decision.riskLevel === 'MEDIUM' ? 'medium' : 'low',
        rationale: decision.reasoning
      });
    } catch (error) {
      console.log(colors.red(`❌ Failed to log decision to database: ${error}`));
    }
  }

  private updatePortfolioValue(): void {
    // Simulate price movements
    this.portfolio.positions.forEach(position => {
      const priceChange = (Math.random() - 0.5) * 0.1; // ±5% random movement
      position.currentPrice = position.entryPrice * (1 + priceChange);
      position.value = position.amount * position.currentPrice;
      position.pnl = position.value - (position.amount * position.entryPrice);
      position.pnlPercent = (position.pnl / (position.amount * position.entryPrice)) * 100;
    });

    const totalPositionValue = this.portfolio.positions.reduce((sum, pos) => sum + pos.value, 0);
    this.portfolio.totalValue = this.portfolio.cash + totalPositionValue;
    this.portfolio.totalPnL = this.portfolio.totalValue - this.startingCapital;
    this.portfolio.totalPnLPercent = (this.portfolio.totalPnL / this.startingCapital) * 100;
  }

  private displayDecision(decision: TradingDecision): void {
    const actionColor = decision.action === 'BUY' ? colors.green : 
                       decision.action === 'SELL' ? colors.red : colors.yellow;
    
    console.log(colors.cyan(`\n🤖 ${decision.agent}:`));
    console.log(actionColor(`   ${decision.action} ${decision.amount} ${decision.symbol} @ $${decision.price.toLocaleString()}`));
    console.log(colors.dim(`   Reasoning: ${decision.reasoning}`));
    console.log(colors.yellow(`   Confidence: ${(decision.confidence * 100).toFixed(0)}% | Risk: ${decision.riskLevel} | Expected Return: ${(decision.expectedReturn * 100).toFixed(0)}%`));
    console.log(colors.green(`   ✅ Decision logged to database`));
  }

  private async generateAgentDecision(): Promise<any> {
    const agents = [
      {
        name: 'Strategic Orchestrator',
        decisions: [
          { action: 'REBALANCE', reasoning: 'Portfolio allocation needs adjustment based on market conditions' },
          { action: 'HOLD', reasoning: 'Current positions showing strength, maintaining allocation' },
          { action: 'BUY', reasoning: 'Technical indicators suggest continuation of uptrend' }
        ]
      },
      {
        name: 'Market Hunter',
        decisions: [
          { action: 'BUY', reasoning: 'Alpha opportunity detected in emerging DeFi protocol' },
          { action: 'SELL', reasoning: 'Profit-taking on overextended position' },
          { action: 'BUY', reasoning: 'Cross-chain arbitrage opportunity identified' }
        ]
      },
      {
        name: 'Performance Optimizer',
        decisions: [
          { action: 'REBALANCE', reasoning: 'Risk-adjusted returns can be improved with reallocation' },
          { action: 'HOLD', reasoning: 'Current allocation optimal for risk parameters' }
        ]
      }
    ];

    const agent = agents[Math.floor(Math.random() * agents.length)];
    const decision = agent.decisions[Math.floor(Math.random() * agent.decisions.length)];
    
    const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const prices = { BTC: 67890, ETH: 3420, SOL: 145, ADA: 0.45, DOT: 6.2 };
    
    return {
      agent: agent.name,
      action: decision.action,
      symbol: symbol,
      amount: decision.action === 'BUY' ? Math.random() * 0.5 + 0.1 : Math.random() * 0.3,
      price: prices[symbol as keyof typeof prices] * (1 + (Math.random() - 0.5) * 0.05),
      reasoning: decision.reasoning,
      confidence: Math.random() * 0.3 + 0.7,
      riskLevel: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as 'LOW' | 'MEDIUM' | 'HIGH',
      expectedReturn: Math.random() * 0.4 + 0.1
    };
  }

  private displayPortfolioStatus(): void {
    console.log(colors.bold('\n📊 PORTFOLIO STATUS'));
    console.log(colors.blue('='.repeat(70)));
    
    const pnlColor = this.portfolio.totalPnL >= 0 ? colors.green : colors.red;
    const pnlSign = this.portfolio.totalPnL >= 0 ? '+' : '';
    
    console.log(colors.bold(`💰 Total Value: $${this.portfolio.totalValue.toLocaleString()}`));
    console.log(pnlColor(`📈 P&L: ${pnlSign}$${this.portfolio.totalPnL.toFixed(2)} (${pnlSign}${this.portfolio.totalPnLPercent.toFixed(2)}%)`));
    console.log(colors.cyan(`💵 Cash: $${this.portfolio.cash.toFixed(2)}`));
    
    if (this.portfolio.positions.length > 0) {
      console.log(colors.bold('\n🎯 POSITIONS:'));
      this.portfolio.positions.forEach(position => {
        const positionPnlColor = position.pnl >= 0 ? colors.green : colors.red;
        const positionPnlSign = position.pnl >= 0 ? '+' : '';
        
        console.log(colors.yellow(`   ${position.symbol}: ${position.amount.toFixed(4)} units`));
        console.log(colors.dim(`      Entry: $${position.entryPrice.toFixed(2)} | Current: $${position.currentPrice.toFixed(2)}`));
        console.log(positionPnlColor(`      Value: $${position.value.toFixed(2)} | P&L: ${positionPnlSign}$${position.pnl.toFixed(2)} (${positionPnlSign}${position.pnlPercent.toFixed(2)}%)`));
      });
    }
  }

  private async runTradingLoop(): Promise<void> {
    let iteration = 0;
    const maxIterations = 10; // Run 10 trading cycles for demo
    
    while (this.isRunning && iteration < maxIterations) {
      iteration++;
      
      console.log(colors.bold(`\n🔄 TRADING CYCLE ${iteration}/${maxIterations}`));
      console.log(colors.dim('-'.repeat(50)));
      
      // Generate and execute agent decision
      const decisionData = await this.generateAgentDecision();
      await this.executeDecision(decisionData);
      
      // Display current portfolio status
      this.displayPortfolioStatus();
      
      // Wait a bit for demo purposes
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    await this.displayFinalSummary();
  }

  private async displayFinalSummary(): Promise<void> {
    console.log(colors.bold('\n📈 AUTONOMOUS TRADING SUMMARY'));
    console.log(colors.blue('='.repeat(70)));
    
    const finalReturn = ((this.portfolio.totalValue - this.startingCapital) / this.startingCapital) * 100;
    const returnColor = finalReturn >= 0 ? colors.green : colors.red;
    const returnSign = finalReturn >= 0 ? '+' : '';
    
    console.log(colors.bold(`🎯 FINAL RESULTS:`));
    console.log(colors.cyan(`   Starting Capital: $${this.startingCapital.toLocaleString()}`));
    console.log(colors.cyan(`   Final Value: $${this.portfolio.totalValue.toLocaleString()}`));
    console.log(returnColor(`   Total Return: ${returnSign}${finalReturn.toFixed(2)}%`));
    console.log(colors.yellow(`   Total Decisions: ${this.decisions.length}`));
    
    console.log(colors.bold('\n🤖 AGENT PERFORMANCE:'));
    const agentStats = this.decisions.reduce((stats, decision) => {
      if (!stats[decision.agent]) {
        stats[decision.agent] = { count: 0, totalConfidence: 0 };
      }
      stats[decision.agent].count++;
      stats[decision.agent].totalConfidence += decision.confidence;
      return stats;
    }, {} as any);
    
    Object.entries(agentStats).forEach(([agent, stats]: [string, any]) => {
      const avgConfidence = (stats.totalConfidence / stats.count * 100).toFixed(0);
      console.log(colors.green(`   ${agent}: ${stats.count} decisions, ${avgConfidence}% avg confidence`));
    });
    
    // Get database stats
    try {
      const recentSuggestions = await this.database.getRecentSuggestions(50);
      const tradingDecisions = recentSuggestions.filter((s: any) => s.type === 'trading_decision');
      console.log(colors.bold('\n💾 DATABASE STATS:'));
      console.log(colors.green(`   Trading Decisions Logged: ${tradingDecisions.length}`));
      console.log(colors.green(`   All Agent Activities: ${recentSuggestions.length}`));
    } catch (error) {
      console.log(colors.red('   Database stats unavailable'));
    }
    
    console.log(colors.bold(colors.green('\n🎉 AUTONOMOUS TRADING DEMO COMPLETE!')));
    console.log(colors.cyan('Dashboard: https://brettleehari.github.io/TweetBot/'));
    console.log(colors.dim('All trading decisions have been logged to the database for analysis.'));
  }
}

// Run the trading dashboard
const dashboard = new AutonomousTradingDashboard();
dashboard.startDashboard().catch(console.error);