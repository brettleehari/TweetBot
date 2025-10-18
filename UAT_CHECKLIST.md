# Final User Acceptance Testing (UAT) Checklist

## Pre-UAT Setup Status ✅

### Database Preparation
- ✅ **Database Backed Up**: `trading.db.backup-[timestamp]` created
- ✅ **Database Reset**: Fresh `trading.db` initialized
- ✅ **Schema Verified**: 19 tables created successfully
  - Core: `portfolio`, `portfolio_history`, `trades`, `market_data`
  - Agent: `agent_executions`, `agent_decisions`
  - Advanced: `arbitrage_opportunities`, `derivatives_signals`, `institutional_flows`, etc.

### System Components
- ✅ **Test Suite**: 6/6 suites passed (17 tests) - 100% success rate
- ✅ **API Integrations**: CoinGecko ✅, NewsAPI ✅
- ✅ **AI Models**: GPT-4o configured, embeddings ready
- ✅ **Architecture**: 14+ agents documented and validated

---

## UAT Test Plan

### Phase 1: System Initialization (5 minutes)

#### 1.1 Application Startup
- [ ] Application starts without errors
- [ ] All agents initialize successfully
- [ ] Database connections established
- [ ] API keys validated
- [ ] Portfolio initializes (default: 0.01 BTC, $1000 USD)

**Success Criteria**: No errors in startup logs, "AGENTIC SYSTEM READY" message appears

#### 1.2 Agent Registration
- [ ] Strategic Orchestrator (95% autonomy) - registered
- [ ] Autonomous Market Hunter (85% autonomy) - registered
- [ ] Performance Optimizer (80% autonomy) - registered
- [ ] Content Creator (75% autonomy) - registered
- [ ] Market Analyzer (80% autonomy) - registered
- [ ] Bitcoin Orchestrator (90% autonomy) - registered
- [ ] Execution Agent (70% autonomy) - registered

**Success Criteria**: All 7+ agents appear in agent registry logs

---

### Phase 2: Data Collection (10 minutes)

#### 2.1 Market Data Fetching
- [ ] Bitcoin price fetched successfully
- [ ] Price appears reasonable (within ±10% of known market price)
- [ ] Market data stored in `market_data` table
- [ ] Timestamp is current

**Verification Query**:
```sql
SELECT * FROM market_data ORDER BY timestamp DESC LIMIT 5;
```

**Expected**: Recent BTC price (~$110,000 range as of last test)

#### 2.2 News & Sentiment Analysis
- [ ] News articles fetched from NewsAPI
- [ ] Sentiment scores calculated
- [ ] News stored in `news_analysis` table
- [ ] Sentiment appears in agent decisions

**Verification Query**:
```sql
SELECT * FROM news_analysis ORDER BY timestamp DESC LIMIT 3;
```

#### 2.3 Technical Indicators
- [ ] RSI calculated
- [ ] Moving averages (50-day, 200-day) computed
- [ ] Fear & Greed Index fetched
- [ ] Indicators stored in `market_data` table

---

### Phase 3: Agent Execution (15-20 minutes)

#### 3.1 First Strategic Cycle
⏱️ **Wait for**: 10-minute strategic cycle to complete

- [ ] Strategic Orchestrator executes cycle
- [ ] Agent executions logged to `agent_executions` table
- [ ] Agent decisions logged to `agent_decisions` table
- [ ] No execution errors

**Verification Query**:
```sql
SELECT agent_name, action, status, timestamp 
FROM agent_executions 
ORDER BY timestamp DESC 
LIMIT 10;
```

**Expected**: 5-7+ agent executions with status 'SUCCESS'

#### 3.2 Market Analysis
- [ ] Market Analyzer produces market assessment
- [ ] Trend direction identified (bullish/bearish/neutral)
- [ ] Key price levels identified
- [ ] Analysis logged and explainable

**Check Logs**: `logs/agent-decisions.jsonl` for Market Analyzer entries

#### 3.3 Trading Decision Logic
- [ ] Bitcoin Orchestrator evaluates trading opportunity
- [ ] BTC Expert Methodology applied (7 signals checked)
- [ ] Decision reasoning is clear and documented
- [ ] Risk assessment performed

**Expected Signals Checked**:
1. Technical Confluence (RSI, MA crossovers)
2. Trend Strength (momentum indicators)
3. Volume Confirmation
4. Macro Context
5. Risk Management (stop-loss, position sizing)
6. Time Frame Alignment
7. Market Regime Recognition

---

