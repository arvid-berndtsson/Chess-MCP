import readline from "readline";
import { ChessEngine } from "./chess-engine.js";
import { ChessUI } from "./chess-ui.js";
import { ChessAI, SmartChessAI } from "./chess-ai.js";
import type { GameMode } from "./types.js";

export class InteractiveCLI {
  private chessEngine: ChessEngine;
  private chessUI: ChessUI;
  private chessAI: ChessAI;
  private smartAI: SmartChessAI;
  private gameMode: GameMode = { type: "human-vs-human" };
  private rl: readline.Interface;

  constructor() {
    this.chessEngine = new ChessEngine();
    this.chessUI = new ChessUI();
    this.chessAI = new ChessAI(1);
    this.smartAI = new SmartChessAI(1);
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async start(): Promise<void> {
    this.chessUI.displayWelcome();
    this.chessUI.displayMenu();

    await this.gameLoop();
  }

  private async gameLoop(): Promise<void> {
    while (true) {
      try {
        const input = await this.prompt("chess> ");
        const command = input.trim().toLowerCase();

        if (command === "quit" || command === "exit") {
          this.chessUI.displayInfo("Thanks for playing!");
          break;
        }

        await this.processCommand(command);
      } catch (error) {
        this.chessUI.displayError(
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    }

    this.rl.close();
  }

  private async processCommand(command: string): Promise<void> {
    const parts = command.split(" ");
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case "move":
        await this.handleMove(args);
        break;

      case "moves":
        await this.handleMoves(args);
        break;

      case "all-moves":
        await this.handleAllMoves();
        break;

      case "history":
        await this.handleHistory();
        break;

      case "status":
        await this.handleStatus();
        break;

      case "board":
        await this.handleBoard();
        break;

      case "undo":
        await this.handleUndo();
        break;

      case "reset":
        await this.handleReset();
        break;

      case "fen":
        await this.handleFen(args);
        break;

      case "pgn":
        await this.handlePgn(args);
        break;

      case "analyze":
        await this.handleAnalyze(args);
        break;

      case "ai":
        await this.handleAI();
        break;

      case "mode":
        await this.handleMode(args);
        break;

      case "help":
        this.chessUI.displayMenu();
        break;

      default:
        this.chessUI.displayError(
          `Unknown command: ${cmd}. Type 'help' for available commands.`,
        );
    }
  }

  private async handleMove(args: string[]): Promise<void> {
    if (args.length === 0) {
      this.chessUI.displayError('Please specify a move (e.g., "move e2e4")');
      return;
    }

    const move = args.join(" ");
    const success = this.chessEngine.makeMove(move);

    if (!success) {
      this.chessUI.displayError(`Invalid move: ${move}`);
      return;
    }

    this.chessUI.displaySuccess(`Move ${move} made successfully!`);
    this.displayCurrentState();

    // Check if game is over
    const gameState = this.chessEngine.getGameState();
    if (gameState.isCheckmate) {
      const winner = gameState.turn === "w" ? "Black" : "White";
      this.chessUI.displaySuccess(`🎯 CHECKMATE! ${winner} wins!`);
    } else if (gameState.isCheck) {
      this.chessUI.displayInfo("⚡ CHECK!");
    } else if (gameState.isDraw) {
      this.chessUI.displayInfo("🤝 DRAW");
    }

    // If AI vs Human and it's AI's turn
    if (this.gameMode.type === "human-vs-ai" && gameState.turn === "b") {
      await this.makeAIMove();
    }
  }

  private async handleMoves(args: string[]): Promise<void> {
    const square = args[0];
    if (!square) {
      this.chessUI.displayError('Please specify a square (e.g., "moves e2")');
      return;
    }

    const moves = this.chessEngine.getLegalMoves(square);
    this.chessUI.displayLegalMoves(moves, square);
  }

  private async handleAllMoves(): Promise<void> {
    const moves = this.chessEngine.getAllLegalMoves();
    this.chessUI.displayAllLegalMoves(moves);
  }

  private async handleHistory(): Promise<void> {
    const moves = this.chessEngine.getMoveHistory();
    this.chessUI.displayMoveHistory(moves);
  }

  private async handleStatus(): Promise<void> {
    const gameState = this.chessEngine.getGameState();
    this.chessUI.displayGameStatus(gameState);
  }

  private async handleBoard(): Promise<void> {
    const board = this.chessEngine.getBoard();
    this.chessUI.displayBoard(board);
  }

  private async handleUndo(): Promise<void> {
    const success = this.chessEngine.undoMove();

    if (!success) {
      this.chessUI.displayError("No moves to undo");
      return;
    }

    this.chessUI.displaySuccess("Move undone!");
    this.displayCurrentState();
  }

  private async handleReset(): Promise<void> {
    this.chessEngine.reset();
    this.chessUI.displaySuccess("Game reset to starting position!");
    this.displayCurrentState();
  }

  private async handleFen(args: string[]): Promise<void> {
    if (args.length === 0) {
      this.chessUI.displayError("Please provide a FEN position");
      return;
    }

    const fen = args.join(" ");
    const success = this.chessEngine.loadFen(fen);

    if (!success) {
      this.chessUI.displayError("Invalid FEN position");
      return;
    }

    this.chessUI.displaySuccess("Position loaded from FEN!");
    this.displayCurrentState();
  }

  private async handlePgn(args: string[]): Promise<void> {
    if (args.length === 0) {
      this.chessUI.displayError("Please provide a PGN game");
      return;
    }

    const pgn = args.join(" ");
    const success = this.chessEngine.loadPgn(pgn);

    if (!success) {
      this.chessUI.displayError("Invalid PGN format");
      return;
    }

    this.chessUI.displaySuccess("Game loaded from PGN!");
    this.displayCurrentState();
  }

  private async handleAnalyze(args: string[]): Promise<void> {
    const depth = parseInt(args[0]) || 3;
    const analysis = this.chessEngine.analyzePosition(depth);
    this.chessUI.displayAnalysis(analysis);
  }

  private async handleAI(): Promise<void> {
    await this.makeAIMove();
  }

  private async handleMode(args: string[]): Promise<void> {
    if (args.length === 0) {
      this.chessUI.displayInfo(`Current mode: ${this.gameMode.type}`);
      return;
    }

    const mode = args[0] as GameMode["type"];
    const aiLevel = parseInt(args[1]) || 1;

    if (!["human-vs-human", "human-vs-ai", "ai-vs-ai"].includes(mode)) {
      this.chessUI.displayError(
        "Invalid mode. Use: human-vs-human, human-vs-ai, or ai-vs-ai",
      );
      return;
    }

    this.gameMode = { type: mode, aiLevel };
    this.chessAI.setLevel(aiLevel);
    this.smartAI.setLevel(aiLevel);
    this.chessUI.displaySuccess(
      `Game mode set to: ${mode} (AI level: ${aiLevel})`,
    );
  }

  private async makeAIMove(): Promise<void> {
    const legalMoves = this.chessEngine.getAllLegalMoves();

    if (legalMoves.length === 0) {
      this.chessUI.displayError("No legal moves available for AI");
      return;
    }

    const board = this.chessEngine.getBoard();
    const gameState = this.chessEngine.getGameState();
    // Use smart AI for better moves
    const aiMove = this.smartAI.chooseMove(board, this.smartAI.getLevel());

    const success = this.chessEngine.makeMove(aiMove);

    if (!success) {
      this.chessUI.displayError("AI failed to make a valid move");
      return;
    }

    const moveText = aiMove.san || `${aiMove.from}-${aiMove.to}`;
    this.chessUI.displaySuccess(`AI played: ${moveText}`);
    this.displayCurrentState();

    // Check if game is over after AI move
    const newGameState = this.chessEngine.getGameState();
    if (newGameState.isCheckmate) {
      const winner = newGameState.turn === "w" ? "Black" : "White";
      this.chessUI.displaySuccess(`🎯 CHECKMATE! ${winner} wins!`);
    } else if (newGameState.isCheck) {
      this.chessUI.displayInfo("⚡ CHECK!");
    }
  }

  private displayCurrentState(): void {
    const board = this.chessEngine.getBoard();
    this.chessUI.displayBoard(board);
  }

  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// Run the interactive CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new InteractiveCLI();
  cli.start().catch(console.error);
}
