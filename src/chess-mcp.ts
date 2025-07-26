import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { ChessEngine } from './chess-engine.js';
import { ChessUI } from './chess-ui.js';
import { ChessAI } from './chess-ai.js';
import type { ChessMove, ChessGame, GameMode, ChessPiece } from './types.js';

export class ChessMCPServer {
  private server: Server;
  private chessEngine: ChessEngine;
  private chessUI: ChessUI;
  private chessAI: ChessAI;
  private currentGameMode: GameMode = { type: 'human-vs-human' };
  private gameHistory: ChessGame[] = [];

  constructor() {
    this.server = new Server({
      name: 'chess-mcp',
      version: '1.0.0',
    });

    this.chessEngine = new ChessEngine();
    this.chessUI = new ChessUI();
    this.chessAI = new ChessAI(1);

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'start_new_game',
            description: 'Start a new chess game with specified mode',
            inputSchema: {
              type: 'object',
              properties: {
                mode: {
                  type: 'string',
                  enum: ['human-vs-human', 'human-vs-ai', 'ai-vs-ai'],
                  description: 'Game mode to play'
                },
                aiLevel: {
                  type: 'number',
                  minimum: 1,
                  maximum: 5,
                  description: 'AI difficulty level (1-5)'
                }
              },
              required: ['mode']
            }
          },
          {
            name: 'make_move',
            description: 'Make a chess move using algebraic notation',
            inputSchema: {
              type: 'object',
              properties: {
                move: {
                  type: 'string',
                  description: 'Move in algebraic notation (e.g., "e2e4", "Nf3", "O-O")'
                }
              },
              required: ['move']
            }
          },
          {
            name: 'get_board_state',
            description: 'Get the current state of the chess board',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'get_legal_moves',
            description: 'Get all legal moves for a specific square or all pieces',
            inputSchema: {
              type: 'object',
              properties: {
                square: {
                  type: 'string',
                  description: 'Square to get moves for (e.g., "e2") or omit for all moves'
                }
              }
            }
          },
          {
            name: 'get_move_history',
            description: 'Get the complete move history of the current game',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'undo_move',
            description: 'Undo the last move made',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'reset_game',
            description: 'Reset the game to the starting position',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'load_position',
            description: 'Load a chess position from FEN notation',
            inputSchema: {
              type: 'object',
              properties: {
                fen: {
                  type: 'string',
                  description: 'FEN notation of the position to load'
                }
              },
              required: ['fen']
            }
          },
          {
            name: 'analyze_position',
            description: 'Analyze the current position and suggest best moves',
            inputSchema: {
              type: 'object',
              properties: {
                depth: {
                  type: 'number',
                  minimum: 1,
                  maximum: 5,
                  description: 'Analysis depth (1-5)'
                }
              }
            }
          },
          {
            name: 'get_game_status',
            description: 'Get the current game status (check, checkmate, draw, etc.)',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'ai_move',
            description: 'Make the AI play a move (for AI vs Human or AI vs AI games)',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'save_game',
            description: 'Save the current game to PGN format',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'load_game',
            description: 'Load a game from PGN format',
            inputSchema: {
              type: 'object',
              properties: {
                pgn: {
                  type: 'string',
                  description: 'PGN format game to load'
                }
              },
              required: ['pgn']
            }
          }
        ] as Tool[]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'start_new_game':
            return await this.handleStartNewGame(args);
          
          case 'make_move':
            return await this.handleMakeMove(args);
          
          case 'get_board_state':
            return await this.handleGetBoardState();
          
          case 'get_legal_moves':
            return await this.handleGetLegalMoves(args);
          
          case 'get_move_history':
            return await this.handleGetMoveHistory();
          
          case 'undo_move':
            return await this.handleUndoMove();
          
          case 'reset_game':
            return await this.handleResetGame();
          
          case 'load_position':
            return await this.handleLoadPosition(args);
          
          case 'analyze_position':
            return await this.handleAnalyzePosition(args);
          
          case 'get_game_status':
            return await this.handleGetGameStatus();
          
          case 'ai_move':
            return await this.handleAIMove();
          
          case 'save_game':
            return await this.handleSaveGame();
          
          case 'load_game':
            return await this.handleLoadGame(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ]
        };
      }
    });
  }

  private async handleStartNewGame(args: any): Promise<any> {
    const mode = args.mode || 'human-vs-human';
    const aiLevel = args.aiLevel || 1;

    this.currentGameMode = { type: mode, aiLevel };
    this.chessEngine.reset();
    this.chessAI.setLevel(aiLevel);

    const gameState = this.chessEngine.getGameState();
    this.gameHistory.push(gameState);

    return {
      content: [
        {
          type: 'text',
          text: `New ${mode} game started! AI level: ${aiLevel}\n\n${this.formatBoardDisplay()}`
        }
      ]
    };
  }

  private async handleMakeMove(args: any): Promise<any> {
    const move = args.move;
    
    if (!move) {
      throw new Error('Move is required');
    }

    const success = this.chessEngine.makeMove(move);
    
    if (!success) {
      throw new Error(`Invalid move: ${move}`);
    }

    const gameState = this.chessEngine.getGameState();
    this.gameHistory.push(gameState);

    let response = `Move ${move} made successfully!\n\n${this.formatBoardDisplay()}`;

    // Check if game is over
    if (gameState.isCheckmate) {
      const winner = gameState.turn === 'w' ? 'Black' : 'White';
      response += `\n🎯 CHECKMATE! ${winner} wins!`;
    } else if (gameState.isCheck) {
      response += '\n⚡ CHECK!';
    } else if (gameState.isDraw) {
      response += '\n🤝 DRAW';
    }

    return {
      content: [
        {
          type: 'text',
          text: response
        }
      ]
    };
  }

  private async handleGetBoardState(): Promise<any> {
    const board = this.chessEngine.getBoard();
    const gameState = this.chessEngine.getGameState();

    return {
      content: [
        {
          type: 'text',
          text: this.formatBoardDisplay()
        }
      ]
    };
  }

  private async handleGetLegalMoves(args: any): Promise<any> {
    const square = args.square;
    const moves = square 
      ? this.chessEngine.getLegalMoves(square)
      : this.chessEngine.getAllLegalMoves();

    if (moves.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: square ? `No legal moves for ${square}` : 'No legal moves available'
          }
        ]
      };
    }

    const movesText = moves.map(move => 
      move.san || `${move.from}-${move.to}`
    ).join(', ');

    return {
      content: [
        {
          type: 'text',
          text: `Legal moves${square ? ` for ${square}` : ''}: ${movesText}`
        }
      ]
    };
  }

  private async handleGetMoveHistory(): Promise<any> {
    const moves = this.chessEngine.getMoveHistory();
    
    if (moves.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No moves made yet'
          }
        ]
      };
    }

    const historyText = moves.map((move, index) => {
      const moveNumber = Math.floor(index / 2) + 1;
      const moveText = move.san || `${move.from}-${move.to}`;
      return `${moveNumber}. ${moveText}`;
    }).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `Move History:\n${historyText}`
        }
      ]
    };
  }

  private async handleUndoMove(): Promise<any> {
    const success = this.chessEngine.undoMove();
    
    if (!success) {
      throw new Error('No moves to undo');
    }

    return {
      content: [
        {
          type: 'text',
          text: `Move undone!\n\n${this.formatBoardDisplay()}`
        }
      ]
    };
  }

  private async handleResetGame(): Promise<any> {
    this.chessEngine.reset();
    const gameState = this.chessEngine.getGameState();
    this.gameHistory.push(gameState);

    return {
      content: [
        {
          type: 'text',
          text: `Game reset to starting position!\n\n${this.formatBoardDisplay()}`
        }
      ]
    };
  }

  private async handleLoadPosition(args: any): Promise<any> {
    const fen = args.fen;
    
    if (!fen) {
      throw new Error('FEN is required');
    }

    const success = this.chessEngine.loadFen(fen);
    
    if (!success) {
      throw new Error('Invalid FEN position');
    }

    const gameState = this.chessEngine.getGameState();
    this.gameHistory.push(gameState);

    return {
      content: [
        {
          type: 'text',
          text: `Position loaded from FEN!\n\n${this.formatBoardDisplay()}`
        }
      ]
    };
  }

  private async handleAnalyzePosition(args: any): Promise<any> {
    const depth = args.depth || 3;
    const analysis = this.chessEngine.analyzePosition(depth);

    const bestMovesText = analysis.bestMoves.map((move, index) => {
      const moveText = move.san || `${move.from}-${move.to}`;
      return `${index + 1}. ${moveText}`;
    }).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `Position Analysis (Depth: ${depth}):\nEvaluation: ${analysis.evaluation > 0 ? '+' : ''}${analysis.evaluation}\n\nBest moves:\n${bestMovesText}`
        }
      ]
    };
  }

  private async handleGetGameStatus(): Promise<any> {
    const gameState = this.chessEngine.getGameState();
    
    let status = 'Game in progress';
    if (gameState.isCheckmate) {
      const winner = gameState.turn === 'w' ? 'Black' : 'White';
      status = `CHECKMATE! ${winner} wins!`;
    } else if (gameState.isCheck) {
      status = 'CHECK!';
    } else if (gameState.isDraw) {
      status = 'DRAW';
    } else if (gameState.isStalemate) {
      status = 'STALEMATE';
    }

    return {
      content: [
        {
          type: 'text',
          text: `Game Status: ${status}\nMove: ${gameState.moveNumber}\nTurn: ${gameState.turn === 'w' ? 'White' : 'Black'}`
        }
      ]
    };
  }

  private async handleAIMove(): Promise<any> {
    const legalMoves = this.chessEngine.getAllLegalMoves();
    
    if (legalMoves.length === 0) {
      throw new Error('No legal moves available for AI');
    }

    const board = this.chessEngine.getBoard();
    const gameState = this.chessEngine.getGameState();
    const aiMove = this.chessAI.chooseMove(legalMoves, board.squares, gameState.turn);

    const success = this.chessEngine.makeMove(aiMove);
    
    if (!success) {
      throw new Error('AI failed to make a valid move');
    }

    const newGameState = this.chessEngine.getGameState();
    this.gameHistory.push(newGameState);

    const moveText = aiMove.san || `${aiMove.from}-${aiMove.to}`;
    let response = `AI played: ${moveText}\n\n${this.formatBoardDisplay()}`;

    if (newGameState.isCheckmate) {
      const winner = newGameState.turn === 'w' ? 'Black' : 'White';
      response += `\n🎯 CHECKMATE! ${winner} wins!`;
    } else if (newGameState.isCheck) {
      response += '\n⚡ CHECK!';
    }

    return {
      content: [
        {
          type: 'text',
          text: response
        }
      ]
    };
  }

  private async handleSaveGame(): Promise<any> {
    const pgn = this.chessEngine.getPgn();
    
    return {
      content: [
        {
          type: 'text',
          text: `Game saved in PGN format:\n\n${pgn}`
        }
      ]
    };
  }

  private async handleLoadGame(args: any): Promise<any> {
    const pgn = args.pgn;
    
    if (!pgn) {
      throw new Error('PGN is required');
    }

    const success = this.chessEngine.loadPgn(pgn);
    
    if (!success) {
      throw new Error('Invalid PGN format');
    }

    const gameState = this.chessEngine.getGameState();
    this.gameHistory.push(gameState);

    return {
      content: [
        {
          type: 'text',
          text: `Game loaded from PGN!\n\n${this.formatBoardDisplay()}`
        }
      ]
    };
  }

  private formatBoardDisplay(): string {
    const board = this.chessEngine.getBoard();
    const gameState = this.chessEngine.getGameState();
    
    // Create a simple ASCII representation
    let display = '\n  Chess Board\n';
    display += '    a b c d e f g h\n';
    display += '  ┌─────────────────┐\n';
    
    for (let rank = 0; rank < 8; rank++) {
      const row = 8 - rank;
      display += ` ${row} │`;
      
      for (let file = 0; file < 8; file++) {
        const piece = board.squares[rank][file];
        if (piece) {
          const symbols = {
            'w': { 'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙' },
            'b': { 'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟' }
          };
          display += ` ${symbols[piece.color][piece.type]}`;
        } else {
          display += ' ·';
        }
      }
      
      display += ` │ ${row}\n`;
    }
    
    display += '  └─────────────────┘\n';
    display += '    a b c d e f g h\n';
    display += `\nCurrent turn: ${gameState.turn === 'w' ? 'White' : 'Black'}`;
    
    return display;
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Chess MCP server started');
  }
} 