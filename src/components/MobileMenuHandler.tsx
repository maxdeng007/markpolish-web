import {
  useState,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useToast } from "@/components/Toast";
import { useTranslation } from "@/hooks/useTranslation";
import MobileMenu from "./MobileMenu";
import MobileTemplatesPanel from "./MobileTemplatesPanel";
import MobileThemesPanel from "./MobileThemesPanel";
import MobileStatsPanel from "./MobileStatsPanel";
import MobileAISettingsSheet from "./MobileAISettingsSheet";
import ViralScorePanel from "./ViralScorePanel";
import ContentAmplifyPanel from "./ContentAmplifyPanel";
import {
  callAIStream,
  aiActions,
  getLanguageHint,
  type AIConfig,
} from "@/lib/ai-providers";
import { settingsManager } from "@/lib/settings";

interface MobileMenuHandlerProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  mobileTemplatesOpen: boolean;
  setMobileTemplatesOpen: (open: boolean) => void;
  mobileThemesOpen: boolean;
  setMobileThemesOpen: (open: boolean) => void;
  mobileStatsOpen: boolean;
  setMobileStatsOpen: (open: boolean) => void;
  mobileAISettingsOpen: boolean;
  setMobileAISettingsOpen: (open: boolean) => void;
  markdown: string;
  theme: string;
  onSelectTemplate: (content: string) => void;
  onSelectTheme: (themeId: string) => void;
  onMarkdownChange: (markdown: string) => void;
}

export interface MobileMenuHandlerRef {
  triggerAIAction: (action: string) => void;
}

const MobileMenuHandler = forwardRef<
  MobileMenuHandlerRef,
  MobileMenuHandlerProps
