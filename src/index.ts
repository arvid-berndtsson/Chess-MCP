#!/usr/bin/env node

import { ChessMCPServer } from "./chess-mcp.js";

async function main() {
  try {
    const server = new ChessMCPServer();
    await server.run();
  } catch (error) {
    console.error("Failed to start Chess MCP server:", error);
    process.exit(1);
  }
}

main();
