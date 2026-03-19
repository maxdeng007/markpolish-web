import {
  Moon,
  Sun,
  Download,
  Upload,
  Copy,
  FileText,
  Sparkles,
  Keyboard,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fileOps } from "@/lib/file-operations";
import { exportToHTML, exportForWeChat } from "@/lib/export";
import { LanguageSwitcher, useTranslation } from "@/hooks/useTranslation";

interface HeaderProps {
  markdown: string;
  theme: string;
  isDark: boolean;
  onToggleDark: () => void;
  onMarkdownChange: (markdown: string) => void;
  onThemeChange: (theme: string) => void;
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
  defaultMarkdown: string;
  onShowPDFExport: () => void;
}

export default function Header({
  markdown,
  theme,
  isDark,
  onToggleDark,
  onMarkdownChange,
  onThemeChange,
  showShortcutsHelp: _showShortcutsHelp,
  onToggleShortcutsHelp,
  aiImageStates,
  defaultMarkdown,
  onShowPDFExport,
}: HeaderProps) {
  const { t } = useTranslation();

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
    alert(t("toasts.copied"));
  };

  const handleExportHTML = () => {
    exportToHTML(markdown, theme, aiImageStates, "wechat-article.html");
  };

  const handleExportWeChat = () => {
    exportForWeChat(markdown, aiImageStates, theme);
  };

  const handleSave = () => {
    fileOps.saveProject({ name: "Quick Save", content: markdown, theme });
    alert(t("toasts.projectSaved"));
  };

  const handleNewProject = () => {
    if (confirm(t("projects.confirmDelete"))) {
      onMarkdownChange(defaultMarkdown);
      onThemeChange("wechat-classic");
    }
  };

  return (
    <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold">{t("app.name")}</h1>
          <p className="text-xs text-muted-foreground">{t("app.subtitle")}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
          onClick={handleNewProject}
          title={t("header.newProject")}
        >
          <FileText className="w-4 h-4" />
        </Button>

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

        <Button
          variant="outline"
          size="icon"
          onClick={handleSave}
          title={t("header.saveProject")}
        >
          <Download className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          onClick={handleExportHTML}
          title={t("export.html")}
        >
          <FileText className="w-4 h-4 mr-2" />
          {t("export.html")}
        </Button>

        <Button
          variant="default"
          onClick={handleExportWeChat}
          title={t("export.wecom")}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {t("export.wecom")}
        </Button>

        <Button
          variant="outline"
          onClick={onShowPDFExport}
          title={t("export.pdf")}
        >
          <FileDown className="w-4 h-4 mr-2" />
          {t("export.pdf")}
        </Button>

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
          variant="outline"
          size="icon"
          onClick={onToggleDark}
          title={t("header.toggleTheme")}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
