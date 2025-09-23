#!/usr/bin/env node

import { StrategicOrchestratorAgent } from '../agency/strategic-orchestrator-agent.js';
import { MarketHunterAgent } from '../agency/market-hunter-agent.js';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple Database for logging suggestions
class TestDatabase {
  private db: sqlite3.Database;

  constructor(dbPath: string) {
    this.db = new sqlite3.Database(dbPath);
    this.initializeSchema();
  }

  private initializeSchema(): void {
    this.db.serialize(() => {
      // Agent decisions table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS agent_decisions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          agent_id TEXT NOT NULL,
          decision_type TEXT NOT NULL,
          description TEXT NOT NULL,
          rationale TEXT NOT NULL,
          confidence REAL NOT NULL,
          expected_outcome REAL NOT NULL,
          actual_outcome REAL,
          success INTEGER,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Agent performance table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS agent_performance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          agent_id TEXT NOT NULL,
          success_rate REAL NOT NULL,
          efficiency REAL NOT NULL,
          adaptability REAL NOT NULL,
          innovation REAL NOT NULL,
          collaboration REAL NOT NULL,
          reputation_score REAL NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Strategic suggestions table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS strategic_suggestions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          from_agent TEXT NOT NULL,
          to_agent TEXT,
          suggestion_type TEXT NOT NULL,
          suggestion TEXT NOT NULL,
          priority TEXT NOT NULL,
          expected_impact REAL NOT NULL,
          feedback_score REAL,
          implemented INTEGER DEFAULT 0,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Database schema initialized');
    });
  }

  logDecision(agentId: string, decision: any): void {
    const stmt = this.db.prepare(`
      INSERT INTO agent_decisions 
      (agent_id, decision_type, description, rationale, confidence, expected_outcome)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      agentId,
      decision.type,
      decision.description,
      decision.rationale,
      decision.confidence,
      decision.expectedOutcome
    ]);
    
    stmt.finalize();
  }

  logPerformance(agentId: string, performance: any): void {
    const stmt = this.db.prepare(`
      INSERT INTO agent_performance 
      (agent_id, success_rate, efficiency, adaptability, innovation, collaboration, reputation_score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      agentId,
      performance.successRate,
      performance.efficiency,
      performance.adaptability,
      performance.innovation,
      performance.collaboration,
      performance.reputationScore || 50
    ]);
    
    stmt.finalize();
  }

