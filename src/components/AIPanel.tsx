import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
  Settings,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  aiProviders,
  aiActions,
  callAI,
  fetchOllamaModels,
  type AIConfig,
} from "@/lib/ai-providers";
import { settingsManager } from "@/lib/settings";
import { useTranslation } from "@/hooks/useTranslation";

interface AIPanelProps {
  markdown: string;
  setMarkdown: (markdown: string) => void;
  onOpenSettings?: () => void;
}

export default function AIPanel({
  markdown,
  setMarkdown,
  onOpenSettings,
}: AIPanelProps) {
  const { t } = useTranslation();
  const settings = settingsManager.getSettings();
  const [config, setConfig] = useState<AIConfig>({
    provider: settings.defaultTextProvider,
    model: settings.defaultTextModel,
    apiKey: settings.textProviders[settings.defaultTextProvider]?.apiKey || "",
  });
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");
  const [resultType, setResultType] = useState<"titles" | "components" | null>(
    null,
  );
  const [showContext, setShowContext] = useState(false);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<
    "idle" | "testing" | "connected" | "failed"
  >("idle");

  // Get available models based on provider
  const availableModels =
    config.provider === "ollama"
      ? ollamaModels
      : aiProviders[config.provider]?.models || [];

  // Update config and save to settings when provider changes
  const handleProviderChange = (value: string) => {
    setConfig({ ...config, provider: value });
    settingsManager.setDefaultTextProvider(value);
  };

  // Update config and save to settings when model changes
  const handleModelChange = (value: string) => {
    setConfig({ ...config, model: value });
    settingsManager.setDefaultTextModel(value);
  };

  // Load models when provider changes
  useEffect(() => {
    if (config.provider === "ollama") {
      setLoadingModels(true);
      const ollamaBaseUrl =
        settingsManager.getTextProvider("ollama")?.baseUrl ||
        "http://localhost:11434";
      fetchOllamaModels(ollamaBaseUrl)
        .then((models) => {
          setOllamaModels(models);
          if (models.length > 0 && !config.model) {
            setConfig((prev) => ({ ...prev, model: models[0] }));
          }
        })
        .catch((error) => {
          console.error("Failed to fetch Ollama models:", error);
          setOllamaModels([]);
        })
        .finally(() => {
          setLoadingModels(false);
        });
    }
  }, [config.provider, config.model]);

  // Test Ollama connection on mount
  useEffect(() => {
    testOllamaConnection();
  }, []);

  // Update default model when provider changes
  useEffect(() => {
    const providerModels = aiProviders[config.provider]?.models || [];
    if (providerModels.length > 0 && !providerModels.includes(config.model)) {
      setConfig((prev) => ({ ...prev, model: providerModels[0] }));
    }
  }, [config.provider, config.model]);

  const testOllamaConnection = async () => {
    setOllamaStatus("testing");
    const ollamaProvider = settingsManager.getTextProvider("ollama");
    const baseUrl = ollamaProvider?.baseUrl || "http://localhost:11434";

    try {
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(3000),
      });
      const connected = response.ok;
      setOllamaStatus(connected ? "connected" : "failed");
    } catch {
      setOllamaStatus("failed");
    }
  };

  const handleAction = async (actionId: string) => {
    if (!markdown.trim()) {
      alert(t("toasts.noContent"));
      return;
    }

    // Check if provider is configured
    const providerConfig = settingsManager.getTextProvider(config.provider);
    if (config.provider !== "ollama" && !providerConfig?.apiKey) {
      onOpenSettings?.();
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const action = aiActions[actionId];
      const response = await callAI(config, action, markdown, context);

      if (actionId === "generateTitles" || actionId === "suggestComponents") {
        setResult(response);
        setResultType(actionId === "generateTitles" ? "titles" : "components");
      } else {
        setMarkdown(response);
        setResultType(null);
      }
    } catch (error) {
      console.error("AI action failed:", error);
      alert(t("toasts.configRequired"));
    } finally {
      setLoading(false);
    }
  };

  // Check if current provider is configured
  const isConfigured = () => {
    const providerConfig = settingsManager.getTextProvider(config.provider);
    if (config.provider === "ollama") {
      // For Ollama, check connection status
      return ollamaStatus === "connected";
    }
    // For other providers, check if API key is configured
    return !!providerConfig?.apiKey;
  };

  // Get provider status info
  const getProviderStatus = (providerId: string) => {
    const provider = settingsManager.getTextProvider(providerId);
    const isOllama = providerId === "ollama";

    if (isOllama) {
      // For Ollama, check connection status
      return {
        connected: ollamaStatus === "connected",
        icon: <Check className="w-3 h-3 text-green-500" />,
        label: t("ai.available"),
      };
    } else if (provider?.apiKey) {
      // For other providers, check if API key is configured
      return {
        connected: true,
        icon: <Check className="w-3 h-3 text-green-500" />,
        label: t("ai.configured"),
      };
    } else {
      // Not configured
      return {
        connected: false,
        icon: <AlertCircle className="w-3 h-3 text-muted-foreground" />,
        label: t("ai.setup"),
      };
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Provider Selector */}
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <Select value={config.provider} onValueChange={handleProviderChange}>
          <SelectTrigger className="h-8 flex-1">
            <SelectValue placeholder={t("ai.selectProvider")} />
          </SelectTrigger>
          <SelectContent>
            {Object.values(aiProviders).map((provider) => {
              const status = getProviderStatus(provider.id);
              return (
                <SelectItem key={provider.id} value={provider.id}>
                  <div className="flex items-center justify-between w-full gap-3">
                    <span className="truncate">{provider.name}</span>
                    <span className="flex items-center shrink-0">
                      {status.connected ? (
                        <>
                          <Check className="w-3 h-3 text-green-500 mr-1.5" />
                          <span className="text-xs text-green-600 font-medium">
                            {status.label}
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-amber-500 mr-1.5" />
                          <span className="text-xs text-amber-600 font-medium">
                            {status.label}
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Model Selector */}
      <Select
        value={config.model}
        onValueChange={handleModelChange}
        disabled={loadingModels && config.provider === "ollama"}
      >
        <SelectTrigger className="h-8">
          <SelectValue
            placeholder={
              loadingModels ? t("ai.loadingModels") : t("ai.selectModel")
            }
          />
        </SelectTrigger>
        <SelectContent>
          {config.provider === "ollama" && availableModels.length === 0 ? (
            <SelectItem value="none" disabled>
              {loadingModels ? t("ai.loadingModels") : t("ai.noModelsFound")}
            </SelectItem>
          ) : (
            availableModels.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Configure button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onOpenSettings?.()}
        className="w-full h-8 text-xs"
      >
        <Settings className="w-3 h-3 mr-1" />
        {t("ai.configureProviders")}
        {!isConfigured() && (
          <span className="ml-1 text-amber-600">{t("ai.needsSetup")}</span>
        )}
      </Button>

      {/* Context - Collapsible */}
      <div className="border border-dashed rounded-xl bg-gradient-to-br from-muted/20 to-muted/5 overflow-hidden">
        <button
          onClick={() => setShowContext(!showContext)}
          className="w-full flex items-center justify-between p-3 hover:bg-muted/40 transition-all duration-200 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-left">
              <span className="font-medium text-sm text-foreground">
                {t("ai.context")}
              </span>
              <span className="text-xs text-muted-foreground ml-1.5">
                {t("ai.contextOptional")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {context && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {context.length} {t("ai.chars")}
              </span>
            )}
            <div className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center group-hover:bg-muted transition-colors">
              {showContext ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
          </div>
        </button>

        {showContext && (
          <div className="px-3 pb-3">
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={t("ai.contextPlaceholder")}
              className="w-full text-sm border border-input rounded-lg bg-background/50 px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              rows={3}
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground/60">
                {t("ai.contextHelp")}
              </span>
              {context && (
                <button
                  onClick={() => setContext("")}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("common.clear")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Actions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">{t("ai.actions")}</h3>
        </div>

        <div className="space-y-4">
          {/* Generate Category */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
              {t("ai.generate")}
            </div>
            <div className="space-y-2">
              {["generateTitles", "expandContent", "suggestComponents"].map(
                (actionId) => {
                  const action = aiActions[actionId];
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.id)}
                      disabled={loading || !isConfigured()}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium
                        bg-gradient-to-r ${action.gradient} ${action.hoverGradient}
                        shadow-lg ${action.shadowColor} hover:shadow-xl
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 transform hover:-translate-y-0.5
                      `}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span className="text-lg">{action.icon}</span>
                      )}
                      <span>{t(`ai.${action.id}` as any)}</span>
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* Improve Category */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
              {t("ai.improve")}
            </div>
            <div className="space-y-2">
              {["smartFormat", "polishWithContext"].map((actionId) => {
                const action = aiActions[actionId];
                return (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action.id)}
                    disabled={loading || !isConfigured()}
                    className={`w-full flex items-center justify-start h-10 px-4 rounded-lg text-white font-medium text-sm transition-all duration-200 bg-gradient-to-r ${action.gradient} ${action.hoverGradient} shadow-lg ${action.shadowColor} hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <span className="mr-2 text-base">{action.icon}</span>
                    )}
                    {t(`ai.${action.id}` as any)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Result Panel */}
      {result && resultType && (
        <div className="border rounded-lg p-3 bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">
              {resultType === "titles"
                ? t("ai.generatedTitles")
                : t("ai.componentSuggestions")}
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setResult("");
                setResultType(null);
              }}
              className="h-6 px-2 text-xs"
            >
              {t("common.clear")}
            </Button>
          </div>
          <div className="text-sm space-y-2">
            {resultType === "titles" ? (
              // Render titles as simple list
              result
                .split("\n")
                .filter((line) => line.trim())
                .map((title, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between group p-2 hover:bg-background rounded"
                  >
                    <span className="flex-1">{title}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(title);
                        alert(t("toasts.copied"));
                      }}
                      className="opacity-0 group-hover:opacity-100 h-7"
                    >
                      {t("common.copy")}
                    </Button>
                  </div>
                ))
            ) : (
              // Render component suggestions with formatted blocks
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-xs bg-background p-3 rounded border overflow-auto max-h-64">
                  {result}
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    alert(t("toasts.suggestionsCopied"));
                  }}
                  className="mt-2 w-full"
                >
                  {t("common.copyAll")}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
