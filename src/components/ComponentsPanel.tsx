import { componentTemplates } from "@/lib/markdown-components";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();

  const getComponent = (id: string) => ({
    id,
    name: t(`components.${id}`),
    icon: getIcon(id),
    description: t(`components.${id}Desc`),
  });

  const components = [
    getComponent("hero"),
    getComponent("col2"),
    getComponent("col3"),
    getComponent("steps"),
    getComponent("timeline"),
    getComponent("card"),
    getComponent("video"),
    getComponent("aiImage"),
    getComponent("callout"),
    getComponent("quote"),
    getComponent("tabs"),
    getComponent("accordion"),
  ];

  const insertComponent = (componentId: string) => {
    // Map display ID back to template ID
    const templateId = componentId
      .replace("col2", "col-2")
      .replace("col3", "col-3")
      .replace("aiImage", "ai-image");
    const template =
      componentTemplates[templateId as keyof typeof componentTemplates];
    if (template) {
      const componentWithNewlines = "\n\n" + template + "\n\n";

      // Get cursor position from textarea
      let cursorPosition: number | null = null;

      try {
        const pos = getCursorPosition?.();
        if (typeof pos === "number" && pos > 0) {
          cursorPosition = pos;
        }
      } catch {
        // Ignore errors getting cursor position
        cursorPosition = null;
      }

      if (
        cursorPosition !== null &&
        cursorPosition > 0 &&
        markdown.length > 0
      ) {
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
        <h3 className="font-semibold text-sm mb-3">{t("components.title")}</h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t("components.description")}
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
        <h4 className="font-semibold text-xs mb-2">{t("components.syntax")}</h4>
        <div className="text-xs space-y-2 text-muted-foreground">
          <div>
            <code className="bg-muted px-1 py-0.5 rounded">:::hero</code> - Hero
          </div>
          <div>
            <code className="bg-muted px-1 py-0.5 rounded">:::col-2</code> - Two
            columns
          </div>
          <div>
            <code className="bg-muted px-1 py-0.5 rounded">:::steps</code> -
            Steps
          </div>
          <div>
            <code className="bg-muted px-1 py-0.5 rounded">:::callout</code> -
            Callout
          </div>
          <div>
            <code className="bg-muted px-1 py-0.5 rounded">:::quote</code> -
            Quote
          </div>
          <div>
            <code className="bg-muted px-1 py-0.5 rounded">:::tabs</code> - Tabs
          </div>
          <div>
            <code className="bg-muted px-1 py-0.5 rounded">:::accordion</code> -
            Accordion
          </div>
          <div>
            <code className="bg-muted px-1 py-0.5 rounded">[IMG: desc]</code> -
            AI Image
          </div>
        </div>
      </div>
    </div>
  );
}

function getIcon(id: string): string {
  const icons: Record<string, string> = {
    hero: "🎯",
    col2: "📊",
    col3: "📈",
    steps: "📝",
    timeline: "⏱️",
    card: "🎴",
    video: "🎥",
    aiImage: "🎨",
    callout: "💡",
    quote: "💬",
    tabs: "📑",
    accordion: "📂",
  };
  return icons[id] || "📦";
}
