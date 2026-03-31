import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Palette,
  Grid3X3,
  BarChart3,
  Sparkles,
  Settings,
  ChevronDown,
  Zap,
  FileText as FileTextIcon,
  Globe,
  Target,
  TrendingUp,
  Copy,
  Layout,
  Video,
  AlertCircle,
  Type,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { componentTemplates } from "@/lib/markdown-components";

export type TabletTab =
  | "templates"
  | "themes"
  | "components"
  | "stats"
  | "aiActions"
  | "aiSettings";

interface TabletTabBarProps {
  onOpenTemplates: () => void;
  onOpenThemes: () => void;
  onOpenStats: () => void;
  onOpenAISettings: () => void;
  onAIAction: (action: string) => void;
  onCopyToClipboard: (text: string, label: string) => void;
}

export default function TabletTabBar({
  onOpenTemplates,
  onOpenThemes,
  onOpenStats,
  onOpenAISettings,
  onAIAction,
  onCopyToClipboard,
}: TabletTabBarProps) {
  const { t } = useTranslation();
  const [aiExpanded, setAiExpanded] = useState(false);
  const [componentsExpanded, setComponentsExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setAiExpanded(false);
        setComponentsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs: { id: TabletTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "templates",
      label: t("mobileMenu.templates"),
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "themes",
      label: t("mobileMenu.themes"),
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: "components",
      label: t("mobileMenu.components"),
      icon: <Grid3X3 className="w-4 h-4" />,
    },
    {
      id: "stats",
      label: t("mobileMenu.stats"),
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "aiActions",
      label: t("mobileMenu.aiActions"),
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: "aiSettings",
      label: t("mobileMenu.aiSettings"),
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const aiActions = [
    {
      id: "expand",
      label: t("ai.expandContent"),
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: "polish",
      label: t("ai.polishWithContext"),
      icon: <FileTextIcon className="w-4 h-4" />,
    },
    {
      id: "summarize",
      label: t("ai.summarize"),
      icon: <Copy className="w-4 h-4" />,
    },
    {
      id: "translate",
      label: t("ai.translate"),
      icon: <Globe className="w-4 h-4" />,
    },
    { id: "tone", label: t("ai.tone"), icon: <Target className="w-4 h-4" /> },
    {
      id: "viralScore",
      label: t("viralScore.title"),
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: "amplify",
      label: t("contentAmplify.title"),
      icon: <TrendingUp className="w-4 h-4" />,
    },
  ];

  const componentItems = [
    {
      id: "hero",
      label: t("mobileMenu.hero"),
      icon: <Layout className="w-4 h-4" />,
      template: componentTemplates.hero,
    },
    {
      id: "col-2",
      label: t("mobileMenu.col2"),
      icon: <Layout className="w-4 h-4" />,
      template: componentTemplates["col-2"],
    },
    {
      id: "col-3",
      label: t("mobileMenu.col3"),
      icon: <Layout className="w-4 h-4" />,
      template: componentTemplates["col-3"],
    },
    {
      id: "steps",
      label: t("mobileMenu.steps"),
      icon: <Layout className="w-4 h-4" />,
      template: componentTemplates.steps,
    },
    {
      id: "timeline",
      label: t("mobileMenu.timeline"),
      icon: <Layout className="w-4 h-4" />,
      template: componentTemplates.timeline,
    },
    {
      id: "card",
      label: t("mobileMenu.card"),
      icon: <Layout className="w-4 h-4" />,
      template: componentTemplates.card,
    },
    {
      id: "video",
      label: t("mobileMenu.video"),
      icon: <Video className="w-4 h-4" />,
      template: '\n\n<video src="" controls></video>\n\n',
    },
    {
      id: "callout",
      label: t("mobileMenu.callout"),
      icon: <AlertCircle className="w-4 h-4" />,
      template: componentTemplates.callout,
    },
    {
      id: "quote",
      label: t("mobileMenu.quote"),
      icon: <Type className="w-4 h-4" />,
      template: componentTemplates.quote,
    },
  ];

  const handleTabClick = (tab: TabletTab) => {
    if (tab === "templates") {
      setAiExpanded(false);
      setComponentsExpanded(false);
      onOpenTemplates();
    } else if (tab === "themes") {
      setAiExpanded(false);
      setComponentsExpanded(false);
      onOpenThemes();
    } else if (tab === "components") {
      setAiExpanded(false);
      setComponentsExpanded(!componentsExpanded);
    } else if (tab === "stats") {
      setAiExpanded(false);
      setComponentsExpanded(false);
      onOpenStats();
    } else if (tab === "aiSettings") {
      setAiExpanded(false);
      setComponentsExpanded(false);
      onOpenAISettings();
    } else if (tab === "aiActions") {
      setComponentsExpanded(false);
      setAiExpanded(!aiExpanded);
    }
  };

  const handleAIAction = (actionId: string) => {
    setAiExpanded(false);
    onAIAction(actionId);
  };

  const handleComponentClick = (component: (typeof componentItems)[0]) => {
    setComponentsExpanded(false);
    if (component.template) {
      onCopyToClipboard(component.template, component.label);
    }
  };

  return (
    <div className="tablet-tab-bar" ref={dropdownRef}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className="tablet-tab-btn"
          onClick={() => handleTabClick(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {(tab.id === "aiActions" || tab.id === "components") && (
            <ChevronDown
              className={`w-3 h-3 ml-1 transition-transform ${tab.id === "aiActions" ? (aiExpanded ? "rotate-180" : "") : componentsExpanded ? "rotate-180" : ""}`}
            />
          )}
        </button>
      ))}
      {aiExpanded && (
        <div className="tablet-ai-dropdown">
          {aiActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className="tablet-ai-action-btn"
              onClick={() => handleAIAction(action.id)}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
      {componentsExpanded && (
        <div className="tablet-ai-dropdown">
          {componentItems.map((component) => (
            <button
              key={component.id}
              type="button"
              className="tablet-ai-action-btn"
              onClick={() => handleComponentClick(component)}
            >
              {component.icon}
              <span>{component.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
