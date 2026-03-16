import { Textarea } from "@/components/ui/textarea";
import { forwardRef } from "react";

interface EditorProps {
  markdown: string;
  onChange: (value: string) => void;
}

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(
  function Editor({ markdown, onChange }, ref) {
    return (
      <div className="flex-1 flex flex-col border-r border-border pb-11">
        <div className="border-b border-border px-4 py-2 bg-muted/30 flex items-center justify-between">
          <h3 className="text-sm font-medium">Editor</h3>
          <button
            onClick={() => {
              if (markdown && !confirm('Clear all editor content?')) return;
              onChange('');
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        </div>

        <Textarea
          ref={ref}
          value={markdown}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 resize-none rounded-none border-0 focus-visible:ring-0 font-mono text-sm leading-relaxed p-6"
          placeholder="Start writing your Wecom content here..."
        />
      </div>
    );
  }
);

export default Editor;
