# Testing Strategy

## Overview

Chess MCP implements a comprehensive testing strategy covering unit tests, integration tests, performance tests, and manual testing procedures. This document outlines our testing approach and provides guidelines for maintaining code quality.

## Testing Philosophy

### Principles
- **Test-driven development** for critical components
- **Comprehensive coverage** of all public APIs
- **Performance testing** for AI algorithms
- **Integration testing** for MCP protocol compliance
- **Manual testing** for user experience validation

### Testing Pyramid
```
    /\
   /  \     Manual Tests (Few, High-level)
  /____\    Integration Tests (Some, Medium-level)
 /______\   Unit Tests (Many, Low-level)
```

## Unit Testing

### Test Framework
- **Jest**: Primary testing framework
- **TypeScript**: Native TypeScript support
- **Coverage**: Istanbul for code coverage

### Test Structure
```typescript
// Example test file: src/__tests__/chess-engine.test.ts
import { ChessEngine } from '../chess-engine';

describe('ChessEngine', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  describe('makeMove', () => {
    test('should make valid opening move', () => {
      const result = engine.makeMove('e2e4');
      expect(result).toBe(true);
      expect(engine.getFEN()).toContain('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR');
    });

    test('should reject invalid move', () => {
      const result = engine.makeMove('e2e5');
      expect(result).toBe(false);
    });

    test('should handle castling', () => {
      // Setup castling position
      engine.makeMove('e2e4');
      engine.makeMove('e7e5');
      engine.makeMove('g1f3');
      engine.makeMove('b8c6');
      engine.makeMove('f1c4');
      engine.makeMove('f8c5');
      
      const result = engine.makeMove('e1g1');
      expect(result).toBe(true);
    });
  });
});
```

### Test Categories

#### 1. Chess Engine Tests
```typescript
describe('ChessEngine', () => {
  test('move validation', () => {
    // Test valid and invalid moves
  });

  test('game state management', () => {
    // Test board state, FEN, game status
  });

  test('special moves', () => {
    // Test castling, en passant, promotion
  });

  test('game termination', () => {
    // Test checkmate, stalemate, draw conditions
  });
});
```

#### 2. AI Tests
```typescript
describe('SmartChessAI', () => {
  test('move selection', () => {
    // Test AI chooses reasonable moves
  });

  test('difficulty levels', () => {
    // Test different AI levels
  });

  test('evaluation functions', () => {
    // Test position evaluation accuracy
  });

  test('performance', () => {
    // Test response time limits
  });
});
```

#### 3. MCP Server Tests
```typescript
describe('ChessMCPServer', () => {
  test('protocol compliance', () => {
    // Test JSON-RPC format
  });

  test('method handling', () => {
    // Test all MCP methods
  });

  test('error handling', () => {
    // Test error responses
  });
});
```

### Test Data

#### Chess Positions
```typescript
// test-data/positions.ts
export const TEST_POSITIONS = {
  STARTING_POSITION: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  
  CHECKMATE_IN_1: 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3',
  
  STALEMATE: 'k7/8/1K6/8/8/8/8/8 w - - 0 1',
  
  CASTLING_POSITION: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2'
};
```

#### Test Moves
```typescript
export const TEST_MOVES = {
  VALID_OPENING: 'e2e4',
  INVALID_MOVE: 'e2e5',
  CASTLING: 'e1g1',
  EN_PASSANT: 'e5d6',
  PROMOTION: 'e7e8q'
};
```

## Integration Testing

### MCP Protocol Testing
```typescript
// test/integration/mcp-protocol.test.ts
import { spawn } from 'child_process';

describe('MCP Protocol Integration', () => {
  let mcpProcess: any;

  beforeEach(() => {
    mcpProcess = spawn('npx', ['tsx', 'src/index.ts']);
  });

  afterEach(() => {
    mcpProcess.kill();
  });

  test('should handle tools/list request', async () => {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    };

    const response = await sendRequest(mcpProcess, request);
    expect(response.result).toBeDefined();
    expect(response.result.tools).toHaveLength(8); // All our tools
  });

  test('should handle complete game flow', async () => {
    // Start game
    await sendRequest(mcpProcess, {
      method: 'tools/call',
      params: { name: 'start_new_game' }
    });

    // Make move
    const moveResponse = await sendRequest(mcpProcess, {
      method: 'tools/call',
      params: {
        name: 'make_move',
        arguments: { move: 'e2e4' }
      }
    });

    expect(moveResponse.result.success).toBe(true);
  });
});
```

### End-to-End Testing
```typescript
// test/e2e/chess-game.test.ts
describe('Complete Chess Game', () => {
  test('should play full game human vs AI', async () => {
    const game = new ChessGame();
    
    // Start game
    game.startNewGame();
    
    // Make opening moves
    game.makeMove('e2e4');
    game.makeAIMove(3);
    game.makeMove('g1f3');
    game.makeAIMove(3);
    
    // Continue until game ends
    while (!game.isGameOver()) {
      if (game.getCurrentPlayer() === 'w') {
        game.makeMove(getBestMove(game));
      } else {
        game.makeAIMove(3);
      }
    }
    
    expect(game.getGameStatus()).toBeDefined();
  });
});
```

## Performance Testing

