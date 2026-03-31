// Custom markdown component parser for WeChat-optimized content

export interface ComponentMatch {
  type: string;
  content: string;
  props?: Record<string, string>;
  startIndex: number;
  endIndex: number;
}

const CODE_BLOCK_PATTERN =
  /(<pre\b[^>]*>[\s\S]*?<\/pre>|<code\b[^>]*>[\s\S]*?<\/code>)/gi;

export function skipCodeBlocks<T>(
  html: string,
  processor: (part: string) => T,
): (string | T)[] {
  const parts = html.split(CODE_BLOCK_PATTERN);
  return parts.map((part, index) => (index % 2 === 1 ? part : processor(part)));
}

export function processWithoutCodeBlocks(
  html: string,
  processor: (part: string) => string,
): string {
  const parts = html.split(CODE_BLOCK_PATTERN);
  return parts
    .map((part, index) => (index % 2 === 1 ? part : processor(part)))
    .join("");
}

function adjustColorHex(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function convertTableRows(rows: string[]): string {
  if (rows.length === 0) return "";

  const cells = (row: string) =>
    row
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((cell) => cell.trim());

  const headerCells = cells(rows[0]);
  const thead = `<thead><tr>${headerCells.map((c) => `<th style="border: 1px solid #e5e5e5; padding: 10px 12px; text-align: left; background: #f8f8fa; font-weight: 600; color: #1a1a2e;">${c}</th>`).join("")}</tr></thead>`;

  const bodyRows = rows.slice(1);
  const tbody =
    bodyRows.length > 0
      ? `<tbody>${bodyRows
          .map((row, idx) => {
            const rowCells = cells(row);
            return `<tr>${rowCells.map((c) => `<td style="border: 1px solid #e5e5e5; padding: 10px 12px; text-align: left; background: ${idx % 2 === 0 ? "#ffffff" : "#f8f8f8"};">${c}</td>`).join("")}</tr>`;
          })
          .join("")}</tbody>`
      : "";

  return `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">${thead}${tbody}</table>`;
}

function parseListItems(
  lines: string[],
  startIdx: number,
  indent: number,
): { html: string; endIdx: number } {
  let html = "";
  let i = startIdx;

  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(/^(\s*)- (.+)$/);

    if (!match) {
      if (line.trim() === "") {
        i++;
        continue;
      }
      break;
    }

    const currentIndent = match[1].length;
    if (currentIndent < indent) break;

    if (currentIndent > indent) {
      const nested = parseListItems(lines, i, currentIndent);
      html = html.slice(0, -5) + `<ul>${nested.html}</ul></li>`;
      i = nested.endIdx;
      continue;
    }

    html += `<li>${match[2]}</li>`;
    i++;
  }

  return { html, endIdx: i };
}

