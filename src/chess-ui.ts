import chalk from 'chalk';
import type { ChessBoard, ChessMove, ChessGame, ChessPiece } from './types.js';

export class ChessUI {
  private readonly pieceSymbols = {
    'w': {
      'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙'
    },
    'b': {
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    }
  };

  // Display the chess board
  displayBoard(board: ChessBoard, highlightSquare?: string): void {
    console.log('\n' + chalk.bold.cyan('  Chess Board'));
    console.log(chalk.gray('    a   b   c   d   e   f   g   h'));
    console.log(chalk.gray('  ┌───┬───┬───┬───┬───┬───┬───┬───┐'));

    for (let rank = 0; rank < 8; rank++) {
      const row = 8 - rank;
      let line = chalk.gray(`${row} │`);
      
      for (let file = 0; file < 8; file++) {
        const square = String.fromCharCode(97 + file) + (8 - rank);
        const piece = board.squares[rank][file];
        const isHighlighted = highlightSquare === square;
        
        // Determine background color
        const isLightSquare = (rank + file) % 2 === 0;
        const bgColor = isHighlighted 
          ? chalk.bgYellow 
          : isLightSquare 
            ? chalk.bgWhite 
            : chalk.bgGray;
        
        // Determine piece color
        let pieceColor = chalk.black;
        let symbol = ' ';
        
        if (piece) {
          symbol = this.pieceSymbols[piece.color][piece.type];
          pieceColor = piece.color === 'w' ? chalk.white : chalk.black;
        }
        
        line += bgColor(pieceColor(` ${symbol} `)) + chalk.gray('│');
      }
      
      console.log(line + chalk.gray(` ${row}`));
      
      if (rank < 7) {
        console.log(chalk.gray('  ├───┼───┼───┼───┼───┼───┼───┼───┤'));
      }
    }
    
    console.log(chalk.gray('  └───┴───┴───┴───┴───┴───┴───┴───┘'));
    console.log(chalk.gray('    a   b   c   d   e   f   g   h'));
    
    // Show current turn
    const turnText = board.turn === 'w' ? 'White' : 'Black';
    console.log(chalk.bold(`\nCurrent turn: ${turnText}`));
  }

  // Display game status
  displayGameStatus(game: ChessGame): void {
    console.log(chalk.bold.cyan('\n=== Game Status ==='));
    
    if (game.isCheckmate) {
      console.log(chalk.bold.red('🎯 CHECKMATE!'));
      const winner = game.turn === 'w' ? 'Black' : 'White';
      console.log(chalk.green(`${winner} wins!`));
    } else if (game.isCheck) {
      console.log(chalk.bold.yellow('⚡ CHECK!'));
    } else if (game.isDraw) {
      console.log(chalk.bold.blue('🤝 DRAW'));
    } else if (game.isStalemate) {
      console.log(chalk.bold.blue('🤝 STALEMATE'));
    } else {
      console.log(chalk.green('Game in progress'));
    }
    
    console.log(chalk.gray(`Move: ${game.moveNumber}`));
    console.log(chalk.gray(`FEN: ${game.fen}`));
  }

