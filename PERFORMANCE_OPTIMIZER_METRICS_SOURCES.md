# 📊 Performance Optimizer Metrics Collection - Source Mapping

## 🎯 Complete Data Source Breakdown

The Performance Optimizer collects metrics from **5 primary sources** in the TweetBot system. Here's the complete breakdown:

---

## 1. 🗄️ **Database (SQLite) - Primary Source**

**Location**: `/workspaces/TweetBot/database/trading.db`  
**Service**: `database/database-service.js`

### Tables Queried:

#### A. **`agent_executions` Table**
```sql
CREATE TABLE agent_executions (
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
```

**What Performance Optimizer Collects**:
```typescript
// Method: getAgentExecutions(agentName, limit)
{
  agent_name: 'market-hunter',
  execution_type: 'decision_cycle',
  success: true/false,              // → Used for success rate calculation
  execution_time_ms: 1250,          // → Used for response time metrics
  timestamp: '2025-10-10 15:30:00', // → Used for recency analysis
  output_data: {                    // → Parsed for decision quality
    confidence: 0.85,
    signalsGenerated: 3
  }
}
```

**Metrics Derived**:
- ✅ **Success Rate**: `COUNT(success=1) / COUNT(*)`
- ✅ **Average Response Time**: `AVG(execution_time_ms)`
- ✅ **Decision Count**: `COUNT(*)`
- ✅ **Error Rate**: `COUNT(error_message IS NOT NULL) / COUNT(*)`

**Query Example**:
```javascript
// From database-service.js
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
```

---

#### B. **`agent_decisions` Table** (Explainable Agents)
```sql
CREATE TABLE agent_decisions (
    id VARCHAR(50) PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    agent VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    context TEXT NOT NULL,        -- JSON: trigger, inputs, systemState
    reasoning TEXT NOT NULL,       -- JSON: analysis, confidence, alternatives
    outcome TEXT NOT NULL,         -- JSON: action, success, actualResult
    agent_state TEXT NOT NULL,     -- JSON: autonomyLevel, performanceScore
    system TEXT NOT NULL,          -- JSON: cycleId, coordination
    feedback TEXT NOT NULL         -- JSON: learning, adjustments
);
```

**What Performance Optimizer Collects**:
```typescript
// Parsed JSON from reasoning column
{
  confidence: 0.85,           // → Average confidence metric
  riskAssessment: 'medium',   // → Risk profile
  alternatives: ['...'],      // → Decision complexity
}

// Parsed JSON from outcome column
{
  success: true,              // → Success rate
  actualResult: 0.75,         // → Performance outcome
}

// Parsed JSON from agent_state column
{
  autonomyLevel: 0.90,        // → Current autonomy
  performanceScore: 0.82,     // → Self-reported performance
  learningRate: 0.15          // → Learning progress
}
```

**Metrics Derived**:
- ✅ **Average Confidence**: Parsed from `reasoning.confidence`
- ✅ **Autonomy Level**: Parsed from `agent_state.autonomyLevel`
- ✅ **Performance Score**: Parsed from `agent_state.performanceScore`
- ✅ **Adaptation Score**: Calculated from `feedback.learningAdjustments`

---

#### C. **`portfolio` & `portfolio_history` Tables**
```sql
CREATE TABLE portfolio (
    id INTEGER PRIMARY KEY,
    btc_balance REAL NOT NULL,
    usd_balance REAL NOT NULL,
    last_updated DATETIME NOT NULL
);

CREATE TABLE portfolio_history (
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    btc_balance REAL NOT NULL,
    usd_balance REAL NOT NULL,
    btc_price_usd REAL NOT NULL,
    total_value_usd REAL NOT NULL
);
```

**What Performance Optimizer Collects**:
```typescript
{
  total_value_usd: 10523.45,    // → System performance indicator
  btc_balance: 0.1234,          // → Resource allocation
  usd_balance: 8765.43,         // → Resource efficiency
  last_updated: timestamp       // → Data freshness
}
```

