import { createPortal } from "react-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { TrendingUp, X, Lightbulb } from "lucide-react";
import { generateViralScores, smartReplace } from "@/lib/mock-data";
import { useTranslation } from "@/hooks/useTranslation";

interface ViralScorePanelProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
  onApplySuggestion: (improvedContent: string) => void;
}

interface ViralResult {
  totalScore: number;
  platformScores: {
    wechat: number;
    xiaohongshu: number;
    twitter: number;
    linkedin: number;
  };
  breakdown: {
    hook: { score: number; verdict: string; reason: string };
    structure: { score: number; verdict: string; reason: string };
    emotion: { score: number; verdict: string; reason: string };
    clarity: { score: number; verdict: string; reason: string };
  };
  suggestions: {
    element: string;
    issue: string;
    fix: string;
    example: string;
  }[];
}

interface LoadingState {
  score: number;
  text: string;
}

export default function ViralScorePanel({
  isOpen,
  onClose,
  markdown,
  onApplySuggestion,
}: ViralScorePanelProps) {
  const { t } = useTranslation();
  const [result, setResult] = useState<ViralResult | null>(null);
  const [loading, setLoading] = useState<LoadingState | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(
    new Set(),
  );
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

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

  const runViralCheck = useCallback(async () => {
    setLoading({ score: 0, text: "Analyzing hook strength..." });
    setResult(null);
    setDismissedSuggestions(new Set());

    const stages = [
      { score: 15, text: "Analyzing hook strength..." },
      { score: 35, text: "Checking structure..." },
      { score: 60, text: "Measuring emotional triggers..." },
      { score: 80, text: "Evaluating clarity & CTA..." },
      { score: 95, text: "Finalizing analysis..." },
    ];

    for (const stage of stages) {
      await new Promise((r) => setTimeout(r, 400));
      setLoading({ score: stage.score, text: stage.text });
    }

    await new Promise((r) => setTimeout(r, 600));

    setLoading(null);
    setResult(generateViralScores(markdown));
  }, [markdown]);

  useEffect(() => {
    if (!isOpen) {
      setResult(null);
      setLoading(null);
      setDismissedSuggestions(new Set());
      return;
    }
    runViralCheck();
  }, [isOpen, markdown, runViralCheck]);

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

  const getScoreColor = (score: number) => {
    if (score >= 70) return isDark ? "#4ade80" : "#16a34a";
    if (score >= 50) return isDark ? "#fbbf24" : "#d97706";
    return isDark ? "#f87171" : "#dc2626";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return isDark ? "rgba(74,222,128,0.15)" : "#f0fdf4";
    if (score >= 50) return isDark ? "rgba(251,191,36,0.15)" : "#fffbeb";
    return isDark ? "rgba(248,113,113,0.15)" : "#fef2f2";
  };

  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const border = isDark ? "#333" : "#e5e7eb";
  const textColor = isDark ? "#ffffff" : "#111";
  const mutedColor = isDark ? "#888" : "#6b7280";

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
            <TrendingUp size={20} style={{ color: "#f59e0b" }} />
            <span
              style={{ fontSize: "18px", fontWeight: 600, color: textColor }}
            >
              {t("viralScore.title")}
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

        <div
          ref={bodyRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 20px 24px",
            overscrollBehavior: "contain",
          }}
        >
          {loading && (
            <div
              style={{
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
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  border: "6px solid",
                  borderColor: border,
                  borderTopColor: "#f59e0b",
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
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "16px 0 24px",
                }}
              >
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    background: getScoreBg(result.totalScore),
                    border: `4px solid ${getScoreColor(result.totalScore)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "36px",
                      fontWeight: 800,
                      color: getScoreColor(result.totalScore),
                    }}
                  >
                    {result.totalScore}
                  </span>
                </div>
                <span style={{ fontSize: "14px", color: mutedColor }}>
                  {result.totalScore >= 70
                    ? t("viralScore.viralPotential.strong")
                    : result.totalScore >= 50
                      ? t("viralScore.viralPotential.decent")
                      : t("viralScore.viralPotential.low")}
                </span>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: textColor,
                    marginBottom: "12px",
                  }}
                >
                  {t("viralScore.platformScores")}
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {Object.entries(result.platformScores).map(
                    ([platform, score]) => (
                      <div key={platform}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ fontSize: "13px", color: mutedColor }}>
                            {t(`viralScore.platform.${platform}`)}
                          </span>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: getScoreColor(score),
                            }}
                          >
                            {score}
                          </span>
                        </div>
                        <div
                          style={{
                            height: "4px",
                            background: border,
                            borderRadius: "2px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${score}%`,
                              background: getScoreColor(score),
                              borderRadius: "2px",
                              transition: "width 0.5s ease",
                            }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: textColor,
                    marginBottom: "12px",
                  }}
                >
                  {t("viralScore.analysis")}
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {Object.entries(result.breakdown).map(([key, item]) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 12px",
                        background: getScoreBg(item.score),
                        borderRadius: "8px",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 500,
                            color: textColor,
                            textTransform: "capitalize",
                          }}
                        >
                          {key === "hook"
                            ? `🎣 ${t("viralScore.hook")}`
                            : key === "structure"
                              ? `📝 ${t("viralScore.structure")}`
                              : key === "emotion"
                                ? `💡 ${t("viralScore.emotion")}`
                                : `🎯 ${t("viralScore.clarity")}`}
                        </span>
                        <p
                          style={{
                            fontSize: "12px",
                            color: mutedColor,
                            margin: 0,
                          }}
                        >
                          {item.reason}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: getScoreColor(item.score),
                        }}
                      >
                        {item.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: textColor,
                    marginBottom: "12px",
                  }}
                >
                  💡 {t("viralScore.suggestions")}
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {result.suggestions.map((suggestion, index) =>
                    dismissedSuggestions.has(index) ? null : (
                      <div
                        key={index}
                        style={{
                          padding: "12px",
                          border: `1px solid ${border}`,
                          borderRadius: "12px",
                          background: bg,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px",
                          }}
                        >
                          <Lightbulb
                            size={16}
                            style={{
                              color: "#f59e0b",
                              marginTop: "2px",
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                fontSize: "13px",
                                fontWeight: 500,
                                color: textColor,
                                margin: "0 0 4px 0",
                              }}
                            >
                              {suggestion.issue}
                            </p>
                            <p
                              style={{
                                fontSize: "12px",
                                color: mutedColor,
                                margin: "0 0 8px 0",
                              }}
                            >
                              {suggestion.fix}
                            </p>
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#3b82f6",
                                fontStyle: "italic",
                                margin: 0,
                              }}
                            >
                              "{suggestion.example}"
                            </p>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginTop: "10px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const newDismissed = new Set(
                                dismissedSuggestions,
                              );
                              newDismissed.add(index);
                              setDismissedSuggestions(newDismissed);
                            }}
                            style={{
                              flex: 1,
                              padding: "8px",
                              border: `1px solid ${border}`,
                              borderRadius: "8px",
                              background: "transparent",
                              color: mutedColor,
                              fontSize: "13px",
                              cursor: "pointer",
                            }}
                          >
                            {t("viralScore.dismiss")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onApplySuggestion(
                                smartReplace(
                                  markdown,
                                  suggestion.element,
                                  suggestion.example,
                                ),
                              );
                              const newDismissed = new Set(
                                dismissedSuggestions,
                              );
                              newDismissed.add(index);
                              setDismissedSuggestions(newDismissed);
                            }}
                            style={{
                              flex: 1,
                              padding: "8px",
                              border: "none",
                              borderRadius: "8px",
                              background: "#3b82f6",
                              color: "#ffffff",
                              fontSize: "13px",
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            {t("viralScore.apply")}
                          </button>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(panelContent, document.body);
}
