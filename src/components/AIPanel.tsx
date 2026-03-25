import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/Toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MapPin, Lightbulb } from "lucide-react";
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
  Settings,
  Check,
  AlertCircle,
  Search,
  X,
} from "lucide-react";
import {
  aiProviders,
  aiActions,
  callAIStream,
  fetchOllamaModels,
  fetchProviderModels,
  type AIConfig,
} from "@/lib/ai-providers";
import { settingsManager } from "@/lib/settings";
import { useTranslation } from "@/hooks/useTranslation";

interface Suggestion {
  component: string;
  location: string;
  syntax: string;
  reason: string;
}

type DiffLineType = "equal" | "add" | "remove";

interface DiffSegment {
  type: DiffLineType;
  text: string;
}

function computeDiff(original: string, modified: string): DiffSegment[] {
  const originalLines = original.split("\n");
  const modifiedLines = modified.split("\n");
  const result: DiffSegment[] = [];

  const maxLines = 30;
  const origSlice = originalLines.slice(0, maxLines);
  const modSlice = modifiedLines.slice(0, maxLines);

  let start = 0;
  while (
    start < origSlice.length &&
    start < modSlice.length &&
    origSlice[start] === modSlice[start]
  ) {
    start++;
  }

  let end = 0;
  while (
    end < origSlice.length - start &&
    end < modSlice.length - start &&
    origSlice[origSlice.length - 1 - end] ===
      modSlice[modSlice.length - 1 - end]
  ) {
    end++;
  }

  for (let i = 0; i < start; i++) {
    result.push({ type: "equal", text: origSlice[i] });
  }

  const origEnd = origSlice.length - end;
  const modEnd = modSlice.length - end;

  for (let i = start; i < origEnd; i++) {
    result.push({ type: "remove", text: origSlice[i] });
  }

  for (let i = start; i < modEnd; i++) {
    result.push({ type: "add", text: modSlice[i] });
  }

  for (let i = origSlice.length - end; i < origSlice.length; i++) {
    result.push({ type: "equal", text: origSlice[i] });
  }

  if (modifiedLines.length > maxLines) {
    result.push({
      type: "equal",
      text: `... (${modifiedLines.length - maxLines} more lines)`,
    });
  }

  return result;
}

const COMPONENT_ICONS: Record<string, string> = {
  ":::hero": "🎯",
  ":::col-2": "📊",
  ":::col-3": "📈",
  ":::steps": "📝",
  ":::timeline": "⏱️",
  ":::card": "🎴",
  ":::callout": "💡",
  ":::quote": "💬",
  ":::tabs": "📑",
  ":::accordion": "📂",
  ":::video": "🎥",
  ":::ai-image": "🎨",
  ":::local-image": "🖼️",
};

function getPreviewStyle(component: string): {
  bg: string;
  border: string;
  text: string;
} {
  const lower = component.toLowerCase();

  if (lower.includes("hero")) {
    return {
      bg: "bg-gradient-to-br from-blue-500 to-blue-700",
      border: "border-blue-400",
      text: "text-white",
    };
  }
  if (lower.includes("callout")) {
    return {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
    };
  }
  if (lower.includes("quote")) {
    return {
      bg: "bg-slate-50",
      border: "border-l-4 border-slate-400",
      text: "text-slate-700",
    };
  }
  if (lower.includes("card")) {
    return {
      bg: "bg-white",
      border: "border-slate-200",
      text: "text-slate-700",
    };
  }
  if (lower.includes("col-2") || lower.includes("col-3")) {
    return {
      bg: "bg-gradient-to-r from-blue-50 to-green-50",
      border: "border-blue-200",
      text: "text-slate-700",
    };
  }
  if (lower.includes("steps")) {
    return {
      bg: "bg-slate-50",
      border: "border-slate-200",
      text: "text-slate-700",
    };
  }
  if (lower.includes("timeline")) {
    return {
      bg: "bg-slate-50",
      border: "border-l-4 border-primary",
      text: "text-slate-700",
    };
  }
  if (lower.includes("tabs")) {
    return {
      bg: "bg-white",
      border: "border-slate-200",
      text: "text-slate-700",
    };
  }
  if (lower.includes("accordion")) {
    return {
      bg: "bg-white",
      border: "border-slate-200",
      text: "text-slate-700",
    };
  }
  if (lower.includes("img")) {
    return {
      bg: "bg-gradient-to-br from-purple-100 to-pink-100",
      border: "border-purple-200",
      text: "text-purple-700",
    };
  }

  return {
    bg: "bg-muted",
    border: "border-border",
    text: "text-muted-foreground",
  };
}

