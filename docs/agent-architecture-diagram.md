# 🤖 TweetBot Agent Architecture Diagram

```mermaid
graph TB
    subgraph "🏗️ CORE AGENTIC FRAMEWORK (Layer 1)"
        SO[🎯 Strategic Orchestrator<br/>95% Autonomy<br/>Meta-decisions, Conflicts]
        AMH[🔍 Autonomous Market Hunter<br/>85-95% Autonomy<br/>8 Data Sources, Signals]
        PO[⚡ Performance Optimizer<br/>80-95% Autonomy<br/>System Efficiency]
    end
    
    subgraph "📱 CONTENT & SOCIAL AGENTS (Layer 2)"
        DC[📊 Data Collector<br/>70% Autonomy<br/>Price + News]
        MA[📈 Market Analyzer<br/>75-95% Autonomy<br/>Sentiment + Technical]
        CC[📝 Content Creator<br/>75-95% Autonomy<br/>Tweet Generation]
        SP[📱 Social Publisher<br/>65% Autonomy<br/>Twitter/X]
        RP[🔴 Reddit Publisher<br/>65% Autonomy<br/>Subreddits]
        BO[🎼 Bitcoin Orchestrator<br/>60% Autonomy<br/>Workflows]
    end
    
    subgraph "💰 TRADING & INTELLIGENCE (Layer 3)"
        IEA[💼 Intelligent Execution<br/>75% Autonomy<br/>$10K Trading]
        TAO[🧠 True Agentic Orch<br/>95% Autonomy<br/>System Manager]
        BTC[📊 BTC Intelligence<br/>Dashboard]
    end
    
    subgraph "📡 DATA SOURCES"
        DS1[🐋 Whale Movements<br/>Blockchain.info]
        DS2[📊 Narrative Shifts<br/>CoinGecko Trending]
        DS3[💱 Arbitrage<br/>CCXT Exchanges]
        DS4[📢 Influencer Signals<br/>CoinGecko]
        DS5[📈 Technical Breakouts<br/>OHLC Patterns]
        DS6[🏦 Institutional Flows<br/>Public Treasuries]
        DS7[📉 Derivatives<br/>Coinglass]
        DS8[🌍 Macro Signals<br/>Fear & Greed]
    end
    
    subgraph "💾 DATABASE"
        DB[(SQLite Database<br/>50+ Tables<br/>Agent Decisions<br/>Market Data<br/>Trading History)]
    end
    
    %% Strategic Orchestrator connections
    SO -->|Coordinates| AMH
    SO -->|Optimizes| PO
    SO -->|Manages| MA
    SO -->|Manages| CC
    SO -->|Manages| IEA
    SO -->|Resolves Conflicts| SO
    
    %% Market Hunter connections
    AMH -->|Queries| DS1
    AMH -->|Queries| DS2
    AMH -->|Queries| DS3
    AMH -->|Queries| DS4
    AMH -->|Queries| DS5
    AMH -->|Queries| DS6
    AMH -->|Queries| DS7
    AMH -->|Queries| DS8
    AMH -->|Signals| IEA
    AMH -->|Signals| MA
    AMH -->|Signals| CC
    
    %% Data flow
    DC -->|Price Data| MA
    DC -->|News Data| MA
    MA -->|Analysis| CC
    MA -->|Sentiment| IEA
    CC -->|Content| SP
    CC -->|Content| RP
    
    %% Trading flow
    MA -->|Market Intel| IEA
    AMH -->|Alpha Signals| IEA
    IEA -->|Trades| DB
    
    %% Database connections
    SO -.->|Logs| DB
    AMH -.->|Stores| DB
    MA -.->|Stores| DB
    IEA -.->|Stores| DB
    PO -.->|Stores| DB
    SP -.->|Logs| DB
    RP -.->|Logs| DB
    
    %% TAO connections
    TAO -->|Manages| SO
    TAO -->|Monitors| AMH
    TAO -.->|System State| DB
    
    %% Dashboard
    DB -.->|Visualizes| BTC
    
    %% Orchestrator workflow
    BO -->|Schedules| DC
    BO -->|Triggers| MA
    BO -->|Coordinates| CC
    
    %% Performance optimization
    PO -->|Analyzes| SO
    PO -->|Optimizes| AMH
    PO -->|Improves| MA
    
    style SO fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px
    style AMH fill:#4ecdc4,stroke:#0a817a,stroke-width:3px
    style IEA fill:#ffd93d,stroke:#d4a100,stroke-width:3px
    style TAO fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px
    style DB fill:#95e1d3,stroke:#33ccb3,stroke-width:2px
    style PO fill:#a8e6cf,stroke:#56ab91,stroke-width:2px
```

## 📊 Agent Interaction Legend

### Line Types:
- **Solid Arrow (→)**: Direct communication/data flow
- **Dotted Arrow (-.->)**: Database logging/storage
- **Management (→)**: Orchestration/coordination

### Color Coding:
- 🔴 **Red**: Meta-agents (Strategic Orchestrator, TAO)
- 🔵 **Cyan**: Market Intelligence (Market Hunter)
- 🟡 **Yellow**: Execution/Trading (Intelligent Execution)
- 🟢 **Green**: Support/Infrastructure (Performance Optimizer, Database)
- ⚪ **White**: Content/Social/Data agents

