/**
 * IMPROVED TRADE PAIRING AND PERFORMANCE CALCULATIONS
 * Fixes the mathematical issues in the current implementation
 */

class ImprovedPerformanceCalculator {
    
    /**
     * Calculate properly paired trade returns using FIFO
     */
    async calculateTradePairs(db) {
        const query = `
            WITH buy_trades AS (
                SELECT *, 
                       SUM(amount_btc) OVER (ORDER BY timestamp) as cumulative_btc
                FROM trades 
                WHERE trade_type = 'BUY'
                ORDER BY timestamp
            ),
            sell_trades AS (
                SELECT *, 
                       SUM(amount_btc) OVER (ORDER BY timestamp) as cumulative_sold
                FROM trades 
                WHERE trade_type = 'SELL'
                ORDER BY timestamp
            ),
            paired_trades AS (
                SELECT 
                    s.id as sell_id,
                    s.amount_btc as sell_quantity,
                    s.price_usd as sell_price,
                    s.fee_usd as sell_fee,
                    b.price_usd as buy_price,
                    b.fee_usd as buy_fee,
                    s.amount_btc * (s.price_usd - b.price_usd) - s.fee_usd - (s.amount_btc / b.amount_btc * b.fee_usd) as net_profit
                FROM sell_trades s
                JOIN buy_trades b ON b.cumulative_btc >= s.cumulative_sold - s.amount_btc
                    AND b.cumulative_btc <= s.cumulative_sold
            )
            SELECT * FROM paired_trades
        `;
        
        return await db.runQuery(query);
    }

    /**
     * Calculate correct win rate based on paired trades
     */
    async calculateWinRate(db) {
        const pairs = await this.calculateTradePairs(db);
        const profitableTrades = pairs.filter(trade => trade.net_profit > 0);
        return pairs.length > 0 ? (profitableTrades.length / pairs.length) * 100 : 0;
    }

    /**
     * Calculate proper Sharpe ratio using actual volatility
     */
    calculateSharpeRatio(returns, riskFreeRate = 2.0) {
        if (returns.length < 2) return 0;
        
        const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1);
        const stdDev = Math.sqrt(variance);
        
        return stdDev > 0 ? (meanReturn - riskFreeRate) / stdDev : 0;
    }

    /**
     * Calculate cost basis using weighted average
     */
    async calculateCostBasis(db) {
        const query = `
            SELECT 
                SUM(amount_btc * price_usd + fee_usd) as total_cost,
                SUM(amount_btc) as total_btc
            FROM trades 
            WHERE trade_type = 'BUY'
        `;
        
        const result = await db.runQuery(query);
        const { total_cost, total_btc } = result[0];
        
        return total_btc > 0 ? total_cost / total_btc : 0;
    }

    /**
     * Calculate time-proportional progress tracking
     */
    calculateTimeProportionalProgress(currentReturn, weeklyTarget, weekStartDate) {
        const now = new Date();
        const weekStart = new Date(weekStartDate);
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const timeElapsed = now - weekStart;
        const totalWeekTime = weekEnd - weekStart;
        const timeProgress = Math.min(timeElapsed / totalWeekTime, 1);
        
        const expectedReturn = weeklyTarget * timeProgress;
        const onTrack = currentReturn >= expectedReturn;
        
        return {
            expectedReturn,
            actualReturn: currentReturn,
            timeProgress: timeProgress * 100,
            onTrack,
            progressRatio: expectedReturn > 0 ? currentReturn / expectedReturn : 0
        };
    }

    /**
     * Calculate maximum drawdown
     */
    async calculateMaxDrawdown(db) {
        const query = `
            WITH portfolio_values AS (
                SELECT 
                    timestamp,
                    total_value_usd,
                    MAX(total_value_usd) OVER (ORDER BY timestamp) as peak_value
                FROM portfolio
                ORDER BY timestamp
            )
            SELECT 
                MAX((peak_value - total_value_usd) / peak_value * 100) as max_drawdown
            FROM portfolio_values
            WHERE peak_value > 0
        `;
        
        const result = await db.runQuery(query);
        return result[0]?.max_drawdown || 0;
    }

    /**
     * Calculate comprehensive performance metrics
     */
    async getFixedPerformanceMetrics(db) {
        const [
            pairs,
            costBasis,
            maxDrawdown,
            portfolio
        ] = await Promise.all([
            this.calculateTradePairs(db),
            this.calculateCostBasis(db),
            this.calculateMaxDrawdown(db),
            db.getCurrentPortfolio()
        ]);

        const winRate = await this.calculateWinRate(db);
        const returns = pairs.map(p => (p.net_profit / (p.sell_quantity * p.buy_price)) * 100);
        const sharpeRatio = this.calculateSharpeRatio(returns);
        
        const totalRealizedProfit = pairs.reduce((sum, p) => sum + p.net_profit, 0);
        const currentBtcValue = (portfolio?.btc_holdings || 0) * (await this.getCurrentPrice());
        const unrealizedProfit = (portfolio?.btc_holdings || 0) * (await this.getCurrentPrice() - costBasis);
        
        return {
            winRate: Math.round(winRate * 10) / 10,
            avgReturn: returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0,
            sharpeRatio: Math.round(sharpeRatio * 100) / 100,
            totalRealizedProfit: totalRealizedProfit,
            unrealizedProfit: unrealizedProfit,
            totalProfit: totalRealizedProfit + unrealizedProfit,
            costBasis: costBasis,
            maxDrawdown: Math.round(maxDrawdown * 10) / 10,
            totalTrades: pairs.length
        };
    }
}

export default ImprovedPerformanceCalculator;