import { useState } from "react";
import { Button } from "@/components/ui/button";
import { aiImageGen } from "@/lib/ai-image-generation";
import { imageLibrary } from "@/lib/image-system";
import {
  Sparkles,
  Image as ImageIcon,
  Loader2,
  Key,
  Download,
  Plus,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface AIImagePanelProps {
  onInsertImage?: (url: string, filename: string) => void;
}

export default function AIImagePanel({ onInsertImage }: AIImagePanelProps) {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState(aiImageGen.getApiKey() || "");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(
    !aiImageGen.hasApiKey(),
  );

  // Image size presets
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);

  const sizePresets = [
    { name: "Square", width: 1024, height: 1024 },
    { name: "Portrait", width: 768, height: 1024 },
    { name: "Landscape", width: 1024, height: 768 },
    { name: "Wide", width: 1536, height: 768 },
  ];

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      aiImageGen.setApiKey(apiKey.trim());
      setShowApiKeyInput(false);
      setError("");
    } else {
      setError(t("images.pleaseEnterValidApiKey"));
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError(t("images.pleaseEnterPrompt"));
      return;
    }

    if (!aiImageGen.hasApiKey()) {
      setError(t("images.configureApiKeyFirst"));
      setShowApiKeyInput(true);
      return;
    }

    setIsGenerating(true);
    setError("");
    setGeneratedImage(null);
    setProgress(t("images.startingGeneration"));

    try {
      const result = await aiImageGen.generateImageAndWait(
        {
          prompt: prompt.trim(),
          width,
          height,
          numInferenceSteps: 9,
          guidanceScale: 0.0,
        },
        (status) => setProgress(status),
      );

      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        setProgress(t("images.imageGeneratedSuccess"));
      } else {
        setError(result.error || t("images.generationFailed"));
        setProgress("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("images.unknownError"));
      setProgress("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-generated-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError(t("images.failedDownloadImage"));
    }
  };

  const handleAddToLibrary = async () => {
    if (!generatedImage) return;

    try {
      const base64 = await aiImageGen.downloadImageAsBase64(generatedImage);
      if (base64) {
        imageLibrary.add({
          filename: `ai-generated-${Date.now()}.png`,
          url: base64,
          description: prompt,
          tags: ["ai-generated"],
        });
        alert(t("images.imageAdded"));
      }
    } catch (error) {
      setError(t("images.failedAddImageToLibrary"));
    }
  };

  const handleInsert = () => {
    if (!generatedImage || !onInsertImage) return;
    onInsertImage(generatedImage, `ai-generated-${Date.now()}.png`);
    alert(t("images.imageInserted"));
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {t("images.aiImageGeneration")}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t("images.generateImagesModelScope")}
        </p>

        {/* API Key Configuration */}
        {showApiKeyInput ? (
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100">
              <Key className="w-4 h-4" />
              {t("images.modelScopeApiKey")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("images.getFreeApiKey")}{" "}
              <a
                href="https://modelscope.cn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                ModelScope.cn
              </a>
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t("images.enterApiKey")}
              className="w-full px-3 py-2 text-sm border rounded-md"
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveApiKey} className="flex-1" size="sm">
                {t("common.save")}
              </Button>
              {aiImageGen.hasApiKey() && (
                <Button
                  onClick={() => setShowApiKeyInput(false)}
                  variant="outline"
                  size="sm"
                >
                  {t("common.cancel")}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
              <Key className="w-3 h-3" />
              {t("images.apiKeyConfigured")}
            </div>
            <Button
              onClick={() => setShowApiKeyInput(true)}
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
            >
              {t("images.change")}
            </Button>
          </div>
        )}

        {/* Prompt Input */}
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium">{t("images.prompt")}</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("images.promptPlaceholder")}
            className="w-full px-3 py-2 text-sm border rounded-md min-h-[100px] resize-none"
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            {t("images.promptHelp")}
          </p>
        </div>

        {/* Size Presets */}
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium">{t("images.imageSize")}</label>
          <div className="grid grid-cols-2 gap-2">
            {sizePresets.map((preset) => (
              <Button
                key={preset.name}
                onClick={() => {
                  setWidth(preset.width);
                  setHeight(preset.height);
                }}
                variant={
                  width === preset.width && height === preset.height
                    ? "default"
                    : "outline"
                }
                size="sm"
                disabled={isGenerating}
                className="text-xs"
              >
                {preset.width}×{preset.height}
              </Button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("images.generating")}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {t("images.generateImage")}
            </>
          )}
        </Button>

        {/* Progress */}
        {progress && (
          <div className="mt-3 text-xs text-center text-muted-foreground">
            {progress}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Generated Image */}
        {generatedImage && (
          <div className="mt-4 space-y-3">
            <div className="border rounded-lg overflow-hidden">
              <img
                src={generatedImage}
                alt={t("images.generatedImage")}
                className="w-full h-auto"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                {t("images.download")}
              </Button>
              <Button onClick={handleAddToLibrary} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                {t("images.addToLibrary")}
              </Button>
            </div>

            {onInsertImage && (
              <Button onClick={handleInsert} className="w-full" size="sm">
                <ImageIcon className="w-4 h-4 mr-2" />
                {t("images.insertIntoEditor")}
              </Button>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs space-y-2">
          <div className="font-medium">
            💡 {t("images.tipsForBetterResults")}
          </div>
          <ul className="space-y-1 text-muted-foreground">
            <li>• {t("images.tipSpecificDescriptive")}</li>
            <li>• {t("images.tipStyleKeywords")}</li>
            <li>• {t("images.tipLightingColors")}</li>
            <li>• {t("images.tipGenerationTime")}</li>
            <li>• {t("images.tipFreeApiLimits")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
