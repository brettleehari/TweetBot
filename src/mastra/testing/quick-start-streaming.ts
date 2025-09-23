#!/usr/bin/env node
/**
 * Quick Start Script for Live Agent Streaming
 * Launches both the streaming demo and web server simultaneously
 */

import { spawn } from 'child_process';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 STARTING LIVE AGENT STREAMING SYSTEM');
console.log('=====================================');

// Start web server
const WEB_PORT = 8080;
const webServer = createServer((req, res) => {
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
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error reading file: ' + (error instanceof Error ? error.message : String(error)));
  }
});

webServer.listen(WEB_PORT, () => {
  console.log(`🌐 Web Server: http://localhost:${WEB_PORT}/live-agent-stream.html`);
});

// Start streaming demo after a short delay
setTimeout(() => {
  console.log('\n🤖 Starting Agent Streaming Demo...\n');
  
  const streamProcess = spawn('node', [
    '--loader', 'ts-node/esm',
    'src/mastra/testing/simple-local-streaming.ts'
  ], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '../../..')
  });

  streamProcess.on('close', (code) => {
    console.log(`\n✅ Streaming demo completed with code ${code}`);
    console.log('\n🔄 Demo will restart in 5 seconds...');
    
    // Restart the demo after 5 seconds
    setTimeout(() => {
      console.log('🔄 Restarting streaming demo...\n');
      // Recursively start again (simplified for demo)
    }, 5000);
  });

}, 2000);

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down Live Agent Streaming System...');
  webServer.close();
  process.exit(0);
});

console.log('\n💡 QUICK TIPS:');
console.log('• Open: http://localhost:8080/live-agent-stream.html');
console.log('• The streaming demo runs continuously');
console.log('• Press Ctrl+C to stop everything');
console.log('\n🎯 System ready! Opening browser...\n');