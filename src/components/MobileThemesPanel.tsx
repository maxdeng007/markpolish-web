import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { X, Palette, Check } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getLightThemes, getDarkThemes } from "@/lib/themes";

interface MobileThemesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onSelect: (themeId: string) => void;
}

export default function MobileThemesPanel({
  isOpen,
  onClose,
  currentTheme,
  onSelect,
}: MobileThemesPanelProps) {
  const { t } = useTranslation();
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

  const lightThemes = getLightThemes();
  const darkThemes = getDarkThemes();

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

  const handleSelect = (themeId: string) => {
    onSelect(themeId);
    onClose();
  };

  const ThemeItem = ({ theme }: { theme: (typeof lightThemes)[0] }) => (
    <button
      type="button"
      className={`mobile-theme-item ${currentTheme === theme.id ? "active" : ""}`}
      onClick={() => handleSelect(theme.id)}
    >
      <div
        className="mobile-theme-preview"
        style={{ background: theme.styles.background }}
      >
        <div
          className="mobile-theme-sample"
          style={{ color: theme.styles.foreground }}
        >
          Aa
        </div>
        {currentTheme === theme.id && (
          <div className="mobile-theme-check">
            <Check size={16} />
          </div>
        )}
      </div>
      <span className="mobile-theme-name">{t(theme.nameKey) || theme.id}</span>
    </button>
  );

  const panelContent = (
    <div style={overlayStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div className="mobile-panel-header">
          <span className="mobile-panel-title">
            <Palette size={18} style={{ marginRight: 8, display: "inline" }} />
            {t("themes.title") || "Themes"}
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
          <div className="mobile-themes-section">
            <h4 className="mobile-themes-section-title">Light</h4>
            <div className="mobile-themes-grid">
              {lightThemes.map((theme) => (
                <ThemeItem key={theme.id} theme={theme} />
              ))}
            </div>
          </div>
          <div className="mobile-themes-section">
            <h4 className="mobile-themes-section-title">Dark</h4>
            <div className="mobile-themes-grid">
              {darkThemes.map((theme) => (
                <ThemeItem key={theme.id} theme={theme} />
              ))}
            </div>
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
