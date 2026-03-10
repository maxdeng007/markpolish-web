// Custom markdown component parser for WeChat-optimized content

export interface ComponentMatch {
  type: string;
  content: string;
  props?: Record<string, string>;
  startIndex: number;
  endIndex: number;
}

/**
 * Convert basic markdown syntax to HTML
 * This is needed because content inside HTML tags is not processed by ReactMarkdown
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headers (must be at start of line)
  html = html.replace(/^###### (.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold (must be before italic)
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Unordered lists - properly wrap in <ul>
  const ulLines = html.split('\n');
  const ulResult: string[] = [];
  let inUl = false;
  let ulItems: string[] = [];
  
  for (const ulLine of ulLines) {
    const ulMatch = ulLine.match(/^- (.+)$/);
    if (ulMatch) {
      if (!inUl) {
        inUl = true;
        ulItems = [];
      }
      ulItems.push(`<li>${ulMatch[1]}</li>`);
    } else {
      if (inUl && ulItems.length > 0) {
        ulResult.push(`<ul>${ulItems.join('')}</ul>`);
        ulItems = [];
        inUl = false;
      }
      ulResult.push(ulLine);
    }
  }
  if (inUl && ulItems.length > 0) {
    ulResult.push(`<ul>${ulItems.join('')}</ul>`);
  }
  html = ulResult.join('\n');

  // Ordered lists - properly wrap in <ol>
  const olLines = html.split('\n');
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
        olResult.push(`<ol>${olItems.join('')}</ol>`);
        olItems = [];
        inOl = false;
      }
      olResult.push(olLine);
    }
  }
  if (inOl && olItems.length > 0) {
    olResult.push(`<ol>${olItems.join('')}</ol>`);
  }
  html = olResult.join('\n');
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Paragraphs - wrap non-tagged content in <p>
  const lines = html.split("\n\n");
  html = lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      // Don't wrap if it starts with a block element
      if (/^<(h[1-6]|ul|ol|li|div|p|blockquote|pre|code)/i.test(trimmed)) {
        return trimmed;
      }
      // Don't wrap if it's just whitespace
      if (!trimmed) return "";
      return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return html;
}

export function parseCustomComponents(markdown: string): ComponentMatch[] {
  const components: ComponentMatch[] = [];

  // Parse ::: components (multi-line)
  const componentRegex = /:::([\w-]+)(.*?)\n([\s\S]*?):::/g;
  let match: RegExpExecArray | null;

  while ((match = componentRegex.exec(markdown)) !== null) {
    const type = match[1];
    const propsString = match[2].trim();
    const content = match[3].trim();

    // Parse props
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

  // Parse [LOCAL: filename] for local images
  const localImgRegex = /\[LOCAL:\s*([^\]]+)\]/g;
  while ((match = localImgRegex.exec(markdown)) !== null) {
    components.push({
      type: "local-image",
      content: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return components;
}

export function renderComponent(component: ComponentMatch): string {
  switch (component.type) {
    case "hero":
      return renderHero(component.content);
    case "col-2":
      return renderColumns(component.content, 2);
    case "col-3":
      return renderColumns(component.content, 3);
    case "steps":
      return renderSteps(component.content);
    case "timeline":
      return renderTimeline(component.content);
    case "card":
      return renderCard(component.content);
    case "video":
      return renderVideo(component.props || {});
    case "ai-image":
      return renderAIImage(component.content);
    case "local-image":
      return renderLocalImage(component.content);
    case "callout":
      return renderCallout(component.props || {}, component.content);
    case "quote":
      return renderQuote(component.props || {}, component.content);
    case "tabs":
      return renderTabs(component.content);
    case "accordion":
      return renderAccordion(component.content);
    default:
      return component.content;
  }
}

function renderHero(content: string): string {
  const htmlContent = markdownToHtml(content);
  return `<div class="hero-component" style="color: white; background: var(--hero-bg, linear-gradient(135deg, #576b95, #3d5a80)); padding: 40px 24px; border-radius: 16px;">${htmlContent}</div>`;
}

function renderColumns(content: string, cols: number): string {
  // Split by --- separator (flexible: handles whitespace, multiple dashes)
  const items = content.split(/\n\s*-{3,}\s*\n/);

  // Build column items with markdown converted to HTML
  const columnItems = items
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => {
      const htmlContent = markdownToHtml(item);
      return htmlContent;
    });

  // Use TABLE-based layout with CSS classes for WeChat/WeCom Code mode
  if (cols === 2 && columnItems.length >= 2) {
    return `<table class="columns-table"><tr><td class="column-item">${columnItems[0]}</td><td class="column-item">${columnItems[1]}</td></tr></table>`;
  } else if (cols === 3 && columnItems.length >= 3) {
    return `<table class="columns-table"><tr><td class="column-item">${columnItems[0]}</td><td class="column-item">${columnItems[1]}</td><td class="column-item">${columnItems[2]}</td></tr></table>`;
  }

  // Fallback for fewer items than expected - stack them
  const itemsHtml = columnItems
    .map((item) => `<div class="column-item">${item}</div>`)
    .join("");

  return `<div class="columns-component">${itemsHtml}</div>`;
}

function renderSteps(content: string): string {
  const lines = content.split("\n");
  const steps: Array<{ number: number; title: string; description: string[] }> =
    [];
  let currentStep: {
    number: number;
    title: string;
    description: string[];
  } | null = null;

  for (const line of lines) {
    // Match numbered list items
    const match = line.match(/^(\d+)\.\s+(.+)$/);
    if (match) {
      // Save previous step
      if (currentStep) {
        steps.push(currentStep);
      }
      // Start new step
      currentStep = {
        number: parseInt(match[1]),
        title: match[2].trim(),
        description: [],
      };
    } else if (currentStep && line.trim()) {
      // Add to description (remove leading spaces but preserve structure)
      currentStep.description.push(line.trim());
    }
  }

  // Save last step
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
        ? `<div class="step-description">${descContent}</div>`
        : "";

      // Convert markdown in title (for bold, italic, etc.) but don't wrap in <p> for simple titles
      let titleHtml = markdownToHtml(step.title);
      // Strip <p> wrapper if title is simple (single line, no complex markdown)
      if (step.description.length === 0 && titleHtml.startsWith('<p>') && titleHtml.endsWith('</p>')) {
        titleHtml = titleHtml.slice(3, -4);
      }
      return `<div class="step-item"><div class="step-number">${step.number}</div><div class="step-content"><div class="step-title">${titleHtml}</div>${descHtml}</div></div>`;
    })
    .join("");

  return `<div class="steps-component">${stepsHtml}</div>`;
}

function renderTimeline(content: string): string {
  const items = content.split(/\n\s*-{3,}\s*\n/);
  const itemsHtml = items
    .map((item) => {
      const lines = item.trim().split("\n");
      const title = lines[0] || "";
      const body = lines.slice(1).join("\n");

      const titleHtml = markdownToHtml(title);
      const bodyHtml = body ? markdownToHtml(body) : "";
      // For timeline, only strip <p> if there's no body content
      let finalTitleHtml = titleHtml;
      if (!body && titleHtml.startsWith('<p>') && titleHtml.endsWith('</p>')) {
        finalTitleHtml = titleHtml.slice(3, -4);
      }

      return `<div class="timeline-item"><div class="timeline-marker"></div><div class="timeline-content"><div class="timeline-title">${finalTitleHtml}</div>${bodyHtml ? `<div class="timeline-body">${bodyHtml}</div>` : ""}</div></div>`;

    })
    .join("");

  return `<div class="timeline-component">${itemsHtml}</div>`;
}

function renderCard(content: string): string {
  let htmlContent = markdownToHtml(content);
  // Strip <p> wrapper if content is simple single paragraph
  if (htmlContent.startsWith('<p>') && htmlContent.endsWith('</p>') && !htmlContent.includes('<br />')) {
    htmlContent = htmlContent.slice(3, -4);
  }
  return `<div class="card-component">${htmlContent}</div>`;
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

function renderAIImage(description: string): string {
  const escapedDesc = description.replace(/"/g, "&#34;").replace(/'/g, "&#39;");
  return `<div class="ai-image-placeholder" data-description="${escapedDesc}" data-ratio="1:1"><div class="ai-image-icon">🎨</div><div class="ai-image-ratio-selector"><button class="ai-image-ratio-btn active" data-ratio="1:1">1:1</button><button class="ai-image-ratio-btn" data-ratio="16:9">16:9</button><button class="ai-image-ratio-btn" data-ratio="9:16">9:16</button><button class="ai-image-ratio-btn" data-ratio="4:3">4:3</button><button class="ai-image-ratio-btn" data-ratio="3:4">3:4</button></div><button class="ai-image-generate-btn" data-description="${escapedDesc}">✨ Generate Image</button><div class="ai-image-status"></div></div>`;
}

function renderLocalImage(filename: string): string {
  return `<div class="local-image-wrapper"><img src="/projects/images/${filename}" alt="${filename}" class="local-image" /><div class="local-image-caption">${filename}</div></div>`;
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

function renderTabs(content: string): string {
  const items = content.split(/\n\s*-{3,}\s*\n/);

  const tabsHtml = items
    .map((item, index) => {
      const lines = item.trim().split("\n");
      const title = lines[0]
        ? lines[0].replace(/^#+\s*/, "").trim()
        : `Tab ${index + 1}`;
      const body = lines.slice(1).join("\n");
      const bodyHtml = body ? markdownToHtml(body) : "";

      return `<div class="tab-item" data-tab="${index}"><div class="tab-title">${title}</div><div class="tab-content">${bodyHtml}</div></div>`;
    })
    .join("");

  return `<div class="tabs-component">${tabsHtml}</div>`;
}
function renderAccordion(content: string): string {
  const items = content.split(/\n\s*-{3,}\s*\n/);

  const accordionHtml = items
    .map((item, index) => {
      const lines = item.trim().split("\n");
      const title = lines[0]
        ? lines[0].replace(/^#+\s*/, "").trim()
        : `Section ${index + 1}`;
      const body = lines.slice(1).join("\n");
      const bodyHtml = body ? markdownToHtml(body) : "";

      return `<details class="accordion-item"><summary class="accordion-title">${title}</summary><div class="accordion-content">${bodyHtml}</div></details>`;

    })
    .join("");

  return `<div class="accordion-component">${accordionHtml}</div>`;
}

export function convertMarkdownWithComponents(markdown: string): string {
  const components = parseCustomComponents(markdown);

  // Sort by startIndex in reverse order to replace from end to start
  components.sort((a, b) => b.startIndex - a.startIndex);

  let result = markdown;
  for (const component of components) {
    const rendered = renderComponent(component);
    result =
      result.substring(0, component.startIndex) +
      rendered +
      result.slice(component.endIndex);
  }
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
