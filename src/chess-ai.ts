import type { ChessMove } from "./types.js";
import { ChessBoard } from "./types";

// Basic ChessAI class for simple AI functionality
export class ChessAI {
  private smartAI: SmartChessAI;

  constructor(level: number = 1) {
    this.smartAI = new SmartChessAI(level);
  }

  chooseMove(moves: ChessMove[], board: any, color: "w" | "b"): ChessMove {
    // Use the provided legal moves instead of generating our own
    return this.smartAI.chooseMoveFromMoves(moves, board, color, this.smartAI.getLevel());
  }

  setLevel(level: number): void {
    this.smartAI.setLevel(level);
  }

  getLevel(): number {
    return this.smartAI.getLevel();
  }
}

interface TranspositionEntry {
  score: number;
  depth: number;
  flag: "exact" | "alpha" | "beta";
  bestMove?: ChessMove;
}

export class SmartChessAI {
  private readonly pieceValues = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000,
  };

  // Transposition table for caching evaluated positions
  private transpositionTable = new Map<string, TranspositionEntry>();
  private readonly maxTableSize = 1000000; // 1M entries

  // Move ordering cache
  private moveOrderingCache = new Map<string, ChessMove[]>();
  private readonly maxOrderingCacheSize = 100000; // 100K entries

  // Performance monitoring
  private nodesEvaluated = 0;
  private searchStartTime = 0;
  private readonly maxSearchTime = 5000; // 5 seconds max

  // Enhanced position values with better strategic understanding
  private readonly positionValues = {
    p: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [5, 5, 10, 25, 25, 10, 5, 5],
      [0, 0, 0, 20, 20, 0, 0, 0],
      [5, -5, -10, 0, 0, -10, -5, 5],
      [5, 10, 10, -20, -20, 10, 10, 5],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    n: [
      [-50, -40, -30, -30, -30, -30, -40, -50],
      [-40, -20, 0, 0, 0, 0, -20, -40],
      [-30, 0, 10, 15, 15, 10, 0, -30],
      [-30, 5, 15, 20, 20, 15, 5, -30],
      [-30, 0, 15, 20, 20, 15, 0, -30],
      [-30, 5, 10, 15, 15, 10, 5, -30],
      [-40, -20, 0, 5, 5, 0, -20, -40],
      [-50, -40, -30, -30, -30, -30, -40, -50],
    ],
    b: [
      [-20, -10, -10, -10, -10, -10, -10, -20],
      [-10, 0, 0, 0, 0, 0, 0, -10],
      [-10, 0, 5, 10, 10, 5, 0, -10],
      [-10, 5, 5, 10, 10, 5, 5, -10],
      [-10, 0, 10, 10, 10, 10, 0, -10],
      [-10, 10, 10, 10, 10, 10, 10, -10],
      [-10, 5, 0, 0, 0, 0, 5, -10],
      [-20, -10, -10, -10, -10, -10, -10, -20],
    ],
    r: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [5, 10, 10, 10, 10, 10, 10, 5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [0, 0, 0, 5, 5, 0, 0, 0],
    ],
    q: [
      [-20, -10, -10, -5, -5, -10, -10, -20],
      [-10, 0, 0, 0, 0, 0, 0, -10],
      [-10, 0, 5, 5, 5, 5, 0, -10],
      [-5, 0, 5, 5, 5, 5, 0, -5],
      [0, 0, 5, 5, 5, 5, 0, -5],
      [-10, 5, 5, 5, 5, 5, 0, -10],
      [-10, 0, 5, 0, 0, 0, 0, -10],
      [-20, -10, -10, -5, -5, -10, -10, -20],
    ],
    k: [
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-20, -30, -30, -40, -40, -30, -30, -20],
      [-10, -20, -20, -20, -20, -20, -20, -10],
      [20, 20, 0, 0, 0, 0, 20, 20],
      [20, 30, 10, 0, 0, 10, 30, 20],
    ],
  };

  // Opening book with common good moves
  private readonly openingBook: Record<string, string[]> = {
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1": [
      "e2e4",
      "d2d4",
      "c2c4",
      "g1f3",
      "b1c3",
    ],
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1": [
      "e7e5",
      "c7c5",
      "e7e6",
      "d7d5",
      "g8f6",
    ],
    "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2": [
      "g1f3",
      "b1c3",
      "f1c4",
      "d2d4",
    ],
    "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2": [
      "b8c6",
      "g8f6",
      "d7d6",
      "f8c5",
    ],
  };

  // Endgame knowledge
  private readonly endgamePatterns = {
    kpk: this.evaluateKPKEndgame.bind(this),
    krk: this.evaluateKRKEndgame.bind(this),
    kqk: this.evaluateKQKEndgame.bind(this),
    krpk: this.evaluateKRPKEndgame.bind(this),
  };

  constructor(private level: number = 1) {}

  public chooseMove(board: ChessBoard, level: number): ChessMove {
    this.resetSearchStats();

    if (level === 1) {
      return this.chooseSmartRandomMove(
        this.getLegalMovesForBoard(board, board.turn),
        board,
        board.turn,
      );
    } else if (level === 2) {
      return this.choosePositionalMove(
        this.getLegalMovesForBoard(board, board.turn),
        board,
        board.turn,
      );
    } else {
      return this.chooseAdvancedMove(board, level);
    }
  }

  public chooseMoveFromMoves(moves: ChessMove[], board: any, color: "w" | "b", level: number): ChessMove {
    this.resetSearchStats();

    // Convert board to ChessBoard format
    const chessBoard: ChessBoard = {
      squares: board,
      turn: color,
      castling: { w: { k: true, q: true }, b: { k: true, q: true } },
      enPassant: null,
      halfMoveClock: 0,
      fullMoveNumber: 1,
    };

    if (level === 1) {
      return this.chooseSmartRandomMove(moves, chessBoard, color);
    } else if (level === 2) {
      return this.choosePositionalMove(moves, chessBoard, color);
    } else {
      return this.chooseAdvancedMoveFromMoves(moves, board, color, level);
    }
  }

  // Smart random move that avoids obvious blunders
  private chooseSmartRandomMove(
    moves: ChessMove[],
    board: ChessBoard,
    color: "w" | "b",
  ): ChessMove {
    const safeMoves = moves.filter((move) => {
      const boardCopy = this.copyBoard(board);
      this.makeMoveOnBoard(boardCopy.squares, move);
      return !this.isMoveBlunder(boardCopy.squares, color);
    });

    if (safeMoves.length > 0) {
      return this.chooseRandomMove(safeMoves);
    }
    return this.chooseRandomMove(moves);
  }

  // Positional move selection with basic strategy
  private choosePositionalMove(
    moves: ChessMove[],
    board: ChessBoard,
    color: "w" | "b",
  ): ChessMove {
    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
      const boardCopy = this.copyBoard(board);
      this.makeMoveOnBoard(boardCopy.squares, move);

      const score = this.evaluatePositionBasic(boardCopy.squares, color);

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private chooseAdvancedMove(board: ChessBoard, level: number): ChessMove {
    const moves = this.getLegalMovesForBoard(board, board.turn);
    if (moves.length === 0) return moves[0];

    // Check opening book first
    const bookMove = this.getOpeningBookMove(board);
    if (bookMove) return bookMove;

    // Use iterative deepening with time management
    const maxDepth = Math.min(level + 2, 8); // Cap at 8 plies
    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (let depth = 1; depth <= maxDepth; depth++) {
      if (this.isTimeUp()) break;

      const moveScores = moves.map((move) => {
        const boardCopy = this.copyBoard(board);
        this.makeMoveOnBoard(boardCopy.squares, move);
        const score = -this.iterativeMinimax(
          boardCopy.squares,
          depth - 1,
          -Infinity,
          Infinity,
          false,
        );
        return { move, score };
      });

      // Sort by score and update best move
      moveScores.sort((a, b) => b.score - a.score);
      if (moveScores.length > 0) {
        bestMove = moveScores[0].move;
        bestScore = moveScores[0].score;
      }

      // Early exit if we found a winning move
      if (bestScore > 9000) break;
    }

    return bestMove;
  }

  private chooseAdvancedMoveFromMoves(moves: ChessMove[], board: any, color: "w" | "b", level: number): ChessMove {
    if (moves.length === 0) return moves[0];

    // Use iterative deepening with time management
    const maxDepth = Math.min(level + 2, 8); // Cap at 8 plies
    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (let depth = 1; depth <= maxDepth; depth++) {
      if (this.isTimeUp()) break;

      const moveScores = moves.map((move) => {
        const boardCopy = this.copyBoard({ squares: board, turn: color } as ChessBoard);
        this.makeMoveOnBoard(boardCopy.squares, move);
        const score = -this.iterativeMinimax(
          boardCopy.squares,
          depth - 1,
          -Infinity,
          Infinity,
          false,
        );
        return { move, score };
      });

      // Sort by score and update best move
      moveScores.sort((a, b) => b.score - a.score);
      if (moveScores.length > 0) {
        bestMove = moveScores[0].move;
        bestScore = moveScores[0].score;
      }

      // Early exit if we found a winning move
      if (bestScore > 9000) break;
    }

    return bestMove;
  }

  private iterativeMinimax(
    board: any,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
  ): number {
    this.nodesEvaluated++;

    // Check transposition table
    const fen = this.boardToFEN(board);
    const ttEntry = this.transpositionTable.get(fen);
    if (ttEntry && ttEntry.depth >= depth) {
      if (ttEntry.flag === "exact") {
        return ttEntry.score;
      } else if (ttEntry.flag === "alpha" && ttEntry.score <= alpha) {
        return alpha;
      } else if (ttEntry.flag === "beta" && ttEntry.score >= beta) {
        return beta;
      }
    }

    if (depth === 0) {
      return this.quiescenceSearch(board, alpha, beta, 0, isMaximizing ? "w" : "b");
    }

    const legalMoves = this.getLegalMovesForBoard(
      board,
      isMaximizing ? "w" : "b",
    );
    const orderedMoves = this.getOrderedMoves(
      legalMoves,
      board,
      isMaximizing ? "w" : "b",
    );

    let bestScore = isMaximizing ? -Infinity : Infinity;
    let bestMove: ChessMove | undefined;
    let flag: "exact" | "alpha" | "beta" = "exact";

    for (const move of orderedMoves) {
      if (this.isTimeUp()) break;

      const boardCopy = this.copyBoard(board);
      this.makeMoveOnBoard(boardCopy, move);
      const score = this.iterativeMinimax(
        boardCopy,
        depth - 1,
        alpha,
        beta,
        !isMaximizing,
      );

      if (isMaximizing) {
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
        alpha = Math.max(alpha, score);
        if (beta <= alpha) {
          flag = "beta";
          break;
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
        beta = Math.min(beta, score);
        if (beta <= alpha) {
          flag = "alpha";
          break;
        }
      }
    }

    // Store in transposition table
    this.storeTranspositionEntry(fen, bestScore, depth, flag, bestMove);

    return bestScore;
  }

  private quiescenceSearch(
    board: any,
    alpha: number,
    beta: number,
    depth: number = 0,
    color: "w" | "b" = "w",
  ): number {
    // Limit quiescence search depth to prevent infinite recursion
    if (depth > 10) {
      return this.evaluatePositionAdvanced(board);
    }

    const standPat = this.evaluatePositionAdvanced(board);

    if (standPat >= beta) {
      return beta;
    }

    if (alpha < standPat) {
      alpha = standPat;
    }

    const captures = this.getCaptureMoves(board, color);

    for (const capture of captures) {
      const boardCopy = this.copyBoard(board);
      this.makeMoveOnBoard(boardCopy, capture);
      const score = -this.quiescenceSearch(boardCopy, -beta, -alpha, depth + 1, color === "w" ? "b" : "w");

      if (score >= beta) {
        return beta;
      }

      if (score > alpha) {
        alpha = score;
      }
    }

    return alpha;
  }

  private getCaptureMoves(board: any, color: "w" | "b"): ChessMove[] {
    const allMoves = this.getLegalMovesForBoard(board, color);
    return allMoves.filter((move) => {
      const targetSquare = this.getPieceAt(board, move.to);
      return targetSquare !== null;
    });
  }

  private getOrderedMoves(
    moves: ChessMove[],
    board: any,
    color: "w" | "b",
  ): ChessMove[] {
    const fen = this.boardToFEN(board);

    // Check cache first
    if (this.moveOrderingCache.has(fen)) {
      return this.moveOrderingCache.get(fen)!;
    }

    const moveScores = moves.map((move) => ({
      move,
      score: this.getMoveScore(move, board, color),
    }));

    // Sort by score (highest first)
    moveScores.sort((a, b) => b.score - a.score);
    const orderedMoves = moveScores.map((item) => item.move);

    // Cache the result
    this.storeOrderingCache(fen, orderedMoves);

    return orderedMoves;
  }

  // Advanced position evaluation
  private evaluatePositionAdvanced(board: any): number {
    const squares = board.squares || board;
    let score = 0;
    let pieceCount: { w: number; b: number } = { w: 0, b: 0 };
    let pieceTypes: { w: Set<string>; b: Set<string> } = {
      w: new Set(),
      b: new Set(),
    };

    // Material and position evaluation
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = squares[rank][file];
        if (piece) {
          const pieceValue =
            this.pieceValues[piece.type as keyof typeof this.pieceValues] || 0;
          const positionValue = this.getPositionValue(
            piece.type,
            piece.color,
            rank,
            file,
          );
          const totalValue = pieceValue + positionValue;

          score += piece.color === "w" ? totalValue : -totalValue;

          pieceCount[piece.color as keyof typeof pieceCount]++;
          pieceTypes[piece.color as keyof typeof pieceTypes].add(piece.type);
        }
      }
    }

    // Endgame evaluation
    const endgameScore = this.evaluateEndgame(squares, pieceCount, pieceTypes);
    score += endgameScore;

    // Mobility evaluation
    const mobilityScore = this.evaluateMobility(squares);
    score += mobilityScore;

    // Pawn structure evaluation
    const pawnScore = this.evaluatePawnStructure(squares);
    score += pawnScore;

    // King safety evaluation
    const kingSafetyScore = this.evaluateKingSafety(squares);
    score += kingSafetyScore;

    return score;
  }

  // Basic position evaluation for level 2
  private evaluatePositionBasic(board: any, color: "w" | "b"): number {
    const squares = board.squares || board;
    let score = 0;

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = squares[rank][file];
        if (piece) {
          const pieceValue =
            this.pieceValues[piece.type as keyof typeof this.pieceValues] || 0;
          const positionValue = this.getPositionValue(
            piece.type,
            piece.color,
            rank,
            file,
          );
          const totalValue = pieceValue + positionValue;

          score += piece.color === color ? totalValue : -totalValue;
        }
      }
    }

    return score;
  }

  // Endgame evaluation
  private evaluateEndgame(
    board: any,
    pieceCount: any,
    pieceTypes: any,
  ): number {
    const totalPieces = pieceCount.w + pieceCount.b;

    if (totalPieces <= 6) {
      // Endgame patterns
      if (pieceCount.w === 1 && pieceCount.b === 1) {
        return this.evaluateKRKEndgame(board);
      }
      if (pieceCount.w === 2 && pieceCount.b === 1 && pieceTypes.w.has("p")) {
        return this.evaluateKRPKEndgame(board);
      }
    }

    return 0;
  }

  // Mobility evaluation
  private evaluateMobility(board: any): number {
    const squares = board.squares || board;
    const whiteMoves = this.getLegalMovesForBoard(
      {
        squares,
        turn: "w",
        castling: { w: { k: true, q: true }, b: { k: true, q: true } },
        enPassant: null,
        halfMoveClock: 0,
        fullMoveNumber: 1,
      },
      "w",
    ).length;
    const blackMoves = this.getLegalMovesForBoard(
      {
        squares,
        turn: "b",
        castling: { w: { k: true, q: true }, b: { k: true, q: true } },
        enPassant: null,
        halfMoveClock: 0,
        fullMoveNumber: 1,
      },
      "b",
    ).length;
    return (whiteMoves - blackMoves) * 10;
  }

  // Pawn structure evaluation
  private evaluatePawnStructure(board: any): number {
    const squares = board.squares || board;
    let score = 0;

    // Doubled pawns penalty
    for (let file = 0; file < 8; file++) {
      let whitePawns = 0,
        blackPawns = 0;
      for (let rank = 0; rank < 8; rank++) {
        const piece = squares[rank][file];
        if (piece?.type === "p") {
          if (piece.color === "w") whitePawns++;
          else blackPawns++;
        }
      }
      if (whitePawns > 1) score -= 30 * (whitePawns - 1);
      if (blackPawns > 1) score += 30 * (blackPawns - 1);
    }

    // Isolated pawns penalty
    for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
        const piece = squares[rank][file];
        if (piece?.type === "p") {
          if (this.isPawnIsolated(squares, rank, file, piece.color)) {
            score += piece.color === "w" ? -20 : 20;
          }
        }
      }
    }

    return score;
  }

  // King safety evaluation
  private evaluateKingSafety(board: any): number {
    const squares = board.squares || board;
    let score = 0;

    // Find kings
    let whiteKing = null,
      blackKing = null;
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = squares[rank][file];
        if (piece?.type === "k") {
          if (piece.color === "w") whiteKing = { rank, file };
          else blackKing = { rank, file };
        }
      }
    }

    // Evaluate king position
    if (whiteKing) {
      score += this.evaluateKingPosition(whiteKing.rank, whiteKing.file, "w");
    }
    if (blackKing) {
      score -= this.evaluateKingPosition(blackKing.rank, blackKing.file, "b");
    }

    return score;
  }

  // Move ordering for better alpha-beta pruning
  private orderMoves(
    moves: ChessMove[],
    board: any,
    color: "w" | "b",
  ): ChessMove[] {
    return moves.sort((a, b) => {
      const scoreA = this.getMoveScore(a, board, color);
      const scoreB = this.getMoveScore(b, board, color);
      return scoreB - scoreA;
    });
  }

  // Get move score for ordering
  private getMoveScore(move: ChessMove, board: any, color: "w" | "b"): number {
    let score = 0;

    // Captures
    const targetPiece = this.getPieceAt(board, move.to);
    if (targetPiece) {
      score +=
        this.pieceValues[targetPiece.type as keyof typeof this.pieceValues] *
        10;
    }

    // Piece values
    const fromPiece = this.getPieceAt(board, move.from);
    if (fromPiece) {
      score +=
        this.pieceValues[fromPiece.type as keyof typeof this.pieceValues];
    }

    // Center control for pawns
    if (fromPiece?.type === "p") {
      const centerFiles = [3, 4]; // d, e files
      if (centerFiles.includes(move.to.charCodeAt(0) - 97)) {
        score += 50;
      }
    }

    return score;
  }

  // Check if move is a blunder
  private isMoveBlunder(board: any, color: "w" | "b"): boolean {
    // Check if king is in check
    return this.isKingInCheck(board, color);
  }

  // Check if king is in check
  private isKingInCheck(board: any, color: "w" | "b"): boolean {
    const squares = board.squares || board;
    // Find king
    let kingPos = null;
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = squares[rank][file];
        if (piece?.type === "k" && piece.color === color) {
          kingPos = { rank, file };
          break;
        }
      }
    }

    if (!kingPos) return false;

    // Check if any opponent piece can attack king
    const opponentColor = color === "w" ? "b" : "w";
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = squares[rank][file];
        if (piece && piece.color === opponentColor) {
          if (
            this.canPieceAttackSquare(
              squares,
              rank,
              file,
              kingPos.rank,
              kingPos.file,
            )
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  // Check if piece can attack square
  private canPieceAttackSquare(
    board: any,
    fromRank: number,
    fromFile: number,
    toRank: number,
    toFile: number,
  ): boolean {
    const piece = board[fromRank][fromFile];
    if (!piece) return false;

    const fromSquare = String.fromCharCode(97 + fromFile) + (8 - fromRank);
    const toSquare = String.fromCharCode(97 + toFile) + (8 - toRank);

    // Generate moves for this piece
    const moves: ChessMove[] = [];
    this.generateBasicMoves(board, fromRank, fromFile, piece, moves);

    return moves.some((move) => move.to === toSquare);
  }

  // Check if pawn is isolated
  private isPawnIsolated(
    board: any,
    rank: number,
    file: number,
    color: "w" | "b",
  ): boolean {
    const squares = board.squares || board;
    const direction = color === "w" ? -1 : 1;

    // Check adjacent files
    for (
      let adjFile = Math.max(0, file - 1);
      adjFile <= Math.min(7, file + 1);
      adjFile++
    ) {
      if (adjFile === file) continue;

      for (let r = 0; r < 8; r++) {
        const piece = squares[r][adjFile];
        if (piece?.type === "p" && piece.color === color) {
          return false; // Found friendly pawn on adjacent file
        }
      }
    }

    return true;
  }

  // Evaluate king position
  private evaluateKingPosition(
    rank: number,
    file: number,
    color: "w" | "b",
  ): number {
    // Center distance
    const centerDistance = Math.abs(rank - 3.5) + Math.abs(file - 3.5);

    // Edge penalty
    let edgePenalty = 0;
    if (rank === 0 || rank === 7 || file === 0 || file === 7) {
      edgePenalty = 20;
    }

    return -(centerDistance * 10 + edgePenalty);
  }

  // Endgame evaluations
  private evaluateKRKEndgame(board: any): number {
    // King and rook vs king - should be winning
    return 500;
  }

  private evaluateKRPKEndgame(board: any): number {
    // King and rook and pawn vs king - should be winning
    return 600;
  }

  private evaluateKQKEndgame(board: any): number {
    // King and queen vs king - should be winning
    return 900;
  }

  private evaluateKPKEndgame(board: any): number {
    // King and pawn vs king - depends on position
    return 100;
  }

  // Utility methods
  private getPieceAt(board: any, square: string): any {
    const file = square.charCodeAt(0) - 97;
    const rank = 8 - parseInt(square[1]);
    return board[rank]?.[file];
  }

  private boardToFEN(board: any): string {
    // Handle both direct board arrays and ChessBoard objects
    const squares = board.squares || board;

    // Simplified FEN generation for transposition table
    let fen = "";
    let emptyCount = 0;

    for (let rank = 7; rank >= 0; rank--) {
      for (let file = 0; file < 8; file++) {
        const piece = squares[rank][file];
        if (piece === null) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          const symbol =
            piece.color === "w" ? piece.type.toUpperCase() : piece.type;
          fen += symbol;
        }
      }
      if (emptyCount > 0) {
        fen += emptyCount;
        emptyCount = 0;
      }
      if (rank > 0) fen += "/";
    }

    return fen;
  }

  private chooseRandomMove(moves: ChessMove[]): ChessMove {
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  }

  private copyBoard(board: ChessBoard): ChessBoard {
    const squares = board.squares || board;
    return {
      ...board,
      squares: squares.map((rank: any[]) =>
        rank.map((piece) => (piece ? { ...piece } : null)),
      ),
    };
  }

  private makeMoveOnBoard(board: any, move: ChessMove): void {
    const squares = board.squares || board;
    const fromRank = 8 - parseInt(move.from[1]);
    const fromFile = move.from.charCodeAt(0) - 97;
    const toRank = 8 - parseInt(move.to[1]);
    const toFile = move.to.charCodeAt(0) - 97;

    squares[toRank][toFile] = squares[fromRank][fromFile];
    squares[fromRank][fromFile] = null;
  }

  private getLegalMovesForBoard(
    board: ChessBoard,
    color: "w" | "b",
  ): ChessMove[] {
    const moves: ChessMove[] = [];
    const squares = board.squares || board;

    // Ensure squares is a valid 2D array
    if (!Array.isArray(squares) || squares.length === 0) {
      return moves;
    }

    for (let rank = 0; rank < 8; rank++) {
      if (!Array.isArray(squares[rank])) continue;
      for (let file = 0; file < 8; file++) {
        const piece = squares[rank][file];
        if (piece && piece.color === color) {
          this.generateBasicMoves(squares, rank, file, piece, moves);
        }
      }
    }

    return moves;
  }

  private generateBasicMoves(
    board: any,
    rank: number,
    file: number,
    piece: any,
    moves: ChessMove[],
  ): void {
    const fromSquare = String.fromCharCode(97 + file) + (8 - rank);

    switch (piece.type) {
      case "p":
        const direction = piece.color === "w" ? -1 : 1;
        const newRank = rank + direction;

        if (newRank >= 0 && newRank < 8 && !board[newRank][file]) {
          const toSquare = String.fromCharCode(97 + file) + (8 - newRank);
          moves.push({ from: fromSquare, to: toSquare });
        }
        break;

      case "r":
        this.addLinearMoves(board, rank, file, fromSquare, moves, [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ]);
        break;

      case "n":
        const knightMoves = [
          [-2, -1],
          [-2, 1],
          [-1, -2],
          [-1, 2],
          [1, -2],
          [1, 2],
          [2, -1],
          [2, 1],
        ];
        this.addJumpMoves(board, rank, file, fromSquare, moves, knightMoves);
        break;

      case "b":
        this.addLinearMoves(board, rank, file, fromSquare, moves, [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]);
        break;

      case "q":
        this.addLinearMoves(board, rank, file, fromSquare, moves, [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]);
        break;

      case "k":
        this.addJumpMoves(board, rank, file, fromSquare, moves, [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]);
        break;
    }
  }

  private addLinearMoves(
    board: any,
    rank: number,
    file: number,
    fromSquare: string,
    moves: ChessMove[],
    directions: number[][],
  ): void {
    for (const [dRank, dFile] of directions) {
      let newRank = rank + dRank;
      let newFile = file + dFile;

      while (newRank >= 0 && newRank < 8 && newFile >= 0 && newFile < 8) {
        const targetPiece = board[newRank][newFile];
        const toSquare = String.fromCharCode(97 + newFile) + (8 - newRank);

        if (!targetPiece) {
          moves.push({ from: fromSquare, to: toSquare });
        } else {
          if (targetPiece.color !== board[rank][file].color) {
            moves.push({ from: fromSquare, to: toSquare });
          }
          break;
        }

        newRank += dRank;
        newFile += dFile;
      }
    }
  }

  private addJumpMoves(
    board: any,
    rank: number,
    file: number,
    fromSquare: string,
    moves: ChessMove[],
    jumps: number[][],
  ): void {
    for (const [dRank, dFile] of jumps) {
      const newRank = rank + dRank;
      const newFile = file + dFile;

      if (newRank >= 0 && newRank < 8 && newFile >= 0 && newFile < 8) {
        const targetPiece = board[newRank][newFile];
        const toSquare = String.fromCharCode(97 + newFile) + (8 - newRank);

        if (!targetPiece || targetPiece.color !== board[rank][file].color) {
          moves.push({ from: fromSquare, to: toSquare });
        }
      }
    }
  }

  private getPositionValue(
    pieceType: string,
    color: "w" | "b",
    rank: number,
    file: number,
  ): number {
    const positionTable =
      this.positionValues[pieceType as keyof typeof this.positionValues];
    if (!positionTable) return 0;

    const actualRank = color === "w" ? rank : 7 - rank;
    return positionTable[actualRank][file];
  }

  setLevel(level: number): void {
    this.level = Math.max(1, Math.min(5, level));
  }

  getLevel(): number {
    return this.level;
  }

  private getOpeningBookMove(board: ChessBoard): ChessMove | undefined {
    const fen = this.boardToFEN(board);
    if (this.openingBook[fen as keyof typeof this.openingBook]) {
      const moves = this.openingBook[fen as keyof typeof this.openingBook];
      for (const moveStr of moves) {
        const move = this.getLegalMovesForBoard(board, board.turn).find(
          (m) => `${m.from}${m.to}` === moveStr,
        );
        if (move) {
          return move;
        }
      }
    }
    return undefined;
  }

  private storeTranspositionEntry(
    fen: string,
    score: number,
    depth: number,
    flag: "exact" | "alpha" | "beta",
    bestMove?: ChessMove,
  ): void {
    // Evict old entries if table is full
    if (this.transpositionTable.size >= this.maxTableSize) {
      this.evictOldEntries();
    }

    this.transpositionTable.set(fen, { score, depth, flag, bestMove });
  }

  private storeOrderingCache(fen: string, moves: ChessMove[]): void {
    // Evict old entries if cache is full
    if (this.moveOrderingCache.size >= this.maxOrderingCacheSize) {
      const firstKey = this.moveOrderingCache.keys().next().value;
      if (firstKey) {
        this.moveOrderingCache.delete(firstKey);
      }
    }

    this.moveOrderingCache.set(fen, moves);
  }

  private evictOldEntries(): void {
    // Simple LRU eviction - remove oldest entries
    const entries = Array.from(this.transpositionTable.entries());
    const toRemove = Math.floor(entries.length * 0.1); // Remove 10%

    for (let i = 0; i < toRemove; i++) {
      const key = entries[i][0];
      if (key) {
        this.transpositionTable.delete(key);
      }
    }
  }

  private resetSearchStats(): void {
    this.nodesEvaluated = 0;
    this.searchStartTime = Date.now();
  }

  private isTimeUp(): boolean {
    return Date.now() - this.searchStartTime > this.maxSearchTime;
  }
}
