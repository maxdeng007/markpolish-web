import { describe, it, expect } from "vitest";
import {
  parseCustomComponents,
  convertMarkdownWithComponents,
  renderComponent,
  componentTemplates,
} from "@/lib/markdown-components";

describe("parseCustomComponents", () => {
  it("should parse col-2 component", () => {
    const markdown = `:::col-2
### Left
Content left
---
### Right
Content right
:::`;
    const components = parseCustomComponents(markdown);
    expect(components).toHaveLength(1);
    expect(components[0].type).toBe("col-2");
  });

  it("should parse col-3 component", () => {
    const markdown = `:::col-3
### One
---
### Two
---
### Three
:::`;
    const components = parseCustomComponents(markdown);
    expect(components).toHaveLength(1);
    expect(components[0].type).toBe("col-3");
  });

  it("should parse video component with props", () => {
    const markdown = `:::video src="https://example.com/video.mp4" caption="Demo" :::`;
    const components = parseCustomComponents(markdown);
    expect(components).toHaveLength(1);
    expect(components[0].type).toBe("video");
    expect(components[0].props?.src).toBe("https://example.com/video.mp4");
    expect(components[0].props?.caption).toBe("Demo");
  });

  it("should parse hero component", () => {
    const markdown = `:::hero
# Welcome
**Bold text**
:::`;
    const components = parseCustomComponents(markdown);
    expect(components).toHaveLength(1);
    expect(components[0].type).toBe("hero");
  });

  it("should parse steps component", () => {
    const markdown = `:::steps
1. First step
2. Second step
3. Third step
:::`;
    const components = parseCustomComponents(markdown);
    expect(components).toHaveLength(1);
    expect(components[0].type).toBe("steps");
  });

  it("should parse timeline component", () => {
    const markdown = `:::timeline
**2024 Q1** - Launch
---
**2024 Q2** - Growth
:::`;
    const components = parseCustomComponents(markdown);
    expect(components).toHaveLength(1);
    expect(components[0].type).toBe("timeline");
  });

  it("should parse card component", () => {
    const markdown = `:::card
## Pro Tip
Use components!
:::`;
    const components = parseCustomComponents(markdown);
    expect(components).toHaveLength(1);
    expect(components[0].type).toBe("card");
  });

  it("should parse ai-image placeholder", () => {
    const markdown = `[IMG: beautiful sunset]`;
    const components = parseCustomComponents(markdown);
    expect(components).toHaveLength(1);
    expect(components[0].type).toBe("ai-image");
    expect(components[0].content).toBe("beautiful sunset");
  });

  it("should parse local-image placeholder", () => {
    const markdown = `[LOCAL: image.jpg]`;
    const components = parseCustomComponents(markdown);
    expect(components).toHaveLength(1);
    expect(components[0].type).toBe("local-image");
    expect(components[0].content).toBe("image.jpg");
  });
});

describe("convertMarkdownWithComponents", () => {
  it("should convert col-2 to HTML with columns-component class", () => {
    const markdown = `:::col-2
### Left
Content
---
### Right
Content
:::`;
    const result = convertMarkdownWithComponents(markdown);
    expect(result).toContain("columns-component");
    expect(result).toContain("col-2");
    expect(result).toContain("column-item");
  });

  it("should convert video to HTML with video-player class", () => {
    const markdown = `:::video src="https://example.com/video.mp4" caption="Demo" :::`;
    const result = convertMarkdownWithComponents(markdown);
    expect(result).toContain("video-component");
    expect(result).toContain("video-player");
    expect(result).toContain("controls");
  });

  it("should convert hero to HTML with hero-component class", () => {
    const markdown = `:::hero
# Welcome
:::`;
    const result = convertMarkdownWithComponents(markdown);
    expect(result).toContain("hero-component");
  });

  it("should convert markdown to HTML inside components", () => {
    const markdown = `:::col-2
### Title
**Bold** text
---
### Other
*Italic* text
:::`;
    const result = convertMarkdownWithComponents(markdown);
    expect(result).toContain("<h3>");
    expect(result).toContain("<strong>");
  });
});

describe("renderComponent", () => {
  it("should render col-2 with proper HTML structure", () => {
    const component = {
      type: "col-2",
      content: "### Left\n\nContent\n---\n### Right\n\nContent",
      startIndex: 0,
      endIndex: 50,
    };
    const result = renderComponent(component);
    expect(result).toContain("columns-component col-2");
    expect(result).toContain("<h3>");
  });

  it("should render video with proper attributes", () => {
    const component = {
      type: "video",
      props: {
        src: "https://example.com/video.mp4",
        caption: "Demo video",
        autoplay: "true",
        muted: "true",
      },
      content: "",
      startIndex: 0,
      endIndex: 50,
    };
    const result = renderComponent(component);
    expect(result).toContain('src="https://example.com/video.mp4"');
    expect(result).toContain("autoplay");
    expect(result).toContain("muted");
    expect(result).toContain("controls");
    expect(result).toContain("Demo video");
  });

  it("should render card with markdown converted to HTML", () => {
    const component = {
      type: "card",
      content: "## Pro Tip\n\n**Bold** text",
      startIndex: 0,
      endIndex: 30,
    };
    const result = renderComponent(component);
    expect(result).toContain("card-component");
    expect(result).toContain("<h2>");
    expect(result).toContain("<strong>");
  });
});

describe("componentTemplates", () => {
  it("should have all required templates", () => {
    expect(componentTemplates.hero).toBeDefined();
    expect(componentTemplates["col-2"]).toBeDefined();
    expect(componentTemplates["col-3"]).toBeDefined();
    expect(componentTemplates.steps).toBeDefined();
    expect(componentTemplates.timeline).toBeDefined();
    expect(componentTemplates.card).toBeDefined();
    expect(componentTemplates.video).toBeDefined();
  });

  it("col-2 template should use h3 headings", () => {
    expect(componentTemplates["col-2"]).toContain("### Left Column");
    expect(componentTemplates["col-2"]).toContain("### Right Column");
  });

  it("col-3 template should use h3 headings", () => {
    expect(componentTemplates["col-3"]).toContain("### Column One");
    expect(componentTemplates["col-3"]).toContain("### Column Two");
    expect(componentTemplates["col-3"]).toContain("### Column Three");
  });

  it("all templates should be non-empty strings", () => {
    Object.values(componentTemplates).forEach((template) => {
      expect(typeof template).toBe("string");
      expect(template.length).toBeGreaterThan(0);
    });
  });
});
