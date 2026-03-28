import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { X, BarChart3, FileText, Clock, Hash } from "lucide-react";

interface MobileStatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
}

export default function MobileStatsPanel({
  isOpen,
  onClose,
  markdown,
}: MobileStatsPanelProps) {
  const [isDark, setIsDark] = useState(false);
  const stats = calculateStats(markdown);

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
    maxWidth: "360px",
    background: isDark ? "#1a1a1a" : "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    opacity: isOpen ? 1 : 0,
    transition: "opacity 0.3s ease, transform 0.3s ease",
  };

  const panelContent = (
    <div style={overlayStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div className="mobile-panel-header">
          <span className="mobile-panel-title">
            <BarChart3
              size={18}
              style={{ marginRight: 8, display: "inline" }}
            />
            Document Statistics
          </span>
          <button
            type="button"
            className="mobile-panel-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <div className="mobile-stats-body">
          <div className="mobile-stats-grid">
            <div className="mobile-stat-card">
              <FileText size={24} className="mobile-stat-icon" />
              <div className="mobile-stat-value">{stats.words}</div>
              <div className="mobile-stat-label">Words</div>
            </div>
            <div className="mobile-stat-card">
              <Hash size={24} className="mobile-stat-icon" />
              <div className="mobile-stat-value">{stats.characters}</div>
              <div className="mobile-stat-label">Characters</div>
            </div>
            <div className="mobile-stat-card">
              <Clock size={24} className="mobile-stat-icon" />
              <div className="mobile-stat-value">{stats.readingTime}</div>
              <div className="mobile-stat-label">Min Read</div>
            </div>
            <div className="mobile-stat-card">
              <FileText size={24} className="mobile-stat-icon" />
              <div className="mobile-stat-value">{stats.lines}</div>
              <div className="mobile-stat-label">Lines</div>
            </div>
          </div>
          <div className="mobile-stats-detail">
            <div className="mobile-stats-row">
              <span>Headings</span>
              <span>{stats.headings}</span>
            </div>
            <div className="mobile-stats-row">
              <span>Paragraphs</span>
              <span>{stats.paragraphs}</span>
            </div>
            <div className="mobile-stats-row">
              <span>Lists</span>
              <span>{stats.listItems}</span>
            </div>
            <div className="mobile-stats-row">
              <span>Images</span>
              <span>{stats.images}</span>
            </div>
            <div className="mobile-stats-row">
              <span>Links</span>
              <span>{stats.links}</span>
            </div>
            <div className="mobile-stats-row">
              <span>Code Blocks</span>
              <span>{stats.codeBlocks}</span>
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
