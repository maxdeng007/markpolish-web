import { createPortal } from "react-dom";
import { useState, useEffect, useRef } from "react";
import { BarChart3, FileText, Clock, Hash } from "lucide-react";

interface MobileStatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
}

function calculateStats(markdown: string) {
  const words = markdown
    .replace(/[#*`_\[\]()]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  const characters = markdown.replace(/\s/g, "").length;

  const readingTime = Math.max(1, Math.ceil(words / 200));

  const lines = markdown.split("\n").length;

  const headings = (markdown.match(/^#{1,6}\s/gm) || []).length;

  const paragraphs = (markdown.match(/\n\n+/g) || []).length + 1;

  const listItems = (markdown.match(/^[\s]*[-*+]\s|^\d+\.\s/gm) || []).length;

  const images = (markdown.match(/!\[.*?\]\(.*?\)/g) || []).length;

  const links = (markdown.match(/\[.*?\]\(.*?\)/g) || []).length;

  const codeBlocks = (markdown.match(/```[\s\S]*?```/g) || []).length;

  return {
    words,
    characters,
    readingTime,
    lines,
    headings,
    paragraphs,
    listItems,
    images,
    links,
    codeBlocks,
  };
}

export default function MobileStatsPanel({
  isOpen,
  onClose,
  markdown,
}: MobileStatsPanelProps) {
  const [isDark, setIsDark] = useState(false);
  const stats = calculateStats(markdown);
  const sheetRef = useRef<HTMLDivElement>(null);
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

  if (typeof document === "undefined") {
    return null;
  }

  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const border = isDark ? "#333" : "#e5e7eb";
  const textColor = isDark ? "#ffffff" : "#111";
  const mutedColor = isDark ? "#888" : "#6b7280";
  const cardBg = isDark ? "#2a2a2a" : "#f5f5f5";

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
          <BarChart3 size={20} style={{ color: "#3b82f6" }} />
          <span style={{ fontSize: "18px", fontWeight: 600, color: textColor }}>
            Document Statistics
          </span>
        </div>
        <div
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
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {[
              { icon: FileText, value: stats.words, label: "Words" },
              { icon: Hash, value: stats.characters, label: "Chars" },
              { icon: Clock, value: stats.readingTime, label: "Min Read" },
              { icon: FileText, value: stats.lines, label: "Lines" },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  padding: "12px 8px",
                  background: cardBg,
                  borderRadius: "12px",
                }}
              >
                <Icon size={20} style={{ color: "#3b82f6" }} />
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: textColor,
                  }}
                >
                  {value}
                </span>
                <span style={{ fontSize: "11px", color: mutedColor }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              borderTop: `1px solid ${border}`,
              paddingTop: "16px",
            }}
          >
            {[
              ["Headings", stats.headings],
              ["Paragraphs", stats.paragraphs],
              ["Lists", stats.listItems],
              ["Images", stats.images],
              ["Links", stats.links],
              ["Code Blocks", stats.codeBlocks],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: `1px solid ${border}`,
                }}
              >
                <span style={{ fontSize: "14px", color: mutedColor }}>
                  {label}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: textColor,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(panelContent, document.body);
}