function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headers (must be at start of line)
  html = html.replace(/^###### (.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Horizontal rules (--- or *** or ___) - must be before italic
  html = html.replace(/^[-*_]{3,}\s*$/gm, "<hr />");

  // Bold (must be before italic)
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Images (must be BEFORE links - processes ![...](url))
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Links (now safe - images already processed)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Code blocks FIRST (before inline code to avoid conflicts)
  html = html.replace(/```[\w-]*\n?([\s\S]*?)```/g, (_, code) => {
    const escapedCode = code
      .trim()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<pre><code>${escapedCode}</code></pre>`;
  });

  // Inline code (after code blocks, so triple backticks are already processed)
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Blockquotes (> ...)
  const bqLines = html.split("\n");
  const bqResult: string[] = [];
  let inBq = false;
  let bqLinesArr: string[] = [];

  for (const bqLine of bqLines) {
    const bqMatch = bqLine.match(/^>\s?(.*)$/);
    if (bqMatch) {
      if (!inBq) {
        inBq = true;
        bqLinesArr = [];
      }
      bqLinesArr.push(bqMatch[1]);
    } else {
      if (inBq && bqLinesArr.length > 0) {
        bqResult.push(`<blockquote>${bqLinesArr.join("<br />")}</blockquote>`);
        bqLinesArr = [];
      }
      inBq = false;
      bqResult.push(bqLine);
    }
  }
  if (inBq && bqLinesArr.length > 0) {
    bqResult.push(`<blockquote>${bqLinesArr.join("<br />")}</blockquote>`);
  }
  html = bqResult.join("\n");

  const ulLines = html.split("\n");
  const ulResult: string[] = [];
  let i = 0;

  while (i < ulLines.length) {
    const line = ulLines[i];
    const match = line.match(/^(\s*)- (.+)$/);

    if (match) {
      const indent = match[1].length;
      const parsed = parseListItems(ulLines, i, indent);
      ulResult.push(`<ul>${parsed.html}</ul>`);
      i = parsed.endIdx;
    } else {
      ulResult.push(line);
      i++;
    }
  }

  html = ulResult.join("\n");

  // Ordered lists - properly wrap in <ol>
  const olLines = html.split("\n");
  const olResult: string[] = [];
  let inOl = false;
  let olItems: string[] = [];

  for (const olLine of olLines) {
    const olMatch = olLine.match(/^\d+\. (.+)$/);
    if (olMatch) {
      if (!inOl) {
        inOl = true;
        olItems = [];
      }
      olItems.push(`<li>${olMatch[1]}</li>`);
    } else {
      if (inOl && olItems.length > 0) {
        olResult.push(`<ol>${olItems.join("")}</ol>`);
        olItems = [];
        inOl = false;
      }
      olResult.push(olLine);
    }
  }
  if (inOl && olItems.length > 0) {
    olResult.push(`<ol>${olItems.join("")}</ol>`);
  }
  html = olResult.join("\n");

  html = processWithoutCodeBlocks(html, (part) => {
    const tableLines = part.split("\n");
    const tableResult: string[] = [];
    let inTable = false;
    let tableRows: string[] = [];

    for (const tableLine of tableLines) {
      const trimmedLine = tableLine.trim();
      const isTableRow = /^\|(.+)\|$/.test(trimmedLine);
      const isSeparator = /^\|[-\s|:]+\|$/.test(trimmedLine);

      if (isTableRow) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        if (!isSeparator) {
          tableRows.push(trimmedLine);
        }
      } else {
        if (inTable && tableRows.length > 0) {
          tableResult.push(convertTableRows(tableRows));
          tableRows = [];
        }
        inTable = false;
        tableResult.push(tableLine);
      }
    }
    if (inTable && tableRows.length > 0) {
      tableResult.push(convertTableRows(tableRows));
    }
    return tableResult.join("\n");
  });

  // Paragraphs - wrap non-tagged content in <p>
  const lines = html.split("\n\n");
  html = lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (
        /^<(h[1-6]|ul|ol|li|div|p|blockquote|pre|code|table|thead|tbody|tfoot|tr|td|th|colgroup|col|section|article|header|footer|main|nav|aside|details|summary|hr)/i.test(
          trimmed,
        )
      ) {
        return trimmed;
      }
      if (/^[-*_]{3,}\s*$/.test(trimmed)) {
        return "<hr />";
      }
      if (!trimmed) return "";
      return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return html;
}

export function parseCustomComponents(markdown: string): ComponentMatch[] {
  const components: ComponentMatch[] = [];

  const componentRegex = /:::([\w-]+)\s*([^\n]*)\n([\s\S]*?):::\s*/g;
  let match: RegExpExecArray | null;

  while ((match = componentRegex.exec(markdown)) !== null) {
    const type = match[1];
    let propsString = match[2].trim();
    let content = match[3].trim();

    if (propsString && !propsString.includes("=")) {
      content = propsString + "\n" + content;
      propsString = "";
    }

    const props: Record<string, string> = {};
    const propRegex = /(\w+)=["']?([^"'\s]+)["']?/g;
    let propMatch;
    while ((propMatch = propRegex.exec(propsString)) !== null) {
      props[propMatch[1]] = propMatch[2];
    }

    components.push({
      type,
      content,
      props,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  // Parse single-line ::: components (like :::video src="..." :::)
  const singleLineRegex = /:::([\w-]+)\s+(.*?)\s*:::/g;
  let singleMatch: RegExpExecArray | null;
  while ((singleMatch = singleLineRegex.exec(markdown)) !== null) {
    // Skip if already matched by multi-line regex
    const alreadyMatched = components.some(
      (c) =>
        singleMatch!.index >= c.startIndex && singleMatch!.index < c.endIndex,
    );
    if (alreadyMatched) continue;

    const type = singleMatch[1];
    const propsString = singleMatch[2].trim();

    // Parse props
    const props: Record<string, string> = {};
    const propRegex = /(\w+)="([^"]+)"|(\w+)='([^']+)'|(\w+)=(\S+)/g;
    let propMatch;
    while ((propMatch = propRegex.exec(propsString)) !== null) {
      const key = propMatch[1] || propMatch[3] || propMatch[5];
      const value = propMatch[2] || propMatch[4] || propMatch[6];
      props[key] = value;
    }

    components.push({
      type,
      content: "",
      props,
      startIndex: singleMatch.index,
      endIndex: singleMatch.index + singleMatch[0].length,
    });
  }

  // Parse [IMG: description] for AI images
  const imgRegex = /\[IMG:\s*([^\]]+)\]/g;
  while ((match = imgRegex.exec(markdown)) !== null) {
    components.push({
      type: "ai-image",
      content: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  // Parse [IMAGE: url|alt|ratio|caption] for URL-based images
  const imageRegex =
    /\[IMAGE:\s*([^\]|]+)(?:\|([^\]|]*))?(?:\|([^\]|]*))?(?:\|([^\]]*))?\]/g;
  while ((match = imageRegex.exec(markdown)) !== null) {
    const [, url, alt, ratio, caption] = match;
    components.push({
      type: "image",
      content: JSON.stringify({
        url: url.trim(),
        alt: alt?.trim() || "",
        ratio: ratio?.trim() || "",
        caption: caption?.trim() || "",
      }),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return components;
}

// Theme colors interface for component rendering
export interface ThemeColors {
  accent: string;
  foreground: string;
  heading: string;
  link: string;
  border: string;
  code: string;
  background: string;
}

export function renderComponent(
  component: ComponentMatch,
  themeColors?: ThemeColors,
  forWeCom: boolean = false,
  aiImageIndex?: number,
): string {
  switch (component.type) {
    case "hero":
      return renderHero(component.content, themeColors);
    case "col-2":
      return renderColumns(component.content, 2);
    case "col-3":
      return renderColumns(component.content, 3);
    case "steps":
      return renderSteps(component.content, themeColors);
    case "timeline":
      return renderTimeline(component.content, themeColors);
    case "card":
      return renderCard(component.content, themeColors);
    case "video":
      return renderVideo(component.props || {});
    case "ai-image":
      return renderAIImage(component.content, aiImageIndex);
    case "image":
      return renderImage(component.content);
    case "callout":
      return renderCallout(component.props || {}, component.content);
    case "quote":
      return renderQuote(component.props || {}, component.content);
    case "tabs":
      return renderTabs(component.content, forWeCom);
    case "accordion":
      return renderAccordion(component.content, forWeCom);
    default:
      return component.content;
  }
}

function renderHero(content: string, themeColors?: ThemeColors): string {
  const htmlContent = markdownToHtml(content);
  // Use theme accent color directly, with fallback to default blue gradient
  const accentColor = themeColors?.accent || "#576b95";
  const darkerAccent = themeColors?.accent
    ? adjustColorHex(themeColors.accent, -30)
    : "#3d5a80";
  // Add explicit white color to inner elements for WeCom compatibility
  const styledContent = htmlContent
    .replace(/<h1>/g, '<h1 style="color: white;">')
    .replace(/<h2>/g, '<h2 style="color: white;">')
    .replace(/<h3>/g, '<h3 style="color: white;">')
    .replace(/<p>/g, '<p style="color: white;">')
    .replace(/<strong>/g, '<strong style="color: white;">')
    .replace(/<em>/g, '<em style="color: white;">');
  return `<div class="hero-component" style="color: white; background: linear-gradient(135deg, ${accentColor} 0%, ${darkerAccent} 100%); padding: 40px 24px; border-radius: 16px;">${styledContent}</div>`;
}

function renderColumns(content: string, cols: number): string {
  // Clean the content - remove leading/trailing whitespace
  const cleanContent = content.trim();

  // Split by --- separator (flexible: handles whitespace, multiple dashes)
  // Also remove the --- lines from the result
  const parts = cleanContent.split(/\n\s*-{3,}\s*\n/);

  // Filter out empty parts and process
  const columnItems = parts.map((part) => {
    let cleanPart = part.trim();
    // Remove leading/trailing --- lines from each part
    cleanPart = cleanPart
      .replace(/^\s*-{3,}\s*\n/g, "")
      .replace(/\n\s*-{3,}\s*$/g, "");
    return markdownToHtml(cleanPart);
  });

  if (cols === 2 && columnItems.length >= 2) {
    return `<div class="columns-flex"><div class="column-item">${columnItems[0]}</div><div class="column-item">${columnItems[1]}</div></div>`;
  } else if (cols === 3 && columnItems.length >= 3) {
    return `<div class="columns-flex"><div class="column-item">${columnItems[0]}</div><div class="column-item">${columnItems[1]}</div><div class="column-item">${columnItems[2]}</div></div>`;
  }

  // Fallback for fewer items than expected - stack them
  const itemsHtml = columnItems
    .map((item) => `<div class="column-item">${item}</div>`)
    .join("");

  return `<div class="columns-component">${itemsHtml}</div>`;
}

function renderSteps(content: string, _themeColors?: ThemeColors): string {
  const lines = content.split("\n");
  const steps: Array<{ number: number; title: string; description: string[] }> =
    [];
  let currentStep: {
    number: number;
    title: string;
    description: string[];
  } | null = null;

  for (const line of lines) {
    const match = line.match(/^(\d+)\.\s+(.+)$/);
    if (match) {
      if (currentStep) {
        steps.push(currentStep);
      }
      currentStep = {
        number: parseInt(match[1]),
        title: match[2].trim(),
        description: [],
      };
    } else if (currentStep && line.trim()) {
      currentStep.description.push(line.trim());
    }
  }

  if (currentStep) {
    steps.push(currentStep);
  }

  const stepsHtml = steps
    .map((step) => {
      const descContent =
        step.description.length > 0
          ? markdownToHtml(step.description.join("\n"))
          : "";
      const descHtml = descContent
        ? `<div class="step-desc">${descContent}</div>`
        : "";

      let titleHtml = markdownToHtml(step.title);
      if (
        step.description.length === 0 &&
        titleHtml.startsWith("<p>") &&
        titleHtml.endsWith("</p>")
      ) {
        titleHtml = titleHtml.slice(3, -4);
      }

      return `<div class="step-item"><div class="step-number">${step.number}</div><div class="step-content"><div class="step-title">${titleHtml}</div>${descHtml}</div></div>`;
    })
    .join("");

  return `<div class="steps-component">${stepsHtml}</div>`;
}

function renderTimeline(content: string, _themeColors?: ThemeColors): string {
  const items = content.split(/\n\s*-{3,}\s*\n/);

  const itemsHtml = items
    .map((item) => {
      const lines = item.trim().split("\n");
      const title = lines[0] || "";
      const body = lines.slice(1).join("\n");

      const titleHtml = markdownToHtml(title);
      const bodyHtml = body ? markdownToHtml(body) : "";
      let finalTitleHtml = titleHtml;
      if (!body && titleHtml.startsWith("<p>") && titleHtml.endsWith("</p>")) {
        finalTitleHtml = titleHtml.slice(3, -4);
      }

      return `<div class="timeline-item"><div class="timeline-title">${finalTitleHtml}</div>${bodyHtml ? `<div class="timeline-body">${bodyHtml}</div>` : ""}</div>`;
    })
    .join("");

  return `<div class="timeline-component">${itemsHtml}</div>`;
}

function renderCard(content: string, themeColors?: ThemeColors): string {
  let htmlContent = markdownToHtml(content);
  if (
    htmlContent.startsWith("<p>") &&
    htmlContent.endsWith("</p>") &&
    !htmlContent.includes("<br />")
  ) {
    htmlContent = htmlContent.slice(3, -4);
  }

  // Determine if dark theme based on background color
  const isDark = themeColors?.background
    ? isColorDark(themeColors.background)
    : false;

  // Use theme-aware colors for WeCom compatibility
  const borderColor = isDark ? "#3f3f3f" : "#e5e5e5";
  const backgroundColor = isDark ? "#1f1f1f" : "#fafafa";

  return `<div style="padding: 16px; border: 1px solid ${borderColor}; border-radius: 8px; margin: 12px 0; background: ${backgroundColor};">${htmlContent}</div>`;
}

// Helper function to determine if a color is dark
function isColorDark(hexColor: string): boolean {
  // Remove # if present
  const color = hexColor.replace("#", "");

  // Parse RGB values
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance < 0.5;
}

function renderVideo(props: Record<string, string>): string {
  const src = props.src || "";
  const poster = props.poster || "";
  const caption = props.caption || "";
  const autoplay = props.autoplay === "true" ? " autoplay" : "";
  const muted = props.muted === "true" ? " muted" : "";
  const loop = props.loop === "true" ? " loop" : "";
  const posterAttr = poster ? ` poster="${poster}"` : "";

  const videoHtml = `<video src="${src}"${posterAttr}${autoplay}${muted}${loop} controls class="video-player"></video>`;
  const captionHtml = caption
    ? `<div class="video-caption">${caption}</div>`
    : "";

  return `<div class="video-component">${videoHtml}${captionHtml}</div>`;
}

function renderAIImage(description: string, index?: number): string {
  const escapedDesc = description.replace(/"/g, "&#34;").replace(/'/g, "&#39;");
  const initialId = index !== undefined ? `ai-img-${index}` : "";
  const aiIdAttr = initialId ? ` data-ai-id="${initialId}"` : "";
  return `<div class="ai-image-placeholder"${aiIdAttr} data-description="${escapedDesc}" data-ratio="1:1"><div class="ai-image-icon">🎨</div><div class="ai-image-ratio-selector"><button class="ai-image-ratio-btn active" data-ratio="1:1">1:1</button><button class="ai-image-ratio-btn" data-ratio="16:9">16:9</button><button class="ai-image-ratio-btn" data-ratio="9:16">9:16</button><button class="ai-image-ratio-btn" data-ratio="4:3">4:3</button><button class="ai-image-ratio-btn" data-ratio="3:4">3:4</button></div><button class="ai-image-generate-btn" data-description="${escapedDesc}">✨ Generate Image</button><div class="ai-image-status"></div></div>`;
}

interface ImageData {
  url: string;
  alt: string;
  ratio: string;
  caption: string;
}

function renderImage(content: string): string {
  try {
    const data: ImageData = JSON.parse(content);
    const { url, alt, ratio, caption } = data;

    const aspectRatioClass = ratio ? `aspect-${ratio.replace(":", "-")}` : "";
    const captionHtml = caption
      ? `<div class="image-caption">${escapeHtml(caption)}</div>`
      : "";

    return `<figure class="image-wrapper ${aspectRatioClass}"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy" />${captionHtml}</figure>`;
  } catch {
    return "";
  }
}

function renderCallout(props: Record<string, string>, content: string): string {
  const type = props.type || "info";
  const title = props.title || "";
  const htmlContent = markdownToHtml(content);

  const icons: Record<string, string> = {
    info: "💡",
    warning: "⚠️",
    error: "❌",
    success: "✅",
  };

  const icon = icons[type] || icons.info;

  return `<div class="callout-component callout-${type}"><div class="callout-header"><span class="callout-icon">${icon}</span>${title ? `<strong class="callout-title">${title}</strong>` : ""}</div><div class="callout-content">${htmlContent}</div></div>`;
}

function renderQuote(props: Record<string, string>, content: string): string {
  const author = props.author || "";
  const source = props.source || "";
  const htmlContent = markdownToHtml(content);

  const attribution =
    author || source
      ? `<footer class="quote-attribution">${author ? `<cite class="quote-author">— ${author}</cite>` : ""}${source ? `<span class="quote-source"> (${source})</span>` : ""}</footer>`
      : "";

  return `<blockquote class="quote-component"><div class="quote-content">${htmlContent}</div>${attribution}</blockquote>`;
}

function renderTabs(content: string, forWeCom: boolean = false): string {
  const items = content.split(/\n\s*-{3,}\s*\n/);

  const buttons: string[] = [];
  const panels: string[] = [];

  items.forEach((item, index) => {
    const lines = item.trim().split("\n");
    const title = lines[0]
      ? lines[0].replace(/^#+\s*/, "").trim()
      : `Tab ${index + 1}`;
    const body = lines.slice(1).join("\n");
    const bodyHtml = body ? markdownToHtml(body) : "";

    if (forWeCom) {
      panels.push(
        `<section class="wecom-tab-section"><h4 class="wecom-tab-title">${title}</h4><div class="wecom-tab-content">${bodyHtml}</div></section>`,
      );
    } else {
      buttons.push(
        `<button class="tab-button${index === 0 ? " active" : ""}" data-tab="${index}">${title}</button>`,
      );
      panels.push(
        `<div class="tab-panel${index === 0 ? " active" : ""}" data-tab="${index}">${bodyHtml}</div>`,
      );
    }
  });

  if (forWeCom) {
    return `<div class="wecom-tabs">${panels.join("")}</div>`;
  }
  return `<div class="tabs-component"><div class="tab-list">${buttons.join("")}</div>${panels.join("")}</div>`;
}
function renderAccordion(content: string, forWeCom: boolean = false): string {
  const items = content.split(/\n\s*-{3,}\s*\n/);

  if (forWeCom) {
    const sectionsHtml = items
      .map((item, index) => {
        const lines = item.trim().split("\n");
        const title = lines[0]
          ? lines[0].replace(/^#+\s*/, "").trim()
          : `Section ${index + 1}`;
        const body = lines.slice(1).join("\n");
        const bodyHtml = body ? markdownToHtml(body) : "";

        return `<section class="wecom-accordion-section"><h4 class="wecom-accordion-title">▸ ${title}</h4><div class="wecom-accordion-content">${bodyHtml}</div></section>`;
      })
      .join("");

    return `<div class="wecom-accordion">${sectionsHtml}</div>`;
  }

  const accordionHtml = items
    .map((item, index) => {
      const lines = item.trim().split("\n");
      const title = lines[0]
        ? lines[0].replace(/^#+\s*/, "").trim()
        : `Section ${index + 1}`;
      const body = lines.slice(1).join("\n");
      const bodyHtml = body ? markdownToHtml(body) : "";

      return `<details class="accordion-item"${index === 0 ? " open" : ""}><summary class="accordion-header">${title}</summary><div class="accordion-content">${bodyHtml}</div></details>`;
    })
    .join("");

  return `<div class="accordion-component">${accordionHtml}</div>`;
}

export function convertMarkdownWithComponents(
  markdown: string,
  themeColors?: ThemeColors,
  forWeCom: boolean = false,
): string {
  const components = parseCustomComponents(markdown);

  let aiImageIndex = 0;
  const aiImageIndices = new Map<string, number>();
  for (const comp of components) {
    if (comp.type === "ai-image") {
      aiImageIndices.set(comp.content, aiImageIndex++);
    }
  }

  components.sort((a, b) => b.startIndex - a.startIndex);

  let result = markdown;
  for (const component of components) {
    const aiIndex =
      component.type === "ai-image"
        ? aiImageIndices.get(component.content)
        : undefined;
    const rendered = renderComponent(component, themeColors, forWeCom, aiIndex);
    const beforeContent = result.substring(0, component.startIndex);
    const afterContent = result.slice(component.endIndex);

    result = beforeContent + rendered + "\n\n" + afterContent;
  }

  result = markdownToHtml(result);

  return result;
}

// Component templates for insertion
export const componentTemplates = {
  hero: `:::hero
# 🎯 Welcome to Your Content
**Create amazing WeChat articles** with custom components
:::`,

  "col-2": `:::col-2
### Left Column

This is the first column. You can write multiple paragraphs here.

Each column flows vertically with its own content.

- Bullet point one
- Bullet point two
- Bullet point three
---
### Right Column

This is the second column with different content.

Columns are displayed side by side on desktop and stack on mobile.

**Bold text** and *italic text* work here too.
:::`,

  "col-3": `:::col-3
### Column One

First column content flows vertically.

Multiple paragraphs are supported.
---
### Column Two

Second column with its own content.

Each column is independent.
---
### Column Three

Third column completes the layout.

Great for feature comparisons!
:::`,

  steps: `:::steps
1. **First Step Title**
   Detailed description of the first step. You can use *markdown* here.

2. **Second Step Title**
   Explain what to do in the second step with clear instructions.

3. **Third Step Title**
   Final step with important details and next actions.
:::`,

  timeline: `:::timeline
**2024 Q1** - Project Launch
Initial release with core features and basic functionality
---
**2024 Q2** - Feature Expansion
Added AI integration and custom components
---
**2024 Q3** - Polish & Optimize
Performance improvements and UI enhancements
:::`,

  card: `:::card
## 💡 Pro Tip
Use **custom components** to create engaging layouts that stand out in WeChat feeds. Combine different components for maximum impact!
:::`,

  video: `:::video src="https://example.com/video.mp4" caption="Video demonstration" :::`,

  "ai-image": `[IMG: A beautiful sunset over mountains with vibrant colors]`,

  "local-image": `[LOCAL: image.jpg]`,

  callout: `:::callout type="info" title="Did you know?"
This is an informational callout. You can use **markdown** here.
:::`,

  quote: `:::quote author="Albert Einstein" source="Letter to Mario"
"The important thing is not to stop questioning."
:::`,

  tabs: `:::tabs
### Overview
This is the overview tab content.
---
### Details
This is the details tab content.
---
### Examples
This is the examples tab content.
:::`,

  accordion: `:::accordion
### Getting Started
Click to expand this section for getting started instructions.
---
### Advanced Usage
Click to expand this section for advanced usage tips.
---
### FAQ
Click to expand this section for frequently asked questions.
:::`,
};
