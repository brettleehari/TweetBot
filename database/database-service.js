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

            // Ensure the single portfolio row exists
            const portfolio = await this.runQuery('SELECT * FROM portfolio WHERE id = 1');
            if (portfolio.length === 0) {
                await this.runQuery(
                    "INSERT INTO portfolio (id, btc_balance, usd_balance, last_updated) VALUES (1, 0, 10000, datetime('now'))"
                );
                console.log('💰 Initial portfolio created with $10,000 USD.');
            }

            // Initialize system status if not set
            const status = await this.getSystemConfig('system_status');
            if (status === null) {
                console.log("First run: Setting initial system_status to 'running'.");
                await this.setSystemConfig('system_status', 'running');
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

            // Use db.all for SELECT, db.run for others.
            if (query.trim().toUpperCase().startsWith('SELECT')) {
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

    // --- V3 Portfolio Operations ---

    /**
     * Gets the single, live portfolio row.
     */
    async getLivePortfolio() {
        const query = `SELECT * FROM portfolio WHERE id = 1`;
        const result = await this.runQuery(query);
        // Add total_value_usd for consistency with old structure, calculated on the fly
        if (result[0]) {
            const portfolio = result[0];
            const btcPrice = await this.getCurrentBitcoinPrice();
            portfolio.total_value_usd = portfolio.usd_balance + (portfolio.btc_balance * btcPrice);
            return portfolio;
        }
        return null;
    }
    
    /**
     * Updates the live portfolio state. This should be part of a transaction in a real scenario.
     */
    async updateLivePortfolio(btcBalance, usdBalance) {
        const query = `
            UPDATE portfolio 
            SET btc_balance = ?, usd_balance = ?, last_updated = datetime('now')
            WHERE id = 1
        `;
        return await this.runQuery(query, [btcBalance, usdBalance]);
    }

    /**
     * Records a snapshot of the current portfolio state into the history table.
     */
    async recordPortfolioSnapshot() {
        const livePortfolio = await this.getLivePortfolio();
        if (!livePortfolio) return;

        const btcPrice = await this.getCurrentBitcoinPrice();
        const totalValue = livePortfolio.usd_balance + (livePortfolio.btc_balance * btcPrice);

        const query = `
            INSERT INTO portfolio_history (btc_balance, usd_balance, btc_price_usd, total_value_usd)
            VALUES (?, ?, ?, ?)
        `;
        return await this.runQuery(query, [livePortfolio.btc_balance, livePortfolio.usd_balance, btcPrice, totalValue]);
    }
    
    /**
     * Retrieves the portfolio history for charts and analysis.
     */
    async getPortfolioHistory(limit = 100) {
        const query = `
            SELECT * FROM portfolio_history
            ORDER BY timestamp DESC
            LIMIT ?
        `;
        return await this.runQuery(query, [limit]);
    }


    // Trade Operations
    async recordTrade(type, amountBtc, priceUsd, feeUsd, totalUsd, reason, marketConditions) {
        const query = `
            INSERT INTO trades (trade_type, amount_btc, price_usd, fee_usd, total_usd, 
                              agent_decision_reason, market_conditions)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        // Transaction: Update portfolio and record trade together
        return new Promise((resolve, reject) => {
            this.db.serialize(async () => {
                try {
                    this.db.run('BEGIN TRANSACTION');
                    
                    const portfolio = await this.getLivePortfolio();
                    let { btc_balance, usd_balance } = portfolio;

                    if (type === 'BUY') {
                        btc_balance += amountBtc;
                        usd_balance -= totalUsd;
                    } else { // SELL
                        btc_balance -= amountBtc;
                        usd_balance += totalUsd;
                    }

                    await this.runQuery(query, [type, amountBtc, priceUsd, feeUsd, totalUsd, reason, marketConditions]);
                    await this.updateLivePortfolio(btc_balance, usd_balance);

                    this.db.run('COMMIT');
                    resolve({ success: true });
                } catch (error) {
                    this.db.run('ROLLBACK');
                    console.error("Trade recording failed, transaction rolled back.", error);
                    reject(error);
                }
            });
        });
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

    // --- Production-Grade Features: System Commands & Alerts ---

    /**
     * Creates a new command for the system to execute.
     * @param {string} command - e.g., 'PAUSE_TRADING', 'MANUAL_BUY'
     * @param {object} parameters - JSON object with command parameters
     * @param {string} executed_by - Identifier of the command issuer
     */
    async createSystemCommand(command, parameters = null, executed_by = 'user:dashboard') {
        const query = `
            INSERT INTO system_commands (command, parameters, executed_by)
            VALUES (?, ?, ?)
        `;
        const params = [command, parameters ? JSON.stringify(parameters) : null, executed_by];
        return await this.runQuery(query, params);
    }

    /**
     * Fetches all commands that have not been executed yet.
     */
    async getPendingSystemCommands() {
        const query = `
            SELECT * FROM system_commands
            WHERE status = 'PENDING'
            ORDER BY timestamp ASC
        `;
        const results = await this.runQuery(query);
        // Parse the JSON parameters string back into an object
        return results.map(cmd => ({
            ...cmd,
            parameters: cmd.parameters ? JSON.parse(cmd.parameters) : null
        }));
    }

    /**
     * Updates the status of a system command.
     * @param {number} id - The ID of the command to update.
     * @param {string} status - The new status ('EXECUTED', 'FAILED').
     */
    async updateSystemCommandStatus(id, status) {
        const query = `
            UPDATE system_commands
            SET status = ?, executed_at = datetime('now')
            WHERE id = ?
        `;
        return await this.runQuery(query, [status, id]);
    }

    /**
     * Creates a new system alert.
     * @param {string} severity - 'INFO', 'WARNING', 'CRITICAL'
     * @param {string} alert_type - e.g., 'LARGE_TRADE', 'SYSTEM_ERROR'
     * @param {string} message - The alert message.
     * @param {object} details - JSON object with contextual details.
     */
    async createSystemAlert(severity, alert_type, message, details = null) {
        const query = `
            INSERT INTO system_alerts (severity, alert_type, message, details)
            VALUES (?, ?, ?, ?)
        `;
        const params = [severity, alert_type, message, details ? JSON.stringify(details) : null];
        return await this.runQuery(query, params);
    }

    /**
     * Fetches all unacknowledged alerts, optionally filtered by severity.
     */
    async getUnacknowledgedAlerts(minSeverity = 'INFO') {
        const severityOrder = { 'INFO': 1, 'WARNING': 2, 'CRITICAL': 3 };
        const minSeverityLevel = severityOrder[minSeverity] || 1;

        const query = `
            SELECT * FROM system_alerts
            WHERE is_acknowledged = 0
            ORDER BY timestamp DESC
        `;
        const allAlerts = await this.runQuery(query);
        
        return allAlerts.filter(alert => (severityOrder[alert.severity] || 0) >= minSeverityLevel);
    }

    /**
     * Marks a specific alert as acknowledged.
     * @param {number} id - The ID of the alert to acknowledge.
     */
    async acknowledgeAlert(id) {
        const query = `
            UPDATE system_alerts
            SET is_acknowledged = 1
            WHERE id = ?
        `;
        return await this.runQuery(query, [id]);
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

    // Calculate detailed performance metrics - V3 FIXED VERSION
    async getDetailedPerformance() {
        try {
            const basicStats = await this.getPortfolioPerformance();
            const portfolio = await this.getLivePortfolio();
            
            const successRate = basicStats.profitableTrades?.count && basicStats.totalSellTrades?.count 
                ? (basicStats.profitableTrades.count / basicStats.totalSellTrades.count * 100)
                : 0;

            const avgReturn = basicStats.avgReturn?.avg_return || 0;
            const sharpeRatio = await this.calculateSharpeRatio();

            const initialInvestment = 10000; // Starting with $10k
            const currentValue = portfolio?.total_value_usd || initialInvestment;
            const totalReturn = ((currentValue - initialInvestment) / initialInvestment * 100);

            const costBasis = basicStats.costBasis?.cost_basis || 0;
            const currentBtcHoldings = portfolio?.btc_balance || 0;
            const currentPrice = await this.getCurrentBitcoinPrice();
            const unrealizedProfit = currentBtcHoldings * (currentPrice - costBasis);
            
            const realizedProfit = basicStats.realizedProfit?.profit || 0;
            const totalProfit = realizedProfit + unrealizedProfit;

            const maxDrawdown = await this.calculateMaxDrawdown();

            return {
                successRate: Math.round(successRate * 10) / 10,
                totalTrades: basicStats.totalTrades?.count || 0,
                avgReturn: Math.round(avgReturn * 100) / 100,
                sharpeRatio: Math.round(sharpeRatio * 100) / 100,
                totalReturn: Math.round(totalReturn * 100) / 100,
                realizedProfit: Math.round(realizedProfit * 100) / 100,
                unrealizedProfit: Math.round(unrealizedProfit * 100) / 100,
                totalProfit: Math.round(totalProfit * 100) / 100,
                totalVolume: basicStats.totalVolume?.volume || 0,
                dailyVolume: basicStats.dailyVolume?.volume || 0,
                totalFees: basicStats.totalFees?.fees || 0,
                costBasis: Math.round(costBasis * 100) / 100,
                maxDrawdown: Math.round(maxDrawdown * 10) / 10,
                winRate: basicStats.winRate?.win_rate || 0,
                history: await this.getPortfolioHistory(200) // Add history for charts
            };
        } catch (error) {
            console.error('Error calculating detailed performance:', error);
            return {
                successRate: 0, totalTrades: 0, avgReturn: 0, sharpeRatio: 0,
                totalReturn: 0, realizedProfit: 0, unrealizedProfit: 0,
                totalProfit: 0, totalVolume: 0, dailyVolume: 0, totalFees: 0,
                costBasis: 0, maxDrawdown: 0, winRate: 0, history: []
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

    // V3 FIXED: Calculate maximum drawdown from portfolio_history
    async calculateMaxDrawdown() {
        try {
            const query = `
                SELECT 
                    MAX((peak_value - total_value_usd) / peak_value * 100) as max_drawdown
                FROM (
                    SELECT 
                        total_value_usd,
                        MAX(total_value_usd) OVER (ORDER BY timestamp ROWS UNBOUNDED PRECEDING) as peak_value
                    FROM portfolio_history
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
            if (!response.data.bitcoin.usd) {
                throw new Error('Invalid price data from CoinGecko API');
            }
            return response.data.bitcoin.usd;
            
        } catch (error) {
            const errorMessage = `CRITICAL: Could not fetch real-time Bitcoin price. ${error.message}`;
            console.error(`❌ ${errorMessage}`);
            throw new Error(errorMessage); // Fail fast
        }
    }

    // --- System Config & Control ---

    async getSystemConfig(key, defaultValue = null) {
        const query = `SELECT value FROM system_config WHERE key = ?`;
        const result = await this.runQuery(query, [key]);
        return result[0] ? result[0].value : defaultValue;
    }

    async setSystemConfig(key, value) {
        const query = `INSERT INTO system_config (key, value) VALUES (?, ?)
                       ON CONFLICT(key) DO UPDATE SET value = ?, last_updated = CURRENT_TIMESTAMP`;
        return await this.runQuery(query, [key, value, value]);
    }

    async createSystemCommand(command, parameters = null) {
        const query = `INSERT INTO system_commands (command, parameters) VALUES (?, ?)`;
        return await this.runQuery(query, [command, JSON.stringify(parameters)]);
    }

    async getPendingCommands() {
        const query = `SELECT * FROM system_commands WHERE status = 'pending' ORDER BY created_at ASC`;
        return await this.runQuery(query);
    }

    async updateCommandStatus(id, status) {
        const query = `UPDATE system_commands SET status = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?`;
        return await this.runQuery(query, [status, id]);
    }

    async createSystemAlert(alert_type, message, level = 'info') {
        const query = `INSERT INTO system_alerts (alert_type, message, level) VALUES (?, ?, ?)`;
        return await this.runQuery(query, [alert_type, message, level]);
    }

    async getRecentAlerts(limit = 20) {
        const query = `SELECT * FROM system_alerts ORDER BY timestamp DESC LIMIT ?`;
        return await this.runQuery(query, [limit]);
    }

    // =================================================================================
    // MARKET HUNTER DATA SOURCES - Storage Methods
    // =================================================================================

    // 1. Whale Movements
    async saveWhaleMovements(movements) {
        const query = `
            INSERT INTO whale_movements (asset, amount, from_address, to_address, confidence, 
                                        historical_pattern, market_impact, tx_hash, tx_timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const results = [];
        for (const m of movements) {
            try {
                const result = await this.runQuery(query, [
                    m.asset, m.amount, m.from, m.to, m.confidence,
                    m.historicalPattern, m.marketImpact, m.txHash || null, 
                    m.timestamp || new Date().toISOString()
                ]);
                results.push(result);
            } catch (error) {
                console.error('Error saving whale movement:', error.message);
            }
        }
        return results;
    }

    async getRecentWhaleMovements(limit = 50) {
        const query = `SELECT * FROM whale_movements ORDER BY timestamp DESC LIMIT ?`;
        return await this.runQuery(query, [limit]);
    }

    // 2. Narrative Shifts
    async saveNarrativeShifts(shifts) {
        const query = `
            INSERT INTO narrative_shifts (theme, strength, velocity, sources, key_influencers, 
                                         sentiment, novelty)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const results = [];
        for (const s of shifts) {
            try {
                const result = await this.runQuery(query, [
                    s.theme, s.strength, s.velocity, 
                    JSON.stringify(s.sources), JSON.stringify(s.keyInfluencers),
                    s.sentiment, s.novelty
                ]);
                results.push(result);
            } catch (error) {
                console.error('Error saving narrative shift:', error.message);
            }
        }
        return results;
    }

    async getRecentNarrativeShifts(limit = 50) {
        const query = `SELECT * FROM narrative_shifts ORDER BY timestamp DESC LIMIT ?`;
        return await this.runQuery(query, [limit]);
    }

    // 3. Arbitrage Opportunities
    async saveArbitrageOpportunities(opportunities) {
        const query = `
            INSERT INTO arbitrage_opportunities (buy_exchange, sell_exchange, asset, spread_percent, 
                                                volume, execution_speed, profit_potential)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const results = [];
        for (const o of opportunities) {
            try {
                const result = await this.runQuery(query, [
                    o.buyExchange, o.sellExchange, o.asset, o.spreadPercent,
                    o.volume, o.executionSpeed, o.profitPotential
                ]);
                results.push(result);
            } catch (error) {
                console.error('Error saving arbitrage opportunity:', error.message);
            }
        }
        return results;
    }

    async getRecentArbitrageOpportunities(limit = 50) {
        const query = `SELECT * FROM arbitrage_opportunities ORDER BY timestamp DESC LIMIT ?`;
        return await this.runQuery(query, [limit]);
    }

    // 4. Influencer Signals
    async saveInfluencerSignals(signals) {
        const query = `
            INSERT INTO influencer_signals (influencer, asset, sentiment, historical_accuracy, 
                                           followup_potential, reach, engagement)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const results = [];
        for (const s of signals) {
            try {
                const result = await this.runQuery(query, [
                    s.influencer, s.asset, s.sentiment, s.historicalAccuracy,
                    s.followupPotential, s.reach, s.engagement
                ]);
                results.push(result);
            } catch (error) {
                console.error('Error saving influencer signal:', error.message);
            }
        }
        return results;
    }

    async getRecentInfluencerSignals(limit = 50) {
        const query = `SELECT * FROM influencer_signals ORDER BY timestamp DESC LIMIT ?`;
        return await this.runQuery(query, [limit]);
    }

    // 5. Technical Breakouts
    async saveTechnicalBreakouts(breakouts) {
        const query = `
            INSERT INTO technical_breakouts (asset, pattern, strength, volume, historical_success, 
                                            key_levels, timeframe, confirmation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const results = [];
        for (const b of breakouts) {
            try {
                const result = await this.runQuery(query, [
                    b.asset, b.pattern, b.strength, b.volume, b.historicalSuccess,
                    JSON.stringify(b.keyLevels), b.timeframe, b.confirmation ? 1 : 0
                ]);
                results.push(result);
            } catch (error) {
                console.error('Error saving technical breakout:', error.message);
            }
        }
        return results;
    }

    async getRecentTechnicalBreakouts(limit = 50) {
        const query = `SELECT * FROM technical_breakouts ORDER BY timestamp DESC LIMIT ?`;
        return await this.runQuery(query, [limit]);
    }

    // 6. Institutional Flows
    async saveInstitutionalFlows(flows) {
        const query = `
            INSERT INTO institutional_flows (institution, direction, asset, amount, certainty, market_impact)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const results = [];
        for (const f of flows) {
            try {
                const result = await this.runQuery(query, [
                    f.institution, f.direction, f.asset, f.amount, f.certainty, f.marketImpact
                ]);
                results.push(result);
            } catch (error) {
                console.error('Error saving institutional flow:', error.message);
            }
        }
        return results;
    }

    async getRecentInstitutionalFlows(limit = 50) {
        const query = `SELECT * FROM institutional_flows ORDER BY timestamp DESC LIMIT ?`;
        return await this.runQuery(query, [limit]);
    }

    // 7. Derivatives Signals
    async saveDerivativesSignals(signals) {
        const query = `
            INSERT INTO derivatives_signals (asset, metric, value, sentiment, significance, liquidation_risk)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const results = [];
        for (const s of signals) {
            try {
                const result = await this.runQuery(query, [
                    s.asset, s.metric, s.value, s.sentiment, s.significance, s.liquidationRisk
                ]);
                results.push(result);
            } catch (error) {
                console.error('Error saving derivatives signal:', error.message);
            }
        }
        return results;
    }

    async getRecentDerivativesSignals(limit = 50) {
        const query = `SELECT * FROM derivatives_signals ORDER BY timestamp DESC LIMIT ?`;
        return await this.runQuery(query, [limit]);
    }

    // 8. Macro Signals
    async saveMacroSignals(signals) {
        const query = `
            INSERT INTO macro_signals (indicator, value, impact, confidence)
            VALUES (?, ?, ?, ?)
        `;
        const results = [];
        for (const s of signals) {
            try {
                const result = await this.runQuery(query, [
                    s.indicator, s.value, s.impact, s.confidence
                ]);
                results.push(result);
            } catch (error) {
                console.error('Error saving macro signal:', error.message);
            }
        }
        return results;
    }

    async getRecentMacroSignals(limit = 50) {
        const query = `SELECT * FROM macro_signals ORDER BY timestamp DESC LIMIT ?`;
        return await this.runQuery(query, [limit]);
    }

    // Bulk save all Market Hunter data sources
    async saveAllMarketHunterData(data) {
        const results = {
            whaleMovements: 0,
            narrativeShifts: 0,
            arbitrageOpportunities: 0,
            influencerSignals: 0,
            technicalBreakouts: 0,
            institutionalFlows: 0,
            derivativesSignals: 0,
            macroSignals: 0
        };

        if (data.whaleMovements?.length > 0) {
            await this.saveWhaleMovements(data.whaleMovements);
            results.whaleMovements = data.whaleMovements.length;
        }
        if (data.narrativeShifts?.length > 0) {
            await this.saveNarrativeShifts(data.narrativeShifts);
            results.narrativeShifts = data.narrativeShifts.length;
        }
        if (data.arbitrageOpportunities?.length > 0) {
            await this.saveArbitrageOpportunities(data.arbitrageOpportunities);
            results.arbitrageOpportunities = data.arbitrageOpportunities.length;
        }
        if (data.influencerSignals?.length > 0) {
            await this.saveInfluencerSignals(data.influencerSignals);
            results.influencerSignals = data.influencerSignals.length;
        }
        if (data.technicalBreakouts?.length > 0) {
            await this.saveTechnicalBreakouts(data.technicalBreakouts);
            results.technicalBreakouts = data.technicalBreakouts.length;
        }
        if (data.institutionalFlows?.length > 0) {
            await this.saveInstitutionalFlows(data.institutionalFlows);
            results.institutionalFlows = data.institutionalFlows.length;
        }
        if (data.derivativesSignals?.length > 0) {
            await this.saveDerivativesSignals(data.derivativesSignals);
            results.derivativesSignals = data.derivativesSignals.length;
        }
        if (data.macroSignals?.length > 0) {
            await this.saveMacroSignals(data.macroSignals);
            results.macroSignals = data.macroSignals.length;
        }

        return results;
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