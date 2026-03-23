import { Textarea } from "@/components/ui/textarea";
import { forwardRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Sparkles,
  Wand2,
  Scissors,
  AlignLeft,
  CheckCircle,
} from "lucide-react";
interface SelectionInfo {
  text: string;
  start: number;
  end: number;
}

interface InlineAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  prompt: (text: string) => string;
}

interface EditorProps {
  markdown: string;
  onChange: (value: string) => void;
  isHighlighted?: boolean;
  onInlineAction?: (action: string, selectedText: string) => void;
  inlineLoading?: boolean;
  inlinePreview?: string | null;
  onApplyInline?: () => void;
  onCancelInline?: () => void;
}

const inlineActions: InlineAction[] = [
  {
    id: "inline-improve",
    icon: <Sparkles className="w-3 h-3" />,
    label: "Improve",
    prompt: (text) =>
      `Improve this text, making it clearer, more engaging, and better structured:\n\n${text}`,
  },
  {
    id: "inline-shorten",
    icon: <Scissors className="w-3 h-3" />,
    label: "Shorten",
    prompt: (text) =>
      `Make this text more concise while keeping the key points:\n\n${text}`,
  },
  {
    id: "inline-expand",
    icon: <AlignLeft className="w-3 h-3" />,
    label: "Expand",
    prompt: (text) =>
      `Expand this text with more details, examples, and context:\n\n${text}`,
  },
  {
    id: "inline-fix",
    icon: <CheckCircle className="w-3 h-3" />,
    label: "Fix",
    prompt: (text) =>
      `Fix any grammar, spelling, or punctuation errors in this text:\n\n${text}`,
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
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  const handleSelectionChange = useCallback(() => {
    const textarea = document.querySelector(
      ".editor-textarea",
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;

    if (selectionStart !== selectionEnd && selectionStart >= 0) {
      const selectedText = value.substring(selectionStart, selectionEnd);

      if (selectedText.trim().length > 0) {
        setSelection({
          text: selectedText,
          start: selectionStart,
          end: selectionEnd,
        });

        const rect = textarea.getBoundingClientRect();
        const lineHeight =
          parseInt(getComputedStyle(textarea).lineHeight) || 24;
        const lines = value.substring(0, selectionStart).split("\n");
        const currentLine = lines.length;

        setToolbarPosition({
          top: rect.top + currentLine * lineHeight - 45,
          left: rect.left + 20,
        });
        return;
      }
    }

    setSelection(null);
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

      {selection && !inlineLoading && !inlinePreview && (
        <div
          className="fixed z-50 flex items-center gap-1 px-2 py-1.5 bg-background border rounded-lg shadow-lg"
          style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
        >
          <span className="text-[10px] text-muted-foreground mr-1">
            <Wand2 className="w-3 h-3" />
          </span>
          {inlineActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {inlinePreview !== null && inlinePreview !== undefined && (
        <div
          className="fixed z-50 w-80 border rounded-lg shadow-lg bg-background overflow-hidden"
          style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
        >
          <div className="px-3 py-2 bg-muted/50 border-b flex items-center justify-between">
            <span className="text-xs font-medium">Inline Preview</span>
            <div className="flex gap-1">
              <button
                onClick={onCancelInline}
                className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onApplyInline}
                className="px-2 py-1 text-xs bg-primary text-white hover:bg-primary/90 rounded transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
          <div className="p-2 max-h-48 overflow-auto">
            <pre className="text-xs whitespace-pre-wrap font-mono">
              {inlinePreview}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
});

export default Editor;
