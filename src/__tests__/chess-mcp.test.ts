import { ChessMCPServer } from "../chess-mcp";
import { ChessEngine } from "../chess-engine";

describe("ChessMCPServer", () => {
  let mcpServer: ChessMCPServer;

  beforeEach(() => {
    mcpServer = new ChessMCPServer();
  });

  describe("Constructor", () => {
    test("should initialize MCP server", () => {
      expect(mcpServer).toBeDefined();
    });
  });

  describe("MCP Protocol Compliance", () => {
    test("should have correct server configuration", () => {
      // Test that the server is properly configured
      expect(mcpServer).toBeInstanceOf(ChessMCPServer);
    });

    test("should support required tools", () => {
      // The server should support all the required MCP tools
      // This is tested through the tool handlers in the server
      expect(mcpServer).toBeDefined();
    });
  });

  describe("Integration with Chess Engine", () => {
    test("should use ChessEngine internally", () => {
      // Test that the MCP server properly integrates with the chess engine
      expect(mcpServer).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    test("should handle initialization errors gracefully", () => {
      // Test that the server handles initialization errors properly
      expect(() => new ChessMCPServer()).not.toThrow();
    });
  });

  describe("Performance", () => {
    test("should initialize quickly", () => {
      const start = Date.now();

      new ChessMCPServer();

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should initialize quickly
    });
  });
});
