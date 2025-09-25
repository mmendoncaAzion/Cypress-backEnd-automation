#!/usr/bin/env node

/**
 * Live Dashboard - Real-time Cypress API Test Monitoring
 * Features: WebSocket live updates, interactive charts, detailed logs
 */

const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

class LiveDashboard {
  constructor(options = {}) {
    this.port = options.port || 3000;
    this.wsPort = options.wsPort || 3001;
    this.reportsDir = options.reportsDir || path.join(__dirname, '../cypress/reports');
    this.outputDir = options.outputDir || path.join(__dirname, '../reports/live');
    
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      pending: 0,
      skipped: 0
    };
    
    this.currentExecution = {
      startTime: null,
      currentTest: null,
      progress: 0
    };
    
    this.endpointCoverage = new Map();
    this.testLogs = [];
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

  generateHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cypress API Test Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
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
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        
        .status-connected { background-color: #4CAF50; }
        .status-disconnected { background-color: #f44336; }
        .status-reconnecting { background-color: #ff9800; }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
        }
        
        .card:hover {
            transform: translateY(-2px);
        }
        
        .card h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.2rem;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .metric-value {
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        .success { color: #4CAF50; }
        .error { color: #f44336; }
        .warning { color: #ff9800; }
        .info { color: #2196F3; }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background-color: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            transition: width 0.3s ease;
        }
        
        .chart-container {
            position: relative;
            height: 300px;
            margin-top: 20px;
        }
        
        .logs-container {
            grid-column: 1 / -1;
            max-height: 400px;
            overflow-y: auto;
            background: #1e1e1e;
            border-radius: 8px;
            padding: 15px;
        }
        
        .log-entry {
            padding: 5px 0;
            border-bottom: 1px solid #333;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }
        
        .log-info { color: #2196F3; }
        .log-success { color: #4CAF50; }
        .log-error { color: #f44336; }
        .log-warning { color: #ff9800; }
        
        .endpoint-list {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .endpoint-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        
        .endpoint-method {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: bold;
            color: white;
        }
        
        .method-GET { background-color: #4CAF50; }
        .method-POST { background-color: #2196F3; }
        .method-PUT { background-color: #ff9800; }
        .method-DELETE { background-color: #f44336; }
        .method-PATCH { background-color: #9c27b0; }
        
        .controls {
            text-align: center;
            margin-top: 20px;
        }
        
        .btn {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            margin: 0 10px;
            transition: all 0.3s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        @media (max-width: 768px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Cypress API Test Dashboard</h1>
            <p>
                <span class="status-indicator status-disconnected" id="connectionStatus"></span>
                <span id="connectionText">Connecting...</span>
            </p>
        </div>
        
        <div class="dashboard-grid">
            <div class="card">
                <h3>📊 Test Results</h3>
                <div class="metric">
                    <span>Success Rate:</span>
                    <span class="metric-value success" id="successRate">0%</span>
                </div>
                <div class="metric">
                    <span>Total Tests:</span>
                    <span class="metric-value" id="totalTests">0</span>
                </div>
                <div class="metric">
                    <span>Passed:</span>
                    <span class="metric-value success" id="passedTests">0</span>
                </div>
                <div class="metric">
                    <span>Failed:</span>
                    <span class="metric-value error" id="failedTests">0</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="progressBar" style="width: 0%"></div>
                </div>
            </div>
            
            <div class="card">
                <h3>⏱️ Execution Info</h3>
                <div class="metric">
                    <span>Duration:</span>
                    <span class="metric-value info" id="duration">0s</span>
                </div>
                <div class="metric">
                    <span>Current Test:</span>
                    <span id="currentTest">None</span>
                </div>
                <div class="metric">
                    <span>Progress:</span>
                    <span class="metric-value" id="progress">0%</span>
                </div>
            </div>
            
            <div class="card">
                <h3>📈 Test Results Chart</h3>
                <div class="chart-container">
                    <canvas id="resultsChart"></canvas>
                </div>
            </div>
            
            <div class="card">
                <h3>🎯 Endpoint Coverage</h3>
                <div class="endpoint-list" id="endpointList">
                    <p class="info">No endpoints tested yet</p>
                </div>
            </div>
            
            <div class="card logs-container">
                <h3 style="color: white; margin-bottom: 15px;">📝 Live Logs</h3>
                <div id="logContainer">
                    <div class="log-entry log-info">[Starting] Dashboard initialized</div>
                </div>
            </div>
        </div>
        
        <div class="controls">
            <button class="btn" onclick="clearLogs()">Clear Logs</button>
            <button class="btn" onclick="exportReport()">Export Report</button>
            <button class="btn" onclick="refreshData()">Refresh</button>
        </div>
    </div>

    <script>
        class DashboardClient {
            constructor() {
                this.ws = null;
                this.reconnectAttempts = 0;
                this.maxReconnectAttempts = 5;
                this.chart = null;
                
                this.initChart();
                this.connectWebSocket();
            }

            connectWebSocket() {
                try {
                    this.ws = new WebSocket(`ws://localhost:${this.wsPort}`);
                    
                    this.ws.onopen = () => {
                        this.reconnectAttempts = 0;
                        this.updateConnectionStatus('connected');
                        this.addLogEntry('Connected to live dashboard', 'success');
                    };
                    
                    this.ws.onmessage = (event) => {
                        const data = JSON.parse(event.data);
                        this.updateDashboard(data);
                    };
                    
                    this.ws.onclose = () => {
                        this.updateConnectionStatus('disconnected');
                        this.addLogEntry('Connection lost', 'error');
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
                
                document.getElementById('totalTests').textContent = data.testResults.total;
                document.getElementById('passedTests').textContent = data.testResults.passed;
                document.getElementById('failedTests').textContent = data.testResults.failed;
                
                // Update progress
                const progress = data.testResults.total > 0 ? 
                    (data.testResults.passed + data.testResults.failed) / data.testResults.total * 100 : 0;
                document.getElementById('progressBar').style.width = progress + '%';
                document.getElementById('progress').textContent = Math.round(progress) + '%';
                
                // Update duration
                if (data.currentExecution.startTime) {
                    const duration = Math.round((Date.now() - new Date(data.currentExecution.startTime)) / 1000);
                    document.getElementById('duration').textContent = duration + 's';
                }
                
                // Update current test
                document.getElementById('currentTest').textContent = 
                    data.currentExecution.currentTest || 'None';

                // Add log entry for significant events
                if (data.currentExecution.currentTest) {
                    this.addLogEntry(`Running: ${data.currentExecution.currentTest}`, 'info');
                }
            }

            updateConnectionStatus(status) {
                const indicator = document.getElementById('connectionStatus');
                const text = document.getElementById('connectionText');
                
                indicator.className = 'status-indicator status-' + status;
                
                switch(status) {
                    case 'connected':
                        text.textContent = 'Connected';
                        break;
                    case 'disconnected':
                        text.textContent = 'Disconnected';
                        break;
                    case 'reconnecting':
                        text.textContent = 'Reconnecting...';
                        break;
                }
            }

            initChart() {
                const ctx = document.getElementById('resultsChart').getContext('2d');
                this.chart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Passed', 'Failed', 'Pending', 'Skipped'],
                        datasets: [{
                            data: [0, 0, 0, 0],
                            backgroundColor: [
                                '#4CAF50',
                                '#f44336',
                                '#ff9800',
                                '#9e9e9e'
                            ],
                            borderWidth: 2,
                            borderColor: '#fff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }

            updateChart(data) {
                if (this.chart) {
                    this.chart.data.datasets[0].data = [
                        data.testResults.passed,
                        data.testResults.failed,
                        data.testResults.pending,
                        data.testResults.skipped
                    ];
                    this.chart.update();
                }
            }

            addLogEntry(message, type = 'info') {
                const container = document.getElementById('logContainer');
                const entry = document.createElement('div');
                entry.className = `log-entry log-${type}`;
                entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
                
                container.appendChild(entry);
                container.scrollTop = container.scrollHeight;
                
                // Keep only last 100 entries
                while (container.children.length > 100) {
                    container.removeChild(container.firstChild);
                }
            }

            sendHeartbeat() {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({ type: 'ping' }));
                }
            }
        }

        // Global functions
        function clearLogs() {
            document.getElementById('logContainer').innerHTML = 
                '<div class="log-entry log-info">[Cleared] Logs cleared by user</div>';
        }

        function exportReport() {
            // Implementation for exporting report
            alert('Export functionality would be implemented here');
        }

        function refreshData() {
            if (window.dashboardClient) {
                window.dashboardClient.addLogEntry('Manual refresh requested', 'info');
            }
        }

        // Initialize dashboard
        window.dashboardClient = new DashboardClient();
        
        // Send heartbeat every 30 seconds
        setInterval(() => {
            window.dashboardClient.sendHeartbeat();
        }, 30000);
    </script>
</body>
</html>`;
  }

  start() {
    // Create HTTP server
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(this.generateHTML());
    });

    // Create WebSocket server
    this.wss = new WebSocket.Server({ port: this.wsPort });
    
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      console.log('Client connected to dashboard');
      
      // Send initial data
      ws.send(JSON.stringify({
        testResults: this.testResults,
        currentExecution: this.currentExecution,
        endpointCoverage: Array.from(this.endpointCoverage.entries())
      }));

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('Client disconnected from dashboard');
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
      fs.watch(resultsDir, (eventType, filename) => {
        if (filename && filename.endsWith('.json')) {
          this.processTestResult(path.join(resultsDir, filename));
        }
      });
    }

    // Periodic update
    setInterval(() => {
      this.broadcastUpdate();
    }, 5000);
  }

  processTestResult(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.updateTestResults(data);
        this.broadcastUpdate();
      }
    } catch (error) {
      console.error(`Error processing test result: ${error.message}`);
    }
  }

  updateTestResults(data) {
    if (data.stats) {
      this.testResults = {
        total: data.stats.tests || 0,
        passed: data.stats.passes || 0,
        failed: data.stats.failures || 0,
        pending: data.stats.pending || 0,
        skipped: data.stats.skipped || 0
      };
    }

    if (data.tests) {
      data.tests.forEach(test => {
        if (test.title) {
          this.currentExecution.currentTest = test.title;
        }
      });
    }
  }

  broadcastUpdate() {
    const data = {
      testResults: this.testResults,
      currentExecution: this.currentExecution,
      endpointCoverage: Array.from(this.endpointCoverage.entries()),
      timestamp: new Date().toISOString()
    };

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      testResults: this.testResults,
      currentExecution: this.currentExecution,
      endpointCoverage: Array.from(this.endpointCoverage.entries()),
      summary: {
        successRate: this.testResults.total > 0 ? 
          Math.round((this.testResults.passed / this.testResults.total) * 100) : 0,
        totalEndpoints: this.endpointCoverage.size,
        executionTime: this.currentExecution.startTime ? 
          Date.now() - new Date(this.currentExecution.startTime) : 0
      }
    };

    const reportPath = path.join(this.outputDir, `live-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Live report saved: ${reportPath}`);
    return report;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    
    if (key === 'port') options.port = parseInt(value);
    if (key === 'ws-port') options.wsPort = parseInt(value);
    if (key === 'reports-dir') options.reportsDir = value;
    if (key === 'output-dir') options.outputDir = value;
  }
  
  const dashboard = new LiveDashboard(options);
  dashboard.start();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Live Dashboard...');
    dashboard.generateReport();
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });
}

module.exports = LiveDashboard;
