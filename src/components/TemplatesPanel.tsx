import { Button } from "@/components/ui/button";
import { templates, getAllCategories } from "@/lib/templates";
import { FileText } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/Toast";

interface TemplatesPanelProps {
  setMarkdown: (markdown: string) => void;
}

export default function TemplatesPanel({ setMarkdown }: TemplatesPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { showToast } = useToast();
  const categories = ["all", ...getAllCategories()];

  const filteredTemplates =
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleUseTemplate = (templateName: string, content: string) => {
    setMarkdown(content);
    showToast(`Applied "${templateName}"`);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-3">Quick Start Templates</h3>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-2.5 py-1.5 text-xs rounded-md transition-all ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="border rounded-lg p-3 hover:border-primary hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">{template.icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {template.description}
                </p>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() =>
                      handleUseTemplate(template.name, template.content)
                    }
                    className="h-7 px-3"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Use
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
