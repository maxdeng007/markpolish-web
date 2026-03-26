import { X, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface MobileAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAIAction: (action: string) => void;
}

export default function MobileAIPanel({
  isOpen,
  onClose,
  onAIAction,
}: MobileAIPanelProps) {
  const { t } = useTranslation();

  const aiActions = [
    { id: "title", label: t("ai.generateTitle"), icon: "📝" },
    { id: "expand", label: t("ai.expandContent"), icon: "📖" },
    { id: "summarize", label: t("ai.summarize"), icon: "📋" },
    { id: "translate", label: t("ai.translate"), icon: "🌐" },
    { id: "polish", label: t("ai.polish"), icon: "✨" },
    { id: "tone", label: t("ai.tone"), icon: "🎯" },
  ];

  return (
    <div className={`mobile-ai-panel ${isOpen ? "open" : ""}`}>
      <div className="mobile-ai-handle" />
      <div className="mobile-ai-header">
        <span className="mobile-ai-title">
          <Sparkles size={18} style={{ marginRight: 8, display: "inline" }} />
          AI Actions
        </span>
        <button type="button" className="mobile-ai-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <div className="mobile-ai-content">
        <div className="mobile-ai-actions">
          {aiActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className="mobile-ai-action-btn"
              onClick={() => {
                onAIAction(action.id);
                onClose();
              }}
            >
              <span style={{ fontSize: 24 }}>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
