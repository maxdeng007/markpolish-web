import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { X, FileText } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { templates } from "@/lib/templates";

interface MobileTemplatesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
}

export default function MobileTemplatesPanel({
  isOpen,
  onClose,
  onSelect,
}: MobileTemplatesPanelProps) {
  const { t, language } = useTranslation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
    zIndex: 10013,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? "visible" : "hidden",
    pointerEvents: isOpen ? "auto" : "none",
    transition: "opacity 0.3s ease, visibility 0.3s ease",
  };

  const contentStyle: React.CSSProperties = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: isOpen ? "translate(-50%, -50%)" : "translate(-50%, -40%)",
    width: "92%",
    maxWidth: "400px",
    maxHeight: "75vh",
    background: isDark ? "#1a1a1a" : "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    opacity: isOpen ? 1 : 0,
    transition: "opacity 0.3s ease, transform 0.3s ease",
  };

  const handleSelect = (template: (typeof templates)[0]) => {
    const content = template.content[language] || template.content.en;
    onSelect(content);
    onClose();
  };

  const panelContent = (
    <div style={overlayStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div className="mobile-panel-header">
          <span className="mobile-panel-title">
            <FileText size={18} style={{ marginRight: 8, display: "inline" }} />
            {t("templates.title") || "Templates"}
          </span>
          <button
            type="button"
            className="mobile-panel-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <div className="mobile-panel-body">
          <div className="mobile-templates-grid">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                className="mobile-template-item"
                onClick={() => handleSelect(template)}
              >
                <span className="mobile-template-icon">{template.icon}</span>
                <span className="mobile-template-name">
                  {t(template.nameKey) || template.id}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(panelContent, document.body);
}
