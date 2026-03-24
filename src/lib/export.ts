import {
  convertMarkdownWithComponents,
  processWithoutCodeBlocks,
  ThemeColors,
} from "./markdown-components";
import { getTheme } from "./themes";
import { getWeComExportStyles, getExportStyles } from "./preview-styles";

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

  // Theme colors for component rendering
  const themeColors: ThemeColors = {
    accent: theme.styles.accent,
    foreground: theme.styles.foreground,
    heading: theme.styles.heading,
    link: theme.styles.link,
    border: theme.styles.border,
    code: theme.styles.code,
    background: theme.styles.background,
  };

  // Convert markdown to HTML with proper component handling
  let contentHtml = convertMarkdownToHTML(markdown, themeColors);

  // Process AI images in the HTML - replace placeholders with actual images
  contentHtml = await processAIImagesInHTML(contentHtml, aiImageStates);

  const cssVariables = `
    :root {
      --accent: ${theme.styles.accent};
      --background: ${theme.styles.background};
      --foreground: ${theme.styles.foreground};
      --heading: ${theme.styles.heading};
      --border: ${theme.styles.border};
      --blockquote-bg: ${theme.styles.blockquoteBg || "#f8f9fa"};
    }
  `;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Document</title>
  <style>
    /* CSS Variables for components */
    ${cssVariables}
    
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

// WeChat/WeCom export - uses full HTML document with <style> blocks
// Based on user testing: Full document structure preserves theme colors in WeCom Code mode
export async function exportForWeChat(
  markdown: string,
  aiImageStates: Record<string, AIImageExportState> = {},
  themeId: string = "wechat-classic",
): Promise<{ success: boolean; message: string }> {
  const theme = getTheme(themeId);
  const isDark = theme.category === "dark";
  const sharedStyles = getWeComExportStyles(
    theme.styles.accent,
    theme.styles.blockquoteBg || "#f8f9fa",
  );

  // Convert markdown to HTML with proper component handling and theme colors
  const themeColors: ThemeColors = {
    accent: theme.styles.accent,
    foreground: theme.styles.foreground,
    heading: theme.styles.heading,
    link: theme.styles.link,
    border: theme.styles.border,
    code: theme.styles.code,
    background: theme.styles.background,
  };
  let contentHtml = convertMarkdownToHTML(markdown, themeColors, true);

  // Process AI images in the HTML
  contentHtml = await processAIImagesInHTML(contentHtml, aiImageStates);

  // Add inline styles to lists for WeCom compatibility
  contentHtml = addInlineListStyles(contentHtml, theme.styles.accent);

  // CSS variables for components
  const cssVariables = `
    :root {
      --accent: ${theme.styles.accent};
      --background: ${theme.styles.background};
      --foreground: ${theme.styles.foreground};
      --heading: ${theme.styles.heading};
      --border: ${theme.styles.border};
    }
  `;

  // Build full HTML document - WeCom Code mode preserves <style> blocks in <head>
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* CSS Variables for components */
    ${cssVariables}
    
    /* Reset and base styles */
    *, *::before, *::after {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system-font, "Helvetica Neue", sans-serif;
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
    
    /* Theme CSS */
    ${theme.css}
    
    /* Shared component styles */
    ${sharedStyles}
    
    
    /* Dark mode - only affect content area */
    ${isDark ? ".preview-content { background: " + theme.styles.background + "; color: " + theme.styles.foreground + "; }" : ""}
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

  // Copy the ENTIRE HTML document to clipboard
  // WeCom Code mode preserves <style> blocks in <head>
  try {
    await navigator.clipboard.writeText(fullHtml);
    return {
      success: true,
      message: "Copied! Paste into Code mode (代码模式) in WeCom editor.",
    };
  } catch (err) {
    console.error("Failed to copy:", err);
    // Fallback: download as HTML file
    const blob = new Blob([fullHtml], { type: "text/html" });
    downloadBlob(blob, "wechat-article.html");
    return {
      success: false,
      message: "Downloaded as HTML file.",
    };
  }
}

// Convert markdown tables to HTML tables
// Only converts proper GFM tables (with separator row like |---|)
// Leaves ASCII art tables as plain text
// Skips content inside <pre> and <code> blocks to preserve code formatting
function convertMarkdownTables(
  markdown: string,
  themeColors?: ThemeColors,
): string {
  return processWithoutCodeBlocks(markdown, (part) => {
    const lines = part.split("\n");
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      const normalized = trimmed.replace(/｜/g, "|");

      if (normalized.startsWith("|") && normalized.endsWith("|")) {
        const nextLine =
          i + 1 < lines.length ? lines[i + 1].trim().replace(/｜/g, "|") : "";

        const isSeparator = /^\|\s*[-:]+[-\s:|]*\|\s*$/.test(nextLine);

        if (isSeparator) {
          const tableRows: string[] = [];
          let j = i;

          tableRows.push(normalized);
          j++;

          j++;

          while (j < lines.length) {
            const bodyLine = lines[j].trim().replace(/｜/g, "|");
            if (bodyLine.startsWith("|") && bodyLine.endsWith("|")) {
              if (!/^\|\s*[-:]+[-\s:|]*\|\s*$/.test(bodyLine)) {
                tableRows.push(bodyLine);
              }
              j++;
            } else {
              break;
            }
          }

          result.push(renderMarkdownTableHTML(tableRows, themeColors?.accent));

          i = j - 1;
          continue;
        }
      }

      result.push(line);
    }

    return result.join("\n");
  });
}

