# 🤖 Autonomous Market Hunter Agent

## Overview

The **Autonomous Market Hunter** is a truly agentic Bitcoin market intelligence system that operates independently every 10 minutes. Unlike traditional programmatic systems, this agent makes **its own decisions** about which data sources to query based on:

- Current market conditions
- Historical performance data
- Learning from past results
- Context-aware optimization

## ✅ Key Agentic Features

### 1. **Autonomous Decision-Making**
The agent **decides for itself** which of the 8 data sources to query each cycle:

```
Available Sources:
├── whaleMovements (On-chain large transactions)
├── narrativeShifts (Social/trending themes)
├── arbitrageOpportunities (Cross-exchange spreads)
├── influencerSignals (Price action signals)
├── technicalBreakouts (Chart patterns)
├── institutionalFlows (Large holder movements)
├── derivativesSignals (Funding rates, OI)
└── macroSignals (Fear & Greed, market-wide)

Agent selects 3-6 sources per cycle based on:
✓ Market volatility (high/medium/low)
✓ Current trend (bullish/bearish/neutral)
✓ Trading volume
✓ Time of day (Asian/European/American/Overlap)
✓ Historical source performance
✓ Exploration vs exploitation balance
```

### 2. **Context-Aware Strategy**

The agent assesses market conditions and adapts:

```typescript
Market Context Assessment:
├── Volatility Detection
│   ├── High (>5% price change) → Query 6 sources
│   ├── Medium (2-5%) → Query 4 sources
│   └── Low (<2%) → Query 3 sources
│
├── Trend Analysis
│   ├── Bullish → Prioritize institutional flows, influencer signals
│   ├── Bearish → Prioritize derivatives, whale movements
│   └── Neutral → Prioritize macro signals, narratives
│
└── Time-Based Optimization
    ├── Asian hours → Whale movements +30% relevance
    ├── European hours → Narrative shifts +30% relevance
    ├── American hours → Institutional flows +30% relevance
    └── Overlap → Arbitrage opportunities +30% relevance
```

### 3. **Adaptive Learning**

The agent learns from every cycle:

```typescript
Learning Metrics (per source):
├── Success Rate: % of calls that return data
├── Signal Quality: % that contribute to actionable signals
├── Recency: Bonus for sources not used recently
└── Context Relevance: Score based on current market

Learning Algorithm:
new_metric = (1 - learning_rate) × old_metric + learning_rate × new_observation

Default Learning Rate: 0.1 (10% weight to new data)
Exploration Rate: 0.2 (20% chance to try underused sources)
```

### 4. **Inter-Agent Communication**

When significant patterns emerge, the agent generates **signals** for other agents:

```typescript
Signal Types:
├── WHALE_ACTIVITY (severity: high)
│   └── Triggers: >100 BTC transactions detected
│
├── POSITIVE_NARRATIVE (severity: medium)
│   └── Triggers: 3+ bullish trending topics
│
├── INSTITUTIONAL_ACCUMULATION (severity: high)
│   └── Triggers: >$50B in institutional holdings
│
├── EXTREME_FUNDING (severity: critical)
│   └── Triggers: Funding rate >5% (liquidation risk)
│
├── EXTREME_GREED (severity: medium)
│   └── Triggers: Fear & Greed Index >75
│
└── EXTREME_FEAR (severity: medium)
    └── Triggers: Fear & Greed Index <25

Each signal includes:
✓ Severity level
✓ Confidence score
✓ Recommended action
✓ Target agents (bitcoin-orchestrator, risk-manager, etc.)
```

### 5. **Self-Optimization**

The agent continuously improves:

- **Exploration vs Exploitation**: Balances trying new sources vs using proven ones
- **Dynamic Source Selection**: Adjusts based on what's working
- **Context Learning**: Remembers which sources work best in which conditions
- **Performance Tracking**: Stores all decisions and outcomes for analysis

## 🚀 Usage

### Start Autonomous Mode (Production)

```bash
npx tsx start-autonomous-market-hunter.ts
```

This starts the agent in continuous mode:
- Runs every 10 minutes
- Makes autonomous decisions
- Generates signals for other agents
- Stores all data in database
- Learns and adapts continuously

### Test Single Cycle

```bash
npx tsx test-autonomous-market-hunter.ts
```

Runs one cycle immediately for testing.

### Monitor Agent State

```typescript
import { autonomousMarketHunter } from './src/mastra/agency/autonomous-market-hunter';

const state = autonomousMarketHunter.getAgentState();
console.log(state);

// Output:
{
  isRunning: true,
  currentContext: {
    volatility: 'medium',
    trend: 'bullish',
    volume: 'high',
    timeOfDay: 'american'
  },
  sourceMetrics: [
    {
      name: 'whaleMovements',
      successRate: 0.75,
      avgSignalQuality: 0.82,
      totalCalls: 45,
      successfulCalls: 34,
      signalsGenerated: 12
    },
    // ... other sources
  ],
  config: {
    checkIntervalMinutes: 10,
    learningRate: 0.1,
    explorationRate: 0.2,
    maxSourcesPerCycle: 5
  }
}
```

## 📊 Decision-Making Example

