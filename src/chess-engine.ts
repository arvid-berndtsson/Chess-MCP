import { Chess } from 'chess.js';
import type { ChessMove, ChessGame, ChessBoard, ChessAnalysis, ChessPiece } from './types.js';

export class ChessEngine {
  private chess: Chess;
  private gameHistory: ChessGame[] = [];

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  // Get current game state
  getGameState(): ChessGame {
    return {
      id: this.generateGameId(),
      fen: this.chess.fen(),
      moves: this.getMoveHistory(),
      isCheck: this.chess.isCheck(),
      isCheckmate: this.chess.isCheckmate(),
      isDraw: this.chess.isDraw(),
      isStalemate: this.chess.isStalemate(),
      turn: this.chess.turn(),
      moveNumber: Math.ceil(this.chess.moveNumber() / 2)
    };
  }

  // Get visual board representation
  getBoard(): ChessBoard {
    const board = this.chess.board();
    return {
      squares: board,
      turn: this.chess.turn(),
      castling: {
        w: { k: this.chess.moves({ square: 'e1' }).some(m => m.includes('O-O')), q: this.chess.moves({ square: 'e1' }).some(m => m.includes('O-O-O')) },
        b: { k: this.chess.moves({ square: 'e8' }).some(m => m.includes('O-O')), q: this.chess.moves({ square: 'e8' }).some(m => m.includes('O-O-O')) }
      },
      enPassant: this.chess.moves({ verbose: true }).find(m => m.flags.includes('e'))?.to || null,
      halfMoveClock: this.chess.moves().length,
      fullMoveNumber: this.chess.moveNumber()
    };
  }

  // Make a move
  makeMove(move: string | ChessMove): boolean {
    try {
      if (typeof move === 'string') {
        this.chess.move(move);
      } else {
        this.chess.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion as any
        });
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get all legal moves for a square
  getLegalMoves(square?: string): ChessMove[] {
    const moves = this.chess.moves({ square: square as any, verbose: true });
    return moves.map(move => ({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
      san: move.san,
      lan: move.lan
    }));
  }

  // Get all legal moves for current position
  getAllLegalMoves(): ChessMove[] {
    return this.getLegalMoves();
  }

  // Check if a move is legal
  isLegalMove(move: ChessMove): boolean {
    const legalMoves = this.getLegalMoves(move.from);
    return legalMoves.some(legalMove => 
      legalMove.to === move.to && legalMove.promotion === move.promotion
    );
  }

  // Undo last move
  undoMove(): boolean {
    try {
      this.chess.undo();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Reset game to starting position
  reset(): void {
    this.chess.reset();
  }

  // Load position from FEN
  loadFen(fen: string): boolean {
    try {
      this.chess.load(fen);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get move history
  getMoveHistory(): ChessMove[] {
    const history = this.chess.history({ verbose: true });
    return history.map(move => ({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
      san: move.san,
      lan: move.lan
    }));
  }

  // Get PGN representation
  getPgn(): string {
    return this.chess.pgn();
  }

  // Load game from PGN
  loadPgn(pgn: string): boolean {
    try {
      this.chess.loadPgn(pgn);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Analyze position (simple evaluation)
  analyzePosition(depth: number = 3): ChessAnalysis {
    const legalMoves = this.getAllLegalMoves();
    const bestMoves = legalMoves.slice(0, 3); // Simple: just return first 3 moves
    
    // Simple evaluation based on material and position
    const evaluation = this.simpleEvaluation();
    
    return {
      position: this.chess.fen(),
      bestMoves,
      evaluation,
      depth
    };
  }

  // Simple material evaluation
  private simpleEvaluation(): number {
    const pieceValues = {
      'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
    };
    
    let evaluation = 0;
    const board = this.chess.board();
    
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece) {
          const value = pieceValues[piece.type as keyof typeof pieceValues] || 0;
          evaluation += piece.color === 'w' ? value : -value;
        }
      }
    }
    
    return evaluation;
  }

  // Generate unique game ID
  private generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if game is over
  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  // Get game result
  getGameResult(): string {
    if (this.chess.isCheckmate()) {
      return this.chess.turn() === 'w' ? 'Black wins' : 'White wins';
    } else if (this.chess.isDraw()) {
      return 'Draw';
    } else if (this.chess.isStalemate()) {
      return 'Stalemate';
    } else if (this.chess.isThreefoldRepetition()) {
      return 'Draw by repetition';
    } else if (this.chess.isInsufficientMaterial()) {
      return 'Draw by insufficient material';
    }
    return 'Game in progress';
  }
} 