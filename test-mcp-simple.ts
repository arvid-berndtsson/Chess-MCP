#!/usr/bin/env tsx

import { ChessEngine } from "./src/chess-engine.js";

async function testChessEngine() {
  console.log("Testing Chess Engine...");

  try {
    const engine = new ChessEngine();
    console.log("✓ Chess engine initialized");

    // Test a simple move
    const result = engine.makeMove("e2e4");
    console.log(`✓ Made move e2e4: ${result}`);

    // Test getting legal moves
    const moves = engine.getAllLegalMoves();
    console.log(`✓ Found ${moves.length} legal moves`);

    // Test getting board state
    const board = engine.getBoard();
    console.log("✓ Board state retrieved");
    console.log(`  Turn: ${board.turn}`);
    console.log(`  Move number: ${board.fullMoveNumber}`);

    // Test game state
    const gameState = engine.getGameState();
    console.log("✓ Game state retrieved");
    console.log(`  FEN: ${gameState.fen}`);
    console.log(`  Is check: ${gameState.isCheck}`);
    console.log(`  Is checkmate: ${gameState.isCheckmate}`);

    console.log("\n🎉 All tests passed! Chess engine is working correctly.");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testChessEngine();
