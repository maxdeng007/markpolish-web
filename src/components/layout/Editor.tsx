import { Textarea } from "@/components/ui/textarea";
import { forwardRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface EditorProps {
  markdown: string;
  onChange: (value: string) => void;
}

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(function Editor(
  { markdown, onChange },
  ref,
) {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex flex-col border-r border-border pb-11">
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
        className="flex-1 resize-none rounded-none border-0 focus-visible:ring-0 font-mono text-sm leading-relaxed p-6"
        placeholder={t("editor.placeholder")}
      />
    </div>
  );
});

export default Editor;