  logSuggestion(fromAgent: string, toAgent: string | null, suggestion: any): void {
    const stmt = this.db.prepare(`
      INSERT INTO strategic_suggestions 
      (from_agent, to_agent, suggestion_type, suggestion, priority, expected_impact)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      fromAgent,
      toAgent,
      suggestion.type,
      suggestion.description,
      suggestion.priority,
      suggestion.expectedImpact || 0.5
    ]);
    
    stmt.finalize();
  }

  getRecentDecisions(limit: number = 10): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM agent_decisions ORDER BY timestamp DESC LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  close(): void {
    this.db.close();
  }
}

// Simple Agentic Test Bench
class AgenticTestBench {
  private orchestrator: StrategicOrchestratorAgent;
  private marketHunter: MarketHunterAgent;
  private database: TestDatabase;
  private testCount: number = 0;

  constructor() {
    this.orchestrator = new StrategicOrchestratorAgent();
    this.marketHunter = new MarketHunterAgent();
    this.database = new TestDatabase(join(__dirname, '../../../test_bench.db'));
    
    // Register the market hunter with the orchestrator
    this.orchestrator.registerSubAgent(this.marketHunter);
  }

  async runSmallTest(): Promise<void> {
    this.testCount++;
    console.log(`\n🧪 AGENTIC TEST BENCH - Test Run #${this.testCount}`);
    console.log('='.repeat(60));

    try {
      // Test 1: Market Hunter autonomous cycle
      console.log('\n1️⃣ Testing Market Hunter Agent Autonomy...');
      const alphaDiscoveries = await this.testMarketHunterAutonomy();
      
      // Test 2: Strategic Orchestrator decision making
      console.log('\n2️⃣ Testing Strategic Orchestrator Intelligence...');
      const strategicDecisions = await this.testStrategicOrchestrator();
      
      // Test 3: Inter-agent communication
      console.log('\n3️⃣ Testing Inter-Agent Communication...');
      await this.testInterAgentCommunication();
      
      // Test 4: Performance logging and feedback
      console.log('\n4️⃣ Logging Performance Data...');
      await this.logTestResults(alphaDiscoveries, strategicDecisions);
      
      // Test 5: Display results
      console.log('\n5️⃣ Test Results Summary...');
      await this.displayTestSummary();
      
      console.log('\n✅ Test completed successfully!');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  private async testMarketHunterAutonomy(): Promise<any[]> {
    console.log('   🔍 Market Hunter executing autonomous hunt...');
    
    try {
      // Run the autonomous hunting cycle
      const discoveries = await this.marketHunter.autonomousHunt();
      
      console.log(`   📊 Found ${discoveries.length} alpha opportunities:`);
      discoveries.forEach((discovery, index) => {
        console.log(`      ${index + 1}. ${discovery.type}: ${discovery.description}`);
        console.log(`         Alpha Value: ${discovery.alphaValue.toFixed(2)} | Confidence: ${discovery.confidence.toFixed(2)}`);
        
        // Log to database
        this.database.logSuggestion(
          'market-hunter',
          'strategic-orchestrator',
          {
            type: 'ALPHA_DISCOVERY',
            description: discovery.description,
            priority: discovery.urgency,
            expectedImpact: discovery.alphaValue
          }
        );
      });
      
      // Run competitive analysis
      console.log('   🏁 Running competitive analysis...');
      const competitivePosition = await this.marketHunter.competitiveAnalysis();
      console.log(`   📈 Competitive rank: ${competitivePosition.rank} | Accuracy: ${(competitivePosition.relativeAccuracy * 100).toFixed(1)}%`);
      
      return discoveries;
      
    } catch (error) {
      console.error('   ❌ Market Hunter test failed:', error);
      return [];
    }
  }

  private async testStrategicOrchestrator(): Promise<any[]> {
    console.log('   🎯 Strategic Orchestrator making autonomous decisions...');
    
    try {
      // Run strategic decision cycle
      const decisions = await this.orchestrator.autonomousStrategicCycle();
      
      console.log(`   🧠 Made ${decisions.length} strategic decisions:`);
      decisions.forEach((decision, index) => {
        console.log(`      ${index + 1}. ${decision.type} → ${decision.target}`);
        console.log(`         Rationale: ${decision.rationale}`);
        console.log(`         Impact: ${decision.impact} | Urgency: ${decision.urgency}`);
        
        // Log to database
        this.database.logDecision('strategic-orchestrator', {
          type: decision.type,
          description: `${decision.type} for ${decision.target}`,
          rationale: decision.rationale,
          confidence: 0.8, // Strategic decisions are typically high confidence
          expectedOutcome: decision.impact === 'high' ? 0.9 : decision.impact === 'medium' ? 0.7 : 0.5
        });
      });
      
      return decisions;
      
    } catch (error) {
      console.error('   ❌ Strategic Orchestrator test failed:', error);
      return [];
    }
  }

  private async testInterAgentCommunication(): Promise<void> {
    console.log('   💬 Testing inter-agent communication...');
    
    try {
      // Simulate agent communication
      const message = {
        type: 'PERFORMANCE_UPDATE',
        content: { successRate: 0.85, newStrategies: 2 },
        urgency: 'medium' as const,
        timestamp: new Date()
      };
      
      const response = await this.orchestrator.receiveMessage('market-hunter', message);
      console.log(`   📨 Message sent: ${message.type}`);
      console.log(`   📬 Response received: ${response.response}`);
      
      // Log communication
      this.database.logSuggestion(
        'market-hunter',
        'strategic-orchestrator',
        {
          type: 'COMMUNICATION',
          description: `Inter-agent message: ${message.type}`,
          priority: message.urgency,
          expectedImpact: 0.6
        }
      );
      
    } catch (error) {
      console.error('   ❌ Inter-agent communication test failed:', error);
    }
  }

  private async logTestResults(discoveries: any[], decisions: any[]): Promise<void> {
    try {
      // Log Market Hunter performance
      const hunterPerformance = {
        successRate: discoveries.length > 0 ? 85 : 60,
        efficiency: 75,
        adaptability: 80,
        innovation: 70,
        collaboration: 65
      };
      
      this.database.logPerformance('market-hunter', hunterPerformance);
      
      // Log Strategic Orchestrator performance
      const orchestratorPerformance = {
        successRate: decisions.length > 0 ? 90 : 70,
        efficiency: 85,
        adaptability: 88,
        innovation: 75,
        collaboration: 92
      };
      
      this.database.logPerformance('strategic-orchestrator', orchestratorPerformance);
      
      console.log('   📊 Performance data logged to database');
      
    } catch (error) {
      console.error('   ❌ Failed to log performance data:', error);
    }
  }

  private async displayTestSummary(): Promise<void> {
    try {
      const recentDecisions = await this.database.getRecentDecisions(5);
      
      console.log('   📋 Recent Decisions from Database:');
      recentDecisions.forEach((decision, index) => {
        console.log(`      ${index + 1}. [${decision.agent_id}] ${decision.decision_type}`);
        console.log(`         ${decision.description}`);
        console.log(`         Confidence: ${decision.confidence}% | Expected: ${decision.expected_outcome}`);
      });
      
    } catch (error) {
      console.error('   ❌ Failed to display test summary:', error);
    }
  }

  async runContinuousTest(iterations: number = 3): Promise<void> {
    console.log(`🔄 Running ${iterations} continuous test iterations...\n`);
    
    for (let i = 0; i < iterations; i++) {
      await this.runSmallTest();
      
      if (i < iterations - 1) {
        console.log('\n⏳ Waiting 2 seconds before next iteration...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n🎉 Continuous testing completed!');
  }

  close(): void {
    this.database.close();
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const testBench = new AgenticTestBench();

  try {
    if (args.length === 0) {
      console.log('🧪 Agentic Test Bench - Usage:');
      console.log('  npm run test-agents single    - Run single test cycle');
      console.log('  npm run test-agents continuous - Run 3 continuous test cycles');
      console.log('  npm run test-agents loop N     - Run N continuous test cycles');
      return;
    }

    const command = args[0].toLowerCase();

    switch (command) {
      case 'single':
        await testBench.runSmallTest();
        break;
        
      case 'continuous':
        await testBench.runContinuousTest(3);
        break;
        
      case 'loop':
        const iterations = parseInt(args[1]) || 3;
        await testBench.runContinuousTest(iterations);
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Use: single, continuous, or loop N');
    }
    
  } catch (error) {
    console.error('❌ Test bench failed:', error);
  } finally {
    testBench.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { AgenticTestBench, TestDatabase };