#!/bin/bash

# Market Hunter API Configuration Script
# This script helps you set up API keys for all 8 data sources

echo "🎯 Market Hunter Agent - API Configuration"
echo "==========================================="
echo ""

# Check if .env file exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists. Creating backup..."
    cp .env .env.backup.$(date +%s)
    echo "✅ Backup created"
fi

# Create .env file
cat > .env << 'EOF'
# ============================================================================
# MARKET HUNTER AGENT - API CONFIGURATION
# ============================================================================
# All APIs below have FREE tiers. Sign up links are provided.
#
# Current Status:
# - 3/8 sources working without keys (On-Chain, Institutional, Macro)
# - 5/8 sources need keys (Social, Influencer, Technical, Arbitrage, Derivatives)
# ============================================================================

# ----------------------------------------------------------------------------
# PRIORITY 1: HIGH-VALUE DATA SOURCES
# ----------------------------------------------------------------------------

# CryptoPanic API - For Social Sentiment & Influencer Signals
# Sign up: https://cryptopanic.com/developers/api/
# Free tier: 200 requests/day
# Enables: Social Narrative Analysis + Influencer Signal Tracking
CRYPTOPANIC_API_KEY=

# CoinGecko Pro API - For Technical Analysis & Market Data
# Sign up: https://www.coingecko.com/en/api/pricing
# Free tier: 10,000 requests/month
# Enables: Technical Breakout Detection + Enhanced Market Data
COINGECKO_API_KEY=

# ----------------------------------------------------------------------------
# PRIORITY 2: ENHANCED DATA SOURCES
# ----------------------------------------------------------------------------

# Binance API - For Derivatives & Better Arbitrage Data
# Sign up: https://www.binance.com/en/support/faq/360002502072
# Free tier: Read-only access, no trading required
# Enables: Funding Rate Tracking + Multi-Exchange Arbitrage
BINANCE_API_KEY=
BINANCE_API_SECRET=

# ----------------------------------------------------------------------------
# OPTIONAL: ADVANCED FEATURES
# ----------------------------------------------------------------------------

# Etherscan API - For Enhanced Ethereum Whale Tracking
# Sign up: https://etherscan.io/apis
# Free tier: 5 calls/second
# Enables: Ethereum whale movement detection
ETHERSCAN_API_KEY=

# Glassnode API - For Advanced On-Chain Analytics (Premium)
# Sign up: https://glassnode.com/
# Paid only - for production use
# Enables: Advanced on-chain metrics and indicators
GLASSNODE_API_KEY=

# Twitter API v2 - For Real-Time Social Sentiment (Alternative to CryptoPanic)
# Sign up: https://developer.twitter.com/en/portal/dashboard
# Free tier: Essential access
# Enables: Real-time Twitter sentiment analysis
TWITTER_BEARER_TOKEN=

# ----------------------------------------------------------------------------
# ALTERNATIVE FREE SOURCES (No Registration Required - Already Working!)
# ----------------------------------------------------------------------------
# ✅ Blockchain.info - BTC whale movements (no key needed)
# ✅ Alternative.me - Fear & Greed Index (no key needed)
# ✅ CoinGecko Free - Global market data (no key needed)
# ✅ CoinGecko Free - Institutional holdings (no key needed)

EOF

echo ""
echo "✅ Created .env file with API key placeholders"
echo ""
echo "📋 Next Steps:"
echo "   1. Open the .env file: nano .env"
echo "   2. Sign up for the APIs you want to enable"
echo "   3. Paste your API keys after the '=' signs"
echo "   4. Save the file and run the test again"
echo ""
echo "🚀 Quick Start (Recommended):"
echo "   Sign up for CryptoPanic first - it unlocks 2 data sources!"
echo "   https://cryptopanic.com/developers/api/"
echo ""
echo "📊 Current Status:"
echo "   - Working without keys: 3/8 sources (37.5%)"
echo "   - With free API keys:   8/8 sources (100%)"
echo ""
echo "💡 Tip: All mentioned APIs have generous FREE tiers!"
echo ""
