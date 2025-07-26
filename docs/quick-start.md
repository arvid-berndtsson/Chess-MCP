# Quick Start Guide

## Get Chess MCP Running in 5 Minutes

This guide will get you up and running with Chess MCP quickly. Follow these steps to start playing chess with AI assistants.

## Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **yarn** package manager
- **Git** (for cloning the repository)

## Step 1: Install Dependencies

```bash
# Clone the repository
git clone https://github.com/yourusername/chess-mcp.git
cd chess-mcp

# Install dependencies
npm install
```

## Step 2: Test the Installation

```bash
# Test the chess engine
npx tsx test-chess.ts

# Test the MCP server
npx tsx test-mcp.ts
```

You should see a chess game being played automatically with board displays and move analysis.

## Step 3: Configure MCP Client

### For Raycast

1. Open Raycast
2. Run "Install Server" command
3. Copy the configuration from `mcp-config.json`
4. Replace `PATH-TO-PROJECT` with your actual path:

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

### For Claude Desktop

1. Open Claude Desktop settings
2. Navigate to MCP section
3. Add the same configuration as above

### For Other MCP Clients

Use the configuration in `mcp-config.json` according to your client's documentation.

## Step 4: Start Playing

### Interactive CLI Mode

```bash
# Start interactive chess game
npm run cli

# Set up Human vs AI (Level 3)
chess> mode human-vs-ai 3

# Make your first move
chess> move e2e4
```

### MCP Mode

Once configured, you can use chess commands in your AI assistant:

- "Start a new chess game"
- "Make the move e2e4"
- "Show me the current board"
- "What are the best moves?"
- "Play against me at level 3"

## Common Issues & Solutions

### ❌ "Command not found: npx"

**Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)

### ❌ "Module not found" errors

**Solution**: Run `npm install` to install dependencies

### ❌ MCP server not responding

**Solution**:

1. Check the path in your MCP configuration
2. Ensure you're using the correct command: `npx tsx src/index.ts`
3. Test with `npx tsx test-mcp.ts`

### ❌ Permission denied errors

**Solution**:

```bash
# Make scripts executable
chmod +x src/index.ts
chmod +x src/cli.ts
```

## Quick Commands Reference

### Basic Game Commands

```bash
# Start new game
chess> mode human-vs-ai 3

# Make moves
chess> move e2e4
chess> move g1f3

# View board
chess> board

# Get legal moves
chess> all-moves

# Analyze position
chess> analyze
```

### MCP Commands

```bash
# Start MCP server
npx tsx src/index.ts

# Test MCP functionality
npx tsx test-mcp.ts

# Run chess tests
npx tsx test-chess.ts
```

## Next Steps

- Read the [User Guide](./user-guide.md) for detailed usage
- Explore [AI Implementation](./ai-implementation.md) for advanced features
- Check [Developer Guide](./developer-guide.md) for contribution

## Getting Help

- **Documentation**: Check the [docs](./) folder
- **Issues**: Report bugs on GitHub
- **Discussions**: Join the community forum

---

**🎉 You're ready to play chess with AI!**

The Chess MCP server is now configured and ready to use. You can play chess through your AI assistant or use the interactive CLI for a traditional chess experience.
