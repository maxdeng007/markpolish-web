import { createPortal } from "react-dom";
import { useState, useEffect, useCallback } from "react";
import {
  X,
  FileText,
  Palette,
  Grid3X3,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
  Layout,
  AlertCircle,
  Video,
  Type,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { componentTemplates } from "@/lib/markdown-components";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (panel: string) => void;
  onAIAction: (action: string) => void;
  onCopyToClipboard?: (text: string, label: string) => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  onNavigate,
  onAIAction,
  onCopyToClipboard,
}: MobileMenuProps) {
  const { t } = useTranslation();
  const [aiExpanded, setAiExpanded] = useState(false);
  const [componentsExpanded, setComponentsExpanded] = useState(false);
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

  const menuItems = [
    { id: "templates", label: "Templates", icon: FileText },
    { id: "themes", label: "Themes", icon: Palette },
    { id: "components", label: "Components", icon: Grid3X3, expandable: true },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "ai", label: "AI Actions", icon: Sparkles, expandable: true },
    { id: "settings", label: "AI Settings", icon: Settings },
  ];

  const aiActions = [
    { id: "expand", label: t("ai.expandContent"), icon: "📈" },
    { id: "polish", label: t("ai.polish"), icon: "✨" },
    { id: "summarize", label: t("ai.summarize"), icon: "📋" },
    { id: "translate", label: t("ai.translate"), icon: "🌐" },
    { id: "tone", label: t("ai.tone"), icon: "🎯" },
    { id: "viralScore", label: "Viral Score", icon: "📊" },
    { id: "amplify", label: "Amplify", icon: "📢" },
  ];

  const componentItems = [
    {
      id: "hero",
      label: "Hero",
      icon: Layout,
      template: componentTemplates.hero,
    },
    {
      id: "col-2",
      label: "Columns (2)",
      icon: Layout,
      template: componentTemplates["col-2"],
    },
    {
      id: "col-3",
      label: "Columns (3)",
      icon: Layout,
      template: componentTemplates["col-3"],
    },
    {
      id: "steps",
      label: "Steps",
      icon: Layout,
      template: componentTemplates.steps,
    },
    {
      id: "timeline",
      label: "Timeline",
      icon: Layout,
      template: componentTemplates.timeline,
    },
    {
      id: "card",
      label: "Card",
      icon: Layout,
      template: componentTemplates.card,
    },
    {
      id: "video",
      label: "Video",
      icon: Video,
      template: '\n\n<video src="" controls></video>\n\n',
    },
    {
      id: "callout",
      label: "Callout",
      icon: AlertCircle,
      template: componentTemplates.callout,
    },
    {
      id: "quote",
      label: "Quote",
      icon: Type,
      template: componentTemplates.quote,
    },
  ];

  const handleItemClick = (itemId: string) => {
    if (itemId === "ai") {
      setAiExpanded(!aiExpanded);
      setComponentsExpanded(false);
    } else if (itemId === "components") {
      setComponentsExpanded(!componentsExpanded);
      setAiExpanded(false);
    } else {
      setAiExpanded(false);
      setComponentsExpanded(false);
      onNavigate(itemId);
      onClose();
    }
  };

  const handleAIActionClick = (actionId: string) => {
    setAiExpanded(false);
    onClose();
    onAIAction(actionId);
  };

  const handleComponentClick = useCallback(
    (component: (typeof componentItems)[0]) => {
      setComponentsExpanded(false);
      onClose();
      if (component.template && onCopyToClipboard) {
        onCopyToClipboard(component.template, component.label);
      }
    },
    [onClose, onCopyToClipboard],
  );

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
    zIndex: 10010,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? "visible" : "hidden",
    pointerEvents: isOpen ? "auto" : "none",
    transition: "opacity 0.3s ease, visibility 0.3s ease",
  };

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "280px",
    maxWidth: "85vw",
    background: isDark ? "#1a1a1a" : "#ffffff",
    zIndex: 10011,
    transform: isOpen ? "translateX(0)" : "translateX(-100%)",
    transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
    overflowY: "auto",
    overscrollBehavior: "contain",
    boxShadow: isOpen ? "8px 0 40px rgba(0, 0, 0, 0.3)" : "none",
  };

  const menuContent = (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={panelStyle}>
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">Menu</span>
          <button type="button" className="mobile-menu-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <ul className="mobile-menu-list">
          {menuItems.map((item) => (
            <li key={item.id}>
              {item.id === "ai" ? (
                <>
                  <button
                    type="button"
                    className={`mobile-menu-item ${aiExpanded ? "expanded" : ""}`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                    <ChevronRight
                      size={16}
                      className={`mobile-menu-chevron ${aiExpanded ? "rotated" : ""}`}
                    />
                  </button>
                  {aiExpanded && (
                    <ul className="mobile-menu-ai-actions">
                      {aiActions.map((action) => (
                        <li key={action.id}>
                          <button
                            type="button"
                            className="mobile-menu-ai-action"
                            onClick={() => handleAIActionClick(action.id)}
                          >
                            <span style={{ fontSize: 18 }}>{action.icon}</span>
                            <span>{action.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : item.id === "components" ? (
                <>
                  <button
                    type="button"
                    className={`mobile-menu-item ${componentsExpanded ? "expanded" : ""}`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                    <ChevronRight
                      size={16}
                      className={`mobile-menu-chevron ${componentsExpanded ? "rotated" : ""}`}
                    />
                  </button>
                  {componentsExpanded && (
                    <ul className="mobile-menu-ai-actions">
                      {componentItems.map((comp) => (
                        <li key={comp.id}>
                          <button
                            type="button"
                            className="mobile-menu-ai-action"
                            onClick={() => handleComponentClick(comp)}
                          >
                            <comp.icon size={18} />
                            <span>{comp.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="mobile-menu-item"
                  onClick={() => handleItemClick(item.id)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(menuContent, document.body);
}