### AI Performance Tests
```typescript
// test/performance/ai-performance.test.ts
describe('AI Performance', () => {
  test('should respond within time limits', () => {
    const ai = new SmartChessAI();
    const board = new ChessEngine().getBoard();
    
    const start = Date.now();
    const move = ai.chooseMove(board, 3);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(1000); // 1 second limit
    expect(move).toBeDefined();
  });

  test('should scale with difficulty', () => {
    const ai = new SmartChessAI();
    const board = new ChessEngine().getBoard();
    
    const times = [];
    for (let level = 1; level <= 5; level++) {
      const start = Date.now();
      ai.chooseMove(board, level);
      times.push(Date.now() - start);
    }
    
    // Higher levels should take longer
    expect(times[4]).toBeGreaterThan(times[0]);
  });
});
```

### Memory Usage Tests
```typescript
// test/performance/memory-usage.test.ts
describe('Memory Usage', () => {
  test('should not leak memory during AI search', () => {
    const ai = new SmartChessAI();
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Perform many AI searches
    for (let i = 0; i < 100; i++) {
      const board = new ChessEngine().getBoard();
      ai.chooseMove(board, 3);
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Should not increase by more than 10MB
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
```

## Manual Testing

### Test Scenarios

#### 1. Interactive CLI Testing
```bash
# Test basic functionality
npm run cli
# Commands to test:
# - mode human-vs-ai 3
# - move e2e4
# - board
# - analyze
# - undo
# - reset
# - quit
```

#### 2. MCP Client Testing
```bash
# Test with Raycast
# 1. Configure MCP server in Raycast
# 2. Test commands:
#    - "Start a new chess game"
#    - "Make the move e2e4"
#    - "Show me the board"
#    - "What are the best moves?"
```

#### 3. Error Handling Testing
```bash
# Test invalid inputs
# - Invalid moves: e2e5, a1a9, etc.
# - Invalid AI levels: 0, 6, -1
# - Malformed MCP requests
```

### Test Checklist

#### Functionality Tests
- [ ] All game modes work correctly
- [ ] Move validation works for all piece types
- [ ] Special moves (castling, en passant, promotion)
- [ ] Game termination conditions
- [ ] AI responds appropriately at all levels
- [ ] Analysis provides useful information

#### User Experience Tests
- [ ] CLI is responsive and intuitive
- [ ] Board display is clear and accurate
- [ ] Error messages are helpful
- [ ] MCP integration works smoothly
- [ ] Performance is acceptable

#### Edge Cases
- [ ] Very long games
- [ ] Complex positions
- [ ] Memory pressure
- [ ] Network interruptions
- [ ] Invalid configurations

## Test Automation

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run unit tests
      run: npm test
      
    - name: Run integration tests
      run: npm run test:integration
      
    - name: Run performance tests
      run: npm run test:performance
      
    - name: Generate coverage report
      run: npm run test:coverage
```

### Test Scripts
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "test:performance": "jest --testPathPattern=performance",
    "test:e2e": "jest --testPathPattern=e2e"
  }
}
```

## Coverage Requirements

### Code Coverage Targets
- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 95%
- **Lines**: 90%

### Critical Path Coverage
- **Chess engine logic**: 100%
- **AI algorithms**: 95%
- **MCP protocol**: 100%
- **Error handling**: 100%

## Test Maintenance

### Best Practices
1. **Keep tests simple** and focused
2. **Use descriptive test names** that explain the scenario
3. **Avoid test interdependence** - each test should be independent
4. **Mock external dependencies** to isolate units
5. **Update tests** when changing functionality

### Test Organization
```
tests/
├── unit/
│   ├── chess-engine.test.ts
│   ├── chess-ai.test.ts
│   └── chess-mcp.test.ts
├── integration/
│   ├── mcp-protocol.test.ts
│   └── chess-game.test.ts
├── performance/
│   ├── ai-performance.test.ts
│   └── memory-usage.test.ts
├── e2e/
│   └── complete-game.test.ts
└── fixtures/
    ├── positions.ts
    └── moves.ts
```

## Debugging Tests

### Common Issues
1. **Async test failures**: Use proper async/await
2. **Memory leaks**: Monitor memory usage in tests
3. **Race conditions**: Use proper test isolation
4. **Platform differences**: Test on multiple platforms

### Debug Tools
```typescript
// Debug helper
const debug = (message: string, data?: any) => {
  if (process.env.DEBUG) {
    console.log(`[DEBUG] ${message}`, data);
  }
};

// Use in tests
test('should handle complex position', () => {
  debug('Testing position:', TEST_POSITIONS.COMPLEX);
  // Test implementation
});
```

## Conclusion

The testing strategy ensures code quality, reliability, and performance. The combination of unit tests, integration tests, performance tests, and manual testing provides comprehensive coverage of all functionality.

Key benefits:
- ✅ **Reliability**: Automated tests catch regressions
- ✅ **Performance**: Performance tests ensure acceptable response times
- ✅ **Quality**: High test coverage reduces bugs
- ✅ **Maintainability**: Tests serve as documentation
- ✅ **Confidence**: Comprehensive testing enables safe refactoring

The testing framework supports continuous development and deployment while maintaining high code quality standards. 