# Chess MCP (Model Context Protocol)

A powerful chess engine and game server built with the Model Context Protocol (MCP). Play chess against AI, analyze positions, and integrate chess functionality into your AI applications.

## 🎯 Features

### Core Chess Engine
- **Full Chess Rules**: Complete implementation of all chess rules including castling, en passant, and pawn promotion
- **Move Validation**: Automatic validation of all chess moves
- **Game State Tracking**: Track check, checkmate, stalemate, and draw conditions
- **Move History**: Complete move history with algebraic notation

### Multiple Game Modes
- **Human vs Human**: Classic two-player chess
- **Human vs AI**: Play against computer with adjustable difficulty (1-5 levels)
- **AI vs AI**: Watch AI play against itself

### AI Features
- **Smart AI Engine**: Minimax algorithm with alpha-beta pruning
- **5 Difficulty Levels**: From beginner (random) to expert (depth 5)
- **Automatic Play**: AI responds automatically in human-vs-ai mode
- **Manual Control**: Use `ai` command for manual AI moves
- **Position Analysis**: AI can analyze positions and suggest best moves

### Advanced Features
- **Position Analysis**: Analyze positions and get best move suggestions
- **FEN Support**: Load and save positions using FEN notation
- **PGN Support**: Import and export games in PGN format
- **Move Undo**: Undo moves to explore variations
- **Legal Move Display**: Show all legal moves for any position

### Beautiful UI
- **ASCII Chess Board**: Clean, readable board representation with Unicode chess pieces
- **Color-coded Output**: Different colors for different types of information
- **Interactive Commands**: Easy-to-use command system
- **Real-time Status**: Live game status updates

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd Chess-MCP

# Install dependencies
npm install

# Build the project
npm run build
```

## 📖 Usage

### Interactive CLI Mode (Recommended for Playing)

Start playing chess immediately:

```bash
# Start the interactive chess interface
npm run cli

# You'll see the chess prompt: chess>
# Type 'help' to see all available commands
```

### As an MCP Server

The chess MCP can be integrated into any MCP-compatible client:

```bash
# Run the MCP server
npm start
```

## 🎮 Available Commands

### Basic Game Commands
- `move <move>` - Make a move (e.g., `move e2e4`, `move Nf3`)
- `board` - Display the current board
- `status` - Show game status
- `history` - Show move history
- `undo` - Undo the last move
- `reset` - Reset to starting position

### Analysis Commands
- `moves <square>` - Show legal moves for a square (e.g., `moves e2`)
- `all-moves` - Show all legal moves
- `analyze [depth]` - Analyze position (default depth: 3)

### Game Mode Commands
- `mode <type> [ai-level]` - Set game mode:
  - `mode human-vs-human` - Two human players
  - `mode human-vs-ai 3` - Play against AI (level 1-5)
  - `mode ai-vs-ai 5` - Watch AI play against itself
- `ai` - Make AI play a move (for manual control)

### Import/Export Commands
- `fen <position>` - Load position from FEN
- `pgn <game>` - Load game from PGN
- `save` - Save current game to PGN

## 🔧 MCP Tools

The chess MCP provides the following tools for AI integration:

### Game Management
- `start_new_game` - Start a new game with specified mode
- `reset_game` - Reset to starting position
- `get_game_status` - Get current game status

### Move Operations
- `make_move` - Make a chess move
- `get_legal_moves` - Get legal moves for a square or all pieces
- `undo_move` - Undo the last move

### Board and Analysis
- `get_board_state` - Get current board state
- `analyze_position` - Analyze position and suggest moves
- `get_move_history` - Get complete move history

### AI Features
- `ai_move` - Make AI play a move
- `load_position` - Load position from FEN
- `save_game` - Save game to PGN
- `load_game` - Load game from PGN

## 🎯 Example Usage

### Playing Against AI

**Quick Start:**
```bash
# Start the interactive CLI
npm run cli

# Set up Human vs AI (Level 2 - moderate difficulty)
chess> mode human-vs-ai 2

# Make your first move
chess> move e2e4
# AI automatically responds!

# Continue playing
chess> move g1f3
# AI automatically responds!

# Check the board
chess> board

