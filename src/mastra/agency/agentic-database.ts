import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Database schema and management for agentic suggestions and feedback
export class AgenticDatabase {
  private db: Database | null = null;
  private dbPath: string;

  constructor(dbPath: string = './data/agentic_suggestions.db') {
    this.dbPath = dbPath;
  }

  async initialize(): Promise<void> {
    try {
      // Ensure data directory exists
      const dir = path.dirname(this.dbPath);
      const fs = await import('fs');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Open database connection
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });

      // Create tables
      await this.createTables();
      
      console.log('✅ Agentic database initialized:', this.dbPath);
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Agent suggestions table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_suggestions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        agent_id TEXT NOT NULL,
        suggestion_type TEXT NOT NULL,
        suggestion_data TEXT NOT NULL,
        confidence REAL NOT NULL,
        urgency TEXT NOT NULL,
        expected_value REAL,
        rationale TEXT,
        status TEXT DEFAULT 'pending',
        human_feedback TEXT,
        feedback_score INTEGER,
        execution_result TEXT,
        actual_outcome REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Agent performance tracking
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        agent_id TEXT NOT NULL,
        performance_metrics TEXT NOT NULL,
        goal_progress REAL,
        reputation_score REAL,
        autonomy_level REAL,
        decision_count INTEGER,
        success_rate REAL,
        adaptation_score REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // System metrics table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS system_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        overall_performance REAL,
        agent_count INTEGER,
        active_conflicts INTEGER,
        resolved_conflicts INTEGER,
        emergent_behaviors TEXT,
        strategic_decisions INTEGER,
        system_efficiency REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Alpha discoveries table (for Market Hunter)
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS alpha_discoveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        discovery_type TEXT NOT NULL,
        description TEXT NOT NULL,
        alpha_value REAL NOT NULL,
        confidence REAL NOT NULL,
        urgency TEXT NOT NULL,
        source TEXT NOT NULL,
        discovery_time DATETIME NOT NULL,
        expiration_time DATETIME,
        actionable_insight TEXT,
        supporting_data TEXT,
        validated BOOLEAN DEFAULT FALSE,
        validation_outcome REAL,
        market_impact REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Strategic decisions table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS strategic_decisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        decision_type TEXT NOT NULL,
        target_agent TEXT,
        rationale TEXT NOT NULL,
        impact TEXT NOT NULL,
        urgency TEXT NOT NULL,
        execution_plan TEXT,
        status TEXT DEFAULT 'planned',
        execution_result TEXT,
        success_rate REAL,
        lessons_learned TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Feedback and learning table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS feedback_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        source_type TEXT NOT NULL, -- 'human', 'system', 'agent'
        target_agent TEXT,
        feedback_type TEXT NOT NULL, -- 'suggestion_rating', 'performance_feedback', 'strategic_feedback'
        feedback_data TEXT NOT NULL,
        impact_score REAL,
        learning_applied BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('📊 Database tables created successfully');
  }

  // Agent suggestion logging
  async logAgentSuggestion(suggestion: AgentSuggestion): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.run(`
      INSERT INTO agent_suggestions (
        agent_id, suggestion_type, suggestion_data, confidence, urgency,
        expected_value, rationale, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      suggestion.agentId,
      suggestion.type,
      JSON.stringify(suggestion.data),
      suggestion.confidence,
      suggestion.urgency,
      suggestion.expectedValue,
      suggestion.rationale,
      'pending'
    ]);

    console.log(`📝 LOGGED: ${suggestion.agentId} suggestion (ID: ${result.lastID})`);
    return result.lastID!;
  }

  // Update suggestion with feedback
  async updateSuggestionFeedback(
    suggestionId: number, 
    feedback: string, 
    score: number,
    executionResult?: string,
    actualOutcome?: number
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      UPDATE agent_suggestions 
      SET human_feedback = ?, feedback_score = ?, execution_result = ?, 
          actual_outcome = ?, status = 'reviewed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [feedback, score, executionResult || null, actualOutcome || null, suggestionId]);

    console.log(`✅ FEEDBACK: Updated suggestion ${suggestionId} with score ${score}`);
  }

  // Log agent performance
  async logAgentPerformance(agentId: string, performance: AgentPerformanceLog): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      INSERT INTO agent_performance (
        agent_id, performance_metrics, goal_progress, reputation_score,
        autonomy_level, decision_count, success_rate, adaptation_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      agentId,
      JSON.stringify(performance.metrics),
      performance.goalProgress,
      performance.reputationScore,
      performance.autonomyLevel,
      performance.decisionCount,
      performance.successRate,
      performance.adaptationScore
    ]);
  }

  // Log system metrics
  async logSystemMetrics(metrics: SystemMetricsLog): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      INSERT INTO system_metrics (
        overall_performance, agent_count, active_conflicts, resolved_conflicts,
        emergent_behaviors, strategic_decisions, system_efficiency
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      metrics.overallPerformance,
      metrics.agentCount,
      metrics.activeConflicts,
      metrics.resolvedConflicts,
      JSON.stringify(metrics.emergentBehaviors),
      metrics.strategicDecisions,
      metrics.systemEfficiency
    ]);
  }

  // Log alpha discoveries
  async logAlphaDiscovery(discovery: AlphaDiscoveryLog): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.run(`
      INSERT INTO alpha_discoveries (
        discovery_type, description, alpha_value, confidence, urgency,
        source, discovery_time, expiration_time, actionable_insight,
        supporting_data, validated, validation_outcome, market_impact
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      discovery.type,
      discovery.description,
      discovery.alphaValue,
      discovery.confidence,
      discovery.urgency,
      discovery.source,
      discovery.discoveryTime.toISOString(),
      discovery.expirationTime?.toISOString() || null,
      discovery.actionableInsight,
      JSON.stringify(discovery.supportingData),
      discovery.validated || false,
      discovery.validationOutcome || null,
      discovery.marketImpact || null
    ]);

    return result.lastID!;
  }

  // Log strategic decisions
  async logStrategicDecision(decision: StrategicDecisionLog): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.run(`
      INSERT INTO strategic_decisions (
        decision_type, target_agent, rationale, impact, urgency,
        execution_plan, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      decision.type,
      decision.targetAgent || null,
      decision.rationale,
      decision.impact,
      decision.urgency,
      JSON.stringify(decision.executionPlan),
      'planned'
    ]);

    return result.lastID!;
  }

  // Log feedback for learning
  async logFeedback(feedback: FeedbackLog): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      INSERT INTO feedback_log (
        source_type, target_agent, feedback_type, feedback_data, impact_score
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      feedback.sourceType,
      feedback.targetAgent || null,
      feedback.type,
      JSON.stringify(feedback.data),
      feedback.impactScore || null
    ]);
  }

  // Query methods for visualization and analysis
  async getRecentSuggestions(limit: number = 50): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.all(`
      SELECT * FROM agent_suggestions 
      ORDER BY timestamp DESC 
      LIMIT ?
    `, [limit]);
  }

  async getAgentPerformanceHistory(agentId: string, days: number = 7): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.all(`
      SELECT * FROM agent_performance 
      WHERE agent_id = ? AND timestamp >= datetime('now', '-${days} days')
      ORDER BY timestamp DESC
    `, [agentId]);
  }

  async getSystemMetricsHistory(days: number = 7): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.all(`
      SELECT * FROM system_metrics 
      WHERE timestamp >= datetime('now', '-${days} days')
      ORDER BY timestamp DESC
    `);
  }

  async getAlphaDiscoveryStats(): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const stats = await this.db.get(`
      SELECT 
        COUNT(*) as total_discoveries,
        AVG(alpha_value) as avg_alpha_value,
        AVG(confidence) as avg_confidence,
        COUNT(CASE WHEN validated = 1 THEN 1 END) as validated_count,
        AVG(CASE WHEN validated = 1 THEN validation_outcome END) as avg_validation_outcome
      FROM alpha_discoveries
      WHERE timestamp >= datetime('now', '-7 days')
    `);

    return stats;
  }

  async getFeedbackSummary(): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const summary = await this.db.get(`
      SELECT 
        COUNT(*) as total_feedback,
        AVG(feedback_score) as avg_score,
        COUNT(CASE WHEN feedback_score >= 8 THEN 1 END) as high_score_count,
        COUNT(CASE WHEN feedback_score <= 5 THEN 1 END) as low_score_count
      FROM agent_suggestions
      WHERE feedback_score IS NOT NULL
        AND timestamp >= datetime('now', '-7 days')
    `);

    return summary;
  }

  // Analysis methods for strategic feedback
  async getTopPerformingAgents(limit: number = 5): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.all(`
      SELECT 
        agent_id,
        AVG(feedback_score) as avg_feedback_score,
        COUNT(*) as suggestion_count,
        AVG(confidence) as avg_confidence,
        AVG(expected_value) as avg_expected_value
      FROM agent_suggestions
      WHERE feedback_score IS NOT NULL
        AND timestamp >= datetime('now', '-7 days')
      GROUP BY agent_id
      ORDER BY avg_feedback_score DESC, suggestion_count DESC
      LIMIT ?
    `, [limit]);
  }

  async getUnderperformingAreas(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.all(`
      SELECT 
        suggestion_type,
        agent_id,
        AVG(feedback_score) as avg_score,
        COUNT(*) as count
      FROM agent_suggestions
      WHERE feedback_score IS NOT NULL
        AND feedback_score < 6
        AND timestamp >= datetime('now', '-7 days')
      GROUP BY suggestion_type, agent_id
      ORDER BY avg_score ASC, count DESC
    `);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      console.log('🔒 Database connection closed');
    }
  }
}

// Interfaces for type safety
export interface AgentSuggestion {
  agentId: string;
  type: string;
  data: any;
  confidence: number;
  urgency: 'low' | 'medium' | 'high';
  expectedValue?: number;
  rationale: string;
}

export interface AgentPerformanceLog {
  metrics: any;
  goalProgress: number;
  reputationScore: number;
  autonomyLevel: number;
  decisionCount: number;
  successRate: number;
  adaptationScore: number;
}

export interface SystemMetricsLog {
  overallPerformance: number;
  agentCount: number;
  activeConflicts: number;
  resolvedConflicts: number;
  emergentBehaviors: string[];
  strategicDecisions: number;
  systemEfficiency: number;
}

export interface AlphaDiscoveryLog {
  type: string;
  description: string;
  alphaValue: number;
  confidence: number;
  urgency: 'low' | 'medium' | 'high';
  source: string;
  discoveryTime: Date;
  expirationTime?: Date;
  actionableInsight: string;
  supportingData: any;
  validated?: boolean;
  validationOutcome?: number;
  marketImpact?: number;
}

export interface StrategicDecisionLog {
  type: string;
  targetAgent?: string;
  rationale: string;
  impact: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  executionPlan: string[];
}

export interface FeedbackLog {
  sourceType: 'human' | 'system' | 'agent';
  targetAgent?: string;
  type: 'suggestion_rating' | 'performance_feedback' | 'strategic_feedback';
  data: any;
  impactScore?: number;
}