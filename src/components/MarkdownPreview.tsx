import { useEffect, useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import {
  convertMarkdownWithComponents,
  parseCustomComponents,
} from "@/lib/markdown-components";
import { getTheme } from "@/lib/themes";
import { aiImageGen } from "@/lib/ai-image-generation";
import { getAllPreviewStyles } from "@/lib/preview-styles";

import { cn } from "@/lib/utils";

// Helper to adjust hex color brightness
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

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
  aiImageStates: Record<string, AIImageState>;
  onAIImageStatesChange: (states: Record<string, AIImageState>) => void;
}

export default function MarkdownPreview({
  markdown,
  theme = "wechat-classic",
  aiImageStates,
  onAIImageStatesChange,
}: MarkdownPreviewProps) {
  const [processedMarkdown, setProcessedMarkdown] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);
  const currentTheme = getTheme(theme);

  // Parse markdown and initialize AI image states
  useEffect(() => {
    const processed = convertMarkdownWithComponents(markdown);
    setProcessedMarkdown(processed);

    // Extract ai-image blocks and initialize states
    const components = parseCustomComponents(markdown);
    const aiImages = components.filter((c) => c.type === "ai-image");

    const newState: Record<string, AIImageState> = {};
    aiImages.forEach((img, index) => {
      const id = `ai-img-${index}`;
      // Preserve state by position (index-based matching)
      const prevKeys = Object.keys(aiImageStates);
      const existingState = prevKeys[index]
        ? aiImageStates[prevKeys[index]]
        : null;

      if (existingState) {
        // Keep ratio and status, but always use NEW description from markdown
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

  // Handle ratio selection
  const handleSelectRatio = useCallback(
    (imageId: string, ratio: string) => {
      onAIImageStatesChange({
        ...aiImageStates,
        [imageId]: { ...aiImageStates[imageId], ratio },
      });
    },
    [aiImageStates, onAIImageStatesChange],
  );

  // Handle image generation
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
            if (statusEl) statusEl.textContent = status;
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
    };

    previewRef.current.addEventListener("click", handleClick);
    return () => previewRef.current?.removeEventListener("click", handleClick);
  }, [aiImageStates, handleSelectRatio, handleGenerateImage, handleClear]);

  // Render AI image placeholders and images based on state
  useEffect(() => {
    if (!previewRef.current) return;

    // Small delay to ensure DOM is ready after ReactMarkdown renders
    const timer = setTimeout(() => {
      if (!previewRef.current) return;

      Object.entries(aiImageStates).forEach(([imageId, state]) => {
        // Find existing placeholder or wrapper for this ID
        let container = previewRef.current?.querySelector(
          `[data-ai-id="${imageId}"]`,
        );

        // If not found, try to find an uninitialized placeholder
        if (!container) {
          const uninitPlaceholder = previewRef.current?.querySelector(
            ".ai-image-placeholder:not([data-ai-id])",
          );
          if (uninitPlaceholder) {
            uninitPlaceholder.setAttribute("data-ai-id", imageId);
            uninitPlaceholder.setAttribute("data-ratio", state.ratio);
            container = uninitPlaceholder;
          }
        }

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
          // Only update if not already showing image
          if (!container.classList.contains("ai-image-wrapper")) {
            container.outerHTML = `
              <div class="ai-image-wrapper ${aspectClass}" data-ai-id="${imageId}" data-ratio="${state.ratio}">
                <img src="${state.imageUrl}" alt="AI generated image" class="ai-image-result" />
                <div class="ai-image-overlay">
                  <button class="ai-image-action-btn" data-clear="${imageId}" title="Clear image">✕</button>
                </div>
              </div>
            `;
          }
        } else {
          // Render placeholder
          const isGenerating = state.status === "generating";
          const ratioBtns = ["1:1", "16:9", "9:16", "4:3", "3:4"]
            .map(
              (r) =>
                `<button class="ai-image-ratio-btn ${state.ratio === r ? "active" : ""}" data-ratio="${r}">${r}</button>`,
            )
            .join("");

          // Only update if content has changed
          const expectedContent = `data-generate="${imageId}"`;
          if (
            !container.outerHTML.includes(expectedContent) ||
            container.classList.contains("ai-image-wrapper")
          ) {
            container.outerHTML = `
              <div class="ai-image-placeholder" data-ai-id="${imageId}" data-ratio="${state.ratio}">
                <div class="ai-image-icon">🎨</div>
                <div class="ai-image-ratio-selector">${ratioBtns}</div>
                <button class="ai-image-generate-btn" data-generate="${imageId}" ${isGenerating ? "disabled" : ""}>
                  ${isGenerating ? "⏳ Generating..." : "✨ Generate Image"}
                </button>
                <div class="ai-image-status">${isGenerating ? "Starting..." : ""}</div>
              </div>
            `;
          }
        }
      });
    }, 100); // 100ms delay to ensure DOM is ready

    return () => {
      clearTimeout(timer);
    };
  }, [aiImageStates, processedMarkdown]);

  return (
    <div
      className={cn(
        "preview-container",
        currentTheme.category === "dark" ? "theme-dark" : "",
      )}
      style={
        {
          "--hero-bg": `linear-gradient(135deg, ${currentTheme.styles.accent} 0%, ${adjustColor(currentTheme.styles.accent, -30)} 100%)`,
          "--hero-text": "white",
        } as React.CSSProperties
      }
    >
      <style>{currentTheme.css}</style>
      <style>{getAllPreviewStyles()}</style>
      <div ref={previewRef} className="preview-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeSlug]}
          components={{
            table({ children }) {
              return (
                <div style={{ overflowX: "auto" }}>
                  <table>{children}</table>
                </div>
              );
            },
          }}
        >
          {processedMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
