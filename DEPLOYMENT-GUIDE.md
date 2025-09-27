# 🚀 24/7 Autonomous Trading Deployment Guide

## 🎯 Choose Your Hosting Platform

### 1. Railway (Recommended - Easiest) 
**Cost: $5-10/month | Setup: 2 minutes**

```bash
# 1. Sign up at railway.app
# 2. Connect your GitHub account
# 3. Import this repository
# 4. Deploy automatically!

# Your service will be live at: https://your-app.railway.app
# Dashboard with downloadable reports included!
```

### 2. Digital Ocean Droplet (Most Control)
**Cost: $6/month | Setup: 5 minutes**

```bash
# 1. Create $6/month droplet (Ubuntu 22.04)
ssh root@your-droplet-ip

# 2. Setup Node.js & PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
npm install -g pm2

# 3. Clone and run
git clone https://github.com/brettleehari/TweetBot.git
cd TweetBot
npm install
chmod +x trading-service.sh

# 4. Start 24/7 service
./trading-service.sh install-systemd
systemctl start tweetbot-trading

# ✅ Your bot is now running 24/7!
# Dashboard: http://your-droplet-ip:3000
```

### 3. Heroku (Simple but Limited)
**Cost: $7/month | Setup: 3 minutes**

```bash
# 1. Install Heroku CLI
npm install -g heroku

# 2. Create and deploy
heroku create your-tweetbot-trading
git push heroku main

# 3. Scale to keep running
heroku ps:scale web=1
```

### 4. AWS/Google Cloud/Azure
**Cost: $10-20/month | Setup: 10 minutes**

Use the included `Dockerfile` for container deployment:
```bash
docker build -t tweetbot-trading .
docker run -p 3000:3000 -d tweetbot-trading
```

## 📊 Download Trading Reports

Once deployed, your bot provides downloadable CSV reports:

### Available Reports:
1. **Portfolio Summary** - Current positions and performance
2. **Trading History** - Every trade with timestamps and reasoning
3. **Daily Reports** - Daily performance summaries
4. **Performance Metrics** - Win rates, risk levels, returns

### Access Methods:
- **Web Dashboard**: `http://your-domain:3000`
- **Direct Downloads**:
  - Portfolio: `/api/portfolio/download`
  - Trades: `/api/trades/download` 
  - Daily: `/api/daily-report/download`
- **API Endpoints**: `/api/status`, `/api/performance-metrics`

## 🛡️ Production Features

### Automatic Recovery:
- **Crash Recovery**: Automatically restarts on errors
- **Data Persistence**: Portfolio state saved every decision
- **Health Monitoring**: 5-minute health checks
- **Error Logging**: Comprehensive error tracking

### Risk Management:
- **Position Limits**: Max 15% per asset
- **Cash Reserve**: Minimum 5% cash
- **Stop Loss**: Automatic risk controls
- **Correlation Monitoring**: Diversification tracking

### Monitoring & Alerts:
- **Web Dashboard**: Real-time portfolio status
- **CSV Reports**: Downloadable trading history
- **API Access**: Programmatic data access
- **Health Checks**: System status monitoring

## ⚙️ Environment Configuration

Create `.env` file with your API keys:
```bash
# Required for live data (optional - works with simulated data)
COINGECKO_API_KEY=your_key_here
ALPHA_VANTAGE_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here

# Trading parameters
PORT=3000
NODE_ENV=production
```

## 🔧 Local Testing

```bash
# Test locally first
git clone https://github.com/brettleehari/TweetBot.git
cd TweetBot
npm install

# Start the enhanced service
node --loader ts-node/esm enhanced-24x7-trading.ts

# Access dashboard: http://localhost:3000
# Download reports: http://localhost:3000/api/trades/download
```

## 📈 Expected Performance

### Current Live Performance:
- **Portfolio Value**: $9,783.06
- **Total Return**: -2.17%
- **Win Rate**: Calculated from trade history
- **Active Positions**: 2 (MATIC, SOL)
- **Decision Frequency**: Every 30 minutes
- **Price Updates**: Every 5 minutes

### System Capabilities:
- **24/7 Operation**: Continuous trading
- **4 AI Agents**: Specialized decision making
- **Risk Management**: Automated controls
- **Data Integration**: Multi-source market data
- **Report Generation**: Automated CSV exports
- **Web Interface**: Real-time monitoring

## 🚨 Quick Start Commands

### Railway (Fastest):
1. Go to railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Select your TweetBot repository
4. ✅ Done! Auto-deploys on every push

### VPS/Cloud:
```bash
git clone https://github.com/brettleehari/TweetBot.git
cd TweetBot && npm install
chmod +x trading-service.sh
./trading-service.sh start
```

### Docker:
```bash
docker run -p 3000:3000 -d your-registry/tweetbot:latest
```

## 💾 Data & Reports

All trading data is automatically saved and available for download:

### CSV Reports Include:
- **Timestamp**: Exact time of each trade
- **Agent Decision**: Which AI agent made the decision  
- **Action**: BUY/SELL/HOLD with reasoning
- **Performance**: P&L, returns, win rates
- **Portfolio**: Current positions and values
- **Risk Metrics**: Position sizes, cash levels

### Report Schedule:
- **Real-time**: Dashboard updates every 30 seconds
- **CSV Generation**: Available on-demand
- **Daily Reports**: Generated automatically every 24 hours
- **Data Retention**: Last 30 days of detailed history

---

## 🎉 You're All Set!

Your autonomous trading bot will:
✅ Run 24/7 without interruption
✅ Make trading decisions every 30 minutes
✅ Generate downloadable reports
✅ Monitor itself with health checks
✅ Recover automatically from errors
✅ Provide web dashboard access

**Dashboard URL**: `http://your-domain:3000`
**Download Reports**: Available from dashboard or direct API endpoints

Happy autonomous trading! 🤖📈