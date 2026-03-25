import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getDocumentStats,
  analyzeReadability,
  analyzeWeChatSpecifics,
  checkGrammarAndStyle,
  type DocumentStats,
  type StyleIssue,
  type EnhancedReadability,
  type WeChatAnalysis,
} from "@/lib/polish-engine";
import {
  BarChart3,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  MessageSquare,
  TrendingUp,
  Type,
  Zap,
  Eye,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface StatsPanelProps {
  markdown: string;
}

function ProgressBar({
  value,
  max = 100,
  color = "bg-primary",
}: {
  value: number;
  max?: number;
  color?: string;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function ScoreGauge({
  score,
  label,
  interpretation,
}: {
  score: number;
  label: string;
  interpretation: string;
}) {
  const getColor = (s: number) => {
    if (s >= 70) return "text-green-600 dark:text-green-400";
    if (s >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-semibold ${getColor(score)}`}>
          {score.toFixed(0)}
        </span>
      </div>
      <ProgressBar
        value={score}
        color={
          score >= 70
            ? "bg-green-500"
            : score >= 50
              ? "bg-yellow-500"
              : "bg-red-500"
        }
      />
      <div className="text-xs text-muted-foreground">{interpretation}</div>
    </div>
  );
}

export default function StatsPanel({ markdown }: StatsPanelProps) {
  const { t } = useTranslation();
  const [showStyleIssues, setShowStyleIssues] = useState(false);
  const [styleIssues, setStyleIssues] = useState<StyleIssue[]>([]);

  const stats = getDocumentStats(markdown);
  const readability = analyzeReadability(markdown) as EnhancedReadability;
  const wechat = analyzeWeChatSpecifics(markdown) as WeChatAnalysis;

  const handleCheckStyle = () => {
    const issues = checkGrammarAndStyle(markdown);
    setStyleIssues(issues);
    setShowStyleIssues(true);
  };

  const getStatusColor = (status: string) => {
    if (status === "good") return "text-green-600";
    if (status === "warning") return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (status: string) => {
    if (status === "good")
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === "warning")
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          {t("stats.title")}
        </h3>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("stats.characters")}:
              </span>
              <span className="font-mono">
                {stats.characters.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("stats.charactersNoSpaces")}:
              </span>
              <span className="font-mono">
                {stats.charactersNoSpaces.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("stats.words")}:</span>
              <span className="font-mono font-semibold">
                {stats.words.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("stats.sentences")}:
              </span>
              <span className="font-mono">
                {stats.sentences.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("stats.paragraphs")}:
              </span>
              <span className="font-mono">
                {stats.paragraphs.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100">
              <Clock className="w-4 h-4" />
              {t("stats.timeEstimates")}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("stats.readingTime")}:
              </span>
              <span className="font-mono">{stats.readingTime} min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("stats.speakingTime")}:
              </span>
              <span className="font-mono">{stats.speakingTime} min</span>
            </div>
            <ProgressBar
              value={stats.readingTime}
              max={10}
              color="bg-blue-500"
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <FileText className="w-4 h-4" />
              {t("stats.contentElements")}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("stats.h1")}:</span>
                <span className="font-mono">{stats.headings.h1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("stats.h2")}:</span>
                <span className="font-mono">{stats.headings.h2}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("stats.h3")}:</span>
                <span className="font-mono">{stats.headings.h3}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("stats.h4")}:</span>
                <span className="font-mono">{stats.headings.h4}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("stats.lists")}:
                </span>
                <span className="font-mono">{stats.lists}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("stats.code")}:
                </span>
                <span className="font-mono">{stats.codeBlocks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("stats.links")}:
                </span>
                <span className="font-mono">{stats.links}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("stats.images")}:
                </span>
                <span className="font-mono">{stats.images}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-lg p-3 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-purple-900 dark:text-purple-100">
              <Sparkles className="w-4 h-4" />
              {t("stats.readabilityScore")}
            </div>
            <ScoreGauge
              score={readability.fleschScore}
              label={t("stats.fleschScore")}
              interpretation={t(readability.interpretation)}
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {t("stats.gradeLevel")}:
              </span>
              <span className="font-mono">
                {readability.gradeLevel.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {t("stats.avgWordsSentence")}:
              </span>
              <span className="font-mono">
                {readability.avgWordsPerSentence.toFixed(1)}
              </span>
            </div>
            {readability.hasChinese && (
              <div className="border-t border-purple-200 dark:border-purple-800 pt-3 space-y-2">
                <div className="text-xs font-medium text-purple-800 dark:text-purple-200">
                  {t("stats.chineseReadability")}
                </div>
                <ScoreGauge
                  score={readability.chineseScore}
                  label={t("stats.chineseScore")}
                  interpretation={t(readability.chineseInterpretation)}
                />
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-lg p-3 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-900 dark:text-orange-100">
              <TrendingUp className="w-4 h-4" />
              {t("stats.wechatOptimization")}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(wechat.titleStatus)}
                  <span className="text-xs">
                    {t("stats.title")} ({wechat.titleLength}
                    {t("stats.chars")})
                  </span>
                </div>
                <span
                  className={`text-xs ${getStatusColor(wechat.titleStatus)}`}
                >
                  {wechat.titleLength <= 30
                    ? "✓"
                    : wechat.titleLength <= 64
                      ? "⚠"
                      : "✗"}
                </span>
              </div>
              <ProgressBar
                value={Math.min(100, (wechat.titleLength / 64) * 100)}
                max={100}
                color="bg-orange-500"
              />
              <div className="text-xs text-muted-foreground">
                {t(wechat.titleSuggestion)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(wechat.titleStatus)}
                  <span className="text-xs">
                    {t("stats.wechatTitle")} ({wechat.titleLength}
                    {t("stats.chars")})
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {t(wechat.coverSuggestion)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                <div className="flex items-center gap-1 text-xs">
                  <Type className="w-3 h-3" />
                  <span className="text-muted-foreground">
                    {t("stats.emojis")}:
                  </span>
                  <span className="font-semibold">{wechat.emojiCount}</span>
                </div>
              </div>
              <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                <div className="flex items-center gap-1 text-xs">
                  <MessageSquare className="w-3 h-3" />
                  <span className="text-muted-foreground">
                    {t("stats.cta")}:
                  </span>
                  <span className="font-semibold">{wechat.ctaCount}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium">
                {t("stats.visualBalance")}
              </div>
              <ProgressBar value={wechat.visualBalance} color="bg-orange-500" />
              <div className="text-xs text-muted-foreground">
                {wechat.visualBalance >= 80
                  ? t("stats.visualGood")
                  : wechat.visualBalance >= 50
                    ? t("stats.visualMedium")
                    : t("stats.visualLow")}
              </div>
            </div>
          </div>

          {wechat.keywordDensity.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Zap className="w-4 h-4" />
                {t("stats.keywordDensity")}
              </div>
              <div className="space-y-1">
                {wechat.keywordDensity.slice(0, 5).map((kw, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-mono">{kw.word}</span>
                    <span className="text-muted-foreground">
                      {kw.density.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-3">
            <Button
              onClick={handleCheckStyle}
              className="w-full"
              variant="outline"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              {t("stats.checkGrammarStyle")}
            </Button>
          </div>

          {showStyleIssues && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">
                  {t("stats.styleIssues")} ({styleIssues.length})
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowStyleIssues(false)}
                >
                  {t("common.close")}
                </Button>
              </div>

              {styleIssues.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  {t("stats.noIssuesFound")}
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {styleIssues.map((issue, i) => (
                    <div
                      key={i}
                      className={`text-xs p-2 rounded border ${
                        issue.severity === "error"
                          ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                          : issue.severity === "warning"
                            ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800"
                            : "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {issue.severity === "error" ? (
                          <AlertCircle className="w-3 h-3 mt-0.5 text-red-600" />
                        ) : issue.severity === "warning" ? (
                          <AlertCircle className="w-3 h-3 mt-0.5 text-yellow-600" />
                        ) : (
                          <Info className="w-3 h-3 mt-0.5 text-blue-600" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">
                            {t("stats.line")} {issue.line}: {issue.issue}
                          </div>
                          <div className="text-muted-foreground mt-1">
                            "{issue.text}"
                          </div>
                          <div className="text-muted-foreground mt-1 italic">
                            {issue.suggestion}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-3 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-green-900 dark:text-green-100">
              <Eye className="w-4 h-4" />
              {t("stats.engagementPrediction")}
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("stats.optimalLength")}:
                </span>
                <span
                  className={
                    stats.words >= 300 && stats.words <= 1500
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  {stats.words >= 300 && stats.words <= 1500
                    ? `✓ ${t("stats.goodStatus")}`
                    : `⚠ ${stats.words < 300 ? t("stats.tooShort") : t("stats.tooLong")}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("stats.readability")}:
                </span>
                <span
                  className={
                    readability.fleschScore >= 60
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  {readability.fleschScore >= 60
                    ? `✓ ${t("stats.goodStatus")}`
                    : `⚠ ${t("stats.difficult")}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("stats.visualContent")}:
                </span>
                <span
                  className={
                    stats.images >= 1 ? "text-green-600" : "text-yellow-600"
                  }
                >
                  {stats.images >= 1
                    ? `✓ ${t("stats.hasImages")}`
                    : `⚠ ${t("stats.addImages")}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("stats.structure")}:
                </span>
                <span
                  className={
                    stats.headings.h2 >= 2
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  {stats.headings.h2 >= 2
                    ? `✓ ${t("stats.wellStructured")}`
                    : `⚠ ${t("stats.addSections")}`}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t("stats.estimatedEngagement")}:
                </span>
                <span className="text-lg font-bold">
                  {calculateEngagement(stats, readability, wechat)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateEngagement(
  stats: DocumentStats,
  readability: EnhancedReadability,
  wechat: WeChatAnalysis,
): string {
  let score = 0;

  if (stats.words >= 300 && stats.words <= 1500) score += 20;
  else if (stats.words >= 200 && stats.words <= 2000) score += 10;

  const effectiveScore = readability.hasChinese
    ? readability.chineseScore
    : readability.fleschScore;
  if (effectiveScore >= 60) score += 25;
  else if (effectiveScore >= 40) score += 10;

  if (stats.images >= 2) score += 15;
  else if (stats.images >= 1) score += 10;

  if (stats.headings.h2 >= 2) score += 10;
  else if (stats.headings.h2 >= 1) score += 5;

  if (stats.readingTime >= 3 && stats.readingTime <= 7) score += 10;
  else if (stats.readingTime >= 2 && stats.readingTime <= 10) score += 5;

  if (wechat.emojiCount >= 3 && wechat.emojiCount <= 10) score += 5;
  if (wechat.ctaCount >= 1) score += 5;
  if (wechat.visualBalance >= 60) score += 10;

  score = Math.min(100, score);

  if (score >= 80) return `🔥 ${score}%`;
  if (score >= 60) return `✨ ${score}%`;
  if (score >= 40) return `👍 ${score}%`;
  return `📈 ${score}%`;
}
