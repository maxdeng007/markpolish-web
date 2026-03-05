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
interface AIImageState {
  description: string;
  ratio: string;
  imageUrl: string | null;
  status: "idle" | "generating" | "done" | "error";
}

interface MarkdownPreviewProps {
  markdown: string;
  theme?: string;
}


export default function MarkdownPreview({
  markdown,
  theme = "wechat-classic",
}: MarkdownPreviewProps) {
  const [processedMarkdown, setProcessedMarkdown] = useState("");
  const [aiImageStates, setAIImageStates] = useState<
    Record<string, AIImageState>
  >({});
  const previewRef = useRef<HTMLDivElement>(null);
  const currentTheme = getTheme(theme);

  // Parse markdown and initialize AI image states
  useEffect(() => {
    const processed = convertMarkdownWithComponents(markdown);
    setProcessedMarkdown(processed);

    // Extract ai-image blocks and initialize states
    const components = parseCustomComponents(markdown);
    const aiImages = components.filter((c) => c.type === "ai-image");


    setAIImageStates((prev) => {
      const newState: Record<string, AIImageState> = {};
      aiImages.forEach((img, index) => {
        const id = `ai-img-${index}`;
        // Preserve state by position (index-based matching)
        const prevKeys = Object.keys(prev);
        const existingState = prevKeys[index] ? prev[prevKeys[index]] : null;

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
      return newState;
    });
  }, [markdown]);

  // Handle ratio selection
  const handleSelectRatio = useCallback((imageId: string, ratio: string) => {
    setAIImageStates((prev) => ({
      ...prev,
      [imageId]: { ...prev[imageId], ratio },
    }));
  }, []);

  // Handle image generation
  const handleGenerateImage = useCallback(
    async (imageId: string) => {
      setAIImageStates((prev) => {
        const state = prev[imageId];
        if (!state || state.status === "generating") return prev;
        return {
          ...prev,
          [imageId]: { ...state, status: "generating" },
        };
      });

      const currentState = aiImageStates[imageId];
      if (!currentState) return;

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
          setAIImageStates((prev) => ({
            ...prev,
            [imageId]: {
              ...prev[imageId],
              imageUrl: result.imageUrl!,
              status: "done",
            },
          }));
        } else {
          setAIImageStates((prev) => ({
            ...prev,
            [imageId]: { ...prev[imageId], status: "error" },
          }));
        }
      } catch (error) {
        console.error("Image generation error:", error);
        setAIImageStates((prev) => ({
          ...prev,
          [imageId]: { ...prev[imageId], status: "error" },
        }));
      }
    },
    [aiImageStates],
  );



  // Handle clear - keeps ratio, removes image
  const handleClear = useCallback((imageId: string) => {
    setAIImageStates((prev) => ({
      ...prev,
      [imageId]: { ...prev[imageId], imageUrl: null, status: "idle" },
    }));
  }, []);

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
            placeholder.querySelectorAll(".ai-image-ratio-btn").forEach(btn => {
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
        let container = previewRef.current?.querySelector(`[data-ai-id="${imageId}"]`);
        
        // If not found, try to find an uninitialized placeholder
        if (!container) {
          const uninitPlaceholder = previewRef.current?.querySelector(".ai-image-placeholder:not([data-ai-id])");
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
      className={`preview-container theme-${currentTheme.category}`}
      style={
        {
          "--hero-bg": `linear-gradient(135deg, ${currentTheme.styles.accent} 0%, ${adjustColor(currentTheme.styles.accent, -30)} 100%)`,
          "--hero-text": "white",
        } as React.CSSProperties
      }
    >
      <style>{currentTheme.css}</style>
      <style>{`
        /* ========================
           STANDARD MARKDOWN STYLES
           ======================== */
        .preview-content { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.75; }
        .preview-content h1 { font-size: 2.25em; font-weight: 800; margin: 1.5em 0 0.75em; letter-spacing: -0.02em; }
        .preview-content h2 { font-size: 1.75em; font-weight: 700; margin: 1.5em 0 0.5em; letter-spacing: -0.01em; }
        .preview-content h3 { font-size: 1.375em; font-weight: 600; margin: 1.25em 0 0.5em; }
        .preview-content h4 { font-size: 1.125em; font-weight: 600; margin: 1em 0 0.375em; }
        .preview-content p { margin: 1em 0; line-height: 1.8; }
        .preview-content ul, .preview-content ol { margin: 1em 0; padding-left: 1.5em; }
        .preview-content li { margin: 0.5em 0; }
        .preview-content ul li::marker { color: #667eea; }
        .preview-content ol li::marker { color: #667eea; font-weight: 600; }
        .preview-content a { color: #667eea; text-decoration: none; border-bottom: 1px solid transparent; transition: all 0.2s; }
        .preview-content a:hover { border-bottom-color: #667eea; }
        .preview-content strong { font-weight: 700; color: #1a1a2e; }
        .preview-content em { font-style: italic; }
        .preview-content code { background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%); padding: 0.2em 0.5em; border-radius: 6px; font-size: 0.875em; color: #764ba2; font-family: 'SF Mono', Monaco, monospace; }
        .preview-content pre { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 1.25em; border-radius: 12px; overflow-x: auto; margin: 1.5em 0; }
        .preview-content pre code { background: none; padding: 0; color: #e4e8ec; font-size: 0.875em; }
        
        /* Code Syntax Highlighting - High Contrast */
        .preview-content .hljs-keyword,
        .preview-content .hljs-selector-tag,
        .preview-content .hljs-built_in { color: #ff7b72; font-weight: 600; }
        .preview-content .hljs-type,
        .preview-content .hljs-title,
        .preview-content .hljs-title.class_,
        .preview-content .hljs-title.function_ { color: #79c0ff; font-weight: 600; }
        .preview-content .hljs-string,
        .preview-content .hljs-attr,
        .preview-content .hljs-template-variable,
        .preview-content .hljs-meta-string { color: #a5d6ff; }
        .preview-content .hljs-number,
        .preview-content .hljs-literal { color: #ffab70; }
        .preview-content .hljs-variable,
        .preview-content .hljs-variable-language,
        .preview-content .hljs-params { color: #ffa657; }

        /* ========================
           AI IMAGE STYLES
           ======================== */
        .ai-image-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 24px; border: 2px solid #e2e8f0; border-radius: 16px; margin: 32px 0; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); min-height: 200px; transition: all 0.3s ease; }
        .ai-image-placeholder:hover { border-color: #cbd5e1; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); }
        .ai-image-icon { font-size: 56px; margin-bottom: 16px; filter: grayscale(20%); }
        .ai-image-ratio-selector { display: flex; gap: 8px; margin-bottom: 20px; }
        .ai-image-ratio-btn { padding: 8px 16px; border: 2px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; font-size: 13px; font-weight: 600; color: #64748b; transition: all 0.2s ease; }
        .ai-image-ratio-btn:hover { border-color: #667eea; color: #667eea; }
        .ai-image-ratio-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-color: transparent; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
        .ai-image-generate-btn { padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 600; letter-spacing: 0.02em; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.35); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .ai-image-generate-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(102, 126, 234, 0.45); }
        .ai-image-generate-btn:disabled { background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%); cursor: not-allowed; box-shadow: none; transform: none; }
        .ai-image-status { margin-top: 16px; font-size: 13px; color: #94a3b8; font-weight: 500; }
        .ai-image-wrapper { position: relative; display: block; margin: 32px 0; width: 100%; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.12); background: transparent; }
        .ai-image-wrapper img { position: absolute; top: 50%; left: 50%; width: 100%; height: 100%; display: block; object-fit: cover; object-position: center; transform: translate(-50%, -50%) scale(1.12); transition: transform 0.5s ease; }
        .ai-image-wrapper:hover img { transform: translate(-50%, -50%) scale(1.16); }
        .ai-image-wrapper.aspect-square { aspect-ratio: 1/1; }
        .ai-image-wrapper.aspect-video { aspect-ratio: 16/9; }
        .ai-image-wrapper.aspect-9-16 { aspect-ratio: 9/16; }
        .ai-image-wrapper.aspect-4-3 { aspect-ratio: 4/3; }
        .ai-image-wrapper.aspect-3-4 { aspect-ratio: 3/4; }
        .ai-image-overlay { position: absolute; bottom: 16px; right: 16px; display: flex; gap: 10px; opacity: 0; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); transform: translateY(10px); }
        .ai-image-wrapper:hover .ai-image-overlay { opacity: 1; transform: translateY(0); }
        .ai-image-action-btn { width: 44px; height: 44px; border: none; border-radius: 50%; background: rgba(255,255,255,0.98); color: #1e293b; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(0,0,0,0.15); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .ai-image-action-btn:hover { transform: scale(1.15) rotate(5deg); background: white; }

        /* ========================
           COMPONENT STYLES
           ======================== */
        
        /* Hero Component */
        .preview-content .hero-component { 
          padding: 60px 48px; 
          border-radius: 24px; 
          text-align: center; 
          margin: 32px 0; 
          position: relative;
          overflow: hidden;
          background: var(--hero-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
          box-shadow: 
            0 20px 60px rgba(0,0,0,0.15),
            0 0 0 1px rgba(255,255,255,0.1) inset;
        }
        .preview-content .hero-component::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E");
          opacity: 0.6;
        }
        .preview-content .hero-component::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%);
          animation: heroGlow 8s ease-in-out infinite;
        }
        @keyframes heroGlow {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .preview-content .hero-component {
          position: relative;
          z-index: 1;
          color: white;
        }
        .preview-content .hero-component *,
        .preview-content .hero-component *::before,
        .preview-content .hero-component *::after {
          color: white !important;
        }
        .preview-content .hero-component h1,
        .preview-content .hero-component h2,
        .preview-content .hero-component h3,
        .preview-content .hero-component h4,
        .preview-content .hero-component h5,
        .preview-content .hero-component h6,
        .preview-content .hero-component p,
        .preview-content .hero-component span,
        .preview-content .hero-component strong,
        .preview-content .hero-component em,
        .preview-content .hero-component div,
        .preview-content .hero-component li,
        .preview-content .hero-component a {
          color: white !important;
          position: relative;
          z-index: 1;
        }
        .preview-content .hero-component h1 { 
          margin: 0 0 20px !important; 
          font-size: 42px !important; 
          font-weight: 800; 
          letter-spacing: -0.02em;
          text-shadow: 0 4px 20px rgba(0,0,0,0.25);
          line-height: 1.2;
        }
        .preview-content .hero-component p { 
          margin: 0 !important; 
          font-size: 20px !important; 
          opacity: 0.95;
          font-weight: 400;
          line-height: 1.6;
          max-width: 700px;
          margin-left: auto !important;
          margin-right: auto !important;
        }

        .columns-component { display: flex; gap: 24px; margin: 24px 0; }
        .columns-component.col-2 { flex-direction: row; }
        .columns-component.col-3 { flex-direction: row; }
        .columns-component.col-4 { flex-direction: row; flex-wrap: wrap; }
        .column-item { flex: 1; min-width: 200px; padding: 16px; border: 1px solid #e5e5e5; border-radius: 8px; }
        
        /* Steps Component */
        .steps-component { margin: 24px 0; padding-left: 0; list-style: none; }
        .step-item { display: flex; gap: 16px; margin-bottom: 20px; padding: 16px; border: 1px solid #e5e5e5; border-radius: 8px; background: #fafafa; }
        .step-number { width: 32px; height: 32px; min-width: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; }
        .step-content { flex: 1; }
        .step-title { font-weight: 600; margin-bottom: 4px; }
        .step-description { font-size: 14px; color: #666; }
        
        /* Timeline Component */
        .timeline-component { margin: 24px 0; padding-left: 20px; border-left: 2px solid #e5e5e5; }
        .timeline-item { position: relative; padding-left: 20px; margin-bottom: 24px; }
        .timeline-item::before { content: ''; position: absolute; left: -26px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: #4a90d9; }
        .timeline-title { font-weight: 600; margin-bottom: 4px; }
        .timeline-body { font-size: 14px; color: #666; }
        
        /* Card Component */
        .card-component { padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px; margin: 16px 0; background: #fafafa; }
        .card-component p { margin: 0 !important; }
        
        /* Video Component */
        .video-component { margin: 16px 0; }
        .video-player { width: 100%; max-width: 100%; border-radius: 8px; }
        .video-caption { text-align: center; font-size: 14px; color: #666; margin-top: 8px; }
        
        /* Local Image */
        .local-image-wrapper { margin: 16px 0; }
        .local-image { width: 100%; border-radius: 8px; }
        .local-image-caption { text-align: center; font-size: 14px; color: #666; margin-top: 8px; }
        
        /* Callout Component */
        .callout-component { padding: 16px; border-radius: 8px; margin: 16px 0; }
        .callout-component.callout-info { background: #e3f2fd; border-left: 4px solid #2196f3; }
        .callout-component.callout-warning { background: #fff3e0; border-left: 4px solid #ff9800; }
        .callout-component.callout-error { background: #ffebee; border-left: 4px solid #f44336; }
        .callout-component.callout-success { background: #e8f5e9; border-left: 4px solid #4caf50; }
        .callout-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .callout-icon { font-size: 18px; }
        .callout-title { font-weight: 600; }
        .callout-content { font-size: 14px; }
        
        /* Quote Component */
        .quote-component { padding: 16px 20px; margin: 16px 0; border-left: 4px solid #4a90d9; background: #fafafa; border-radius: 0 8px 8px 0; }
        .quote-content { font-style: italic; font-size: 16px; line-height: 1.6; }
        .quote-attribution { margin-top: 12px; font-size: 14px; color: #666; }
        .quote-author { font-weight: 600; }
        
        /* Tabs Component */
        .tabs-component { margin: 16px 0; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; }
        .tab-item { border-bottom: 1px solid #e5e5e5; }
        .tab-item:last-child { border-bottom: none; }
        .tab-title { padding: 12px 16px; cursor: pointer; font-weight: 500; background: #fafafa; }
        .tab-title:hover { background: #f0f0f0; }
        .tab-content { padding: 16px; display: none; }
        .tab-item.active .tab-content { display: block; }
        
        /* Accordion Component */
        .accordion-component { margin: 16px 0; }
        .accordion-item { border: 1px solid #e5e5e5; border-radius: 8px; margin-bottom: 8px; overflow: hidden; }
        .accordion-title { padding: 12px 16px; cursor: pointer; font-weight: 500; background: #fafafa; }
        .accordion-title:hover { background: #f0f0f0; }
        .accordion-content { padding: 16px; }
      `}</style>
      
      {/* Dark Theme Overrides */}
      <style>{`
        /* ========================
           DARK THEME OVERRIDES
           ======================== */
        .theme-dark .preview-content strong { color: #f0f0f0; }
        .theme-dark .preview-content code { background: rgba(255,255,255,0.1); color: #e0e0e0; }
        .theme-dark .preview-content pre { background: rgba(0,0,0,0.4); }
        .theme-dark .preview-content pre code { color: #e0e0e0; }
        
        /* Dark AI Image Styles */
        .theme-dark .ai-image-placeholder { border-color: rgba(255,255,255,0.15); background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.08) 100%); }
        .theme-dark .ai-image-placeholder:hover { border-color: rgba(255,255,255,0.25); background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.12) 100%); }
        .theme-dark .ai-image-ratio-btn { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.08); color: #a0a0a0; }
        .theme-dark .ai-image-ratio-btn:hover { border-color: #a78bfa; color: #c4b5fd; }
        .theme-dark .ai-image-generate-btn:disabled { background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.15) 100%); }
        .theme-dark .ai-image-status { color: #707070; }
        .theme-dark .ai-image-wrapper { box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
        .theme-dark .ai-image-action-btn { background: rgba(30,30,30,0.95); color: #e0e0e0; }
        .theme-dark .ai-image-action-btn:hover { background: rgba(40,40,40,1); }
        
        /* Dark Columns */
        .theme-dark .column-item { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); }
        
        /* Dark Steps */
        .theme-dark .step-item { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); }
        .theme-dark .step-description { color: #a0a0a0; }
        
        /* Dark Timeline */
        .theme-dark .timeline-component { border-left-color: rgba(255,255,255,0.2); }
        .theme-dark .timeline-item::before { background: #a78bfa; }
        .theme-dark .timeline-body { color: #a0a0a0; }
        
        /* Dark Card */
        .theme-dark .card-component { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); }
        
        /* Dark Video & Image Captions */
        .theme-dark .video-caption { color: #a0a0a0; }
        .theme-dark .local-image-caption { color: #a0a0a0; }
        
        /* Dark Callout - darker backgrounds with proper contrast */
        .theme-dark .callout-component.callout-info { background: rgba(33, 150, 243, 0.15); border-left-color: #64b5f6; }
        .theme-dark .callout-component.callout-warning { background: rgba(255, 152, 0, 0.15); border-left-color: #ffb74d; }
        .theme-dark .callout-component.callout-error { background: rgba(244, 67, 54, 0.15); border-left-color: #ef5350; }
        .theme-dark .callout-component.callout-success { background: rgba(76, 175, 80, 0.15); border-left-color: #81c784; }
        .theme-dark .callout-content { color: #d0d0d0; }
        
        /* Dark Quote */
        .theme-dark .quote-component { background: rgba(255,255,255,0.03); border-left-color: #a78bfa; }
        .theme-dark .quote-attribution { color: #a0a0a0; }
        
        /* Dark Tabs */
        .theme-dark .tabs-component { border-color: rgba(255,255,255,0.12); }
        .theme-dark .tab-item { border-bottom-color: rgba(255,255,255,0.08); }
        .theme-dark .tab-title { background: rgba(255,255,255,0.03); }
        .theme-dark .tab-title:hover { background: rgba(255,255,255,0.08); }
        
        /* Dark Accordion */
        .theme-dark .accordion-item { border-color: rgba(255,255,255,0.12); }
        .theme-dark .accordion-title { background: rgba(255,255,255,0.03); }
        .theme-dark .accordion-title:hover { background: rgba(255,255,255,0.08); }
        
        /* Dark List Markers */
        .theme-dark .preview-content ul li::marker { color: #a78bfa; }
        .theme-dark .preview-content ol li::marker { color: #a78bfa; }
      `}</style>
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
