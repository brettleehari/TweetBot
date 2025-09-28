#!/usr/bin/env node

/**
 * BTC Intelligence Agent - Development Environment
 * Combined Bitcoin analysis + autonomous trading capabilities
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import { promises as fs } from 'fs';
import http from 'http';

class BTCIntelligenceAgent {
  constructor() {
    this.portfolio = {
      totalValue: 10000,
      cash: 10000,
      positions: [],
      totalPnL: 0,
      totalReturn: 0,
      lastUpdated: new Date().toISOString()
    };
    
    this.agents = [
      'Strategic Orchestrator', 
      'Market Hunter', 
      'Performance Optimizer', 
      'Narrative Architect'
    ];
    
    this.app = express();
    this.server = http.createServer(this.app);
    this.wsServer = new WebSocketServer({ server: this.server });
    
    this.tradingHistory = [];
    this.marketData = {
      bitcoinPrice: 45000,
      marketAnalysis: { trend: 'bullish', confidence: 0.75 },
      agentStatus: 'active',
      lastUpdate: new Date().toISOString()
    };
    
    this.isRunning = false;
    this.clients = new Set();
    
    this.setupWebServer();
    this.setupWebSocket();
  }

  setupWebServer() {
    this.app.use(express.static('dev-public'));
    this.app.use(express.json());

    // Main Bitcoin Intelligence Dashboard
    this.app.get('/', (req, res) => {
      res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🤖 Bitcoin Intelligence Agent - Dev Environment</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); 
            min-height: 100vh; color: #fff; padding: 20px; 
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .subtitle { opacity: 0.9; font-size: 1.1rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); border-radius: 15px; padding: 25px; }
        .card h3 { color: #00ff88; margin-bottom: 15px; font-size: 1.2rem; }
        .metric { margin: 10px 0; }
        .metric-label { opacity: 0.8; font-size: 0.9rem; }
        .metric-value { font-size: 1.5rem; font-weight: bold; margin-top: 5px; }
        .positive { color: #00ff88; }
        .negative { color: #ff4444; }
        .neutral { color: #ffaa00; }
        .error { color: #ff6b6b; background: rgba(255,107,107,0.1); padding: 10px; border-radius: 5px; margin: 10px 0; }
        .loading { color: #ffaa00; }
        .success { color: #00ff88; }
        .buttons { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px; }
        .btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.3s; }
        .btn-primary { background: #00ff88; color: #000; }
        .btn-secondary { background: rgba(255,255,255,0.2); color: #fff; }
        .btn:hover { transform: translateY(-2px); }
        .activity-feed { max-height: 400px; overflow-y: auto; }
        .activity-item { background: rgba(255,255,255,0.05); margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #00ff88; }
        .timestamp { color: #aaa; font-size: 0.8rem; margin-bottom: 5px; }
        .agent-name { color: #00aaff; font-weight: bold; }
        .positions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
        .position { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; }
        .wide-card { grid-column: 1 / -1; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Bitcoin Intelligence Agent</h1>
            <p class="subtitle">Real-time Bitcoin market analysis and autonomous trading</p>
        </div>
        
        <div class="grid">
            <!-- Agent Status Card -->
            <div class="card">
                <h3>🔄 Agent Status</h3>
                <div class="metric">
                    <div class="metric-label">System Status</div>
                    <div class="metric-value success" id="agent-status">ACTIVE</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Last Update</div>
                    <div class="metric-value" id="last-update">${new Date().toLocaleString()}</div>
                </div>
                <div class="buttons">
                    <button class="btn btn-primary" onclick="refreshAllData()">🔄 Refresh All Data</button>
                    <button class="btn btn-secondary" onclick="runAnalysis()">⚡ Run Analysis</button>
                </div>
            </div>

            <!-- Bitcoin Price Card -->
            <div class="card">
                <h3>₿ Bitcoin Price</h3>
                <div class="metric">
                    <div class="metric-label">Current Price</div>
                    <div class="metric-value positive" id="bitcoin-price">$${this.marketData.bitcoinPrice.toLocaleString()}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">24h Change</div>
                    <div class="metric-value positive" id="price-change">+2.34%</div>
                </div>
                <div class="buttons">
                    <button class="btn btn-primary" onclick="updateBitcoinPrice()">📊 Update Price</button>
                </div>
            </div>

            <!-- Market Analysis Card -->
            <div class="card">
                <h3>📊 Market Analysis</h3>
                <div class="metric">
                    <div class="metric-label">Trend Direction</div>
                    <div class="metric-value positive" id="market-trend">${this.marketData.marketAnalysis.trend.toUpperCase()}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Confidence Level</div>
                    <div class="metric-value" id="confidence-level">${(this.marketData.marketAnalysis.confidence * 100).toFixed(1)}%</div>
                </div>
                <div class="buttons">
                    <button class="btn btn-primary" onclick="runMarketAnalysis()">🔍 Analyze Market</button>
                </div>
            </div>

            <!-- Portfolio Summary Card -->
            <div class="card">
                <h3>💰 Portfolio Summary</h3>
                <div class="metric">
                    <div class="metric-label">Total Value</div>
                    <div class="metric-value positive" id="portfolio-value">$${this.portfolio.totalValue.toFixed(2)}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Total Return</div>
                    <div class="metric-value ${this.portfolio.totalReturn >= 0 ? 'positive' : 'negative'}" id="portfolio-return">${this.portfolio.totalReturn.toFixed(2)}%</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Active Positions</div>
                    <div class="metric-value neutral" id="position-count">${this.portfolio.positions.length}</div>
                </div>
                <div class="buttons">
                    <button class="btn btn-primary" onclick="downloadReport()">📥 Download Report</button>
                </div>
            </div>
        </div>

        <!-- Current Positions -->
        <div class="card wide-card">
            <h3>🏦 Current Positions</h3>
            <div class="positions-grid" id="positions-grid">
                ${this.portfolio.positions.length === 0 ? 
                  '<div class="position">No active positions</div>' :
                  this.portfolio.positions.map(pos => `
                    <div class="position">
                        <strong>${pos.symbol}</strong> - ${pos.amount.toFixed(4)} units<br>
                        Avg Price: $${pos.avgPrice.toFixed(2)}<br>
                        Market Value: $${pos.marketValue.toFixed(2)}<br>
                        P&L: <span class="${pos.pnl >= 0 ? 'positive' : 'negative'}">$${pos.pnl.toFixed(2)} (${pos.pnlPercent.toFixed(1)}%)</span>
                    </div>
                  `).join('')
                }
            </div>
        </div>

        <!-- AI Agent Activity -->
        <div class="card wide-card">
            <h3>🤖 AI Agent Activity Feed</h3>
            <div class="activity-feed" id="activity-feed">
                <div class="activity-item">
                    <div class="timestamp">${new Date().toLocaleString()}</div>
                    <div>🚀 <span class="agent-name">System</span> - Bitcoin Intelligence Agent initialized and ready</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // WebSocket connection for real-time updates
        let ws;
        function connectWebSocket() {
            try {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                ws = new WebSocket(protocol + '//' + window.location.host);
                
                ws.onopen = function() {
                    console.log('🔗 Connected to Bitcoin Intelligence Agent');
                    addActivity('System', 'WebSocket connection established');
                };
                
                ws.onmessage = function(event) {
                    try {
                        const data = JSON.parse(event.data);
                        handleWebSocketMessage(data);
                    } catch (e) {
                        console.log('WebSocket message error:', e);
                    }
                };
                
                ws.onclose = function() {
                    console.log('🔌 Disconnected, retrying in 5s...');
                    setTimeout(connectWebSocket, 5000);
                };
                
                ws.onerror = function(error) {
                    console.log('WebSocket error:', error);
                };
            } catch (error) {
                console.log('WebSocket connection failed:', error);
                setTimeout(connectWebSocket, 5000);
            }
        }

        function handleWebSocketMessage(data) {
            switch(data.type) {
                case 'price-update':
                    updateBitcoinPriceDisplay(data.price, data.change);
                    break;
                case 'market-analysis':
                    updateMarketAnalysis(data.analysis);
                    break;
                case 'trading-decision':
                    addActivity(data.agent, data.message);
                    updatePortfolio(data.portfolio);
                    break;
                case 'agent-status':
                    updateAgentStatus(data.status);
                    break;
            }
        }

        function addActivity(agent, message) {
            const feed = document.getElementById('activity-feed');
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = \`
                <div class="timestamp">\${new Date().toLocaleString()}</div>
                <div>🤖 <span class="agent-name">\${agent}</span> - \${message}</div>
            \`;
            feed.insertBefore(item, feed.firstChild);
            
            if (feed.children.length > 20) {
                feed.removeChild(feed.lastChild);
            }
        }

        function updateBitcoinPriceDisplay(price, change) {
            document.getElementById('bitcoin-price').textContent = '$' + price.toLocaleString();
            const changeElement = document.getElementById('price-change');
            changeElement.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
            changeElement.className = 'metric-value ' + (change >= 0 ? 'positive' : 'negative');
        }

        function updateMarketAnalysis(analysis) {
            document.getElementById('market-trend').textContent = analysis.trend.toUpperCase();
            document.getElementById('confidence-level').textContent = (analysis.confidence * 100).toFixed(1) + '%';
            addActivity('Market Analyzer', \`Market trend: \${analysis.trend} (confidence: \${(analysis.confidence * 100).toFixed(1)}%)\`);
        }

        function updatePortfolio(portfolio) {
            document.getElementById('portfolio-value').textContent = '$' + portfolio.totalValue.toFixed(2);
            document.getElementById('portfolio-return').textContent = portfolio.totalReturn.toFixed(2) + '%';
            document.getElementById('position-count').textContent = portfolio.positions.length;
        }

        function updateAgentStatus(status) {
            document.getElementById('agent-status').textContent = status.toUpperCase();
            document.getElementById('last-update').textContent = new Date().toLocaleString();
        }

        // API Functions
        async function refreshAllData() {
            addActivity('System', 'Refreshing all data...');
            try {
                await Promise.all([
                    updateBitcoinPrice(),
                    runMarketAnalysis(),
                    updatePortfolioData()
                ]);
                addActivity('System', 'All data refreshed successfully');
            } catch (error) {
                addActivity('System', 'Error refreshing data: ' + error.message);
            }
        }

        async function updateBitcoinPrice() {
            try {
                const response = await fetch('/api/bitcoin-price');
                const data = await response.json();
                if (data.success) {
                    updateBitcoinPriceDisplay(data.price, data.change || 0);
                    addActivity('Price Monitor', \`Bitcoin price updated: $\${data.price.toLocaleString()}\`);
                } else {
                    addActivity('Price Monitor', 'Error updating price: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                addActivity('Price Monitor', 'Failed to fetch price: ' + error.message);
            }
        }

        async function runMarketAnalysis() {
            try {
                const response = await fetch('/api/market-analysis');
                const data = await response.json();
                if (data.success) {
                    updateMarketAnalysis(data.analysis);
                } else {
                    addActivity('Market Analyzer', 'Analysis error: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                addActivity('Market Analyzer', 'Analysis failed: ' + error.message);
            }
        }

        async function runAnalysis() {
            addActivity('Strategic Orchestrator', 'Running comprehensive market analysis...');
            await runMarketAnalysis();
            setTimeout(() => {
                addActivity('Narrative Architect', 'Analyzing market narratives and sentiment patterns');
            }, 1000);
            setTimeout(() => {
                addActivity('Performance Optimizer', 'Optimizing portfolio allocation based on analysis');
            }, 2000);
        }

        async function updatePortfolioData() {
            try {
                const response = await fetch('/api/portfolio');
                const data = await response.json();
                updatePortfolio(data);
            } catch (error) {
                console.log('Portfolio update error:', error);
            }
        }

        function downloadReport() {
            fetch('/api/download-report')
                .then(response => response.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'bitcoin-intelligence-report.csv';
                    a.click();
                    window.URL.revokeObjectURL(url);
                    addActivity('System', 'Trading report downloaded');
                })
                .catch(error => {
                    addActivity('System', 'Download failed: ' + error.message);
                });
        }

        // Initialize
        connectWebSocket();
        
        // Periodic updates
        setInterval(updateBitcoinPrice, 30000); // Every 30 seconds
        setInterval(runMarketAnalysis, 120000); // Every 2 minutes
    </script>
</body>
</html>
      `);
    });

    // API Endpoints
    this.app.get('/api/bitcoin-price', async (req, res) => {
      try {
        // Simulate Bitcoin price with realistic movement
        const basePrice = 45000;
        const volatility = 0.02; // 2% volatility
        const change = (Math.random() - 0.5) * volatility * 2;
        const newPrice = Math.round(basePrice * (1 + change));
        const changePercent = change * 100;
        
        this.marketData.bitcoinPrice = newPrice;
        
        res.json({ 
          success: true, 
          price: newPrice,
          change: changePercent,
          timestamp: new Date().toISOString()
        });
        
        // Broadcast to WebSocket clients
        this.broadcast({
          type: 'price-update',
          price: newPrice,
          change: changePercent
        });
        
      } catch (error) {
        res.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.app.get('/api/market-analysis', async (req, res) => {
      try {
        // Simulate intelligent market analysis
        const trends = ['bullish', 'bearish', 'neutral', 'volatile'];
        const trend = trends[Math.floor(Math.random() * trends.length)];
        const confidence = 0.6 + Math.random() * 0.4; // 60-100% confidence
        
        const analysis = {
          trend,
          confidence,
          indicators: {
            rsi: Math.random() * 100,
            macd: (Math.random() - 0.5) * 2,
            volume: Math.random() * 1000000000
          },
          sentiment: Math.random() * 2 - 1, // -1 to 1
          timestamp: new Date().toISOString()
        };
        
        this.marketData.marketAnalysis = analysis;
        
        res.json({ success: true, analysis });
        
        // Broadcast to WebSocket clients
        this.broadcast({
          type: 'market-analysis',
          analysis
        });
        
      } catch (error) {
        res.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.app.get('/api/portfolio', (req, res) => {
      res.json(this.portfolio);
    });

    this.app.get('/api/trading-history', (req, res) => {
      res.json(this.tradingHistory);
    });

    this.app.get('/api/download-report', (req, res) => {
      const report = this.generateDetailedReport();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="bitcoin-intelligence-report.csv"');
      res.send(report);
    });

    this.app.get('/api/status', (req, res) => {
      res.json({
        status: 'active',
        uptime: process.uptime(),
        marketData: this.marketData,
        portfolio: this.portfolio,
        agents: this.agents.map(name => ({ name, status: 'active' })),
        lastDecision: this.tradingHistory[this.tradingHistory.length - 1] || null,
        clients: this.clients.size,
        timestamp: new Date().toISOString()
      });
    });

    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
  }

  setupWebSocket() {
    this.wsServer.on('connection', (ws) => {
      this.clients.add(ws);
      console.log('📱 Client connected to Bitcoin Intelligence Agent');
      
      // Send welcome message
      try {
        ws.send(JSON.stringify({
          type: 'agent-status',
          status: 'connected',
          message: 'Welcome to Bitcoin Intelligence Agent'
        }));
      } catch (error) {
        console.log('WebSocket send error:', error);
      }

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('📱 Client disconnected');
      });

      ws.on('error', (error) => {
        console.log('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  broadcast(data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      try {
        if (client.readyState === 1) {
          client.send(message);
        }
      } catch (error) {
        console.log('Broadcast error:', error);
        this.clients.delete(client);
      }
    });
  }

  generateDetailedReport() {
    let csv = 'Bitcoin Intelligence Agent Report\n';
    csv += 'Generated at: ' + new Date().toISOString() + '\n\n';
    
    csv += 'Market Data\n';
    csv += `Bitcoin Price,$${this.marketData.bitcoinPrice}\n`;
    csv += `Market Trend,${this.marketData.marketAnalysis.trend}\n`;
    csv += `Confidence,${(this.marketData.marketAnalysis.confidence * 100).toFixed(1)}%\n\n`;
    
    csv += 'Portfolio Summary\n';
    csv += `Total Value,$${this.portfolio.totalValue.toFixed(2)}\n`;
    csv += `Cash,$${this.portfolio.cash.toFixed(2)}\n`;
    csv += `Total Return,${this.portfolio.totalReturn.toFixed(2)}%\n`;
    csv += `Active Positions,${this.portfolio.positions.length}\n\n`;
    
    if (this.tradingHistory.length > 0) {
      csv += 'Trading History\n';
      csv += 'Timestamp,Agent,Action,Symbol,Amount,Price,Confidence\n';
      this.tradingHistory.forEach(trade => {
        csv += `${trade.timestamp},${trade.agent},${trade.action},${trade.symbol},${trade.amount},${trade.price},${trade.confidence}%\n`;
      });
    }
    
    return csv;
  }

  async start() {
    const port = process.env.DEV_PORT || 3001;
    
    this.server.listen(port, '0.0.0.0', () => {
      console.log('🤖 Bitcoin Intelligence Agent - DEV ENVIRONMENT');
      console.log(`📊 Dashboard: http://localhost:${port}`);
      console.log('🔬 Development mode with real-time iteration');
      console.log('💡 WebSocket streaming for live updates');
      console.log('🛠️ Hot reload ready for rapid development');
      console.log('⚡ AI agents ready for Bitcoin analysis');
    });

    this.isRunning = true;
    
    // Start periodic market analysis
    setInterval(() => this.performAutomaticAnalysis(), 60000); // Every minute in dev
  }

  async performAutomaticAnalysis() {
    if (!this.isRunning) return;
    
    const agent = this.agents[Math.floor(Math.random() * this.agents.length)];
    const analysisTypes = [
      'price trend analysis',
      'market sentiment evaluation', 
      'technical indicator review',
      'news sentiment analysis',
      'portfolio optimization'
    ];
    
    const analysisType = analysisTypes[Math.floor(Math.random() * analysisTypes.length)];
    
    this.broadcast({
      type: 'trading-decision',
      agent,
      message: `Performing ${analysisType}`,
      portfolio: this.portfolio
    });
    
    console.log(`🤖 ${agent}: ${analysisType}`);
  }

  async loadData() {
    try {
      const data = await fs.readFile('dev-portfolio.json', 'utf8');
      this.portfolio = JSON.parse(data);
      console.log('📊 Dev portfolio loaded');
    } catch (error) {
      console.log('📊 Starting with fresh dev portfolio');
    }
  }

  async saveData() {
    try {
      await fs.writeFile('dev-portfolio.json', JSON.stringify(this.portfolio, null, 2));
      await fs.writeFile('dev-trading-history.json', JSON.stringify(this.tradingHistory, null, 2));
    } catch (error) {
      console.error('❌ Failed to save dev data:', error);
    }
  }
}

// Start the development environment
const devAgent = new BTCIntelligenceAgent();
devAgent.loadData().then(() => {
  devAgent.start().catch(console.error);
});

// Auto-save in dev mode
setInterval(() => devAgent.saveData(), 30000);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\\n🛑 Shutting down dev environment...');
  await devAgent.saveData();
  process.exit(0);
});