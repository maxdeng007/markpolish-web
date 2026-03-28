import { useState, useEffect, useRef } from "react";
import { X, TrendingUp, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DesktopViralScorePanelProps {
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

export default function DesktopViralScorePanel({
  isOpen,
  onClose,
  markdown,
  onApplySuggestion,
}: DesktopViralScorePanelProps) {
  const [result, setResult] = useState<ViralResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(
    new Set(),
  );
  const prevMarkdownRef = useRef<string>("");
  const isAnalyzingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setResult(null);
      setLoading(false);
      setDismissedSuggestions(new Set());
      prevMarkdownRef.current = "";
      isAnalyzingRef.current = false;
      return;
    }

    if (isAnalyzingRef.current) return;

    isAnalyzingRef.current = true;
    setLoading(true);
    setResult(null);
    setDismissedSuggestions(new Set());

    runCheck().finally(() => {
      isAnalyzingRef.current = false;
    });
  }, [isOpen, markdown]);

  const runCheck = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    const mock: ViralResult = {
      totalScore: 68,
      platformScores: {
        wechat: 72,
        xiaohongshu: 65,
        twitter: 70,
        linkedin: 61,
      },
      breakdown: {
        hook: {
          score: 18,
          verdict: "strong",
          reason: "Opens with a specific number",
        },
        structure: {
          score: 15,
          verdict: "good",
          reason: "Good paragraph length but needs more visual breaks",
        },
        emotion: {
          score: 16,
          verdict: "moderate",
          reason: "Contains emotional language but could be stronger",
        },
        clarity: {
          score: 19,
          verdict: "strong",
          reason: "Clear message with good call-to-action",
        },
      },
      suggestions: [
        {
          element: "hook",
          issue: "Opening is generic",
          fix: "Start with a surprising statistic or bold claim",
          example:
            "Instead of 'Tips for success', try '3 decisions that changed my career'",
        },
        {
          element: "structure",
          issue: "Paragraphs are too long",
          fix: "Break into 3-4 sentence chunks for mobile",
          example: "Each paragraph should be scannable within 5 seconds",
        },
        {
          element: "emotion",
          issue: "Lacks emotional trigger",
          fix: "Add a personal story or surprising fact",
          example: "Include a moment of vulnerability",
        },
      ],
    };
    setLoading(false);
    setResult(mock);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-green-50 dark:bg-green-950/30";
    if (score >= 50) return "bg-yellow-50 dark:bg-yellow-950/30";
    return "bg-red-50 dark:bg-red-950/30";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[560px] max-h-[85vh] bg-background rounded-xl shadow-2xl shadow-black/30 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Viral Score</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-muted border-t-amber-500 animate-spin" />
              <p className="text-sm text-muted-foreground">
                Analyzing content...
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="flex flex-col items-center py-4">
                <div
                  className={`w-24 h-24 rounded-full border-4 flex items-center justify-center mb-3 ${getScoreBg(result.totalScore)}`}
                  style={{
                    borderColor:
                      result.totalScore >= 70
                        ? "#22c55e"
                        : result.totalScore >= 50
                          ? "#eab308"
                          : "#ef4444",
                  }}
                >
                  <span
                    className={`text-4xl font-extrabold ${getScoreColor(result.totalScore)}`}
                  >
                    {result.totalScore}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  {result.totalScore >= 70
                    ? "Strong viral potential!"
                    : result.totalScore >= 50
                      ? "Decent score — a few tweaks could help"
                      : "Room for improvement"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Platform Scores</h3>
                <div className="space-y-3">
                  {Object.entries(result.platformScores).map(
                    ([platform, score]) => (
                      <div key={platform}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-muted-foreground capitalize">
                            {platform === "xiaohongshu" ? "RED" : platform}
                          </span>
                          <span
                            className={`text-sm font-bold ${getScoreColor(score)}`}
                          >
                            {score}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              score >= 70
                                ? "bg-green-500"
                                : score >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Analysis</h3>
                <div className="space-y-2">
                  {Object.entries(result.breakdown).map(([key, item]) => (
                    <div
                      key={key}
                      className={`flex items-center justify-between p-3 rounded-lg ${getScoreBg(item.score)}`}
                    >
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {key === "hook"
                            ? "🎣 Hook"
                            : key === "structure"
                              ? "📝 Structure"
                              : key === "emotion"
                                ? "💡 Emotion"
                                : "🎯 Clarity"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.reason}
                        </p>
                      </div>
                      <span
                        className={`text-lg font-bold ${getScoreColor(item.score)}`}
                      >
                        {item.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Suggestions</h3>
                <div className="space-y-3">
                  {result.suggestions.map((s, i) =>
                    dismissedSuggestions.has(i) ? null : (
                      <div
                        key={i}
                        className="p-4 border border-border rounded-lg"
                      >
                        <div className="flex gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{s.issue}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {s.fix}
                            </p>
                            <p className="text-xs text-blue-500 mt-1 italic">
                              "{s.example}"
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              const next = new Set(dismissedSuggestions);
                              next.add(i);
                              setDismissedSuggestions(next);
                            }}
                            className="flex-1 px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => {
                              onApplySuggestion(s.example);
                              const next = new Set(dismissedSuggestions);
                              next.add(i);
                              setDismissedSuggestions(next);
                            }}
                            className="flex-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
