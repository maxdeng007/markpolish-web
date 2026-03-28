import { useState, useEffect, useCallback } from "react";
import { Megaphone, X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateAmplifyVariants } from "@/lib/mock-data";

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

const MOCK_AMPLIFY: AmplifyResult = {
  variants: [
    {
      platform: "wechat",
      platformName: "WeChat Article",
      content:
        "我发现了一个让工作效率提升3倍的秘密...\n\n很多人每天都在忙，但到头来发现根本没做什么有价值的事。\n\n今天分享3个我亲身实践过的方法：\n\n1. 先做最重要的那件事\n每天早上第一件事，先把最难的任务搞定。后面的事会顺其自然。\n\n2. 设定明确的时间边界\n不要让工作侵占生活，也不要让生活影响工作。设定边界，才能持续。\n\n3. 定期复盘\n每周花30分钟回顾：这周做了什么？哪些做得好？哪些可以改进？\n\n你的效率秘诀是什么？评论区聊聊 👇",
      length: "around 1000 chars",
      emojiCount: "2 emojis",
    },
    {
      platform: "xiaohongshu",
      platformName: "RED (Xiaohongshu)",
      content:
        "3个习惯让我效率翻倍！✨\n\n以前我也是那种天天加班但没产出的人😢\n\n后来试了这3招真的绝了！👇\n\n① 早起先做最难的事 超有用！\n② 设定工作边界 下班不焦虑🙌\n③ 每周复盘 进步看得见✨\n\n#效率提升 #自我成长 #职场干货 #时间管理",
      length: "around 400 chars",
      emojiCount: "9 emojis",
    },
    {
      platform: "zhihu",
      platformName: "Zhihu",
      content:
        "# 提升工作效率的3个核心习惯\n\n职场中，效率决定竞争力。以下是经过实践验证的3个习惯：\n\n**1. 优先级驱动的工作法**\n每天首先完成最重要的任务，而非紧急的任务。这确保核心目标持续推进。\n\n**2. 时间边界的主动管理**\n明确区分工作时间和个人时间，避免相互侵蚀，提高每段时间的质量。\n\n**3. 周期性复盘机制**\n通过周复盘发现问题、总结经验，形成持续改进的闭环。\n\n#职场发展 #效率工具 #个人成长",
      length: "around 600 chars",
      emojiCount: "1 emoji",
    },
    {
      platform: "twitter",
      platformName: "Twitter/X",
      content:
        "3 decisions that 10x'd my productivity:\n\n1. Do the hard thing FIRST\n2. Set strict time boundaries\n3. Weekly reviews\n\nThe power of compound improvement is underrated.",
      length: "under 280 chars",
      emojiCount: "1 emoji",
    },
    {
      platform: "linkedin",
      platformName: "LinkedIn",
      content:
        "3 evidence-based habits that dramatically improved my productivity:\n\n1. Prioritize most important task first\n2. Set clear time boundaries\n3. Weekly reflection and adjustment\n\nThese compound significantly over time. What productivity habits have worked best for you? 👇",
      length: "under 300 chars",
      emojiCount: "0 emojis",
    },
  ],
};

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
    setResult(MOCK_AMPLIFY);
  }, []);

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
            <h2 className="text-lg font-semibold">Content Amplifier</h2>
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
                Creating platform variants...
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
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy for{" "}
                          {
                            result.variants[activeTab].platformName.split(
                              " ",
                            )[0]
                          }
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
