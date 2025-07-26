import { ChessEngine } from "../chess-engine";
import { ChessBoard, ChessMove } from "../types";

describe("ChessEngine", () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  describe("Constructor", () => {
    test("should initialize with starting position", () => {
      const board = engine.getBoard();
      expect(board.squares[0][0]).toEqual({
        type: "r",
        color: "b",
        square: "a8",
      });
      expect(board.squares[1][0]).toEqual({
        type: "p",
        color: "b",
        square: "a7",
      });
      expect(board.squares[6][0]).toEqual({
        type: "p",
        color: "w",
        square: "a2",
      });
      expect(board.squares[7][0]).toEqual({
        type: "r",
        color: "w",
        square: "a1",
      });
    });

    test("should initialize with custom FEN", () => {
      const customFEN =
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
      const customEngine = new ChessEngine(customFEN);
      expect(customEngine.getGameState().fen).toBe(customFEN);
    });
  });

  describe("makeMove", () => {
    test("should make valid opening move", () => {
      const result = engine.makeMove("e2e4");
      expect(result).toBe(true);
      expect(engine.getGameState().fen).toContain(
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR",
      );
    });

    test("should reject invalid move", () => {
      const result = engine.makeMove("e2e5");
      expect(result).toBe(false);
    });

    test("should handle castling", () => {
      // Setup castling position
      engine.makeMove("e2e4");
      engine.makeMove("e7e5");
      engine.makeMove("g1f3");
      engine.makeMove("b8c6");
      engine.makeMove("f1c4");
      engine.makeMove("f8c5");

      const result = engine.makeMove("e1g1");
      expect(result).toBe(true);
    });

    test("should handle en passant", () => {
      // Setup en passant position: e4 d5 e5
      engine.makeMove("e2e4");
      engine.makeMove("d7d5");
      engine.makeMove("e4e5");

      const result = engine.makeMove("d5e6");
      expect(result).toBe(true);
    });

    test("should handle pawn promotion", () => {
      // Setup promotion position (simplified)
      const promotionFEN = "8/4P3/8/8/8/8/8/K7 w - - 0 1";
      const promotionEngine = new ChessEngine(promotionFEN);

      const result = promotionEngine.makeMove("e7e8q");
      expect(result).toBe(true);
    });

    test("should reject moves when not player turn", () => {
      engine.makeMove("e2e4");
      const result = engine.makeMove("e2e4"); // White's turn again
      expect(result).toBe(false);
    });
  });

  describe("getLegalMoves", () => {
    test("should return legal moves for starting position", () => {
      const moves = engine.getAllLegalMoves();
      expect(moves.length).toBe(20); // 20 legal moves in starting position
      expect(moves.some((move) => move.from === "e2" && move.to === "e4")).toBe(
        true,
      );
      expect(moves.some((move) => move.from === "d2" && move.to === "d4")).toBe(
        true,
      );
    });

    test("should return empty array when checkmate", () => {
      const checkmateFEN =
        "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3";
      const checkmateEngine = new ChessEngine(checkmateFEN);
      const moves = checkmateEngine.getAllLegalMoves();
      expect(moves.length).toBe(0);
    });

    test("should return only legal moves when in check", () => {
      const checkFEN =
        "rnbqkbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3";
      const checkEngine = new ChessEngine(checkFEN);
      const moves = checkEngine.getAllLegalMoves();
      expect(moves.length).toBeGreaterThan(0);
      // All moves should block the check
      moves.forEach((move) => {
        const engineCopy = new ChessEngine(checkFEN);
        engineCopy.makeMove(`${move.from}${move.to}`);
        expect(engineCopy.isGameOver()).toBe(false);
      });
    });
  });

  describe("analyzePosition", () => {
    test("should analyze starting position", () => {
      const analysis = engine.analyzePosition();
      expect(analysis.evaluation).toBeCloseTo(0, 1); // Should be roughly equal
      expect(analysis.bestMoves.length).toBeGreaterThan(0);
    });

    test("should detect checkmate", () => {
      const checkmateFEN =
        "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3";
      const checkmateEngine = new ChessEngine(checkmateFEN);
      const gameState = checkmateEngine.getGameState();
      expect(gameState.isCheckmate).toBe(true);
    });

    test("should detect stalemate", () => {
      const stalemateFEN = "k7/8/1K6/8/8/8/8/8 w - - 0 1";
      const stalemateEngine = new ChessEngine(stalemateFEN);
      const gameState = stalemateEngine.getGameState();
      expect(gameState.isStalemate).toBe(true);
    });
  });

  describe("isGameOver", () => {
    test("should return false for starting position", () => {
      expect(engine.isGameOver()).toBe(false);
    });

    test("should return true for checkmate", () => {
      const checkmateFEN =
        "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3";
      const checkmateEngine = new ChessEngine(checkmateFEN);
      expect(checkmateEngine.isGameOver()).toBe(true);
    });

    test("should return true for stalemate", () => {
      const stalemateFEN = "k7/8/1K6/8/8/8/8/8 w - - 0 1";
      const stalemateEngine = new ChessEngine(stalemateFEN);
      expect(stalemateEngine.isGameOver()).toBe(true);
    });
  });

  describe("getGameState", () => {
    test("should return correct status for starting position", () => {
      const gameState = engine.getGameState();
      expect(gameState.isCheck).toBe(false);
      expect(gameState.isCheckmate).toBe(false);
      expect(gameState.isDraw).toBe(false);
      expect(gameState.isStalemate).toBe(false);
    });

    test("should detect check", () => {
      const checkFEN =
        "rnbqkbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3";
      const checkEngine = new ChessEngine(checkFEN);
      const gameState = checkEngine.getGameState();
      expect(gameState.isCheck).toBe(true);
    });

    test("should detect checkmate", () => {
      const checkmateFEN =
        "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3";
      const checkmateEngine = new ChessEngine(checkmateFEN);
      const gameState = checkmateEngine.getGameState();
      expect(gameState.isCheckmate).toBe(true);
    });
  });

  describe("getGameState", () => {
    test("should return correct starting FEN", () => {
      const gameState = engine.getGameState();
      expect(gameState.fen).toBe(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );
    });

    test("should return correct FEN after moves", () => {
      engine.makeMove("e2e4");
      const gameState = engine.getGameState();
      expect(gameState.fen).toContain(
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR",
      );
    });
  });

  describe("reset", () => {
    test("should reset to starting position", () => {
      engine.makeMove("e2e4");
      engine.makeMove("e7e5");
      engine.reset();

      const gameState = engine.getGameState();
      expect(gameState.fen).toBe(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );
    });
  });

  describe("Edge Cases", () => {
    test("should handle king-only endgame", () => {
      const kingFEN = "k7/8/8/8/8/8/8/K7 w - - 0 1";
      const kingEngine = new ChessEngine(kingFEN);
      const moves = kingEngine.getLegalMoves();
      expect(moves.length).toBeGreaterThan(0);
    });

    test("should handle invalid FEN gracefully", () => {
      expect(() => new ChessEngine("invalid fen")).toThrow();
    });
  });
});
