import { useState, useEffect, useRef, Suspense, lazy } from "react";
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
--Tab1--
**Introduction**

MarkPolish provides rich Markdown editing features.

--Tab2--
**User Guide**

1. Write content
2. Select theme
3. Export and publish

--Tab3--
**FAQ**

Q: How to export to Wecom?
A: Click the "Export" button.
:::

### Accordion Component

:::accordion
--First Question: How to get started?--
Simply type Markdown content in the left editor, and the right side will show a real-time preview.

--Second Question: What themes are supported?--
Currently 14 themes are supported, including 8 light themes and 6 dark themes.

--Third Question: How to export?--
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

function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState("wechat-classic");
  const [autoSaveEnabled] = useState(true);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [aiImageStates, setAIImageStates] = useState<Record<string, {
    description: string;
    ratio: string;
    imageUrl: string | null;
    status: "idle" | "generating" | "done" | "error";
  }>>({});
  const [previewMode, setPreviewMode] = useState<"full" | "wecom">("full");
  const [showPDFExport, setShowPDFExport] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("ai");
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
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
          onToggleShortcutsHelp={() => setShowShortcutsHelp(!showShortcutsHelp)}
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
            />
          </ErrorBoundary>

          {/* Editor - Center */}
          <ErrorBoundary>
            <Editor
              markdown={markdown}
              onChange={setMarkdown}
              ref={textareaRef}
            />
          </ErrorBoundary>

          {/* Preview - Right */}
          <div className="flex-1 flex flex-col overflow-hidden" ref={previewRef}>
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
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowShortcutsHelp(false)}
          >
            <div
              className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
              <div className="space-y-2 text-sm">
                {shortcuts.getAll().map((shortcut, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                      {shortcuts.getShortcutString(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setShowShortcutsHelp(false)}
                className="w-full mt-4"
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Lazy loaded PDF Export Modal */}
        {showPDFExport && (
          <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">Loading...</div>}>
            <PDFExportModal
              markdown={markdown}
              theme={theme}
              aiImageStates={aiImageStates}
              onClose={() => setShowPDFExport(false)}
            />
          </Suspense>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
