import { Textarea } from "@/components/ui/textarea";
import { forwardRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Sparkles,
  Wand2,
  Scissors,
  AlignLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface InlineAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  labelZh: string;
  prompt: (text: string) => string;
}

interface EditorProps {
  markdown: string;
  onChange: (value: string) => void;
  onInlineAction?: (actionId: string, selectedText: string) => void;
  inlineLoading?: boolean;
  inlinePreview?: string | null;
  onApplyInline?: () => void;
  onCancelInline?: () => void;
}

const inlineActions: InlineAction[] = [
  {
    id: "inline-improve",
    icon: <Sparkles className="w-3.5 h-3.5" />,
    label: "Improve",
    labelZh: "润色",
    prompt: (text) =>
      `Improve this text, making it clearer, more engaging, and better structured:\n\n${text}`,
  },
  {
    id: "inline-shorten",
    icon: <Scissors className="w-3.5 h-3.5" />,
    label: "Shorten",
    labelZh: "精简",
    prompt: (text) =>
      `Make this text more concise while keeping the key points:\n\n${text}`,
  },
  {
    id: "inline-expand",
    icon: <AlignLeft className="w-3.5 h-3.5" />,
    label: "Expand",
    labelZh: "扩展",
    prompt: (text) =>
      `Expand this text with more details, examples, and context:\n\n${text}`,
  },
  {
    id: "inline-fix",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    label: "Fix",
    labelZh: "修正",
    prompt: (text) =>
      `Fix any grammar, spelling, or punctuation errors:\n\n${text}`,
  },
];

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(function Editor(
  {
    markdown,
    onChange,
    onInlineAction,
    inlineLoading,
    inlinePreview,
    onApplyInline,
    onCancelInline,
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
      const lineHeight = 24;
      const lines = value.substring(0, selectionStart).split("\n");
      const currentLine = lines.length;
      const charIndex = lines[lines.length - 1].length;
      const charWidth = 8;

      const top = rect.top + currentLine * lineHeight - 52;
      const left = rect.left + charIndex * charWidth + 60;

      setToolbarPosition({
        top: Math.max(10, top),
        left: Math.min(left, window.innerWidth - 400),
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
      onInlineAction(action.id, selection.text);
    }
  };

  const showPreview = inlinePreview !== null && inlinePreview !== undefined;

  return (
    <div className="flex-1 flex flex-col border-r border-border pb-11 relative">
      <div className="border-b border-border px-4 py-2 bg-muted/30 flex items-center justify-between">
        <h3 className="text-sm font-medium">{t("editor.title")}</h3>
        <button
          onClick={() => {
            if (markdown && !confirm(t("editor.confirmClear"))) return;
            onChange("");
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

      {selection && isVisible && !showPreview && (
        <div
          className="fixed z-[100] flex items-center gap-1 px-2 py-1.5 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl shadow-black/10"
          style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
        >
          <div className="flex items-center gap-1 pr-2 border-r border-border/50">
            <Wand2 className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-medium text-muted-foreground">
              AI
            </span>
          </div>
          {inlineActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-primary/5 hover:bg-primary/15 text-primary rounded-lg transition-all hover:scale-105"
            >
              {action.icon}
              <span>{action.label}</span>
              <span className="text-[10px] text-muted-foreground/70">
                ({action.labelZh})
              </span>
            </button>
          ))}
        </div>
      )}

      {showPreview && (
        <div
          className="fixed z-[100] w-96 border border-border/50 rounded-xl shadow-2xl shadow-black/20 bg-background/95 backdrop-blur-sm overflow-hidden"
          style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
        >
          <div className="px-4 py-2.5 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {inlineLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <span className="text-xs font-semibold">
                {inlineLoading ? "AI is thinking..." : "Preview"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onCancelInline}
                className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onApplyInline}
                disabled={inlineLoading}
                className="px-3 py-1 text-xs font-medium bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
          <div className="p-3 max-h-56 overflow-auto">
            {inlineLoading && !inlinePreview ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-xs text-muted-foreground">
                  Generating...
                </span>
              </div>
            ) : (
              <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed text-foreground/90 bg-muted/30 p-3 rounded-lg border border-border/30">
                {inlinePreview}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default Editor;
