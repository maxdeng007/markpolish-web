import { describe, it, expect } from "vitest";
import { aiProviders, AIProvider } from "@/lib/ai-providers";

describe("aiProviders", () => {
  it("should have all major providers defined", () => {
    expect(aiProviders.openai).toBeDefined();
    expect(aiProviders.anthropic).toBeDefined();
    expect(aiProviders.gemini).toBeDefined();
    expect(aiProviders.deepseek).toBeDefined();
    expect(aiProviders.ollama).toBeDefined();
    expect(aiProviders.openrouter).toBeDefined();
  });

  it("should have at least 5 providers", () => {
    const providerCount = Object.keys(aiProviders).length;
    expect(providerCount).toBeGreaterThanOrEqual(5);
  });

  describe("each provider", () => {
    it("should have required properties", () => {
      Object.values(aiProviders).forEach((provider: AIProvider) => {
        expect(provider).toHaveProperty("id");
        expect(provider).toHaveProperty("name");
        expect(provider).toHaveProperty("models");
        expect(provider).toHaveProperty("requiresApiKey");
        expect(Array.isArray(provider.models)).toBe(true);
        expect(typeof provider.requiresApiKey).toBe("boolean");
      });
    });

    it("should have baseUrl defined", () => {
      Object.values(aiProviders).forEach((provider: AIProvider) => {
        expect(provider.baseUrl).toBeDefined();
        expect(typeof provider.baseUrl).toBe("string");
      });
    });
  });

  describe("OpenAI", () => {
    it("should require API key", () => {
      expect(aiProviders.openai.requiresApiKey).toBe(true);
    });

    it("should have GPT models available", () => {
      expect(aiProviders.openai.models).toContain("gpt-4o");
      expect(aiProviders.openai.models).toContain("gpt-4o-mini");
    });

    it("should use correct base URL", () => {
      expect(aiProviders.openai.baseUrl).toBe("https://api.openai.com/v1");
    });
  });

  describe("Anthropic", () => {
    it("should require API key", () => {
      expect(aiProviders.anthropic.requiresApiKey).toBe(true);
    });

    it("should have Claude models available", () => {
      expect(aiProviders.anthropic.models).toContain("claude-3-opus");
      expect(aiProviders.anthropic.models).toContain("claude-3-sonnet");
    });

    it("should use correct base URL", () => {
      expect(aiProviders.anthropic.baseUrl).toBe("https://api.anthropic.com/v1");
    });
  });

  describe("Google Gemini", () => {
    it("should require API key", () => {
      expect(aiProviders.gemini.requiresApiKey).toBe(true);
    });

    it("should have Gemini models available", () => {
      expect(aiProviders.gemini.models).toContain("gemini-pro");
    });
  });

  describe("DeepSeek", () => {
    it("should require API key", () => {
      expect(aiProviders.deepseek.requiresApiKey).toBe(true);
    });

    it("should have DeepSeek models available", () => {
      expect(aiProviders.deepseek.models).toContain("deepseek-chat");
    });
  });

  describe("Ollama", () => {
    it("should NOT require API key (local)", () => {
      expect(aiProviders.ollama.requiresApiKey).toBe(false);
    });

    it("should have empty models array (fetched dynamically)", () => {
      expect(aiProviders.ollama.models).toEqual([]);
    });

    it("should use local base URL", () => {
      expect(aiProviders.ollama.baseUrl).toBe("http://localhost:11434/v1");
    });
  });

  describe("OpenRouter", () => {
    it("should require API key", () => {
      expect(aiProviders.openrouter.requiresApiKey).toBe(true);
    });

    it("should have multiple model options", () => {
      expect(aiProviders.openrouter.models.length).toBeGreaterThan(1);
    });
  });
});
