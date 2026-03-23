import {
  useState,
  useEffect,
  useRef,
  Suspense,
  lazy,
  useCallback,
} from "react";
import { flushSync } from "react-dom";
import { useAutoSave } from "@/components/hooks/useAutoSave";
import Header from "@/components/layout/Header";
import Sidebar, { type SidebarTab } from "@/components/layout/Sidebar";
import Editor from "@/components/layout/Editor";
import Preview from "@/components/layout/Preview";
import CompactStats from "@/components/CompactStats";
import ErrorBoundary from "@/components/ErrorBoundary";
import { shortcuts, setupDefaultShortcuts } from "@/lib/keyboard-shortcuts";
import { fileOps, type Project } from "@/lib/file-operations";
import { getDefaultTheme } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { ToastProvider, ToastContainer } from "@/components/Toast";
import { TranslationProvider, useTranslation } from "@/hooks/useTranslation";
import { settingsManager } from "@/lib/settings";
import { callAIStream, type AIConfig } from "@/lib/ai-providers";

// Lazy load PDF Export Button for better bundle size
const PDFExportModal = lazy(() => import("@/components/PDFExportModal"));

const defaultMarkdown = `# MarkPolish Complete Test Document

This document contains all components and formats for testing export to Wecom.

---

## 📝 Text Formatting Test

**Bold text** for emphasizing important content.

*Italic text* for subtle emphasis.

~~Strikethrough~~ for deleted content.

\`Inline code\` looks like this.

[This is a link](https://example.com)

---

## 📋 List Test

### Unordered List

- First item
- Second item
- Third item
- Fourth item

### Ordered List

1. Step one: Prepare content
2. Step two: Select theme
3. Step three: Export file
4. Step four: Paste and publish

### Nested List

- Main item one
  - Sub item 1.1
  - Sub item 1.2
- Main item two
  - Sub item 2.1

---

## 💬 Blockquote and Code Test

### Blockquote

> This is a blockquote.
> It can span multiple lines.
> Perfect for highlighting important information.

### Code Block

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet('MarkPolish');
\`\`\`

---

## 📊 Table Test

| Feature | Description | Status |
|---------|-------------|--------|
| Theme System | 14 professional themes | ✅ |
| AI Assistant | Smart content enhancement | ✅ |
| Export | HTML/PDF/MD | ✅ |
| Custom Components | Rich layout options | ✅ |

---

## 🎨 Custom Components Test

### Hero Component

:::hero
# Welcome to MarkPolish Studio
Create beautiful WeCom content, export with one click, publish easily
:::

### Two Column Layout

:::col-2
#### Left Column
- Rich features
- Easy to use
- Professional output
---
#### Right Column
- Multiple themes
- AI assistance
- Real-time preview
:::

### Three Column Layout

:::col-3
**First Column**
Quick start
---
**Second Column**
Professional output
---
**Third Column**
Efficient publishing
:::

### Steps Component

:::steps
1. Write your Markdown content
2. Select your favorite theme on the right
3. Use AI features to optimize text
4. Click export button to get code
5. Paste into Wecom and publish
:::

### Timeline Component

:::timeline
**January 2024** Project launch, completed basic architecture
---
**March 2024** Released AI assistance features
---
**June 2024** Added 14 professional themes
---
**September 2024** Optimized Wecom export
:::

### Card Component

:::card
**💡 Pro Tip**

Combine multiple components to create more engaging content layouts!

Try combining Hero, Steps, and Card for better results.
:::

### Callout Component

:::callout type="info" title="Note"
This is an info callout for displaying important tips.
:::

:::callout type="warning" title="Warning"
This is a warning callout to alert users about potential issues.
:::

:::callout type="error" title="Error"
This is an error callout for displaying errors or critical problems.
:::

:::callout type="success" title="Success"
This is a success callout indicating an operation completed successfully.
:::

### Quote Component

:::quote author="Steve Jobs" source="Stanford Commencement Speech"
Stay hungry, stay foolish.
:::

### Tabs Component

:::tabs
### Introduction

MarkPolish provides rich Markdown editing features.

---
### User Guide

1. Write content
2. Select theme
3. Export and publish

---
### FAQ

Q: How to export to Wecom?
A: Click the "Export" button.
:::

### Accordion Component

:::accordion
### First Question: How to get started?
Simply type Markdown content in the left editor, and the right side will show a real-time preview.

---
### Second Question: What themes are supported?
Currently 14 themes are supported, including 8 light themes and 6 dark themes.

---
### Third Question: How to export?
Click the export button in the toolbar and select HTML, PDF, or Markdown format.
:::

### Video Component

:::video src="https://example.com/demo.mp4" caption="Feature demo video" :::

---

## 🖼️ Image Test

### AI Generated Image

[IMG: A beautiful mountain sunset with orange and red gradient sky]

---

## ✅ Test Summary

The content above covers all major features of MarkPolish Studio:

- Text formatting (bold, italic, strikethrough, code)
- Heading levels (H1-H4)
- Ordered and unordered lists
- Blockquotes and code blocks
- Tables
- Horizontal rules
- All custom components (Hero, Layout, Steps, Timeline, Card, Callout, Quote, Tabs, Accordion, Video)

---

*🎉 If all content displays correctly, the export feature is working properly!*`;

function KeyboardShortcutsModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">{t("keyboard.title")}</h3>
        <div className="space-y-2 text-sm">
          {shortcuts.getAll().map((shortcut, i) => (
            <div key={i} className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">
                {t(shortcut.description)}
              </span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                {shortcuts.getShortcutString(shortcut)}
              </kbd>
            </div>
          ))}
        </div>
        <Button onClick={onClose} className="w-full mt-4">
          {t("common.close")}
        </Button>
      </div>
    </div>
  );
}

function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState("wechat-classic");
  const [autoSaveEnabled] = useState(true);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [aiImageStates, setAIImageStates] = useState<
    Record<
      string,
      {
        description: string;
        ratio: string;
        imageUrl: string | null;
        status: "idle" | "generating" | "done" | "error";
      }
    >
  >({});
  const [previewMode, setPreviewMode] = useState<"full" | "wecom">("full");
  const [showPDFExport, setShowPDFExport] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("ai");
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [inlineLoading, setInlineLoading] = useState(false);
  const [inlinePreview, setInlinePreview] = useState<string | null>(null);
  const [inlineSelection, setInlineSelection] = useState<{
    text: string;
    start: number;
    end: number;
  } | null>(null);

  const [_history, setHistory] = useState<string[]>([defaultMarkdown]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback(
    (content: string) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(content);
        if (newHistory.length > 50) newHistory.shift();
        return newHistory;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
    },
    [historyIndex],
  );

  useEffect(() => {
    if (cursorPosition !== null && textareaRef.current) {
      const pos = cursorPosition;
      const textarea = textareaRef.current;
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
      textarea.scrollIntoView({ behavior: "smooth", block: "center" });
      setCursorPosition(null);
    }
  }, [cursorPosition]);

  const getCursorPosition = (): number | null => {
    const textarea = textareaRef.current;
    if (!textarea) return null;
    const pos = textarea.selectionStart;
    if (pos < 0 || pos > textarea.value.length) return null;
    return pos;
  };

  const handleInlineAction = async (
    _actionId: string,
    selectedText: string,
  ) => {
    setInlineLoading(true);
    setInlinePreview(null);
    setInlineSelection({
      text: selectedText,
      start: 0,
      end: selectedText.length,
    });

    const settings = settingsManager.getSettings();
    const config: AIConfig = {
      provider: settings.defaultTextProvider,
      model: settings.defaultTextModel,
      apiKey:
        settings.textProviders[settings.defaultTextProvider]?.apiKey || "",
    };

    const prompt = `Improve this text, making it clearer, more engaging, and better structured:\n\n${selectedText}`;

    let fullText = "";
    try {
      await callAIStream(
        config,
        { prompt } as any,
        selectedText,
        "",
        (chunk) => {
          fullText += chunk;
          setInlinePreview(fullText);
        },
      );
    } catch {
      setInlineLoading(false);
      setInlinePreview(null);
      setInlineSelection(null);
    }
    setInlineLoading(false);
  };

  const handleApplyInline = () => {
    if (inlineSelection && inlinePreview !== null) {
      pushHistory(markdown);
      const before = markdown.substring(0, inlineSelection.start);
      const after = markdown.substring(inlineSelection.end);
      const newMarkdown = before + inlinePreview + after;
      flushSync(() => {
        setMarkdown(newMarkdown);
        setInlineLoading(false);
        setInlinePreview(null);
        setInlineSelection(null);
      });
    }
  };

  const handleCancelInline = () => {
    setInlineLoading(false);
    setInlinePreview(null);
    setInlineSelection(null);
  };

  // Auto-save hook
  useAutoSave({
    enabled: autoSaveEnabled,
    getContent: () => markdown,
    getTheme: () => theme,
    projectName: "Auto-saved Project",
    interval: 30000,
  });

  // Keyboard shortcuts setup
  useEffect(() => {
    setupDefaultShortcuts({
      save: () => {
        fileOps.saveProject({ name: "Quick Save", content: markdown, theme });
        alert("Project saved!");
      },
      bold: () => insertFormatting("**", "**"),
      italic: () => insertFormatting("*", "*"),
      undo: () => document.execCommand("undo"),
      redo: () => document.execCommand("redo"),
      find: () => {
        const search = prompt("Find:");
        if (search && textareaRef.current) {
          const pos = markdown.indexOf(search);
          if (pos !== -1) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(pos, pos + search.length);
          }
        }
      },
      newProject: () => {
        if (confirm("Start new project? Unsaved changes will be lost.")) {
          setMarkdown(defaultMarkdown);
          setTheme("wechat-classic");
        }
      },
      togglePreview: () => {
        previewRef.current?.scrollIntoView({ behavior: "smooth" });
      },
      toggleTheme: () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        // Auto-switch theme to match dark/light mode
        const defaultTheme = getDefaultTheme(newIsDark);
        setTheme(defaultTheme.id);
      },
    });
  }, [markdown, theme, isDark]);

  // Dark mode effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Auto-switch theme when dark mode changes
  useEffect(() => {
    const defaultTheme = getDefaultTheme(isDark);
    setTheme(defaultTheme.id);
  }, [isDark]);

  const insertFormatting = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const newText =
      markdown.substring(0, start) +
      before +
      selectedText +
      after +
      markdown.substring(end);

    setMarkdown(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleInsertImage = (url: string, filename: string) => {
    const imageMarkdown = `\n![${filename}](${url})\n`;
    const textarea = textareaRef.current;
    if (!textarea) {
      setMarkdown(markdown + imageMarkdown);
      return;
    }

    const start = textarea.selectionStart;
    const newText =
      markdown.substring(0, start) + imageMarkdown + markdown.substring(start);
    setMarkdown(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + imageMarkdown.length,
        start + imageMarkdown.length,
      );
    }, 0);
  };

  const handleLoadProject = (project: Project) => {
    setMarkdown(project.content);
    setTheme(project.theme);
  };

  const escapeRegex = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const handleInsertAtLocation = (location: string) => {
    const lowerLocation = location.toLowerCase();
    let targetPosition: number | null = null;

    if (lowerLocation === "document start") {
      targetPosition = 0;
    } else if (lowerLocation === "document end") {
      targetPosition = markdown.length;
    } else if (lowerLocation.startsWith("near:")) {
      const headingText = location.substring(5).trim();
      const headingPattern = new RegExp(
        `^#{1,6}\\s+.*${escapeRegex(headingText)}`,
        "im",
      );
      const match = markdown.match(headingPattern);
      if (match && match.index !== undefined) {
        const afterHeading = match.index + match[0].length;
        const nextNewline = markdown.indexOf("\n", afterHeading);
        targetPosition = nextNewline !== -1 ? nextNewline + 1 : afterHeading;
      }
    } else if (lowerLocation.startsWith("position ")) {
      const parts = lowerLocation.match(/position\s+(\d+)\/(\d+)/);
      if (parts && parts.length === 3) {
        const current = parseInt(parts[1]);
        const total = parseInt(parts[2]);
        if (total > 0) {
          targetPosition = Math.floor((current / total) * markdown.length);
          targetPosition = Math.min(targetPosition, markdown.length);
        }
      }
    } else if (lowerLocation === "mid-document") {
      targetPosition = Math.floor(markdown.length / 2);
    } else if (lowerLocation === "near start") {
      targetPosition = Math.floor(markdown.length * 0.1);
    } else if (lowerLocation === "near end") {
      targetPosition = Math.floor(markdown.length * 0.9);
    }

    if (targetPosition !== null) {
      setCursorPosition(targetPosition);
    }
  };

  interface Suggestion {
    component: string;
    location: string;
    syntax: string;
    reason: string;
  }

  const handleInsertAllComponents = (suggestions: Suggestion[]) => {
    if (suggestions.length === 0) return;

    pushHistory(markdown);

    let result = markdown;

    for (const suggestion of suggestions) {
      const lowerLocation = suggestion.location.toLowerCase();
      let insertPos: number | null = null;

      if (lowerLocation === "document start") {
        insertPos = 0;
      } else if (lowerLocation === "document end") {
        insertPos = result.length;
      } else if (lowerLocation.startsWith("near:")) {
        const headingText = suggestion.location.substring(5).trim();
        const headingPattern = new RegExp(
          `^#{1,6}\\s+.*${escapeRegex(headingText)}`,
          "im",
        );
        const match = result.match(headingPattern);
        if (match && match.index !== undefined) {
          const afterHeading = match.index + match[0].length;
          const nextNewline = result.indexOf("\n", afterHeading);
          insertPos = nextNewline !== -1 ? nextNewline + 1 : afterHeading;
        }
      } else if (lowerLocation.startsWith("position ")) {
        const parts = lowerLocation.match(/position\s+(\d+)\/(\d+)/);
        if (parts && parts.length === 3) {
          const current = parseInt(parts[1]);
          const total = parseInt(parts[2]);
          if (total > 0) {
            insertPos = Math.floor((current / total) * result.length);
            insertPos = Math.min(insertPos, result.length);
          }
        }
      } else if (lowerLocation === "mid-document") {
        insertPos = Math.floor(result.length / 2);
      } else if (lowerLocation === "near start") {
        insertPos = Math.floor(result.length * 0.1);
      } else if (lowerLocation === "near end") {
        insertPos = Math.floor(result.length * 0.9);
      }

      if (insertPos !== null) {
        const before = result.substring(0, insertPos);
        const after = result.substring(insertPos);
        const separator =
          insertPos === 0 || before.endsWith("\n\n") ? "" : "\n\n";
        const afterSeparator =
          after === "" || after.startsWith("\n\n") ? "" : "\n\n";
        result =
          before + separator + suggestion.syntax + afterSeparator + after;
      }
    }

    flushSync(() => {
      setMarkdown(result);
    });
  };

  const handleApplyTitle = (title: string) => {
    pushHistory(markdown);

    const h1Match = markdown.match(/^#\s+.+$/m);

    let newMarkdown: string;
    if (h1Match) {
      newMarkdown = markdown.replace(/^#\s+.+$/m, `# ${title}`);
    } else {
      newMarkdown = `# ${title}\n\n${markdown}`;
    }

    flushSync(() => {
      setMarkdown(newMarkdown);
    });
  };

  return (
    <TranslationProvider>
      <ToastProvider>
        <ErrorBoundary>
          <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <Header
              markdown={markdown}
              theme={theme}
              isDark={isDark}
              onToggleDark={() => setIsDark(!isDark)}
              onMarkdownChange={setMarkdown}
              onThemeChange={setTheme}
              showShortcutsHelp={showShortcutsHelp}
              onToggleShortcutsHelp={() =>
                setShowShortcutsHelp(!showShortcutsHelp)
              }
              aiImageStates={aiImageStates}
              defaultMarkdown={defaultMarkdown}
              onShowPDFExport={() => setShowPDFExport(true)}
            />

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar - Left */}
              <ErrorBoundary>
                <Sidebar
                  markdown={markdown}
                  theme={theme}
                  activeTab={sidebarTab}
                  onTabChange={setSidebarTab}
                  onMarkdownChange={setMarkdown}
                  onThemeChange={setTheme}
                  onLoadProject={handleLoadProject}
                  onInsertImage={handleInsertImage}
                  onOpenSettings={() => setSidebarTab("settings")}
                  getCursorPosition={getCursorPosition}
                  onInsertAtLocation={handleInsertAtLocation}
                  onInsertAllComponents={handleInsertAllComponents}
                  onApplyTitle={handleApplyTitle}
                  onPushHistory={() => pushHistory(markdown)}
                />
              </ErrorBoundary>

              {/* Editor - Center */}
              <ErrorBoundary>
                <Editor
                  markdown={markdown}
                  onChange={setMarkdown}
                  ref={textareaRef}
                  onInlineAction={handleInlineAction}
                  inlineLoading={inlineLoading}
                  inlinePreview={inlinePreview}
                  onApplyInline={handleApplyInline}
                  onCancelInline={handleCancelInline}
                />
              </ErrorBoundary>

              {/* Preview - Right */}
              <div
                className="flex-1 flex flex-col overflow-hidden"
                ref={previewRef}
              >
                <ErrorBoundary>
                  <Preview
                    markdown={markdown}
                    theme={theme}
                    previewMode={previewMode}
                    onPreviewModeChange={setPreviewMode}
                    aiImageStates={aiImageStates}
                    onAIImageStatesChange={setAIImageStates}
                  />
                </ErrorBoundary>
              </div>
            </div>

            {/* Compact Stats - Sticky at Bottom */}
            <ErrorBoundary>
              <CompactStats markdown={markdown} />
            </ErrorBoundary>

            {/* Keyboard Shortcuts Help Modal */}
            {showShortcutsHelp && (
              <KeyboardShortcutsModal
                onClose={() => setShowShortcutsHelp(false)}
              />
            )}

            {/* Lazy loaded PDF Export Modal */}
            {showPDFExport && (
              <Suspense
                fallback={
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    Loading...
                  </div>
                }
              >
                <PDFExportModal
                  markdown={markdown}
                  theme={theme}
                  aiImageStates={aiImageStates}
                  onClose={() => setShowPDFExport(false)}
                />
              </Suspense>
            )}

            <ToastContainer />
          </div>
        </ErrorBoundary>
      </ToastProvider>
    </TranslationProvider>
  );
}

export default App;