### Phase 4: Trading Operations (if triggered)

#### 4.1 Trade Execution (if signal strength ≥ 0.7)
- [ ] Trade decision made (BUY/SELL/HOLD)
- [ ] Position size calculated based on Kelly Criterion
- [ ] Trade recorded in `trades` table
- [ ] Portfolio updated in `portfolio` table
- [ ] Portfolio history snapshot created

**Verification Query**:
```sql
SELECT * FROM trades ORDER BY timestamp DESC LIMIT 3;
SELECT * FROM portfolio;
SELECT * FROM portfolio_history ORDER BY timestamp DESC LIMIT 3;
```

#### 4.2 Execution Agent Validation
- [ ] Intelligent Execution Agent optimizes order
- [ ] Trade split strategy applied (if large order)
- [ ] Slippage calculation performed
- [ ] Execution logged with performance metrics

---

### Phase 5: Performance Monitoring (Ongoing)

#### 5.1 Performance Optimizer
- [ ] Portfolio performance calculated
- [ ] Risk metrics computed (Sharpe ratio, max drawdown)
- [ ] Optimization recommendations generated
- [ ] Performance logged every 10 minutes

**Verification Query**:
```sql
SELECT 
    timestamp,
    total_value_usd,
    btc_balance,
    usd_balance
FROM portfolio_history 
ORDER BY timestamp DESC 
LIMIT 10;
```

#### 5.2 System Health
- [ ] No memory leaks (check process memory)
- [ ] Database size reasonable (<100MB)
- [ ] Log files rotating properly
- [ ] No API rate limit errors

**Check Commands**:
```bash
# Process memory
ps aux | grep node

# Database size
ls -lh database/trading.db

# Recent logs
tail -f logs/agent-decisions.jsonl
```

---

### Phase 6: Autonomous Behavior (30+ minutes)

#### 6.1 Autonomous Market Hunter
- [ ] Scans for opportunities every 2 minutes
- [ ] Detects arbitrage opportunities (if any)
- [ ] Identifies whale movements (large trades)
- [ ] Tracks institutional flows
- [ ] Monitors derivatives signals
- [ ] Detects narrative shifts

**Verification Queries**:
```sql
SELECT COUNT(*) FROM arbitrage_opportunities;
SELECT COUNT(*) FROM whale_movements;
SELECT COUNT(*) FROM institutional_flows;
```

#### 6.2 Goal-Driven Adaptation
- [ ] System adjusts to market conditions
- [ ] Agent autonomy levels adapt based on performance
- [ ] Inter-agent communication occurs
- [ ] Emergent behaviors detected (if any)

**Check Logs**: Look for "GOAL EVOLUTION" or "AUTONOMY ADJUSTED" messages

---

### Phase 7: Explainability & Transparency

#### 7.1 Decision Traceability
- [ ] Every decision has clear reasoning
- [ ] Agent thought process is logged
- [ ] Confidence scores provided
- [ ] Alternative actions considered are documented

**Test**: Open `logs/agent-decisions.jsonl` and verify:
- Each decision has `reasoning` field
- `confidence_score` is present
- `data_sources` are listed

#### 7.2 Dashboard Access (if available)
- [ ] Open `docs/explainable-agents-dashboard.html`
- [ ] Recent decisions visible
- [ ] Agent performance metrics displayed
- [ ] Portfolio evolution chart renders

---

## Critical Success Criteria

### MUST PASS ✅
1. **No Fatal Errors**: Application runs for 30+ minutes without crashes
2. **Data Flowing**: Market data updates every 10 minutes minimum
3. **Agents Executing**: At least 5 agent executions in first 30 minutes
4. **Database Integrity**: All inserts successful, no corruption
5. **API Connections**: CoinGecko and NewsAPI responding

### SHOULD PASS ✅
6. **Explainable Decisions**: Every decision has clear reasoning
7. **Performance Tracking**: Portfolio snapshots created every 10 minutes
8. **Autonomous Behavior**: Market Hunter finds at least 1 opportunity in 30 min
9. **Risk Management**: No trades exceed 5% of portfolio value
10. **Learning Active**: Agent autonomy adjusts based on outcomes

### NICE TO HAVE 🎯
11. **Trade Execution**: At least 1 trade executed (if signal strong enough)
12. **Content Creation**: Social media content generated (if configured)
13. **Arbitrage Detection**: Arbitrage opportunity identified
14. **Emergent Behavior**: Unexpected but beneficial agent coordination

---

## Acceptance Criteria Summary

