import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Settings, Eye, EyeOff, RefreshCw } from "lucide-react";
import { settingsManager } from "@/lib/settings";
import { aiProviders } from "@/lib/ai-providers";

interface MobileAISettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export default function MobileAISettingsSheet({
  isOpen,
  onClose,
  onSave,
}: MobileAISettingsSheetProps) {
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [showApiKey, setShowApiKey] = useState(false);
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState("http://localhost:11434");
  const [testingOllama, setTestingOllama] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<
    "idle" | "connected" | "failed"
  >("idle");
  const [isDark, setIsDark] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  // Detect dark mode
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Initialize from settings when opening
  useEffect(() => {
    if (isOpen) {
      const settings = settingsManager.getSettings();
      const provider = settings.defaultTextProvider;
      setSelectedProvider(provider);
      setSelectedModel(settings.defaultTextModel);

      const providerConfig = settings.textProviders[provider];
      if (providerConfig) {
        setApiKey(providerConfig.apiKey || "");
        if (provider === "ollama") {
          setOllamaBaseUrl(providerConfig.baseUrl || "http://localhost:11434");
        }
      }

      const models = aiProviders[provider]?.models || [];
      if (models.length > 0 && !models.includes(settings.defaultTextModel)) {
        setSelectedModel(models[0]);
      }

      setOllamaStatus("idle");
    }
  }, [isOpen]);

  const availableModels = aiProviders[selectedProvider]?.models || [];
  const isOllama = selectedProvider === "ollama";
  const requiresApiKey = aiProviders[selectedProvider]?.requiresApiKey ?? true;

  const handleProviderChange = (newProvider: string) => {
    setSelectedProvider(newProvider);
    const newModels = aiProviders[newProvider]?.models || [];
    if (newModels.length > 0) {
      setSelectedModel(newModels[0]);
    } else {
      setSelectedModel("");
    }
    // Load saved API key for this provider
    const settings = settingsManager.getSettings();
    const providerConfig = settings.textProviders[newProvider];
    setApiKey(providerConfig?.apiKey || "");
    if (newProvider === "ollama") {
      setOllamaBaseUrl(providerConfig?.baseUrl || "http://localhost:11434");
    }
  };

  const handleSave = () => {
    if (isOllama) {
      settingsManager.setTextProviderBaseUrl("ollama", ollamaBaseUrl);
    } else if (requiresApiKey && apiKey) {
      settingsManager.setTextProviderApiKey(selectedProvider, apiKey);
    }
    settingsManager.setDefaultTextProvider(selectedProvider);
    if (selectedModel) {
      settingsManager.setDefaultTextModel(selectedModel);
    }
    onSave?.();
    onClose();
  };

  const testOllama = async () => {
    setTestingOllama(true);
    const connected =
      await settingsManager.checkOllamaConnection(ollamaBaseUrl);
    setOllamaStatus(connected ? "connected" : "failed");
    setTestingOllama(false);
  };

  // Swipe down to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (sheetRef.current && deltaY > 0) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (sheetRef.current) {
      sheetRef.current.style.transform = "";
    }
    if (deltaY > 80) {
      onClose();
    }
  };

  if (typeof document === "undefined") return null;

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
    zIndex: 10020,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? "visible" : "hidden",
    pointerEvents: isOpen ? "auto" : "none",
    transition: "opacity 0.3s ease, visibility 0.3s ease",
  };

  const sheetStyle: React.CSSProperties = {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "85vh",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    zIndex: 10021,
    background: isDark ? "#1a1a1a" : "#ffffff",
    transform: isOpen ? "translateY(0)" : "translateY(100%)",
    transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 -8px 40px rgba(0, 0, 0, 0.15)",
  };

  const sheetContent = (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div
        ref={sheetRef}
        style={sheetStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mobile-ai-settings-handle">
          <div className="mobile-ai-settings-handle-bar" />
        </div>
        <div className="mobile-ai-settings-header">
          <Settings className="mobile-ai-settings-header-icon" />
          <span className="mobile-ai-settings-title">AI Settings</span>
        </div>
        <div className="mobile-ai-settings-body">
          <div className="mobile-ai-settings-field">
            <label className="mobile-ai-settings-label">Provider</label>
            <select
              className="mobile-ai-settings-select"
              value={selectedProvider}
              onChange={(e) => handleProviderChange(e.target.value)}
            >
              {settingsManager.getTextProviders().map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {isOllama ? (
            <div className="mobile-ai-settings-field">
              <label className="mobile-ai-settings-label">Base URL</label>
              <div className="mobile-ai-settings-row">
                <input
                  type="text"
                  className="mobile-ai-settings-input"
                  value={ollamaBaseUrl}
                  onChange={(e) => setOllamaBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                />
                <button
                  type="button"
                  className="mobile-ai-settings-test-btn"
                  onClick={testOllama}
                  disabled={testingOllama}
                >
                  {testingOllama ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                  Test
                </button>
              </div>
              {ollamaStatus !== "idle" && (
                <div className={`mobile-ai-settings-status ${ollamaStatus}`}>
                  {ollamaStatus === "connected"
                    ? "✓ Connected"
                    : "✗ Connection failed"}
                </div>
              )}
            </div>
          ) : (
            requiresApiKey && (
              <div className="mobile-ai-settings-field">
                <label className="mobile-ai-settings-label">API Key</label>
                <div className="mobile-ai-settings-input-wrap">
                  <input
                    type={showApiKey ? "text" : "password"}
                    className="mobile-ai-settings-input"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`Enter your ${aiProviders[selectedProvider]?.name || "AI"} API key`}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    className="mobile-ai-settings-eye-btn"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )
          )}

          {availableModels.length > 0 && (
            <div className="mobile-ai-settings-field">
              <label className="mobile-ai-settings-label">Model</label>
              <select
                className="mobile-ai-settings-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mobile-ai-settings-hint">
            🔒 Keys stored locally on device only
          </div>

          <button
            type="button"
            className="mobile-ai-settings-save-btn"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(sheetContent, document.body);
}
