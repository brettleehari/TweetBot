# Bitcoin Intelligence Agent - Engineering Specification

## Project Overview
A multi-agent AI system for Bitcoin market intelligence that autonomously collects data, analyzes market sentiment, and delivers insights via social media. Built with Mastra AI orchestration framework.

## System Architecture

### Multi-Agent Design Pattern
```
┌─────────────────────────────────────────────────────────────────┐
│                    MAIN ORCHESTRATOR AGENT                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Workflow Mgmt  │  │ Decision Engine │  │ Event Dispatcher│ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────┬───────────────────────┬─────────────────────┘
                      │                       │
         ┌────────────▼──────────────┐       │
         │     DATA COLLECTION       │       │
         │        AGENT              │       │
         │ ┌─────────┐ ┌───────────┐ │       │
         │ │Price API│ │ News API  │ │       │
         │ │Fetcher  │ │Aggregator │ │       │
         │ └─────────┘ └───────────┘ │       │
         └────────────┬──────────────┘       │
                      │                      │
         ┌────────────▼──────────────┐       │
         │      ANALYSIS AGENT       │       │
         │ ┌─────────┐ ┌───────────┐ │       │
         │ │Sentiment│ │ Impact    │ │       │
         │ │Analyzer │ │ Scorer    │ │       │
         │ └─────────┘ └───────────┘ │       │
         └────────────┬──────────────┘       │
                      │                      │
         ┌────────────▼──────────────┐       │
         │  CONTENT GENERATION       │       │
         │        AGENT              │       │
         │ ┌─────────┐ ┌───────────┐ │       │
         │ │ Tweet   │ │ Content   │ │       │
         │ │Composer │ │Formatter  │ │       │
         │ └─────────┘ └───────────┘ │       │
         └────────────┬──────────────┘       │
                      │                      │
         ┌────────────▼──────────────────────▼─┐
         │      SOCIAL MEDIA AGENT             │
         │ ┌─────────┐ ┌───────────┐          │
         │ │Twitter  │ │Engagement │          │
         │ │Publisher│ │ Tracker   │          │
         │ └─────────┘ └───────────┘          │
         └─────────────────────────────────────┘
```

## Agent Specifications

### 1. Main Orchestrator Agent
**Purpose**: Central coordination and workflow management

```typescript
interface OrchestratorAgent {
  name: "bitcoin-orchestrator";
  responsibilities: [
    "Workflow coordination",
    "Event scheduling", 
    "Error handling",
    "Agent communication"
  ];
  
  tools: [
    "workflow-scheduler",
    "event-dispatcher", 
    "health-monitor",
    "agent-coordinator"
  ];
  
  workflows: {
    dailyIntelligence: DailyWorkflow;
    breakingNews: AlertWorkflow;
    priceMonitoring: MonitoringWorkflow;
  };
}
```

**Implementation**:
```typescript
class OrchestratorAgent extends Agent {
  async executeDailyWorkflow() {
    const price = await this.delegateTask('data-collection', 'fetch-price');
    const news = await this.delegateTask('data-collection', 'fetch-news');
    
    const analysis = await this.delegateTask('analysis', 'analyze-data', { price, news });
    const content = await this.delegateTask('content-gen', 'create-summary', analysis);
    
    return this.delegateTask('social-media', 'publish', content);
  }
  
  async handlePriceAlert(priceData: PriceData) {
    if (this.isSignificantMove(priceData)) {
      const alertContent = await this.delegateTask('content-gen', 'create-alert', priceData);
      return this.delegateTask('social-media', 'publish-urgent', alertContent);
    }
  }
}
```

### 2. Data Collection Agent
**Purpose**: Fetch and validate market data and news

```typescript
interface DataCollectionAgent {
  name: "data-collector";
  tools: [
    "alpha-vantage-fetcher",
    "coingecko-fetcher",
    "news-api-client",
    "data-validator"
  ];
  
  capabilities: {
    priceData: {
      primary: "Alpha Vantage",
      backup: "CoinGecko",
      frequency: "15min",
      validation: "cross-reference"
    };
    newsData: {
      sources: ["NewsAPI", "CryptoPanic"],
      filters: ["bitcoin", "btc", "cryptocurrency"],
      deduplication: "content-hash"
    };
  };
}
```

