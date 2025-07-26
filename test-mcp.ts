#!/usr/bin/env node

import { spawn } from "child_process";

// Test the MCP server with tsx
async function testMCPServer() {
  console.log("🧪 Testing Chess MCP Server with real operations...\n");

  // Start the MCP server using tsx
  const serverProcess = spawn("npx", ["tsx", "src/index.ts"], {
    stdio: ["pipe", "pipe", "pipe"],
    cwd: process.cwd(),
  });

  let testResults: string[] = [];

  // Helper function to send MCP messages
  const sendMessage = (method: string, params: any = {}) => {
    const message = {
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    };
    serverProcess.stdin.write(JSON.stringify(message) + "\n");
  };

  // Helper function to wait for response
  const waitForResponse = (): Promise<any> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ error: "Timeout waiting for response" });
      }, 5000);

      serverProcess.stdout.once("data", (data) => {
        clearTimeout(timeout);
        try {
          const response = JSON.parse(data.toString().trim());
          resolve(response);
        } catch (e) {
          resolve({ error: "Invalid JSON response" });
        }
      });
    });
  };

  try {
    // Test 1: List tools
    console.log("📋 Test 1: Listing available tools...");
    sendMessage("tools/list");
    const toolsResponse = await waitForResponse();
    if (toolsResponse.result?.tools) {
      console.log(`✅ Found ${toolsResponse.result.tools.length} tools`);
      testResults.push("✅ Tools listing works");
    } else {
      console.log("❌ Tools listing failed");
      testResults.push("❌ Tools listing failed");
    }

    // Test 2: Start a new game
    console.log("\n🎮 Test 2: Starting a new game...");
    sendMessage("tools/call", {
      name: "start_new_game",
      arguments: { mode: "human-vs-ai", aiLevel: 3 },
    });
    const startGameResponse = await waitForResponse();
    if (startGameResponse.result?.content) {
      console.log("✅ New game started successfully");
      testResults.push("✅ New game creation works");
    } else {
      console.log("❌ New game creation failed");
      testResults.push("❌ New game creation failed");
    }

    // Test 3: Get board state
    console.log("\n♟️ Test 3: Getting board state...");
    sendMessage("tools/call", {
      name: "get_board_state",
      arguments: {},
    });
    const boardResponse = await waitForResponse();
    if (boardResponse.result?.content) {
      console.log("✅ Board state retrieved");
      testResults.push("✅ Board state works");
    } else {
      console.log("❌ Board state failed");
      testResults.push("❌ Board state failed");
    }

    // Test 4: Make a move
    console.log("\n♟️ Test 4: Making a move (e2e4)...");
    sendMessage("tools/call", {
      name: "make_move",
      arguments: { move: "e2e4" },
    });
    const moveResponse = await waitForResponse();
    if (moveResponse.result?.content) {
      console.log("✅ Move e2e4 made successfully");
      testResults.push("✅ Move making works");
    } else {
      console.log("❌ Move making failed");
      testResults.push("❌ Move making failed");
    }

    // Test 5: Get legal moves
    console.log("\n📋 Test 5: Getting legal moves...");
    sendMessage("tools/call", {
      name: "get_legal_moves",
      arguments: {},
    });
    const legalMovesResponse = await waitForResponse();
    if (legalMovesResponse.result?.content) {
      console.log("✅ Legal moves retrieved");
      testResults.push("✅ Legal moves work");
    } else {
      console.log("❌ Legal moves failed");
      testResults.push("❌ Legal moves failed");
    }

    // Test 6: AI move
    console.log("\n🤖 Test 6: Making AI move...");
    sendMessage("tools/call", {
      name: "ai_move",
      arguments: {},
    });
    const aiMoveResponse = await waitForResponse();
    if (aiMoveResponse.result?.content) {
      console.log("✅ AI move made successfully");
      testResults.push("✅ AI moves work");
    } else {
      console.log("❌ AI move failed");
      testResults.push("❌ AI moves failed");
    }
  } catch (error) {
    console.error("❌ Test error:", error);
    testResults.push("❌ Test execution failed");
  }

  // Cleanup
  setTimeout(() => {
    serverProcess.kill();

    console.log("\n📊 Test Results:");
    testResults.forEach((result) => console.log(result));

    console.log("\n🎉 MCP server is ready for use!");
    console.log(
      "\n📋 For MCP clients (Raycast/Claude), use this configuration:",
    );
    console.log(
      JSON.stringify(
        {
          mcpServers: {
            chess: {
              name: "Chess MCP",
              type: "stdio",
              command: "npx",
              args: ["tsx", "/Users/arvid/Private/Chess-MCP/src/index.ts"],
            },
          },
        },
        null,
        2,
      ),
    );
  }, 1000);
}

// Run the test
testMCPServer();
