# Developer Guide

## Development Setup

### Prerequisites

- Node.js 18.0.0+
- TypeScript knowledge
- Git for version control

### Installation

```bash
git clone https://github.com/yourusername/chess-mcp.git
cd chess-mcp
npm install
```

### Development Scripts

```bash
# Build TypeScript
npm run build

# Start development server
npm run dev

# Run tests
npm run test

# Start interactive CLI
npm run cli

# Lint code
npm run lint
```

## Project Structure

### Core Modules

```
src/
├── chess-engine.ts      # Core chess logic
├── chess-ai.ts          # Basic AI implementation
├── smart-chess-ai.ts    # Advanced AI with evaluation
├── chess-ui.ts          # Terminal UI components
├── chess-mcp.ts         # MCP server implementation
├── interactive-cli.ts   # CLI interface
├── types.ts             # TypeScript definitions
├── index.ts             # MCP entry point
└── cli.ts               # CLI entry point
```

### Key Classes

#### ChessEngine

Handles core chess logic and game state.

```typescript
class ChessEngine {
  makeMove(move: string): boolean;
  getBoard(): ChessBoard;
  getLegalMoves(): ChessMove[];
  analyzePosition(): PositionAnalysis;
}
```

#### SmartChessAI

Advanced AI with multiple difficulty levels.

```typescript
class SmartChessAI {
  chooseMove(board: ChessBoard, level: number): ChessMove;
  evaluatePosition(board: ChessBoard): number;
  minimax(board: ChessBoard, depth: number): number;
}
```

#### ChessMCPServer

MCP protocol implementation.

```typescript
class ChessMCPServer {
  handleRequest(request: MCPRequest): MCPResponse;
  startNewGame(): void;
  makeMove(move: string): boolean;
}
```

## Code Style Guidelines

### TypeScript Best Practices

- Use strict type checking
- Prefer interfaces over types
- Use readonly for immutable data
- Avoid `any` type when possible

### Naming Conventions

- **Classes**: PascalCase (`ChessEngine`)
- **Functions**: camelCase (`makeMove`)
- **Constants**: UPPER_SNAKE_CASE (`PIECE_VALUES`)
- **Files**: kebab-case (`chess-engine.ts`)

### Code Organization

```typescript
// 1. Imports
import { Chess } from "chess.js";

// 2. Interfaces/Types
interface ChessMove {
  from: string;
  to: string;
  piece: string;
}

// 3. Constants
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
};

// 4. Class definition
export class ChessEngine {
  // 5. Private properties
  private chess: Chess;

  // 6. Constructor
  constructor() {
    this.chess = new Chess();
  }

  // 7. Public methods
  public makeMove(move: string): boolean {
    // Implementation
  }

  // 8. Private methods
  private validateMove(move: string): boolean {
    // Implementation
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
// Example test structure
describe("ChessEngine", () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  test("should make valid moves", () => {
    const result = engine.makeMove("e2e4");
    expect(result).toBe(true);
  });

  test("should reject invalid moves", () => {
    const result = engine.makeMove("e2e5");
    expect(result).toBe(false);
  });
});
```

### Integration Tests

```typescript
// Test MCP server integration
describe("MCP Integration", () => {
  test("should handle start_new_game", async () => {
    const response = await mcpServer.handleRequest({
      method: "tools/call",
      params: { name: "start_new_game" },
    });
    expect(response.result).toBeDefined();
  });
});
```

### Performance Tests

```typescript
// Test AI performance
describe("AI Performance", () => {
  test("should respond within time limit", () => {
    const start = Date.now();
    const move = ai.chooseMove(board, 3);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000);
  });
});
```

## Adding New Features

### 1. AI Improvements

```typescript
// Add new evaluation function
class SmartChessAI {
  private evaluatePawnStructure(board: ChessBoard): number {
    // Implementation
  }

  private evaluateKingSafety(board: ChessBoard): number {
    // Implementation
  }
}
```

### 2. New MCP Commands

```typescript
// Add to ChessMCPServer
class ChessMCPServer {
  private handleCustomCommand(request: MCPRequest): MCPResponse {
    switch (request.params.name) {
      case "custom_command":
        return this.executeCustomCommand(request.params.arguments);
      default:
        throw new Error("Unknown command");
    }
  }
}
```

### 3. UI Enhancements

```typescript
// Add to ChessUI
class ChessUI {
  public displayCustomView(data: any): void {
    // Implementation
  }
}
```

## Debugging

### Common Issues

#### TypeScript Errors

```bash
# Check for type errors
npx tsc --noEmit

# Fix specific file
npx tsc src/chess-engine.ts
```

#### Runtime Errors

```bash
# Debug with Node.js
node --inspect-brk -r tsx/cjs src/index.ts

# Use console.log for debugging
console.log('Debug info:', data);
```

#### MCP Protocol Issues

```bash
# Test MCP server
npx tsx test-mcp.ts

# Check JSON-RPC format
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npx tsx src/index.ts
```

### Debug Tools

- **VS Code**: Use TypeScript debugger
- **Chrome DevTools**: For Node.js debugging
- **Chess.js**: Built-in validation

## Performance Optimization

### AI Optimization

```typescript
// Use transposition tables
class SmartChessAI {
  private transpositionTable = new Map<string, number>();

  private getCachedEvaluation(fen: string): number | null {
    return this.transpositionTable.get(fen) || null;
  }
}
```

### Memory Management

```typescript
// Clean up resources
class ChessEngine {
  public dispose(): void {
    this.chess = null;
    this.moveHistory = [];
  }
}
```

### Caching Strategies

```typescript
// Cache expensive calculations
class ChessEngine {
  private moveCache = new Map<string, ChessMove[]>();

  public getLegalMoves(): ChessMove[] {
    const fen = this.chess.fen();
    if (this.moveCache.has(fen)) {
      return this.moveCache.get(fen)!;
    }
    const moves = this.chess.moves({ verbose: true });
    this.moveCache.set(fen, moves);
    return moves;
  }
}
```

## Contributing Guidelines

### Pull Request Process

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and add tests
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add new feature'`
6. Push to branch: `git push origin feature/new-feature`
7. Create pull request

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No TypeScript errors
- [ ] Performance impact considered

### Commit Message Format

```
type(scope): description

feat(ai): add neural network evaluation
fix(engine): resolve move validation bug
docs(readme): update installation instructions
```

## Deployment

### Local Development

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

### MCP Client Configuration

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

## Resources

### Documentation

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Chess.js Documentation](https://github.com/jhlywa/chess.js)

### Tools

- **VS Code**: Recommended IDE
- **Jest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting

### Community

- GitHub Issues for bug reports
- GitHub Discussions for questions
- Discord server for real-time chat
