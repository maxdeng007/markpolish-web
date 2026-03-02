import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Check,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Image as ImageIcon,
  AlertCircle,
  Zap,
} from "lucide-react";
import { settingsManager } from "@/lib/settings";
import { aiProviders } from "@/lib/ai-providers";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "text" | "image" | "preferences";
}

export default function SettingsModal({
  isOpen,
  onClose,
  initialTab = "text",
}: SettingsModalProps) {
  const settings = settingsManager.getSettings();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingOllama, setTestingOllama] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<
    "idle" | "testing" | "connected" | "failed"
  >("idle");
  const [activeSection, setActiveSection] = useState<
    "text" | "image" | "preferences"
  >(initialTab);

  const textProviders = settingsManager.getTextProviders();
  const imageProviders = settingsManager.getImageProviders();

  // Check Ollama connection on mount
  useEffect(() => {
    if (isOpen) {
      const checkOllama = async () => {
        const connected = await settingsManager.checkOllamaConnection();
        setOllamaStatus(connected ? "connected" : "failed");
      };
      checkOllama();
    }
  }, [isOpen]);

  // Reset to initial tab when opening
  useEffect(() => {
    if (isOpen) {
      setActiveSection(initialTab);
    }
  }, [isOpen, initialTab]);

  const toggleShowKey = (providerId: string) => {
    setShowKeys((prev) => ({
      ...prev,
      [providerId]: !prev[providerId],
    }));
  };

  const handleApiKeyChange = (
    providerId: string,
    value: string,
    type: "text" | "image",
  ) => {
    if (type === "text") {
      settingsManager.setTextProviderApiKey(providerId, value);
    } else {
      settingsManager.setImageProviderApiKey(providerId, value);
    }
  };

  const handleOllamaUrlChange = (value: string) => {
    settingsManager.setTextProviderBaseUrl("ollama", value);
  };

  const testOllamaConnection = async () => {
    setTestingOllama(true);
    const connected = await settingsManager.checkOllamaConnection();
    setOllamaStatus(connected ? "connected" : "failed");
    setTestingOllama(false);
  };

  const clearProviderKey = (providerId: string, type: "text" | "image") => {
    if (type === "text") {
      settingsManager.setTextProviderApiKey(providerId, "");
    } else {
      settingsManager.setImageProviderApiKey(providerId, "");
    }
  };

  const getProviderIcon = (_providerId: string, configured: boolean) => {
    if (configured) {
      return <Check className="w-4 h-4 text-green-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
  };

  const getStatusBadge = (
    status: "idle" | "testing" | "connected" | "failed",
  ) => {
    const badges = {
      idle: { text: "Not tested", className: "text-muted-foreground bg-muted" },
      testing: {
        text: "Testing...",
        className: "text-yellow-600 bg-yellow-50",
      },
      connected: { text: "Connected", className: "text-green-600 bg-green-50" },
      failed: { text: "Failed", className: "text-red-600 bg-red-50" },
    };
    return badges[status];
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 bg-muted/50 border-b">
          <button
            onClick={() => setActiveSection("text")}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1 ${
              activeSection === "text"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Text
          </button>
          <button
            onClick={() => setActiveSection("image")}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1 ${
              activeSection === "image"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            AI Images
          </button>
          <button
            onClick={() => setActiveSection("preferences")}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1 ${
              activeSection === "preferences"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="w-4 h-4" />
            Preferences
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* AI Text Providers Section */}
          {activeSection === "text" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Text Providers</h4>
                <span className="text-xs text-muted-foreground">
                  {textProviders.filter((p) => p.isConfigured).length}{" "}
                  configured
                </span>
              </div>

              <div className="space-y-3">
                {textProviders.map((provider) => (
                  <div key={provider.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {getProviderIcon(provider.id, provider.isConfigured)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {provider.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {provider.id === "ollama"
                            ? "Local LLM - No API key required"
                            : aiProviders[provider.id]?.models
                                .slice(0, 2)
                                .join(", ")}
                        </div>
                      </div>
                      {provider.isConfigured && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Ready
                        </span>
                      )}
                    </div>

                    {/* API Key or URL input */}
                    {provider.id === "ollama" ? (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">
                            Base URL
                          </label>
                          <div className="flex gap-2">
                            <Input
                            value={
                                provider.baseUrl || "http://localhost:11434"
                              }
                              onChange={(e) =>
                                handleOllamaUrlChange(e.target.value)
                              }
                              placeholder="http://localhost:11434"
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={testOllamaConnection}
                              disabled={testingOllama}
                            >
                              {testingOllama ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                              Test
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${getStatusBadge(ollamaStatus).className}`}
                            >
                              {getStatusBadge(ollamaStatus).text}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      aiProviders[provider.id]?.requiresApiKey && (
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">
                            API Key
                          </label>
                          <div className="relative">
                            <Input
                              type={showKeys[provider.id] ? "text" : "password"}
                              value={provider.apiKey}
                              onChange={(e) =>
                                handleApiKeyChange(
                                  provider.id,
                                  e.target.value,
                                  "text",
                                )
                              }
                              placeholder={`Enter your ${provider.name} API key`}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => toggleShowKey(provider.id)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                            >
                              {showKeys[provider.id] ? (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                          {provider.apiKey && (
                            <div className="flex justify-end gap-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  clearProviderKey(provider.id, "text")
                                }
                                className="text-xs text-red-600 hover:text-red-700"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Clear
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Image Providers Section */}
          {activeSection === "image" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Image Providers</h4>
                <span className="text-xs text-muted-foreground">
                  {imageProviders.filter((p) => p.isConfigured).length}{" "}
                  configured
                </span>
              </div>

              <div className="space-y-3">
                {imageProviders.map((provider) => (
                  <div key={provider.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {getProviderIcon(provider.id, provider.isConfigured)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {provider.name}
                        </div>
                        {provider.id === "picsum" && (
                          <div className="text-xs text-muted-foreground">
                            Random stock photos
                          </div>
                        )}
                        {provider.id === "gradient" && (
                          <div className="text-xs text-muted-foreground">
                            Gradient backgrounds
                          </div>
                        )}
                        {provider.id === "pattern" && (
                          <div className="text-xs text-muted-foreground">
                            SVG patterns
                          </div>
                        )}
                      </div>
                      {provider.isConfigured &&
                        provider.id !== "picsum" &&
                        provider.id !== "gradient" &&
                        provider.id !== "pattern" && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Ready
                          </span>
                        )}
                    </div>

                    {/* API Key input for providers that need it */}
                    {provider.id !== "picsum" &&
                      provider.id !== "gradient" &&
                      provider.id !== "pattern" && (
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">
                            API Key
                          </label>
                          <div className="relative">
                            <Input
                              type={showKeys[provider.id] ? "text" : "password"}
                              value={provider.apiKey}
                              onChange={(e) =>
                                handleApiKeyChange(
                                  provider.id,
                                  e.target.value,
                                  "image"
                                )
                              }
                              placeholder={`Enter your ${provider.name} API key`}
                              className="pr-10"
                              autoComplete="off"
                              spellCheck="false"
                            />
                          {provider.apiKey && (
                            <div className="flex justify-end gap-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  clearProviderKey(provider.id, "image")
                                }
                                className="text-xs text-red-600 hover:text-red-700"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Clear
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeSection === "preferences" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Default Preferences</h4>
              </div>

              <div className="space-y-4">
                {/* Default Text Provider */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Default Text Provider
                  </label>
                  <Select
                    value={settings.defaultTextProvider}
                    onValueChange={(value) =>
                      settingsManager.setDefaultTextProvider(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {settingsManager
                        .getConfiguredTextProviders()
                        .map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Default Text Model */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Default Text Model
                  </label>
                  <Select
                    value={settings.defaultTextModel}
                    onValueChange={(value) =>
                      settingsManager.setDefaultTextModel(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiProviders[settings.defaultTextProvider]?.models.map(
                        (model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Default Image Provider */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Default Image Provider
                  </label>
                  <Select
                    value={settings.defaultImageProvider}
                    onValueChange={(value) =>
                      settingsManager.setDefaultImageProvider(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {settingsManager
                        .getConfiguredImageProviders()
                        .map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear All Settings */}
                <div className="mt-6 pt-4 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to clear all settings? This cannot be undone.",
                        )
                      ) {
                        settingsManager.clearAll();
                      }
                    }}
                    className="w-full"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Clear All Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}
