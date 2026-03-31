import { useEffect, useRef, useCallback } from "react";
import {
  convertMarkdownWithComponents,
  parseCustomComponents,
} from "@/lib/markdown-components";
import { getTheme } from "@/lib/themes";
import { aiImageGen } from "@/lib/ai-image-generation";
import { getAllPreviewStyles, getWeChatStyles } from "@/lib/preview-styles";

// Clean AI Image State Interface
export interface AIImageState {
  description: string;
  ratio: string;
  imageUrl: string | null;
  status: "idle" | "generating" | "done" | "error";
}

interface MarkdownPreviewProps {
  markdown: string;
  theme?: string;
  previewMode?: "full" | "wecom";
  aiImageStates: Record<string, AIImageState>;
  onAIImageStatesChange: (states: Record<string, AIImageState>) => void;
}

export default function MarkdownPreview({
  markdown,
  theme = "wechat-classic",
  previewMode = "full",
  aiImageStates,
  onAIImageStatesChange,
}: MarkdownPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const currentTheme = getTheme(theme);
  const isMountedRef = useRef(true);

  const themeColors = {
    accent: currentTheme.styles.accent,
    foreground: currentTheme.styles.foreground,
    heading: currentTheme.styles.heading,
    link: currentTheme.styles.link,
    border: currentTheme.styles.border,
    code: currentTheme.styles.code,
    background: currentTheme.styles.background,
  };

  // Compute directly instead of useMemo - ensures we always use current markdown value
  const processedMarkdown = convertMarkdownWithComponents(
    markdown,
    themeColors,
  );

  useEffect(() => {
    if (!isMountedRef.current) return;

    const components = parseCustomComponents(markdown);
    const aiImages = components.filter((c) => c.type === "ai-image");

    const newState: Record<string, AIImageState> = {};
    aiImages.forEach((img, index) => {
      const id = `ai-img-${index}`;
      const prevKeys = Object.keys(aiImageStates);
      const existingState = prevKeys[index]
        ? aiImageStates[prevKeys[index]]
        : null;

      if (existingState) {
        newState[id] = {
          ...existingState,
          description: img.content,
        };
      } else {
        newState[id] = {
          description: img.content,
          ratio: "1:1",
          imageUrl: null,
          status: "idle",
        };
      }
    });
    onAIImageStatesChange(newState);
  }, [markdown]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSelectRatio = useCallback(
    (imageId: string, ratio: string) => {
      onAIImageStatesChange({
        ...aiImageStates,
        [imageId]: { ...aiImageStates[imageId], ratio },
      });
    },
    [aiImageStates, onAIImageStatesChange],
  );

  const handleGenerateImage = useCallback(
    async (imageId: string) => {
      const currentState = aiImageStates[imageId];
      if (!currentState || currentState.status === "generating") return;

      onAIImageStatesChange({
        ...aiImageStates,
        [imageId]: { ...currentState, status: "generating" },
      });

      const { description, ratio } = currentState;

      try {
        const result = await aiImageGen.generateImageAndWait(
          { prompt: description, aspectRatio: ratio },
          (status) => {
            const statusEl = previewRef.current?.querySelector(
              `[data-ai-id="${imageId}"] .ai-image-status`,
            );
            if (statusEl && statusEl.isConnected) statusEl.textContent = status;
          },
        );

        if (result.success && result.imageUrl) {
          onAIImageStatesChange({
            ...aiImageStates,
            [imageId]: {
              ...aiImageStates[imageId],
              imageUrl: result.imageUrl!,
              status: "done",
            },
          });
        } else {
          onAIImageStatesChange({
            ...aiImageStates,
            [imageId]: { ...aiImageStates[imageId], status: "error" },
          });
        }
      } catch (error) {
        console.error("Image generation error:", error);
        onAIImageStatesChange({
          ...aiImageStates,
          [imageId]: { ...aiImageStates[imageId], status: "error" },
        });
      }
    },
    [aiImageStates, onAIImageStatesChange],
  );

  // Handle clear - keeps ratio, removes image
  const handleClear = useCallback(
    (imageId: string) => {
      onAIImageStatesChange({
        ...aiImageStates,
        [imageId]: {
          ...aiImageStates[imageId],
          imageUrl: null,
          status: "idle",
        },
      });
    },
    [aiImageStates, onAIImageStatesChange],
  );

  // Click handler delegation
  useEffect(() => {
    if (!previewRef.current) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Ratio button click
      const ratioBtn = target.closest(".ai-image-ratio-btn");
      if (ratioBtn) {
        const placeholder = ratioBtn.closest(".ai-image-placeholder");
        if (placeholder) {
          const ratio = (ratioBtn as HTMLElement).dataset.ratio;
          const imageId = placeholder.getAttribute("data-ai-id");
          if (ratio && imageId && aiImageStates[imageId]) {
            handleSelectRatio(imageId, ratio);
            // Update active state visually
            placeholder
              .querySelectorAll(".ai-image-ratio-btn")
              .forEach((btn) => {
                btn.classList.remove("active");
              });
            ratioBtn.classList.add("active");
            placeholder.setAttribute("data-ratio", ratio);
          }
        }
        return;
      }

      // Generate button click
      const generateBtn = target.closest(".ai-image-generate-btn");
      if (generateBtn) {
        const imageId = (generateBtn as HTMLElement).dataset.generate;
        if (imageId && aiImageStates[imageId]) {
          handleGenerateImage(imageId);
        }
        return;
      }

      // Clear button click
      const clearBtn = target.closest("[data-clear]");
      if (clearBtn) {
        const wrapper = clearBtn.closest(".ai-image-wrapper");
        if (wrapper) {
          const imageId = (clearBtn as HTMLElement).dataset.clear;
          if (imageId) {
            handleClear(imageId);
          }
        }
        return;
      }

      // Tab button click
      const tabButton = target.closest(".tab-button");
      if (tabButton) {
        const tabsComponent = tabButton.closest(".tabs-component");
        if (tabsComponent) {
          const tabIndex = (tabButton as HTMLElement).dataset.tab;
          tabsComponent.querySelectorAll(".tab-button").forEach((btn) => {
            btn.classList.remove("active");
          });
          tabsComponent.querySelectorAll(".tab-panel").forEach((panel) => {
            panel.classList.remove("active");
          });
          tabButton.classList.add("active");
          const panel = tabsComponent.querySelector(
            `.tab-panel[data-tab="${tabIndex}"]`,
          );
          if (panel) {
            panel.classList.add("active");
          }
        }
        return;
      }
    };

    previewRef.current.addEventListener("click", handleClick);
    return () => previewRef.current?.removeEventListener("click", handleClick);
  }, [aiImageStates, handleSelectRatio, handleGenerateImage, handleClear]);

  // Render AI image placeholders and images based on state
  useEffect(() => {
    if (!previewRef.current || !isMountedRef.current) return;

    try {
      Object.entries(aiImageStates).forEach(([imageId, state]) => {
        const container = previewRef.current?.querySelector(
          `[data-ai-id="${imageId}"]`,
        );

        if (!container) return;

        const aspectClassMap: Record<string, string> = {
          "1:1": "aspect-square",
          "16:9": "aspect-video",
          "9:16": "aspect-9-16",
          "4:3": "aspect-4-3",
          "3:4": "aspect-3-4",
        };
        const aspectClass = aspectClassMap[state.ratio] || "aspect-square";

        if (state.imageUrl && state.status === "done") {
          container.className = `ai-image-wrapper ${aspectClass}`;
          container.setAttribute("data-ratio", state.ratio);
          container.innerHTML = `
            <img src="${state.imageUrl}" alt="AI generated image" class="ai-image-result" />
            ${
              previewMode !== "wecom"
                ? `
            <div class="ai-image-overlay">
              <button class="ai-image-action-btn" data-clear="${imageId}" title="Clear image">✕</button>
            </div>
            `
                : ""
            }
          `;
        } else if (previewMode === "wecom") {
          container.className = "ai-image-wecom-placeholder";
          (container as HTMLElement).style.cssText =
            "display: flex; align-items: center; justify-content: center; min-height: 200px; background: linear-gradient(135deg, #f5f5f5, #e0e0e0); border-radius: 8px; color: #999; font-size: 14px;";
          container.innerHTML = `【AI图片: ${state.description.slice(0, 30)}${state.description.length > 30 ? "..." : ""}】`;
        } else {
          const isGenerating = state.status === "generating";
          const ratioBtns = ["1:1", "16:9", "9:16", "4:3", "3:4"]
            .map(
              (r) =>
                `<button class="ai-image-ratio-btn ${state.ratio === r ? "active" : ""}" data-ratio="${r}">${r}</button>`,
            )
            .join("");

          container.className = "ai-image-placeholder";
          (container as HTMLElement).style.cssText = "";
          container.setAttribute("data-ratio", state.ratio);
          container.innerHTML = `
            <div class="ai-image-icon">🎨</div>
            <div class="ai-image-ratio-selector">${ratioBtns}</div>
            <button class="ai-image-generate-btn" data-generate="${imageId}" ${isGenerating ? "disabled" : ""}>
              ${isGenerating ? "⏳ Generating..." : "✨ Generate Image"}
            </button>
            <div class="ai-image-status">${isGenerating ? "Starting..." : ""}</div>
          `;
        }
      });
    } catch (error) {
      console.debug("AI image update skipped:", error);
    }
  }, [aiImageStates, previewMode]);

  const themeStyles = currentTheme.styles;

  return (
    <div
      className={`markdown-preview ${currentTheme.category === "dark" ? "theme-dark" : ""}`}
      style={
        {
          "--accent": themeStyles.accent,
          "--background": themeStyles.background,
          "--foreground": themeStyles.foreground,
          "--heading": themeStyles.heading,
          "--border": themeStyles.border,
          "--blockquote-bg": themeStyles.blockquoteBg || "#f8f9fa",
        } as React.CSSProperties
      }
    >
      <style>{currentTheme.css}</style>
      <style>
        {previewMode === "wecom"
          ? getWeChatStyles(
              currentTheme.styles.accent,
              currentTheme.styles.blockquoteBg || "#f8f9fa",
              currentTheme.category === "dark",
              {
                background: currentTheme.styles.background,
                foreground: currentTheme.styles.foreground,
                heading: currentTheme.styles.heading,
                border: currentTheme.styles.border,
                calloutBg: currentTheme.styles.background,
                tabHeaderBg: currentTheme.styles.background,
              },
            )
          : getAllPreviewStyles()}
      </style>
      <div
        ref={previewRef}
        className="preview-content"
        dangerouslySetInnerHTML={{ __html: processedMarkdown }}
      />
    </div>
  );
}