function getComponentIcon(component: string): string {
  const lower = component.toLowerCase();
  for (const [key, icon] of Object.entries(COMPONENT_ICONS)) {
    if (lower.includes(key.replace(":::", "").replace("-", ""))) {
      return icon;
    }
  }
  return "📦";
}

function getPreviewContent(syntax: string): {
  title: string;
  subtitle: string;
} {
  const lines = syntax.split("\n").filter((l) => l.trim());

  const h1Match = syntax.match(/^#\s+(.+)/m);
  const h2Match = syntax.match(/^##\s+(.+)/m);
  const h3Match = syntax.match(/^###\s+(.+)/m);

  let title = h1Match?.[1] || h2Match?.[1] || h3Match?.[1] || "Preview";

  const lower = syntax.toLowerCase();
  if (lower.includes("hero")) {
    const subtitle =
      lines.find((l) => l.includes("**") || l.includes("*")) || "";
    return { title, subtitle };
  }
  if (lower.includes("callout")) {
    const typeMatch = syntax.match(/type=["'](\w+)["']/);
    const type = typeMatch?.[1] || "info";
    return {
      title: type.charAt(0).toUpperCase() + type.slice(1),
      subtitle: "Information message",
    };
  }
  if (lower.includes("quote")) {
    const authorMatch = syntax.match(/author=["']([^"']+)["']/);
    return {
      title: title.substring(0, 50),
      subtitle: authorMatch ? `— ${authorMatch[1]}` : "Author",
    };
  }
  if (lower.includes("card")) {
    return { title: title.substring(0, 40), subtitle: "Highlighted content" };
  }
  if (lower.includes("col-2") || lower.includes("col-3")) {
    const count = lower.includes("col-3") ? "3" : "2";
    return { title: `${count} Columns`, subtitle: "Side by side layout" };
  }
  if (lower.includes("steps")) {
    return { title: "Steps", subtitle: "Numbered instructions" };
  }
  if (lower.includes("timeline")) {
    return { title: "Timeline", subtitle: "Chronological events" };
  }
  if (lower.includes("tabs")) {
    return { title: "Tabs", subtitle: "Tabbed content sections" };
  }
  if (lower.includes("accordion")) {
    return { title: "Accordion", subtitle: "Expandable sections" };
  }
  if (lower.includes("img")) {
    const imgMatch = syntax.match(/\[IMG:\s*([^\]]+)\]/);
    return {
      title: "AI Image",
      subtitle: imgMatch?.[1]?.substring(0, 30) || "Generate image",
    };
  }

  return { title: title.substring(0, 30), subtitle: "Component preview" };
}

function parseSuggestions(text: string): Suggestion[] {
  const jsonResult = tryParseJSON(text);
  if (jsonResult) {
    return jsonResult;
  }

  return parseSuggestionsLegacy(text);
}

function tryParseJSON(text: string): Suggestion[] | null {
  const trimmed = text.trim();

  let jsonMatch = trimmed.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (!jsonMatch) return null;

  try {
    let data = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(data)) {
      if (data.suggestions && Array.isArray(data.suggestions)) {
        data = data.suggestions;
      } else {
        return null;
      }
    }

    const suggestions: Suggestion[] = [];
    for (const item of data) {
      if (item.component && item.syntax) {
        suggestions.push({
          component: item.component,
          location: normalizeLocation(item.location, item.headingText),
          syntax: item.syntax,
          reason: item.reason || "",
        });
      }
    }

    return suggestions.length > 0 ? suggestions : null;
  } catch {
    return null;
  }
}

function normalizeLocation(location: string, headingText?: string): string {
  if (!location) return "Position 1/5";

  const loc = location.toLowerCase();

  if (
    loc === "document-start" ||
    loc === "document start" ||
    loc === "beginning" ||
    loc === "start" ||
    loc === "top"
  ) {
    return "Document start";
  }

  if (
    loc === "document-end" ||
    loc === "document end" ||
    loc === "end" ||
    loc === "bottom" ||
    loc === "conclusion" ||
    loc === "final"
  ) {
    return "Document end";
  }

  if (
    loc === "after-heading" ||
    loc === "after heading" ||
    loc === "after" ||
    loc === "mid-document" ||
    loc === "mid document" ||
    loc === "middle"
  ) {
    if (headingText) {
      return `Near: ${headingText.substring(0, 30)}${headingText.length > 30 ? "..." : ""}`;
    }
    return "Mid-document";
  }

  if (
    loc === "before-heading" ||
    loc === "before heading" ||
    loc === "before"
  ) {
    if (headingText) {
      return `Near: ${headingText.substring(0, 30)}${headingText.length > 30 ? "..." : ""}`;
    }
    return "Near start";
  }

  return location;
}

function parseSuggestionsLegacy(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];

  const codeBlockRegex = /```[\s\S]*?```/g;
  const codeBlocks = text.match(codeBlockRegex) || [];

  const sections = text.split(codeBlockRegex);

  for (let idx = 0; idx < codeBlocks.length; idx++) {
    const codeBlock = codeBlocks[idx];
    if (!codeBlock) continue;

    let syntax = codeBlock
      .replace(/```[\w]*\n?/, "")
      .replace(/```$/, "")
      .trim();

    const firstColon = syntax.indexOf(":::");
    const lastColon = syntax.lastIndexOf(":::");
    if (firstColon !== -1 && lastColon !== -1 && lastColon > firstColon + 2) {
      syntax = syntax.substring(firstColon, lastColon + 3);
    }

    if (!syntax.includes(":::")) continue;

    const componentMatch = syntax.match(/:::([\w-]+)/);
    const componentName = componentMatch
      ? `:::${componentMatch[1]}`
      : `Suggestion ${suggestions.length + 1}`;

    const textBefore = sections[idx] || "";
    const textAfter = sections[idx + 1] || "";
    const context = (textBefore + " " + textAfter).trim();

    suggestions.push({
      component: componentName,
      location: detectLocation(context, idx, codeBlocks.length),
      syntax,
      reason: extractReason(context),
    });
  }

  return suggestions;
}

const HEADING_PATTERNS = [
  /(?:after|before|under|below|following)\s+(?:the\s+)?(?:first|second|third|1st|2nd|3rd|#?\s*\d+)?\s*(?:heading|section|chapter|part|paragraph)?\s*(?:titled?|called?|["']([^"']+)["'])?/i,
  /(?:under|below)\s+["']([^"']+)["']/i,
  /#\s*(\d+)\s*(?:heading|section)/i,
  /(?:between)\s+[^.]+/i,
];

const POSITION_PATTERNS = [
  {
    regex:
      /\b(at the (very )?(top|start|beginning|opening|head)|at\s+start|\bat\s+top\b|opening (section|with)|beginning of|start of (your |the )?(article|document|content)|as (your |an )?opening|use (as|at) (an? )?(opening|intro(duction)?)|intro(ductory)? section)/i,
    result: "Document start",
  },
  {
    regex:
      /\b(at the (very )?(end|bottom|conclusion|closing)|at\s+end|\bat\s+bottom\b|end of (your |the )?(article|document|content)|concluding|closing (section|with)|as (a )?conclusion|conclusion section|final section)/i,
    result: "Document end",
  },
  {
    regex:
      /\b(in the (middle|center)|mid-?(document|article)|between|after (the )?(intro|introduction)|following (the )?(intro|introduction))/i,
    result: "Mid-document",
  },
  {
    regex:
      /\b(after (the )?(conclusion|summary|final|last)|before (the )?(conclusion|summary|final)|following the)/i,
    result: "Near end",
  },
  {
    regex:
      /\b(after (the )?(intro|introduction|opening)|following (the )?(intro|introduction)|before (the )?(main|body)|introduction section)/i,
    result: "Near start",
  },
];

const SECTION_KEYWORDS = [
  {
    keywords: ["intro", "beginning", "overview", "about"],
    result: "Near start",
  },
  {
    keywords: ["feature", "benefit", "advantage", "what"],
    result: "Mid-document",
  },
  {
    keywords: ["conclusion", "summary", "final", "next step"],
    result: "Near end",
  },
];

function detectLocation(context: string, index: number, total: number): string {
  const lowerContext = context.toLowerCase();

  if (index === 0) return "Document start";
  if (index === total - 1 && total > 1) return "Document end";

  for (const pattern of HEADING_PATTERNS) {
    const match = context.match(pattern);
    if (match) {
      const heading = match[1] || match[2];
      return heading
        ? `Near: ${heading.substring(0, 30)}${heading.length > 30 ? "..." : ""}`
        : `Position ${index + 1}/${total}`;
    }
  }

  for (const { regex, result } of POSITION_PATTERNS) {
    if (regex.test(lowerContext)) return result;
  }

  for (const { keywords, result } of SECTION_KEYWORDS) {
    if (keywords.some((k) => lowerContext.includes(k))) return result;
  }

  return `Position ${index + 1}/${total}`;
}

const REASON_PATTERNS = [
  /because\s+(.+?)(?:\.|$)/i,
  /this (?:works|is|helps|serves) (?:to |for )?(.+?)(?:\.|$)/i,
  /ideal for\s+(.+?)(?:\.|$)/i,
  /perfect for\s+(.+?)(?:\.|$)/i,
  /great for\s+(.+?)(?:\.|$)/i,
  /use this (?:to |when |for )?(.+?)(?:\.|$)/i,
  /(?:adds?|creates?|provides?|offers?)\s+(.+?)(?:\.|$)/i,
];

function extractReason(context: string): string {
  if (!context) return "";

  for (const pattern of REASON_PATTERNS) {
    const match = context.match(pattern);
    if (match?.[1] && match[1].length > 10 && match[1].length < 150) {
      return match[1].trim().charAt(0).toUpperCase() + match[1].trim().slice(1);
    }
  }

  const sentences = context.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  if (sentences.length > 0) {
    const lastSentence = sentences[sentences.length - 1].trim();
    return (
      lastSentence.substring(0, 100) + (lastSentence.length > 100 ? "..." : "")
    );
  }

  return "";
}

interface ComponentSuggestionsProps {
  content: string;
  suggestions: Suggestion[];
  onCopy: (syntax: string) => void;
  onCopyAll: () => void;
  onInsertAtLocation?: (location: string) => void;
  onInsertAllComponents?: (suggestions: Suggestion[]) => void;
  isLoading?: boolean;
  t: (key: string) => string;
}

function ComponentSuggestions({
  content,
  suggestions,
  onCopy,
  onCopyAll,
  onInsertAtLocation,
  onInsertAllComponents,
  isLoading,
  t,
}: ComponentSuggestionsProps) {
  const isStreaming = isLoading && suggestions.length > 0;

  if (isLoading && suggestions.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Analyzing content...</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Looking for component opportunities...
        </p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    const trimmed = content.trim();
    const hasContent = trimmed.length > 0;

    if (!hasContent) {
      return (
        <div className="text-center py-8 px-4">
          <div className="text-4xl mb-3">🤔</div>
          <p className="text-sm text-muted-foreground">
            No suggestions yet. Enter some content and try again.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">No components suggested</p>
              <p className="text-xs opacity-80">
                Try adding more paragraphs or headings to your content for
                better suggestions.
              </p>
            </div>
          </div>
        </div>
        <pre className="whitespace-pre-wrap text-xs bg-background p-3 rounded border overflow-auto max-h-64">
          {content}
        </pre>
        <Button
          size="sm"
          variant="outline"
          onClick={onCopyAll}
          className="w-full"
        >
          {t("common.copyAll")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-muted-foreground">
          {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""}
          {isStreaming && (
            <span className="ml-2 inline-flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>more coming...</span>
            </span>
          )}
        </span>
        <Button
          size="sm"
          variant="default"
          onClick={() => onInsertAllComponents?.(suggestions)}
          className="h-7 px-3 text-xs gap-1"
        >
          <Sparkles className="w-3 h-3" />
          Insert All
        </Button>
      </div>
      {suggestions.map((suggestion, index) => {
        const previewStyle = getPreviewStyle(suggestion.syntax);
        const previewContent = getPreviewContent(suggestion.syntax);
        const icon = getComponentIcon(suggestion.component);

        return (
          <div
            key={index}
            className="border rounded-lg overflow-hidden bg-background/50 hover:bg-background transition-colors"
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm font-medium">
                    {suggestion.component}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCopy(suggestion.syntax)}
                  className="h-7 px-2 text-xs"
                >
                  {t("common.copy")}
                </Button>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <MapPin className="w-3 h-3" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onInsertAtLocation?.(suggestion.location);
                  }}
                  className="h-auto px-1 py-0.5 text-xs font-normal text-muted-foreground hover:text-primary"
                  title="Click to jump to this location in editor"
                >
                  {suggestion.location}
                </Button>
              </div>

              <div
                className={`rounded-lg p-3 mb-3 border ${previewStyle.bg} ${previewStyle.border}`}
              >
                <div className={`font-semibold text-sm ${previewStyle.text}`}>
                  {previewContent.title}
                </div>
                <div className={`text-xs mt-1 opacity-80 ${previewStyle.text}`}>
                  {previewContent.subtitle}
                </div>
              </div>

              <pre className="text-xs bg-muted/50 p-2 rounded border overflow-auto max-h-32 whitespace-pre-wrap font-mono">
                {suggestion.syntax}
              </pre>

              {suggestion.reason && (
                <div className="flex items-start gap-1 mt-2 text-xs text-muted-foreground">
                  <Lightbulb className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>{suggestion.reason}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onInsertAllComponents?.(suggestions)}
          className="flex-1 gap-1"
        >
          <Sparkles className="w-3 h-3" />
          Insert All
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCopyAll}
          className="flex-1"
        >
          {t("common.copyAll")}
        </Button>
      </div>
    </div>
  );
}

interface AIPanelProps {
  markdown: string;
  setMarkdown: (markdown: string) => void;
  onOpenSettings?: () => void;
  onInsertAtLocation?: (location: string) => void;
  onInsertAllComponents?: (suggestions: Suggestion[]) => void;
  onApplyTitle?: (title: string) => void;
  onPushHistory?: () => void;
}

export default function AIPanel({
  markdown,
  setMarkdown,
  onOpenSettings,
  onInsertAtLocation,
  onInsertAllComponents,
  onApplyTitle,
  onPushHistory,
}: AIPanelProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const settings = settingsManager.getSettings();
  const [config, setConfig] = useState<AIConfig>({
    provider: settings.defaultTextProvider,
    model: settings.defaultTextModel,
    apiKey: settings.textProviders[settings.defaultTextProvider]?.apiKey || "",
  });
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");
  const [resultType, setResultType] = useState<
    "titles" | "components" | "viral" | "seo" | null
  >(null);
  const [streamingText, setStreamingText] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [providerModels, setProviderModels] = useState<
    Record<string, string[]>
  >({});
  const [loadingModels, setLoadingModels] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<
    "idle" | "testing" | "connected" | "failed"
  >("idle");
  const [modelSearch, setModelSearch] = useState("");
  const [modelDropOpen, setModelDropOpen] = useState(false);
  const [streamingPreview, setStreamingPreview] = useState<{
    action: string;
    content: string;
    original: string;
  } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get available models based on provider
  const getAvailableModels = (): string[] => {
    if (config.provider === "ollama") {
      return ollamaModels;
    }
    if (providerModels[config.provider]?.length > 0) {
      return providerModels[config.provider];
    }
    return aiProviders[config.provider]?.models || [];
  };
  const availableModels = getAvailableModels();

  // Filter models based on search
  const filteredModels = modelSearch
    ? availableModels.filter((m) =>
        m.toLowerCase().includes(modelSearch.toLowerCase()),
      )
    : availableModels;

  // Update config and save to settings when provider changes
  const handleProviderChange = (value: string) => {
    const firstModel = aiProviders[value]?.models[0] || "";
    setConfig({ ...config, provider: value, model: firstModel });
    settingsManager.setDefaultTextProvider(value);
    settingsManager.setDefaultTextModel(firstModel);
  };

  // Update config and save to settings when model changes
  const handleModelChange = (value: string) => {
    setConfig((prev) => ({ ...prev, model: value }));
    settingsManager.setDefaultTextModel(value);
  };

  // Load models when provider changes
  useEffect(() => {
    const loadModels = async () => {
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
      } else {
        const provider = settingsManager.getTextProvider(config.provider);
        if (provider?.apiKey) {
          setLoadingModels(true);
          const baseUrl =
            provider.baseUrl || aiProviders[config.provider]?.baseUrl;
          const models = await fetchProviderModels(
            config.provider,
            baseUrl,
            provider.apiKey,
          );
          setProviderModels((prev) => ({ ...prev, [config.provider]: models }));
          setLoadingModels(false);
        }
      }
    };
    loadModels();
  }, [config.provider]);

  // Test Ollama connection on mount
  useEffect(() => {
    testOllamaConnection();
  }, []);

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
      showToast(t("toasts.noContent"), "error");
      return;
    }

    const providerConfig = settingsManager.getTextProvider(config.provider);
    if (config.provider !== "ollama" && !providerConfig?.apiKey) {
      onOpenSettings?.();
      return;
    }

    setLoading(true);
    setResult("");
    setStreamingText("");
    setStreamingPreview(null);

    try {
      const action = aiActions[actionId];

      if (actionId === "generateTitles") {
        setResultType("titles");
        let fullText = "";
        try {
          await callAIStream(config, action, markdown, context, (chunk) => {
            try {
              fullText += chunk;
              setStreamingText(fullText);
            } catch (e) {
              console.debug("Chunk processing error:", e);
            }
          });
          setResult(fullText);
        } catch (streamError) {
          console.error("Streaming error:", streamError);
          showToast(t("toasts.configRequired"), "error");
        }
      } else if (actionId === "suggestComponents") {
        setResultType("components");
        let fullText = "";
        try {
          await callAIStream(config, action, markdown, context, (chunk) => {
            try {
              fullText += chunk;
              setStreamingText(fullText);
            } catch (e) {
              console.debug("Chunk processing error:", e);
            }
          });
          setResult(fullText);
        } catch (streamError) {
          console.error("Streaming error:", streamError);
          showToast(t("toasts.configRequired"), "error");
        }
      } else if (actionId === "suggestViral") {
        setResultType("viral");
        setStreamingPreview({
          action: t(`ai.${actionId}` as any),
          content: "",
          original: markdown,
        });
        let fullText = "";
        try {
          await callAIStream(config, action, markdown, context, (chunk) => {
            try {
              fullText += chunk;
              setStreamingPreview((prev) =>
                prev ? { ...prev, content: fullText } : null,
              );
            } catch (e) {
              console.debug("Chunk processing error:", e);
            }
          });
        } catch (streamError) {
          console.error("Streaming error:", streamError);
          setStreamingPreview(null);
          showToast(t("toasts.configRequired"), "error");
        }
      } else if (actionId === "suggestSEO") {
        setResultType("seo");
        setStreamingPreview({
          action: t(`ai.${actionId}` as any),
          content: "",
          original: markdown,
        });
        let fullText = "";
        try {
          await callAIStream(config, action, markdown, context, (chunk) => {
            try {
              fullText += chunk;
              setStreamingPreview((prev) =>
                prev ? { ...prev, content: fullText } : null,
              );
            } catch (e) {
              console.debug("Chunk processing error:", e);
            }
          });
        } catch (streamError) {
          console.error("Streaming error:", streamError);
          setStreamingPreview(null);
          showToast(t("toasts.configRequired"), "error");
        }
      } else {
        setStreamingPreview({
          action: t(`ai.${actionId}` as any),
          content: "",
          original: markdown,
        });

        let fullText = "";
        try {
          await callAIStream(config, action, markdown, context, (chunk) => {
            try {
              fullText += chunk;
              setStreamingPreview((prev) =>
                prev ? { ...prev, content: fullText } : null,
              );
            } catch (e) {
              console.debug("Chunk processing error:", e);
            }
          });
        } catch (streamError) {
          console.error("Streaming error:", streamError);
          setStreamingPreview(null);
          showToast(t("toasts.configRequired"), "error");
        }
      }
    } catch (error) {
      console.error("AI action failed:", error);
      showToast(t("toasts.configRequired"), "error");
    } finally {
      setLoading(false);
      setStreamingText("");
    }
  };

  const handleApplyPreview = () => {
    if (streamingPreview) {
      onPushHistory?.();
      flushSync(() => {
        setMarkdown(streamingPreview.content);
        setStreamingPreview(null);
      });
    }
  };

  const handleCancelPreview = () => {
    setStreamingPreview(null);
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
      <div className="relative">
        <button
          onClick={() => {
            setModelDropOpen(!modelDropOpen);
            if (!modelDropOpen) {
              setTimeout(() => searchInputRef.current?.focus(), 10);
            }
          }}
          className="w-full h-9 px-3 flex items-center gap-2 border border-input rounded-md bg-background hover:bg-accent transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {loadingModels ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          ) : (
            <span className="truncate text-sm flex-1 text-left">
              {config.model || t("ai.selectModel")}
            </span>
          )}
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform",
              modelDropOpen && "rotate-180",
            )}
          />
        </button>

        {modelDropOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setModelDropOpen(false);
                setModelSearch("");
              }}
            />
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border rounded-md shadow-lg w-full">
              <div className="flex items-center px-3 border-b">
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  placeholder={t("ai.searchModels")}
                  className="flex-1 h-9 pl-2 text-sm bg-transparent border-0 focus:outline-none focus:ring-0"
                />
                {modelSearch && (
                  <button
                    onClick={() => setModelSearch("")}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {filteredModels.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {t("ai.noModelsFound")}
                  </div>
                ) : (
                  filteredModels.map((model) => (
                    <button
                      key={model}
                      onClick={() => {
                        handleModelChange(model);
                        setModelDropOpen(false);
                        setModelSearch("");
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors",
                        config.model === model && "bg-accent",
                      )}
                    >
                      <span className="truncate">{model}</span>
                      {config.model === model && (
                        <Check className="w-3 h-3 inline ml-2 text-primary" />
                      )}
                    </button>
                  ))
                )}
              </div>
              <div className="border-t px-3 py-1.5 text-[10px] text-muted-foreground">
                {filteredModels.length} of {availableModels.length} models
              </div>
            </div>
          </>
        )}
      </div>

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
              {["generateTitles", "suggestComponents"].map((actionId) => {
                const action = aiActions[actionId];
                return (
                  <button
                    key={action.id}
                    title={
                      t(`ai.${action.id}Desc` as any) || action.description
                    }
                    onClick={() => handleAction(action.id)}
                    disabled={loading || !isConfigured()}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all duration-200 bg-gradient-to-r ${action.gradient} ${action.hoverGradient} shadow-lg ${action.shadowColor} hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="text-lg">{action.icon}</span>
                    )}
                    <span>{t(`ai.${action.id}` as any)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optimize Category */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
              {t("ai.optimize")}
            </div>
            <div className="space-y-2">
              {["suggestViral", "suggestSEO"].map((actionId) => {
                const action = aiActions[actionId];
                return (
                  <button
                    key={action.id}
                    title={
                      t(`ai.${action.id}Desc` as any) || action.description
                    }
                    onClick={() => handleAction(action.id)}
                    disabled={loading || !isConfigured()}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all duration-200 bg-gradient-to-r ${action.gradient} ${action.hoverGradient} shadow-lg ${action.shadowColor} hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="text-lg">{action.icon}</span>
                    )}
                    <span>{t(`ai.${action.id}` as any)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Improve Category */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
              {t("ai.improve")}
            </div>
            <div className="space-y-2">
              {["expandContent", "smartFormat", "polishWithContext"].map(
                (actionId) => {
                  const action = aiActions[actionId];
                  return (
                    <button
                      key={action.id}
                      title={
                        t(`ai.${action.id}Desc` as any) || action.description
                      }
                      onClick={() => handleAction(action.id)}
                      disabled={loading || !isConfigured()}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all duration-200 bg-gradient-to-r ${action.gradient} ${action.hoverGradient} shadow-lg ${action.shadowColor} hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed`}
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
        </div>
      </div>

      {/* AI Result Panel */}
      {(result || streamingText) && resultType && (
        <div className="border rounded-lg p-3 bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              {resultType === "titles"
                ? t("ai.generatedTitles")
                : resultType === "components"
                  ? t("ai.componentSuggestions")
                  : resultType === "viral"
                    ? t("ai.suggestViral")
                    : t("ai.suggestSEO")}
              {loading && (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              )}
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
              <div className="space-y-2">
                {(streamingText || result)
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((title, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between group p-2 hover:bg-background rounded border border-transparent hover:border-border transition-colors"
                    >
                      <span className="flex-1 pr-2">{title}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            onApplyTitle?.(title);
                            showToast(t("ai.titleApplied"), "success");
                          }}
                          className="h-7 px-2 text-xs bg-primary"
                        >
                          {t("ai.apply")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(title);
                            showToast(t("toasts.copied"), "success");
                          }}
                          className="h-7 px-2 text-xs"
                        >
                          {t("common.copy")}
                        </Button>
                      </div>
                    </div>
                  ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const allTitles = (streamingText || result)
                      .split("\n")
                      .filter((line) => line.trim())
                      .join("\n- ");
                    navigator.clipboard.writeText(`- ${allTitles}`);
                    showToast(t("toasts.copied"), "success");
                  }}
                  className="w-full mt-2 text-xs"
                >
                  {t("ai.copyAllAsList")}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {streamingText || result ? (
                  <ComponentSuggestions
                    content={streamingText || result}
                    suggestions={parseSuggestions(streamingText || result)}
                    isLoading={loading && !result}
                    onCopy={(syntax) => {
                      navigator.clipboard.writeText(syntax);
                      showToast(t("toasts.copied"), "success");
                    }}
                    onCopyAll={() => {
                      navigator.clipboard.writeText(result);
                      showToast(t("toasts.copied"), "success");
                    }}
                    onInsertAtLocation={onInsertAtLocation}
                    onInsertAllComponents={onInsertAllComponents}
                    t={t}
                  />
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {streamingPreview && (
        <div className="border rounded-lg bg-muted/30 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-sm font-medium">
              {streamingPreview.action}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelPreview}
              className="h-6 px-2 text-xs"
            >
              {t("common.cancel")}
            </Button>
          </div>
          <div className="px-3 py-1.5 text-xs text-muted-foreground border-b bg-muted/20">
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                {t("ai.streamingPreview")}
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-green-500 inline mr-1" />
                {t("ai.complete")}
              </>
            )}
          </div>

          <div className="p-2">
            {loading ? (
              <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-48 whitespace-pre-wrap">
                {streamingPreview.content || t("ai.waitingForResponse")}
              </pre>
            ) : (
              <div className="border rounded bg-background overflow-auto max-h-64 text-xs font-mono">
                <div className="px-3 py-1.5 bg-muted/50 border-b flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t("ai.changesPreview")}
                  </span>
                  <div className="flex gap-3 text-[10px]">
                    <span className="text-green-600 dark:text-green-400">
                      +
                      {streamingPreview.content.split("\n").length -
                        streamingPreview.original.split("\n").length}{" "}
                      {t("ai.addedLines")}
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      -
                      {streamingPreview.original.split("\n").length -
                        streamingPreview.content.split("\n").length}{" "}
                      {t("ai.removedLines")}
                    </span>
                  </div>
                </div>
                <div className="p-2 space-y-0.5">
                  {computeDiff(
                    streamingPreview.original,
                    streamingPreview.content,
                  ).map((segment, i) => (
                    <div
                      key={i}
                      className={cn(
                        "px-2 py-0.5 rounded leading-5",
                        segment.type === "add" &&
                          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
                        segment.type === "remove" &&
                          "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 line-through opacity-60",
                        segment.type === "equal" && "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "select-none mr-2 inline-block w-4 text-center",
                          segment.type === "add" &&
                            "text-green-600 dark:text-green-400",
                          segment.type === "remove" &&
                            "text-red-600 dark:text-red-400",
                        )}
                      >
                        {segment.type === "add"
                          ? "+"
                          : segment.type === "remove"
                            ? "-"
                            : " "}
                      </span>
                      {segment.text || " "}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!loading && streamingPreview.content && (
            <div className="flex gap-2 px-2 pb-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelPreview}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
              <Button size="sm" onClick={handleApplyPreview} className="flex-1">
                {t("ai.apply")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
