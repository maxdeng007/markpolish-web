import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
  Settings,
  Check,
  AlertCircle,
} from 'lucide-react'
import {
  aiProviders,
  aiActions,
  callAI,
  fetchOllamaModels,
  type AIConfig,
} from '@/lib/ai-providers'
import { settingsManager } from '@/lib/settings'
import SettingsModal from '@/components/SettingsModal'

interface AIPanelProps {
  markdown: string
  setMarkdown: (markdown: string) => void
}

export default function AIPanel({ markdown, setMarkdown }: AIPanelProps) {
  const settings = settingsManager.getSettings()
  const [config, setConfig] = useState<AIConfig>({
    provider: settings.defaultTextProvider,
    model: settings.defaultTextModel,
    apiKey: settings.textProviders[settings.defaultTextProvider]?.apiKey || "",
  })
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState("")
  const [result, setResult] = useState("")
  const [resultType, setResultType] = useState<"titles" | "components" | null>(null)
  const [showContext, setShowContext] = useState(false)
  const [ollamaModels, setOllamaModels] = useState<string[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [ollamaStatus, setOllamaStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle')


  // Get available models based on provider
  const availableModels =
    config.provider === "ollama"
      ? ollamaModels
      : aiProviders[config.provider]?.models || []

  // Check Ollama connection on mount
  useEffect(() => {
    testOllamaConnection()
  }, [])

  // Check Ollama connection when opening settings modal
  useEffect(() => {
    if (showSettingsModal && config.provider === "ollama") {
      testOllamaConnection()
    }
  }, [showSettingsModal, config.provider])

  // Load models when provider changes
  useEffect(() => {
    if (config.provider === "ollama") {
      setLoadingModels(true)
      const ollamaBaseUrl =
        settingsManager.getTextProvider("ollama")?.baseUrl ||
        "http://localhost:11434"
      fetchOllamaModels(ollamaBaseUrl)
        .then((models) => {
          setOllamaModels(models)
          if (models.length > 0 && !config.model) {
            setConfig((prev) => ({ ...prev, model: models[0] }))
        }
      })
      .catch((error) => {
        console.error("Failed to fetch Ollama models:", error)
        setOllamaModels([])
      })
      .finally(() => {
        setLoadingModels(false)
      })
  }
}, [config.provider, config.model])

  // Update default model when provider changes
  useEffect(() => {
    const providerModels = aiProviders[config.provider]?.models || []
    if (providerModels.length > 0 && !providerModels.includes(config.model)) {
      setConfig((prev) => ({ ...prev, model: providerModels[0] }))
    }
  }, [config.provider, config.model])

  const testOllamaConnection = async () => {
    setOllamaStatus("testing")
    const ollamaProvider = settingsManager.getTextProvider("ollama")
    const baseUrl = ollamaProvider?.baseUrl || "http://localhost:11434"
    
    try {
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(3000),
      })
      const connected = response.ok
      setOllamaStatus(connected ? "connected" : "failed")
    } catch {
      setOllamaStatus("failed")
    }
  }

  const handleAction = async (actionId: string) => {
    if (!markdown.trim()) {
      alert("Please add some content first")
      return
    }

    // Check if provider is configured
    const providerConfig = settingsManager.getTextProvider(config.provider)
    if (config.provider !== "ollama" && !providerConfig?.apiKey) {
      setShowSettingsModal(true)
      return
    }

    setLoading(true)
    setResult("")

    try {
      const action = aiActions[actionId]
      const response = await callAI(config, action, markdown, context)

      if (actionId === "generateTitles" || actionId === "suggestComponents") {
        setResult(response)
        setResultType(actionId === "generateTitles" ? "titles" : "components")
      } else {
        setMarkdown(response)
        setResultType(null)
      }
    } catch (error) {
      console.error("AI action failed:", error)
      alert("AI action failed. Please check your configuration in Settings.")
    } finally {
      setLoading(false)
    }
  }

  // Check if current provider is configured
  const isConfigured = () => {
    const providerConfig = settingsManager.getTextProvider(config.provider)
    if (config.provider === "ollama") {
      // For Ollama, check connection status
      return ollamaStatus === "connected"
    }
    // For other providers, check if API key is configured
    return !!providerConfig?.apiKey
  }

  // Get provider status info
  const getProviderStatus = (providerId: string) => {
    const provider = settingsManager.getTextProvider(providerId)
    const isOllama = providerId === "ollama"
    
    if (isOllama) {
      // For Ollama, check connection status
      return {
        connected: ollamaStatus === "connected",
        icon: <Check className="w-3 h-3 text-green-500" />,
        label: "Available",
      }
    } else if (provider?.apiKey) {
      // For other providers, check if API key is configured
      return {
        connected: true,
        icon: <Check className="w-3 h-3 text-green-500" />,
        label: "Ready",
      }
    } else {
      // Not configured
      return {
        connected: false,
        icon: <AlertCircle className="w-3 h-3 text-muted-foreground" />,
        label: "Setup",
      }
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Provider Selector */}
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <Select
          value={config.provider}
          onValueChange={(value) => setConfig({ ...config, provider: value })}
        >
          <SelectTrigger className="h-8 flex-1">
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(aiProviders).map((provider) => {
              const status = getProviderStatus(provider.id)
              return (
                <SelectItem key={provider.id} value={provider.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{provider.name}</span>
                    <div className="flex items-center gap-1">
                      {status.connected ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {status.label}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Model Selector */}
      <Select
        value={config.model}
        onValueChange={(value) => setConfig({ ...config, model: value })}
        disabled={loadingModels && config.provider === "ollama"}
      >
        <SelectTrigger className="h-8">
          <SelectValue placeholder={loadingModels ? "Loading models..." : "Select model"} />
        </SelectTrigger>
        <SelectContent>
          {config.provider === "ollama" && availableModels.length === 0 ? (
            <SelectItem value="none" disabled>
              {loadingModels ? "Loading..." : 'No models found. Run "ollama pull <model>"'}
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
        onClick={() => setShowSettingsModal(true)}
        className="w-full h-8 text-xs"
      >
        <Settings className="w-3 h-3 mr-1" />
        Configure AI Providers
        {!isConfigured() && (
          <span className="ml-1 text-amber-600">(needs setup)</span>
        )}
      </Button>

      {/* Context - Collapsible */}
      <div className="border rounded-lg">
        <button
          onClick={() => setShowContext(!showContext)}
          className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Context (Optional)</span>
          </div>
          {showContext ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {showContext && (
          <div className="p-3 pt-0 border-t">
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Add context for AI actions..."
              className="w-full text-sm border-0 bg-transparent resize-none focus:outline-none"
              rows={2}
            />
          </div>
        )}
      </div>

      {/* AI Actions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">AI Actions</h3>
        </div>

        <div className="space-y-4">
          {/* Generate Category */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
              Generate
            </div>
            <div className="space-y-2">
              {["generateTitles", "expandContent", "suggestComponents"].map(
                (actionId) => {
                  const action = aiActions[actionId]
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
                      <span>{action.name}</span>
                    </button>
                  )
                },
              )}
            </div>
          </div>

          {/* Improve Category */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
              Improve
            </div>
            <div className="space-y-2">
              {["smartFormat", "polishWithContext"].map((actionId) => {
                const action = aiActions[actionId]
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
                    {action.name}
                  </button>
                )
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
              {resultType === "titles" ? "Generated Titles" : "Component Suggestions"}
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setResult("")
                setResultType(null)
              }}
              className="h-6 px-2 text-xs"
            >
              Clear
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
                        navigator.clipboard.writeText(title)
                        alert("Copied!")
                      }}
                      className="opacity-0 group-hover:opacity-100 h-7"
                    >
                      Copy
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
                    navigator.clipboard.writeText(result)
                    alert("Suggestions copied!")
                  }}
                  className="mt-2 w-full"
                >
                  Copy All Suggestions
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        initialTab={config.provider === "ollama" ? "text" : "text"}
      />
    </div>
  )
}
