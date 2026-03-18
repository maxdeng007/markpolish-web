import { componentTemplates } from "@/lib/markdown-components";

interface ComponentsPanelProps {
  markdown: string;
  setMarkdown: (markdown: string) => void;
  getCursorPosition?: () => number | null;
}

export default function ComponentsPanel({
  markdown,
  setMarkdown,
  getCursorPosition,
}: ComponentsPanelProps) {
  const components = [
    {
      id: "hero",
      name: "Hero Section",
      icon: "🎯",
      description: "Eye-catching hero banner",
    },
    {
      id: "col-2",
      name: "2 Columns",
      icon: "📊",
      description: "Two-column layout",
    },
    {
      id: "col-3",
      name: "3 Columns",
      icon: "📈",
      description: "Three-column layout",
    },
    {
      id: "steps",
      name: "Steps",
      icon: "📝",
      description: "Step-by-step guide",
    },
    {
      id: "timeline",
      name: "Timeline",
      icon: "⏱️",
      description: "Timeline visualization",
    },
    {
      id: "card",
      name: "Card",
      icon: "🎴",
      description: "Styled card component",
    },
    { id: "video", name: "Video", icon: "🎥", description: "Video embed" },
    {
      id: "ai-image",
      name: "AI Image",
      icon: "🎨",
      description: "AI-generated image",
    },
    {
      id: "local-image",
      name: "Local Image",
      icon: "🖼️",
      description: "Local image file",
    },
    {
      id: "callout",
      name: "Callout",
      icon: "💡",
      description: "Info/warning box",
    },
    {
      id: "quote",
      name: "Quote",
      icon: "💬",
      description: "Quote with attribution",
    },
    { id: "tabs", name: "Tabs", icon: "📑", description: "Tabbed content" },
    {
      id: "accordion",
      name: "Accordion",
      icon: "📂",
      description: "Collapsible sections",
    },
  ];

  const insertComponent = (componentId: string) => {
    const template =
      componentTemplates[componentId as keyof typeof componentTemplates];
    if (template) {
      const componentWithNewlines = "\n\n" + template + "\n\n";

      // Get cursor position from textarea
      let cursorPosition: number | null = null;

      try {
        const pos = getCursorPosition?.();
        if (typeof pos === 'number' && pos > 0) {
          cursorPosition = pos;
        }
      } catch (e) {
        // Ignore errors getting cursor position
        cursorPosition = null;
      }

      if (cursorPosition !== null && cursorPosition > 0 && markdown.length > 0) {
        // Insert at cursor position
        const before = markdown.substring(0, cursorPosition);
        const after = markdown.substring(cursorPosition);
        setMarkdown(before + componentWithNewlines + after);
      } else if (markdown.trim() === "") {
        // Empty document - insert at beginning (no leading newlines)
        setMarkdown(template + "\n\n");
      } else {
        // Fallback: append to end (original behavior)
        setMarkdown(markdown + componentWithNewlines);
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-3">Custom Components</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Insert WeChat-optimized components to enhance your content
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {components.map((component) => (
          <button
            key={component.id}
            onClick={() => insertComponent(component.id)}
            className="p-3 border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors text-left"
          >
            <div className="text-2xl mb-1">{component.icon}</div>
            <div className="font-medium text-xs mb-1">{component.name}</div>
            <div className="text-[10px] text-muted-foreground leading-tight">
              {component.description}
            </div>
          </button>
        ))}
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="font-semibold text-xs mb-2">Component Syntax</h4>
        <div className="text-xs space-y-2 text-muted-foreground">
          <div>
            <code className="bg-muted px-1 py-0.5 rounded">:::hero</code> - Hero
            sections
          </div>
          <div>
            <code className="bg-muted px-1 py-0.5 rounded">:::col-2</code> - Two
            columns
          </div>
          <div>
            <code className="bg-muted px-1 py-0.5 rounded">:::steps</code> -
            Step-by-step
          </div>
          <div>
            <code className="bg-muted px-1 py-0.5 rounded">:::callout</code> -
            Callout boxes
          </div>
          <div>
            <code className="bg-muted px-1 py-0.5 rounded">:::quote</code> -
            Quotes
          </div>
          <div>
            <code className="bg-muted px-1 py-0.5 rounded">:::tabs</code> -
            Tabbed content
          </div>
          <div>
            <code className="bg-muted px-1 py-0.5 rounded">:::accordion</code> -
            Collapsible
          </div>
          <div>
            <code className="bg-muted px-1 py-0.5 rounded">[IMG: desc]</code> -
            AI image
          </div>
        </div>
      </div>
    </div>
  );
}