**Metrics Derived**:
- ✅ **Portfolio Growth**: `(current - starting) / starting`
- ✅ **Resource Efficiency**: How well capital is deployed
- ✅ **Goal Progress**: Progress toward weekly targets

---

#### D. **`trades` Table**
```sql
CREATE TABLE trades (
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    trade_type VARCHAR(4) NOT NULL,
    amount_btc DECIMAL(10,8) NOT NULL,
    price_usd DECIMAL(10,2) NOT NULL,
    total_usd DECIMAL(12,2) NOT NULL,
    agent_decision_reason TEXT,
    executed_by VARCHAR(50)
);
```

**What Performance Optimizer Collects**:
```typescript
{
  trade_type: 'BUY',
  amount_btc: 0.0523,
  price_usd: 94231.50,
  executed_by: 'Intelligent Execution Agent',
  timestamp: '2025-10-10 15:30:00'
}
```

**Metrics Derived**:
- ✅ **Trading Frequency**: Trades per hour/day
- ✅ **Execution Success**: Profitable vs unprofitable trades
- ✅ **Decision Quality**: Trade outcomes vs predictions

---

#### E. **`market_data` Table**
```sql
CREATE TABLE market_data (
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    price_usd DECIMAL(10,2) NOT NULL,
    volume_24h DECIMAL(15,2),
    price_change_24h DECIMAL(5,2),
    fear_greed_index INTEGER
);
```

**What Performance Optimizer Collects**:
```typescript
{
  price_change_24h: 2.5,        // → Volatility context
  volume_24h: 45000000000,      // → Market activity
  fear_greed_index: 64          // → Market sentiment
}
```

**Metrics Derived**:
- ✅ **Market Context**: Volatility for context-aware optimization
- ✅ **Environmental Factors**: Market conditions affecting performance

---

## 2. 🤖 **Direct Agent Queries - Live State**

**Location**: In-memory agent instances managed by `true-agentic-orchestrator.js`

### Agent State Properties:

```javascript
// From true-agentic-orchestrator.js
async evaluateAllAgentPerformance() {
  for (const [agentId, agent] of this.agents) {
    // Direct queries to agent instances
    const reputation = this.agentReputations.get(agentId) || 0.7;
    const autonomyLevel = this.autonomyLevels.get(agentId) || 0.8;
    const goalProgress = await agent.evaluateGoalProgress();
    
    // Calculates real-time performance
    const performanceScore = (reputation + goalProgress.overallProgress + autonomyLevel) / 3;
  }
}
```

### Live Agent Properties Accessed:

```typescript
{
  // From agent instance
  agentId: 'market-hunter',
  currentState: {
    isRunning: true,
    lastExecutionTime: Date,
    currentCycle: 42
  },
  
  // From orchestrator tracking
  reputation: 0.87,              // → Tracked by orchestrator
  autonomyLevel: 0.90,           // → Tracked by orchestrator
  
  // From agent methods
  goalProgress: {
    primary: 0.75,
    secondary: 0.82,
    tactical: 0.68,
    overallProgress: 0.75
  },
  
  // From agent metrics
  recentDecisions: [...],        // → Last N decisions
  successHistory: [...]          // → Historical success
}
```

**Metrics Collected**:
- ✅ **Current Autonomy Level**: From `this.autonomyLevels.get(agentId)`
- ✅ **Reputation Score**: From `this.agentReputations.get(agentId)`
- ✅ **Goal Progress**: From `agent.evaluateGoalProgress()`
- ✅ **Running State**: Agent active/idle status
- ✅ **Cycle Count**: Number of autonomous cycles completed

---

## 3. 🔧 **System Performance Tracker**

**Location**: `src/mastra/agency/performance-optimizer-agent.ts`

### Built-in Monitoring:

```typescript
class SystemMetricsTracker {
  async collectMetrics(): Promise<SystemMetrics> {
    return {
      // Collected from Node.js process
      cpu: process.cpuUsage(),           // → CPU usage
      memory: process.memoryUsage(),     // → Memory metrics
      uptime: process.uptime(),          // → System uptime
      
      // Collected from system
      timestamp: Date.now(),
      nodeVersion: process.version,
      platform: process.platform
    };
  }
}
```

