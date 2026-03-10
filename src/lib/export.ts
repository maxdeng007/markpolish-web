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
  
  // Convert markdown to HTML with proper component handling
  let contentHtml = convertMarkdownToHTML(markdown);
  
  // Process AI images in the HTML - replace placeholders with actual images
  contentHtml = await processAIImagesInHTML(contentHtml, aiImageStates);
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Document</title>
  <style>
    /* Reset and base styles */
    *, *::before, *::after {
      box-sizing: border-box;
    }
    
    /* Base container styles */
    body {
      margin: 0;
      padding: 20px;
      background: ${theme.styles.background};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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

// Process AI images in HTML (after markdown conversion)
async function processAIImagesInHTML(
  html: string,
  aiImageStates: Record<string, AIImageExportState>,
): Promise<string> {
  let result = html;

  // Process each AI image state
  for (const [imageId, state] of Object.entries(aiImageStates)) {
    if (state.status === "done" && state.imageUrl) {
      try {
        // Convert image URL to base64
        const base64 = await imageUrlToBase64(state.imageUrl);

        if (base64) {
          const aspectClass = getAspectClass(state.ratio);

          // Replace ai-image-wrapper with export-friendly version
          // Pattern 1: Full wrapper with overlay
          const wrapperRegex1 = new RegExp(
            `<div[^>]*class="ai-image-wrapper[^"]*"[^>]*data-ai-id="${escapeRegex(imageId)}"[^>]*>[\\s\\S]*?<\\/div>\\s*<\\/div>\\s*<\\/div>`,
            "g",
          );
          result = result.replace(
            wrapperRegex1,
            `<div class="ai-image-export ${aspectClass}">
          <img src="${base64}" alt="${escapeHtml(state.description)}" />
        </div>`,
          );

          // Pattern 2: Simple wrapper
          const wrapperRegex2 = new RegExp(
            `<div[^>]*class="ai-image-wrapper[^"]*"[^>]*data-ai-id="${escapeRegex(imageId)}"[^>]*>[\\s\\S]*?<\\/div>`,
            "g",
          );
          result = result.replace(
            wrapperRegex2,
            `<div class="ai-image-export ${aspectClass}">
          <img src="${base64}" alt="${escapeHtml(state.description)}" />
        </div>`,
          );
        }
      } catch (e) {
        console.error(`Failed to process AI image ${imageId}:`, e);
      }
    }
  }

  // Replace remaining placeholders (not generated) with simple styled divs
  // Match the entire placeholder including nested divs by anchoring on the status div at the end
  const placeholderRegex =
    /<div[^>]*class="ai-image-placeholder[^"]*"[^>]*data-description="([^"]+)"[^>]*>[\s\S]*?<div class="ai-image-status"><\/div><\/div>/g;
  result = result.replace(placeholderRegex, (_match, description) => {
    return `<div class="ai-image-export-static" style="padding: 32px; text-align: center; border: 2px dashed #cbd5e1; border-radius: 16px; margin: 32px 0; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
      <p style="color: #64748b; margin: 0; font-size: 15px; font-weight: 500;">🎨 AI Image: ${description}</p>
    </div>`;
  });

  return result;
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

// WeChat/WeCom export with <style> tags for Code mode
// Accepts themeId parameter and uses theme colors
export async function exportForWeChat(
  markdown: string,
  aiImageStates: Record<string, AIImageExportState> = {},
  themeId: string = "wechat-classic",
): Promise<void> {
  const theme = getTheme(themeId);
  const colors = {
    accent: theme.styles.accent,
    heading: theme.styles.heading,
    border: theme.styles.border,
    link: theme.styles.link,
    code: theme.styles.code,
  };

  const wechatStyle = `
    /* WeChat/WeCom Base Styles */
    body { font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; line-height: 1.75; color: #333; }
    
    /* Hero Component */
    .hero-component { padding: 40px 24px; background-color: ${colors.accent}; text-align: center; margin: 24px 0; border-radius: 16px; color: white; }
    .hero-component h1 { color: white !important; font-size: 28px !important; margin: 0 0 16px !important; font-weight: 600 !important; }
    .hero-component h2 { color: white !important; font-size: 22px !important; margin: 0 0 12px !important; font-weight: 600 !important; }
    .hero-component h3 { color: white !important; font-size: 18px !important; margin: 0 0 8px !important; }
    .hero-component p { color: white !important; margin: 0 !important; }
    
    /* Columns Table */
    .columns-table { width: 100%; border-collapse: separate; border-spacing: 12px 0; margin: 16px 0; }
    .columns-table td { padding: 16px; border: 1px solid ${colors.border}; border-radius: 8px; vertical-align: top; background-color: #fafafa; }
    
    /* Steps Component */
    .steps-component { margin: 16px 0; padding: 0; list-style: none; }
    .step-item { display: flex; gap: 12px; margin-bottom: 12px; padding: 12px; border: 1px solid ${colors.border}; border-radius: 8px; background: #fafafa; }
    .step-number { width: 28px; height: 28px; min-width: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; background-color: ${colors.accent}; }
    .step-content { flex: 1; }
    .step-title { font-weight: 600; margin-bottom: 4px; }
    .step-description { font-size: 14px; color: #666; }
    
    /* Timeline Component */
    .timeline-component { margin: 16px 0; padding-left: 16px; border-left: 2px solid ${colors.accent}; }
    .timeline-item { position: relative; padding-left: 16px; margin-bottom: 16px; }
    .timeline-title { font-weight: 600; margin-bottom: 4px; }
    .timeline-body { font-size: 14px; color: #666; }
    
    /* Card Component */
    .card-component { padding: 16px; border: 1px solid ${colors.border}; border-radius: 8px; margin: 12px 0; background: #fafafa; }
    
    /* Callout Component */
    .callout-component { padding: 12px; border-radius: 8px; margin: 12px 0; }
    .callout-component.callout-info { background: #e3f2fd; border-left: 4px solid #2196f3; }
    .callout-component.callout-warning { background: #fff3e0; border-left: 4px solid #f59e0b; }
    .callout-component.callout-error { background: #ffebee; border-left: 4px solid #f44336; }
    .callout-component.callout-success { background: #e8f5e9; border-left: 4px solid #4caf50; }
    .callout-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .callout-icon { font-size: 18px; }
    .callout-title { font-weight: 600; font-size: 15px; }
    .callout-content { font-size: 14px; line-height: 1.6; }
    
    /* Quote Component */
    .quote-component { padding: 12px 16px; margin: 12px 0; border-left: 4px solid ${colors.accent}; background: #fafafa; border-radius: 0 8px 8px 0; }
    .quote-content { font-style: italic; font-size: 16px; line-height: 1.7; }
    .quote-attribution { margin-top: 8px; font-size: 14px; color: #666; }
    .quote-author { font-weight: 600; color: ${colors.accent}; }
    
    /* Blockquote */
    blockquote { margin: 16px 0; padding: 12px 16px; border-left: 4px solid ${colors.accent}; background-color: #fafafa; color: #666; font-style: italic; border-radius: 0 8px 8px 0; }
    
    /* Code */
    code { background-color: ${colors.code}; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 0.9em; }
    pre { background-color: ${colors.code}; padding: 12px 16px; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    
    /* Headings */
    h1 { font-size: 24px; font-weight: 600; color: ${colors.heading}; margin: 24px 0 16px; text-align: center; }
    h2 { font-size: 20px; font-weight: 600; color: ${colors.heading}; margin: 20px 0 12px; border-left: 4px solid ${colors.accent}; padding-left: 12px; }
    h3 { font-size: 18px; font-weight: 600; color: ${colors.heading}; margin: 16px 0 8px; }
    
    /* Links */
    a { color: ${colors.link}; text-decoration: none; }
    
    /* ========================================
    * STYLISH LISTS FOR WECHAT/WECOM
    * ======================================== */
    
    /* Base List Styles */
    ul, ol { padding-left: 0; margin: 20px 0; list-style: none; }
    li { margin: 12px 0; line-height: 1.8; }
    li p { margin: 6px 0; }
    
    /* ========================================
    * UNORDERED LIST - WeChat Native Style
    * ======================================== */
    ul > li { 
      position: relative; 
      padding-left: 20px; 
      margin: 10px 0;
    }
    ul > li::before {
      content: '';
      position: absolute;
      left: 4px;
      top: 10px;
      width: 6px;
      height: 6px;
      background-color: #333;
      border-radius: 50%;
    }
    
    /* Nested Level 1 */
    ul ul > li { padding-left: 20px; }
    ul ul > li::before { background-color: #666; }
    
    /* Nested Level 2 */
    ul ul ul > li::before { background-color: #999; }
    
    /* Nested Level 3 */
    ul ul ul ul > li::before { background-color: #ccc; }
    
    /* Nested Level 1 - Hollow Circle */
    ul ul > li { padding-left: 28px; }
    ul ul > li::before {
      width: 8px;
      height: 8px;
      background: transparent;
      border: 2px solid ${colors.accent};
      box-shadow: none;
    }
    
    /* Nested Level 2 - Diamond */
    ul ul ul > li { padding-left: 28px; }
    ul ul ul > li::before {
      width: 0;
      height: 0;
      background: transparent;
      border: none;
    }
    ul ul ul > li::after {
      content: '◆';
      position: absolute;
      left: 6px;
      top: 6px;
      font-size: 8px;
      color: ${colors.accent};
    }
    
    /* Nested Level 3 - Small Circle */
    ul ul ul ul > li::before {
      width: 6px;
      height: 6px;
      border-radius: 2px;
    }
    ul ul ul ul > li::after { display: none; }
    
    /* ========================================
    * ORDERED LIST - WeChat Native Style
    * ======================================== */
    ol { counter-reset: wechat-ol; }
    ol > li {
      position: relative;
      padding-left: 24px;
      margin: 10px 0;
      counter-increment: wechat-ol;
    }
    ol > li::before {
      content: counter(wechat-ol) ".";
      position: absolute;
      left: 4px;
      top: 0;
      color: #333;
      font-weight: 500;
    }
    
    /* Nested Level 1 */
    ol ol { margin: 8px 0; }
    ol ol > li { padding-left: 24px; }
    ol ol > li::before { color: #666; }
    
    /* Nested Level 2 */
    ol ol ol > li::before { color: #999; }
    
    /* Nested Level 3 */
    ol ol ol ol > li::before { color: #ccc; }
    
    /* List Content Styling */
    li strong { color: ${colors.heading}; }
    li em { color: #666; }
    /* ========================================
    * TABLE STYLES
    * ======================================== */
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { padding: 12px 16px; border: 1px solid ${colors.border}; text-align: left; }
    th { background-color: #f5f5f5; font-weight: 600; }
    
    /* AI Image */
    .ai-image-export { margin: 24px 0; text-align: center; }
    .ai-image-export img { max-width: 100%; border-radius: 8px; }
  `;

  // Convert markdown to HTML
  let wechatHTML = convertMarkdownToHTML(markdown);

  // Process AI images
  wechatHTML = await processAIImagesInHTML(wechatHTML, aiImageStates);

  // Wrap with styles
  wechatHTML = `<style>${wechatStyle}</style>
${wechatHTML}`;

  // Copy raw HTML code to clipboard (for WeCom Code mode)
  try {
    // Use text/plain to copy raw HTML code (not rendered content)
    await navigator.clipboard.writeText(wechatHTML);
    alert(
      "Raw HTML code copied! Paste into Code mode (代码模式) in WeCom editor."
    );
  } catch (err) {
    console.error("Failed to copy:", err);
    // Fallback: download as HTML file
    const blob = new Blob([wechatHTML], { type: "text/html" });
    downloadBlob(blob, "wechat-article.html");
  }
}

// Convert markdown tables to HTML tables
function convertMarkdownTables(markdown: string): string {
  const lines = markdown.split('\n');
  const result: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if line is a table row (starts with |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      // Check if separator line
      if (/^\|\s*[-:]+\s*\|/.test(trimmed)) continue;
      
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(trimmed);
    } else {
      if (inTable && tableRows.length > 0) {
        result.push(renderMarkdownTableHTML(tableRows));
        tableRows = [];
        inTable = false;
      }
      result.push(line);
    }
  }

  if (inTable && tableRows.length > 0) {
    result.push(renderMarkdownTableHTML(tableRows));
  }

  return result.join('\n');
}

function renderMarkdownTableHTML(rows: string[]): string {
  if (rows.length === 0) return '';
  
  let html = '<table>\n';
  
  rows.forEach((row, index) => {
    const cells = row.split('|').slice(1, -1).map(cell => cell.trim());
    const tag = index === 0 ? 'th' : 'td';
    html += '  <tr>\n';
    cells.forEach(cell => {
      html += `    <${tag}>${cell}</${tag}>\n`;
    });
    html += '  </tr>\n';
  });
  
  html += '</table>';
  return html;
}

// Improved markdown to HTML converter that preserves component HTML
function convertMarkdownToHTML(markdown: string): string {
  // First, process custom components - this converts ::: blocks to HTML
  let html = convertMarkdownWithComponents(markdown);

  // Convert markdown tables to HTML tables
  html = convertMarkdownTables(html);

  // Now process remaining markdown while preserving existing HTML
  html = processBlockMarkdown(html);
  html = processInlineMarkdown(html);
  html = wrapOrphanText(html);

  return html;
}

// Process block-level markdown (headers, lists, code, blockquotes)
function processBlockMarkdown(html: string): string {
  const lines = html.split('\n');
  const result: string[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let inList = false;
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' = 'ul';
  let inBlockquote = false;
  let blockquoteContent: string[] = [];

  const closeList = () => {
    if (inList && listItems.length > 0) {
      result.push(`<${listType}>`);
      listItems.forEach(item => result.push(item));
      result.push(`</${listType}>`);
      listItems = [];
      inList = false;
    }
  };

  const closeBlockquote = () => {
    if (inBlockquote && blockquoteContent.length > 0) {
      result.push(`<blockquote>${blockquoteContent.join('<br />')}</blockquote>`);
      blockquoteContent = [];
      inBlockquote = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip lines that are already HTML (contain tags but not markdown)
    // Check if line starts with HTML tag (not just contains one)
    if (trimmed.match(/^<(div|span|p|h[1-6]|ul|ol|li|blockquote|pre|code|table|img|a|strong|em|br|hr|section|article|header|footer|main|nav)/i)) {
      closeList();
      closeBlockquote();
      result.push(line);
      continue;
    }
    
    // Also skip closing tags and lines with class attributes (component output)
    if (trimmed.match(/^<\//) || trimmed.includes('class="')) {
      closeList();
      closeBlockquote();
      result.push(line);
      continue;
    }

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        result.push(`<pre><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`);
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        closeList();
        closeBlockquote();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Headers
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      closeList();
      closeBlockquote();
      const level = headerMatch[1].length;
      result.push(`<h${level}>${headerMatch[2]}</h${level}>`);
      continue;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      closeList();
      closeBlockquote();
      result.push('<hr />');
      continue;
    }

    // Unordered list
    const ulMatch = trimmed.match(/^-\s+(.+)$/);
    if (ulMatch) {
      closeBlockquote();
      if (!inList || listType !== 'ul') {
        closeList();
        inList = true;
        listType = 'ul';
      }
      listItems.push(`<li>${ulMatch[1]}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      closeBlockquote();
      if (!inList || listType !== 'ol') {
        closeList();
        inList = true;
        listType = 'ol';
      }
      listItems.push(`<li>${olMatch[2]}</li>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      closeList();
      if (!inBlockquote) {
        inBlockquote = true;
      }
      blockquoteContent.push(trimmed.substring(2));
      continue;
    }

    // Empty line - close open blocks
    if (trimmed === '') {
      closeList();
      closeBlockquote();
      result.push('');
      continue;
    }

    // Regular text line
    closeList();
    closeBlockquote();
    result.push(line);
  }

  // Close any open elements
  if (inCodeBlock && codeBlockContent.length > 0) {
    result.push(`<pre><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`);
  }
  closeList();
  closeBlockquote();

  return result.join('\n');
}

// Process inline markdown while preserving HTML structure
function processInlineMarkdown(html: string): string {
  // Process bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Process italic (avoid matching inside bold)
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  
  // Process inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Process links - markdown style (only if not already an HTML link)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Process images - markdown style
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 8px; margin: 16px 0;" />',
  );
  
  return html;
}

// Wrap text that's not inside block elements with <p> tags
function wrapOrphanText(html: string): string {
  const blockElementRegex =
    /^<(div|p|h[1-6]|ul|ol|li|blockquote|pre|hr|section|table|thead|tbody|tr|td|th|article|aside|header|footer|main|nav|img)[\s>]/i;

  const parts = html.split(/\n\n+/);

  return parts
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return '';

      // Don't wrap if it starts with a block element
      if (blockElementRegex.test(trimmed)) {
        return trimmed;
      }

      // Don't wrap if it looks like it's already complete HTML
      if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
        return trimmed;
      }

      // Wrap in paragraph, converting single newlines to <br>
      return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .join('\n');
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
