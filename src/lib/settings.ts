// Settings management with localStorage persistence

// Simple obfuscation for API keys (not encryption, just basic obfuscation)
const obfuscate = (str: string): string => {
  return btoa(encodeURIComponent(str).split("").reverse().join(""));
};

const deobfuscate = (str: string): string => {
  try {
    return decodeURIComponent(atob(str).split("").reverse().join(""));
  } catch {
    return "";
  }
};

export interface ProviderConfig {
  id: string;
  name: string;
  apiKey: string;
  baseUrl?: string;
  isConfigured: boolean;
}

export interface ImageProviderConfig {
  id: string;
  name: string;
  apiKey: string;
  baseUrl?: string;
  isConfigured: boolean;
}

export interface AppSettings {
  // AI Text Providers
  textProviders: Record<string, ProviderConfig>;
  defaultTextProvider: string;
  defaultTextModel: string;

  // AI Image Providers
  imageProviders: Record<string, ImageProviderConfig>;
  defaultImageProvider: string;

  // UI Preferences
  theme: string;

  // Auto-save Settings
  autoSave: boolean;
  autoSaveInterval: number;
}

const STORAGE_KEY = "markpolish_settings";

// Default text providers
const defaultTextProviders: Record<string, ProviderConfig> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
    isConfigured: false,
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    apiKey: "",
    baseUrl: "https://openrouter.ai/api/v1",
    isConfigured: false,
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    apiKey: "",
    baseUrl: "https://api.anthropic.com/v1",
    isConfigured: false,
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    apiKey: "",
    baseUrl: "https://generativelanguage.googleapis.com/v1",
    isConfigured: false,
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    apiKey: "",
    baseUrl: "https://api.deepseek.com/v1",
    isConfigured: false,
  },
  ollama: {
    id: "ollama",
    name: "Ollama (Local)",
    apiKey: "",
    baseUrl: "http://localhost:11434",
    isConfigured: false, // Configured when URL is set and models available
  },
};

// Default image providers
const defaultImageProviders: Record<string, ImageProviderConfig> = {
  modelscope: {
    id: "modelscope",
    name: "ModelScope (Z-Image-Turbo)",
    apiKey: "",
    baseUrl: "https://api-inference.modelscope.cn/v1",
    isConfigured: false,
  },
  dashscope: {
    id: "dashscope",
    name: "DashScope (Alibaba)",
    apiKey: "",
    baseUrl: "https://dashscope.aliyuncs.com/api/v1",
    isConfigured: false,
  },
  picsum: {
    id: "picsum",
    name: "Picsum (Random Photos)",
    apiKey: "",
    isConfigured: true, // No API key needed
  },
  gradient: {
    id: "gradient",
    name: "Gradient Backgrounds",
    apiKey: "",
    isConfigured: true, // No API key needed
  },
  pattern: {
    id: "pattern",
    name: "SVG Patterns",
    apiKey: "",
    isConfigured: true, // No API key needed
  },
};

const defaultSettings: AppSettings = {
  textProviders: defaultTextProviders,
  defaultTextProvider: "openai",
  defaultTextModel: "gpt-4o-mini",
  imageProviders: defaultImageProviders,
  defaultImageProvider: "modelscope",
  theme: "wechat-classic",
  autoSave: true,
  autoSaveInterval: 30,
};

