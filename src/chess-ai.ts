import type { ChessMove } from "./types.js";

export class ChessAI {
  private readonly pieceValues = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
  };

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

  constructor(private level: number = 1) {}

  // Choose the best move for the AI
  chooseMove(legalMoves: ChessMove[], board: any, color: "w" | "b"): ChessMove {
    if (legalMoves.length === 0) {
      throw new Error("No legal moves available");
    }

    // For level 1, just choose a random move
    if (this.level === 1) {
      return this.chooseRandomMove(legalMoves);
    }

    // For higher levels, use minimax algorithm
    let bestMove = legalMoves[0];
    let bestScore = color === "w" ? -Infinity : Infinity;

    for (const move of legalMoves) {
      // Make the move on a copy of the board
      const boardCopy = this.copyBoard(board);
      this.makeMoveOnBoard(boardCopy, move);

      // Evaluate the position
      const score = this.minimax(
        boardCopy,
        this.level - 1,
        -Infinity,
        Infinity,
        color === "w" ? false : true,
      );

      if (color === "w" && score > bestScore) {
        bestScore = score;
        bestMove = move;
      } else if (color === "b" && score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  // Minimax algorithm with alpha-beta pruning
  private minimax(
    board: any,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
  ): number {
    if (depth === 0) {
      return this.evaluatePosition(board);
    }

    const legalMoves = this.getLegalMovesForBoard(
      board,
      isMaximizing ? "w" : "b",
    );

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of legalMoves) {
        const boardCopy = this.copyBoard(board);
        this.makeMoveOnBoard(boardCopy, move);
        const score = this.minimax(boardCopy, depth - 1, alpha, beta, false);
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of legalMoves) {
        const boardCopy = this.copyBoard(board);
        this.makeMoveOnBoard(boardCopy, move);
        const score = this.minimax(boardCopy, depth - 1, alpha, beta, true);
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return minScore;
    }
  }

  // Evaluate the current position
  private evaluatePosition(board: any): number {
    let score = 0;

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece) {
          const pieceValue =
            this.pieceValues[piece.type as keyof typeof this.pieceValues] || 0;
          const positionValue = this.getPositionValue(
            piece.type,
            piece.color,
            rank,
            file,
          );
          const totalValue = pieceValue * 100 + positionValue;

          score += piece.color === "w" ? totalValue : -totalValue;
        }
      }
    }

    return score;
  }

  // Get position value for a piece
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

  // Choose a random move (for level 1)
  private chooseRandomMove(moves: ChessMove[]): ChessMove {
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  }

  // Copy board for analysis
  private copyBoard(board: any): any {
    return board.map((rank: any[]) =>
      rank.map((piece) => (piece ? { ...piece } : null)),
    );
  }

  // Make a move on the board
  private makeMoveOnBoard(board: any, move: ChessMove): void {
    // This is a simplified move implementation
    // In a real implementation, you'd need to handle all chess rules
    const fromRank = 8 - parseInt(move.from[1]);
    const fromFile = move.from.charCodeAt(0) - 97;
    const toRank = 8 - parseInt(move.to[1]);
    const toFile = move.to.charCodeAt(0) - 97;

    board[toRank][toFile] = board[fromRank][fromFile];
    board[fromRank][fromFile] = null;
  }

  // Get legal moves for a board position (simplified)
  private getLegalMovesForBoard(board: any, color: "w" | "b"): ChessMove[] {
    const moves: ChessMove[] = [];

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece && piece.color === color) {
          // Generate basic moves for each piece type
          this.generateBasicMoves(board, rank, file, piece, moves);
        }
      }
    }

    return moves;
  }

  // Generate basic moves for a piece (simplified)
  private generateBasicMoves(
    board: any,
    rank: number,
    file: number,
    piece: any,
    moves: ChessMove[],
  ): void {
    const fromSquare = String.fromCharCode(97 + file) + (8 - rank);

    // This is a very simplified move generation
    // In reality, you'd need to implement proper chess move generation
    switch (piece.type) {
      case "p":
        // Pawn moves (simplified)
        const direction = piece.color === "w" ? -1 : 1;
        const newRank = rank + direction;

        if (newRank >= 0 && newRank < 8 && !board[newRank][file]) {
          const toSquare = String.fromCharCode(97 + file) + (8 - newRank);
          moves.push({ from: fromSquare, to: toSquare });
        }
        break;

      case "r":
        // Rook moves (simplified)
        this.addLinearMoves(board, rank, file, fromSquare, moves, [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ]);
        break;

      case "n":
        // Knight moves
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
        // Bishop moves (simplified)
        this.addLinearMoves(board, rank, file, fromSquare, moves, [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]);
        break;

      case "q":
        // Queen moves (simplified)
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
        // King moves (simplified)
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

  // Add linear moves (for rooks, bishops, queens)
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

  // Add jump moves (for knights, kings)
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

  // Set AI level
  setLevel(level: number): void {
    this.level = Math.max(1, Math.min(5, level));
  }

  // Get current AI level
  getLevel(): number {
    return this.level;
  }
}
