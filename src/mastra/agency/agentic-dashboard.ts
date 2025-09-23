import express from 'express';
import path from 'path';
import { AgenticTestBench } from './agentic-test-bench';

/**
 * Web Dashboard for Agentic Test Bench Visualization
 * 
 * Provides a simple web interface for visualizing agent suggestions,
 * performance metrics, and collecting feedback.
 */
export class AgenticDashboard {
  private app: express.Application;
  private testBench: AgenticTestBench;
  private server: any;
  private port: number;

  constructor(port: number = 3001) {
    this.app = express();
    this.testBench = new AgenticTestBench();
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static(path.join(__dirname, 'dashboard-static')));
  }

  private setupRoutes(): void {
    // API Routes
    this.app.get('/api/status', this.handleStatus.bind(this));
    this.app.get('/api/visualization-data', this.handleVisualizationData.bind(this));
    this.app.get('/api/strategic-feedback', this.handleStrategicFeedback.bind(this));
    this.app.get('/api/suggestions', this.handleSuggestions.bind(this));
    this.app.post('/api/feedback', this.handleFeedbackSubmission.bind(this));
    this.app.post('/api/run-test', this.handleRunTest.bind(this));

    // Dashboard HTML
    this.app.get('/', this.handleDashboard.bind(this));
    this.app.get('/dashboard', this.handleDashboard.bind(this));
  }

  private async handleStatus(req: express.Request, res: express.Response): Promise<void> {
    try {
      const data = await this.testBench.generateVisualizationData();
      
      const status = {
        online: true,
        sessionId: data.sessionId,
        timestamp: data.timestamp,
        totalSuggestions: data.suggestions.length,
        totalTests: data.testResults.length,
        systemMetrics: data.systemMetrics.length > 0 ? data.systemMetrics[0] : null,
        memoryUsage: process.memoryUsage()
      };

      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  private async handleVisualizationData(req: express.Request, res: express.Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const data = await this.testBench.generateVisualizationData();
      
      // Limit suggestions for performance
      data.suggestions = data.suggestions.slice(0, limit);
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  private async handleStrategicFeedback(req: express.Request, res: express.Response): Promise<void> {
    try {
      const feedback = await this.testBench.generateStrategicFeedback();
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  private async handleSuggestions(req: express.Request, res: express.Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await this.testBench.generateVisualizationData();
      
      const suggestions = data.suggestions.slice(0, limit).map(s => ({
        ...s,
        data: typeof s.suggestion_data === 'string' ? JSON.parse(s.suggestion_data) : s.suggestion_data
      }));

      res.json({ suggestions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  private async handleFeedbackSubmission(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { suggestionId, feedback, score } = req.body;
      
      if (!suggestionId || !feedback || typeof score !== 'number') {
        res.status(400).json({ error: 'Missing required fields: suggestionId, feedback, score' });
        return;
      }

      if (score < 1 || score > 10) {
        res.status(400).json({ error: 'Score must be between 1 and 10' });
        return;
      }

      await this.testBench.collectHumanFeedback(parseInt(suggestionId), feedback, score);
      
      res.json({ success: true, message: 'Feedback collected successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  private async handleRunTest(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { testType, duration } = req.body;
      
      if (!testType) {
        res.status(400).json({ error: 'Test type is required' });
        return;
      }

      const testDuration = (duration || 60) * 1000; // Convert to milliseconds
      
      // Run test asynchronously
      this.testBench.runIncrementalTest(testType, testDuration)
        .then(result => {
          console.log(`✅ Test ${testType} completed via web API`);
        })
        .catch(error => {
          console.error(`❌ Test ${testType} failed via web API:`, error);
        });

      res.json({ 
        success: true, 
        message: `Test ${testType} started`,
        duration: testDuration / 1000
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  private handleDashboard(req: express.Request, res: express.Response): void {
    res.send(this.generateDashboardHTML());
  }

  private generateDashboardHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agentic Test Bench Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 2rem;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .card h2 {
            color: #4A5568;
            margin-bottom: 1rem;
            font-size: 1.3rem;
            border-bottom: 2px solid #E2E8F0;
            padding-bottom: 0.5rem;
        }
        
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .status-item {
            text-align: center;
            padding: 1rem;
            background: #F7FAFC;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .status-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #667eea;
        }
        
        .status-label {
            font-size: 0.9rem;
            color: #718096;
            margin-top: 0.25rem;
        }
        
        .suggestion-item {
            padding: 1rem;
            margin-bottom: 1rem;
            background: #F8F9FA;
            border-radius: 8px;
            border-left: 4px solid #28A745;
        }
        
        .suggestion-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .suggestion-agent {
            font-weight: bold;
            color: #495057;
        }
        
        .suggestion-type {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
        }
        
        .suggestion-metrics {
            display: flex;
            gap: 1rem;
            margin: 0.5rem 0;
            font-size: 0.9rem;
            color: #6C757D;
        }
        
        .suggestion-rationale {
            color: #495057;
            font-style: italic;
            margin-top: 0.5rem;
        }
        
        .feedback-form {
            display: none;
            margin-top: 1rem;
            padding: 1rem;
            background: #E8F4FD;
            border-radius: 6px;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        label {
            display: block;
            margin-bottom: 0.25rem;
            font-weight: 500;
            color: #495057;
        }
        
        input, textarea, select {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #CED4DA;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        
        textarea {
            resize: vertical;
            min-height: 80px;
        }
        
        .btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #5a6fd8;
        }
        
        .btn-secondary {
            background: #6C757D;
        }
        
        .btn-secondary:hover {
            background: #5a6268;
        }
        
        .btn-small {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
        }
        
        .controls {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        
        .controls h2 {
            margin-bottom: 1rem;
            color: #4A5568;
        }
        
        .control-row {
            display: flex;
            gap: 1rem;
            align-items: end;
            flex-wrap: wrap;
        }
        
        .auto-refresh {
            margin-top: 1rem;
            padding: 1rem;
            background: #F0F8FF;
            border-radius: 6px;
            border: 1px solid #B0D4F1;
        }
        
        .loading {
            text-align: center;
            padding: 2rem;
            color: #6C757D;
            font-style: italic;
        }
        
        .error {
            background: #F8D7DA;
            color: #721C24;
            padding: 1rem;
            border-radius: 6px;
            margin: 1rem 0;
        }
        
        .success {
            background: #D4EDDA;
            color: #155724;
            padding: 1rem;
            border-radius: 6px;
            margin: 1rem 0;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            
            .control-row {
                flex-direction: column;
                align-items: stretch;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Agentic Test Bench</h1>
            <p>True Autonomous Intelligence Dashboard</p>
        </div>

        <div class="controls">
            <h2>Test Controls</h2>
            <div class="control-row">
                <div class="form-group">
                    <label for="testType">Test Type:</label>
                    <select id="testType">
                        <option value="autonomous-decision">Autonomous Decision</option>
                        <option value="strategic-oversight">Strategic Oversight</option>
                        <option value="alpha-discovery">Alpha Discovery</option>
                        <option value="inter-agent-communication">Inter-Agent Communication</option>
                        <option value="learning-adaptation">Learning Adaptation</option>
                        <option value="full-system">Full System</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="testDuration">Duration (seconds):</label>
                    <input type="number" id="testDuration" value="60" min="10" max="3600">
                </div>
                <button class="btn" onclick="runTest()">🧪 Run Test</button>
                <button class="btn btn-secondary" onclick="refreshData()">🔄 Refresh</button>
            </div>
            
            <div class="auto-refresh">
                <label>
                    <input type="checkbox" id="autoRefresh" onchange="toggleAutoRefresh()">
                    Auto-refresh every 30 seconds
                </label>
            </div>
        </div>

        <div class="dashboard-grid">
            <div class="card">
                <h2>📊 System Status</h2>
                <div id="systemStatus">
                    <div class="loading">Loading system status...</div>
                </div>
            </div>

            <div class="card">
                <h2>🎯 Performance Metrics</h2>
                <div id="performanceMetrics">
                    <div class="loading">Loading performance data...</div>
                </div>
            </div>

            <div class="card">
                <h2>💡 Recent Suggestions</h2>
                <div id="recentSuggestions">
                    <div class="loading">Loading suggestions...</div>
                </div>
            </div>

            <div class="card">
                <h2>🧠 Strategic Feedback</h2>
                <div id="strategicFeedback">
                    <div class="loading">Loading strategic feedback...</div>
                </div>
            </div>
        </div>

        <div id="messageArea"></div>
    </div>

    <script>
        let autoRefreshInterval = null;

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            refreshData();
        });

        async function refreshData() {
            await Promise.all([
                loadSystemStatus(),
                loadPerformanceMetrics(),
                loadRecentSuggestions(),
                loadStrategicFeedback()
            ]);
        }

        async function loadSystemStatus() {
            try {
                const response = await fetch('/api/status');
                const status = await response.json();

                const html = \`
                    <div class="status-grid">
                        <div class="status-item">
                            <div class="status-value">\${status.online ? '🟢' : '🔴'}</div>
                            <div class="status-label">System</div>
                        </div>
                        <div class="status-item">
                            <div class="status-value">\${status.totalSuggestions}</div>
                            <div class="status-label">Suggestions</div>
                        </div>
                        <div class="status-item">
                            <div class="status-value">\${status.totalTests}</div>
                            <div class="status-label">Tests Run</div>
                        </div>
                        <div class="status-item">
                            <div class="status-value">\${(status.memoryUsage.heapUsed / 1024 / 1024).toFixed(1)}MB</div>
                            <div class="status-label">Memory</div>
                        </div>
                    </div>
                    <p style="margin-top: 1rem; color: #6C757D; font-size: 0.9rem;">
                        Session: \${status.sessionId}<br>
                        Last Update: \${new Date(status.timestamp).toLocaleString()}
                    </p>
                \`;

                document.getElementById('systemStatus').innerHTML = html;
            } catch (error) {
                document.getElementById('systemStatus').innerHTML = \`<div class="error">Error loading system status: \${error.message}</div>\`;
            }
        }

        async function loadPerformanceMetrics() {
            try {
                const response = await fetch('/api/visualization-data');
                const data = await response.json();

                let html = '<div class="status-grid">';
                
                if (data.feedbackSummary) {
                    html += \`
                        <div class="status-item">
                            <div class="status-value">\${(data.feedbackSummary.avg_score || 0).toFixed(1)}/10</div>
                            <div class="status-label">Avg Score</div>
                        </div>
                        <div class="status-item">
                            <div class="status-value">\${data.feedbackSummary.high_score_count || 0}</div>
                            <div class="status-label">High Scores</div>
                        </div>
                    \`;
                }

                if (data.alphaStats) {
                    html += \`
                        <div class="status-item">
                            <div class="status-value">\${data.alphaStats.total_discoveries || 0}</div>
                            <div class="status-label">Alpha Discoveries</div>
                        </div>
                        <div class="status-item">
                            <div class="status-value">\${(data.alphaStats.avg_confidence || 0).toFixed(2)}</div>
                            <div class="status-label">Avg Confidence</div>
                        </div>
                    \`;
                }

                html += '</div>';

                if (data.topPerformingAgents && data.topPerformingAgents.length > 0) {
                    html += '<h3 style="margin-top: 1rem; margin-bottom: 0.5rem;">🏆 Top Performers</h3>';
                    data.topPerformingAgents.forEach(agent => {
                        html += \`<div style="margin-bottom: 0.5rem;">
                            <strong>\${agent.agent_id}</strong>: \${agent.avg_feedback_score.toFixed(2)}/10
                        </div>\`;
                    });
                }

                document.getElementById('performanceMetrics').innerHTML = html;
            } catch (error) {
                document.getElementById('performanceMetrics').innerHTML = \`<div class="error">Error loading performance metrics: \${error.message}</div>\`;
            }
        }

        async function loadRecentSuggestions() {
            try {
                const response = await fetch('/api/suggestions?limit=5');
                const data = await response.json();

                if (!data.suggestions || data.suggestions.length === 0) {
                    document.getElementById('recentSuggestions').innerHTML = '<div class="loading">No suggestions yet. Run some tests!</div>';
                    return;
                }

                let html = '';
                data.suggestions.forEach(suggestion => {
                    html += \`
                        <div class="suggestion-item">
                            <div class="suggestion-header">
                                <span class="suggestion-agent">\${suggestion.agent_id}</span>
                                <span class="suggestion-type">\${suggestion.suggestion_type}</span>
                            </div>
                            <div class="suggestion-metrics">
                                <span>📊 Confidence: \${suggestion.confidence.toFixed(2)}</span>
                                <span>⚡ Urgency: \${suggestion.urgency}</span>
                                <span>🕒 \${new Date(suggestion.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div class="suggestion-rationale">\${suggestion.rationale}</div>
                            \${suggestion.feedback_score ? 
                                \`<div style="margin-top: 0.5rem; color: #28A745;">⭐ Score: \${suggestion.feedback_score}/10</div>\` :
                                \`<button class="btn btn-small" onclick="showFeedbackForm(\${suggestion.id})">💭 Add Feedback</button>\`
                            }
                            <div id="feedback-\${suggestion.id}" class="feedback-form">
                                <div class="form-group">
                                    <label>Feedback:</label>
                                    <textarea id="feedback-text-\${suggestion.id}" placeholder="Your feedback..."></textarea>
                                </div>
                                <div class="form-group">
                                    <label>Score (1-10):</label>
                                    <input type="number" id="feedback-score-\${suggestion.id}" min="1" max="10" value="5">
                                </div>
                                <button class="btn btn-small" onclick="submitFeedback(\${suggestion.id})">Submit</button>
                                <button class="btn btn-secondary btn-small" onclick="hideFeedbackForm(\${suggestion.id})">Cancel</button>
                            </div>
                        </div>
                    \`;
                });

                document.getElementById('recentSuggestions').innerHTML = html;
            } catch (error) {
                document.getElementById('recentSuggestions').innerHTML = \`<div class="error">Error loading suggestions: \${error.message}</div>\`;
            }
        }

        async function loadStrategicFeedback() {
            try {
                const response = await fetch('/api/strategic-feedback');
                const feedback = await response.json();

                let html = \`
                    <div class="status-item" style="margin-bottom: 1rem;">
                        <div class="status-value">\${(feedback.overallPerformance * 100).toFixed(1)}%</div>
                        <div class="status-label">Overall Performance</div>
                    </div>
                \`;

                if (feedback.actionPriorities && feedback.actionPriorities.length > 0) {
                    html += '<h3>📋 Action Priorities</h3>';
                    feedback.actionPriorities.forEach(action => {
                        html += \`
                            <div style="margin: 0.5rem 0; padding: 0.5rem; background: #F8F9FA; border-radius: 4px;">
                                <strong>\${action.priority}. [\${action.urgency.toUpperCase()}]</strong><br>
                                \${action.action}<br>
                                <small>Impact: \${action.expectedImpact} | Timeframe: \${action.timeframe}</small>
                            </div>
                        \`;
                    });
                }

                if (feedback.emergentInsights && feedback.emergentInsights.length > 0) {
                    html += '<h3 style="margin-top: 1rem;">🧠 Insights</h3>';
                    feedback.emergentInsights.forEach(insight => {
                        html += \`
                            <div style="margin: 0.5rem 0; padding: 0.5rem; background: #E8F4FD; border-radius: 4px;">
                                <strong>[\${insight.significance.toUpperCase()}]</strong> \${insight.description}
                            </div>
                        \`;
                    });
                }

                document.getElementById('strategicFeedback').innerHTML = html;
            } catch (error) {
                document.getElementById('strategicFeedback').innerHTML = \`<div class="error">Error loading strategic feedback: \${error.message}</div>\`;
            }
        }

        async function runTest() {
            const testType = document.getElementById('testType').value;
            const duration = parseInt(document.getElementById('testDuration').value);

            showMessage(\`🧪 Starting \${testType} test for \${duration} seconds...\`, 'success');

            try {
                const response = await fetch('/api/run-test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ testType, duration })
                });

                const result = await response.json();
                
                if (result.success) {
                    showMessage(\`✅ Test started successfully! Duration: \${result.duration}s\`, 'success');
                    // Auto-refresh after test duration + buffer
                    setTimeout(() => refreshData(), (duration + 5) * 1000);
                } else {
                    showMessage(\`❌ Test failed: \${result.error}\`, 'error');
                }
            } catch (error) {
                showMessage(\`❌ Error starting test: \${error.message}\`, 'error');
            }
        }

        function showFeedbackForm(suggestionId) {
            document.getElementById(\`feedback-\${suggestionId}\`).style.display = 'block';
        }

        function hideFeedbackForm(suggestionId) {
            document.getElementById(\`feedback-\${suggestionId}\`).style.display = 'none';
        }

        async function submitFeedback(suggestionId) {
            const feedback = document.getElementById(\`feedback-text-\${suggestionId}\`).value;
            const score = parseInt(document.getElementById(\`feedback-score-\${suggestionId}\`).value);

            if (!feedback.trim()) {
                showMessage('Please enter feedback text', 'error');
                return;
            }

            try {
                const response = await fetch('/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ suggestionId, feedback, score })
                });

                const result = await response.json();
                
                if (result.success) {
                    showMessage('✅ Feedback submitted successfully!', 'success');
                    hideFeedbackForm(suggestionId);
                    await loadRecentSuggestions(); // Refresh suggestions
                } else {
                    showMessage(\`❌ Error submitting feedback: \${result.error}\`, 'error');
                }
            } catch (error) {
                showMessage(\`❌ Error submitting feedback: \${error.message}\`, 'error');
            }
        }

        function toggleAutoRefresh() {
            const checkbox = document.getElementById('autoRefresh');
            
            if (checkbox.checked) {
                autoRefreshInterval = setInterval(refreshData, 30000);
                showMessage('🔄 Auto-refresh enabled (30s)', 'success');
            } else {
                if (autoRefreshInterval) {
                    clearInterval(autoRefreshInterval);
                    autoRefreshInterval = null;
                }
                showMessage('⏸️ Auto-refresh disabled', 'success');
            }
        }

        function showMessage(message, type) {
            const messageArea = document.getElementById('messageArea');
            const messageDiv = document.createElement('div');
            messageDiv.className = type;
            messageDiv.textContent = message;
            
            messageArea.appendChild(messageDiv);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 5000);
        }
    </script>
</body>
</html>
    `;
  }

  async initialize(): Promise<void> {
    try {
      console.log('🌐 Initializing Agentic Dashboard...');
      await this.testBench.initialize();
      console.log('✅ Dashboard initialized successfully');
    } catch (error) {
      console.error('❌ Dashboard initialization failed:', error);
      throw error;
    }
  }

  async start(): Promise<void> {
    try {
      await this.initialize();
      
      this.server = this.app.listen(this.port, () => {
        console.log(`🚀 Agentic Dashboard running at http://localhost:${this.port}`);
        console.log(`📊 Access the dashboard at http://localhost:${this.port}/dashboard`);
      });

    } catch (error) {
      console.error('❌ Failed to start dashboard:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(async () => {
          await this.testBench.shutdown();
          console.log('🔒 Dashboard stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Start dashboard if called directly
if (require.main === module) {
  const dashboard = new AgenticDashboard();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n⚡ Received interrupt signal...');
    await dashboard.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n⚡ Received termination signal...');
    await dashboard.stop();
    process.exit(0);
  });

  dashboard.start().catch((error) => {
    console.error('❌ Dashboard startup failed:', error);
    process.exit(1);
  });
}