Here's how the agent decides in a real scenario:

```
SCENARIO: High volatility bullish market during American hours

Step 1: Context Assessment
├── BTC price: $62,500 (+4.2% in 24h)
├── Volatility: HIGH (>5% change)
├── Trend: BULLISH (strong upward)
├── Volume: HIGH (120% of average)
└── Time: American trading hours (13:00-21:00 UTC)

Step 2: Source Scoring
├── derivativesSignals: 0.92 (high volatility +0.4, exploration +0.2)
├── whaleMovements: 0.85 (high volatility +0.3, recency bonus +0.2)
├── institutionalFlows: 0.83 (American hours +0.3, bullish +0.2)
├── influencerSignals: 0.78 (bullish trend +0.4, quality 0.72)
├── narrativeShifts: 0.72 (American hours +0.3, success 0.65)
├── technicalBreakouts: 0.68 (medium relevance)
├── macroSignals: 0.62 (always relevant baseline)
└── arbitrageOpportunities: 0.55 (low relevance in trending market)

Step 3: Selection Decision
Agent selects TOP 6 sources (high volatility = more sources):
✓ derivativesSignals
✓ whaleMovements
✓ institutionalFlows
✓ influencerSignals
✓ narrativeShifts
✓ technicalBreakouts

Step 4: Query & Analyze
├── Found: 2 whale transactions >100 BTC
├── Found: 5 bullish narrative shifts
├── Found: Extreme funding rate (0.06%)
└── Generated: 3 signals for other agents

Step 5: Learning
├── derivativesSignals: quality↑ (contributed to critical signal)
├── whaleMovements: success↑ (found actionable data)
├── institutionalFlows: quality↓ (no data returned)
└── Updated metrics for next cycle
```

## 🗄️ Database Storage

All data is automatically stored with timestamps:

```sql
-- Market Hunter Tables
whale_movements
narrative_shifts
arbitrage_opportunities
influencer_signals
technical_breakouts
institutional_flows
derivatives_signals
macro_signals

-- Agent Decision Logs
agent_executions (decisions, reasoning, outcomes)

-- Signals to Other Agents
system_alerts (severity, message, target agents)
```

Query recent data:
```javascript
const db = new DatabaseService();

// Get recent whale movements
const whales = await db.getRecentWhaleMovements(50);

// Get recent signals
const signals = await db.getRecentAlerts(20);

// Get agent execution history
const executions = await db.getAgentExecutions('autonomous-market-hunter', 100);
```

## 🎯 Performance Metrics

After 24 hours of operation, you can analyze:

1. **Source Performance**: Which sources provide the best signals
2. **Decision Quality**: How often decisions lead to actionable signals
3. **Learning Progress**: How metrics improve over time
4. **Signal Accuracy**: Track if signals preceded actual market moves
5. **Efficiency**: Resource usage vs value generated

## 🔧 Configuration

Tune the agent's behavior:

```typescript
// In autonomous-market-hunter.ts

private readonly CHECK_INTERVAL_MS = 10 * 60 * 1000; // Check frequency
private readonly MIN_CONFIDENCE_THRESHOLD = 0.6; // Signal threshold
private readonly MAX_SOURCES_PER_CYCLE = 5; // Resource limit
private learningRate: number = 0.1; // Learning speed (0-1)
private explorationRate: number = 0.2; // Exploration chance (0-1)
```

## 🚨 Important Notes

1. **API Rate Limits**: The agent respects rate limits by:
   - Not querying all 8 sources every cycle
   - Adding delays between calls
   - Learning which sources are reliable

2. **Signal Filtering**: Only high-confidence signals (>60%) are broadcast

3. **Graceful Shutdown**: Press Ctrl+C to stop cleanly

4. **Database Growth**: Consider archiving old data after 30 days

5. **Learning Persistence**: Metrics survive restarts (stored in DB)

## 🎓 Why This is "Truly Agentic"

Traditional systems: "Query all 8 sources every time"
```python
# Hardcoded, no intelligence
data = query_all_sources()  # Always the same
```

**Autonomous Market Hunter**: "I'll decide based on conditions"
```typescript
// Intelligent, adaptive
const context = await this.assessMarketContext();
const decision = this.decideWhichSourcesToQuery(context);
const data = await this.querySelectedSources(decision.selectedSources);
this.learnFromResults(data);
```

The agent:
- ✅ Makes its own decisions
- ✅ Learns from experience
- ✅ Adapts to environment
- ✅ Optimizes its own behavior
- ✅ Communicates with other agents
- ✅ Operates autonomously 24/7

This is **true agency** - not just automation.

## 📈 Future Enhancements

Potential improvements:
- [ ] Meta-learning (learn optimal learning rate)
- [ ] Multi-objective optimization (accuracy vs cost)
- [ ] Causal inference (did my signals cause agent actions?)
- [ ] Collaborative filtering (learn from other agents' success)
- [ ] Anomaly detection (detect unusual patterns automatically)
- [ ] Natural language explanations (explain decisions in plain English)

---

**Built with TypeScript, Node.js, and SQLite**  
**Part of the Agentic Bitcoin Trading System**
