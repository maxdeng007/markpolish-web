import MarkdownPreview, { AIImageState } from "@/components/MarkdownPreview";
import { cn } from "@/lib/utils";

interface PreviewProps {
  markdown: string;
  theme: string;
  previewMode: "full" | "wecom";
  onPreviewModeChange: (mode: "full" | "wecom") => void;
  aiImageStates: Record<string, AIImageState>;
  onAIImageStatesChange: (states: Record<string, AIImageState>) => void;
}

export default function Preview({
  markdown,
  theme,
  previewMode,
  onPreviewModeChange,
  aiImageStates,
  onAIImageStatesChange,
}: PreviewProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
      <div className="border-b border-border px-4 py-2 bg-muted/50 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Preview</h3>
          <div className="flex rounded-md bg-muted p-0.5">
            <button
              onClick={() => onPreviewModeChange("full")}
              className={cn(
                "px-3 py-1 text-xs rounded-sm transition-colors",
                previewMode === "full"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Full
            </button>
            <button
              onClick={() => onPreviewModeChange("wecom")}
              className={cn(
                "px-3 py-1 text-xs rounded-sm transition-colors",
                previewMode === "wecom"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              WeCom
            </button>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{theme}</span>
      </div>
      <div className="flex-1 overflow-auto">
        <MarkdownPreview
          markdown={markdown}
          theme={theme}
          previewMode={previewMode}
          aiImageStates={aiImageStates}
          onAIImageStatesChange={onAIImageStatesChange}
        />
      </div>
    </div>
  );
}