**Metrics Collected**:
- ✅ **CPU Usage**: `process.cpuUsage().user + process.cpuUsage().system`
- ✅ **Memory Usage**: `process.memoryUsage().heapUsed / process.memoryUsage().heapTotal`
- ✅ **System Uptime**: `process.uptime()`

---

## 4. 📡 **Inter-Agent Communication Channel**

**Location**: `true-agentic-orchestrator.js` - `InterAgentCommunication` class

### Message Tracking:

```javascript
class InterAgentCommunication {
  constructor() {
    this.messageQueue = [];
    this.messageHistory = [];
    this.metrics = {
      totalMessages: 0,
      averageLatency: 0,
      failedMessages: 0
    };
  }
  
  async sendMessage(from, to, message) {
    const startTime = Date.now();
    // ... send logic
    const latency = Date.now() - startTime;
    
    this.metrics.totalMessages++;
    this.metrics.averageLatency = 
      (this.metrics.averageLatency * (this.metrics.totalMessages - 1) + latency) 
      / this.metrics.totalMessages;
  }
}
```

**Metrics Collected**:
- ✅ **Message Latency**: Time to deliver messages between agents
- ✅ **Message Success Rate**: Delivered vs failed messages
- ✅ **Communication Volume**: Messages per agent pair
- ✅ **Coordination Score**: Calculated from successful negotiations

---

## 5. 🧠 **Agent-Reported Metrics** (Self-Reporting)

**Location**: Individual agent implementations

### Agents Report Their Own Metrics:

```typescript
// Example from Market Hunter
class AutonomousMarketHunter {
  async getPerformanceMetrics(): Promise<AgentMetrics> {
    return {
      // Self-reported metrics
      sourcesQueried: this.sourcesQueriedCount,
      signalsGenerated: this.signalsGeneratedCount,
      avgConfidence: this.calculateAvgConfidence(),
      
      // Calculated metrics
      successRate: this.successfulCalls / this.totalCalls,
      avgResponseTime: this.totalResponseTime / this.totalCalls,
      
      // Resource metrics
      apiCallsUsed: this.apiCallCount,
      cacheHitRate: this.cacheHits / (this.cacheHits + this.cacheMisses)
    };
  }
}
```

**Metrics Self-Reported by Agents**:
- ✅ **Decision Count**: Number of decisions made
- ✅ **Success Rate**: Self-calculated success percentage
- ✅ **Confidence Levels**: Average confidence in decisions
- ✅ **Resource Usage**: API calls, cache hits, etc.
- ✅ **Execution Times**: Time spent on various operations

---

## 📊 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE OPTIMIZER                        │
│                    Metrics Collection                           │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        │                     │                     │
┌───────▼────────┐   ┌────────▼────────┐   ┌──────▼──────────┐
│   DATABASE     │   │  LIVE AGENTS    │   │  SYSTEM STATS   │
│   (SQLite)     │   │  (In-Memory)    │   │  (Node.js)      │
└───────┬────────┘   └────────┬────────┘   └──────┬──────────┘
        │                     │                    │
        │                     │                    │
   ┌────▼────┐           ┌────▼────┐         ┌────▼────┐
   │agent_   │           │agent    │         │process  │
   │exec-    │           │reputa-  │         │cpu/     │
   │utions  │           │tion map │         │memory   │
   └─────────┘           └─────────┘         └─────────┘
        │                     │                    │
   ┌────▼────┐           ┌────▼────┐         ┌────▼────┐
   │agent_   │           │autonomy │         │message  │
   │deci-    │           │level map│         │latency  │
   │sions   │           └─────────┘         └─────────┘
   └─────────┘                │
        │                ┌────▼────┐
   ┌────▼────┐          │goal     │
   │port-    │          │progress │
   │folio    │          └─────────┘
   └─────────┘
        │
   ┌────▼────┐
   │trades   │
   └─────────┘
        │
   ┌────▼────┐
   │market_  │
   │data     │
   └─────────┘
