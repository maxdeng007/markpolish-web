import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronDown,
  Check,
} from "lucide-react";
import { settingsManager } from "@/lib/settings";
import { aiProviders, fetchProviderModels } from "@/lib/ai-providers";
import { useTranslation } from "@/hooks/useTranslation";

interface MobileAISettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CustomDropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  isDark: boolean;
  loading?: boolean;
  loadingText?: string;
  flipAbove?: boolean;
}

function CustomDropdown({
  value,
  options,
  onChange,
  isDark,
  loading,
  loadingText = "Loading...",
  flipAbove,
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const border = isDark ? "#333" : "#e5e7eb";
  const textColor = isDark ? "#ffffff" : "#111";
  const mutedColor = isDark ? "#888" : "#6b7280";

  return (
    <div style={{ position: "relative" }} ref={listRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          border: `1px solid ${border}`,
          borderRadius: "10px",
          background: bg,
          color: textColor,
          fontSize: "15px",
          minHeight: "48px",
          cursor: "pointer",
          gap: "8px",
        }}
      >
        <span style={{ flex: 1, textAlign: "left" }}>
          {loading ? loadingText : selectedOption?.label || value}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: mutedColor,
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        />
      </button>
      {open && (
        <div
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            ...(flipAbove
              ? {
                  bottom: `calc(100vh - ${triggerRef.current?.getBoundingClientRect().top ?? 0}px + 4px)`,
                }
              : {
                  top: `${(triggerRef.current?.getBoundingClientRect().bottom ?? 0) + 4}px`,
                }),
            left: `${triggerRef.current?.getBoundingClientRect().left ?? 0}px`,
            width: `${triggerRef.current?.getBoundingClientRect().width ?? 0}px`,
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            zIndex: 10030,
            maxHeight: "240px",
            overflowY: "auto",
            overscrollBehavior: "contain",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                border: "none",
                background: "transparent",
                color: opt.value === value ? textColor : textColor,
                fontSize: "15px",
                cursor: "pointer",
                textAlign: "left",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = isDark
                  ? "#2a2a2a"
                  : "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
              }}
            >
              <span style={{ flex: 1 }}>{opt.label}</span>
              {opt.value === value && (
                <Check size={16} style={{ color: "#3b82f6", flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MobileAISettingsSheet({
  isOpen,
  onClose,
}: MobileAISettingsSheetProps) {
  const { t, language } = useTranslation();
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
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

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

  const loadModels = async (
    providerId: string,
    baseUrl?: string,
    key?: string,
  ) => {
    setLoadingModels(true);
    try {
      const models = await fetchProviderModels(providerId, baseUrl, key);
      setAvailableModels(
        models.length > 0 ? models : aiProviders[providerId]?.models || [],
      );
    } catch {
      setAvailableModels(aiProviders[providerId]?.models || []);
    }
    setLoadingModels(false);
  };

  useEffect(() => {
    if (isOpen) {
      const settings = settingsManager.getSettings();
      const provider = settings.defaultTextProvider;
      const providerConfig = settings.textProviders[provider];

      setSelectedProvider(provider);
      setSelectedModel(settings.defaultTextModel);
      setApiKey(providerConfig?.apiKey || "");
      setOllamaBaseUrl(providerConfig?.baseUrl || "http://localhost:11434");
      setOllamaStatus("idle");

      const staticModels = aiProviders[provider]?.models || [];
      setAvailableModels(staticModels);
      loadModels(provider, providerConfig?.baseUrl, providerConfig?.apiKey);

      if (
        staticModels.length > 0 &&
        !staticModels.includes(settings.defaultTextModel)
      ) {
        setSelectedModel(staticModels[0]);
      }
    }
  }, [isOpen]);

  const handleProviderChange = (newProvider: string) => {
    setSelectedProvider(newProvider);
    settingsManager.setDefaultTextProvider(newProvider);

    const newModels = aiProviders[newProvider]?.models || [];
    setAvailableModels(newModels);

    const newDefault = newModels.length > 0 ? newModels[0] : "";
    setSelectedModel(newDefault);
    settingsManager.setDefaultTextModel(newDefault);

    const settings = settingsManager.getSettings();
    const providerConfig = settings.textProviders[newProvider];
    setApiKey(providerConfig?.apiKey || "");

    if (newProvider === "ollama") {
      const url = providerConfig?.baseUrl || "http://localhost:11434";
      setOllamaBaseUrl(url);
      loadModels(newProvider, url);
    } else {
      loadModels(
        newProvider,
        aiProviders[newProvider]?.baseUrl,
        providerConfig?.apiKey || "",
      );
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    settingsManager.setDefaultTextModel(model);
  };

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    settingsManager.setTextProviderApiKey(selectedProvider, key);
  };

  const handleOllamaUrlChange = (url: string) => {
    setOllamaBaseUrl(url);
    settingsManager.setTextProviderBaseUrl("ollama", url);
  };

  const testOllama = async () => {
    setTestingOllama(true);
    const connected =
      await settingsManager.checkOllamaConnection(ollamaBaseUrl);
    setOllamaStatus(connected ? "connected" : "failed");
    setTestingOllama(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY <= 0) {
      setIsDragging(false);
      return;
    }
    const scrollTop = bodyRef.current?.scrollTop ?? 0;
    if (scrollTop > 0) {
      setIsDragging(false);
      return;
    }
    setIsDragging(true);
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (sheetRef.current) {
      sheetRef.current.style.transform = "";
    }
    if (isDragging && deltaY > 80) {
      onClose();
    }
    setIsDragging(false);
  };

  if (typeof document === "undefined") return null;

  const providers = settingsManager.getTextProviders();
  const providerOptions = providers.map((p) => ({
    value: p.id,
    label: p.name,
  }));
  const modelOptions = availableModels.map((m) => ({ value: m, label: m }));
  const isOllama = selectedProvider === "ollama";
  const requiresApiKey = aiProviders[selectedProvider]?.requiresApiKey ?? true;

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

  const border = isDark ? "#333" : "#e5e7eb";
  const textColor = isDark ? "#ffffff" : "#111";
  const mutedColor = isDark ? "#888" : "#6b7280";

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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 4px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "40px",
              height: "4px",
              borderRadius: "2px",
              background: border,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 20px 12px",
            flexShrink: 0,
          }}
        >
          <Settings size={20} style={{ color: "#3b82f6" }} />
          <span style={{ fontSize: "18px", fontWeight: 600, color: textColor }}>
            {t("sidebar.aiSettings")}
          </span>
        </div>

        <div
          ref={bodyRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 20px 24px",
            overscrollBehavior: "contain",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: mutedColor,
                marginBottom: "6px",
              }}
            >
              {t("ai.provider")}
            </label>
            <CustomDropdown
              value={selectedProvider}
              options={providerOptions}
              onChange={handleProviderChange}
              isDark={isDark}
              loadingText={t("common.loading")}
            />
          </div>

          {isOllama ? (
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: mutedColor,
                  marginBottom: "6px",
                }}
              >
                {t("settings.baseUrl")}
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "flex-start",
                }}
              >
                <input
                  type="text"
                  value={ollamaBaseUrl}
                  onChange={(e) => handleOllamaUrlChange(e.target.value)}
                  placeholder="http://localhost:11434"
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    border: `1px solid ${border}`,
                    borderRadius: "10px",
                    fontSize: "15px",
                    background: isDark ? "#1a1a1a" : "#ffffff",
                    color: textColor,
                    minHeight: "48px",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={testOllama}
                  disabled={testingOllama}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "12px 16px",
                    border: `1px solid ${border}`,
                    borderRadius: "10px",
                    background: isDark ? "#1a1a1a" : "#ffffff",
                    color: textColor,
                    fontSize: "14px",
                    cursor: testingOllama ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                    minHeight: "48px",
                    flexShrink: 0,
                    opacity: testingOllama ? 0.5 : 1,
                  }}
                >
                  <RefreshCw
                    size={16}
                    className={testingOllama ? "animate-spin" : ""}
                  />
                  {t("settings.test")}
                </button>
              </div>
              {ollamaStatus !== "idle" && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    marginTop: "6px",
                    color:
                      ollamaStatus === "connected"
                        ? isDark
                          ? "#4ade80"
                          : "#16a34a"
                        : isDark
                          ? "#f87171"
                          : "#dc2626",
                    background:
                      ollamaStatus === "connected"
                        ? isDark
                          ? "rgba(22,163,74,0.15)"
                          : "#f0fdf4"
                        : isDark
                          ? "rgba(220,38,38,0.15)"
                          : "#fef2f2",
                  }}
                >
                  {ollamaStatus === "connected"
                    ? `✓ ${t("settings.connected")}`
                    : `✗ ${t("settings.connectionFailed")}`}
                </div>
              )}
            </div>
          ) : (
            requiresApiKey && (
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: mutedColor,
                    marginBottom: "6px",
                  }}
                >
                  {t("settings.apiKey")}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder={`${language === "zh" ? "输入" : "Enter"} ${aiProviders[selectedProvider]?.name || "AI"} ${language === "zh" ? "API 密钥" : "API key"}`}
                    autoComplete="off"
                    spellCheck={false}
                    style={{
                      width: "100%",
                      padding: "12px 48px 12px 14px",
                      border: `1px solid ${border}`,
                      borderRadius: "10px",
                      fontSize: "15px",
                      background: isDark ? "#1a1a1a" : "#ffffff",
                      color: textColor,
                      minHeight: "48px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    style={{
                      position: "absolute",
                      right: "4px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "40px",
                      height: "40px",
                      border: "none",
                      borderRadius: "8px",
                      background: "transparent",
                      cursor: "pointer",
                      color: mutedColor,
                    }}
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )
          )}

          {modelOptions.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: mutedColor,
                  marginBottom: "6px",
                }}
              >
                {t("ai.model")}
              </label>
              <CustomDropdown
                value={selectedModel}
                options={modelOptions}
                onChange={handleModelChange}
                isDark={isDark}
                loading={loadingModels}
                loadingText={t("common.loading")}
                flipAbove
              />
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: mutedColor,
              padding: "8px 0 4px",
            }}
          >
            🔒 {t("settings.keysStoredLocally")}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(sheetContent, document.body);
}