---

## 🔄 Signal Flow Examples

### Example 1: Market Alert Flow
```
Whale Movement Detected (Blockchain.info)
    ↓
Market Hunter processes (confidence: 0.95)
    ↓
Signal generated: WHALE_ALERT
    ↓ ↓ ↓
    ↓ ↓ ↘ Intelligent Execution (adjusts strategy)
    ↓ ↘ Market Analyzer (updates sentiment)
    ↘ Content Creator (generates alert tweet)
```

### Example 2: Trading Decision Flow
```
Market Hunter (8 sources) → Market Context
    ↓
Market Analyzer → Sentiment Analysis
    ↓
Intelligent Execution Agent:
    • Progress to weekly goal?
    • Market sentiment?
    • Technical trend?
    • Whale activity?
    ↓
Decision: BUY 0.0523 BTC @ $94,231
    ↓
Database logs decision
    ↓
Strategic Orchestrator evaluates outcome
```

### Example 3: Content Publishing Flow
```
Data Collector → Fetches price + news
    ↓
Market Analyzer → Sentiment: 0.67 (bullish)
    ↓
Content Creator:
    • Generates tweet
    • Optimizes hashtags
    • Predicts engagement
    ↓
Social Publisher → Posts to Twitter/X
    ↓
Engagement Tracker → Measures performance
    ↓
Strategic Orchestrator → Learns from results
```

### Example 4: System Optimization Flow
```
Strategic Orchestrator observes:
    • Market Hunter success: 54%
    • Goal conflicts detected
    • Strategic misalignment
    ↓
Makes decisions:
    • AGENT_ADAPTATION (reduce autonomy)
    • CONFLICT_RESOLUTION (adjust goals)
    • SYSTEM_REALIGNMENT (optimize coordination)
    ↓
Executes adaptations:
    • Market Hunter adjusts strategy
    • Performance Optimizer improves efficiency
    • Conflicts resolved autonomously
    ↓
System learning:
    • Success rate: 100% → increase learning rate
    • Update agent reputations
    • Amplify emergent behaviors
```

---

## 🧠 Autonomy Hierarchy

```
Level 5 (95%): Strategic Meta-Agents
    ├─ Strategic Orchestrator
    └─ True Agentic Orchestrator

Level 4 (85-95%): Autonomous Intelligence
    ├─ Autonomous Market Hunter
    └─ Performance Optimizer

Level 3 (75-95%): Adaptive Agents
    ├─ Market Analyzer
    ├─ Content Creator
    └─ Intelligent Execution

Level 2 (65-70%): Task Executors
    ├─ Data Collector
    ├─ Social Publisher
    └─ Reddit Publisher

Level 1 (60%): Coordinators
    └─ Bitcoin Orchestrator
```

---

## 🎯 Decision-Making Layers

```
┌─────────────────────────────────────────┐
│     STRATEGIC LAYER (Meta-Decisions)    │
│  Strategic Orchestrator, TAO            │
│  • System-wide goals                    │
│  • Agent coordination                   │
│  • Conflict resolution                  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    INTELLIGENCE LAYER (Analysis)        │
│  Market Hunter, Market Analyzer, PO     │
│  • Data gathering                       │
│  • Pattern detection                    │
│  • Signal generation                    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│     EXECUTION LAYER (Actions)           │
│  Execution Agent, Publishers, Creator   │
│  • Trading decisions                    │
│  • Content publishing                   │
│  • Portfolio management                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      STORAGE LAYER (Persistence)        │
│  Database Service                       │
│  • Decision logging                     │
│  • Performance metrics                  │
│  • Learning history                     │
└─────────────────────────────────────────┘
```

---

## 📡 Inter-Agent Communication Patterns

### 1. Broadcasting (One-to-Many)
```
Market Hunter → [All Agents]
    Signal: WHALE_ALERT
    Recipients: Execution, Analyzer, Creator
```

### 2. Request-Response (One-to-One)
```
Content Creator → Market Analyzer
    Request: "What's current sentiment?"
    Response: { sentiment: 0.67, confidence: 0.82 }
```

### 3. Negotiation (Peer-to-Peer)
```
Agent A: "I need resource X"
Agent B: "I'm using resource X"
    ↓
Strategic Orchestrator arbitrates
    ↓
Resolution: Time-sharing agreement
```

### 4. Hierarchical (Top-Down)
```
Strategic Orchestrator → Market Hunter
    Command: "Reduce autonomy to 80%"
    Reason: "Performance below threshold"
```

---

## 💾 Database Schema Overview

```
Market Hunter Tables (8):
    whale_movements
    narrative_shifts
    arbitrage_opportunities
    influencer_signals
    technical_breakouts
    institutional_flows
    derivatives_signals
    macro_signals

Agent Decision Tables (4):
    agent_executions
    system_alerts
    alpha_discoveries
    strategic_decisions

Trading Tables (3):
    portfolio_state
    trading_history
    system_config

Analytics Tables (2):
    engagement_metrics
    performance_history
```

---

**Diagram Generated**: Based on comprehensive codebase analysis
**Total Agents**: 14+ identified and mapped
**Architecture Layers**: 3 (Core Agentic, Content/Social, Trading)
**Data Sources**: 8 real-time APIs
**Database Tables**: 50+
