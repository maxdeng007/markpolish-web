import { useState, useEffect, useCallback } from "react";
import { Megaphone, X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateAmplifyVariants } from "@/lib/mock-data";
import { useTranslation } from "@/hooks/useTranslation";

interface DesktopContentAmplifyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
}

interface AmplifyResult {
  variants: {
    platform: string;
    platformName: string;
    content: string;
    length: string;
    emojiCount: string;
  }[];
}

const platformColors: Record<string, string> = {
  wechat: "text-green-600 dark:text-green-400",
  xiaohongshu: "text-red-500 dark:text-red-400",
  zhihu: "text-blue-600 dark:text-blue-400",
  twitter: "text-sky-500 dark:text-sky-400",
  linkedin: "text-blue-700 dark:text-blue-300",
};

const platformIcons: Record<string, string> = {
  wechat: "💬",
  xiaohongshu: "📕",
  zhihu: "🔵",
  twitter: "🐦",
  linkedin: "💼",
};

export default function DesktopContentAmplifyPanel({
  isOpen,
  onClose,
  markdown,
}: DesktopContentAmplifyPanelProps) {
  const { t } = useTranslation();
  const [result, setResult] = useState<AmplifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const runAmplify = useCallback(async () => {
    setLoading(true);
    setResult(null);
    setActiveTab(0);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    setResult(generateAmplifyVariants(markdown));
  }, [markdown]);

  useEffect(() => {
    if (isOpen) {
      runAmplify();
    } else {
      setResult(null);
      setLoading(false);
      setActiveTab(0);
    }
  }, [isOpen, markdown, runAmplify]);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[560px] max-h-[85vh] bg-background rounded-xl shadow-2xl shadow-black/30 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Megaphone className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg font-semibold">
              {t("contentAmplify.title")}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-muted border-t-cyan-500 animate-spin" />
              <p className="text-sm text-muted-foreground">
                {t("contentAmplify.creating")}
              </p>
            </div>
          )}

          {result && (
            <>
              <div className="flex gap-2 px-6 pt-4 overflow-x-auto">
                {result.variants.map((variant, index) => (
                  <button
                    key={variant.platform}
                    onClick={() => setActiveTab(index)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <span>{platformIcons[variant.platform]}</span>
                    {variant.platformName.split(" ")[0]}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {result.variants[activeTab] && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">
                        {platformIcons[result.variants[activeTab].platform]}
                      </span>
                      <span
                        className={`text-sm font-semibold ${platformColors[result.variants[activeTab].platform]}`}
                      >
                        {result.variants[activeTab].platformName}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {result.variants[activeTab].length} ·{" "}
                        {result.variants[activeTab].emojiCount}
                      </span>
                    </div>

                    <div className="p-4 border border-border rounded-lg mb-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {result.variants[activeTab].content}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        copyToClipboard(
                          result.variants[activeTab].content,
                          activeTab,
                        )
                      }
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      {copiedIndex === activeTab ? (
                        <>
                          <Check className="w-4 h-4" />
                          {t("contentAmplify.copied")}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          {t("contentAmplify.copyFor").replace(
                            "{platform}",
                            result.variants[activeTab].platformName.split(
                              " ",
                            )[0],
                          )}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
