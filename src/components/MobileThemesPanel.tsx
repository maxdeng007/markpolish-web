import { createPortal } from "react-dom";
import { useState, useEffect, useRef } from "react";
import { Palette, Check } from "lucide-react";
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
  const sheetRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY <= 0) {
      setIsDragging(false);
      return;
    }
    const scrollTop = bodyRef.current?.scrollTop ?? 0;
    if (scrollTop > 0) {
      setIsDragging(false);
      return;
    }
    setIsDragging(true);
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (sheetRef.current) {
      sheetRef.current.style.transform = "";
    }
    if (isDragging && deltaY > 80) {
      onClose();
    }
    setIsDragging(false);
  };

  const handleSelect = (themeId: string) => {
    onSelect(themeId);
    onClose();
  };

  if (typeof document === "undefined") {
    return null;
  }

  const lightThemes = getLightThemes();
  const darkThemes = getDarkThemes();

  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const border = isDark ? "#333" : "#e5e7eb";
  const textColor = isDark ? "#ffffff" : "#111";

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
    zIndex: 10020,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? "visible" : "hidden",
    pointerEvents: isOpen ? "auto" : "none",
    transition: "opacity 0.3s ease, visibility 0.3s ease",
  };

  const sheetStyle: React.CSSProperties = {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "85vh",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    zIndex: 10021,
    background: bg,
    transform: isOpen ? "translateY(0)" : "translateY(100%)",
    transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 -8px 40px rgba(0, 0, 0, 0.15)",
  };

  const ThemeItem = ({ theme }: { theme: (typeof lightThemes)[0] }) => (
    <button
      type="button"
      onClick={() => handleSelect(theme.id)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        padding: "8px",
        border: currentTheme === theme.id ? `2px solid #3b82f6` : "none",
        borderRadius: "12px",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "4/3",
          borderRadius: "8px",
          background: theme.styles.background,
          border: `1px solid ${border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <span
          style={{
            color: theme.styles.foreground,
            fontSize: "18px",
            fontWeight: 700,
          }}
        >
          Aa
        </span>
        {currentTheme === theme.id && (
          <div
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={12} color="#fff" />
          </div>
        )}
      </div>
      <span
        style={{
          fontSize: "11px",
          color: textColor,
          textAlign: "center",
          maxWidth: "70px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {t(theme.nameKey) || theme.id}
      </span>
    </button>
  );

  const panelContent = (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div
        ref={sheetRef}
        style={sheetStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 4px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "40px",
              height: "4px",
              borderRadius: "2px",
              background: border,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 20px 12px",
            flexShrink: 0,
          }}
        >
          <Palette size={20} style={{ color: "#3b82f6" }} />
          <span style={{ fontSize: "18px", fontWeight: 600, color: textColor }}>
            {t("themes.title") || "Themes"}
          </span>
        </div>
        <div
          ref={bodyRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 20px 24px",
            overscrollBehavior: "contain",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: textColor,
                marginBottom: "12px",
              }}
            >
              Light
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
              }}
            >
              {lightThemes.map((theme) => (
                <ThemeItem key={theme.id} theme={theme} />
              ))}
            </div>
          </div>
          <div>
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: textColor,
                marginBottom: "12px",
              }}
            >
              Dark
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
              }}
            >
              {darkThemes.map((theme) => (
                <ThemeItem key={theme.id} theme={theme} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(panelContent, document.body);
}
