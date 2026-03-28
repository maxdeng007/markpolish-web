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
import MobileToggle from "@/components/MobileToggle";
import MobileMenuHandler from "@/components/MobileMenuHandler";
import ErrorBoundary from "@/components/ErrorBoundary";
import { shortcuts, setupDefaultShortcuts } from "@/lib/keyboard-shortcuts";
import { fileOps } from "@/lib/file-operations";
import { getDefaultTheme } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { ToastProvider, ToastContainer } from "@/components/Toast";
import { DropdownProvider } from "@/components/ui/DropdownContext";
import { TranslationProvider, useTranslation } from "@/hooks/useTranslation";
import { settingsManager } from "@/lib/settings";
import {
  callAIStream,
  type AIConfig,
  getLanguageHint,
} from "@/lib/ai-providers";
import {
  extractTextWithFormatting,
  restoreFormatting,
  FormattingWrapper,
} from "@/lib/utils";
import { useEditorScrollSync } from "@/hooks/useScrollSync";

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

type ThemeMode = "light" | "dark" | "system";

function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [theme, setTheme] = useState("wechat-classic");
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
  const [scrollSync, setScrollSync] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("ai");
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [activeMobilePanel, setActiveMobilePanel] = useState<
    "editor" | "preview"
  >("editor");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTemplatesOpen, setMobileTemplatesOpen] = useState(false);
  const [mobileThemesOpen, setMobileThemesOpen] = useState(false);
  const [mobileStatsOpen, setMobileStatsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [inlineLoading, setInlineLoading] = useState(false);
  const [inlinePreview, setInlinePreview] = useState<string | null>(null);
  const [inlineSelection, setInlineSelection] = useState<{
    text: string;
    start: number;
    end: number;
    wrappers?: FormattingWrapper[];
  } | null>(null);

  const [_history, setHistory] = useState<string[]>([defaultMarkdown]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const lastSavedContent = useRef<string>(defaultMarkdown);
  const historyRef = useRef(_history);
  const historyIndexRef = useRef(historyIndex);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < _history.length - 1;

  useEditorScrollSync(editorScrollRef, previewScrollRef, {
    enabled: scrollSync,
    isMobile,
  });

  useEffect(() => {
    historyRef.current = _history;
    historyIndexRef.current = historyIndex;
  }, [_history, historyIndex]);

  const pushHistory = useCallback((content: string, force = false) => {
    if (!force && content === lastSavedContent.current) {
      return;
    }
    lastSavedContent.current = content;
    setHistory((prev) => {
      const currentIndex = historyIndexRef.current;
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(content);
      if (newHistory.length > 100) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 99));
  }, []);

  const handleUndo = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const idx = historyIndexRef.current;
    const hist = historyRef.current;
    if (idx <= 0) return;
    const newIdx = idx - 1;
    const content = hist[newIdx];
    lastSavedContent.current = content;
    historyIndexRef.current = newIdx;
    setHistoryIndex(newIdx);
    setMarkdown(content);
  }, []);

  const handleRedo = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const idx = historyIndexRef.current;
    const hist = historyRef.current;
    if (idx >= hist.length - 1) return;
    const newIdx = idx + 1;
    const content = hist[newIdx];
    lastSavedContent.current = content;
    historyIndexRef.current = newIdx;
    setHistoryIndex(newIdx);
    setMarkdown(content);
  }, []);

  const setMarkdownWithHistory = useCallback(
    (newContent: string) => {
      setMarkdown(newContent);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        pushHistory(newContent);
      }, 1000);
    },
    [pushHistory],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

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
    actionId: string,
    selectedText: string,
    start: number,
    end: number,
  ) => {
    const settings = settingsManager.getSettings();
    const provider = settings.textProviders[settings.defaultTextProvider];

    if (settings.defaultTextProvider !== "ollama" && !provider?.apiKey) {
      return;
    }

    const { plainText, wrappers } = extractTextWithFormatting(selectedText);

    setInlineLoading(true);
    setInlinePreview(null);
    setInlineSelection({
      text: selectedText,
      start,
      end,
      wrappers,
    });

    const langHint = getLanguageHint(plainText);

    const config: AIConfig = {
      provider: settings.defaultTextProvider,
      model: settings.defaultTextModel,
      apiKey: provider?.apiKey || "",
    };

    const prompts: Record<string, { name: string; prompt: string }> = {
      "inline-improve": {
        name: "Improve",
        prompt: `${langHint}\n\nYou are a professional editor. Rewrite and improve the following text to make it clearer, more engaging, well-structured, and grammatically correct. Only output the improved text, no explanations:\n\n${plainText}`,
      },
      "inline-shorten": {
        name: "Shorten",
        prompt: `${langHint}\n\nYou are a professional editor. Rewrite the following text to be significantly shorter and more concise while preserving all essential meaning and key points. Remove redundancy, filler words, and unnecessary details. Output ONLY the shortened text, no explanations:\n\n${plainText}`,
      },
      "inline-expand": {
        name: "Expand",
        prompt: `${langHint}\n\nYou are a professional writer. Expand the following text with more relevant details, examples, explanations, and context to make it more comprehensive and informative. Maintain the original tone and meaning. Only output the expanded text, no explanations:\n\n${plainText}`,
      },
      "inline-fix": {
        name: "Fix",
        prompt: `${langHint}\n\nYou are a professional proofreader. Fix all grammar, spelling, punctuation, and formatting errors in the following text. Keep the content and meaning exactly the same. Only output the corrected text, no explanations:\n\n${plainText}`,
      },
      "inline-translate": {
        name: "Translate",
        prompt: `${langHint}\n\nYou are a professional translator. Detect the language of the input text. If it's Chinese, translate to English. If it's English, translate to Chinese. Preserve all markdown formatting (headers #, bold **, italic *, lists - *, blockquotes >). Only output the translated text, no explanations:\n\n${plainText}`,
      },
      "inline-tone": {
        name: "Tone",
        prompt: `${langHint}\n\nYou are a professional writer. Adjust the tone of the following text to be more engaging, conversational, and relatable for WeChat/social media readers. Use a friendly, personal voice. Preserve all markdown formatting. Only output the adjusted text, no explanations:\n\n${plainText}`,
      },
    };

    const actionConfig = prompts[actionId] || prompts["inline-improve"];

    const action = {
      id: actionId,
      name: actionConfig.name,
      description: `${actionConfig.name} selected text`,
      icon: "✨",
      prompt: () => actionConfig.prompt,
    };

    let fullText = "";
    try {
      await callAIStream(config, action, plainText, "", (chunk) => {
        fullText += chunk;
        const formattedResult = restoreFormatting(wrappers, fullText);
        setInlinePreview(formattedResult);
      });
    } catch {
      setInlineLoading(false);
      setInlinePreview(null);
      setInlineSelection(null);
    }

    if (fullText) {
      const formattedResult = restoreFormatting(wrappers, fullText);
      setInlinePreview(formattedResult);
    }
    setInlineLoading(false);
  };

  const handleApplyInline = () => {
    if (inlineSelection && inlinePreview !== null) {
      const before = markdown.substring(0, inlineSelection.start);
      const after = markdown.substring(inlineSelection.end);
      const newMarkdown = before + inlinePreview + after;

      // Save original state for undo
      pushHistory(markdown, true);

      flushSync(() => {
        setMarkdown(newMarkdown);
        // Save new state for redo - need to do this after setMarkdown
        setTimeout(() => {
          pushHistory(newMarkdown, true);
        }, 0);
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
  const settings = settingsManager.getSettings();
  useAutoSave({
    enabled: settings.autoSave,
    getContent: () => markdown,
    getTheme: () => theme,
    projectName: "Auto-saved Project",
    interval: (settings.autoSaveInterval || 30) * 1000,
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
      undo: () => handleUndo(),
      redo: () => handleRedo(),
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
        const modes: ThemeMode[] = ["system", "light", "dark"];
        const currentIndex = modes.indexOf(themeMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        setThemeMode(nextMode);
      },
    });
  }, [markdown, theme, themeMode, handleUndo, handleRedo]);

  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    const actualIsDark =
      themeMode === "dark" ||
      (themeMode === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    const defaultTheme = getDefaultTheme(actualIsDark);
    setTheme(defaultTheme.id);
  }, [themeMode]);

  useEffect(() => {
    if (themeMode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const defaultTheme = getDefaultTheme(e.matches);
      setTheme(defaultTheme.id);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [themeMode]);

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

    pushHistory(markdown, true);
    setMarkdown(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleInsertImage = (url: string, filename: string) => {
    const imageMarkdown = `\n![${filename}](${url})\n`;
    const textarea = textareaRef.current;
    if (!textarea) {
      pushHistory(markdown, true);
      setMarkdown(markdown + imageMarkdown);
      return;
    }

    const start = textarea.selectionStart;
    const newText =
      markdown.substring(0, start) + imageMarkdown + markdown.substring(start);
    pushHistory(markdown, true);
    setMarkdown(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + imageMarkdown.length,
        start + imageMarkdown.length,
      );
    }, 0);
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

  const handleSelectTemplate = (content: string) => {
    setMarkdown(content);
  };

  const handleSelectTheme = (themeId: string) => {
    setTheme(themeId);
  };

  return (
    <TranslationProvider>
      <ToastProvider>
        <ErrorBoundary>
          <DropdownProvider>
            <div
              className={
                isMobile
                  ? "mobile-layout"
                  : "h-screen flex flex-col bg-background"
              }
            >
              {/* Header */}
              <Header
                markdown={markdown}
                theme={theme}
                themeMode={themeMode}
                onThemeModeChange={setThemeMode}
                scrollSync={scrollSync}
                onToggleScrollSync={() => setScrollSync(!scrollSync)}
                onMarkdownChange={setMarkdown}
                showShortcutsHelp={showShortcutsHelp}
                onToggleShortcutsHelp={() =>
                  setShowShortcutsHelp(!showShortcutsHelp)
                }
                aiImageStates={aiImageStates}
                onShowPDFExport={() => setShowPDFExport(true)}
                isMobile={isMobile}
                onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
              />

              {/* Main Content - Desktop: 3-panel, Mobile: single panel */}
              {isMobile ? (
                /* Mobile: Editor OR Preview (full width) */
                <div className="mobile-content">
                  {activeMobilePanel === "editor" ? (
                    <div className="editor-container active">
                      <ErrorBoundary>
                        <Editor
                          markdown={markdown}
                          onChange={setMarkdownWithHistory}
                          ref={textareaRef}
                          scrollRef={editorScrollRef}
                          onInlineAction={handleInlineAction}
                          inlineLoading={inlineLoading}
                          inlinePreview={inlinePreview}
                          onApplyInline={handleApplyInline}
                          onCancelInline={handleCancelInline}
                          onUndo={handleUndo}
                          onRedo={handleRedo}
                          canUndo={canUndo}
                          canRedo={canRedo}
                          historyIndex={historyIndex}
                          historyLength={_history.length}
                        />
                      </ErrorBoundary>
                    </div>
                  ) : (
                    <div className="preview-container active">
                      <ErrorBoundary>
                        <Preview
                          markdown={markdown}
                          theme={theme}
                          previewMode={previewMode}
                          onPreviewModeChange={setPreviewMode}
                          aiImageStates={aiImageStates}
                          onAIImageStatesChange={setAIImageStates}
                          scrollRef={previewScrollRef}
                        />
                      </ErrorBoundary>
                    </div>
                  )}
                </div>
              ) : (
                /* Desktop: 3-panel layout */
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
                    <div className="editor-container flex-1 flex flex-col overflow-hidden">
                      <Editor
                        markdown={markdown}
                        onChange={setMarkdownWithHistory}
                        ref={textareaRef}
                        scrollRef={editorScrollRef}
                        onInlineAction={handleInlineAction}
                        inlineLoading={inlineLoading}
                        inlinePreview={inlinePreview}
                        onApplyInline={handleApplyInline}
                        onCancelInline={handleCancelInline}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        historyIndex={historyIndex}
                        historyLength={_history.length}
                      />
                    </div>
                  </ErrorBoundary>

                  {/* Preview - Right */}
                  <ErrorBoundary>
                    <div className="preview-container flex-1 flex flex-col overflow-hidden bg-muted/30">
                      <Preview
                        markdown={markdown}
                        theme={theme}
                        previewMode={previewMode}
                        onPreviewModeChange={setPreviewMode}
                        aiImageStates={aiImageStates}
                        onAIImageStatesChange={setAIImageStates}
                        scrollRef={previewScrollRef}
                      />
                    </div>
                  </ErrorBoundary>
                </div>
              )}

              {/* Mobile Toggle Bar */}
              {isMobile && (
                <MobileToggle
                  activePanel={activeMobilePanel}
                  onToggle={setActiveMobilePanel}
                />
              )}

              {/* Mobile Menu Handler */}
              {isMobile && (
                <MobileMenuHandler
                  mobileMenuOpen={mobileMenuOpen}
                  setMobileMenuOpen={setMobileMenuOpen}
                  mobileTemplatesOpen={mobileTemplatesOpen}
                  setMobileTemplatesOpen={setMobileTemplatesOpen}
                  mobileThemesOpen={mobileThemesOpen}
                  setMobileThemesOpen={setMobileThemesOpen}
                  mobileStatsOpen={mobileStatsOpen}
                  setMobileStatsOpen={setMobileStatsOpen}
                  markdown={markdown}
                  theme={theme}
                  onSelectTemplate={handleSelectTemplate}
                  onSelectTheme={handleSelectTheme}
                  onMarkdownChange={setMarkdownWithHistory}
                />
              )}

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
          </DropdownProvider>
        </ErrorBoundary>
      </ToastProvider>
    </TranslationProvider>
  );
}

export default App;
