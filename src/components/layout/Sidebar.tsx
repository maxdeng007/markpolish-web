import { useState } from "react";
import {
  Wand2,
  FolderOpen,
  FileText,
  Layout,
  Palette,
  Image,
  Settings,
} from "lucide-react";
import { Tabs, TabsContent, TabsListPill, TabsTriggerPill } from "@/components/ui/tabs";
import AIPanel from "@/components/AIPanel";
import TemplatesPanel from "@/components/TemplatesPanel";
import ComponentsPanel from "@/components/ComponentsPanel";
import ThemesPanel from "@/components/ThemesPanel";
import ProjectManager from "@/components/ProjectManager";
import ImageLibraryPanel from "@/components/ImageLibraryPanel";
import AIImagePanel from "@/components/AIImagePanel";
import SettingsPanel from "@/components/SettingsPanel";
import { type Project } from "@/lib/file-operations";

export type SidebarTab = "ai" | "projects" | "templates" | "components" | "themes" | "images" | "settings";

interface SidebarProps {
  markdown: string;
  theme: string;
  onMarkdownChange: (markdown: string) => void;
  onThemeChange: (theme: string) => void;
  onLoadProject: (project: Project) => void;
  onInsertImage: (url: string, filename: string) => void;
}

export default function Sidebar({
  markdown,
  theme,
  onMarkdownChange,
  onThemeChange,
  onLoadProject,
  onInsertImage,
}: SidebarProps) {
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("ai");

  return (
    <div className="w-80 border-r border-border bg-background overflow-auto">
      <Tabs
        value={sidebarTab}
        onValueChange={(value) => setSidebarTab(value as SidebarTab)}
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
          <TabsTriggerPill
            value="settings"
            className="flex-1 flex-col py-2 px-2 gap-1 h-auto"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </TabsTriggerPill>
        </TabsListPill>

        <div className="flex-1 overflow-auto">
          <TabsContent value="ai" className="m-0">
            <AIPanel markdown={markdown} setMarkdown={onMarkdownChange} />
          </TabsContent>

          <TabsContent value="projects" className="m-0">
            <ProjectManager
              currentContent={markdown}
              currentTheme={theme}
              onLoadProject={onLoadProject}
            />
          </TabsContent>

          <TabsContent value="templates" className="m-0">
            <TemplatesPanel setMarkdown={onMarkdownChange} />
          </TabsContent>

          <TabsContent value="components" className="m-0">
            <ComponentsPanel
              markdown={markdown}
              setMarkdown={onMarkdownChange}
            />
          </TabsContent>

          <TabsContent value="themes" className="m-0">
            <ThemesPanel currentTheme={theme} setTheme={onThemeChange} />
          </TabsContent>

          <TabsContent value="images" className="m-0">
            <Tabs defaultValue="library" className="h-full flex flex-col">
              <TabsListPill className="w-full justify-start px-2 py-2 gap-1">
                <TabsTriggerPill value="library" className="flex-1 py-2">Library</TabsTriggerPill>
                <TabsTriggerPill value="ai-generate" className="flex-1 py-2">AI Generate</TabsTriggerPill>
              </TabsListPill>
              <div className="flex-1 overflow-auto">
                <TabsContent value="library" className="m-0">
                  <ImageLibraryPanel onInsertImage={onInsertImage} />
                </TabsContent>
                <TabsContent value="ai-generate" className="m-0">
                  <AIImagePanel onInsertImage={onInsertImage} />
                </TabsContent>
              </div>
            </Tabs>
          </TabsContent>

          <TabsContent value="settings" className="m-0">
            <SettingsPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