**Implementation**:
```typescript
class DataCollectionAgent extends Agent {
  async fetchBitcoinPrice(): Promise<PriceData> {
    try {
      const primaryData = await this.tools.alphaVantage.getCurrentPrice('BTC');
      const backupData = await this.tools.coinGecko.getCurrentPrice('bitcoin');
      
      return this.validateAndMerge(primaryData, backupData);
    } catch (error) {
      await this.notifyOrchestrator('price-fetch-error', error);
      throw error;
    }
  }
  
  async fetchBitcoinNews(): Promise<NewsItem[]> {
    const newsData = await Promise.allSettled([
      this.tools.newsApi.search('bitcoin'),
      this.tools.cryptoPanic.getBitcoinNews()
    ]);
    
    return this.deduplicateAndFilter(newsData);
  }
}
```

### 3. Analysis Agent
**Purpose**: Process data and extract actionable insights

```typescript
interface AnalysisAgent {
  name: "market-analyzer";
  tools: [
    "openai-sentiment",
    "impact-scorer",
    "trend-detector",
    "signal-generator"
  ];
  
  models: {
    sentiment: "gpt-4o",
    classification: "custom-bitcoin-model",
    embedding: "text-embedding-3-large"
  };
}
```

**Implementation**:
```typescript
class AnalysisAgent extends Agent {
  async analyzeSentiment(news: NewsItem[]): Promise<SentimentAnalysis> {
    const sentimentPrompt = `
      Analyze the sentiment of these Bitcoin news articles.
      Rate each from -1 (very bearish) to +1 (very bullish).
      Consider: regulatory changes, adoption, technical developments, market sentiment.
    `;
    
    const analysis = await this.tools.openai.analyze(sentimentPrompt, news);
    return this.aggregateSentiments(analysis);
  }
  
  async scoreImpact(news: NewsItem[], priceData: PriceData): Promise<ImpactScore> {
    const factors = {
      sourceCredibility: this.getSourceWeight(news.source),
      volumeCorrelation: this.correlateWithVolume(news.timestamp, priceData),
      keywordImportance: this.extractKeywords(news.content),
      historicalPatterns: await this.findSimilarEvents(news)
    };
    
    return this.calculateImpactScore(factors);
  }
}
```

### 4. Content Generation Agent  
**Purpose**: Create engaging social media content

```typescript
interface ContentGenerationAgent {
  name: "content-creator";
  tools: [
    "tweet-composer",
    "hashtag-optimizer", 
    "engagement-predictor",
    "content-formatter"
  ];
  
  templates: {
    dailySummary: DailySummaryTemplate;
    priceAlert: PriceAlertTemplate;
    newsAlert: NewsAlertTemplate;
    marketInsight: InsightTemplate;
  };
}
```

**Implementation**:
```typescript
class ContentGenerationAgent extends Agent {
  async createDailySummary(analysis: MarketAnalysis): Promise<TweetContent> {
    const template = `
      📊 Bitcoin Daily Intel:
      
      Price: $${analysis.price.current} (${analysis.price.change24h > 0 ? '📈' : '📉'} ${analysis.price.change24h}%)
      
      Market Sentiment: ${this.getSentimentEmoji(analysis.sentiment.overall)}
      Key Driver: ${analysis.topNews.headline}
      
      ${this.generateHashtags(analysis)}
    `;
    
    const optimizedContent = await this.tools.tweetComposer.optimize(template, {
      maxLength: 280,
      engagementTarget: 'high',
      audienceProfile: 'crypto-investors'
    });
    
    return optimizedContent;
  }
  
  async createBreakingAlert(priceMove: PriceMovement): Promise<TweetContent> {
    const urgency = this.calculateUrgency(priceMove);
    const template = urgency === 'high' ? this.templates.urgentAlert : this.templates.standardAlert;
    
    return this.populateTemplate(template, priceMove);
  }
}
```

### 5. Social Media Agent
**Purpose**: Publish content and track engagement

```typescript
interface SocialMediaAgent {
  name: "social-publisher";
  tools: [
    "twitter-api-v2",
    "engagement-tracker",
    "posting-scheduler",
    "analytics-collector"
  ];
  
  strategies: {
    posting: {
      dailySummary: "9:00 AM EST",
      breakingNews: "immediate",
      insights: "market hours"
    };
    engagement: {
      trackMetrics: ["likes", "retweets", "replies", "impressions"],
      responseTime: "< 1 hour",
      hashtagStrategy: "trending + niche"
    };
  };
}
```

