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
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { exportToHTML, exportToMarkdown, exportForWeChat } from "@/lib/export";
import { LanguageSwitcher, useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/components/Toast";

interface HeaderProps {
  markdown: string;
  theme: string;
  isDark: boolean;
  onToggleDark: () => void;
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
  onShowPDFExport: () => void;
}

export default function Header({
  markdown,
  theme,
  isDark,
  onToggleDark,
  onMarkdownChange,
  showShortcutsHelp: _showShortcutsHelp,
  onToggleShortcutsHelp,
  aiImageStates,
  onShowPDFExport,
}: HeaderProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

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
      label: "PDF",
      icon: <FileDown className="w-4 h-4 shrink-0" />,
      onClick: onShowPDFExport,
    },
    {
      label: "Markdown (.md)",
      icon: <FileText className="w-4 h-4 shrink-0" />,
      onClick: handleExportMD,
    },
  ];

  return (
    <header className="relative z-[100] border-b border-border px-4 py-3 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
