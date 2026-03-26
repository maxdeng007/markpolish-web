import {
  X,
  FileText,
  Palette,
  Grid3X3,
  BarChart3,
  Settings,
  Download,
  Sparkles,
} from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (panel: string) => void;
  onExport: () => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  onNavigate,
  onExport,
}: MobileMenuProps) {
  const menuItems = [
    { id: "templates", label: "Templates", icon: FileText },
    { id: "themes", label: "Themes", icon: Palette },
    { id: "components", label: "Components", icon: Grid3X3 },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "ai", label: "AI Actions", icon: Sparkles },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <div
        className={`mobile-menu-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />
      <div className={`mobile-menu-panel ${isOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">Menu</span>
          <button type="button" className="mobile-menu-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <ul className="mobile-menu-list">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="mobile-menu-item"
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
          <li>
            <div className="mobile-menu-divider" />
          </li>
          <li>
            <button
              type="button"
              className="mobile-menu-item"
              onClick={() => {
                onExport();
                onClose();
              }}
            >
              <Download size={20} />
              <span>Export</span>
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}
