import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Wand2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  polishMarkdown,
  analyzeReadability,
  validateLinks,
  optimizeForSEO,
  type PolishOptions,
  defaultPolishOptions,
} from "@/lib/polish-engine";
import { useTranslation } from "@/hooks/useTranslation";

interface PolishPanelProps {
  markdown: string;
  setMarkdown: (markdown: string) => void;
}

export default function PolishPanel({
  markdown,
  setMarkdown,
}: PolishPanelProps) {
  const { t } = useTranslation();
  const [options, setOptions] = useState<PolishOptions>(defaultPolishOptions);
  const [showReadability, setShowReadability] = useState(false);
  const [showLinkValidation, setShowLinkValidation] = useState(false);
  const [showSEO, setShowSEO] = useState(false);

  const readability = analyzeReadability(markdown);
  const linkIssues = validateLinks(markdown);
  const seoSuggestions = optimizeForSEO(markdown);

  const handlePolish = () => {
    const polished = polishMarkdown(markdown, options);
    setMarkdown(polished);
  };

  const toggleOption = (key: keyof PolishOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {t("polish.title")}
        </h3>

        <div className="space-y-2 mb-4">
          <OptionToggle
            label={t("polish.fixHeadings")}
            checked={options.fixHeadings}
            onChange={() => toggleOption("fixHeadings")}
          />
          <OptionToggle
            label={t("polish.fixLists")}
            checked={options.fixLists}
            onChange={() => toggleOption("fixLists")}
          />
          <OptionToggle
            label={t("polish.fixCodeBlocks")}
            checked={options.fixCodeBlocks}
            onChange={() => toggleOption("fixCodeBlocks")}
          />
          <OptionToggle
            label={t("polish.fixLinks")}
            checked={options.fixLinks}
            onChange={() => toggleOption("fixLinks")}
          />
          <OptionToggle
            label={t("polish.fixEmphasis")}
            checked={options.fixEmphasis}
            onChange={() => toggleOption("fixEmphasis")}
          />
          <OptionToggle
            label={t("polish.fixTables")}
            checked={options.fixTables}
            onChange={() => toggleOption("fixTables")}
          />
          <OptionToggle
            label={t("polish.addBlankLines")}
            checked={options.addBlankLines}
            onChange={() => toggleOption("addBlankLines")}
          />
          <OptionToggle
            label={t("polish.removeTrailingSpaces")}
            checked={options.removeTrailingSpaces}
            onChange={() => toggleOption("removeTrailingSpaces")}
          />
        </div>

        <Button onClick={handlePolish} className="w-full" size="lg">
          <Wand2 className="w-4 h-4 mr-2" />
          {t("polish.polishMarkdown")}
        </Button>
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <h3 className="font-semibold text-sm">{t("polish.analysisTools")}</h3>

        {/* Readability Score */}
        <div className="border rounded-lg">
          <button
            onClick={() => setShowReadability(!showReadability)}
            className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-medium">
              {t("polish.readabilityScore")}
            </span>
            <span className="text-xs text-muted-foreground">
              {readability.fleschScore.toFixed(0)}/100
            </span>
          </button>

          {showReadability && (
            <div className="p-3 border-t space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("polish.fleschScore")}:
                </span>
                <span className="font-medium">
                  {readability.fleschScore.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("polish.gradeLevel")}:
                </span>
                <span className="font-medium">
                  {readability.gradeLevel.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("polish.avgWordsSentence")}:
                </span>
                <span className="font-medium">
                  {readability.avgWordsPerSentence.toFixed(1)}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  {t("polish.interpretation")}:
                </div>
                <div className="font-medium">{readability.interpretation}</div>
              </div>
            </div>
          )}
        </div>

        {/* Link Validation */}
        <div className="border rounded-lg">
          <button
            onClick={() => setShowLinkValidation(!showLinkValidation)}
            className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-medium">
              {t("polish.linkValidation")}
            </span>
            <span
              className={`text-xs ${linkIssues.length > 0 ? "text-yellow-600" : "text-green-600"}`}
            >
              {linkIssues.length === 0
                ? t("stats.goodStatus")
                : `${linkIssues.length} ${t("polish.issues")}`}
            </span>
          </button>

          {showLinkValidation && (
            <div className="p-3 border-t space-y-2">
              {linkIssues.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t("polish.allLinksValid")}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {linkIssues.map((issue, index) => (
                    <div
                      key={index}
                      className="text-xs p-2 bg-yellow-50 dark:bg-yellow-950 rounded border border-yellow-200 dark:border-yellow-800"
                    >
                      <div className="font-medium">
                        {t("polish.line")} {issue.line}
                      </div>
                      <div className="text-muted-foreground">{issue.issue}</div>
                      <div className="mt-1 font-mono text-[10px] truncate">
                        {issue.url}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SEO Optimization */}
        <div className="border rounded-lg">
          <button
            onClick={() => setShowSEO(!showSEO)}
            className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-medium">
              {t("polish.seoSuggestions")}
            </span>
            <span className="text-xs text-muted-foreground">
              {seoSuggestions.length} {t("polish.tips")}
            </span>
          </button>

          {showSEO && (
            <div className="p-3 border-t space-y-2">
              {seoSuggestions.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t("polish.seoOptimized")}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {seoSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`text-xs p-2 rounded border ${
                        suggestion.severity === "warning"
                          ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
                          : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {suggestion.severity === "warning" ? (
                          <AlertTriangle className="w-3 h-3 mt-0.5 text-yellow-600" />
                        ) : (
                          <Info className="w-3 h-3 mt-0.5 text-blue-600" />
                        )}
                        <div>
                          <div className="font-medium">{suggestion.type}</div>
                          <div className="text-muted-foreground">
                            {suggestion.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
      <label htmlFor={label} className="text-sm cursor-pointer flex-1">
        {label}
      </label>
      <Switch id={label} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
