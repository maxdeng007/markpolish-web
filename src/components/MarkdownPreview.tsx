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
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
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
  const [generatedImages, setGeneratedImages] = useState<
    Record<string, string>
  >({});
  const [generatingImages, setGeneratingImages] = useState<Set<string>>(
    new Set(),
  );
  const previewRef = useRef<HTMLDivElement>(null);
  const generatingRef = useRef<Set<string>>(new Set());
  const currentTheme = getTheme(theme);

  const getCurrentAIDescriptions = useCallback(() => {
    const components = parseCustomComponents(markdown);
    return components
      .filter((c) => c.type === "ai-image")
      .map((c) => ({ content: c.content, index: c.startIndex }));
  }, [markdown]);

  useEffect(() => {
    const processed = convertMarkdownWithComponents(markdown);
    setProcessedMarkdown(processed);
  }, [markdown]);

  const handleGenerateImage = useCallback(
    async (description: string, forcedRatio?: string) => {
      if (generatingRef.current.has(description)) return;

      let ratio = forcedRatio;
      if (!ratio) {
        const placeholders = document.querySelectorAll(".ai-image-placeholder");
        for (const p of placeholders) {
          const btn = p.querySelector(
            ".ai-image-generate-btn",
          ) as HTMLButtonElement;
          const btnDesc = btn?.dataset.description || "";
          const btnDescUnescaped = btnDesc
            .replace(/&#34;/g, '"')
            .replace(/&#39;/g, "'");
          if (
            btn &&
            (btnDesc === description || btnDescUnescaped === description)
          ) {
            ratio = p.getAttribute("data-ratio") || "1:1";
            break;
          }
        }
        if (!ratio) ratio = "1:1";
      }

      generatingRef.current.add(description);
      setGeneratingImages((prev) => new Set(prev).add(description));

      try {
        const result = await aiImageGen.generateImageAndWait(
          { prompt: description, aspectRatio: ratio },
          (status) => {
            const placeholders = document.querySelectorAll(
              ".ai-image-placeholder",
            );
            for (const p of placeholders) {
              const btn = p.querySelector(
                ".ai-image-generate-btn",
              ) as HTMLButtonElement;
              const btnDesc = btn?.dataset.description || "";
              const btnDescUnescaped = btnDesc
                .replace(/&#34;/g, '"')
                .replace(/&#39;/g, "'");
              if (
                btn &&
                (btnDesc === description || btnDescUnescaped === description)
              ) {
                const statusEl = p.querySelector(".ai-image-status");
                if (statusEl) statusEl.textContent = status;
                break;
              }
            }
          },
        );

        if (result.success && result.imageUrl) {
          setGeneratedImages((prev) => ({
            ...prev,
            [description]: `${result.imageUrl}|${ratio}`,
          }));
        }
      } catch (error) {
        console.error("Image generation error:", error);
      } finally {
        generatingRef.current.delete(description);
        setGeneratingImages((prev) => {
          const next = new Set(prev);
          next.delete(description);
          return next;
        });
      }
    },
    [],
  );

  useEffect(() => {
    if (!previewRef.current) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const ratioBtn = target.closest(".ai-image-ratio-btn");
      if (ratioBtn) {
        const button = ratioBtn as HTMLButtonElement;
        const ratio = button.dataset.ratio || "1:1";
        const placeholder = button.closest(".ai-image-placeholder");
        if (placeholder) {
          placeholder.setAttribute("data-ratio", ratio);
          const siblings = placeholder.querySelectorAll(".ai-image-ratio-btn");
          siblings.forEach((btn) => btn.classList.remove("active"));
          button.classList.add("active");
        }
        return;
      }

      const generateBtn = target.closest(".ai-image-generate-btn");
      if (generateBtn) {
        const button = generateBtn as HTMLButtonElement;
        const buttonDesc = button.dataset.description || "";
        const unescapedDesc = buttonDesc
          .replace(/&#34;/g, '"')
          .replace(/&#39;/g, "'");
        const placeholder = button.closest(".ai-image-placeholder");
        const ratio = placeholder?.getAttribute("data-ratio") || "1:1";

        if (!generatingRef.current.has(unescapedDesc)) {
          handleGenerateImage(unescapedDesc, ratio);
        }
        return;
      }

      const actionBtn = target.closest(".ai-image-action-btn");
      if (actionBtn) {
        const button = actionBtn as HTMLButtonElement;
        const action = button.dataset.action;
        const wrapper = button.closest(".ai-image-wrapper");
        if (!wrapper) return;

        const ratio = wrapper.getAttribute("data-ratio") || "1:1";

        if (action === "regenerate") {
          const currentDescriptions = getCurrentAIDescriptions();
          let description = currentDescriptions[0]?.content || "";
          if (!description) {
            const escapedDesc = wrapper.getAttribute("data-description") || "";
            description = escapedDesc
              .replace(/&#34;/g, '"')
              .replace(/&#39;/g, "'");
          }
          if (generatingRef.current.has(description)) return;

          const escapedDesc = description
            .replace(/"/g, "&#34;")
            .replace(/'/g, "&#39;");
          wrapper.outerHTML = `<div class="ai-image-placeholder" data-description="${escapedDesc}" data-ratio="${ratio}"><div class="ai-image-icon">🎨</div><div class="ai-image-ratio-selector"><button class="ai-image-ratio-btn ${ratio === "1:1" ? "active" : ""}" data-ratio="1:1">1:1</button><button class="ai-image-ratio-btn ${ratio === "16:9" ? "active" : ""}" data-ratio="16:9">16:9</button><button class="ai-image-ratio-btn ${ratio === "9:16" ? "active" : ""}" data-ratio="9:16">9:16</button><button class="ai-image-ratio-btn ${ratio === "4:3" ? "active" : ""}" data-ratio="4:3">4:3</button><button class="ai-image-ratio-btn ${ratio === "3:4" ? "active" : ""}" data-ratio="3:4">3:4</button></div><button class="ai-image-generate-btn" data-description="${escapedDesc}" disabled>⏳ Generating...</button><div class="ai-image-status">Regenerating...</div></div>`;

          setGeneratedImages((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((k) => {
              if (k === description) delete next[k];
            });
            return next;
          });

          setTimeout(() => handleGenerateImage(description, ratio), 50);
        } else if (action === "clear") {
          const rawDesc = wrapper.getAttribute("data-description") || "";
          const description = rawDesc
            .replace(/&#34;/g, '"')
            .replace(/&#39;/g, "'");

          setGeneratedImages((prev) => {
            const next = { ...prev };
            delete next[description];
            return next;
          });
          setGeneratingImages((prev) => {
            const next = new Set(prev);
            next.delete(description);
            return next;
          });
          generatingRef.current.delete(description);

          const escapedDesc = description
            .replace(/"/g, "&#34;")
            .replace(/'/g, "&#39;");
          wrapper.outerHTML = `<div class="ai-image-placeholder" data-description="${escapedDesc}" data-ratio="${ratio}"><div class="ai-image-icon">🎨</div><div class="ai-image-ratio-selector"><button class="ai-image-ratio-btn ${ratio === "1:1" ? "active" : ""}" data-ratio="1:1">1:1</button><button class="ai-image-ratio-btn ${ratio === "16:9" ? "active" : ""}" data-ratio="16:9">16:9</button><button class="ai-image-ratio-btn ${ratio === "9:16" ? "active" : ""}" data-ratio="9:16">9:16</button><button class="ai-image-ratio-btn ${ratio === "4:3" ? "active" : ""}" data-ratio="4:3">4:3</button><button class="ai-image-ratio-btn ${ratio === "3:4" ? "active" : ""}" data-ratio="3:4">3:4</button></div><button class="ai-image-generate-btn" data-description="${escapedDesc}">✨ Generate Image</button><div class="ai-image-status"></div></div>`;
        }
        return;
      }
    };

    previewRef.current.addEventListener("click", handleClick);
    return () => previewRef.current?.removeEventListener("click", handleClick);
  }, [handleGenerateImage, getCurrentAIDescriptions]);

  useEffect(() => {
    if (!previewRef.current) return;

    const buttons = previewRef.current.querySelectorAll<HTMLButtonElement>(
      ".ai-image-generate-btn",
    );

    buttons.forEach((btn) => {
      const description = btn.dataset.description || "";
      btn.disabled = generatingImages.has(description);
      if (generatingImages.has(description)) {
        btn.textContent = "⏳ Generating...";
      } else {
        btn.textContent = "✨ Generate Image";
      }
    });
  }, [generatingImages]);

  useEffect(() => {
    if (!previewRef.current) return;

    Object.entries(generatedImages).forEach(([description, imageData]) => {
      const [imageUrl, ratio] = imageData.split("|");

      const aspectClass: Record<string, string> = {
        "1:1": "aspect-square",
        "16:9": "aspect-video",
        "9:16": "aspect-9-16",
        "4:3": "aspect-4-3",
        "3:4": "aspect-3-4",
      };
      const imgClass = aspectClass[ratio] || "";

      const allWrappers =
        previewRef.current!.querySelectorAll(".ai-image-wrapper");
      let existingWrapper: Element | null = null;

      for (const wrapper of allWrappers) {
        const wrapperDesc = wrapper.getAttribute("data-description") || "";
        const unescapedWrapperDesc = wrapperDesc
          .replace(/&#34;/g, '"')
          .replace(/&#39;/g, "'");
        if (unescapedWrapperDesc === description) {
          existingWrapper = wrapper;
          break;
        }
      }

      if (existingWrapper) {
        const escapedDesc = description
          .replace(/"/g, "&#34;")
          .replace(/'/g, "&#39;");
        existingWrapper.setAttribute("data-description", escapedDesc);
        const img = existingWrapper.querySelector("img");
        if (img) {
          img.src = imageUrl;
          img.className = imgClass
            ? `ai-image-result ${imgClass}`
            : "ai-image-result";
        }
        existingWrapper.setAttribute("data-image-url", imageUrl);
        existingWrapper.setAttribute("data-ratio", ratio);

        const generatingIndicator = existingWrapper.querySelector(
          ".ai-image-generating",
        );
        if (generatingIndicator) {
          generatingIndicator.remove();
        }
        return;
      }

      let placeholder: Element | null = null;
      const allPlaceholders = previewRef.current!.querySelectorAll(
        ".ai-image-placeholder",
      );

      for (const p of allPlaceholders) {
        const btn = p.querySelector(
          ".ai-image-generate-btn",
        ) as HTMLButtonElement;
        if (btn) {
          const btnDesc = btn.dataset.description || "";
          const unescapedBtnDesc = btnDesc
            .replace(/&#34;/g, '"')
            .replace(/&#39;/g, "'");
          if (unescapedBtnDesc === description) {
            placeholder = p;
            break;
          }
        }
      }

      if (placeholder && !placeholder.querySelector("img")) {
        const escapedDesc = description
          .replace(/"/g, "&#34;")
          .replace(/'/g, "&#39;");
        placeholder.outerHTML = `<div class="ai-image-wrapper" data-description="${escapedDesc}" data-ratio="${ratio}" data-image-url="${imageUrl}"><img src="${imageUrl}" alt="AI generated image" class="ai-image-result ${imgClass}" /><div class="ai-image-overlay"><button class="ai-image-action-btn ai-image-regenerate" data-description="${escapedDesc}" data-action="regenerate" title="Regenerate image">🔄</button><button class="ai-image-action-btn ai-image-clear" data-description="${escapedDesc}" data-action="clear" title="Clear image">✕</button></div></div>`;
      }
    });
  }, [generatedImages]);

  return (
    <div className={`preview-container theme-${currentTheme.category}`} style={{ '--hero-bg': `linear-gradient(135deg, ${currentTheme.styles.accent} 0%, ${adjustColor(currentTheme.styles.accent, -30)} 100%)`, '--hero-text': 'white' } as React.CSSProperties}>
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
        .preview-content .hljs-comment,
        .preview-content .hljs-quote { color: #8b949e; font-style: italic; }
        .preview-content .hljs-doctag { color: #ff7b72; }
        .preview-content .hljs-function { color: #d2a8ff; }
        .preview-content .hljs-tag { color: #7ee787; }
        .preview-content .hljs-name { color: #7ee787; }
        .preview-content .hljs-regexp { color: #7ee787; }
        .preview-content .hljs-symbol { color: #ffa657; }
        .preview-content .hljs-bullet { color: #ffab70; }
        .preview-content .hljs-link { color: #a5d6ff; text-decoration: underline; }
        .preview-content .hljs-meta { color: #79c0ff; }
        .preview-content .hljs-meta-keyword { color: #ff7b72; }
        .preview-content .hljs-addition { color: #7ee787; background: rgba(126, 231, 135, 0.15); }
        .preview-content .hljs-deletion { color: #ffa198; background: rgba(255, 161, 152, 0.15); }
        .preview-content .hljs-emphasis { font-style: italic; }
        .preview-content .hljs-strong { font-weight: bold; }
        .preview-content .hljs-property { color: #79c0ff; }
        .preview-content .hljs-attribute { color: #a5d6ff; }
        .preview-content .hljs-selector-id { color: #79c0ff; }
        .preview-content .hljs-selector-class { color: #7ee787; }
        .preview-content .hljs-section { color: #d2a8ff; font-weight: 600; }

        /* Light Theme Code Syntax Highlighting - High Contrast */
        .theme-light .preview-content pre code { color: #24292e; font-size: 0.875em; }
        .theme-light .preview-content .hljs-keyword,
        .theme-light .preview-content .hljs-keyword,
        .theme-light .preview-content .hljs-selector-tag,
        .theme-light .preview-content .hljs-built_in { color: #d73a49; font-weight: 600; }
        .theme-light .preview-content .hljs-type,
        .theme-light .preview-content .hljs-title,
        .theme-light .preview-content .hljs-title.class_,
        .theme-light .preview-content .hljs-title.function_ { color: #6f42c1; font-weight: 600; }
        .theme-light .preview-content .hljs-string,
        .theme-light .preview-content .hljs-attr,
        .theme-light .preview-content .hljs-template-variable,
        .theme-light .preview-content .hljs-meta-string { color: #032f62; }
        .theme-light .preview-content .hljs-number,
        .theme-light .preview-content .hljs-literal { color: #005cc5; }
        .theme-light .preview-content .hljs-variable,
        .theme-light .preview-content .hljs-variable-language,
        .theme-light .preview-content .hljs-params { color: #e36209; }
        .theme-light .preview-content .hljs-comment,
        .theme-light .preview-content .hljs-quote { color: #6a737d; font-style: italic; }
        .theme-light .preview-content .hljs-doctag { color: #d73a49; }
        .theme-light .preview-content .hljs-function { color: #6f42c1; }
        .theme-light .preview-content .hljs-tag { color: #22863a; }
        .theme-light .preview-content .hljs-name { color: #22863a; }
        .theme-light .preview-content .hljs-regexp { color: #032f62; }
        .theme-light .preview-content .hljs-symbol { color: #e36209; }
        .theme-light .preview-content .hljs-bullet { color: #005cc5; }
        .theme-light .preview-content .hljs-link { color: #032f62; text-decoration: underline; }
        .theme-light .preview-content .hljs-meta { color: #005cc5; }
        .theme-light .preview-content .hljs-meta-keyword { color: #d73a49; }
        .theme-light .preview-content .hljs-addition { color: #22863a; background: rgba(34, 134, 58, 0.1); }
        .theme-light .preview-content .hljs-deletion { color: #b31d28; background: rgba(179, 29, 40, 0.1); }
        .theme-light .preview-content .hljs-emphasis { font-style: italic; }
        .theme-light .preview-content .hljs-strong { font-weight: bold; }
        .theme-light .preview-content .hljs-property { color: #005cc5; }
        .theme-light .preview-content .hljs-attribute { color: #6f42c1; }
        .theme-light .preview-content .hljs-selector-id { color: #6f42c1; }
        .theme-light .preview-content .hljs-selector-class { color: #22863a; }
        .theme-light .preview-content .hljs-section { color: #6f42c1; font-weight: 600; }
        .preview-content blockquote { border-left: 4px solid #667eea; padding: 0.75em 1.25em; margin: 1.5em 0; background: linear-gradient(90deg, rgba(102,126,234,0.08) 0%, transparent 100%); border-radius: 0 8px 8px 0; font-style: italic; color: #4a5568; }
        .preview-content hr { border: none; height: 2px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 2em 0; }
        .preview-content img { max-width: 100%; height: auto; border-radius: 12px; margin: 1.5em 0; }
        .preview-content table { width: 100%; border-collapse: collapse; margin: 1.5em 0; }
        .preview-content th { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 16px; text-align: left; font-weight: 600; }
        .preview-content td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; }
        .preview-content tr:hover td { background: #f8fafc; }
        
        /* ========================
           AI IMAGE - Refined Elegant
           ======================== */
        .ai-image-placeholder { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          padding: 56px 32px; 
          border: 2px dashed #cbd5e1; 
          border-radius: 24px; 
          margin: 32px 0; 
          background: linear-gradient(145deg, #fafbfc 0%, #f1f5f9 100%); 
          min-height: 280px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ai-image-placeholder:hover { border-color: #667eea; background: linear-gradient(145deg, #f0f4ff 0%, #e8eef5 100%); transform: translateY(-2px); box-shadow: 0 20px 40px rgba(102, 126, 234, 0.1); }
        .ai-image-icon { font-size: 64px; margin-bottom: 20px; animation: float 3.5s ease-in-out infinite; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1)); }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(3deg); } }
        .ai-image-ratio-selector { display: flex; gap: 10px; margin-bottom: 20px; background: white; padding: 6px; border-radius: 50px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .ai-image-ratio-btn { 
          padding: 10px 20px; 
          border: none; 
          border-radius: 50px; 
          background: transparent; 
          cursor: pointer; 
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ai-image-ratio-btn:hover { color: #667eea; background: rgba(102, 126, 234, 0.08); transform: scale(1.05); }
        .ai-image-ratio-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35); }
        .ai-image-generate-btn { 
          padding: 16px 40px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          border: none; 
          border-radius: 50px; 
          cursor: pointer; 
          font-size: 15px; 
          font-weight: 600;
          letter-spacing: 0.02em;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.35);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ai-image-generate-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(102, 126, 234, 0.45); }
        .ai-image-generate-btn:disabled { background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%); cursor: not-allowed; box-shadow: none; transform: none; }
        .ai-image-status { margin-top: 16px; font-size: 13px; color: #94a3b8; font-weight: 500; }
        .ai-image-wrapper { position: relative; display: inline-block; margin: 32px 0; width: 100%; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.12); }
        .ai-image-wrapper img { width: 100%; height: auto; display: block; transition: transform 0.5s ease; }
        .ai-image-wrapper:hover img { transform: scale(1.02); }
        .ai-image-wrapper .aspect-square { aspect-ratio: 1/1; }
        .ai-image-wrapper .aspect-video { aspect-ratio: 16/9; }
        .ai-image-wrapper .aspect-9-16 { aspect-ratio: 9/16; }
        .ai-image-wrapper .aspect-4-3 { aspect-ratio: 4/3; }
        .ai-image-wrapper .aspect-3-4 { aspect-ratio: 3/4; }
        .ai-image-overlay { position: absolute; top: 16px; right: 16px; display: flex; gap: 10px; opacity: 0; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); transform: translateY(-10px); }
        .ai-image-wrapper:hover .ai-image-overlay { opacity: 1; transform: translateY(0); }
        .ai-image-action-btn { width: 44px; height: 44px; border: none; border-radius: 50%; background: rgba(255,255,255,0.98); color: #1e293b; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(0,0,0,0.15); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .ai-image-action-btn:hover { transform: scale(1.15) rotate(5deg); background: white; }
        .ai-image-generating { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.85); display: flex; align-items: center; justify-content: center; color: white; font-size: 15px; font-weight: 500; backdrop-filter: blur(8px); }
        .ai-image-generating::before { content: ''; width: 28px; height: 28px; border: 3px solid rgba(255,255,255,0.2); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 12px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        /* ========================

        
        /* ========================
           COLUMNS - Modern Grid
           ======================== */
        .columns-component { display: grid; gap: 28px; margin: 36px 0; }
        .columns-component.col-2 { grid-template-columns: repeat(2, 1fr); }
        .columns-component.col-3 { grid-template-columns: repeat(3, 1fr); }
        .columns-component.col-4 { grid-template-columns: repeat(4, 1fr); }
        .column-item { 
          padding: 28px; 
          border: 1px solid rgba(0,0,0,0.06); 
          border-radius: 20px; 
          background: white;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 16px rgba(0,0,0,0.03);
        }
        .column-item:hover { transform: translateY(-8px); box-shadow: 0 24px 48px rgba(0,0,0,0.08); border-color: rgba(102,126,234,0.2); }
        
        /* ========================
           STEPS - Connected Journey
           ======================== */
        .steps-component { 
          margin: 36px 0; 
          padding: 0; 
          list-style: none; 
          counter-reset: step;
        }
        .step-item { 
          display: flex; 
          gap: 24px; 
          margin-bottom: 28px; 
          padding: 28px; 
          border: none; 
          border-radius: 20px; 
          background: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .step-item:hover { transform: translateX(12px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
        .step-item::before { content: ''; position: absolute; left: 74px; top: 100%; width: 2px; height: 28px; background: linear-gradient(180deg, #667eea, #e2e8f0); }
        .step-item:last-child::before { display: none; }
        .step-number { 
          width: 56px; 
          height: 56px; 
          min-width: 56px; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-weight: 800; 
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-size: 20px;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35);
        }
        .step-content { flex: 1; padding-top: 6px; }
        .step-title { font-weight: 700; margin-bottom: 10px; font-size: 1.125em; color: #0f172a; }
        .step-description { font-size: 0.9375em; color: #64748b; line-height: 1.7; }
        
        /* ========================
           TIMELINE - Flowing Path
           ======================== */
        .timeline-component { 
          margin: 36px 0; 
          padding: 24px 0 24px 40px; 
          border-left: 3px solid #e2e8f0;
          position: relative;
        }
        .timeline-component::before { content: ''; position: absolute; left: -3px; top: 0; bottom: 0; width: 3px; background: linear-gradient(180deg, #667eea 0%, #764ba2 50%, #e2e8f0 100%); }
        .timeline-item { 
          position: relative; 
          padding: 24px 28px;
          margin-bottom: 28px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .timeline-item:hover { transform: translateX(8px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
        .timeline-item::before { 
          content: ''; 
          position: absolute; 
          left: -49px; 
          top: 28px; 
          width: 18px; 
          height: 18px; 
          border-radius: 50%; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
        }
        .timeline-title { font-weight: 700; margin-bottom: 10px; font-size: 1.125em; color: #0f172a; }
        .timeline-body { font-size: 0.9375em; color: #64748b; line-height: 1.7; }
        
        /* ========================
           CARD - Elevated Content
           ======================== */
        .card-component { 
          padding: 32px; 
          border: none; 
          border-radius: 24px; 
          margin: 28px 0; 
          background: white;
          box-shadow: 0 8px 32px rgba(0,0,0,0.06);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .card-component::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #667eea, #764ba2, #f093fb); }
        .card-component:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.1); }
        .card-component p { margin: 0 !important; line-height: 1.8; color: #334155; }
        
        /* ========================
           VIDEO - Cinematic
           ======================== */
        .video-component { 
          margin: 28px 0; 
          border-radius: 20px; 
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .video-player { width: 100%; max-width: 100%; border-radius: 20px; }
        .video-caption { 
          text-align: center; 
          font-size: 0.875em; 
          color: #64748b; 
          margin-top: 14px; 
          padding: 14px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 0 0 12px 12px;
        }
        
        /* ========================
           LOCAL IMAGE - Gallery
           ======================== */
        .local-image-wrapper { 
          margin: 28px 0; 
          border-radius: 20px; 
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .local-image-wrapper:hover { transform: scale(1.01); box-shadow: 0 24px 64px rgba(0,0,0,0.15); }
        .local-image { width: 100%; border-radius: 20px; display: block; }
        .local-image-caption { 
          text-align: center; 
          font-size: 0.875em; 
          color: #64748b; 
          margin-top: 14px; 
          font-style: italic;
          padding: 18px;
          background: linear-gradient(135deg, #f8fafc 0%, #fff 100%);
        }
        
        /* ========================
           CALLOUT - Vibrant Notices
           ======================== */
        .callout-component { 
          padding: 24px 28px; 
          border-radius: 16px; 
          margin: 24px 0; 
          position: relative;
          overflow: hidden;
        }
        .callout-component::before { content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 5px; border-radius: 16px 0 0 16px; }
        .callout-component.callout-info { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); }
        .callout-component.callout-info::before { background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); }
        .callout-component.callout-warning { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); }
        .callout-component.callout-warning::before { background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%); }
        .callout-component.callout-error { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); }
        .callout-component.callout-error::before { background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%); }
        .callout-component.callout-success { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); }
        .callout-component.callout-success::before { background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%); }
        .callout-header { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
        .callout-icon { font-size: 24px; }
        .callout-title { font-weight: 700; font-size: 1em; }
        .callout-content { font-size: 0.9375em; line-height: 1.7; }
        
        /* ========================
           QUOTE - Editorial
           ======================== */
        .quote-component { 
          padding: 36px 40px; 
          margin: 32px 0; 
          border: none;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-radius: 20px;
          position: relative;
        }
        .quote-component::before { 
          content: '"'; 
          position: absolute; 
          top: 0px; 
          left: 24px; 
          font-size: 120px; 
          color: rgba(255,255,255,0.06); 
          font-family: Georgia, serif;
          line-height: 1;
        }
        .quote-content { 
          font-size: 1.25em; 
          line-height: 1.85; 
          color: white;
          font-style: italic;
          position: relative;
        }
        .quote-attribution { 
          margin-top: 20px; 
          font-size: 0.875em; 
          color: rgba(255,255,255,0.6);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .quote-attribution::before { content: ''; width: 32px; height: 2px; background: rgba(255,255,255,0.2); }
        .quote-author { font-weight: 600; color: white; }
        
        /* ========================
           TABS - Modern Pills
           ======================== */
        .tabs-component { 
          margin: 28px 0; 
          border: none; 
          border-radius: 20px; 
          overflow: hidden;
          background: white;
          box-shadow: 0 8px 32px rgba(0,0,0,0.06);
        }
        .tab-item { border-bottom: 1px solid #f1f5f9; }
        .tab-item:last-child { border-bottom: none; }
        .tab-title { 
          padding: 20px 28px; 
          cursor: pointer; 
          font-weight: 600; 
          background: white;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 1em;
          color: #334155;
        }
        .tab-title:hover { background: #f8fafc; }
        .tab-title::after { content: '+'; font-size: 20px; color: #94a3b8; transition: all 0.3s ease; font-weight: 400; }
        .tab-item.active .tab-title { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .tab-item.active .tab-title::after { transform: rotate(45deg); color: white; }
        .tab-content { 
          padding: 0 28px 24px; 
          display: none; 
          line-height: 1.8;
          color: #475569;
        }
        .tab-item.active .tab-content { display: block; }
        
        /* ========================
           ACCORDION - Smooth Expand
           ======================== */
        .accordion-component { margin: 28px 0; }
        .accordion-item { 
          border: none; 
          border-radius: 16px; 
          margin-bottom: 14px; 
          overflow: hidden;
          background: white;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
        }
        .accordion-title { 
          padding: 20px 28px; 
          cursor: pointer; 
          font-weight: 600; 
          background: white;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 1em;
          color: #334155;
        }
        .accordion-title:hover { background: #f8fafc; }
        .accordion-title::after { content: '+'; font-size: 22px; color: #667eea; transition: all 0.3s ease; font-weight: 400; }
        .accordion-item[open] .accordion-title { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .accordion-item[open] .accordion-title::after { transform: rotate(45deg); }
        .accordion-content { 
          padding: 0 28px 24px; 
          line-height: 1.8;
          color: #475569;
        }
      `}</style>
    <div>
      <style>{currentTheme.css}</style>
      <style>{`
        /* AI Image Styles - Modern & Clean */
        .ai-image-placeholder { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          padding: 48px 24px; 
          border: 2px dashed #e0e0e0; 
          border-radius: 16px; 
          margin: 24px 0; 
          background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%); 
          min-height: 240px;
          transition: all 0.3s ease;
        }
        .ai-image-placeholder:hover { border-color: #4a90d9; background: linear-gradient(135deg, #f0f7ff 0%, #fff 100%); }
        .ai-image-icon { font-size: 56px; margin-bottom: 16px; animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .ai-image-ratio-selector { display: flex; gap: 8px; margin-bottom: 16px; }
        .ai-image-ratio-btn { 
          padding: 8px 16px; 
          border: 1px solid #ddd; 
          border-radius: 20px; 
          background: white; 
          cursor: pointer; 
          font-size: 13px;
          transition: all 0.2s ease;
        }
        .ai-image-ratio-btn:hover { border-color: #4a90d9; color: #4a90d9; transform: translateY(-2px); }
        .ai-image-ratio-btn.active { background: linear-gradient(135deg, #4a90d9 0%, #357abd 100%); color: white; border-color: transparent; box-shadow: 0 4px 12px rgba(74, 144, 217, 0.3); }
        .ai-image-generate-btn { 
          padding: 14px 32px; 
          background: linear-gradient(135deg, #4a90d9 0%, #357abd 100%); 
          color: white; 
          border: none; 
          border-radius: 25px; 
          cursor: pointer; 
          font-size: 15px; 
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(74, 144, 217, 0.4);
          transition: all 0.3s ease;
        }
        .ai-image-generate-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(74, 144, 217, 0.5); }
        .ai-image-generate-btn:disabled { background: linear-gradient(135deg, #bbb 0%, #999 100%); cursor: not-allowed; box-shadow: none; transform: none; }
        .ai-image-status { margin-top: 12px; font-size: 13px; color: #888; }
        .ai-image-wrapper { position: relative; display: inline-block; margin: 24px 0; width: 100%; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
        .ai-image-wrapper img { width: 100%; height: auto; display: block; }
        .ai-image-wrapper .aspect-square { aspect-ratio: 1/1; }
        .ai-image-wrapper .aspect-video { aspect-ratio: 16/9; }
        .ai-image-wrapper .aspect-9-16 { aspect-ratio: 9/16; }
        .ai-image-wrapper .aspect-4-3 { aspect-ratio: 4/3; }
        .ai-image-wrapper .aspect-3-4 { aspect-ratio: 3/4; }
        .ai-image-overlay { position: absolute; top: 12px; right: 12px; display: flex; gap: 8px; opacity: 0; transition: all 0.3s ease; transform: translateY(-10px); }
        .ai-image-wrapper:hover .ai-image-overlay { opacity: 1; transform: translateY(0); }
        .ai-image-action-btn { width: 40px; height: 40px; border: none; border-radius: 50%; background: rgba(255,255,255,0.95); color: #333; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.2s ease; }
        .ai-image-action-btn:hover { transform: scale(1.1); background: white; }
        .ai-image-generating { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; backdrop-filter: blur(4px); }
        .ai-image-generating::after { content: ''; width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; margin-left: 12px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        

        
        /* Columns Component - Modern Grid */
        .columns-component { display: grid; gap: 24px; margin: 32px 0; }
        .columns-component.col-2 { grid-template-columns: repeat(2, 1fr); }
        .columns-component.col-3 { grid-template-columns: repeat(3, 1fr); }
        .columns-component.col-4 { grid-template-columns: repeat(4, 1fr); }
        .column-item { 
          padding: 24px; 
          border: 1px solid #eee; 
          border-radius: 16px; 
          background: white;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .column-item:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); border-color: #4a90d9; }
        
        /* Steps Component - Connected Flow */
        .steps-component { 
          margin: 32px 0; 
          padding: 0; 
          list-style: none; 
          counter-reset: step;
        }
        .step-item { 
          display: flex; 
          gap: 20px; 
          margin-bottom: 24px; 
          padding: 24px; 
          border: none; 
          border-radius: 16px; 
          background: white;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
          position: relative;
        }
        .step-item:hover { transform: translateX(8px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .step-number { 
          width: 48px; 
          height: 48px; 
          min-width: 48px; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-weight: 700; 
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .step-content { flex: 1; padding-top: 4px; }
        .step-title { font-weight: 700; margin-bottom: 8px; font-size: 17px; color: #1a1a2e; }
        .step-description { font-size: 14px; color: #666; line-height: 1.6; }
        
        /* Timeline Component - Elegant Line */
        .timeline-component { 
          margin: 32px 0; 
          padding: 20px 0 20px 30px; 
          border-left: 3px solid linear-gradient(180deg, #667eea 0%, #764ba2 100%);
          background: linear-gradient(90deg, rgba(102,126,234,0.05) 0%, transparent 100%);
        }
        .timeline-item { 
          position: relative; 
          padding-left: 28px; 
          margin-bottom: 32px; 
          padding: 20px 24px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
        }
        .timeline-item:hover { transform: translateX(4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .timeline-item::before { 
          content: ''; 
          position: absolute; 
          left: -39px; 
          top: 24px; 
          width: 16px; 
          height: 16px; 
          border-radius: 50%; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
        }
        .timeline-title { font-weight: 700; margin-bottom: 8px; font-size: 17px; color: #1a1a2e; }
        .timeline-body { font-size: 14px; color: #666; line-height: 1.7; }
        
        /* Card Component - Modern Elevated */
        .card-component { 
          padding: 28px; 
          border: none; 
          border-radius: 20px; 
          margin: 24px 0; 
          background: white;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .card-component::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); }
        .card-component:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.12); }
        .card-component p { margin: 0 !important; line-height: 1.8; color: #444; }
        
        /* Video Component - Cinema Style */
        .video-component { 
          margin: 24px 0; 
          border-radius: 16px; 
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }
        .video-player { width: 100%; max-width: 100%; border-radius: 16px; }
        .video-caption { 
          text-align: center; 
          font-size: 14px; 
          color: #666; 
          margin-top: 12px; 
          padding: 12px;
          background: #f8f9fa;
          border-radius: 0 0 8px 8px;
        }
        
        /* Local Image - Framed */
        .local-image-wrapper { 
          margin: 24px 0; 
          border-radius: 16px; 
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .local-image-wrapper:hover { transform: scale(1.01); box-shadow: 0 16px 48px rgba(0,0,0,0.15); }
        .local-image { width: 100%; border-radius: 16px; display: block; }
        .local-image-caption { 
          text-align: center; 
          font-size: 14px; 
          color: #666; 
          margin-top: 12px; 
          font-style: italic;
          background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
          padding: 16px;
        }
        
        /* Callout Component - Vibrant & Modern */
        .callout-component { 
          padding: 20px 24px; 
          border-radius: 12px; 
          margin: 20px 0; 
          border-left: none;
          position: relative;
          overflow: hidden;
        }
        .callout-component::before { content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 4px; }
        .callout-component.callout-info { background: linear-gradient(135deg, #e3f2fd 0%, #f5f9ff 100%); }
        .callout-component.callout-info::before { background: linear-gradient(180deg, #2196f3 0%, #1976d2 100%); }
        .callout-component.callout-warning { background: linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%); }
        .callout-component.callout-warning::before { background: linear-gradient(180deg, #ff9800 0%, #f57c00 100%); }
        .callout-component.callout-error { background: linear-gradient(135deg, #ffebee 0%, #fff5f5 100%); }
        .callout-component.callout-error::before { background: linear-gradient(180deg, #f44336 0%, #d32f2f 100%); }
        .callout-component.callout-success { background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%); }
        .callout-component.callout-success::before { background: linear-gradient(180deg, #4caf50 0%, #388e3c 100%); }
        .callout-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .callout-icon { font-size: 22px; }
        .callout-title { font-weight: 700; font-size: 16px; }
        .callout-content { font-size: 14px; line-height: 1.7; }
        
        /* Quote Component - Editorial Style */
        .quote-component { 
          padding: 28px 32px; 
          margin: 24px 0; 
          border: none;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 16px;
          position: relative;
        }
        .quote-component::before { 
          content: '"'; 
          position: absolute; 
          top: 8px; 
          left: 20px; 
          font-size: 80px; 
          color: rgba(255,255,255,0.1); 
          font-family: Georgia, serif;
          line-height: 1;
        }
        .quote-content { 
          font-size: 18px; 
          line-height: 1.8; 
          color: white;
          font-style: italic;
          position: relative;
        }
        .quote-attribution { 
          margin-top: 16px; 
          font-size: 14px; 
          color: rgba(255,255,255,0.7);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .quote-attribution::before { content: ''; width: 24px; height: 2px; background: rgba(255,255,255,0.3); }
        .quote-author { font-weight: 600; }
        
        /* Tabs Component - Modern Pills */
        .tabs-component { 
          margin: 24px 0; 
          border: none; 
          border-radius: 16px; 
          overflow: hidden;
          background: white;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }
        .tab-item { border-bottom: 1px solid #f0f0f0; }
        .tab-item:last-child { border-bottom: none; }
        .tab-title { 
          padding: 18px 24px; 
          cursor: pointer; 
          font-weight: 600; 
          background: white;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tab-title:hover { background: #f8f9fa; }
        .tab-title::after { content: '+'; font-size: 18px; color: #999; transition: transform 0.2s ease; }
        .tab-item.active .tab-title { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .tab-item.active .tab-title::after { transform: rotate(45deg); color: white; }
        .tab-content { 
          padding: 0 24px 24px; 
          display: none; 
          line-height: 1.7;
          color: #444;
        }
        .tab-item.active .tab-content { display: block; }
        
        /* Accordion Component - Smooth Expand */
        .accordion-component { margin: 24px 0; }
        .accordion-item { 
          border: none; 
          border-radius: 12px; 
          margin-bottom: 12px; 
          overflow: hidden;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .accordion-title { 
          padding: 18px 24px; 
          cursor: pointer; 
          font-weight: 600; 
          background: white;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .accordion-title:hover { background: #f8f9fa; }
        .accordion-title::after { content: '+'; font-size: 20px; color: #667eea; transition: transform 0.3s ease; }
        .accordion-item[open] .accordion-title::after { transform: rotate(45deg); }
        .accordion-item[open] .accordion-title { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .accordion-content { 
          padding: 0 24px 20px; 
          line-height: 1.7;
          color: #444;
        }
      `}</style>
      <style>{`
        /* AI Image Styles */
        .ai-image-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; border: 2px dashed #ccc; border-radius: 8px; margin: 16px 0; background: #fafafa; min-height: 200px; }
        .ai-image-icon { font-size: 48px; margin-bottom: 12px; }
        .ai-image-ratio-selector { display: flex; gap: 8px; margin-bottom: 12px; }
        .ai-image-ratio-btn { padding: 4px 12px; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer; font-size: 12px; }
        .ai-image-ratio-btn.active { background: #4a90d9; color: white; border-color: #4a90d9; }
        .ai-image-generate-btn { padding: 10px 24px; background: #4a90d9; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; }
        .ai-image-generate-btn:disabled { background: #ccc; cursor: not-allowed; }
        .ai-image-status { margin-top: 8px; font-size: 12px; color: #666; }
        .ai-image-wrapper { position: relative; display: inline-block; margin: 16px 0; width: 100%; }
        .ai-image-wrapper img { width: 100%; height: auto; border-radius: 8px; }
        .ai-image-wrapper .aspect-square { aspect-ratio: 1/1; }
        .ai-image-wrapper .aspect-video { aspect-ratio: 16/9; }
        .ai-image-wrapper .aspect-9-16 { aspect-ratio: 9/16; }
        .ai-image-wrapper .aspect-4-3 { aspect-ratio: 4/3; }
        .ai-image-wrapper .aspect-3-4 { aspect-ratio: 3/4; }
        .ai-image-overlay { position: absolute; top: 8px; right: 8px; display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; }
        .ai-image-wrapper:hover .ai-image-overlay { opacity: 1; }
        .ai-image-action-btn { width: 32px; height: 32px; border: none; border-radius: 50%; background: rgba(0,0,0,0.6); color: white; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }
        .ai-image-action-btn:hover { background: rgba(0,0,0,0.8); }
        .ai-image-generating { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.7); color: white; padding: 12px 24px; border-radius: 8px; font-size: 14px; }
        
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
    </div>
);
}

