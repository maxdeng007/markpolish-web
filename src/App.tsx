import { useState, useEffect, useRef } from "react";
import {
  Moon,
  Sun,
  Download,
  Upload,
  Copy,
  FileText,
  Sparkles,
  Palette,
  Layout,
  Wand2,
  FolderOpen,
  Image,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsListPill, TabsTriggerPill } from "@/components/ui/tabs";
import MarkdownPreview, { AIImageState } from "@/components/MarkdownPreview";
import AIPanel from "@/components/AIPanel";
import TemplatesPanel from "@/components/TemplatesPanel";
import ComponentsPanel from "@/components/ComponentsPanel";
import ThemesPanel from "@/components/ThemesPanel";
import ProjectManager from "@/components/ProjectManager";
import ImageLibraryPanel from "@/components/ImageLibraryPanel";
import AIImagePanel from "@/components/AIImagePanel";
import CompactStats from "@/components/CompactStats";
import { exportToMarkdown, exportToHTML, exportForWeChat } from "@/lib/export";
import { fileOps, type Project } from "@/lib/file-operations";
import { setupDefaultShortcuts, shortcuts } from "@/lib/keyboard-shortcuts";
const defaultMarkdown = `# MarkPolish Studio

A content creation tool for **WeChat** publishing.

---

## Custom Components

:::hero
# Welcome to MarkPolish
Create beautiful content with custom components
:::

:::col-2
### Features
- Rich text editing
- Custom themes
- Export to WeChat
---
### Benefits
- Easy to use
- Professional output
- Save time
:::

:::steps
1. Write your content
2. Choose a theme
3. Export to WeChat
:::

:::timeline
**2024 Q1** Project Launch
---
**2024 Q2** AI Features
---
**2024 Q3** Premium Release
:::

:::card
**Pro Tip:** Combine components for engaging layouts!
:::

---

## Markdown Syntax

### Text Formatting

**Bold text** for emphasis.

*Italic text* for subtle emphasis.

~~Strikethrough~~ for deleted content.

### Lists

**Unordered List:**
- First item
- Second item
- Third item

**Ordered List:**
1. Step one
2. Step two
3. Step three

### Links and Images

[Visit Example](https://example.com)

AI Generated Image:

[IMG: A beautiful sunset over mountains]

### Blockquote

> This is a blockquote.
> Perfect for highlighting important text.

### Code

Inline \`code\` looks like this.

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

---

## Tips

- Switch themes in the Theme tab
- Use AI to enhance content
- Export for WeChat

---

*Start editing to create amazing content!*`;
function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState("wechat-classic");
  const [sidebarTab, setSidebarTab] = useState("ai");
  const [autoSaveEnabled] = useState(true);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [aiImageStates, setAIImageStates] = useState<Record<string, AIImageState>>({});
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save setup
  useEffect(() => {
    if (autoSaveEnabled) {
      fileOps.startAutoSave(
        () => markdown,
        () => theme,
        "Auto-saved Project",
        30000, // 30 seconds
      );
    } else {
      fileOps.stopAutoSave();
    }

    return () => fileOps.stopAutoSave();
  }, [autoSaveEnabled, markdown, theme]);

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
      toggleTheme: () => setIsDark(!isDark),
    });

    return () => {
      // Cleanup shortcuts if needed
    };
  }, [markdown, theme, isDark]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setMarkdown(content);
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    alert("Copied to clipboard!");
  };

  const handleExportHTML = () => {
    exportToHTML(markdown, theme, aiImageStates, "wechat-article.html");
  };

  const handleExportWeChat = () => {
    exportForWeChat(markdown, aiImageStates);
  };

  const handleLoadProject = (project: Project) => {
    setMarkdown(project.content);
    setTheme(project.theme);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">MarkPolish Studio</h1>
            <p className="text-xs text-muted-foreground">
              WeChat Content Creation
            </p>
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
            title="Upload Markdown File"
          >
            <Upload className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            title="Copy to Clipboard"
          >
            <Copy className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => exportToMarkdown(markdown, "content.md")}
            title="Download Markdown"
          >
            <Download className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            onClick={handleExportHTML}
            title="Export for WeChat"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export HTML
          </Button>

          <Button
            variant="default"
            onClick={handleExportWeChat}
            title="Copy WeChat-formatted HTML"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            WeChat
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            title="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Left */}
        <div className="w-80 border-r border-border bg-background overflow-auto">
          <Tabs
            value={sidebarTab}
            onValueChange={setSidebarTab}
            className="h-full flex flex-col"
          >
          <TabsListPill className="w-full justify-start px-2 py-2 gap-1">
              <TabsTriggerPill
                value="ai"
                className="flex-1 flex-col py-2 px-2 gap-1 h-auto"
                title="AI Assistant"
              >
                <Wand2 className="w-4 h-4" />
              </TabsTriggerPill>
              <TabsTriggerPill
                value="projects"
                className="flex-1 flex-col py-2 px-2 gap-1 h-auto"
                title="Projects"
              >
                <FolderOpen className="w-4 h-4" />
              </TabsTriggerPill>
              <TabsTriggerPill
                value="templates"
                className="flex-1 flex-col py-2 px-2 gap-1 h-auto"
                title="Templates"
              >
                <FileText className="w-4 h-4" />
              </TabsTriggerPill>
              <TabsTriggerPill
                value="components"
                className="flex-1 flex-col py-2 px-2 gap-1 h-auto"
                title="Components"
              >
                <Layout className="w-4 h-4" />
              </TabsTriggerPill>
              <TabsTriggerPill
                value="themes"
                className="flex-1 flex-col py-2 px-2 gap-1 h-auto"
                title="Themes"
              >
                <Palette className="w-4 h-4" />
              </TabsTriggerPill>
              <TabsTriggerPill
                value="images"
                className="flex-1 flex-col py-2 px-2 gap-1 h-auto"
                title="Images"
              >
                <Image className="w-4 h-4" />
              </TabsTriggerPill>
            </TabsListPill>

            <div className="flex-1 overflow-auto">
              <TabsContent value="ai" className="m-0">
                <AIPanel markdown={markdown} setMarkdown={setMarkdown} />
              </TabsContent>

              <TabsContent value="projects" className="m-0">
                <ProjectManager
                  currentContent={markdown}
                  currentTheme={theme}
                  onLoadProject={handleLoadProject}
                />
              </TabsContent>

              <TabsContent value="templates" className="m-0">
                <TemplatesPanel setMarkdown={setMarkdown} />
              </TabsContent>

              <TabsContent value="components" className="m-0">
                <ComponentsPanel
                  markdown={markdown}
                  setMarkdown={setMarkdown}
                />
              </TabsContent>

              <TabsContent value="themes" className="m-0">
                <ThemesPanel currentTheme={theme} setTheme={setTheme} />
              </TabsContent>

              <TabsContent value="images" className="m-0">
                <Tabs defaultValue="library" className="h-full flex flex-col">
                  <TabsListPill className="w-full justify-start px-2 py-2 gap-1">
                    <TabsTriggerPill value="library" className="flex-1 py-2">Library</TabsTriggerPill>
                    <TabsTriggerPill value="ai-generate" className="flex-1 py-2">AI Generate</TabsTriggerPill>
                  </TabsListPill>
                  <div className="flex-1 overflow-auto">
                    <TabsContent value="library" className="m-0">
                      <ImageLibraryPanel onInsertImage={handleInsertImage} />
                    </TabsContent>
                    <TabsContent value="ai-generate" className="m-0">
                      <AIImagePanel onInsertImage={handleInsertImage} />
                    </TabsContent>
                  </div>
                </Tabs>
              </TabsContent>

            </div>
          </Tabs>
        </div>

        {/* Editor - Center */}
        <div className="flex-1 flex flex-col border-r border-border pb-11">
          <div className="border-b border-border px-4 py-2 bg-muted/30 flex items-center justify-between">
            <h3 className="text-sm font-medium">Editor</h3>
            <button
              onClick={() => {
                if (markdown && !confirm('Clear all editor content?')) return;
                setMarkdown('');
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>

          <Textarea
            ref={textareaRef}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-1 resize-none rounded-none border-0 focus-visible:ring-0 font-mono text-sm leading-relaxed p-6"
            placeholder="Start writing your WeChat content here..."
          />
        </div>

        {/* Preview - Right */}
        <div className="flex-1 overflow-auto bg-muted/30 pb-11" ref={previewRef}>
          <div className="border-b border-border px-4 py-2 bg-muted/50 flex items-center justify-between">
            <h3 className="text-sm font-medium">Preview</h3>
            <span className="text-xs text-muted-foreground">{theme}</span>
          </div>
          <MarkdownPreview
            markdown={markdown}
            theme={theme}
            aiImageStates={aiImageStates}
            onAIImageStatesChange={setAIImageStates}
          />
        </div>
      </div>

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

      {/* Compact Stats - Sticky at Bottom */}
      <CompactStats markdown={markdown} />
    </div>
  );
}

export default App;
