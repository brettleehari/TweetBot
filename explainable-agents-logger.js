/**
 * 🧠 EXPLAINABLE AGENTS DECISION LOGGER
 * 
 * Logs agent decisions in JSON format for analytics and UI display
 * Supports both file-based logging (dev) and database storage (production)
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ExplainableAgentsLogger {
    constructor(options = {}) {
        this.logFile = options.logFile || path.join(__dirname, 'logs', 'agent-decisions.jsonl');
        this.useDatabase = options.useDatabase || false;
        this.database = options.database || null;
        this.maxLogSize = options.maxLogSize || 100 * 1024 * 1024; // 100MB
        this.rotationEnabled = options.rotationEnabled || true;
        
        // Ensure logs directory exists
        this.initializeLogging();
    }

    async initializeLogging() {
        try {
            const logsDir = path.dirname(this.logFile);
            await fs.mkdir(logsDir, { recursive: true });
            console.log(`📝 Explainable Agents Logger initialized: ${this.logFile}`);
        } catch (error) {
            console.error('❌ Failed to initialize logging:', error);
        }
    }

    /**
     * 🧠 Log agent decision with full context
     */
    async logDecision(agentName, decisionData) {
        const timestamp = new Date().toISOString();
        const decisionId = this.generateDecisionId();
        
        const logEntry = {
            id: decisionId,
            timestamp: timestamp,
            agent: agentName,
            type: decisionData.type || 'unknown',
            
            // Decision Context
            context: {
                trigger: decisionData.trigger || 'autonomous',
                inputs: decisionData.inputs || {},
                systemState: decisionData.systemState || {},
                marketConditions: decisionData.marketConditions || {}
            },
            
            // Decision Process
            reasoning: {
                analysis: decisionData.analysis || 'No analysis provided',
                alternatives: decisionData.alternatives || [],
                selectedOption: decisionData.selectedOption || null,
                confidence: decisionData.confidence || 0,
                riskAssessment: decisionData.riskAssessment || 'low'
            },
            
            // Decision Outcome
            outcome: {
                action: decisionData.action || 'no action',
                parameters: decisionData.parameters || {},
                expectedResult: decisionData.expectedResult || 'unknown',
                actualResult: decisionData.actualResult || null, // filled later
                success: decisionData.success || null // filled later
            },
            
            // Agent State
            agentState: {
                autonomyLevel: decisionData.autonomyLevel || 0,
                learningRate: decisionData.learningRate || 0,
                performanceScore: decisionData.performanceScore || 0,
                goals: decisionData.goals || []
            },
            
            // System Integration
            system: {
                cycleId: decisionData.cycleId || null,
                coordinatorDecision: decisionData.coordinatorDecision || null,
                interAgentCommunication: decisionData.interAgentCommunication || [],
                emergentBehaviors: decisionData.emergentBehaviors || []
            },
            
            // Feedback & Learning
            feedback: {
                humanFeedback: null, // for future human input
                systemFeedback: decisionData.systemFeedback || null,
                learningAdjustments: decisionData.learningAdjustments || [],
                futureConsiderations: decisionData.futureConsiderations || []
            }
        };

        try {
            // Log to file (JSONL format for easy parsing)
            await this.logToFile(logEntry);
            
            // Log to database if enabled
            if (this.useDatabase && this.database) {
                await this.logToDatabase(logEntry);
            }
            
            console.log(`📝 ${agentName} decision logged: ${decisionData.type} (ID: ${decisionId})`);
            return decisionId;
            
        } catch (error) {
            console.error(`❌ Failed to log decision for ${agentName}:`, error);
            return null;
        }
    }

    /**
     * 📄 Log to JSON Lines file
     */
    async logToFile(logEntry) {
        try {
            // Check file size and rotate if needed
            if (this.rotationEnabled) {
                await this.rotateLogIfNeeded();
            }
            
            const logLine = JSON.stringify(logEntry) + '\n';
            await fs.appendFile(this.logFile, logLine, 'utf8');
            
        } catch (error) {
            console.error('❌ Failed to write to log file:', error);
            throw error;
        }
    }

    /**
     * 🗄️ Log to database (for production)
     */
    async logToDatabase(logEntry) {
        if (!this.database) return;
        
        try {
            const query = `
                INSERT INTO agent_decisions (
                    id, timestamp, agent, type, context, reasoning, 
                    outcome, agent_state, system, feedback
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            await this.database.run(query, [
                logEntry.id,
                logEntry.timestamp,
                logEntry.agent,
                logEntry.type,
                JSON.stringify(logEntry.context),
                JSON.stringify(logEntry.reasoning),
                JSON.stringify(logEntry.outcome),
                JSON.stringify(logEntry.agentState),
                JSON.stringify(logEntry.system),
                JSON.stringify(logEntry.feedback)
            ]);
            
        } catch (error) {
            console.error('❌ Failed to write to database:', error);
            throw error;
        }
    }

    /**
     * 🔄 Update decision outcome (after execution)
     */
    async updateDecisionOutcome(decisionId, outcomeData) {
        try {
            if (this.useDatabase && this.database) {
                const query = `
                    UPDATE agent_decisions 
                    SET outcome = json_patch(outcome, ?)
                    WHERE id = ?
                `;
                await this.database.run(query, [JSON.stringify(outcomeData), decisionId]);
            }
            
            console.log(`✅ Decision outcome updated: ${decisionId}`);
            
        } catch (error) {
            console.error(`❌ Failed to update decision outcome:`, error);
        }
    }

    /**
     * 📊 Get decisions for analytics
     */
    async getDecisions(filters = {}) {
        try {
            if (this.useDatabase && this.database) {
                return await this.getDecisionsFromDatabase(filters);
            } else {
                return await this.getDecisionsFromFile(filters);
            }
        } catch (error) {
            console.error('❌ Failed to retrieve decisions:', error);
            return [];
        }
    }

    /**
     * 📄 Get decisions from file
     */
    async getDecisionsFromFile(filters = {}) {
        try {
            const content = await fs.readFile(this.logFile, 'utf8');
            const lines = content.trim().split('\n').filter(line => line.trim());
            
            let decisions = lines.map(line => JSON.parse(line));
            
            // Apply filters
            if (filters.agent) {
                decisions = decisions.filter(d => d.agent === filters.agent);
            }
            if (filters.type) {
                decisions = decisions.filter(d => d.type === filters.type);
            }
            if (filters.since) {
                decisions = decisions.filter(d => new Date(d.timestamp) >= new Date(filters.since));
            }
            if (filters.limit) {
                decisions = decisions.slice(-filters.limit);
            }
            
            return decisions;
            
        } catch (error) {
            console.error('❌ Failed to read decisions from file:', error);
            return [];
        }
    }

    /**
     * 🗄️ Get decisions from database
     */
    async getDecisionsFromDatabase(filters = {}) {
        if (!this.database) return [];
        
        try {
            let query = 'SELECT * FROM agent_decisions WHERE 1=1';
            const params = [];
            
            if (filters.agent) {
                query += ' AND agent = ?';
                params.push(filters.agent);
            }
            if (filters.type) {
                query += ' AND type = ?';
                params.push(filters.type);
            }
            if (filters.since) {
                query += ' AND timestamp >= ?';
                params.push(filters.since);
            }
            
            query += ' ORDER BY timestamp DESC';
            
            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(filters.limit);
            }
            
            const rows = await this.database.all(query, params);
            
            // Parse JSON fields
            return rows.map(row => ({
                ...row,
                context: JSON.parse(row.context),
                reasoning: JSON.parse(row.reasoning),
                outcome: JSON.parse(row.outcome),
                agent_state: JSON.parse(row.agent_state),
                system: JSON.parse(row.system),
                feedback: JSON.parse(row.feedback)
            }));
            
        } catch (error) {
            console.error('❌ Failed to retrieve decisions from database:', error);
            return [];
        }
    }

    /**
     * 📈 Get decision analytics
     */
    async getAnalytics(timeframe = '24h') {
        const decisions = await this.getDecisions({ 
            since: this.getTimeframeCutoff(timeframe) 
        });
        
        return {
            totalDecisions: decisions.length,
            decisionsByAgent: this.groupBy(decisions, 'agent'),
            decisionsByType: this.groupBy(decisions, 'type'),
            averageConfidence: this.calculateAverageConfidence(decisions),
            successRate: this.calculateSuccessRate(decisions),
            emergentBehaviors: this.analyzeEmergentBehaviors(decisions),
            learningTrends: this.analyzeLearningTrends(decisions)
        };
    }

    /**
     * 🔧 Utility functions
     */
    generateDecisionId() {
        return `dec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getTimeframeCutoff(timeframe) {
        const now = new Date();
        switch (timeframe) {
            case '1h': return new Date(now - 60 * 60 * 1000);
            case '24h': return new Date(now - 24 * 60 * 60 * 1000);
            case '7d': return new Date(now - 7 * 24 * 60 * 60 * 1000);
            default: return new Date(now - 24 * 60 * 60 * 1000);
        }
    }

    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key] || 'unknown';
            groups[group] = (groups[group] || 0) + 1;
            return groups;
        }, {});
    }

    calculateAverageConfidence(decisions) {
        const confidences = decisions
            .map(d => d.reasoning?.confidence || 0)
            .filter(c => c > 0);
        return confidences.length > 0 
            ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length 
            : 0;
    }

    calculateSuccessRate(decisions) {
        const completedDecisions = decisions.filter(d => d.outcome?.success !== null);
        const successfulDecisions = completedDecisions.filter(d => d.outcome?.success === true);
        return completedDecisions.length > 0 
            ? successfulDecisions.length / completedDecisions.length 
            : 0;
    }

    analyzeEmergentBehaviors(decisions) {
        const behaviors = decisions.flatMap(d => d.system?.emergentBehaviors || []);
        return this.groupBy(behaviors, 'type');
    }

    analyzeLearningTrends(decisions) {
        return decisions
            .filter(d => d.agentState?.learningRate)
            .map(d => ({
                timestamp: d.timestamp,
                agent: d.agent,
                learningRate: d.agentState.learningRate,
                performanceScore: d.agentState.performanceScore
            }));
    }

    async rotateLogIfNeeded() {
        try {
            const stats = await fs.stat(this.logFile);
            if (stats.size > this.maxLogSize) {
                const rotatedFile = `${this.logFile}.${Date.now()}`;
                await fs.rename(this.logFile, rotatedFile);
                console.log(`📁 Log rotated: ${rotatedFile}`);
            }
        } catch (error) {
            // File doesn't exist yet, that's fine
        }
    }
}

export default ExplainableAgentsLogger;