function renderMarkdownTableHTML(rows: string[], accentColor?: string): string {
  if (rows.length === 0) return "";

  const borderColor = accentColor || "#e5e5e5";
  const headerBg = accentColor ? `${accentColor}15` : "#f5f5f5";

  let html = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; border: 1px solid ${borderColor};">\n`;

  rows.forEach((row, index) => {
    const cells = row
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    const isHeader = index === 0;
    const tag = isHeader ? "th" : "td";

    html += `  <tr>\n`;
    cells.forEach((cell, cellIndex) => {
      const padding = isHeader ? "12px 8px" : "10px 8px";
      const fontWeight = isHeader ? "600" : "normal";
      const bg = isHeader ? headerBg : "transparent";
      const textAlign = isHeader ? "center" : "left";
      const borderRight =
        cellIndex < cells.length - 1
          ? `border-right: 1px solid ${borderColor};`
          : "";
      html += `    <${tag} style="padding: ${padding}; font-weight: ${fontWeight}; background: ${bg}; text-align: ${textAlign}; border-bottom: 1px solid ${borderColor}; ${borderRight}">${cell}</${tag}>\n`;
    });
    html += "  </tr>\n";
  });

  html += "</table>";
  return html;
}

// Improved markdown to HTML converter that preserves component HTML
function convertMarkdownToHTML(
  markdown: string,
  themeColors?: ThemeColors,
  forWeCom: boolean = false,
): string {
  let html = convertMarkdownWithComponents(markdown, themeColors, forWeCom);

  html = convertMarkdownTables(html, themeColors);
  html = processBlockMarkdown(html, themeColors);
  html = processInlineMarkdown(html);
  html = wrapOrphanText(html);

  return html;
}

// Add inline styles to lists for WeCom compatibility
// Converts <ul> and <ol> to div-based layouts with inline styles
// Handles nested lists recursively
function addInlineListStyles(html: string, accentColor: string): string {
  // Process lists from innermost to outermost (reverse recursion)
  // Keep processing until no more list tags are found
  let previousHtml = "";
  let maxIterations = 20; // Safety limit

  while (html !== previousHtml && maxIterations > 0) {
    previousHtml = html;
    maxIterations--;

    // Process unordered lists - match innermost first
    html = html.replace(
      /<ul>((?:(?!<ul>|<ol>|<\/ul>|<\/ol>).)*?)<\/ul>/gs,
      (_match, content) => {
        return processListItems(content, "ul", accentColor, 0);
      },
    );

    // Process ordered lists - match innermost first
    html = html.replace(
      /<ol>((?:(?!<ul>|<ol>|<\/ul>|<\/ol>).)*?)<\/ol>/gs,
      (_match, content) => {
        return processListItems(content, "ol", accentColor, 0);
      },
    );
  }

  // Now handle any remaining nested lists that are inside list items
  // These would be lists that were processed but their markers are still in the content
  html = html.replace(
    /<div[^>]*data-list-marker="true"[^>]*>(.*?)<\/div>/gs,
    (_match, content) => {
      return content;
    },
  );

  return html;
}

