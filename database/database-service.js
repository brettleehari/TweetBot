import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Database } = sqlite3.verbose();

class DatabaseService {
    constructor() {
        this.dbPath = path.join(__dirname, '../database/trading.db');
        this.schemaPath = path.join(__dirname, '../database/schema.sql');
        this.db = null;
        this.initDatabase();
    }

    async initDatabase() {
        try {
            // Ensure database directory exists
            const dbDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            this.db = new Database(this.dbPath);
            
            // Initialize schema if needed
            if (fs.existsSync(this.schemaPath)) {
                const schema = fs.readFileSync(this.schemaPath, 'utf8');
                await this.runQuery(schema);
                console.log('✅ Database initialized with schema');
            }
        } catch (error) {
            console.error('❌ Database initialization error:', error);
        }
    }

    runQuery(query, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            if (query.includes('SELECT') || query.includes('SELECT')) {
                this.db.all(query, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            } else {
                this.db.run(query, params, function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, changes: this.changes });
                });
            }
        });
    }

    // Portfolio Operations
    async getCurrentPortfolio() {
        const query = `
            SELECT * FROM portfolio 
            ORDER BY timestamp DESC 
            LIMIT 1
        `;
        const result = await this.runQuery(query);
        return result[0] || null;
    }

    async updatePortfolio(btcHoldings, usdBalance, totalValue, profit = 0, profitPercentage = 0) {
        const query = `
            UPDATE portfolio 
            SET btc_holdings = ?, usd_balance = ?, total_value_usd = ?, 
                total_profit_usd = ?, profit_percentage = ?, last_updated = CURRENT_TIMESTAMP
            WHERE id = 1
        `;
        return await this.runQuery(query, [btcHoldings, usdBalance, totalValue, profit, profitPercentage]);
    }

    // Trade Operations
    async recordTrade(type, amountBtc, priceUsd, feeUsd, totalUsd, reason, marketConditions) {
        const query = `
            INSERT INTO trades (trade_type, amount_btc, price_usd, fee_usd, total_usd, 
                              agent_decision_reason, market_conditions)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        return await this.runQuery(query, [type, amountBtc, priceUsd, feeUsd, totalUsd, reason, marketConditions]);
    }

    async getRecentTrades(limit = 10) {
        const query = `
            SELECT * FROM trades 
            ORDER BY timestamp DESC 
            LIMIT ?
        `;
        return await this.runQuery(query, [limit]);
    }

    // Market Data Operations
    async recordMarketData(priceUsd, volume24h, marketCap, priceChange24h, fearGreed, rsi, ma50, ma200) {
        const query = `
            INSERT INTO market_data (price_usd, volume_24h, market_cap, price_change_24h, 
                                   fear_greed_index, rsi_value, moving_avg_50, moving_avg_200)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return await this.runQuery(query, [priceUsd, volume24h, marketCap, priceChange24h, fearGreed, rsi, ma50, ma200]);
    }

    async getLatestMarketData() {
        const query = `
            SELECT * FROM market_data 
            ORDER BY timestamp DESC 
            LIMIT 1
        `;
        const result = await this.runQuery(query);
        return result[0] || null;
    }

    // Agent Execution Logging
    async logAgentExecution(agentName, executionType, inputData, outputData, success, executionTime, error = null) {
        const query = `
            INSERT INTO agent_executions (agent_name, execution_type, input_data, output_data, 
                                        success, execution_time_ms, error_message)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        return await this.runQuery(query, [
            agentName, executionType, 
            JSON.stringify(inputData), 
            JSON.stringify(outputData), 
            success, executionTime, error
        ]);
    }

    async getAgentExecutions(agentName = null, limit = 50) {
        let query = `
            SELECT * FROM agent_executions 
            ${agentName ? 'WHERE agent_name = ?' : ''}
            ORDER BY timestamp DESC 
            LIMIT ?
        `;
        const params = agentName ? [agentName, limit] : [limit];
        return await this.runQuery(query, params);
    }

    // News Analysis Operations
    async recordNewsAnalysis(headline, source, sentimentScore, relevanceScore, impactPrediction) {
        const query = `
            INSERT INTO news_analysis (headline, source, sentiment_score, relevance_score, impact_prediction)
            VALUES (?, ?, ?, ?, ?)
        `;
        return await this.runQuery(query, [headline, source, sentimentScore, relevanceScore, impactPrediction]);
    }

    async getRecentNews(limit = 20) {
        const query = `
            SELECT * FROM news_analysis 
            ORDER BY timestamp DESC 
            LIMIT ?
        `;
        return await this.runQuery(query, [limit]);
    }

    // Performance Analytics - FIXED CALCULATIONS
    async getPortfolioPerformance() {
        const queries = {
            totalTrades: 'SELECT COUNT(*) as count FROM trades',
            // FIXED: Calculate total fees paid
            totalFees: 'SELECT SUM(fee_usd) as fees FROM trades',
            avgTradeSize: 'SELECT AVG(amount_btc) as avg_size FROM trades',
            // FIXED: Proper FIFO trade pairing for win rate
            winRate: `
                WITH buy_trades AS (
                    SELECT *, ROW_NUMBER() OVER (ORDER BY timestamp) as buy_order
                    FROM trades WHERE trade_type = 'BUY'
                ),
                sell_trades AS (
                    SELECT *, ROW_NUMBER() OVER (ORDER BY timestamp) as sell_order
                    FROM trades WHERE trade_type = 'SELL'
                ),
                paired_trades AS (
                    SELECT 
                        s.total_usd as sell_amount,
                        b.total_usd as buy_amount,
                        s.fee_usd + b.fee_usd as total_fees,
                        (s.total_usd - b.total_usd - s.fee_usd - b.fee_usd) as net_profit
                    FROM sell_trades s
                    JOIN buy_trades b ON b.buy_order = s.sell_order
                )
                SELECT 
                    COALESCE(
                        COUNT(CASE WHEN net_profit > 0 THEN 1 END) * 100.0 / 
                        NULLIF(COUNT(*), 0), 
                        0
                    ) as win_rate
                FROM paired_trades
            `,
            dailyVolume: `
                SELECT SUM(total_usd) as volume 
                FROM trades 
                WHERE DATE(timestamp) = DATE('now')
            `,
            totalVolume: `SELECT SUM(total_usd) as volume FROM trades`,
            // FIXED: Calculate cost basis using weighted average
            costBasis: `
                SELECT 
                    CASE WHEN SUM(amount_btc) > 0 
                    THEN SUM(amount_btc * price_usd + fee_usd) / SUM(amount_btc)
                    ELSE 0 END as cost_basis
                FROM trades 
                WHERE trade_type = 'BUY'
            `,
            // FIXED: Proper trade pairing for profitable trades count
            profitableTrades: `
                WITH buy_trades AS (
                    SELECT *, ROW_NUMBER() OVER (ORDER BY timestamp) as buy_order
                    FROM trades WHERE trade_type = 'BUY'
                ),
                sell_trades AS (
                    SELECT *, ROW_NUMBER() OVER (ORDER BY timestamp) as sell_order
                    FROM trades WHERE trade_type = 'SELL'
                ),
                paired_trades AS (
                    SELECT 
                        (s.total_usd - b.total_usd - s.fee_usd - b.fee_usd) as net_profit
                    FROM sell_trades s
                    JOIN buy_trades b ON b.buy_order = s.sell_order
                )
                SELECT COUNT(CASE WHEN net_profit > 0 THEN 1 END) as count
                FROM paired_trades
            `,
            totalSellTrades: `SELECT COUNT(*) as count FROM trades WHERE trade_type = 'SELL'`,
            // FIXED: Proper average return calculation with FIFO pairing
            avgReturn: `
                WITH buy_trades AS (
                    SELECT *, ROW_NUMBER() OVER (ORDER BY timestamp) as buy_order
                    FROM trades WHERE trade_type = 'BUY'
                ),
                sell_trades AS (
                    SELECT *, ROW_NUMBER() OVER (ORDER BY timestamp) as sell_order
                    FROM trades WHERE trade_type = 'SELL'
                ),
                paired_trades AS (
                    SELECT 
                        CASE WHEN b.total_usd > 0 
                        THEN ((s.total_usd - b.total_usd - s.fee_usd - b.fee_usd) / b.total_usd * 100)
                        ELSE 0 END as return_pct
                    FROM sell_trades s
                    JOIN buy_trades b ON b.buy_order = s.sell_order
                    WHERE b.total_usd > 0
                )
                SELECT AVG(return_pct) as avg_return
                FROM paired_trades
            `,
            // FIXED: Calculate realized profit from paired trades
            realizedProfit: `
                WITH buy_trades AS (
                    SELECT *, ROW_NUMBER() OVER (ORDER BY timestamp) as buy_order
                    FROM trades WHERE trade_type = 'BUY'
                ),
                sell_trades AS (
                    SELECT *, ROW_NUMBER() OVER (ORDER BY timestamp) as sell_order
                    FROM trades WHERE trade_type = 'SELL'
                ),
                paired_trades AS (
                    SELECT 
                        (s.total_usd - b.total_usd - s.fee_usd - b.fee_usd) as net_profit
                    FROM sell_trades s
                    JOIN buy_trades b ON b.buy_order = s.sell_order
                )
                SELECT SUM(net_profit) as profit
                FROM paired_trades
            `
        };

        const results = {};
        for (const [key, query] of Object.entries(queries)) {
            try {
                const result = await this.runQuery(query);
                results[key] = result[0];
            } catch (error) {
                console.error(`Error executing ${key} query:`, error);
                results[key] = null;
            }
        }
        return results;
    }

    // Calculate detailed performance metrics - FIXED VERSION
    async getDetailedPerformance() {
        try {
            const basicStats = await this.getPortfolioPerformance();
            const portfolio = await this.getCurrentPortfolio();
            
            // FIXED: Calculate success rate from properly paired trades
            const successRate = basicStats.profitableTrades?.count && basicStats.totalSellTrades?.count 
                ? (basicStats.profitableTrades.count / basicStats.totalSellTrades.count * 100)
                : 0;

            // FIXED: Use proper average return from paired trades
            const avgReturn = basicStats.avgReturn?.avg_return || 0;

            // FIXED: Calculate proper Sharpe ratio with actual volatility
            const sharpeRatio = await this.calculateSharpeRatio();

            // Calculate total return percentage
            const initialInvestment = 10000; // Starting with $10k as specified
            const currentValue = portfolio?.total_value_usd || initialInvestment;
            const totalReturn = ((currentValue - initialInvestment) / initialInvestment * 100);

            // FIXED: Calculate unrealized P&L
            const costBasis = basicStats.costBasis?.cost_basis || 0;
            const currentBtcHoldings = portfolio?.btc_holdings || 0;
            const currentPrice = await this.getCurrentBitcoinPrice();
            const unrealizedProfit = currentBtcHoldings * (currentPrice - costBasis);
            
            // FIXED: Total profit = realized + unrealized
            const realizedProfit = basicStats.realizedProfit?.profit || 0;
            const totalProfit = realizedProfit + unrealizedProfit;

            // FIXED: Calculate maximum drawdown
            const maxDrawdown = await this.calculateMaxDrawdown();

            return {
                successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
                totalTrades: basicStats.totalTrades?.count || 0,
                avgReturn: Math.round(avgReturn * 100) / 100, // Round to 2 decimals
                sharpeRatio: Math.round(sharpeRatio * 100) / 100, // Round to 2 decimals
                totalReturn: Math.round(totalReturn * 100) / 100,
                realizedProfit: Math.round(realizedProfit * 100) / 100,
                unrealizedProfit: Math.round(unrealizedProfit * 100) / 100,
                totalProfit: Math.round(totalProfit * 100) / 100,
                totalVolume: basicStats.totalVolume?.volume || 0,
                dailyVolume: basicStats.dailyVolume?.volume || 0,
                totalFees: basicStats.totalFees?.fees || 0,
                costBasis: Math.round(costBasis * 100) / 100,
                maxDrawdown: Math.round(maxDrawdown * 10) / 10,
                winRate: basicStats.winRate?.win_rate || 0
            };
        } catch (error) {
            console.error('Error calculating detailed performance:', error);
            return {
                successRate: 0,
                totalTrades: 0,
                avgReturn: 0,
                sharpeRatio: 0,
                totalReturn: 0,
                realizedProfit: 0,
                unrealizedProfit: 0,
                totalProfit: 0,
                totalVolume: 0,
                dailyVolume: 0,
                totalFees: 0,
                costBasis: 0,
                maxDrawdown: 0,
                winRate: 0
            };
        }
    }

    // ADDED: Calculate proper Sharpe ratio with actual volatility
    async calculateSharpeRatio(riskFreeRate = 2.0) {
        try {
            const query = `
                WITH buy_trades AS (
                    SELECT *, ROW_NUMBER() OVER (ORDER BY timestamp) as buy_order
                    FROM trades WHERE trade_type = 'BUY'
                ),
                sell_trades AS (
                    SELECT *, ROW_NUMBER() OVER (ORDER BY timestamp) as sell_order
                    FROM trades WHERE trade_type = 'SELL'
                ),
                returns AS (
                    SELECT 
                        CASE WHEN b.total_usd > 0 
                        THEN ((s.total_usd - b.total_usd - s.fee_usd - b.fee_usd) / b.total_usd * 100)
                        ELSE 0 END as return_pct
                    FROM sell_trades s
                    JOIN buy_trades b ON b.buy_order = s.sell_order
                    WHERE b.total_usd > 0
                )
                SELECT 
                    AVG(return_pct) as mean_return,
                    COUNT(*) as trade_count
                FROM returns
            `;
            
            const result = await this.runQuery(query);
            const { mean_return, trade_count } = result[0] || { mean_return: 0, trade_count: 0 };
            
            if (trade_count < 2) return 0;
            
            // Calculate standard deviation
            const varianceQuery = `
                WITH buy_trades AS (
                    SELECT *, ROW_NUMBER() OVER (ORDER BY timestamp) as buy_order
                    FROM trades WHERE trade_type = 'BUY'
                ),
                sell_trades AS (
                    SELECT *, ROW_NUMBER() OVER (ORDER BY timestamp) as sell_order
                    FROM trades WHERE trade_type = 'SELL'
                ),
                returns AS (
                    SELECT 
                        CASE WHEN b.total_usd > 0 
                        THEN ((s.total_usd - b.total_usd - s.fee_usd - b.fee_usd) / b.total_usd * 100)
                        ELSE 0 END as return_pct
                    FROM sell_trades s
                    JOIN buy_trades b ON b.buy_order = s.sell_order
                    WHERE b.total_usd > 0
                )
                SELECT 
                    AVG((return_pct - ${mean_return}) * (return_pct - ${mean_return})) as variance
                FROM returns
            `;
            
            const varianceResult = await this.runQuery(varianceQuery);
            const variance = varianceResult[0]?.variance || 0;
            const stdDev = Math.sqrt(variance);
            
            return stdDev > 0 ? (mean_return - riskFreeRate) / stdDev : 0;
            
        } catch (error) {
            console.error('Error calculating Sharpe ratio:', error);
            return 0;
        }
    }

    // ADDED: Calculate maximum drawdown
    async calculateMaxDrawdown() {
        try {
            const query = `
                SELECT 
                    MAX((peak_value - total_value_usd) / peak_value * 100) as max_drawdown
                FROM (
                    SELECT 
                        total_value_usd,
                        MAX(total_value_usd) OVER (ORDER BY timestamp ROWS UNBOUNDED PRECEDING) as peak_value
                    FROM portfolio
                    WHERE total_value_usd > 0
                ) subquery
                WHERE peak_value > 0
            `;
            
            const result = await this.runQuery(query);
            return result[0]?.max_drawdown || 0;
            
        } catch (error) {
            console.error('Error calculating maximum drawdown:', error);
            return 0;
        }
    }

    // ADDED: Get current Bitcoin price for unrealized P&L calculation
    async getCurrentBitcoinPrice() {
        try {
            // Try to get from recent market data first
            const marketData = await this.runQuery(
                'SELECT price_usd FROM market_data ORDER BY timestamp DESC LIMIT 1'
            );
            
            if (marketData[0]?.price_usd) {
                return marketData[0].price_usd;
            }
            
            // Fallback to external API if no recent data
            const axios = await import('axios');
            const response = await axios.default.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
            return response.data.bitcoin.usd;
            
        } catch (error) {
            console.error('Error getting current Bitcoin price:', error);
            return 60000; // Fallback price
        }
    }

    // Cleanup and maintenance
    async cleanup() {
        if (this.db) {
            this.db.close();
            console.log('🔒 Database connection closed');
        }
    }
}

export default DatabaseService;