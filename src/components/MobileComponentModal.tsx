import { X, Layout, Image, Type, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface MobileComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (component: string) => void;
}

export default function MobileComponentModal({
  isOpen,
  onClose,
  onInsert,
}: MobileComponentModalProps) {
  const { t } = useTranslation();

  const components = [
    { id: "hero", label: "Hero", icon: Layout },
    { id: "col-2", label: "Columns (2)", icon: Layout },
    { id: "col-3", label: "Columns (3)", icon: Layout },
    { id: "steps", label: "Steps", icon: Layout },
    { id: "timeline", label: "Timeline", icon: Layout },
    { id: "card", label: "Card", icon: Layout },
    { id: "image", label: "Image", icon: Image },
    { id: "callout", label: "Callout", icon: AlertCircle },
    { id: "quote", label: "Quote", icon: Type },
  ];

  return (
    <div
      className={`mobile-component-modal ${isOpen ? "open" : ""}`}
      onClick={onClose}
    >
      <div
        className="mobile-component-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-component-header">
          <span className="mobile-component-title">
            {t("components.title") || "Insert Component"}
          </span>
          <button
            type="button"
            className="mobile-component-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <div className="mobile-component-body">
          <div className="mobile-component-grid">
            {components.map((comp) => (
              <button
                key={comp.id}
                type="button"
                className="mobile-component-item"
                onClick={() => {
                  onInsert(comp.id);
                  onClose();
                }}
              >
                <comp.icon size={28} />
                <span>{comp.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
