import { Textarea } from "@/components/ui/textarea";
import { forwardRef, useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Sparkles,
  Wand2,
  Scissors,
  AlignLeft,
  CheckCircle,
  Loader2,
  Undo2,
  Redo2,
} from "lucide-react";
import { settingsManager } from "@/lib/settings";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface InlineAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  prompt: (text: string) => string;
}

interface EditorProps {
  markdown: string;
  onChange: (value: string) => void;
  onInlineAction?: (
    actionId: string,
    selectedText: string,
    start: number,
    end: number,
  ) => void;
  inlineLoading?: boolean;
  inlinePreview?: string | null;
  onApplyInline?: () => void;
  onCancelInline?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  historyIndex?: number;
  historyLength?: number;
}

const getPrompt = (actionId: string, text: string): string => {
  const prompts: Record<string, string> = {
    "inline-improve": `You are a professional editor improving MARKDOWN content. This is CRITICAL:

INPUT: A blockquote like "> **text**" should output "> **improved text**" with the > preserved.
INPUT: A bold phrase like "**text**" should output "**improved text**" with ** preserved.
INPUT: Headers like "# Title" should output "## Title" or similar, with # preserved.

DO NOT strip any markdown syntax. Do NOT convert markdown to plain text. Preserve every markdown character exactly as it appears.

Rewrite and improve the following markdown text, keeping ALL formatting:

${text}`,
    "inline-shorten": `You are a professional editor shortening MARKDOWN content. This is CRITICAL:

INPUT: "> **quoted text**" should output "> **shortened**" with > and ** preserved.
INPUT: "**bold**" should output "**shorter**" with ** preserved.
INPUT: "# Header" should output "# Header" or "## Header", with # preserved.

DO NOT strip any markdown syntax. Preserve every markdown character.

Rewrite the following markdown text to be shorter and more concise:

${text}`,
    "inline-expand": `You are a professional writer expanding MARKDOWN content. This is CRITICAL:

INPUT: "> **quote**" should output "> **expanded quote**" with > and ** preserved.
INPUT: "- list item" should output "- expanded list item" with - preserved.
INPUT: "## Header" should output "## Header" with ## preserved.

DO NOT strip any markdown syntax. Preserve every markdown character.

Expand the following markdown text with more details:

${text}`,
    "inline-fix": `You are a professional proofreader fixing MARKDOWN content. This is CRITICAL:

INPUT: "> **text**" should output "> **text**" with > and ** preserved unchanged.
INPUT: "**bold**" should output "**bold**" with ** preserved unchanged.
INPUT: "# Header" should output "# Header" with # preserved unchanged.

DO NOT change markdown formatting. Only fix grammar/spelling errors.
Preserve every markdown character exactly.

Fix the following markdown text:

${text}`,
  };
  return prompts[actionId] || prompts["inline-improve"];
};

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(function Editor(
  {
    markdown,
    onChange,
    onInlineAction,
    inlineLoading,
    inlinePreview,
    onApplyInline,
    onCancelInline,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
    historyIndex = 0,
    historyLength = 1,
  },
  ref,
) {
  const { t } = useTranslation();
  const [selection, setSelection] = useState<{
    text: string;
    start: number;
    end: number;
  } | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isAIReady, setIsAIReady] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const inlineActions: InlineAction[] = useMemo(
    () => [
      {
        id: "inline-improve",
        icon: <Sparkles className="w-3.5 h-3.5" />,
        label: t("editor.inlineActions.improve"),
        prompt: (text) => getPrompt("inline-improve", text),
      },
      {
        id: "inline-shorten",
        icon: <Scissors className="w-3.5 h-3.5" />,
        label: t("editor.inlineActions.shorten"),
        prompt: (text) => getPrompt("inline-shorten", text),
      },
      {
        id: "inline-expand",
        icon: <AlignLeft className="w-3.5 h-3.5" />,
        label: t("editor.inlineActions.expand"),
        prompt: (text) => getPrompt("inline-expand", text),
      },
      {
        id: "inline-fix",
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        label: t("editor.inlineActions.fix"),
        prompt: (text) => getPrompt("inline-fix", text),
      },
    ],
    [t],
  );

  useEffect(() => {
    const checkAI = () => {
      const settings = settingsManager.getSettings();
      const provider = settings.textProviders[settings.defaultTextProvider];
      const ready =
        settings.defaultTextProvider === "ollama" || !!provider?.apiKey;
      setIsAIReady(ready);
    };
    checkAI();
    const interval = setInterval(checkAI, 2000);
    return () => clearInterval(interval);
  }, [markdown]);

  const handleSelectionChange = useCallback(() => {
    const textarea = document.querySelector(
      ".editor-textarea",
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);

    if (selectionStart !== selectionEnd && selectedText.trim().length > 0) {
      setSelection({
        text: selectedText,
        start: selectionStart,
        end: selectionEnd,
      });

      const rect = textarea.getBoundingClientRect();
      const cursorTop = rect.top + 10;
      const cursorLeft = rect.left + 20;

      setToolbarPosition({
        top: cursorTop,
        left: Math.min(cursorLeft, window.innerWidth - 400),
      });
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setTimeout(() => setSelection(null), 150);
    }
  }, []);

  useEffect(() => {
    const textarea = document.querySelector(
      ".editor-textarea",
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.addEventListener("select", handleSelectionChange);
      textarea.addEventListener("keyup", handleSelectionChange);
      textarea.addEventListener("click", handleSelectionChange);
      return () => {
        textarea.removeEventListener("select", handleSelectionChange);
        textarea.removeEventListener("keyup", handleSelectionChange);
        textarea.removeEventListener("click", handleSelectionChange);
      };
    }
  }, [handleSelectionChange]);

  const handleAction = (action: InlineAction) => {
    if (selection && onInlineAction) {
      onInlineAction(action.id, selection.text, selection.start, selection.end);
    }
  };

  const showPreview = inlinePreview !== null && inlinePreview !== undefined;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const placeholder = `\n[IMAGE: your-image-url.png]\n`;
        onChange(markdown + placeholder);
      }
    }
  };

  return (
    <div
      className="flex-1 flex flex-col border-r border-border pb-11 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="border-b border-border px-4 py-2 bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{t("editor.title")}</h3>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg px-2 py-1">
            <button
              onClick={() => onUndo?.()}
              disabled={!canUndo}
              className="p-1 rounded hover:bg-background/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={t("editor.history.undo") + " (Ctrl+Z)"}
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onRedo?.()}
              disabled={!canRedo}
              className="p-1 rounded hover:bg-background/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={t("editor.history.redo") + " (Ctrl+Shift+Z)"}
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-muted-foreground ml-1">
              {historyIndex + 1}/{historyLength}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            if (markdown) {
              setShowClearDialog(true);
            }
          }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("common.clear")}
        </button>
      </div>

      <Textarea
        ref={ref}
        value={markdown}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 resize-none rounded-none border-0 focus-visible:ring-0 font-mono text-sm leading-relaxed p-6 editor-textarea"
        placeholder={t("editor.placeholder")}
      />

      {isDragging && (
        <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-foreground">
              Drop image to insert URL placeholder
            </span>
          </div>
        </div>
      )}

      {selection && isVisible && !showPreview && isAIReady && (
        <div
          className="fixed z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
        >
          <div
            className="relative rounded-xl bg-background/98 backdrop-blur-xl shadow-2xl shadow-black/30"
            style={{
              border: "2px solid transparent",
              backgroundClip: "padding-box",
            }}
          >
            <div
              className="absolute inset-0 rounded-xl border-2 border-transparent animate-gradient-border"
              style={{
                background:
                  "linear-gradient(#fff, #fff) padding-box, linear-gradient(90deg, #8b5cf6, #a855f7, #ec4899, #f472b6, #8b5cf6) border-box",
                backgroundSize: "100% 100%, 300% 100%",
                animation: "gradient-shift 2s linear infinite",
              }}
            />
            <div className="relative flex items-center gap-1 px-1.5 py-1.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-lg border border-violet-500/20">
                <Wand2 className="w-3.5 h-3.5 text-violet-500" />
                <span className="text-[11px] font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  AI
                </span>
              </div>
              {inlineActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action)}
                  className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 hover:bg-primary/10 hover:scale-105 active:scale-95"
                  style={{
                    animationDelay: `${index * 30}ms`,
                    animation: "slideIn 0.2s ease-out forwards",
                  }}
                >
                  <span className="text-primary/80 group-hover:text-primary transition-colors">
                    {action.icon}
                  </span>
                  <span className="text-foreground/80 group-hover:text-foreground">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div
          className="fixed z-[100] w-[420px] animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
        >
          <div
            className="relative rounded-2xl bg-background/98 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden"
            style={{
              border: "2px solid transparent",
              backgroundClip: "padding-box",
            }}
          >
            <div
              className="absolute inset-0 rounded-2xl border-2 border-transparent animate-gradient-border"
              style={{
                background:
                  "linear-gradient(#fff, #fff) padding-box, linear-gradient(90deg, #8b5cf6, #a855f7, #ec4899, #f472b6, #8b5cf6) border-box",
                backgroundSize: "100% 100%, 300% 100%",
                animation: inlineLoading
                  ? "gradient-shift 2s linear infinite"
                  : "none",
              }}
            />
            <div className="relative">
              <div className="px-4 py-3 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${inlineLoading ? "bg-violet-500/10" : "bg-green-500/10"}`}
                    >
                      {inlineLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {inlineLoading
                          ? t("editor.inlineActions.processing")
                          : t("editor.inlineActions.previewReady")}
                      </span>
                      {inlineLoading && (
                        <span className="ml-2 text-[10px] text-muted-foreground animate-pulse">
                          {t("editor.inlineActions.generating")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={onCancelInline}
                      disabled={inlineLoading}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={onApplyInline}
                      disabled={inlineLoading || !inlinePreview}
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-purple-500"
                    >
                      {t("common.apply")}
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3 max-h-48 overflow-auto custom-scrollbar">
                {inlineLoading && !inlinePreview ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                      <div
                        className="absolute inset-0 w-10 h-10 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"
                        style={{ animationDelay: "0.15s" }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {t("editor.inlineActions.generating")}
                    </span>
                  </div>
                ) : (
                  <div className="bg-muted/40 rounded-xl p-3 border border-border/50">
                    <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed text-foreground/90">
                      {inlinePreview}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showClearDialog}
        title={t("editor.title")}
        message={t("editor.confirmClear")}
        confirmText={t("common.confirm")}
        cancelText={t("common.cancel")}
        variant="warning"
        onConfirm={() => {
          onChange("");
          setShowClearDialog(false);
        }}
        onCancel={() => setShowClearDialog(false)}
      />
    </div>
  );
});

export default Editor;
