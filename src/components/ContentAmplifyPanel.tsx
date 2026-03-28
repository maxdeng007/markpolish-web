import { createPortal } from "react-dom";
import { useState, useEffect, useRef } from "react";
import { Megaphone, X, Copy, Check } from "lucide-react";

interface ContentAmplifyPanelProps {
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

interface LoadingState {
  text: string;
}

export default function ContentAmplifyPanel({
  isOpen,
  onClose,
  markdown,
}: ContentAmplifyPanelProps) {
  const [result, setResult] = useState<AmplifyResult | null>(null);
  const [loading, setLoading] = useState<LoadingState | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const isAnalyzingRef = useRef(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setResult(null);
      setLoading(null);
      isAnalyzingRef.current = false;
      return;
    }

    if (isAnalyzingRef.current) return;

    isAnalyzingRef.current = true;
    setLoading({ text: "Creating WeChat variant..." });
    setResult(null);

    runAmplifyCheck().finally(() => {
      isAnalyzingRef.current = false;
    });
  }, [isOpen, markdown]);

  const runAmplifyCheck = async () => {
    await new Promise((r) => setTimeout(r, 500));
    setLoading({ text: "Creating RED variant..." });
    await new Promise((r) => setTimeout(r, 400));
    setLoading({ text: "Creating Zhihu variant..." });
    await new Promise((r) => setTimeout(r, 400));
    setLoading({ text: "Creating Twitter variant..." });
    await new Promise((r) => setTimeout(r, 300));
    setLoading({ text: "Creating LinkedIn variant..." });
    await new Promise((r) => setTimeout(r, 300));

    await new Promise((r) => setTimeout(r, 400));

    const mockResult: AmplifyResult = {
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

    setLoading(null);
    setResult(mockResult);
    setActiveTab(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY <= 0) {
      setIsDragging(false);
      return;
    }
    const scrollTop = bodyRef.current?.scrollTop ?? 0;
    if (scrollTop > 0) {
      setIsDragging(false);
      return;
    }
    setIsDragging(true);
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (sheetRef.current) {
      sheetRef.current.style.transform = "";
    }
    if (isDragging && deltaY > 80) {
      onClose();
    }
    setIsDragging(false);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const border = isDark ? "#333" : "#e5e7eb";
  const textColor = isDark ? "#ffffff" : "#111";
  const mutedColor = isDark ? "#888" : "#6b7280";
  const tabBg = isDark ? "#2a2a2a" : "#f5f5f5";
  const activeTabBg = isDark ? "#3a3a3a" : "#e5e7eb";

  const platformColors: Record<string, string> = {
    wechat: "#07c160",
    xiaohongshu: "#ff2442",
    zhihu: "#0084ff",
    twitter: "#1da1f2",
    linkedin: "#0a66c2",
  };

  const platformIcons: Record<string, string> = {
    wechat: "💬",
    xiaohongshu: "📕",
    zhihu: "💬",
    twitter: "🐦",
    linkedin: "💼",
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
    zIndex: 10020,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? "visible" : "hidden",
    pointerEvents: isOpen ? "auto" : "none",
    transition: "opacity 0.3s ease, visibility 0.3s ease",
  };

  const sheetStyle: React.CSSProperties = {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "85vh",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    zIndex: 10021,
    background: bg,
    transform: isOpen ? "translateY(0)" : "translateY(100%)",
    transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 -8px 40px rgba(0, 0, 0, 0.15)",
  };

  if (typeof document === "undefined") return null;

  const panelContent = (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div
        ref={sheetRef}
        style={sheetStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 4px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "40px",
              height: "4px",
              borderRadius: "2px",
              background: border,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 20px 12px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Megaphone size={20} style={{ color: "#06b6d4" }} />
            <span
              style={{ fontSize: "18px", fontWeight: 600, color: textColor }}
            >
              Content Amplifier
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              border: "none",
              borderRadius: "8px",
              background: "transparent",
              cursor: "pointer",
              color: mutedColor,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {loading && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 0",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "4px solid",
                borderColor: border,
                borderTopColor: "#06b6d4",
                animation: "spin 1s linear infinite",
              }}
            />
            <span style={{ fontSize: "14px", color: mutedColor }}>
              {loading.text}
            </span>
          </div>
        )}

        {result && (
          <>
            <div
              style={{
                display: "flex",
                gap: "8px",
                padding: "0 20px 12px",
                overflowX: "auto",
                overscrollBehavior: "contain",
                flexShrink: 0,
              }}
            >
              {result.variants.map((variant, index) => (
                <button
                  key={variant.platform}
                  type="button"
                  onClick={() => setActiveTab(index)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "20px",
                    border: "none",
                    background: activeTab === index ? activeTabBg : tabBg,
                    color: activeTab === index ? textColor : mutedColor,
                    fontSize: "13px",
                    fontWeight: activeTab === index ? 600 : 400,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "14px" }}>
                    {platformIcons[variant.platform]}
                  </span>
                  <span>{variant.platformName.split(" ")[0]}</span>
                </button>
              ))}
            </div>

            <div
              ref={bodyRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "0 20px 24px",
                overscrollBehavior: "contain",
              }}
            >
              {result.variants[activeTab] && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "18px",
                      }}
                    >
                      {platformIcons[result.variants[activeTab].platform]}
                    </span>
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color:
                          platformColors[result.variants[activeTab].platform],
                      }}
                    >
                      {result.variants[activeTab].platformName}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: mutedColor,
                        marginLeft: "auto",
                      }}
                    >
                      {result.variants[activeTab].length} ·{" "}
                      {result.variants[activeTab].emojiCount}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      border: `1px solid ${border}`,
                      borderRadius: "12px",
                      background: bg,
                      marginBottom: "12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "14px",
                        lineHeight: 1.7,
                        color: textColor,
                        whiteSpace: "pre-wrap",
                        margin: 0,
                      }}
                    >
                      {result.variants[activeTab].content}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        result.variants[activeTab].content,
                        activeTab,
                      )
                    }
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "12px",
                      border: "none",
                      borderRadius: "12px",
                      background:
                        platformColors[result.variants[activeTab].platform],
                      color: "#ffffff",
                      fontSize: "15px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {copiedIndex === activeTab ? (
                      <>
                        <Check size={18} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        Copy for{" "}
                        {result.variants[activeTab].platformName.split(" ")[0]}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );

  return createPortal(panelContent, document.body);
}