**Implementation**:
```typescript
class SocialMediaAgent extends Agent {
  async publishTweet(content: TweetContent, priority: 'normal' | 'urgent' = 'normal'): Promise<TweetResult> {
    try {
      const tweetData = await this.tools.twitter.post(content);
      
      await this.scheduleEngagementTracking(tweetData.id);
      await this.logPublication(tweetData, content);
      
      return {
        success: true,
        tweetId: tweetData.id,
        scheduledTracking: true
      };
    } catch (error) {
      await this.handlePublicationError(error, content, priority);
      throw error;
    }
  }
  
  async trackEngagement(tweetId: string): Promise<EngagementMetrics> {
    const metrics = await this.tools.twitter.getMetrics(tweetId);
    
    await this.tools.analytics.record({
      tweetId,
      timestamp: Date.now(),
      ...metrics
    });
    
    return this.analyzePerformance(metrics);
  }
}
```

## Data Models & Schemas

### Core Data Structures
```typescript
interface PriceData {
  asset: 'BTC';
  price: number;
  volume: number;
  marketCap: number;
  change24h: number;
  timestamp: Date;
  source: 'alpha_vantage' | 'coingecko';
  validated: boolean;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  publishedAt: Date;
  url: string;
  sentiment?: number;
  impactScore?: number;
  processed: boolean;
}

interface MarketAnalysis {
  timestamp: Date;
  priceData: PriceData;
  newsItems: NewsItem[];
  sentiment: {
    overall: number;
    confidence: number;
    distribution: Record<string, number>;
  };
  signals: {
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: number;
    catalysts: string[];
  };
}

interface TweetContent {
  text: string;
  hashtags: string[];
  mentions?: string[];
  media?: MediaAttachment[];
  scheduledFor?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}
```

### Database Schema
```sql
-- Agent coordination
CREATE TABLE agent_workflows (
  id SERIAL PRIMARY KEY,
  workflow_name VARCHAR(100),
  agent_name VARCHAR(100),
  status VARCHAR(50),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  result JSONB,
  error_message TEXT
);

-- Market data
CREATE TABLE price_history (
  id SERIAL PRIMARY KEY,
  asset VARCHAR(10) DEFAULT 'BTC',
  price DECIMAL(12,2),
  volume BIGINT,
  market_cap BIGINT,
  change_24h DECIMAL(5,2),
  source VARCHAR(50),
  timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- News and analysis
CREATE TABLE news_analysis (
  id SERIAL PRIMARY KEY,
  news_item_id VARCHAR(100),
  title VARCHAR(500),
  content TEXT,
  source VARCHAR(100),
  sentiment_score DECIMAL(3,2),
  impact_rating INTEGER,
  keywords TEXT[],
  published_at TIMESTAMP,
  processed_at TIMESTAMP DEFAULT NOW()
);

-- Social media tracking
CREATE TABLE social_posts (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(50) DEFAULT 'twitter',
  post_id VARCHAR(100),
  content TEXT,
  hashtags TEXT[],
  engagement_metrics JSONB,
  posted_at TIMESTAMP,
  last_tracked TIMESTAMP
);
```

## Agent Communication Protocol

### Message Patterns
```typescript
interface AgentMessage {
  from: string;
  to: string;
  type: 'task' | 'result' | 'error' | 'heartbeat';
  payload: any;
  timestamp: Date;
  correlationId?: string;
}

interface TaskMessage extends AgentMessage {
  type: 'task';
  payload: {
    action: string;
    parameters: any;
    priority: number;
    timeout?: number;
  };
}

interface ResultMessage extends AgentMessage {
  type: 'result';
  payload: {
    success: boolean;
    data?: any;
    error?: string;
    duration: number;
  };
}
```

### Event System
```typescript
class EventBus {
  async publishEvent(event: AgentEvent): Promise<void> {
    const subscribers = this.getSubscribers(event.type);
    
    await Promise.all(
      subscribers.map(agent => 
        agent.handleEvent(event).catch(error => 
          this.logEventError(agent.name, event, error)
        )
      )
    );
  }
  
  subscribe(agentName: string, eventTypes: string[]): void {
    eventTypes.forEach(type => {
      if (!this.subscriptions[type]) {
        this.subscriptions[type] = new Set();
      }
      this.subscriptions[type].add(agentName);
    });
  }
}
```

