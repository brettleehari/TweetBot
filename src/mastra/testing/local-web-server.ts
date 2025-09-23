#!/usr/bin/env node
/**
 * Simple HTTP Server for Local Development
 * Serves the live streaming web interface locally
 */

import { createServer } from 'http';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8080;

const server = createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let filePath = '';
  let contentType = 'text/html';

  // Route handling
  if (req.url === '/' || req.url === '/live-agent-stream.html') {
    filePath = path.join(__dirname, '../../../docs/live-agent-stream.html');
    contentType = 'text/html';
  } else if (req.url === '/trading-dashboard.html') {
    filePath = path.join(__dirname, '../../../docs/trading-dashboard.html');
    contentType = 'text/html';
  } else if (req.url === '/index.html') {
    filePath = path.join(__dirname, '../../../docs/index.html');
    contentType = 'text/html';
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
    return;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Replace WebSocket URL for local development if needed
    let modifiedContent = content;
    if (filePath.includes('live-agent-stream.html')) {
      // Note: The WebSocket connection will fail but the interface will still show
      modifiedContent = content.replace('ws://localhost:3001', 'ws://localhost:3001');
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(modifiedContent);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error reading file: ' + (error instanceof Error ? error.message : String(error)));
  }
});

server.listen(PORT, () => {
  console.log('🌐 LOCAL WEB SERVER STARTED');
  console.log(`📡 Server running at: http://localhost:${PORT}`);
  console.log('');
  console.log('🔗 Available pages:');
  console.log(`   • Live Agent Stream: http://localhost:${PORT}/live-agent-stream.html`);
  console.log(`   • Trading Dashboard: http://localhost:${PORT}/trading-dashboard.html`);
  console.log(`   • Main Dashboard: http://localhost:${PORT}/index.html`);
  console.log('');
  console.log('💡 Note: For full WebSocket functionality, also run:');
  console.log('   npm run live-stream');
  console.log('');
  console.log('🛑 Press Ctrl+C to stop server');
});

process.on('SIGINT', () => {
  console.log('\n🛑 Stopping web server...');
  server.close();
  process.exit(0);
});

export default server;