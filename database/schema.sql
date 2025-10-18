-- Finalized Bitcoin Trading Database Schema
-- Design Version: 3.0
-- Purpose: Store real trading data, agent execution logs, and maintain a transactionally-safe portfolio.

-- The live state of the portfolio. Only ever contains one row.
CREATE TABLE IF NOT EXISTS portfolio (
    id INTEGER PRIMARY KEY, -- Always 1
    btc_balance REAL NOT NULL,
    usd_balance REAL NOT NULL,
    last_updated DATETIME NOT NULL
);

-- Periodic snapshots of portfolio value for analytics.
CREATE TABLE IF NOT EXISTS portfolio_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    btc_balance REAL NOT NULL,
    usd_balance REAL NOT NULL,
    btc_price_usd REAL NOT NULL, -- Price at the time of snapshot
    total_value_usd REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    trade_type VARCHAR(4) NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
    amount_btc DECIMAL(10,8) NOT NULL,
    price_usd DECIMAL(10,2) NOT NULL,
    fee_usd DECIMAL(8,2) DEFAULT 0,
    total_usd DECIMAL(12,2) NOT NULL,
    agent_decision_reason TEXT,
    market_conditions TEXT,
    executed_by VARCHAR(50) DEFAULT 'bitcoin-orchestrator'
);

CREATE TABLE IF NOT EXISTS market_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    price_usd DECIMAL(10,2) NOT NULL,
    volume_24h DECIMAL(15,2),
    market_cap DECIMAL(15,2),
    price_change_24h DECIMAL(5,2),
    fear_greed_index INTEGER,
    rsi_value DECIMAL(5,2),
    moving_avg_50 DECIMAL(10,2),
    moving_avg_200 DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS agent_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    agent_name VARCHAR(100) NOT NULL,
    execution_type VARCHAR(50) NOT NULL,
    input_data TEXT,
    output_data TEXT,
    success BOOLEAN DEFAULT 1,
    execution_time_ms INTEGER,
    error_message TEXT
);

-- 🧠 EXPLAINABLE AGENTS DECISION LOGGING TABLE
-- Stores detailed agent decision data for analytics and UI
CREATE TABLE IF NOT EXISTS agent_decisions (
    id VARCHAR(50) PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    agent VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    
    -- Decision Context (JSON)
    context TEXT NOT NULL, -- trigger, inputs, systemState, marketConditions
    
    -- Decision Process (JSON)
    reasoning TEXT NOT NULL, -- analysis, alternatives, selectedOption, confidence, riskAssessment
    
    -- Decision Outcome (JSON)
    outcome TEXT NOT NULL, -- action, parameters, expectedResult, actualResult, success
    
    -- Agent State (JSON)
    agent_state TEXT NOT NULL, -- autonomyLevel, learningRate, performanceScore, goals
    
    -- System Integration (JSON)
    system TEXT NOT NULL, -- cycleId, coordinatorDecision, interAgentCommunication, emergentBehaviors
    
    -- Feedback & Learning (JSON)
    feedback TEXT NOT NULL -- humanFeedback, systemFeedback, learningAdjustments, futureConsiderations
);

-- Create indexes for decision analytics
CREATE INDEX IF NOT EXISTS idx_agent_decisions_timestamp ON agent_decisions(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_agent ON agent_decisions(agent);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_type ON agent_decisions(type);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_agent_timestamp ON agent_decisions(agent, timestamp);

CREATE TABLE IF NOT EXISTS news_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    headline TEXT NOT NULL,
    source VARCHAR(100),
    sentiment_score DECIMAL(3,2), -- -1 to 1
    relevance_score DECIMAL(3,2), -- 0 to 1
    impact_prediction TEXT
);

-- =================================================================================
-- MARKET HUNTER DATA SOURCES TABLES
-- =================================================================================

-- 1. Whale Movements (On-chain large transactions)
CREATE TABLE IF NOT EXISTS whale_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    asset VARCHAR(10) NOT NULL,
    amount DECIMAL(16,8) NOT NULL,
    from_address TEXT,
    to_address TEXT,
    confidence DECIMAL(3,2),
    historical_pattern VARCHAR(50),
    market_impact DECIMAL(3,2),
    tx_hash TEXT,
    tx_timestamp DATETIME
);

-- 2. Narrative Shifts (Social/trending themes)
CREATE TABLE IF NOT EXISTS narrative_shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    theme TEXT NOT NULL,
    strength DECIMAL(3,2),
    velocity DECIMAL(3,2),
    sources TEXT, -- JSON array
    key_influencers TEXT, -- JSON array
    sentiment VARCHAR(20),
    novelty DECIMAL(3,2)
);

