import { describe, it, expect } from "vitest";
import {
  exportToMarkdown,
  exportToHTML,
  exportForWeChat,
} from "@/lib/export";

// These tests focus on the module exports and basic structure
// Integration tests for browser APIs would require more sophisticated setup

describe("export module", () => {
  it("should export exportToMarkdown function", () => {
    expect(typeof exportToMarkdown).toBe("function");
  });

  it("should export exportToHTML function", () => {
    expect(typeof exportToHTML).toBe("function");
  });

  it("should export exportForWeChat function", () => {
    expect(typeof exportForWeChat).toBe("function");
  });
});

// Basic validation tests that don't require DOM APIs
describe("exportToMarkdown validation", () => {
  it("should be a function", () => {
    expect(typeof exportToMarkdown).toBe("function");
  });
});

describe("exportToHTML validation", () => {
  it("should be an async function", async () => {
    expect(exportToHTML).toBeInstanceOf(Function);
    // The function should accept at least markdown parameter
    const fnStr = exportToHTML.toString();
    expect(fnStr).toContain("async");
  });
});

describe("exportForWeChat validation", () => {
  it("should be an async function", async () => {
    expect(exportForWeChat).toBeInstanceOf(Function);
    const fnStr = exportForWeChat.toString();
    expect(fnStr).toContain("async");
  });
});
