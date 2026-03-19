import {
  Wand2,
  FolderOpen,
  FileText,
  Layout,
  Palette,
  Image,
  Settings,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsListPill,
  TabsTriggerPill,
} from "@/components/ui/tabs";
import AIPanel from "@/components/AIPanel";
import TemplatesPanel from "@/components/TemplatesPanel";
import ComponentsPanel from "@/components/ComponentsPanel";
import ThemesPanel from "@/components/ThemesPanel";
import ProjectManager from "@/components/ProjectManager";
import ImageLibraryPanel from "@/components/ImageLibraryPanel";
import AIImagePanel from "@/components/AIImagePanel";
import SettingsPanel from "@/components/SettingsPanel";
import { type Project } from "@/lib/file-operations";
import { useTranslation } from "@/hooks/useTranslation";

export type SidebarTab =
  | "ai"
  | "projects"
  | "templates"
  | "components"
  | "themes"
  | "images"
  | "settings";

interface SidebarProps {
  markdown: string;
  theme: string;
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onMarkdownChange: (markdown: string) => void;
  onThemeChange: (theme: string) => void;
  onLoadProject: (project: Project) => void;
  onInsertImage: (url: string, filename: string) => void;
  onOpenSettings?: () => void;
  getCursorPosition?: () => number | null;
}

export default function Sidebar({
  markdown,
  theme,
  activeTab,
  onTabChange,
  onMarkdownChange,
  onThemeChange,
  onLoadProject,
  onInsertImage,
  onOpenSettings,
  getCursorPosition,
}: SidebarProps) {
  const { t } = useTranslation();

  return (
    <div className="w-80 border-r border-border bg-background overflow-hidden flex flex-col pb-14">
      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => onTabChange(value as SidebarTab)}
        className="flex flex-col h-full"
      >
        <div className="border-b border-border px-2 py-2 bg-background flex-shrink-0">
          <TabsListPill className="w-full justify-start gap-0.5">
            <TabButton
              value="ai"
              icon={<Wand2 className="w-4 h-4" />}
              label={t("sidebar.ai")}
              isActive={activeTab === "ai"}
            />
            <TabButton
              value="projects"
              icon={<FolderOpen className="w-4 h-4" />}
              label={t("sidebar.projects")}
              isActive={activeTab === "projects"}
            />
            <TabButton
              value="templates"
              icon={<FileText className="w-4 h-4" />}
              label={t("sidebar.templates")}
              isActive={activeTab === "templates"}
            />
            <TabButton
              value="components"
              icon={<Layout className="w-4 h-4" />}
              label={t("sidebar.components")}
              isActive={activeTab === "components"}
            />
            <TabButton
              value="themes"
              icon={<Palette className="w-4 h-4" />}
              label={t("sidebar.themes")}
              isActive={activeTab === "themes"}
            />
            <TabButton
              value="images"
              icon={<Image className="w-4 h-4" />}
              label={t("sidebar.images")}
              isActive={activeTab === "images"}
            />
            <TabButton
              value="settings"
              icon={<Settings className="w-4 h-4" />}
              label={t("sidebar.settings")}
              isActive={activeTab === "settings"}
            />
          </TabsListPill>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <TabsContent value="ai" className="m-0 h-full">
            <AIPanel
              markdown={markdown}
              setMarkdown={onMarkdownChange}
              onOpenSettings={onOpenSettings}
            />
          </TabsContent>

          <TabsContent value="projects" className="m-0 h-full">
            <ProjectManager
              currentContent={markdown}
              currentTheme={theme}
              onLoadProject={onLoadProject}
            />
          </TabsContent>

          <TabsContent value="templates" className="m-0 h-full">
            <TemplatesPanel setMarkdown={onMarkdownChange} />
          </TabsContent>

          <TabsContent value="components" className="m-0 h-full">
            <ComponentsPanel
              markdown={markdown}
              setMarkdown={onMarkdownChange}
              getCursorPosition={getCursorPosition}
            />
          </TabsContent>

          <TabsContent value="themes" className="m-0 h-full">
            <ThemesPanel currentTheme={theme} setTheme={onThemeChange} />
          </TabsContent>

          <TabsContent value="images" className="m-0 h-full">
            <Tabs defaultValue="library" className="h-full flex flex-col">
              <div className="border-b border-border px-3 py-2">
                <TabsListPill className="w-full gap-1">
                  <TabsTriggerPill
                    value="library"
                    className="flex-1 text-xs py-1.5"
                  >
                    {t("images.library")}
                  </TabsTriggerPill>
                  <TabsTriggerPill
                    value="ai-generate"
                    className="flex-1 text-xs py-1.5"
                  >
                    {t("ai.generate")}
                  </TabsTriggerPill>
                </TabsListPill>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <TabsContent value="library" className="m-0">
                  <ImageLibraryPanel onInsertImage={onInsertImage} />
                </TabsContent>
                <TabsContent value="ai-generate" className="m-0">
                  <AIImagePanel onInsertImage={onInsertImage} />
                </TabsContent>
              </div>
            </Tabs>
          </TabsContent>

          <TabsContent value="settings" className="m-0 h-full">
            <SettingsPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Reusable tab button component for consistent styling
function TabButton({
  value,
  icon,
  label,
  isActive,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}) {
  return (
    <TabsTriggerPill
      value={value}
      className={`
        flex-col py-2 px-2 gap-1 h-auto min-w-[40px] flex-1
        transition-all duration-200 ease-out
        ${
          isActive
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }
      `}
      title={label}
    >
      <span className="transition-transform duration-200">{icon}</span>
    </TabsTriggerPill>
  );
}