// Process list items within a ul/ol
function processListItems(
  content: string,
  listType: "ul" | "ol",
  accentColor: string,
  level: number,
): string {
  // Extract li items - handle both simple and complex content
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/g;
  const items: Array<{ content: string; nestedList?: string }> = [];

  let liMatch;
  while ((liMatch = liRegex.exec(content)) !== null) {
    let itemContent = liMatch[1].trim();
    let nestedList: string | undefined;

    // Check for nested list divs that were already processed
    // Match divs with the list wrapper style
    const nestedDivRegex = /<div[^>]*style="margin:\s*8px\s+0;[^"]*"[^>]*>/;
    const nestedUlMatch = itemContent.match(nestedDivRegex);

    if (nestedUlMatch) {
      const startIndex = itemContent.indexOf(nestedUlMatch[0]);
      if (startIndex >= 0) {
        // Split into text content and nested list
        const textContent = itemContent.substring(0, startIndex).trim();
        nestedList = itemContent.substring(startIndex);

        if (textContent) {
          // Has text before nested list
          itemContent = textContent;
        } else {
          // No text before nested list - this item IS a container for nested list
          // Mark as having only nested content (no bullet needed for parent)
          itemContent = "";
        }
      }
    }

    // Skip completely empty items (but keep items that have nested lists)
    if (itemContent === "" && !nestedList) {
      continue;
    }

    items.push({ content: itemContent, nestedList });
  }

  if (items.length === 0) {
    return "";
  }

  const bullets = ["•", "○", "▪", "▫"];

  const rows = items
    .map((item) => {
      // If item has no content but has nested list, just return the nested list
      if (item.content === "" && item.nestedList) {
        const indentedNestedList = item.nestedList.replace(
          /padding-left:\s*(\d+)px/g,
          (_match, num) => `padding-left: ${parseInt(num) + 20}px`,
        );
        return indentedNestedList;
      }

      const bullet = listType === "ul" ? bullets[level % bullets.length] : "•";
      const indent = level * 20;
      let row = `<div style="padding-left: ${24 + indent}px; margin: 4px 0;"><span style="font-weight: 600; color: ${accentColor};">${bullet}</span><span style="color: #333;">${item.content}</span></div>`;

      // Append nested list if present - increase indentation by modifying inline styles
      if (item.nestedList) {
        const indentedNestedList = item.nestedList.replace(
          /padding-left:\s*(\d+)px/g,
          (_match, num) => `padding-left: ${parseInt(num) + 20}px`,
        );
        row += indentedNestedList;
      }

      return row;
    })
    .join("");

  if (!rows) return "";

  return `<div style="margin: 8px 0;">${rows}</div>`;
}

