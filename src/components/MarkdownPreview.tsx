import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
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
  const [processedMarkdown, setProcessedMarkdown] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);
  const currentTheme = getTheme(theme);
  // Track the current markdown to detect changes
  const markdownRef = useRef(markdown);

  // Parse markdown and initialize AI image states
  useEffect(() => {
    markdownRef.current = markdown;

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
    };

    previewRef.current.addEventListener("click", handleClick);
    return () => previewRef.current?.removeEventListener("click", handleClick);
  }, [aiImageStates, handleSelectRatio, handleGenerateImage, handleClear]);

  // Render AI image placeholders and images based on state
  // Use useLayoutEffect to run synchronously after React commits to DOM
  useLayoutEffect(() => {
    if (!previewRef.current) return;

    // Store current markdown at the start of this effect
    const currentMarkdown = markdownRef.current;

    // Use queueMicrotask to run after React has finished all its work
    queueMicrotask(() => {
      // Check if markdown has changed since we started
      if (markdownRef.current !== currentMarkdown) return;
      if (!previewRef.current?.isConnected) return;

      try {
        Object.entries(aiImageStates).forEach(([imageId, state]) => {
          // Check if markdown changed
          if (markdownRef.current !== currentMarkdown) return;

          // Find existing placeholder or wrapper for this ID
          let container = previewRef.current?.querySelector(
            `[data-ai-id="${imageId}"]`,
          );

          // If not found, try to find an uninitialized placeholder
          if (!container) {
            const uninitPlaceholder = previewRef.current?.querySelector(
              ".ai-image-placeholder:not([data-ai-id])",
            );
            if (uninitPlaceholder?.isConnected) {
              uninitPlaceholder.setAttribute("data-ai-id", imageId);
              uninitPlaceholder.setAttribute("data-ratio", state.ratio);
              container = uninitPlaceholder;
            }
          }

          // Skip if container not found or not connected
          if (!container || !container.isConnected) return;

          // Skip if container is not a child of previewRef
          if (!previewRef.current?.contains(container)) return;

          const aspectClassMap: Record<string, string> = {
            "1:1": "aspect-square",
            "16:9": "aspect-video",
            "9:16": "aspect-9-16",
            "4:3": "aspect-4-3",
            "3:4": "aspect-3-4",
          };
          const aspectClass = aspectClassMap[state.ratio] || "aspect-square";

          if (state.imageUrl && state.status === "done") {
            // Check if wrapper exists with correct aspect ratio
            const hasCorrectAspect =
              container.classList.contains("ai-image-wrapper") &&
              container.classList.contains(aspectClass);

            if (
              !container.classList.contains("ai-image-wrapper") ||
              !hasCorrectAspect
            ) {
              // Use innerHTML instead of outerHTML to preserve the container
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
            }
          } else if (previewMode === "wecom") {
            // WeCom mode: show simple placeholder instead of interactive UI
            if (!container.classList.contains("ai-image-wecom-placeholder")) {
              container.className = "ai-image-wecom-placeholder";
              (container as HTMLElement).style.cssText =
                "display: flex; align-items: center; justify-content: center; min-height: 200px; background: linear-gradient(135deg, #f5f5f5, #e0e0e0); border-radius: 8px; color: #999; font-size: 14px;";
              container.innerHTML = `【AI图片: ${state.description.slice(0, 30)}${state.description.length > 30 ? "..." : ""}】`;
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

            // Only update if content has changed OR if switching from WeCom mode
            const expectedContent = `data-generate="${imageId}"`;
            const isFromWecom = container.classList.contains("ai-image-wecom-placeholder");
            if (
              !container.innerHTML.includes(expectedContent) ||
              container.classList.contains("ai-image-wrapper") ||
              isFromWecom
            ) {
              container.className = "ai-image-placeholder";
              // Clear any inline styles from WeCom mode so CSS classes work
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
          }
        });
      } catch (error) {
        // Silently ignore DOM manipulation errors
        // This can happen when content is deleted while we're updating
        console.debug("AI image update skipped:", error);
      }
    });
  }, [aiImageStates, processedMarkdown, previewMode]);

  return (
    <div className={`markdown-preview ${currentTheme.category === "dark" ? "theme-dark" : ""}`}>
      <style>{currentTheme.css}</style>
      <style>
        {previewMode === "wecom"
          ? getWeChatStyles(currentTheme.styles.accent)
          : getAllPreviewStyles()}
      </style>
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
