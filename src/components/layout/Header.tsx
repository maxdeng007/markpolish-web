import {
  Moon,
  Sun,
  Monitor,
  Link2,
  Link2Off,
  Download,
  Upload,
  Copy,
  FileText,
  Sparkles,
  Keyboard,
  ChevronDown,
  Menu,
  MoreHorizontal,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { exportToHTML, exportToMarkdown, exportForWeChat } from "@/lib/export";
import { LanguageSwitcher, useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/components/Toast";

type ThemeMode = "light" | "dark" | "system";

interface HeaderProps {
  markdown: string;
  theme: string;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  scrollSync: boolean;
  onToggleScrollSync: () => void;
  onMarkdownChange: (markdown: string) => void;
  showShortcutsHelp: boolean;
  onToggleShortcutsHelp: () => void;
  aiImageStates: Record<
    string,
    {
      description: string;
      ratio: string;
      imageUrl: string | null;
      status: "idle" | "generating" | "done" | "error";
    }
  >;
  isMobile?: boolean;
  isPreviewMode?: boolean;
  onToggleMobileMenu?: () => void;
}

export default function Header({
  markdown,
  theme,
  themeMode,
  onThemeModeChange,
  scrollSync,
  onToggleScrollSync,
  onMarkdownChange,
  showShortcutsHelp: _showShortcutsHelp,
  onToggleShortcutsHelp,
  aiImageStates,
  isMobile,
  isPreviewMode,
  onToggleMobileMenu,
}: HeaderProps) {
  const { t, language, setLanguage } = useTranslation();
  const { showToast } = useToast();

  const cycleThemeMode = () => {
    const modes: ThemeMode[] = ["system", "light", "dark"];
    const currentIndex = modes.indexOf(themeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    onThemeModeChange(nextMode);
  };

  const getThemeIcon = () => {
    if (themeMode === "system") return <Monitor className="w-4 h-4" />;
    if (themeMode === "dark") return <Moon className="w-4 h-4" />;
    return <Sun className="w-4 h-4" />;
  };

  const getThemeTooltip = () => {
    if (themeMode === "system") return t("header.themeSystem");
    if (themeMode === "dark") return t("header.themeDark");
    return t("header.themeLight");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onMarkdownChange(content);
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    showToast(t("toasts.copied"), "success");
  };

  const handleExportHTML = () => {
    exportToHTML(markdown, theme, aiImageStates, "wechat-article.html");
  };

  const handleExportWeChat = async () => {
    const result = await exportForWeChat(markdown, aiImageStates, theme);
    showToast(result.message, result.success ? "success" : "error");
  };

  const handleExportMD = () => {
    const filename = `markpolish-${new Date().toISOString().slice(0, 10)}.md`;
    exportToMarkdown(markdown, filename);
  };

  const exportItems = [
    {
      label: t("export.wecom"),
      icon: <Sparkles className="w-4 h-4 shrink-0" />,
      onClick: handleExportWeChat,
    },
    {
      label: "HTML",
      icon: <FileText className="w-4 h-4 shrink-0" />,
      onClick: handleExportHTML,
    },
    {
      label: "Markdown (.md)",
      icon: <FileText className="w-4 h-4 shrink-0" />,
      onClick: handleExportMD,
    },
  ];

  return (
    <header
      className={`${isMobile ? "sticky top-0 z-[200] bg-background" : "relative z-[100]"} border-b border-border px-4 py-3 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`}
    >
      <div className="flex items-center gap-3">
        {isMobile && !isPreviewMode && (
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={onToggleMobileMenu}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className={isMobile ? "w-8 h-8" : "w-10 h-10"}>
          <img
            src="/logo.png"
            alt="Logo"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        {!isMobile && (
          <div>
            <h1 className="text-lg font-bold">{t("app.name")}</h1>
            <p className="text-xs text-muted-foreground">{t("app.subtitle")}</p>
          </div>
        )}
      </div>

      <div
        className={
          isMobile ? "flex items-center gap-1" : "flex items-center gap-2"
        }
      >
        {isMobile ? (
          <>
            {!isPreviewMode && (
              <Dropdown
                id="mobile-export"
                trigger={
                  <Button variant="default" className="gap-1 text-xs h-9 px-3">
                    <Download className="w-4 h-4" />
                    {t("header.export")}
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </Button>
                }
                items={exportItems}
              />
            )}
            {!isPreviewMode && (
              <Dropdown
                id="mobile-more"
                trigger={
                  <Button variant="outline" size="icon" className="w-9 h-9">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                }
                items={[
                  {
                    label: t("header.themeSystem"),
                    icon: <Monitor className="w-4 h-4 shrink-0" />,
                    onClick: () => onThemeModeChange("system"),
                  },
                  {
                    label: t("header.themeLight"),
                    icon: <Sun className="w-4 h-4 shrink-0" />,
                    onClick: () => onThemeModeChange("light"),
                  },
                  {
                    label: t("header.themeDark"),
                    icon: <Moon className="w-4 h-4 shrink-0" />,
                    onClick: () => onThemeModeChange("dark"),
                  },
                  {
                    label:
                      language === "en" ? "切换到中文" : "Switch to English",
                    icon: <Languages className="w-4 h-4 shrink-0" />,
                    onClick: () => setLanguage(language === "en" ? "zh" : "en"),
                  },
                  { label: "", isDivider: true },
                  {
                    label: t("keyboard.title"),
                    icon: <Keyboard className="w-4 h-4 shrink-0" />,
                    onClick: onToggleShortcutsHelp,
                  },
                ]}
              />
            )}
          </>
        ) : (
          <>
            <input
              type="file"
              accept=".md,.markdown,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />

            <Button
              variant="outline"
              size="icon"
              onClick={() => document.getElementById("file-upload")?.click()}
              title={t("header.loadProject")}
            >
              <Upload className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              title={t("common.copy")}
            >
              <Copy className="w-4 h-4" />
            </Button>

            <Dropdown
              id="desktop-export"
              trigger={
                <Button variant="default" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </Button>
              }
              items={exportItems}
            />

            <Button
              variant="outline"
              size="icon"
              onClick={onToggleShortcutsHelp}
              title={t("keyboard.title")}
            >
              <Keyboard className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
              variant={scrollSync ? "default" : "outline"}
              size="icon"
              onClick={onToggleScrollSync}
              title={t("header.scrollSync")}
            >
              {scrollSync ? (
                <Link2 className="w-4 h-4" />
              ) : (
                <Link2Off className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={cycleThemeMode}
              title={getThemeTooltip()}
            >
              {getThemeIcon()}
            </Button>

            <LanguageSwitcher />
          </>
        )}
      </div>
    </header>
  );
}