// Process block-level markdown (headers, lists, code, blockquotes)
function processBlockMarkdown(html: string, themeColors?: ThemeColors): string {
  const lines = html.split("\n");
  const result: string[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let inBlockquote = false;
  let blockquoteContent: string[] = [];

  // List state - track nested lists
  interface ListState {
    type: "ul" | "ol";
    items: string[];
    level: number;
  }
  let listStack: ListState[] = [];

  const getIndentLevel = (line: string): number => {
    const match = line.match(/^(\s*)/);
    return match ? Math.floor(match[1].length / 2) : 0;
  };

  const flushLists = () => {
    // Build HTML from innermost to outermost
    let nestedContent = "";

    while (listStack.length > 0) {
      const list = listStack.pop()!;
      const items = list.items.join("\n");

      if (nestedContent) {
        // Find the last </li> to insert nested content before it
        // Using </li> instead of <li> ensures we find the correct parent item
        // (not a nested <li> inside another item)
        const lastCloseLiIdx = items.lastIndexOf("</li>");
        if (lastCloseLiIdx !== -1) {
          const before = items.substring(0, lastCloseLiIdx);
          const after = items.substring(lastCloseLiIdx);
          // Insert nested list before </li> of last item
          nestedContent = `<${list.type}>\n${before}<${list.type}>${nestedContent}</${list.type}>${after}\n</${list.type}>`;
        } else {
          nestedContent = `<${list.type}>${items}\n${nestedContent}</${list.type}>`;
        }
      } else {
        nestedContent = `<${list.type}>\n${items}\n</${list.type}>`;
      }
    }

    if (nestedContent) {
      result.push(nestedContent);
    }
  };

  const closeBlockquote = () => {
    if (inBlockquote && blockquoteContent.length > 0) {
      result.push(
        `<blockquote>${blockquoteContent.join("<br />")}</blockquote>`,
      );
      blockquoteContent = [];
      inBlockquote = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const indentLevel = getIndentLevel(line);

    // Skip lines that are already HTML
    if (
      trimmed.match(
        /^<(div|span|p|h[1-6]|ul|ol|li|blockquote|pre|code|table|thead|tbody|tfoot|tr|td|th|colgroup|col|img|a|strong|em|br|hr|section|article|header|footer|main|nav|details|summary)/i,
      )
    ) {
      flushLists();
      closeBlockquote();
      result.push(line);
      continue;
    }

    if (trimmed.match(/^<\//) || trimmed.includes('class="')) {
      flushLists();
      closeBlockquote();
      result.push(line);
      continue;
    }

    // Code blocks
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        result.push(
          `<pre><code>${escapeHtml(codeBlockContent.join("\n"))}</code></pre>`,
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        flushLists();
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
      flushLists();
      closeBlockquote();
      const level = headerMatch[1].length;
      result.push(`<h${level}>${headerMatch[2]}</h${level}>`);
      continue;
    }

    // Horizontal rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      flushLists();
      closeBlockquote();
      const dividerColor = themeColors?.accent || "#e5e5e5";
      result.push(
        `<div style="height: 1px; background-color: ${dividerColor}; margin: 20px 0;"></div>`,
      );
      continue;
    }

    // Unordered list
    const ulMatch = trimmed.match(/^-\s+(.+)$/);
    if (ulMatch) {
      closeBlockquote();

      // Adjust list stack based on indentation
      while (listStack.length > indentLevel + 1) {
        const deeperList = listStack.pop()!;
        if (listStack.length > 0) {
          const parent = listStack[listStack.length - 1];
          if (parent.items.length > 0) {
            const lastItem = parent.items.pop()!;
            parent.items.push(
              lastItem.replace(
                "</li>",
                `<${deeperList.type}>${deeperList.items.join("\n")}</${deeperList.type}></li>`,
              ),
            );
          }
        }
      }

      // Ensure we have a list at the right level
      while (listStack.length < indentLevel + 1) {
        listStack.push({ type: "ul", items: [], level: listStack.length });
      }

      // Set correct list type if needed
      if (listStack[indentLevel] && listStack[indentLevel].type !== "ul") {
        const oldList = listStack[indentLevel];
        if (oldList.items.length > 0 && listStack[indentLevel - 1]) {
          const parent = listStack[indentLevel - 1];
          if (parent.items.length > 0) {
            const lastItem = parent.items.pop()!;
            parent.items.push(
              lastItem.replace(
                "</li>",
                `<${oldList.type}>${oldList.items.join("\n")}</${oldList.type}></li>`,
              ),
            );
          }
        }
        listStack[indentLevel] = { type: "ul", items: [], level: indentLevel };
      }

      listStack[indentLevel].items.push(`<li>${ulMatch[1]}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      closeBlockquote();

      while (listStack.length > indentLevel + 1) {
        const deeperList = listStack.pop()!;
        if (listStack.length > 0) {
          const parent = listStack[listStack.length - 1];
          if (parent.items.length > 0) {
            const lastItem = parent.items.pop()!;
            parent.items.push(
              lastItem.replace(
                "</li>",
                `<${deeperList.type}>${deeperList.items.join("\n")}</${deeperList.type}></li>`,
              ),
            );
          }
        }
      }

      while (listStack.length < indentLevel + 1) {
        listStack.push({ type: "ol", items: [], level: listStack.length });
      }

      if (listStack[indentLevel] && listStack[indentLevel].type !== "ol") {
        const oldList = listStack[indentLevel];
        if (oldList.items.length > 0 && listStack[indentLevel - 1]) {
          const parent = listStack[indentLevel - 1];
          if (parent.items.length > 0) {
            const lastItem = parent.items.pop()!;
            parent.items.push(
              lastItem.replace(
                "</li>",
                `<${oldList.type}>${oldList.items.join("\n")}</${oldList.type}></li>`,
              ),
            );
          }
        }
        listStack[indentLevel] = { type: "ol", items: [], level: indentLevel };
      }

      listStack[indentLevel].items.push(`<li>${olMatch[2]}</li>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      flushLists();
      if (!inBlockquote) {
        inBlockquote = true;
      }
      blockquoteContent.push(trimmed.substring(2));
      continue;
    }

    // Empty line - close open blocks
    if (trimmed === "") {
      flushLists();
      closeBlockquote();
      result.push("");
      continue;
    }

    // Regular text line
    flushLists();
    closeBlockquote();
    result.push(line);
  }

  // Close any remaining open elements
  if (inCodeBlock && codeBlockContent.length > 0) {
    result.push(
      `<pre><code>${escapeHtml(codeBlockContent.join("\n"))}</code></pre>`,
    );
  }
  flushLists();
  closeBlockquote();

  return result.join("\n");
}

// Process inline markdown while preserving HTML structure
function processInlineMarkdown(html: string): string {
  // Process bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Process italic (avoid matching inside bold)
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");

  // Process inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

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
    /^<(div|p|h[1-6]|ul|ol|li|blockquote|pre|hr|section|table|thead|tbody|tfoot|tr|td|th|colgroup|col|article|aside|header|footer|main|nav|img|details|summary)[\s>]/i;

  const parts = html.split(/\n\n+/);

  return parts
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return "";

      // Don't wrap if it starts with a block element
      if (blockElementRegex.test(trimmed)) {
        return trimmed;
      }

      // Don't wrap if it looks like it's already complete HTML
      if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
        return trimmed;
      }

      // Wrap in paragraph, converting single newlines to <br>
      return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");
}

export async function exportToPDF(
  element: HTMLElement,
  filename: string = "document.pdf",
): Promise<{ success: boolean; message: string }> {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).jsPDF;

    // Clone the element
    const clone = element.cloneNode(true) as HTMLElement;

    // Get all styles
    const styleTags = element.querySelectorAll("style");
    let allStyles = "";
    styleTags.forEach((style) => {
      allStyles += style.textContent || "";
    });

    const styleEl = document.createElement("style");
    styleEl.textContent = allStyles;
    clone.insertBefore(styleEl, clone.firstChild);

    clone.style.cssText = `
      ${element.style.cssText}
      max-height: none !important;
      overflow: visible !important;
      height: auto !important;
    `;

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "0";
    container.style.top = "0";
    container.style.width = element.offsetWidth + "px";
    container.appendChild(clone);
    document.body.appendChild(container);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: element.style.background || "#ffffff",
    });

    document.body.removeChild(container);

    // Simple approach: use offset positioning
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    // A4 at 72 DPI
    const pageWidth = 595.28;
    const pageHeight = 841.89;

    // Convert canvas to image
    const imgData = canvas.toDataURL("image/png");

    // Calculate total PDF height
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    const totalPages = Math.ceil(imgHeight / pageHeight);

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      // Offset to show the correct portion of the image on each page
      const yOffset = -i * pageHeight;
      pdf.addImage(imgData, "PNG", 0, yOffset, imgWidth, imgHeight);
    }

    pdf.save(filename);
    return { success: true, message: "PDF exported successfully." };
  } catch (error) {
    console.error("PDF export failed:", error);
    return {
      success: false,
      message: "PDF export failed. Please try HTML export instead.",
    };
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
