#!/usr/bin/env node

console.log('🧪 Running DataCollectorAgent Real-time Tests...\n');

import { exec } from 'child_process';

exec('npm run test:collector', (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Test execution failed: ${error}`);
    process.exit(1);
  }
  
  console.log(stdout);
  
  if (stderr) {
    console.warn(stderr);
  }
  
  console.log('✅ All DataCollectorAgent tests completed successfully!');
  console.log('🌐 Real-time data connections verified');
  console.log('📊 Live Bitcoin price and news APIs working');
});