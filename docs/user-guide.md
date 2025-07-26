# User Guide

## Overview

This guide covers all the features and usage patterns of Chess MCP, from basic gameplay to advanced AI interactions. Whether you're using the interactive CLI or integrating with AI assistants, this guide has you covered.

## Getting Started

### Interactive CLI Mode

The interactive CLI provides a traditional chess experience with full control over the game.

#### Starting a Game

```bash
# Start the interactive CLI
npm run cli

# You'll see the welcome screen and menu
```

#### Available Commands

| Command               | Description           | Example              |
| --------------------- | --------------------- | -------------------- |
| `mode <type> [level]` | Set game mode         | `mode human-vs-ai 3` |
| `move <notation>`     | Make a move           | `move e2e4`          |
| `board`               | Display current board | `board`              |
| `all-moves`           | Show all legal moves  | `all-moves`          |
| `analyze`             | Get position analysis | `analyze`            |
| `undo`                | Undo last move        | `undo`               |
| `reset`               | Start new game        | `reset`              |
| `help`                | Show help             | `help`               |
| `quit`                | Exit game             | `quit`               |

### Game Modes

#### 1. Human vs Human

```bash
chess> mode human-vs-human
```

- Two players take turns
- Full control over both sides
- No AI involvement

#### 2. Human vs AI

```bash
chess> mode human-vs-ai 3
```

- Play against the computer
- Choose AI difficulty (1-5)
- You play as White

#### 3. AI vs AI

```bash
chess> mode ai-vs-ai 3 4
```

- Watch two AIs play
- Different levels for each AI
- Automatic gameplay

## Move Notation

### Coordinate Notation (Recommended)

Use coordinate notation for precise move specification:

```
Format: <from><to>
Examples:
- e2e4    (pawn from e2 to e4)
- g1f3    (knight from g1 to f3)
- e1g1    (castling kingside)
- e7e8q   (pawn promotion to queen)
```

### Algebraic Notation (Alternative)

Traditional chess notation is also supported:

```
Examples:
- e4      (pawn to e4)
- Nf3     (knight to f3)
- O-O     (castling kingside)
- e8=Q    (pawn promotion to queen)
```

## AI Difficulty Levels

The AI has been improved for better reliability and consistency across all difficulty levels. All AI levels now use the chess engine's legal moves for validation, preventing move errors.

### Level 1: Beginner

- **Algorithm**: Smart Random
- **Response Time**: <50ms
- **Playing Style**: Avoids obvious blunders
- **Best For**: Learning basic rules

### Level 2: Intermediate

- **Algorithm**: Positional Evaluation
- **Response Time**: 100-200ms
- **Playing Style**: Considers piece placement
- **Best For**: Improving positional play

### Level 3: Advanced

- **Algorithm**: Minimax (3-4 plies)
- **Response Time**: 200-400ms
- **Playing Style**: Tactical awareness
- **Best For**: Developing tactical skills

### Level 4: Expert

- **Algorithm**: Minimax + Alpha-Beta (4-5 plies)
- **Response Time**: 300-500ms
- **Playing Style**: Strategic planning
- **Best For**: Advanced players

### Level 5: Master

- **Algorithm**: Full Minimax + Move Ordering (5-6 plies)
- **Response Time**: 400-600ms
- **Playing Style**: Deep calculation
- **Best For**: Strong players

## Position Analysis

### Basic Analysis

```bash
chess> analyze
```

Shows:

- Current position evaluation
- Best moves for the current player
- Material count
- Game status (check, checkmate, draw)

### Detailed Analysis

```bash
chess> analyze detailed
```

Additional information:

- Move-by-move analysis
- Positional factors
- Tactical opportunities
- Strategic plans

## Game Examples

### Example 1: Basic Opening

```
chess> mode human-vs-ai 3
chess> move e2e4
♔ ♕ ♖ ♗ ♘ ♙ ♙ ♙ ♙ ♙ ♙ ♙
♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜
♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟
♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙
♘ ♗ ♕ ♔ ♖

AI plays: e7e5

chess> move g1f3
```

### Example 2: Tactical Position

```
chess> analyze
Position Evaluation: +0.5 (White is slightly better)
Best moves:
1. d4xd5 (capture)
2. Bc4-b5 (pin)
3. O-O (castling)

chess> move d4d5
```

## MCP Server Integration

### Using with AI Assistants

Once configured, you can interact with chess through your AI assistant:

#### Starting Games

- "Start a new chess game"
- "Begin a game against the AI at level 3"
- "Set up a human vs human game"

#### Making Moves

- "Make the move e2e4"
- "Play e4"
- "Move my pawn to e4"

#### Getting Information

- "Show me the current board"
- "What are my legal moves?"
- "Analyze this position"
- "What's the best move here?"

#### AI Play

- "Let the AI make a move"
- "Play the best move for me"
- "What would the AI play here?"

