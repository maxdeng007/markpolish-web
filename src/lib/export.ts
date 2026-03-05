import { convertMarkdownWithComponents } from "./markdown-components";
import { getTheme } from "./themes";
import { getExportStyles } from "./preview-styles";

// AI Image state interface for export
export interface AIImageExportState {
  description: string;
  ratio: string;
  imageUrl: string | null;
  status: "idle" | "generating" | "done" | "error";
}

export function exportToMarkdown(
  markdown: string,
  filename: string = "document.md",
) {
  const blob = new Blob([markdown], { type: "text/markdown" });
  downloadBlob(blob, filename);
}

// Convert image URL to base64
async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// Export HTML with theme support
export async function exportToHTML(
  markdown: string,
  themeId: string = "wechat-classic",
  aiImageStates: Record<string, AIImageExportState> = {},
  filename: string = "document.html",
) {
  const theme = getTheme(themeId);
  const isDark = theme.category === "dark";
  const sharedStyles = getExportStyles(isDark);

  // Process AI images: convert to base64 and replace placeholders
  const processedMarkdown = await processAIImagesForExport(
    markdown,
    aiImageStates,
  );

  // Convert markdown to HTML
  const contentHtml = convertMarkdownToHTML(processedMarkdown);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Document</title>
  <style>
    /* Base container styles */
    body {
      margin: 0;
      padding: 20px;
      background: ${theme.styles.background};
    }
    .preview-container {
      max-width: 800px;
      margin: 0 auto;
    }
    .preview-content {
      ${theme.styles.background !== "#ffffff" ? `background: ${theme.styles.background};` : ""}
      ${theme.styles.foreground !== "#333333" ? `color: ${theme.styles.foreground};` : ""}
      padding: 20px;
    }
    
    /* Hero gradient variable */
    .preview-content {
      --hero-bg: linear-gradient(135deg, ${theme.styles.accent} 0%, ${adjustColor(theme.styles.accent, -30)} 100%);
      --hero-text: white;
    }
    
    /* Theme CSS */
    ${theme.css}
    
    /* Shared component styles */
    ${sharedStyles}
    
    /* Dark theme class for body */
    ${isDark ? "body { background: " + theme.styles.background + "; }" : ""}
    ${isDark ? ".preview-container { background: " + theme.styles.background + "; }" : ""}
  </style>
</head>
<body>
  <div class="preview-container ${isDark ? "theme-dark" : ""}">
    <div class="preview-content">
      ${contentHtml}
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  downloadBlob(blob, filename);
}

// Process AI images in markdown for export
async function processAIImagesForExport(
  markdown: string,
  aiImageStates: Record<string, AIImageExportState>,
): Promise<string> {
  // Find all [IMG: description] patterns
  const imgRegex = /\[IMG:\s*([^\]]+)\]/g;
  let result = markdown;
  let match;
  let index = 0;

  const replacements: { original: string; replacement: string }[] = [];

  while ((match = imgRegex.exec(markdown)) !== null) {
    const originalMatch = match[0];
    const description = match[1];
    const imageId = `ai-img-${index}`;
    const state = aiImageStates[imageId];

    if (state && state.imageUrl && state.status === "done") {
      // Convert image to base64
      const base64 = await imageUrlToBase64(state.imageUrl);

      if (base64) {
        // Get aspect ratio class
        const aspectClass = getAspectClass(state.ratio);

        // Create export-friendly image HTML
        const replacement = `<div class="ai-image-export ${aspectClass}" data-description="${escapeHtml(description)}">
          <img src="${base64}" alt="${escapeHtml(description)}" />
        </div>`;

        replacements.push({ original: originalMatch, replacement });
      } else {
        // Fallback: keep placeholder text
        replacements.push({
          original: originalMatch,
          replacement: `<div class="ai-image-placeholder" style="padding: 32px; text-align: center; border: 2px dashed #ccc; border-radius: 8px; margin: 16px 0;">
            <p style="color: #666; margin: 0;">🖼️ AI Image: ${escapeHtml(description)}</p>
          </div>`,
        });
      }
    } else {
      // No image generated, show placeholder
      replacements.push({
        original: originalMatch,
        replacement: `<div class="ai-image-placeholder" style="padding: 32px; text-align: center; border: 2px dashed #ccc; border-radius: 8px; margin: 16px 0;">
          <p style="color: #666; margin: 0;">🖼️ AI Image: ${escapeHtml(description)}</p>
        </div>`,
      });
    }

    index++;
  }

  // Apply all replacements
  for (const { original, replacement } of replacements) {
    result = result.replace(original, replacement);
  }

  return result;
}

