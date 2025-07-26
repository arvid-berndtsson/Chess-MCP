// Test setup file for Jest
import { jest } from "@jest/globals";

// Increase timeout for AI tests
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
export const createTestBoard = () => {
  // Helper to create a test board state
  return {
    squares: Array(8)
      .fill(null)
      .map(() => Array(8).fill(null)),
    turn: "w" as const,
    castling: {
      w: { k: true, q: true },
      b: { k: true, q: true },
    },
    enPassant: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
  };
};

export const createTestMove = (
  from: string,
  to: string,
  promotion?: string,
) => {
  return {
    from,
    to,
    promotion,
    san: `${from}${to}`,
    lan: `${from}${to}`,
  };
};
