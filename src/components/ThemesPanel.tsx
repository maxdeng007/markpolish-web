import { useState } from "react";
import { getLightThemes, getDarkThemes } from "@/lib/themes";
import { Check, Sun, Moon } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ThemesPanelProps {
  currentTheme: string;
  setTheme: (themeId: string) => void;
}

export default function ThemesPanel({
  currentTheme,
  setTheme,
}: ThemesPanelProps) {
  const { t } = useTranslation();
  const lightThemes = getLightThemes();
  const darkThemes = getDarkThemes();
  const [activeTab, setActiveTab] = useState<"light" | "dark">("light");

  const themes = activeTab === "light" ? lightThemes : darkThemes;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-3">{t("themes.title")}</h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t("themes.description")}
        </p>
      </div>

      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setActiveTab("light")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "light"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sun className="w-4 h-4 text-amber-500" />
          {t("themes.light")} ({lightThemes.length})
        </button>
        <button
          onClick={() => setActiveTab("dark")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "dark"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Moon className="w-4 h-4 text-indigo-400" />
          {t("themes.dark")} ({darkThemes.length})
        </button>
      </div>

      <div className="space-y-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={`w-full p-4 border rounded-lg text-left transition-all ${
              currentTheme === theme.id
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">
                  {t(theme.nameKey)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t(theme.descriptionKey)}
                </div>
              </div>
              {currentTheme === theme.id && (
                <Check className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
              )}
            </div>
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded border-2 shadow-sm"
                style={{ background: theme.styles.background }}
                title={t("themes.background")}
              />
              <div
                className="w-10 h-10 rounded border-2 shadow-sm"
                style={{ background: theme.styles.accent }}
                title={t("themes.accent")}
              />
              <div
                className="w-10 h-10 rounded border-2 shadow-sm"
                style={{ background: theme.styles.heading }}
                title={t("themes.heading")}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
