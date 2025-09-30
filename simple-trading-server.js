import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Serve static files
app.use(express.static('.'));
app.use(express.json());

// Portfolio state (in-memory for demo)
let portfolio = {
    cash: 3200.00,
    btcHoldings: 0.0725,
    initialCapital: 10000.00,
    currentBtcPrice: 105432.50,
    lastUpdated: new Date().toISOString()
};

// Decision history
let decisions = [
    {
        id: 1,
        timestamp: "2025-01-15 14:30",
        action: "BUY",
        confidence: 87,
        entryPrice: 67340,
        amount: 0.0372,
        amountUsd: 2500,
        reasoning: "RSI oversold (28) + Whale accumulation (6.2k BTC outflow) + Funding -0.015% + Fear (22)",
        signals: [
            "Technical: RSI at 28 (oversold) + MACD bullish divergence",
            "On-chain: 6.2k BTC net outflow from exchanges (whale accumulation)",
            "Derivatives: Funding rate -0.015% (shorts paying longs)",
            "Sentiment: Fear & Greed at 22 (extreme fear)"
        ],
        confluence: "4/4 categories aligned",
        riskReward: "4.2:1"
    }
];

// Portfolio value history for chart
let portfolioHistory = [];

// Initialize portfolio history
function initializePortfolioHistory() {
    const now = new Date();
    for (let i = 47; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 30 * 60 * 1000);
        const baseValue = 10000 + (47 - i) * 18;
        const variation = (Math.random() - 0.5) * 200;
        portfolioHistory.push({
            timestamp: date.toISOString(),
            value: baseValue + variation
        });
    }
}

// API Routes
app.get('/api/bitcoin-price', async (req, res) => {
    try {
        // Fetch real Bitcoin price from CoinGecko
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        
        const price = data.bitcoin.usd;
        const change24h = data.bitcoin.usd_24h_change;
        
        // Update portfolio with real price
        portfolio.currentBtcPrice = price;
        portfolio.lastUpdated = new Date().toISOString();
        
        res.json({
            success: true,
            data: {
                price: price,
                change24h: change24h,
                lastUpdated: portfolio.lastUpdated
            }
        });
    } catch (error) {
        res.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch Bitcoin price'
        });
    }
});

app.get('/api/portfolio', (req, res) => {
    const btcValue = portfolio.btcHoldings * portfolio.currentBtcPrice;
    const totalValue = portfolio.cash + btcValue;
    const pnl = totalValue - portfolio.initialCapital;
    const pnlPercent = (pnl / portfolio.initialCapital) * 100;

    res.json({
        success: true,
        data: {
            cash: portfolio.cash,
            btcHoldings: portfolio.btcHoldings,
            currentBtcPrice: portfolio.currentBtcPrice,
            btcValue: btcValue,
            totalValue: totalValue,
            initialCapital: portfolio.initialCapital,
            pnl: pnl,
            pnlPercent: pnlPercent,
            lastUpdated: portfolio.lastUpdated
        }
    });
});

app.get('/api/portfolio-history', (req, res) => {
    res.json({
        success: true,
        data: portfolioHistory
    });
});

app.get('/api/decisions', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    const paginatedDecisions = decisions
        .sort((a, b) => b.id - a.id)
        .slice(offset, offset + limit);
    
    res.json({
        success: true,
        data: paginatedDecisions,
        total: decisions.length,
        hasMore: offset + limit < decisions.length
    });
});

app.post('/api/decisions', (req, res) => {
    const decision = {
        id: decisions.length + 1,
        timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        ...req.body
    };
    
    decisions.unshift(decision);
    
    // Update portfolio if it's a trade
    if (decision.action === 'BUY') {
        const cost = decision.amount * decision.entryPrice;
        if (portfolio.cash >= cost) {
            portfolio.cash -= cost;
            portfolio.btcHoldings += decision.amount;
        }
    } else if (decision.action === 'SELL') {
        const proceeds = decision.amount * decision.entryPrice;
        if (portfolio.btcHoldings >= decision.amount) {
            portfolio.cash += proceeds;
            portfolio.btcHoldings -= decision.amount;
        }
    }
    
    // Add to portfolio history
    const btcValue = portfolio.btcHoldings * portfolio.currentBtcPrice;
    const totalValue = portfolio.cash + btcValue;
    portfolioHistory.push({
        timestamp: new Date().toISOString(),
        value: totalValue
    });
    
    // Keep only last 48 data points (24 hours)
    if (portfolioHistory.length > 48) {
        portfolioHistory.shift();
    }
    
    res.json({
        success: true,
        data: decision
    });
});

// Simulate agent decisions every 30 minutes
function simulateAgentDecision() {
    const agents = ['Strategic Orchestrator', 'Market Hunter', 'Performance Optimizer'];
    const actions = ['BUY', 'SELL', 'NEUTRAL'];
    const reasons = [
        'Technical indicators show bullish divergence',
        'On-chain metrics indicate accumulation',
        'Market sentiment shifted to extreme fear',
        'RSI oversold conditions detected',
        'Institutional inflows increasing',
        'Risk management: taking profits',
        'Consolidation phase - waiting for breakout',
        'Mixed signals - confidence below threshold'
    ];
    
    const decision = {
        id: decisions.length + 1,
        timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        action: actions[Math.floor(Math.random() * actions.length)],
        confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
        agent: agents[Math.floor(Math.random() * agents.length)],
        reasoning: reasons[Math.floor(Math.random() * reasons.length)]
    };
    
    if (decision.action === 'BUY' || decision.action === 'SELL') {
        decision.entryPrice = portfolio.currentBtcPrice * (1 + (Math.random() - 0.5) * 0.02);
        decision.amount = Math.random() * 0.05 + 0.005; // 0.005 to 0.055 BTC
        decision.amountUsd = decision.amount * decision.entryPrice;
    }
    
    decisions.unshift(decision);
    
    // Keep only last 100 decisions
    if (decisions.length > 100) {
        decisions.pop();
    }
    
    console.log(`🤖 New decision: ${decision.action} (${decision.confidence}% confidence) - ${decision.reasoning}`);
}

// Serve the trading dashboard
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'trading-dashboard.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(join(__dirname, 'trading-dashboard.html'));
});

// Start server
app.listen(port, () => {
    console.log(`┌─────────────────────────────────────────────────────────────┐`);
    console.log(`│                🚀 BITCOIN TRADING DASHBOARD                 │`);
    console.log(`├─────────────────────────────────────────────────────────────┤`);
    console.log(`│  Server running at: http://localhost:${port}                    │`);
    console.log(`│  Dashboard URL: http://localhost:${port}/dashboard              │`);
    console.log(`│                                                             │`);
    console.log(`│  API Endpoints:                                             │`);
    console.log(`│  • GET  /api/bitcoin-price    - Real-time BTC price        │`);
    console.log(`│  • GET  /api/portfolio        - Portfolio status           │`);
    console.log(`│  • GET  /api/decisions        - Trading decisions          │`);
    console.log(`│  • POST /api/decisions        - Add new decision           │`);
    console.log(`└─────────────────────────────────────────────────────────────┘`);
    
    // Initialize portfolio history
    initializePortfolioHistory();
    
    // Start simulating agent decisions every 30 minutes
    setInterval(simulateAgentDecision, 30 * 60 * 1000);
    
    // For demo purposes, make decisions more frequent (every 5 minutes)
    setInterval(simulateAgentDecision, 5 * 60 * 1000);
});