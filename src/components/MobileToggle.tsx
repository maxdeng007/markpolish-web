import { Edit3, Eye } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface MobileToggleProps {
  activePanel: "editor" | "preview";
  onToggle: (panel: "editor" | "preview") => void;
}

export default function MobileToggle({
  activePanel,
  onToggle,
}: MobileToggleProps) {
  const { t } = useTranslation();
  return (
    <div className="mobile-toggle-bar">
      <div className="mobile-toggle-pill">
        <button
          type="button"
          className={`mobile-toggle-btn ${activePanel === "editor" ? "active" : ""}`}
          onClick={() => onToggle("editor")}
        >
          <Edit3 size={16} />
          <span>{t("header.edit")}</span>
        </button>
        <button
          type="button"
          className={`mobile-toggle-btn ${activePanel === "preview" ? "active" : ""}`}
          onClick={() => onToggle("preview")}
        >
          <Eye size={16} />
          <span>{t("header.preview")}</span>
        </button>
      </div>
    </div>
  );
}