```

---

## 🎯 Metrics Collection Process

### Phase 1: Database Queries (Most Recent Data)
```javascript
// Step 1: Query agent_executions for recent activity
const executions = await db.getAgentExecutions('market-hunter', 50);

// Calculate from executions:
const successRate = executions.filter(e => e.success).length / executions.length;
const avgResponseTime = executions.reduce((sum, e) => sum + e.execution_time_ms, 0) / executions.length;
const decisionCount = executions.length;

// Step 2: Query agent_decisions for detailed metrics
const decisions = await db.query(`
  SELECT * FROM agent_decisions 
  WHERE agent = 'market-hunter' 
  ORDER BY timestamp DESC 
  LIMIT 50
`);

// Parse JSON and extract:
const avgConfidence = decisions.reduce((sum, d) => {
  const reasoning = JSON.parse(d.reasoning);
  return sum + reasoning.confidence;
}, 0) / decisions.length;

// Step 3: Query portfolio for system performance
const portfolio = await db.getLivePortfolio();
const goalProgress = (portfolio.total_value_usd - 10000) / (10500 - 10000); // Progress to 5% goal
```

### Phase 2: Live Agent State (Real-Time)
```javascript
// Query agent instances directly
for (const [agentId, agent] of this.agents) {
  const liveMetrics = {
    reputation: this.agentReputations.get(agentId),
    autonomyLevel: this.autonomyLevels.get(agentId),
    goalProgress: await agent.evaluateGoalProgress(),
    isRunning: agent.isRunning,
    currentCycle: agent.cycleCount
  };
}
```

### Phase 3: System Resources (Infrastructure)
```javascript
// Collect system-level metrics
const systemMetrics = {
  cpu: process.cpuUsage(),
  memory: process.memoryUsage(),
  uptime: process.uptime(),
  nodeVersion: process.version
};
```

### Phase 4: Communication Metrics (Coordination)
```javascript
// Get inter-agent communication stats
const commMetrics = {
  messageLatency: this.agentCommunicationChannel.getAverageLatency(),
  messageSuccessRate: this.agentCommunicationChannel.getSuccessRate(),
  coordinationScore: this.calculateCoordinationScore()
};
```

### Phase 5: Agent Self-Reports (Optional)
```javascript
// Some agents can report their own metrics
const selfReportedMetrics = await agent.getPerformanceMetrics?.();
```

---

## 📈 Example: Complete Metric Collection for Market Hunter

```javascript
// COMPLETE COLLECTION EXAMPLE
async collectMetricsForMarketHunter() {
  const agentId = 'market-hunter';
  
  // 1. FROM DATABASE
  const executions = await this.db.getAgentExecutions(agentId, 50);
  const dbMetrics = {
    decisionCount: executions.length,
    successRate: executions.filter(e => e.success).length / executions.length,
    avgResponseTime: executions.reduce((s, e) => s + e.execution_time_ms, 0) / executions.length
  };
  
  // 2. FROM AGENT DECISIONS TABLE
  const decisions = await this.db.query(`
    SELECT reasoning, agent_state 
    FROM agent_decisions 
    WHERE agent = ? 
    ORDER BY timestamp DESC 
    LIMIT 50
  `, [agentId]);
  
  const decisionMetrics = {
    avgConfidence: decisions.reduce((sum, d) => {
      return sum + JSON.parse(d.reasoning).confidence;
    }, 0) / decisions.length,
    
    avgAutonomy: decisions.reduce((sum, d) => {
      return sum + JSON.parse(d.agent_state).autonomyLevel;
    }, 0) / decisions.length
  };
  
  // 3. FROM LIVE AGENT STATE
  const agent = this.agents.get(agentId);
  const liveMetrics = {
    reputation: this.agentReputations.get(agentId) || 0.7,
    autonomyLevel: this.autonomyLevels.get(agentId) || 0.85,
    goalProgress: await agent.evaluateGoalProgress(),
    isRunning: agent.isRunning,
    lastExecutionTime: agent.lastExecutionTime
  };
  
  // 4. FROM INTER-AGENT COMMUNICATION
  const commMetrics = {
    messagesSent: this.agentCommunicationChannel.getMessageCount(agentId),
    avgLatency: this.agentCommunicationChannel.getAgentLatency(agentId),
    coordinationScore: this.calculateAgentCoordinationScore(agentId)
  };
  
  // 5. FROM AGENT SELF-REPORT (if available)
  const selfReported = await agent.getPerformanceMetrics?.() || {};
  
  // COMBINED METRICS
  return {
    agentId,
    timestamp: new Date(),
    
    // Performance Metrics
    decisionCount: dbMetrics.decisionCount,
    successRate: dbMetrics.successRate,
    avgConfidence: decisionMetrics.avgConfidence,
    avgResponseTime: dbMetrics.avgResponseTime,
    
    // Adaptation Metrics
    adaptationScore: this.calculateAdaptationScore(executions),
    coordinationScore: commMetrics.coordinationScore,
    resourceEfficiency: this.calculateResourceEfficiency(selfReported),
    
    // Goal & Progress Metrics
    goalProgress: liveMetrics.goalProgress.overallProgress,
    reputation: liveMetrics.reputation,
    autonomyLevel: liveMetrics.autonomyLevel,
    
    // System Integration
    isRunning: liveMetrics.isRunning,
    lastExecution: liveMetrics.lastExecutionTime,
    messageLatency: commMetrics.avgLatency,
    messageCount: commMetrics.messagesSent
  };
}
```

---

## 🔑 Key Insights

### Primary Data Source: **Database (70%)**
- Most metrics come from historical executions stored in SQLite
- Provides accurate, timestamped performance data
- Enables trend analysis and learning

### Secondary Source: **Live Agent State (20%)**
- Real-time reputation and autonomy levels
- Current goal progress
- Running state and cycle counts

### Tertiary Sources: **System & Communication (10%)**
- Infrastructure metrics (CPU, memory)
- Inter-agent communication efficiency
- System-wide coordination scores

### Why This Architecture?

1. **Persistence**: Database ensures metrics survive restarts
2. **Accuracy**: Historical data provides true performance picture
3. **Real-Time**: Live state enables immediate optimization
4. **Comprehensive**: Multiple sources = complete picture
5. **Auditable**: All metrics are logged and traceable

---

## 🚀 Optimization Flow Example

```
TRIGGER: Performance Optimizer Cycle Starts
    ↓
