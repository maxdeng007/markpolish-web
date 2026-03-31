import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  BarChart3,
  Clock,
  FileText,
} from "lucide-react";
import { getDocumentStats, analyzeReadability } from "@/lib/polish-engine";
import { useTranslation } from "@/hooks/useTranslation";

interface CompactStatsProps {
  markdown: string;
}

export default function CompactStats({ markdown }: CompactStatsProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const stats = getDocumentStats(markdown);
  const readability = analyzeReadability(markdown);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{t("stats.title")}</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span className="font-mono">{stats.words}</span>
              <span>{t("stats.words")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="font-mono">{stats.readingTime}</span>
              <span>{t("stats.readingTime")}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{t("stats.fleschScore")}:</span>
              <span className="font-mono font-semibold">
                {readability.fleschScore.toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronUp className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-border bg-background max-h-[60vh] overflow-y-auto">
          <div className="p-4 grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold mb-3">
                {t("stats.basicStats")}
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("stats.characters")}:
                  </span>
                  <span className="font-mono">
                    {stats.characters.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("stats.words")}:
                  </span>
                  <span className="font-mono font-semibold">
                    {stats.words.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("stats.sentences")}:
                  </span>
                  <span className="font-mono">
                    {stats.sentences.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("stats.paragraphs")}:
                  </span>
                  <span className="font-mono">
                    {stats.paragraphs.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">
                    {t("stats.readingTime")}:
                  </span>
                  <span className="font-mono">{stats.readingTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("stats.speakingTime")}:
                  </span>
                  <span className="font-mono">{stats.speakingTime} min</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold mb-3">
                {t("stats.contentElements")}
              </h4>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("stats.h1")}:
                  </span>
                  <span className="font-mono">{stats.headings.h1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("stats.h2")}:
                  </span>
                  <span className="font-mono">{stats.headings.h2}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("stats.h3")}:
                  </span>
                  <span className="font-mono">{stats.headings.h3}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("stats.h4")}:
                  </span>
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

            <div className="space-y-2">
              <h4 className="text-sm font-semibold mb-3">
                {t("stats.readabilityQuality")}
              </h4>
              <div className="space-y-2 text-xs">
                <div className="bg-green-50 dark:bg-green-950/30 rounded p-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">
                      {t("stats.fleschScore")}:
                    </span>
                    <span className="font-mono font-semibold">
                      {readability.fleschScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {t(readability.interpretation)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("stats.gradeLevel")}:
                    </span>
                    <span className="font-mono">
                      {readability.gradeLevel.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("stats.avgWordsSentence")}:
                    </span>
                    <span className="font-mono">
                      {readability.avgWordsPerSentence.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t space-y-1">
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
