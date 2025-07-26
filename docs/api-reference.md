# API Reference

## MCP Server API

### Core Methods

#### `start_new_game`

Starts a new chess game.

**Parameters**: None

**Returns**:

```typescript
{
  success: boolean;
  message: string;
  board?: ChessBoard;
}
```

**Example**:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "start_new_game",
    "arguments": {}
  }
}
```

#### `make_move`

Makes a move on the chess board.

**Parameters**:

```typescript
{
  move: string; // Coordinate notation (e.g., "e2e4")
}
```

**Returns**:

```typescript
{
  success: boolean;
  message: string;
  board?: ChessBoard;
  gameStatus?: GameStatus;
}
```

**Example**:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "make_move",
    "arguments": {
      "move": "e2e4"
    }
  }
}
```

#### `get_board_state`

Returns the current board state.

**Parameters**: None

**Returns**:

```typescript
{
  board: ChessBoard;
  fen: string;
  gameStatus: GameStatus;
  currentPlayer: "w" | "b";
}
```

#### `get_legal_moves`

Returns all legal moves for the current position.

**Parameters**: None

**Returns**:

```typescript
{
  moves: ChessMove[];
  count: number;
}
```

#### `analyze_position`

Analyzes the current position.

**Parameters**: None

**Returns**:

```typescript
{
  evaluation: number;
  bestMoves: ChessMove[];
  materialCount: MaterialCount;
  gameStatus: GameStatus;
}
```

#### `ai_move`

Gets an AI move for the current position.

**Parameters**:

```typescript
{
  level?: number; // AI difficulty (1-5, default: 3)
}
```

**Returns**:

```typescript
{
  move: ChessMove;
  evaluation: number;
  thinkingTime: number;
}
```

#### `undo_move`

Undoes the last move.

**Parameters**: None

**Returns**:

```typescript
{
  success: boolean;
  message: string;
  board?: ChessBoard;
}
```

#### `reset_game`

Resets the game to the starting position.

**Parameters**: None

**Returns**:

```typescript
{
  success: boolean;
  message: string;
  board: ChessBoard;
}
```

## Type Definitions

### ChessBoard

```typescript
interface ChessBoard {
  squares: (ChessPiece | null)[][];
  fen: string;
  turn: "w" | "b";
  castling: string;
  enPassant: string | null;
  halfMoveClock: number;
  fullMoveNumber: number;
}
```

### ChessPiece

```typescript
interface ChessPiece {
  type: "p" | "n" | "b" | "r" | "q" | "k";
  color: "w" | "b";
  square: string;
}
```

### ChessMove

```typescript
interface ChessMove {
  from: string;
  to: string;
  piece: string;
  color: "w" | "b";
  san?: string;
  flags?: string;
  promotion?: string;
}
```

### GameStatus

```typescript
interface GameStatus {
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isStalemate: boolean;
  isThreefoldRepetition: boolean;
  isInsufficientMaterial: boolean;
  isFiftyMoveRule: boolean;
}
```

### MaterialCount

```typescript
interface MaterialCount {
  white: {
    pawns: number;
    knights: number;
    bishops: number;
    rooks: number;
    queens: number;
    kings: number;
  };
  black: {
    pawns: number;
    knights: number;
    bishops: number;
    rooks: number;
    queens: number;
    kings: number;
  };
}
```

## Chess Engine API

### ChessEngine Class

#### Constructor

```typescript
constructor(fen?: string)
```

#### Methods

##### `makeMove(move: string): boolean`

Makes a move on the board.

**Parameters**:

- `move`: Move in coordinate notation

**Returns**: `boolean` - Success status

##### `getBoard(): ChessBoard`

Returns the current board state.

**Returns**: `ChessBoard` - Current board

##### `getLegalMoves(): ChessMove[]`

Returns all legal moves.

**Returns**: `ChessMove[]` - Array of legal moves

##### `analyzePosition(): PositionAnalysis`

Analyzes the current position.

**Returns**: `PositionAnalysis` - Analysis results

##### `isGameOver(): boolean`

Checks if the game is over.

**Returns**: `boolean` - Game over status

##### `getGameStatus(): GameStatus`

Returns detailed game status.

**Returns**: `GameStatus` - Game status

##### `getFEN(): string`

Returns FEN notation.

**Returns**: `string` - FEN string

##### `reset(): void`

Resets the game.

## AI API