| Category | Status | Notes |
|----------|--------|-------|
| **System Startup** | ⬜ | All agents initialize |
| **Data Collection** | ⬜ | Market data flows continuously |
| **Agent Execution** | ⬜ | Strategic cycles complete successfully |
| **Trading Logic** | ⬜ | Decisions are sound and explainable |
| **Performance** | ⬜ | No errors for 30+ minutes |
| **Autonomy** | ⬜ | Agents operate independently |
| **Explainability** | ⬜ | All decisions traceable |
| **Database** | ✅ | Fresh, initialized, ready |
| **Overall** | ⬜ | **READY FOR PRODUCTION** |

---

## Rollback Plan (If Issues Found)

### Minor Issues (Continue Testing)
- API timeouts → Retry logic should handle
- Missing data points → Log warning, continue
- Low signal strength → Expected, no trades until signal strong

### Major Issues (Stop & Fix)
- Database corruption → Restore from backup
- Repeated crashes → Check logs, fix bug
- API authentication failures → Verify API keys
- Agent initialization failures → Check configuration

### Restore Command (If Needed)
```bash
cp database/trading.db.backup-[timestamp] database/trading.db
```

---

## Production Readiness Checklist

Before shipping to production:

### Configuration
- [ ] API keys secured (environment variables, not hardcoded)
- [ ] Twitter/X API configured (if content posting enabled)
- [ ] Rate limits appropriate for production load
- [ ] Database backup schedule configured

### Monitoring
- [ ] Log rotation configured
- [ ] Error alerting set up
- [ ] Performance monitoring enabled
- [ ] Database backup automated

### Documentation
- [ ] Deployment guide complete
- [ ] Operations manual ready
- [ ] Troubleshooting guide available
- [ ] API documentation current

### Security
- [ ] No sensitive data in logs
- [ ] Database access controlled
- [ ] API keys in environment variables
- [ ] Code reviewed for vulnerabilities

---

## Starting UAT

### Application Entry Point: `true-agentic-orchestrator.js`

**Recommended Command**:
```bash
node true-agentic-orchestrator.js
```

**Why This Entry Point?**
- ✅ Strategic orchestrator with 10-minute cycles (optimal for testing)
- ✅ Full agentic architecture activated
- ✅ All 14+ agents coordinated
- ✅ Explainable decision logging
- ✅ Goal-driven adaptation enabled

**Alternative** (if you prefer REST API interface):
```bash
node real-time-server.js
```

---

## Monitoring During UAT

### Terminal 1: Application
```bash
node true-agentic-orchestrator.js
```

### Terminal 2: Live Logs
```bash
tail -f logs/agent-decisions.jsonl | jq
```

### Terminal 3: Database Monitoring
```bash
watch -n 5 'sqlite3 database/trading.db "SELECT COUNT(*) as agent_executions FROM agent_executions; SELECT COUNT(*) as trades FROM trades; SELECT * FROM portfolio;"'
```

---

## Expected Timeline

| Time | Expected Activity |
|------|-------------------|
| 0:00 | Application starts, agents initialize |
| 0:01 | First market data fetch |
| 0:02 | Market Analyzer produces first analysis |
| 0:05 | Autonomous Market Hunter scans opportunities |
| 0:10 | **FIRST STRATEGIC CYCLE** - All agents coordinate |
| 0:20 | Second strategic cycle, portfolio snapshot |
| 0:30 | Performance metrics calculated |
| 0:30+ | **UAT DECISION POINT** - Proceed to production? |

---

## Post-UAT Decision

### ✅ PASS → Production Deployment
If all critical criteria met:
1. Tag release: `git tag v1.0.0-production`
2. Deploy to production environment
3. Enable monitoring and alerting
4. Begin live trading with small position sizes

### ⚠️ PARTIAL PASS → Limited Deployment
If some issues found:
1. Deploy with trade execution disabled
2. Monitor agent decisions only
3. Fix identified issues
4. Retry UAT

### ❌ FAIL → Back to Development
If critical issues found:
1. Document all failures
2. Restore from backup
3. Fix critical bugs
4. Run tests again
5. Schedule new UAT

---

## Contact & Support

**During UAT**, monitor these:
- **Console Output**: Real-time agent activity
- **Logs**: `logs/agent-decisions.jsonl`
- **Database**: `database/trading.db`
- **Dashboards**: `docs/explainable-agents-dashboard.html`

**Ready to begin?** Run:
```bash
node true-agentic-orchestrator.js
```

**Good luck! 🚀**
