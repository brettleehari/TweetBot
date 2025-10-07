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
    impact_prediction VARCHAR(20), -- 'bullish', 'bearish', 'neutral'
    analyzed_by VARCHAR(50) DEFAULT 'market-analyzer'
);

-- Initialize the single row for the portfolio's live state
INSERT OR REPLACE INTO portfolio (id, btc_balance, usd_balance, last_updated) 
VALUES (1, 0.0, 10000.0, CURRENT_TIMESTAMP);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp);
CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON market_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_executions_timestamp ON agent_executions(timestamp);
CREATE INDEX IF NOT EXISTS idx_news_analysis_timestamp ON news_analysis(timestamp);
CREATE INDEX IF NOT EXISTS idx_portfolio_history_timestamp ON portfolio_history(timestamp);