>(function MobileMenuHandler(
  {
    mobileMenuOpen,
    setMobileMenuOpen,
    mobileTemplatesOpen,
    setMobileTemplatesOpen,
    mobileThemesOpen,
    setMobileThemesOpen,
    mobileStatsOpen,
    setMobileStatsOpen,
    mobileAISettingsOpen,
    setMobileAISettingsOpen,
    markdown,
    theme,
    onSelectTemplate,
    onSelectTheme,
    onMarkdownChange,
  },
  ref,
) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [mobileAILoading, setMobileAILoading] = useState(false);
  const [viralScoreOpen, setViralScoreOpen] = useState(false);
  const [contentAmplifyOpen, setContentAmplifyOpen] = useState(false);
  const pendingAIActionRef = useRef<string | null>(null);

  const handleCopyToClipboard = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(`${label} copied! Paste where you want.`, "success");
      } catch (err) {
        console.error("Failed to copy:", err);
        showToast("Failed to copy. Please try again.", "error");
      }
    },
    [showToast],
  );

  const handleMobileNavigate = (panel: string) => {
    switch (panel) {
      case "templates":
        setMobileTemplatesOpen(true);
        break;
      case "themes":
        setMobileThemesOpen(true);
        break;
      case "stats":
        setMobileStatsOpen(true);
        break;
      case "components":
        break;
      case "ai":
        break;
      case "settings":
        setMobileAISettingsOpen(true);
        break;
      default:
        break;
    }
  };

  const handleMobileAIAction = useCallback(
    async (action: string) => {
      if (!markdown.trim()) {
        showToast("Please enter some content first", "info");
        return;
      }

      const settings = settingsManager.getSettings();
      const provider = settings.textProviders[settings.defaultTextProvider];

      if (settings.defaultTextProvider !== "ollama" && !provider?.apiKey) {
        pendingAIActionRef.current = action;
        setMobileAISettingsOpen(true);
        return;
      }

      const config: AIConfig = {
        provider: settings.defaultTextProvider,
        model: settings.defaultTextModel,
        apiKey: provider?.apiKey || "",
      };

      const langHint = getLanguageHint(markdown);
      let actionObj: {
        id: string;
        name: string;
        description: string;
        icon: string;
        prompt: (content: string, context?: string) => string;
      };

      switch (action) {
        case "expand":
          actionObj = aiActions.expandContent;
          break;
        case "polish":
          actionObj = aiActions.polishWithContext;
          break;
        case "summarize":
          actionObj = {
            id: "summarize",
            name: t("ai.summarize"),
            description: "Summarize content",
            icon: "📋",
            prompt: (content: string) => `${langHint}

You are a professional writer. Create a concise summary of the following content that captures the key points and main takeaways. Keep it informative but brief. Preserve all markdown formatting for headers and emphasis.

Content:
${content}`,
          };
          break;
        case "translate":
          actionObj = {
            id: "translate",
            name: t("ai.translate"),
            description: "Translate content",
            icon: "🌐",
            prompt: (content: string) => `${langHint}

You are a professional translator. Detect the language of the input text. If it's Chinese, translate to English. If it's English, translate to Chinese. Preserve all markdown formatting (headers #, bold **, italic *, lists - *, blockquotes >, code blocks \`\`\`).

Content:
${content}`,
          };
          break;
        case "tone":
          actionObj = {
            id: "tone",
            name: "Adjust Tone",
            description: "Adjust content tone",
            icon: "🎯",
            prompt: (content: string) => `${langHint}

You are a professional writer. Adjust the tone of the following text to be more engaging, conversational, and relatable for WeChat/social media readers. Use a friendly, personal voice. Preserve all markdown formatting.

Content:
${content}`,
          };
          break;
        case "viralScore":
          setViralScoreOpen(true);
          return;
        case "amplify":
          setContentAmplifyOpen(true);
          return;
        case "title":
        default:
          showToast(
            "This action requires text selection. Use desktop for titles.",
            "info",
          );
          return;
      }

      setMobileAILoading(true);

      try {
        let fullText = "";

        await callAIStream(config, actionObj, markdown, undefined, (chunk) => {
          fullText += chunk;
        });

        if (fullText) {
          onMarkdownChange(fullText);
          showToast(`${actionObj.name} completed!`, "success");
        }
      } catch (error) {
        console.error("AI action failed:", error);
        showToast(
          `AI action failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          "error",
        );
      } finally {
        setMobileAILoading(false);
      }
    },
    [markdown, onMarkdownChange, showToast],
  );

  useImperativeHandle(
    ref,
    () => ({
      triggerAIAction: (action: string) => {
        handleMobileAIAction(action);
      },
    }),
    [handleMobileAIAction],
  );

  return (
    <>
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={handleMobileNavigate}
        onAIAction={handleMobileAIAction}
        onCopyToClipboard={handleCopyToClipboard}
      />
      <MobileTemplatesPanel
        isOpen={mobileTemplatesOpen}
        onClose={() => setMobileTemplatesOpen(false)}
        onSelect={onSelectTemplate}
      />
      <MobileThemesPanel
        isOpen={mobileThemesOpen}
        onClose={() => setMobileThemesOpen(false)}
        currentTheme={theme}
        onSelect={onSelectTheme}
      />
      <MobileStatsPanel
        isOpen={mobileStatsOpen}
        onClose={() => setMobileStatsOpen(false)}
        markdown={markdown}
      />
      <MobileAISettingsSheet
        isOpen={mobileAISettingsOpen}
        onClose={() => {
          pendingAIActionRef.current = null;
          setMobileAISettingsOpen(false);
        }}
        onSettingsSaved={() => {
          if (pendingAIActionRef.current) {
            const pending = pendingAIActionRef.current;
            pendingAIActionRef.current = null;
            setTimeout(() => handleMobileAIAction(pending), 100);
          }
        }}
      />
      <ViralScorePanel
        isOpen={viralScoreOpen}
        onClose={() => setViralScoreOpen(false)}
        markdown={markdown}
        onApplySuggestion={(improvedContent) => {
          onMarkdownChange(improvedContent);
          setViralScoreOpen(false);
        }}
      />
      <ContentAmplifyPanel
        isOpen={contentAmplifyOpen}
        onClose={() => setContentAmplifyOpen(false)}
        markdown={markdown}
      />
      {mobileAILoading && (
        <div className="mobile-ai-loading-mask">
          <div className="mobile-ai-loading-content">
            <div className="mobile-ai-loading-spinner" />
            <span>{t("mobileMenu.processing")}</span>
          </div>
        </div>
      )}
    </>
  );
});

export default MobileMenuHandler;
