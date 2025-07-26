#!/usr/bin/env node

import { InteractiveCLI } from './interactive-cli.js';

async function main() {
  try {
    const cli = new InteractiveCLI();
    await cli.start();
  } catch (error) {
    console.error('Failed to start Chess CLI:', error);
    process.exit(1);
  }
}

main(); 