# See game status
chess> status
```

**AI Difficulty Levels:**
- **Level 1**: Random moves (perfect for beginners)
- **Level 2**: Basic strategy (good for casual play)
- **Level 3**: Moderate difficulty (challenging)
- **Level 4**: Advanced strategy (very challenging)
- **Level 5**: Expert level (extremely challenging)

**Manual AI Control:**
```bash
# Set mode but control when AI plays
chess> mode human-vs-ai 3
chess> move e2e4
chess> ai  # Tell AI to play now
chess> move g1f3
chess> ai  # Tell AI to play again
```

**Watch AI vs AI:**
```bash
chess> mode ai-vs-ai 3
chess> ai  # First AI move
chess> ai  # Second AI move
chess> ai  # Continue watching...
```

### Starting a Game
```bash
chess> mode human-vs-ai 3
Game mode set to: human-vs-ai (AI level: 3)

chess> move e2e4
Move e2e4 made successfully!

  Chess Board
    a b c d e f g h
  ┌─────────────────┐
 8│ ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜ │ 8
 7│ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ │ 7
 6│ · · · · · · · · │ 6
 5│ · · · · · · · · │ 5
 4│ · · · · ♙ · · · │ 4
 3│ · · · · · · · · │ 3
 2│ ♙ ♙ ♙ ♙ · ♙ ♙ ♙ │ 2
 1│ ♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖ │ 1
  └─────────────────┘
    a b c d e f g h

Current turn: Black

AI played: e7e5
```

### Analyzing a Position
```bash
chess> analyze 4
Position Analysis (Depth: 4):
Evaluation: +0.3

Best moves:
1. Nf3
2. Nc3
3. d4
```

### Getting Legal Moves
```bash
chess> moves e2
Legal moves for e2:
1. e3
2. e4
```

## 🏗️ Architecture

The chess MCP is built with a modular architecture:

- **`ChessEngine`**: Core chess logic using chess.js
- **`ChessUI`**: User interface and display logic
- **`ChessAI`**: AI opponent with minimax algorithm
- **`ChessMCPServer`**: MCP protocol implementation
- **`InteractiveCLI`**: Local testing interface

## 🎨 User Experience Tips

### Making it Cooler from a User Perspective

1. **Visual Appeal**
   - Beautiful Unicode chess pieces
   - Color-coded output for different information types
   - Clean, readable board layout

2. **Ease of Use**
   - Simple, intuitive commands
   - Helpful error messages
   - Auto-completion suggestions

3. **Advanced Features**
   - Position analysis with evaluation scores
   - Multiple AI difficulty levels
   - Game import/export capabilities

4. **Interactive Elements**
   - Real-time game status updates
   - Move validation with helpful feedback
   - Undo functionality for exploration

5. **Educational Value**
   - Legal move highlighting
   - Position analysis explanations
   - Move history tracking

## 🔮 Future Enhancements

- **Web Interface**: Browser-based chess interface
- **Opening Database**: Built-in opening book
- **Endgame Tablebases**: Perfect endgame play
- **Network Play**: Multiplayer over network
- **Tournament Mode**: Round-robin tournaments
- **Puzzle Mode**: Chess puzzles and tactics
- **Voice Commands**: Voice-controlled chess
- **Mobile App**: iOS/Android chess app

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [chess.js](https://github.com/jhlywa/chess.js) - Chess logic library
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
- Unicode chess symbols for beautiful display

## 🔧 Troubleshooting

### Common Issues

**"Command not found: npm"**
- Make sure Node.js is installed: `node --version`
- Install Node.js from [nodejs.org](https://nodejs.org/)

**"Cannot find module" errors**
- Run `npm install` to install dependencies
- Run `npm run build` to compile TypeScript

**Interactive CLI not starting**
- Use `npm run cli` (not `npm run dev`)
- Make sure you're in the Chess-MCP directory

**AI not responding**
- Check game mode: `mode human-vs-ai 2`
- In human-vs-ai mode, AI responds automatically
- Use `ai` command for manual AI moves

**Move not working**
- Check legal moves: `moves <square>`
- Use correct format: `move e2e4` or `move Nf3`
- Check game status: `status`

### Getting Help

- Type `help` in the chess CLI for command list
- Use `status` to see current game state
- Use `moves <square>` to see legal moves
- Use `undo` if you make a mistake

---

**Happy Chess Playing! ♔♕♖♗♘♙** 