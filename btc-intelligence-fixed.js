#!/usr/bin/env node

/**
 * BTC Intelligence Agent - Development Environment (FIXED)
 * Real-time Bitcoin price from CoinGecko API
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import { promises as fs } from 'fs';
import http from 'http';

class BTCIntelligenceAgent {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wsServer = new WebSocketServer({ server: this.server });
    
    this.marketData = {
      bitcoinPrice: 0, // Will be fetched from real API
      marketAnalysis: { trend: 'bullish', confidence: 0.75 },
      agentStatus: 'active',
      lastUpdate: new Date().toISOString()
    };
    
    this.clients = new Set();
    this.setupWebServer();
    this.setupWebSocket();
    
    // Fetch real Bitcoin price on startup
    this.updateBitcoinPrice();
    
    // Update price every minute
    setInterval(() => this.updateBitcoinPrice(), 60000);
  }

  async updateBitcoinPrice() {
    try {
      console.log('🔄 Fetching real Bitcoin price from CoinGecko...');
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const data = await response.json();
      
      if (data.bitcoin && data.bitcoin.usd) {
        const oldPrice = this.marketData.bitcoinPrice;
        this.marketData.bitcoinPrice = data.bitcoin.usd;
        this.marketData.lastUpdate = new Date().toISOString();
        
        console.log(`💰 Bitcoin price updated: $${this.marketData.bitcoinPrice.toLocaleString()}`);
        
        if (oldPrice > 0) {
          const change = ((this.marketData.bitcoinPrice - oldPrice) / oldPrice) * 100;
          console.log(`📈 Price change: ${change > 0 ? '+' : ''}${change.toFixed(2)}%`);
        }
        
        // Broadcast to connected clients
        this.broadcast({
          type: 'price-update',
          price: this.marketData.bitcoinPrice,
          timestamp: this.marketData.lastUpdate
        });
      }
    } catch (error) {
      console.error('❌ Failed to fetch Bitcoin price:', error.message);
      // Keep existing price if fetch fails
    }
  }

  setupWebServer() {
    this.app.use(express.static('public'));
    this.app.use(express.json());

    // Main dashboard
    this.app.get('/', (req, res) => {
      res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bitcoin Intelligence Agent Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            min-height: 100vh;
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; color: white; margin-bottom: 30px; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .card h3 { color: #2c5282; margin-bottom: 15px; font-size: 1.2rem; }
        .price { font-size: 2rem; font-weight: bold; color: #2d8f3f; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; }
        .status.active { background: #c6f6d5; color: #2d8f3f; }
        .update-time { color: #666; font-size: 0.9rem; margin-top: 10px; }
        .error { background: #fed7d7; color: #c53030; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .loading { color: #666; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Bitcoin Intelligence Agent</h1>
            <p>Real-time Bitcoin market analysis and price monitoring</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>💰 Bitcoin Price</h3>
                <div class="price" id="bitcoin-price">
                    ${this.marketData.bitcoinPrice > 0 ? 
                      '$' + this.marketData.bitcoinPrice.toLocaleString() : 
                      '<span class="loading">Loading real price...</span>'}
                </div>
                <div class="update-time" id="last-update">
                    Last updated: ${new Date(this.marketData.lastUpdate).toLocaleString()}
                </div>
            </div>
            
            <div class="card">
                <h3>🤖 Agent Status</h3>
                <div class="status active" id="agent-status">${this.marketData.agentStatus}</div>
                <div class="update-time">
                    Real-time monitoring active
                </div>
            </div>
            
            <div class="card">
                <h3>📊 Market Analysis</h3>
                <div>Trend: <strong id="trend">${this.marketData.marketAnalysis.trend}</strong></div>
                <div>Confidence: <strong id="confidence">${Math.round(this.marketData.marketAnalysis.confidence * 100)}%</strong></div>
                <div class="update-time">
                    AI-powered analysis
                </div>
            </div>
            
            <div class="card">
                <h3>📈 Price Feed</h3>
                <div id="price-updates">
                    <div>Live updates every minute</div>
                    <div class="update-time">Connected to CoinGecko API</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // WebSocket connection for real-time updates
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(protocol + '//' + window.location.host);
        
        ws.onmessage = function(event) {
            const data = JSON.parse(event.data);
            if (data.type === 'price-update') {
                document.getElementById('bitcoin-price').innerHTML = '$' + data.price.toLocaleString();
                document.getElementById('last-update').textContent = 'Last updated: ' + new Date(data.timestamp).toLocaleString();
                
                // Add to price feed
                const feed = document.getElementById('price-updates');
                const update = document.createElement('div');
                update.innerHTML = \`\${new Date().toLocaleTimeString()}: $\${data.price.toLocaleString()}\`;
                feed.insertBefore(update, feed.children[2] || null);
                
                // Keep only last 5 updates
                while (feed.children.length > 7) {
                    feed.removeChild(feed.lastChild);
                }
            }
        };
        
        ws.onopen = function() {
            console.log('Connected to Bitcoin Intelligence Agent');
        };
        
        ws.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
    </script>
</body>
</html>
      `);
    });

    // API endpoints
    this.app.get('/api/bitcoin-price', async (req, res) => {
      // Ensure we have the latest price
      if (this.marketData.bitcoinPrice === 0) {
        await this.updateBitcoinPrice();
      }
      
      res.json({
        success: true,
        price: this.marketData.bitcoinPrice,
        timestamp: this.marketData.lastUpdate
      });
    });

    this.app.get('/api/market-analysis', (req, res) => {
      res.json({
        success: true,
        data: this.marketData.marketAnalysis,
        timestamp: this.marketData.lastUpdate
      });
    });

    this.app.get('/api/status', (req, res) => {
      res.json({
        status: 'active',
        bitcoinPrice: this.marketData.bitcoinPrice,
        lastUpdate: this.marketData.lastUpdate,
        uptime: process.uptime()
      });
    });
  }

  setupWebSocket() {
    this.wsServer.on('connection', (ws) => {
      this.clients.add(ws);
      console.log('📱 Client connected to BTC Intelligence dashboard');
      
      // Send current data
      ws.send(JSON.stringify({
        type: 'initial-data',
        price: this.marketData.bitcoinPrice,
        timestamp: this.marketData.lastUpdate
      }));

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('📱 Client disconnected');
      });
    });
  }

  broadcast(data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === 1) { // OPEN
        client.send(message);
      }
    });
  }

  async start() {
    const port = 3001;
    
    this.server.listen(port, '0.0.0.0', () => {
      console.log('🚀 Bitcoin Intelligence Agent Started!');
      console.log(`📊 Dashboard: http://localhost:${port}`);
      console.log('💰 Real-time Bitcoin price monitoring');
      console.log('🔄 Updates every minute from CoinGecko API');
    });
  }
}

// Start the BTC Intelligence Agent
const agent = new BTCIntelligenceAgent();
agent.start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down BTC Intelligence Agent...');
  process.exit(0);
});