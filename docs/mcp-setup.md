# Chess MCP Setup Guide

## Quick Setup

1. **Clone or download this project**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Copy the MCP configuration:**
   - Copy `mcp-config.json`
   - Replace `PATH-TO-PROJECT` with your actual project path
   - Example: `/Users/yourname/Chess-MCP/src/index.ts`

## MCP Configuration

### For Raycast:

1. Open Raycast
2. Run "Install Server" command
3. Paste the modified configuration from `mcp-config.json`

### For Claude Desktop:

1. Open Claude Desktop settings
2. Go to MCP section
3. Add the modified configuration from `mcp-config.json`

### For other MCP clients:

Use the configuration in `mcp-config.json` according to your client's documentation.

## Example Configuration

```json
{
  "mcpServers": {
    "chess": {
      "name": "Chess MCP",
      "type": "stdio",
      "command": "npx",
      "args": ["tsx", "/Users/yourname/Chess-MCP/src/index.ts"]
    }
  }
}
```

## Testing

Run the test to verify everything works:

```bash
npx tsx test-mcp.ts
```

## Available Commands

Once connected, you can use these chess commands:

- Start a new game
- Make moves (e.g., "e2e4")
- Get board state
- Get legal moves
- Analyze positions
- Play against AI
- Save/load games

## Troubleshooting

- **Path issues**: Make sure the path in the configuration points to your actual project location
- **Node.js required**: Ensure Node.js is installed and `npx` is available
- **Dependencies**: Run `npm install` if you get module errors
