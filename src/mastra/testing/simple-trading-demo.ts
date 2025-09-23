#!/usr/bin/env node
/**
 * Simple Autonomous Trading Demo
 * Shows agent decisions with $10K corpus
 */

const tradingColors = {
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
  dim: (text: string) => `\x1b[2m${text}\x1b[0m`
};

class SimpleTradingDemo {
  private startingCapital = 10000;
  private portfolio = {
    totalValue: 10000,
    cash: 10000,
    positions: [] as any[],
    totalPnL: 0
  };
  private decisions: any[] = [];

  async runDemo(): Promise<void> {
    console.log(tradingColors.bold('\n💰 AUTONOMOUS TRADING DASHBOARD - $10K CORPUS DEMO\n'));
    console.log(tradingColors.blue('='.repeat(70)));
    console.log(tradingColors.cyan(`Starting Capital: $${this.startingCapital.toLocaleString()}`));
    console.log(tradingColors.dim('Simulating autonomous agent trading decisions with database logging\n'));

    // Initialize database if possible
    let database = null;
    try {
      const { AgenticDatabase } = await import('../agency/agentic-database.js');
      database = new AgenticDatabase();
      console.log(tradingColors.green('✅ Database connected for decision logging'));
    } catch (error) {
      console.log(tradingColors.yellow('⚠️ Database unavailable - running in simulation mode'));
    }

    // Run trading simulation
    for (let cycle = 1; cycle <= 8; cycle++) {
      console.log(tradingColors.bold(`\n🔄 TRADING CYCLE ${cycle}/8`));
      console.log(tradingColors.dim('-'.repeat(50)));

      const decision = this.generateAgentDecision();
      await this.executeDecision(decision, database);
      this.displayPortfolioStatus();
      
      // Small delay for demo effect
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    this.displayFinalSummary();
  }

  private generateAgentDecision(): any {
    const agents = [
      {
        name: 'Strategic Orchestrator',
        decisions: [
          { action: 'BUY', reasoning: 'Technical breakout with high volume confirmation, institutional accumulation detected' },
          { action: 'SELL', reasoning: 'Risk management: Portfolio rebalancing after significant gains' },
          { action: 'HOLD', reasoning: 'Market consolidation phase, maintaining strategic allocation' }
        ]
      },
      {
        name: 'Market Hunter',
        decisions: [
          { action: 'BUY', reasoning: 'Alpha opportunity: Emerging DeFi protocol with 150% APY and strong tokenomics' },
          { action: 'BUY', reasoning: 'Cross-chain arbitrage detected: 3.2% price differential exploitable' },
          { action: 'SELL', reasoning: 'Momentum exhaustion signals, securing 18% gains before reversal' }
        ]
      },
      {
        name: 'Performance Optimizer',
        decisions: [
          { action: 'REBALANCE', reasoning: 'Portfolio optimization: Improving Sharpe ratio through position sizing' },
          { action: 'SELL', reasoning: 'Correlation analysis suggests reducing exposure to minimize portfolio risk' }
        ]
      }
    ];

    const agent = agents[Math.floor(Math.random() * agents.length)];
    const decision = agent.decisions[Math.floor(Math.random() * agent.decisions.length)];
    
    const cryptos = [
      { symbol: 'BTC', name: 'Bitcoin', price: 67890 },
      { symbol: 'ETH', name: 'Ethereum', price: 3420 },
      { symbol: 'SOL', name: 'Solana', price: 145 },
      { symbol: 'ADA', name: 'Cardano', price: 0.45 },
      { symbol: 'DOT', name: 'Polkadot', price: 6.2 }
    ];
    
    const crypto = cryptos[Math.floor(Math.random() * cryptos.length)];
    const priceVariation = (Math.random() - 0.5) * 0.1; // ±5% price variation
    const currentPrice = crypto.price * (1 + priceVariation);
    
    return {
      agent: agent.name,
      action: decision.action,
      symbol: crypto.symbol,
      symbolName: crypto.name,
      price: currentPrice,
      amount: decision.action === 'BUY' ? Math.random() * 0.8 + 0.2 : Math.random() * 0.5,
      reasoning: decision.reasoning,
      confidence: Math.random() * 0.3 + 0.7, // 70-100%
      timestamp: new Date(),
      expectedReturn: Math.random() * 0.4 + 0.1
    };
  }

  private async executeDecision(decision: any, database: any): Promise<void> {
    // Display the decision
    const actionColor = decision.action === 'BUY' ? tradingColors.green : 
                       decision.action === 'SELL' ? tradingColors.red : tradingColors.yellow;
    
    console.log(tradingColors.cyan(`🤖 ${decision.agent}:`));
    console.log(actionColor(`   ${decision.action} ${decision.amount.toFixed(4)} ${decision.symbol} @ $${decision.price.toFixed(2)}`));
    console.log(tradingColors.dim(`   ${decision.reasoning}`));
    console.log(tradingColors.yellow(`   Confidence: ${(decision.confidence * 100).toFixed(0)}% | Expected Return: ${(decision.expectedReturn * 100).toFixed(0)}%`));

    // Execute the trade
    if (decision.action === 'BUY') {
      const cost = decision.amount * decision.price;
      if (this.portfolio.cash >= cost) {
        this.portfolio.cash -= cost;
        
        const existing = this.portfolio.positions.find((p: any) => p.symbol === decision.symbol);
        if (existing) {
          const totalAmount = existing.amount + decision.amount;
          const totalCost = (existing.amount * existing.entryPrice) + cost;
          existing.entryPrice = totalCost / totalAmount;
          existing.amount = totalAmount;
        } else {
          this.portfolio.positions.push({
            symbol: decision.symbol,
            symbolName: decision.symbolName,
            amount: decision.amount,
            entryPrice: decision.price,
            currentPrice: decision.price
          });
        }
      }
    } else if (decision.action === 'SELL') {
      const position = this.portfolio.positions.find((p: any) => p.symbol === decision.symbol);
      if (position && position.amount >= decision.amount) {
        const proceeds = decision.amount * decision.price;
        this.portfolio.cash += proceeds;
        position.amount -= decision.amount;
        if (position.amount <= 0.001) {
          this.portfolio.positions = this.portfolio.positions.filter((p: any) => p !== position);
        }
      }
    }

    // Log to database if available
    if (database) {
      try {
        await database.logAgentSuggestion({
          agentId: decision.agent.toLowerCase().replace(' ', '-'),
          suggestion: `${decision.action} ${decision.amount.toFixed(4)} ${decision.symbol} at $${decision.price.toFixed(2)}`,
          confidence: decision.confidence,
          suggestedAt: decision.timestamp,
          type: 'trading_decision',
          data: JSON.stringify({
            action: decision.action,
            symbol: decision.symbol,
            amount: decision.amount,
            price: decision.price,
            portfolioValue: this.portfolio.totalValue
          }),
          urgency: 'medium',
          rationale: decision.reasoning
        });
        console.log(tradingColors.green('   ✅ Decision logged to database'));
      } catch (error) {
        console.log(tradingColors.red(`   ❌ Database logging failed: ${error}`));
      }
    }

    this.decisions.push(decision);
    this.updatePortfolio();
  }

  private updatePortfolio(): void {
    // Simulate market movements
    this.portfolio.positions.forEach((position: any) => {
      const movement = (Math.random() - 0.5) * 0.08; // ±4% price movement
      position.currentPrice = position.entryPrice * (1 + movement);
    });

    const positionValue = this.portfolio.positions.reduce((sum: number, pos: any) => 
      sum + (pos.amount * pos.currentPrice), 0);
    
    this.portfolio.totalValue = this.portfolio.cash + positionValue;
    this.portfolio.totalPnL = this.portfolio.totalValue - this.startingCapital;
  }

  private displayPortfolioStatus(): void {
    console.log(tradingColors.bold('\n📊 PORTFOLIO STATUS'));
    console.log(tradingColors.blue('-'.repeat(30)));
    
    const pnlColor = this.portfolio.totalPnL >= 0 ? tradingColors.green : tradingColors.red;
    const pnlSign = this.portfolio.totalPnL >= 0 ? '+' : '';
    const returnPercent = (this.portfolio.totalPnL / this.startingCapital) * 100;
    
    console.log(tradingColors.bold(`💰 Total Value: $${this.portfolio.totalValue.toFixed(0)}`));
    console.log(pnlColor(`📈 P&L: ${pnlSign}$${this.portfolio.totalPnL.toFixed(2)} (${pnlSign}${returnPercent.toFixed(2)}%)`));
    console.log(tradingColors.cyan(`💵 Cash: $${this.portfolio.cash.toFixed(0)}`));
    
    if (this.portfolio.positions.length > 0) {
      console.log(tradingColors.yellow('\n🎯 Positions:'));
      this.portfolio.positions.forEach((pos: any) => {
        const posValue = pos.amount * pos.currentPrice;
        const posPnL = posValue - (pos.amount * pos.entryPrice);
        const posPnLPercent = (posPnL / (pos.amount * pos.entryPrice)) * 100;
        const posColor = posPnL >= 0 ? tradingColors.green : tradingColors.red;
        const posSign = posPnL >= 0 ? '+' : '';
        
        console.log(`   ${pos.symbol}: ${pos.amount.toFixed(4)} units - Value: $${posValue.toFixed(0)}`);
        console.log(posColor(`      P&L: ${posSign}$${posPnL.toFixed(2)} (${posSign}${posPnLPercent.toFixed(1)}%)`));
      });
    }
  }

  private displayFinalSummary(): void {
    console.log(tradingColors.bold('\n📈 AUTONOMOUS TRADING SUMMARY'));
    console.log(tradingColors.blue('='.repeat(70)));
    
    const finalReturn = ((this.portfolio.totalValue - this.startingCapital) / this.startingCapital) * 100;
    const returnColor = finalReturn >= 0 ? tradingColors.green : tradingColors.red;
    const returnSign = finalReturn >= 0 ? '+' : '';
    
    console.log(tradingColors.bold('🎯 FINAL RESULTS:'));
    console.log(tradingColors.cyan(`   Starting Capital: $${this.startingCapital.toLocaleString()}`));
    console.log(tradingColors.cyan(`   Final Value: $${this.portfolio.totalValue.toFixed(0)}`));
    console.log(returnColor(`   Total Return: ${returnSign}${finalReturn.toFixed(2)}%`));
    console.log(tradingColors.yellow(`   Total Decisions: ${this.decisions.length}`));
    
    // Agent performance
    const agentStats = this.decisions.reduce((stats: any, decision: any) => {
      if (!stats[decision.agent]) {
        stats[decision.agent] = { count: 0, totalConfidence: 0 };
      }
      stats[decision.agent].count++;
      stats[decision.agent].totalConfidence += decision.confidence;
      return stats;
    }, {});
    
    console.log(tradingColors.bold('\n🤖 AGENT PERFORMANCE:'));
    Object.entries(agentStats).forEach(([agent, stats]: [string, any]) => {
      const avgConfidence = (stats.totalConfidence / stats.count * 100).toFixed(0);
      console.log(tradingColors.green(`   ${agent}: ${stats.count} decisions, ${avgConfidence}% avg confidence`));
    });
    
    console.log(tradingColors.bold(tradingColors.green('\n🎉 AUTONOMOUS TRADING DEMO COMPLETE!')));
    console.log(tradingColors.cyan('Dashboard: https://brettleehari.github.io/TweetBot/'));
    console.log(tradingColors.cyan('Web Trading Dashboard: https://brettleehari.github.io/TweetBot/trading-dashboard.html'));
    console.log(tradingColors.dim('All decisions logged to database for analysis and backtesting.'));
  }
}

// Run the demo
const demo = new SimpleTradingDemo();
demo.runDemo().catch(console.error);