import { createPortal } from "react-dom";
import { useState, useEffect, useRef } from "react";
import { FileText } from "lucide-react";
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

  const handleSelect = (template: (typeof templates)[0]) => {
    const content = template.content[language] || template.content.en;
    onSelect(content);
    onClose();
  };

  if (typeof document === "undefined") {
    return null;
  }

  const bg = isDark ? "hsl(222.2 84% 4.9%)" : "hsl(0 0% 100%)";
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
          <FileText size={20} style={{ color: "#3b82f6" }} />
          <span style={{ fontSize: "18px", fontWeight: 600, color: textColor }}>
            {t("templates.title") || "Templates"}
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
            }}
          >
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleSelect(template)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px 12px",
                  border: `1px solid ${border}`,
                  borderRadius: "12px",
                  background: bg,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: "28px" }}>{template.icon}</span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: textColor,
                    textAlign: "center",
                  }}
                >
                  {t(template.nameKey) || template.id}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(panelContent, document.body);
}