### MCP Commands Reference

| Command            | Description       | Parameters         |
| ------------------ | ----------------- | ------------------ |
| `start_new_game`   | Start fresh game  | None               |
| `make_move`        | Make a move       | `move` (string)    |
| `get_board_state`  | Get current board | None               |
| `get_legal_moves`  | Get legal moves   | None               |
| `analyze_position` | Analyze position  | None               |
| `ai_move`          | Get AI move       | `level` (optional) |
| `undo_move`        | Undo last move    | None               |
| `reset_game`       | Reset to start    | None               |

## Advanced Features

### Opening Book

The AI uses a built-in opening book for common positions:

- **Automatic selection**: AI chooses book moves in openings
- **Theory compliance**: Follows established opening theory
- **Limited repertoire**: Basic openings included

### Endgame Knowledge

Basic endgame patterns are recognized:

- **King and pawn vs King**: Basic technique
- **Rook endgames**: Common patterns
- **Queen endgames**: Mating patterns

### Position Evaluation

The AI evaluates positions using multiple factors:

- **Material**: Piece values and count
- **Position**: Piece-square tables
- **Mobility**: Number of legal moves
- **Pawn structure**: Doubled/isolated pawns
- **King safety**: King position and protection

## Troubleshooting

### Common Issues

#### ❌ "Invalid move" error

**Cause**: Move notation is incorrect or illegal
**Solution**:

- Check coordinate format (e.g., e2e4)
- Verify the move is legal with `all-moves`
- Use `analyze` to see best moves

#### ❌ AI taking too long

**Cause**: High difficulty level or complex position
**Solution**:

- Lower AI level: `mode human-vs-ai 2`
- Wait for calculation to complete
- Use `analyze` to understand position

#### ❌ Board not updating

**Cause**: Display issue or game state problem
**Solution**:

- Use `board` command to refresh display
- Check game status with `analyze`
- Reset game if needed: `reset`

#### ❌ MCP server not responding

**Cause**: Configuration or path issues
**Solution**:

- Verify MCP configuration path
- Test with `npx tsx test-mcp.ts`
- Check Node.js and dependencies

### Performance Tips

#### For Faster AI Response

- Use lower AI levels (1-2) for quick games
- Avoid complex positions in opening
- Use `analyze` sparingly

#### For Better Gameplay

- Study opening theory
- Practice tactical positions
- Use analysis to learn from mistakes

## Troubleshooting

### AI Move Issues

**Problem**: "AI failed to make a valid move" error

**Status**: ✅ **RESOLVED** - This issue has been fixed in the latest version.

**Solution**: The AI now uses the chess engine's legal moves for validation, preventing this error from occurring.

**If you still encounter issues**:

1. Restart the MCP server
2. Check that you're using the latest version
3. Try a different AI level
4. Report the issue with debug information

## Keyboard Shortcuts

### CLI Navigation

- **Ctrl+C**: Exit game
- **Ctrl+L**: Clear screen
- **Up/Down arrows**: Command history
- **Tab**: Auto-completion

### Common Commands

- **b**: Short for `board`
- **m**: Short for `move`
- **a**: Short for `analyze`
- **h**: Short for `help`

## Best Practices

### For Beginners

1. Start with AI level 1-2
2. Use `analyze` to understand positions
3. Practice basic openings (e4, d4)
4. Learn coordinate notation

### For Intermediate Players

1. Use AI level 3-4 for challenge
2. Study tactical positions
3. Practice endgame technique
4. Analyze your games

### For Advanced Players

1. Use AI level 5 for maximum challenge
2. Study opening theory
3. Practice complex endgames
4. Use detailed analysis

## Integration Examples

### Raycast Integration

```json
{
  "mcpServers": {
    "chess": {
      "name": "Chess MCP",
      "type": "stdio",
      "command": "npx",
      "args": ["tsx", "/path/to/Chess-MCP/src/index.ts"]
    }
  }
}
```

### Claude Desktop Integration

Same configuration as Raycast, add to Claude's MCP settings.

### Custom Integration

```typescript
// Example Node.js integration
import { spawn } from "child_process";

const chessProcess = spawn("npx", ["tsx", "src/index.ts"]);

chessProcess.stdin.write(
  JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "start_new_game",
      arguments: {},
    },
  }),
);
```

## Conclusion

Chess MCP provides a comprehensive chess experience through both interactive CLI and MCP server integration. The system offers multiple difficulty levels, sophisticated analysis, and seamless integration with AI assistants.

Key features:

- ✅ Multiple game modes
- ✅ Adjustable AI difficulty
- ✅ Position analysis
- ✅ MCP protocol compliance
- ✅ Interactive CLI
- ✅ Opening book integration

The modular design ensures that both casual players and serious chess enthusiasts can find appropriate challenges and learning opportunities.