-- 3. Arbitrage Opportunities (Cross-exchange price differences)
CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    buy_exchange VARCHAR(50),
    sell_exchange VARCHAR(50),
    asset VARCHAR(10),
    spread_percent DECIMAL(5,2),
    volume DECIMAL(15,2),
    execution_speed VARCHAR(20),
    profit_potential DECIMAL(5,2)
);

-- 4. Influencer Signals (Price action / market movers)
CREATE TABLE IF NOT EXISTS influencer_signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    influencer VARCHAR(100),
    asset VARCHAR(10),
    sentiment VARCHAR(20),
    historical_accuracy DECIMAL(3,2),
    followup_potential DECIMAL(5,4),
    reach BIGINT,
    engagement DECIMAL(3,2)
);

-- 5. Technical Breakouts (Chart patterns and key levels)
CREATE TABLE IF NOT EXISTS technical_breakouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    asset VARCHAR(10),
    pattern VARCHAR(50),
    strength DECIMAL(3,2),
    volume DECIMAL(15,2),
    historical_success DECIMAL(3,2),
    key_levels TEXT, -- JSON array
    timeframe VARCHAR(10),
    confirmation BOOLEAN
);

-- 6. Institutional Flows (Large holder movements)
CREATE TABLE IF NOT EXISTS institutional_flows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    institution VARCHAR(100),
    direction VARCHAR(20),
    asset VARCHAR(10),
    amount DECIMAL(16,2),
    certainty DECIMAL(3,2),
    market_impact DECIMAL(3,2)
);

-- 7. Derivatives Signals (Funding rates, open interest)
CREATE TABLE IF NOT EXISTS derivatives_signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    asset VARCHAR(10),
    metric VARCHAR(50),
    value DECIMAL(10,6),
    sentiment VARCHAR(20),
    significance DECIMAL(3,2),
    liquidation_risk DECIMAL(3,2)
);

-- 8. Macro Signals (Fear & Greed, market-wide indicators)
CREATE TABLE IF NOT EXISTS macro_signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    indicator VARCHAR(100),
    value TEXT,
    impact VARCHAR(20),
    confidence DECIMAL(3,2)
);

-- =================================================================================
-- PRODUCTION-GRADE FEATURES
-- =================================================================================

-- System Configuration & Control Tables
CREATE TABLE IF NOT EXISTS system_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_commands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    command TEXT NOT NULL,
    parameters TEXT,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_type TEXT NOT NULL, -- e.g., 'SYSTEM_PAUSE', 'API_FAILURE', 'HIGH_RISK'
    message TEXT NOT NULL,
    level TEXT DEFAULT 'info', -- info, warning, critical
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast querying of commands and alerts
CREATE INDEX IF NOT EXISTS idx_system_commands_status ON system_commands(status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_level ON system_alerts(level);

-- Initialize the single row for the portfolio's live state
INSERT OR REPLACE INTO portfolio (id, btc_balance, usd_balance, last_updated) 
VALUES (1, 0.0, 10000.0, CURRENT_TIMESTAMP);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp);
CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON market_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_executions_timestamp ON agent_executions(timestamp);
CREATE INDEX IF NOT EXISTS idx_news_analysis_timestamp ON news_analysis(timestamp);
CREATE INDEX IF NOT EXISTS idx_portfolio_history_timestamp ON portfolio_history(timestamp);

-- Market Hunter data source indexes
CREATE INDEX IF NOT EXISTS idx_whale_movements_timestamp ON whale_movements(timestamp);
CREATE INDEX IF NOT EXISTS idx_whale_movements_asset ON whale_movements(asset);
CREATE INDEX IF NOT EXISTS idx_narrative_shifts_timestamp ON narrative_shifts(timestamp);
CREATE INDEX IF NOT EXISTS idx_arbitrage_opportunities_timestamp ON arbitrage_opportunities(timestamp);
CREATE INDEX IF NOT EXISTS idx_influencer_signals_timestamp ON influencer_signals(timestamp);
CREATE INDEX IF NOT EXISTS idx_technical_breakouts_timestamp ON technical_breakouts(timestamp);
CREATE INDEX IF NOT EXISTS idx_institutional_flows_timestamp ON institutional_flows(timestamp);
CREATE INDEX IF NOT EXISTS idx_derivatives_signals_timestamp ON derivatives_signals(timestamp);
CREATE INDEX IF NOT EXISTS idx_macro_signals_timestamp ON macro_signals(timestamp);