function getAspectClass(ratio: string): string {
  const map: Record<string, string> = {
    "1:1": "aspect-square",
    "16:9": "aspect-video",
    "9:16": "aspect-9-16",
    "4:3": "aspect-4-3",
    "3:4": "aspect-3-4",
  };
  return map[ratio] || "aspect-square";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Helper to adjust hex color brightness
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// WeChat-specific HTML export
export async function exportForWeChat(
  markdown: string,
  aiImageStates: Record<string, AIImageExportState> = {},
): Promise<void> {
  const wechatStyle = `
    /* WeChat公众号样式 */
    section {
      font-size: 16px;
      color: #333;
      line-height: 1.75;
      letter-spacing: 0.5px;
      word-wrap: break-word;
      font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;
    }
    h1 {
      font-size: 24px;
      font-weight: 600;
      text-align: center;
      margin: 24px 0 16px;
      color: #000;
    }
    h2 {
      font-size: 20px;
      font-weight: 600;
      margin: 24px 0 12px;
      padding-left: 10px;
      border-left: 4px solid #576b95;
      color: #000;
    }
    h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 20px 0 10px;
      color: #000;
    }
    p {
      margin: 12px 0;
      text-align: justify;
    }
    strong {
      font-weight: 600;
      color: #000;
    }
    em {
      font-style: italic;
    }
    a {
      color: #576b95;
      text-decoration: none;
    }
    img {
      max-width: 100%;
      display: block;
      margin: 16px auto;
      border-radius: 4px;
    }
    blockquote {
      border-left: 4px solid #e5e5e5;
      padding-left: 16px;
      margin: 16px 0;
      color: #888;
      font-style: italic;
    }
    code {
      background: #f7f7f7;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #d14;
    }
    pre {
      background: #f7f7f7;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 16px 0;
    }
    pre code {
      background: none;
      padding: 0;
      color: #333;
    }
    ul, ol {
      padding-left: 24px;
      margin: 12px 0;
    }
    li {
      margin: 6px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    th, td {
      border: 1px solid #e5e5e5;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background: #f7f7f7;
      font-weight: 600;
    }
    .ai-image-export {
      margin: 16px 0;
    }
    .ai-image-export img {
      width: 100%;
      border-radius: 8px;
    }
  `;

  // Process AI images for WeChat export
  const processedMarkdown = await processAIImagesForExport(
    markdown,
    aiImageStates,
  );
  const wechatHTML = `<section style="font-size: 16px; color: #333;">
${convertMarkdownToHTML(processedMarkdown)}
</section>`;

  // Copy to clipboard for pasting into WeChat editor
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = `<style>${wechatStyle}</style>${wechatHTML}`;
  document.body.appendChild(tempDiv);

  const range = document.createRange();
  range.selectNodeContents(tempDiv);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);

  try {
    document.execCommand("copy");
    alert(
      "WeChat HTML copied to clipboard! Paste it directly into WeChat editor.",
    );
  } catch (err) {
    console.error("Failed to copy:", err);
    // Fallback: download as HTML
    const blob = new Blob([`<style>${wechatStyle}</style>${wechatHTML}`], {
      type: "text/html",
    });
    downloadBlob(blob, "wechat-article.html");
  }

  document.body.removeChild(tempDiv);
}

function convertMarkdownToHTML(markdown: string): string {
  // First, process custom components
  const processedMarkdown = convertMarkdownWithComponents(markdown);

  // Then convert markdown to HTML
  let html = processedMarkdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");

  // Strikethrough
  html = html.replace(/~~(.*?)~~/gim, "<del>$1</del>");

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');

  // Images (regular markdown images)
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/gim,
    '<img src="$2" alt="$1" />',
  );

  // Code blocks
  html = html.replace(
    /```(\w+)?\n([\s\S]*?)```/gim,
    "<pre><code>$2</code></pre>",
  );

  // Inline code
  html = html.replace(/`([^`]+)`/gim, "<code>$1</code>");

  // Unordered lists
  html = html.replace(/^- (.*$)/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/gim, "<ul>$&</ul>");

  // Ordered lists
  html = html.replace(/^\d+\. (.*$)/gim, "<li>$1</li>");

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>");

  // Horizontal rules
  html = html.replace(/^---$/gim, "<hr />");

  // Paragraphs (avoid wrapping divs and block elements)
  const lines = html.split("\n\n");
  html = lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      // Don't wrap if it starts with a block element
      if (
        /^<(h[1-6]|ul|ol|li|div|p|blockquote|pre|hr|section)/i.test(trimmed)
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return html;
}

export async function exportToPDF(
  element: HTMLElement,
  filename: string = "document.pdf",
) {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).jsPDF;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error("PDF export failed:", error);
    alert("PDF export failed. Please try HTML export instead.");
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