1. Query Database (agent_executions, agent_decisions, portfolio)
    → Get last 50 executions for each agent
    → Parse JSON for confidence, autonomy, performance
    → Calculate success rates, response times
    ↓
2. Query Live Agents (reputation, autonomy, goals)
    → Get current reputation scores
    → Get current autonomy levels
    → Evaluate goal progress
    ↓
3. Check System Metrics (CPU, memory, uptime)
    → Process stats from Node.js
    → Calculate resource utilization
    ↓
4. Analyze Communication (message latency, coordination)
    → Get inter-agent message metrics
    → Calculate coordination scores
    ↓
5. Combine All Metrics
    → Create comprehensive performance profile per agent
    ↓
6. Identify Bottlenecks
    → Compare metrics to thresholds
    → Detect performance issues
    ↓
7. Generate & Execute Optimizations
    → Create optimization strategies
    → Implement improvements
    ↓
8. Log Results Back to Database
    → Store optimization outcomes
    → Update performance history
```

---

**Summary**: The Performance Optimizer collects metrics from **5 distinct sources**, with the **database being the primary source** (agent_executions, agent_decisions tables), supplemented by **live agent state** (reputation, autonomy, goals), **system stats** (CPU, memory), **communication metrics** (latency, coordination), and optional **agent self-reports**. This multi-source approach ensures comprehensive, accurate performance monitoring!
