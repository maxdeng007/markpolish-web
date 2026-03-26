import { Edit3, Eye } from "lucide-react";

interface MobileToggleProps {
  activePanel: "editor" | "preview";
  onToggle: (panel: "editor" | "preview") => void;
}

export default function MobileToggle({
  activePanel,
  onToggle,
}: MobileToggleProps) {
  return (
    <div className="mobile-toggle-bar">
      <button
        type="button"
        className={`mobile-toggle-btn ${activePanel === "editor" ? "active" : ""}`}
        onClick={() => onToggle("editor")}
      >
        <Edit3 size={18} />
        <span>Edit</span>
      </button>
      <button
        type="button"
        className={`mobile-toggle-btn ${activePanel === "preview" ? "active" : ""}`}
        onClick={() => onToggle("preview")}
      >
        <Eye size={18} />
        <span>Preview</span>
      </button>
    </div>
  );
}