class SettingsManager {
  private settings: AppSettings;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.settings = this.load();
  }

  private load(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Merge with defaults to handle new providers added in updates
        const merged: AppSettings = {
          ...defaultSettings,
          ...parsed,
          textProviders: {
            ...defaultTextProviders,
            ...this.mergeProviders(parsed.textProviders, defaultTextProviders),
          },
          imageProviders: {
            ...defaultImageProviders,
            ...this.mergeImageProviders(
              parsed.imageProviders,
              defaultImageProviders,
            ),
          },
        };

        return merged;
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
    return { ...defaultSettings };
  }

  private mergeProviders(
    saved: Record<string, ProviderConfig> | undefined,
    defaults: Record<string, ProviderConfig>,
  ): Record<string, ProviderConfig> {
    if (!saved) return defaults;

    const merged = { ...defaults };
    for (const [id, config] of Object.entries(saved)) {
      if (merged[id]) {
        merged[id] = {
          ...merged[id],
          ...config,
          apiKey: config.apiKey ? deobfuscate(config.apiKey) : "",
        };
        // Recalculate isConfigured
        merged[id].isConfigured = !!(merged[id].apiKey || id === "ollama");
      }
    }
    return merged;
  }

  private mergeImageProviders(
    saved: Record<string, ImageProviderConfig> | undefined,
    defaults: Record<string, ImageProviderConfig>,
  ): Record<string, ImageProviderConfig> {
    if (!saved) return defaults;

    const merged = { ...defaults };
    for (const [id, config] of Object.entries(saved)) {
      if (merged[id]) {
        merged[id] = {
          ...merged[id],
          ...config,
          apiKey: config.apiKey ? deobfuscate(config.apiKey) : "",
        };
        // Picsum, gradient, pattern don't need API keys
        const noKeyNeeded = ["picsum", "gradient", "pattern"].includes(id);
        merged[id].isConfigured = noKeyNeeded || !!merged[id].apiKey;
      }
    }
    return merged;
  }

  private save(): void {
    try {
      // Obfuscate API keys before saving
      const toSave: AppSettings = {
        ...this.settings,
        textProviders: Object.fromEntries(
          Object.entries(this.settings.textProviders).map(([id, config]) => [
            id,
            {
              ...config,
              apiKey: config.apiKey ? obfuscate(config.apiKey) : "",
            },
          ]),
        ),
        imageProviders: Object.fromEntries(
          Object.entries(this.settings.imageProviders).map(([id, config]) => [
            id,
            {
              ...config,
              apiKey: config.apiKey ? obfuscate(config.apiKey) : "",
            },
          ]),
        ),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      this.notifyListeners();
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Getters
  getSettings(): AppSettings {
    return this.settings;
  }

  getTextProvider(id: string): ProviderConfig | undefined {
    return this.settings.textProviders[id];
  }

  getTextProviders(): ProviderConfig[] {
    return Object.values(this.settings.textProviders);
  }

  getConfiguredTextProviders(): ProviderConfig[] {
    return Object.values(this.settings.textProviders).filter(
      (p) => p.isConfigured,
    );
  }

  getImageProvider(id: string): ImageProviderConfig | undefined {
    return this.settings.imageProviders[id];
  }

  getImageProviders(): ImageProviderConfig[] {
    return Object.values(this.settings.imageProviders);
  }

  getConfiguredImageProviders(): ImageProviderConfig[] {
    return Object.values(this.settings.imageProviders).filter(
      (p) => p.isConfigured,
    );
  }

  getDefaultTextProvider(): string {
    return this.settings.defaultTextProvider;
  }

  getDefaultTextModel(): string {
    return this.settings.defaultTextModel;
  }

  getDefaultImageProvider(): string {
    return this.settings.defaultImageProvider;
  }

  // Setters
  setTextProviderApiKey(providerId: string, apiKey: string): void {
    if (this.settings.textProviders[providerId]) {
      this.settings.textProviders[providerId].apiKey = apiKey;
      this.settings.textProviders[providerId].isConfigured =
        !!apiKey || providerId === "ollama";
      this.save();
    }
  }

  setTextProviderBaseUrl(providerId: string, baseUrl: string): void {
    if (this.settings.textProviders[providerId]) {
      this.settings.textProviders[providerId].baseUrl = baseUrl;
      this.save();
    }
  }

  setDefaultTextProvider(providerId: string): void {
    if (this.settings.textProviders[providerId]) {
      this.settings.defaultTextProvider = providerId;
      this.save();
    }
  }

  setDefaultTextModel(model: string): void {
    this.settings.defaultTextModel = model;
    this.save();
  }

  setImageProviderApiKey(providerId: string, apiKey: string): void {
    if (this.settings.imageProviders[providerId]) {
      this.settings.imageProviders[providerId].apiKey = apiKey;
      const noKeyNeeded = ["picsum", "gradient", "pattern"].includes(
        providerId,
      );
      this.settings.imageProviders[providerId].isConfigured =
        noKeyNeeded || !!apiKey;
      this.save();
    }
  }

  setDefaultImageProvider(providerId: string): void {
    if (this.settings.imageProviders[providerId]) {
      this.settings.defaultImageProvider = providerId;
      this.save();
    }
  }

  setTheme(themeId: string): void {
    this.settings.theme = themeId;
    this.save();
  }

  // Check if Ollama is reachable
  async checkOllamaConnection(baseUrl?: string): Promise<boolean> {
    const url =
      baseUrl ||
      this.settings.textProviders.ollama?.baseUrl ||
      "http://localhost:11434";
    try {
      const response = await fetch(`${url}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Clear all settings
  clearAll(): void {
    this.settings = { ...defaultSettings };
    this.save();
  }
}

export const settingsManager = new SettingsManager();
