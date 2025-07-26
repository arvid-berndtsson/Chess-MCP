export interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
  san?: string;
  lan?: string;
}

export interface ChessGame {
  id: string;
  fen: string;
  moves: ChessMove[];
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isStalemate: boolean;
  turn: "w" | "b";
  moveNumber: number;
}

export interface ChessPiece {
  type: "p" | "n" | "b" | "r" | "q" | "k";
  color: "w" | "b";
}

export interface ChessBoard {
  squares: (ChessPiece | null)[][];
  turn: "w" | "b";
  castling: {
    w: { k: boolean; q: boolean };
    b: { k: boolean; q: boolean };
  };
  enPassant: string | null;
  halfMoveClock: number;
  fullMoveNumber: number;
}

export interface GameMode {
  type: "human-vs-human" | "human-vs-ai" | "ai-vs-ai";
  aiLevel?: number;
  timeControl?: number; // seconds per player
}

export interface ChessAnalysis {
  position: string;
  bestMoves: ChessMove[];
  evaluation: number;
  depth: number;
}

export interface ChessStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  averageGameLength: number;
  favoriteOpenings: string[];
}