### SmartChessAI Class

#### Constructor

```typescript
constructor();
```

#### Methods

##### `chooseMove(board: ChessBoard, level: number): ChessMove`

Chooses the best move for the given position.

**Parameters**:

- `board`: Current board state
- `level`: AI difficulty (1-5)

**Returns**: `ChessMove` - Best move

##### `evaluatePosition(board: ChessBoard): number`

Evaluates a position.

**Parameters**:

- `board`: Board to evaluate

**Returns**: `number` - Position score

##### `getMoveAnalysis(board: ChessBoard, level: number): MoveAnalysis`

Analyzes all possible moves.

**Parameters**:

- `board`: Current board
- `level`: AI level

**Returns**: `MoveAnalysis` - Move analysis

### MoveAnalysis

```typescript
interface MoveAnalysis {
  moves: {
    move: ChessMove;
    score: number;
    evaluation: number;
  }[];
  bestMove: ChessMove;
  positionEvaluation: number;
  thinkingTime: number;
}
```

## UI API

### ChessUI Class

#### Methods

##### `displayBoard(board: ChessBoard): void`

Displays the chess board.

**Parameters**:

- `board`: Board to display

##### `displayAnalysis(analysis: PositionAnalysis): void`

Displays position analysis.

**Parameters**:

- `analysis`: Analysis to display

##### `displayMenu(): void`

Displays the main menu.

##### `displayHelp(): void`

Displays help information.

##### `displayGameStatus(status: GameStatus): void`

Displays game status.

**Parameters**:

- `status`: Game status to display

## Error Handling

### Error Types

#### InvalidMoveError

```typescript
class InvalidMoveError extends Error {
  constructor(move: string, reason: string) {
    super(`Invalid move ${move}: ${reason}`);
    this.name = "InvalidMoveError";
  }
}
```

#### GameOverError

```typescript
class GameOverError extends Error {
  constructor(status: GameStatus) {
    super(`Game is over: ${status}`);
    this.name = "GameOverError";
  }
}
```

#### AIError

```typescript
class AIError extends Error {
  constructor(message: string) {
    super(`AI error: ${message}`);
    this.name = "AIError";
  }
}
```

### Error Responses

All MCP methods return error responses in this format:

```typescript
{
  error: {
    code: number;
    message: string;
    data?: any;
  }
}
```

**Common Error Codes**:

- `400`: Invalid move
- `401`: Game over
- `402`: Invalid AI level
- `500`: Internal server error

## Configuration

### MCP Server Configuration

```typescript
interface MCPConfig {
  name: string;
  version: string;
  capabilities: {
    tools: Tool[];
  };
}
```

### Tool Definitions

```typescript
interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}
```

## Examples

### Complete Game Flow

```typescript
// 1. Start new game
const startResponse = await mcpServer.handleRequest({
  method: "tools/call",
  params: { name: "start_new_game" },
});

// 2. Make opening move
const moveResponse = await mcpServer.handleRequest({
  method: "tools/call",
  params: {
    name: "make_move",
    arguments: { move: "e2e4" },
  },
});

// 3. Get AI move
const aiResponse = await mcpServer.handleRequest({
  method: "tools/call",
  params: {
    name: "ai_move",
    arguments: { level: 3 },
  },
});

// 4. Analyze position
const analysisResponse = await mcpServer.handleRequest({
  method: "tools/call",
  params: { name: "analyze_position" },
});
```

### Error Handling Example

```typescript
try {
  const response = await mcpServer.handleRequest({
    method: "tools/call",
    params: {
      name: "make_move",
      arguments: { move: "e2e5" }, // Invalid move
    },
  });
} catch (error) {
  if (error.code === 400) {
    console.log("Invalid move:", error.message);
  }
}
```

## Performance Considerations

### Response Times

- **Move validation**: <1ms
- **Board state retrieval**: <1ms
- **Legal move generation**: <5ms
- **Position analysis**: 10-50ms
- **AI move generation**: 50-1000ms (depends on level)

### Memory Usage

- **Board representation**: ~1KB
- **Move list**: ~10KB
- **AI search tree**: 1-10MB (depends on depth)

### Best Practices

1. **Cache board states** for repeated requests
2. **Limit AI search depth** for faster responses
3. **Use appropriate AI levels** for use case
4. **Handle errors gracefully** with proper fallbacks
5. **Monitor memory usage** for long-running sessions