## Development Workflow

### Phase-by-Phase Implementation

#### Phase 1: Foundation (2-3 hours)
```bash
# Project setup
npm create mastra-app bitcoin-intelligence
cd bitcoin-intelligence

# Core agent structure
mkdir -p src/agents/{orchestrator,data-collection,analysis,content,social}
mkdir -p src/tools/{api,analysis,content,social}
mkdir -p src/workflows

# Basic orchestrator + data collection
# Focus: Price fetching only
```

#### Phase 2: Analysis Pipeline (4-6 hours) 
```typescript
// Implement analysis agent
class AnalysisAgent extends Agent {
  async processMarketData(data: MarketData): Promise<Analysis> {
    // Sentiment analysis
    // Impact scoring  
    // Trend detection
  }
}
```

#### Phase 3: Content & Social (3-4 hours)
```typescript
// Content generation + Twitter integration
class ContentAgent extends Agent {
  async generateContent(analysis: Analysis): Promise<TweetContent> {
    // Template-based generation
    // Optimization for engagement
  }
}
```

#### Phase 4: Orchestration (2-3 hours)
```typescript
// Complete workflow integration
class OrchestratorAgent extends Agent {
  async runDailyWorkflow(): Promise<WorkflowResult> {
    // Coordinate all agents
    // Handle errors and retries
    // Track performance
  }
}
```

## Testing Strategy

### Unit Tests
```typescript
describe('DataCollectionAgent', () => {
  test('fetches price data successfully', async () => {
    const agent = new DataCollectionAgent(mockTools);
    const priceData = await agent.fetchBitcoinPrice();
    
    expect(priceData).toMatchObject({
      price: expect.any(Number),
      volume: expect.any(Number),
      timestamp: expect.any(Date)
    });
  });
});
```

### Integration Tests
```typescript
describe('Complete Workflow', () => {
  test('daily intelligence workflow', async () => {
    const orchestrator = new OrchestratorAgent();
    const result = await orchestrator.executeDailyWorkflow();
    
    expect(result.tweetPublished).toBe(true);
    expect(result.engagementTracked).toBe(true);
  });
});
```

### Load Testing
```typescript
describe('Performance Tests', () => {
  test('handles concurrent price requests', async () => {
    const requests = Array(10).fill().map(() => 
      dataAgent.fetchBitcoinPrice()
    );
    
    const results = await Promise.all(requests);
    expect(results).toHaveLength(10);
  });
});
```

## Deployment & Operations

### Environment Configuration
```typescript
interface Config {
  agents: {
    orchestrator: { maxConcurrentWorkflows: 3 };
    dataCollection: { fetchInterval: 900000 }; // 15 min
    analysis: { batchSize: 50 };
    content: { templatesPath: './templates' };
    social: { rateLimits: { tweets: 300, requests: 900 } };
  };
  
  apis: {
    alphaVantage: { baseUrl: string; key: string; rateLimit: 5 };
    twitter: { v2Endpoint: string; bearerToken: string };
    openai: { model: 'gpt-4o'; maxTokens: 4000 };
  };
}
```

### Monitoring & Alerting
```typescript
class HealthMonitor {
  async checkAgentHealth(): Promise<HealthStatus> {
    const agents = await this.getAllAgents();
    const health = await Promise.all(
      agents.map(agent => agent.healthCheck())
    );
    
    return this.aggregateHealth(health);
  }
  
  async setupAlerts(): Promise<void> {
    // Price fetch failures
    // Sentiment analysis errors
    // Tweet publishing issues
    // High error rates
  }
}
```

## Success Metrics & KPIs

### Technical Metrics
- **Uptime**: > 99.5%
- **Response Time**: API calls < 2s, Analysis < 30s
- **Error Rate**: < 0.5% per agent
- **Data Freshness**: Price data < 15min, News < 2 hours

### Business Metrics  
- **Tweet Engagement**: > 3% engagement rate
- **Content Quality**: Sentiment accuracy > 85%
- **Audience Growth**: 10% monthly follower increase
- **Content Frequency**: 3-5 tweets/day, 100% uptime on daily summary

### Operational Metrics
- **Agent Coordination**: Workflow completion rate > 98%
- **Resource Usage**: Memory < 512MB, CPU < 70%
- **Cost Efficiency**: API costs < $100/month
- **Development Velocity**: Feature deployment < 1 day