#!/usr/bin/env node

/**
 * Live Dashboard - Real-time test execution monitoring
 * Based on mature project patterns with WebSocket integration
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

class LiveDashboard {
  constructor(options = {}) {
    this.port = options.port || 3000;
    this.wsPort = options.wsPort || 3001;
    this.reportsDir = options.reportsDir || path.join(__dirname, '../reports');
    this.outputDir = path.join(this.reportsDir, 'live');
    
    this.metrics = {
      startTime: new Date(),
      totalEndpoints: 239,
      categoriesTotal: 16,
      testResults: {
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0
      },
      coverage: {
        endpoints: 0,
        categories: 0,
        percentage: 0
      },
      performance: {
        averageResponseTime: 0,
        slowestEndpoint: null,
        fastestEndpoint: null,
        totalRequests: 0
      },
      currentExecution: {
        status: 'idle',
        currentTest: null,
        progress: 0,
        estimatedTimeRemaining: 0
      }
    };

    this.clients = new Set();
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.reportsDir, this.outputDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  generateDashboardHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Azion API V4 - Live Test Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
        }
        .container { 
            max-width: 1400px; 
            margin: 0 auto; 
            padding: 20px;
        }
        .header {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }
        .header h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }
        .status-running { background: #27ae60; }
        .status-idle { background: #95a5a6; }
        .status-error { background: #e74c3c; }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease;
        }
        .metric-card:hover {
            transform: translateY(-5px);
        }
        .metric-title {
            font-size: 1.1em;
            color: #7f8c8d;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .metric-subtitle {
            color: #95a5a6;
            font-size: 0.9em;
        }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #ecf0f1;
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #27ae60, #2ecc71);
            transition: width 0.5s ease;
        }
        .charts-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .chart-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }
        .test-log {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            max-height: 400px;
            overflow-y: auto;
        }
        .log-entry {
            padding: 8px 12px;
            margin: 5px 0;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        .log-success { background: #d5f4e6; color: #27ae60; }
        .log-error { background: #fdf2f2; color: #e74c3c; }
        .log-info { background: #e8f4fd; color: #3498db; }
        .log-warning { background: #fef9e7; color: #f39c12; }
        
        .endpoint-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .endpoint-card {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 10px;
            padding: 15px;
            border-left: 4px solid #3498db;
            transition: all 0.3s ease;
        }
        .endpoint-card.tested {
            border-left-color: #27ae60;
            background: rgba(212, 237, 218, 0.9);
        }
        .endpoint-card.failed {
            border-left-color: #e74c3c;
            background: rgba(248, 215, 218, 0.9);
        }
        
        @media (max-width: 768px) {
            .charts-section {
                grid-template-columns: 1fr;
            }
            .container {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                <span id="statusIndicator" class="status-indicator status-idle"></span>
                Azion API V4 Test Dashboard
            </h1>
            <p>Real-time monitoring of Cypress API test execution</p>
            <p id="lastUpdate">Last updated: <span id="timestamp">Never</span></p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-title">Test Results</div>
                <div class="metric-value" id="successRate">0%</div>
                <div class="metric-subtitle">
                    <span id="passedTests">0</span> passed / 
                    <span id="totalTests">0</span> total
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="successProgress" style="width: 0%"></div>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-title">API Coverage</div>
                <div class="metric-value" id="coveragePercentage">0%</div>
                <div class="metric-subtitle">
                    <span id="coveredEndpoints">0</span> / 
                    <span id="totalEndpoints">239</span> endpoints
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="coverageProgress" style="width: 0%"></div>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-title">Performance</div>
                <div class="metric-value" id="avgResponseTime">0ms</div>
                <div class="metric-subtitle">
                    Average response time
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-title">Current Status</div>
                <div class="metric-value" id="currentStatus">Idle</div>
                <div class="metric-subtitle" id="currentTest">
                    Waiting for test execution...
                </div>
            </div>
        </div>

        <div class="charts-section">
            <div class="chart-container">
                <h3>Test Results Distribution</h3>
                <canvas id="resultsChart" width="400" height="200"></canvas>
            </div>
            <div class="chart-container">
                <h3>Response Time Trends</h3>
                <canvas id="performanceChart" width="400" height="200"></canvas>
            </div>
        </div>

        <div class="test-log">
            <h3>Live Test Log</h3>
            <div id="logContainer">
                <div class="log-entry log-info">Dashboard initialized - waiting for test data...</div>
            </div>
        </div>

        <div class="endpoint-grid" id="endpointGrid">
            <!-- Endpoint cards will be populated dynamically -->
        </div>
    </div>

    <script>
        class DashboardClient {
            constructor() {
                this.ws = null;
                this.charts = {};
                this.reconnectAttempts = 0;
                this.maxReconnectAttempts = 5;
                this.init();
            }

            init() {
                this.initCharts();
                this.connectWebSocket();
                this.startHeartbeat();
            }

            connectWebSocket() {
                try {
                    this.ws = new WebSocket('ws://localhost:3001');
                    
                    this.ws.onopen = () => {
                        console.log('Connected to live dashboard');
                        this.reconnectAttempts = 0;
                        this.addLogEntry('Connected to live dashboard', 'success');
                    };

                    this.ws.onmessage = (event) => {
                        const data = JSON.parse(event.data);
                        this.updateDashboard(data);
                    };

                    this.ws.onclose = () => {
                        console.log('Disconnected from dashboard');
                        this.addLogEntry('Disconnected from dashboard', 'warning');
                        this.attemptReconnect();
                    };

                    this.ws.onerror = (error) => {
                        console.error('WebSocket error:', error);
                        this.addLogEntry('Connection error', 'error');
                    };
                } catch (error) {
                    console.error('Failed to connect:', error);
                    this.addLogEntry('Failed to connect to WebSocket', 'error');
                }
            }

            attemptReconnect() {
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    setTimeout(() => {
                        this.addLogEntry(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`, 'info');
                        this.connectWebSocket();
                    }, 2000 * this.reconnectAttempts);
                }
            }

            updateDashboard(data) {
                // Update metrics
                document.getElementById('successRate').textContent = 
                    data.testResults.total > 0 ? 
                    Math.round((data.testResults.passed / data.testResults.total) * 100) + '%' : '0%';
                
                document.getElementById('passedTests').textContent = data.testResults.passed;
                document.getElementById('totalTests').textContent = data.testResults.total;
                document.getElementById('coveredEndpoints').textContent = data.coverage.endpoints;
                document.getElementById('coveragePercentage').textContent = Math.round(data.coverage.percentage) + '%';
                document.getElementById('avgResponseTime').textContent = Math.round(data.performance.averageResponseTime) + 'ms';
                document.getElementById('currentStatus').textContent = data.currentExecution.status;
                document.getElementById('currentTest').textContent = data.currentExecution.currentTest || 'Waiting...';
                document.getElementById('timestamp').textContent = new Date().toLocaleTimeString();

                // Update progress bars
                const successRate = data.testResults.total > 0 ? (data.testResults.passed / data.testResults.total) * 100 : 0;
                document.getElementById('successProgress').style.width = successRate + '%';
                document.getElementById('coverageProgress').style.width = data.coverage.percentage + '%';

                // Update status indicator
                const indicator = document.getElementById('statusIndicator');
                indicator.className = 'status-indicator status-' + (data.currentExecution.status === 'running' ? 'running' : 'idle');

                // Update charts
                this.updateCharts(data);

                // Add log entry for significant events
                if (data.currentExecution.currentTest) {
                    this.addLogEntry(\`Running: \${data.currentExecution.currentTest}\`, 'info');
                }
            }

            initCharts() {
                // Results pie chart
                const resultsCtx = document.getElementById('resultsChart').getContext('2d');
                this.charts.results = new Chart(resultsCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Passed', 'Failed', 'Skipped'],
                        datasets: [{
                            data: [0, 0, 0],
                            backgroundColor: ['#27ae60', '#e74c3c', '#f39c12']
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });

                // Performance line chart
                const perfCtx = document.getElementById('performanceChart').getContext('2d');
                this.charts.performance = new Chart(perfCtx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Response Time (ms)',
                            data: [],
                            borderColor: '#3498db',
                            backgroundColor: 'rgba(52, 152, 219, 0.1)',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Response Time (ms)'
                                }
                            }
                        }
                    }
                });
            }

            updateCharts(data) {
                // Update results chart
                this.charts.results.data.datasets[0].data = [
                    data.testResults.passed,
                    data.testResults.failed,
                    data.testResults.skipped
                ];
                this.charts.results.update();

                // Update performance chart (simplified for demo)
                const now = new Date().toLocaleTimeString();
                if (this.charts.performance.data.labels.length > 20) {
                    this.charts.performance.data.labels.shift();
                    this.charts.performance.data.datasets[0].data.shift();
                }
                this.charts.performance.data.labels.push(now);
                this.charts.performance.data.datasets[0].data.push(data.performance.averageResponseTime);
                this.charts.performance.update();
            }

            addLogEntry(message, type = 'info') {
                const container = document.getElementById('logContainer');
                const entry = document.createElement('div');
                entry.className = \`log-entry log-\${type}\`;
                entry.textContent = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
                
                container.appendChild(entry);
                container.scrollTop = container.scrollHeight;

                // Keep only last 50 entries
                while (container.children.length > 50) {
                    container.removeChild(container.firstChild);
                }
            }

            startHeartbeat() {
                setInterval(() => {
                    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                        this.ws.send(JSON.stringify({ type: 'ping' }));
                    }
                }, 30000);
            }
        }

        // Initialize dashboard when page loads
        document.addEventListener('DOMContentLoaded', () => {
            new DashboardClient();
        });
    </script>
</body>
</html>`;
  }

  startServer() {
    // Create HTTP server for dashboard
    const server = http.createServer((req, res) => {
      if (req.url === '/' || req.url === '/dashboard') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(this.generateDashboardHTML());
      } else if (req.url === '/api/metrics') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(this.metrics));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });

    // Create WebSocket server
    const wss = new WebSocket.Server({ port: this.wsPort });
    
    wss.on('connection', (ws) => {
      console.log('📱 Client connected to live dashboard');
      this.clients.add(ws);
      
      // Send initial metrics
      ws.send(JSON.stringify(this.metrics));
      
      ws.on('close', () => {
        console.log('📱 Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        } catch (error) {
          console.error('Invalid message:', error);
        }
      });
    });

    server.listen(this.port, () => {
      console.log(`🚀 Live Dashboard started:`);
      console.log(`   📊 Dashboard: http://localhost:${this.port}`);
      console.log(`   🔌 WebSocket: ws://localhost:${this.wsPort}`);
    });

    // Start monitoring for test results
    this.startMonitoring();
  }

  startMonitoring() {
    // Watch for new test results
    const resultsDir = path.join(this.reportsDir);
    
    if (fs.existsSync(resultsDir)) {
      fs.watch(resultsDir, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.json')) {
          this.processTestResults(path.join(resultsDir, filename));
        }
      });
    }

    // Simulate live updates for demo
    setInterval(() => {
      this.updateMetrics();
      this.broadcastUpdate();
    }, 2000);
  }

  processTestResults(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (data.stats) {
          this.metrics.testResults = {
            passed: data.stats.passes || 0,
            failed: data.stats.failures || 0,
            skipped: data.stats.pending || 0,
            total: data.stats.tests || 0
          };

          this.metrics.coverage.percentage = this.metrics.testResults.total > 0 ? 
            (this.metrics.testResults.passed / this.metrics.testResults.total) * 100 : 0;

          this.broadcastUpdate();
        }
      }
    } catch (error) {
      console.error('Error processing test results:', error);
    }
  }

  updateMetrics() {
    // Simulate real-time updates
    this.metrics.performance.averageResponseTime = Math.random() * 500 + 50;
    this.metrics.currentExecution.status = Math.random() > 0.7 ? 'running' : 'idle';
    
    if (this.metrics.currentExecution.status === 'running') {
      const tests = [
        'Account API - GET /account/accounts',
        'Domains API - POST /domains',
        'Edge Applications - GET /edge_applications',
        'Origins - PUT /origins/{id}',
        'Cache Settings - DELETE /cache_settings/{id}'
      ];
      this.metrics.currentExecution.currentTest = tests[Math.floor(Math.random() * tests.length)];
    } else {
      this.metrics.currentExecution.currentTest = null;
    }
  }

  broadcastUpdate() {
    const message = JSON.stringify(this.metrics);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: {
        successRate: this.metrics.testResults.total > 0 ? 
          (this.metrics.testResults.passed / this.metrics.testResults.total) * 100 : 0,
        totalDuration: Date.now() - this.metrics.startTime.getTime(),
        averageResponseTime: this.metrics.performance.averageResponseTime
      }
    };

    const reportPath = path.join(this.outputDir, \`live-report-\${Date.now()}.json\`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(\`📊 Live report saved: \${reportPath}\`);
    return report;
  }
}

// CLI interface
if (require.main === module) {
  const dashboard = new LiveDashboard({
    port: process.env.DASHBOARD_PORT || 3000,
    wsPort: process.env.WS_PORT || 3001
  });

  dashboard.startServer();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\\n🛑 Shutting down live dashboard...');
    dashboard.generateReport();
    process.exit(0);
  });
}

module.exports = LiveDashboard;