  // Display move history
  displayMoveHistory(moves: ChessMove[]): void {
    if (moves.length === 0) {
      console.log(chalk.gray('No moves made yet'));
      return;
    }

    console.log(chalk.bold.cyan('\n=== Move History ==='));
    
    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = moves[i];
      const blackMove = moves[i + 1];
      
      let line = chalk.gray(`${moveNumber.toString().padStart(2)}. `);
      line += chalk.white(whiteMove.san || `${whiteMove.from}-${whiteMove.to}`);
      
      if (blackMove) {
        line += chalk.gray('  ') + chalk.black(blackMove.san || `${blackMove.from}-${blackMove.to}`);
      }
      
      console.log(line);
    }
  }

  // Display legal moves for a square
  displayLegalMoves(moves: ChessMove[], square: string): void {
    if (moves.length === 0) {
      console.log(chalk.yellow(`No legal moves for ${square}`));
      return;
    }

    console.log(chalk.bold.cyan(`\nLegal moves for ${square}:`));
    moves.forEach((move, index) => {
      const moveText = move.san || `${move.from}-${move.to}`;
      console.log(chalk.gray(`${index + 1}. `) + chalk.white(moveText));
    });
  }

  // Display all legal moves
  displayAllLegalMoves(moves: ChessMove[]): void {
    if (moves.length === 0) {
      console.log(chalk.yellow('No legal moves available'));
      return;
    }

    console.log(chalk.bold.cyan(`\nAll legal moves (${moves.length}):`));
    const movesByPiece: Record<string, ChessMove[]> = {};
    
    moves.forEach(move => {
      const piece = move.from;
      if (!movesByPiece[piece]) {
        movesByPiece[piece] = [];
      }
      movesByPiece[piece].push(move);
    });

    Object.entries(movesByPiece).forEach(([piece, pieceMoves]) => {
      console.log(chalk.bold.white(`\n${piece}:`));
      pieceMoves.forEach(move => {
        const moveText = move.san || `${move.from}-${move.to}`;
        console.log(chalk.gray('  • ') + chalk.white(moveText));
      });
    });
  }

  // Display game menu
  displayMenu(): void {
    console.log(chalk.bold.cyan('\n=== Chess MCP Menu ==='));
    console.log(chalk.white('Commands:'));
    console.log(chalk.gray('  move <from>-<to>     ') + chalk.white('Make a move (e.g., e2-e4)'));
    console.log(chalk.gray('  moves <square>       ') + chalk.white('Show legal moves for a square'));
    console.log(chalk.gray('  all-moves            ') + chalk.white('Show all legal moves'));
    console.log(chalk.gray('  history              ') + chalk.white('Show move history'));
    console.log(chalk.gray('  status               ') + chalk.white('Show game status'));
    console.log(chalk.gray('  board                ') + chalk.white('Display board'));
    console.log(chalk.gray('  undo                 ') + chalk.white('Undo last move'));
    console.log(chalk.gray('  reset                ') + chalk.white('Reset game'));
    console.log(chalk.gray('  fen <position>       ') + chalk.white('Load position from FEN'));
    console.log(chalk.gray('  pgn <game>           ') + chalk.white('Load game from PGN'));
    console.log(chalk.gray('  analyze              ') + chalk.white('Analyze current position'));
    console.log(chalk.gray('  mode <type> [level]  ') + chalk.white('Set game mode (human-vs-human, human-vs-ai, ai-vs-ai)'));
    console.log(chalk.gray('  ai                   ') + chalk.white('Make AI play a move'));
    console.log(chalk.gray('  help                 ') + chalk.white('Show this menu'));
    console.log(chalk.gray('  quit                 ') + chalk.white('Exit game'));
  }

  // Display welcome message
  displayWelcome(): void {
    console.log(chalk.bold.cyan('♔♕♖♗♘♙ Welcome to Chess MCP! ♟♞♝♜♛♚'));
    console.log(chalk.gray('A Model Context Protocol server for playing chess'));
    console.log(chalk.gray('Type "help" for available commands\n'));
  }

  // Display error message
  displayError(message: string): void {
    console.log(chalk.bold.red('❌ Error: ') + chalk.red(message));
  }

  // Display success message
  displaySuccess(message: string): void {
    console.log(chalk.bold.green('✅ ') + chalk.green(message));
  }

  // Display info message
  displayInfo(message: string): void {
    console.log(chalk.bold.blue('ℹ️  ') + chalk.blue(message));
  }

  // Display analysis results
  displayAnalysis(analysis: any): void {
    console.log(chalk.bold.cyan('\n=== Position Analysis ==='));
    console.log(chalk.gray(`Depth: ${analysis.depth}`));
    console.log(chalk.gray(`Evaluation: ${analysis.evaluation > 0 ? '+' : ''}${analysis.evaluation}`));
    
    if (analysis.bestMoves && analysis.bestMoves.length > 0) {
      console.log(chalk.bold.white('\nBest moves:'));
      analysis.bestMoves.forEach((move: ChessMove, index: number) => {
        const moveText = move.san || `${move.from}-${move.to}`;
        console.log(chalk.gray(`${index + 1}. `) + chalk.white(moveText));
      });
    }
  }

  // Clear screen
  clearScreen(): void {
    console.clear();
  }

  // Format move input
  formatMoveInput(input: string): { from: string; to: string; promotion?: string } | null {
    // Handle various move formats: e2e4, e2-e4, e2 e4, etc.
    const cleanInput = input.replace(/[-\s]/g, '').toLowerCase();
    
    if (cleanInput.length === 4) {
      return {
        from: cleanInput.substring(0, 2),
        to: cleanInput.substring(2, 4)
      };
    } else if (cleanInput.length === 5) {
      return {
        from: cleanInput.substring(0, 2),
        to: cleanInput.substring(2, 4),
        promotion: cleanInput.substring(4, 5)
      };
    }
    
    return null;
  }
} 