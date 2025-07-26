#!/usr/bin/env node

import { ChessEngine } from "./dist/chess-engine.js";
import { ChessUI } from "./dist/chess-ui.js";
import { ChessAI } from "./dist/chess-ai.js";

async function testChess() {
  console.log("♔♕♖♗♘♙ Testing Chess MCP! ♟♞♝♜♛♚\n");

  const chess = new ChessEngine();
  const ui = new ChessUI();
  const ai = new ChessAI(2);

  // Display initial board
  console.log("Initial position:");
  const board = chess.getBoard();
  ui.displayBoard(board);

  // Make some moves
  console.log("\n=== Making moves ===");

  // White plays e4
  chess.makeMove("e2e4");
  console.log("White plays e2e4");
  ui.displayBoard(chess.getBoard());

  // Black plays e5
  chess.makeMove("e7e5");
  console.log("Black plays e7e5");
  ui.displayBoard(chess.getBoard());

  // White plays Nf3
  chess.makeMove("g1f3");
  console.log("White plays Nf3");
  ui.displayBoard(chess.getBoard());

  // Show game status
  const gameState = chess.getGameState();
  ui.displayGameStatus(gameState);

  // Show move history
  const moves = chess.getMoveHistory();
  ui.displayMoveHistory(moves);

  // Show legal moves for a piece
  console.log("\n=== Legal moves for e2 pawn ===");
  const legalMoves = chess.getLegalMoves("e2");
  ui.displayLegalMoves(legalMoves, "e2");

  // Analyze position
  console.log("\n=== Position Analysis ===");
  const analysis = chess.analyzePosition(3);
  ui.displayAnalysis(analysis);

  // Test AI move
  console.log("\n=== AI Move ===");
  const allMoves = chess.getAllLegalMoves();
  const aiMove = ai.chooseMove(allMoves, chess.getBoard().squares, "b");
  console.log(`AI chooses: ${aiMove.san || aiMove.from + "-" + aiMove.to}`);

  chess.makeMove(aiMove);
  ui.displayBoard(chess.getBoard());

  console.log("\n✅ Chess MCP test completed successfully!");
}

testChess().catch(console.error);
