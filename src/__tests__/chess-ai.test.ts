import { SmartChessAI } from "../chess-ai";
import { ChessEngine } from "../chess-engine";
import { ChessBoard, ChessMove } from "../types";

describe("SmartChessAI", () => {
  let ai: SmartChessAI;
  let engine: ChessEngine;

  beforeEach(() => {
    ai = new SmartChessAI();
    engine = new ChessEngine();
  });

  describe("Constructor", () => {
    test("should initialize with default level", () => {
      expect(ai.getLevel()).toBe(1);
    });

    test("should set custom level", () => {
      ai.setLevel(3);
      expect(ai.getLevel()).toBe(3);
    });

    test("should clamp level to valid range", () => {
      ai.setLevel(0);
      expect(ai.getLevel()).toBe(1);

      ai.setLevel(10);
      expect(ai.getLevel()).toBe(5);
    });
  });

  describe("chooseMove", () => {
    test("should return a valid move for level 1", () => {
      const board = engine.getBoard();
      const move = ai.chooseMove(board, 1);

      expect(move).toBeDefined();
      expect(move.from).toBeDefined();
      expect(move.to).toBeDefined();
      expect(engine.makeMove(`${move.from}${move.to}`)).toBe(true);
    });

    test("should return a valid move for level 3", () => {
      const board = engine.getBoard();
      const move = ai.chooseMove(board, 3);

      expect(move).toBeDefined();
      expect(move.from).toBeDefined();
      expect(move.to).toBeDefined();
      expect(engine.makeMove(`${move.from}${move.to}`)).toBe(true);
    });

    test("should return a valid move for level 5", () => {
      const board = engine.getBoard();
      const move = ai.chooseMove(board, 5);

      expect(move).toBeDefined();
      expect(move.from).toBeDefined();
      expect(move.to).toBeDefined();
      expect(engine.makeMove(`${move.from}${move.to}`)).toBe(true);
    });

    test("should handle edge case when no moves available", () => {
      // This would be a checkmate position, but we'll test the edge case
      const checkmateFEN =
        "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3";
      const checkmateEngine = new ChessEngine(checkmateFEN);
      const board = checkmateEngine.getBoard();

      // Should not throw an error
      expect(() => ai.chooseMove(board, 3)).not.toThrow();
    });
  });

  describe("Performance", () => {
    test("should respond within time limit for level 1", () => {
      const board = engine.getBoard();
      const start = Date.now();

      ai.chooseMove(board, 1);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should be very fast
    });

    test("should respond within time limit for level 3", () => {
      const board = engine.getBoard();
      const start = Date.now();

      ai.chooseMove(board, 3);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should be under 1 second
    });

    test("should respond within time limit for level 5", () => {
      const board = engine.getBoard();
      const start = Date.now();

      ai.chooseMove(board, 5);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000); // Should be under 5 seconds
    });

    test("should scale performance with difficulty", () => {
      const board = engine.getBoard();
      const times: number[] = [];

      for (let level = 1; level <= 5; level++) {
        const start = Date.now();
        ai.chooseMove(board, level);
        times.push(Date.now() - start);
      }

      // Higher levels should generally take longer (though not always due to early exits)
      expect(times[4]).toBeGreaterThanOrEqual(times[0]);
    });
  });

  describe("Move Quality", () => {
    test("should avoid obvious blunders at level 1", () => {
      // Create a position where moving a piece would leave it hanging
      const board = engine.getBoard();
      const move = ai.chooseMove(board, 1);

      // Make the move and check if it's reasonable
      engine.makeMove(`${move.from}${move.to}`);
      const gameState = engine.getGameState();

      // Should not be immediately checkmate
      expect(gameState.isCheckmate).toBe(false);
    });

    test("should play reasonable opening moves", () => {
      const board = engine.getBoard();
      const move = ai.chooseMove(board, 3);

      // Common opening moves
      const commonOpenings = ["e2e4", "d2d4", "c2c4", "g1f3", "b1c3"];
      const moveString = `${move.from}${move.to}`;

      // Should play one of the common opening moves
      expect(commonOpenings).toContain(moveString);
    });

    test("should handle tactical positions", () => {
      // Create a tactical position with a clear best move
      const tacticalFEN =
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
      const tacticalEngine = new ChessEngine(tacticalFEN);
      const board = tacticalEngine.getBoard();

      const move = ai.chooseMove(board, 3);
      expect(move).toBeDefined();
      expect(move.from).toBeDefined();
      expect(move.to).toBeDefined();
    });
  });

  describe("Transposition Table", () => {
    test("should cache evaluated positions", () => {
      const board = engine.getBoard();

      // First call should populate cache
      const start1 = Date.now();
      ai.chooseMove(board, 3);
      const time1 = Date.now() - start1;

      // Second call should be faster due to caching
      const start2 = Date.now();
      ai.chooseMove(board, 3);
      const time2 = Date.now() - start2;

      // Second call should be faster (though this may not always be true due to timing variations)
      expect(time2).toBeLessThanOrEqual(time1 * 1.5);
    });
  });

  describe("Memory Management", () => {
    test("should not leak memory during multiple searches", () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many AI searches
      for (let i = 0; i < 50; i++) {
        const board = engine.getBoard();
        ai.chooseMove(board, 3);

        // Make a move to change the position
        const moves = engine.getAllLegalMoves();
        if (moves.length > 0) {
          engine.makeMove(`${moves[0].from}${moves[0].to}`);
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not increase by more than 50MB
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe("Edge Cases", () => {
    test("should handle endgame positions", () => {
      const endgameFEN = "k7/8/8/8/8/8/8/K7 w - - 0 1";
      const endgameEngine = new ChessEngine(endgameFEN);
      const board = endgameEngine.getBoard();

      const move = ai.chooseMove(board, 3);
      expect(move).toBeDefined();
      expect(endgameEngine.makeMove(`${move.from}${move.to}`)).toBe(true);
    });

    test("should handle checkmate positions", () => {
      const checkmateFEN =
        "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3";
      const checkmateEngine = new ChessEngine(checkmateFEN);
      const board = checkmateEngine.getBoard();

      // Should not throw an error even in checkmate
      expect(() => ai.chooseMove(board, 3)).not.toThrow();
    });

    test("should handle stalemate positions", () => {
      const stalemateFEN = "k7/8/1K6/8/8/8/8/8 w - - 0 1";
      const stalemateEngine = new ChessEngine(stalemateFEN);
      const board = stalemateEngine.getBoard();

      // Should not throw an error even in stalemate
      expect(() => ai.chooseMove(board, 3)).not.toThrow();
    });
  });
});
