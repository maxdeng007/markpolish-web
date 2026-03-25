// AI provider integration for content enhancement

export function detectLanguage(text: string): "zh" | "en" | "mixed" {
  const chineseRegex = /[\u4e00-\u9fff]/g;
  const chineseCount = (text.match(chineseRegex) || []).length;
  const totalChars = text.replace(/\s/g, "").length;

  if (totalChars === 0) return "en";
  const chineseRatio = chineseCount / totalChars;

  if (chineseRatio > 0.3) return "zh";
  if (chineseRatio > 0.1) return "mixed";
  return "en";
}

export function getLanguageHint(content: string): string {
  const lang = detectLanguage(content);
  switch (lang) {
    case "zh":
      return "IMPORTANT: The content is in Chinese. Generate output in Chinese.";
    case "mixed":
      return "The content contains both Chinese and English. Match the dominant language.";
    default:
      return "The content is in English. Generate output in English.";
  }
}

export interface AIProvider {
  id: string;
  name: string;
  models: string[];
  requiresApiKey: boolean;
  baseUrl?: string;
}

export const aiProviders: Record<string, AIProvider> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    requiresApiKey: true,
    baseUrl: "https://api.openai.com/v1",
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    models: [
      "openai/gpt-4o",
      "anthropic/claude-3.5-sonnet",
      "google/gemini-pro",
      "meta-llama/llama-3-70b",
    ],
    requiresApiKey: true,
    baseUrl: "https://openrouter.ai/api/v1",
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    requiresApiKey: true,
    baseUrl: "https://api.anthropic.com/v1",
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    models: ["gemini-pro", "gemini-pro-vision"],
    requiresApiKey: true,
    baseUrl: "https://generativelanguage.googleapis.com/v1",
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    models: ["deepseek-chat", "deepseek-coder"],
    requiresApiKey: true,
    baseUrl: "https://api.deepseek.com/v1",
  },
  ollama: {
    id: "ollama",
    name: "Ollama (Local)",
    models: [], // Fetched dynamically
    requiresApiKey: false,
    baseUrl: "http://localhost:11434/v1",
  },
};

export interface AIConfig {
  provider: string;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface AIAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: (content: string, context?: string) => string;
  // Styling for the action button
  gradient?: string;
  hoverGradient?: string;
  shadowColor?: string;
}

export const aiActions: Record<string, AIAction> = {
  generateTitles: {
    id: "generateTitles",
    name: "Generate Titles",
    description: "Generate catchy, punchy titles",
    icon: "💡",
    gradient: "from-amber-400 to-orange-500",
    hoverGradient: "hover:from-amber-500 hover:to-orange-600",
    shadowColor: "shadow-orange-500/25",
    prompt: (content: string) => `${getLanguageHint(content)}

Generate 8-10 catchy, engaging titles for the following content.

Requirements:
- Optimize for WeChat/Chinese social media (keep titles under 15-20 characters when possible)
- Make them click-worthy but NOT clickbait
- Include a mix of styles: question-based, listicle, how-to, emotional, curiosity-driven
- Consider adding relevant emojis where appropriate (1-2 max)
- Return ONLY the titles, one per line, without numbering or bullet points

Content:
${content}`,
  },

  expandContent: {
    id: "expandContent",
    name: "Expand Content",
    description: "Add more detail and examples",
    icon: "📈",
    gradient: "from-emerald-400 to-teal-500",
    hoverGradient: "hover:from-emerald-500 hover:to-teal-600",
    shadowColor: "shadow-teal-500/25",
    prompt: (content: string, context?: string) => `${getLanguageHint(content)}

Expand and enrich the following content${context ? ` with this context in mind: ${context}` : ""}.

Guidelines:
- Add concrete examples, data points, or anecdotes to support key points
- Include transitional phrases for better flow between paragraphs
- Expand on brief mentions with more detail and explanation
- Add relevant quotes or references if appropriate
- Maintain the original tone and structure
- Keep the content engaging and readable
- DO NOT change the original meaning or add fictional claims
- CRITICAL: Preserve ALL markdown formatting including headers (# ## ###), bold (**text**), italic (*text*), blockquotes (>), code blocks (\`\`\`), lists (- or 1.), links ([text](url)), and all other syntax

Original content:
${content}`,
  },

  smartFormat: {
    id: "smartFormat",
    name: "Smart Format",
    description: "Improve structure and formatting",
    icon: "✨",
    gradient: "from-violet-400 to-purple-500",
    hoverGradient: "hover:from-violet-500 hover:to-purple-600",
    shadowColor: "shadow-purple-500/25",
    prompt: (content: string) => `${getLanguageHint(content)}

Improve the structure and formatting of the following content for optimal readability.

Formatting improvements:
- Fix grammar and spelling errors
- Add proper spacing between paragraphs (one blank line)
- Ensure headings are properly formatted with # syntax
- Create short, scannable paragraphs (3-4 sentences max)
- Use bullet points or numbered lists where appropriate
- Add emphasis (**bold**, *italic*) to key terms
- Optimize for mobile reading (WeChat-friendly)
- Keep the same content and meaning
- CRITICAL: Preserve ALL markdown formatting. Do NOT strip blockquotes (>), code blocks, or any other markdown syntax. Only improve and enhance the formatting.

Content to format:
${content}`,
  },

  suggestComponents: {
    id: "suggestComponents",
    name: "Suggest Components",
    description: "Get component suggestions",
    icon: "🧩",
    gradient: "from-cyan-400 to-blue-500",
    hoverGradient: "hover:from-cyan-500 hover:to-blue-600",
    shadowColor: "shadow-blue-500/25",
    prompt: (content: string) => {
      const lines = content.split("\n").filter((l) => l.trim()).length;
      const words = content.split(/\s+/).filter((w) => w.trim()).length;
      const headings = (content.match(/^#{1,6}\s/gm) || []).length;
      const hasExistingComponents = content.includes(":::");
      const lang = detectLanguage(content);
      const langHint =
        lang === "zh"
          ? "IMPORTANT: Generate output in Chinese."
          : lang === "mixed"
            ? "Match the dominant language in the content."
            : "Generate output in English.";

      return `${langHint}

Analyze the following markdown content and suggest custom components to enhance its visual appeal and readability.

Document Statistics:
- Length: ${lines} lines, ${words} words
- Headings: ${headings}
- Existing components: ${hasExistingComponents ? "Yes" : "None"}
- Document structure: ${headings === 0 ? "No headings (consider adding)" : headings <= 2 ? "Few headings" : headings <= 5 ? "Moderate structure" : "Well structured"}

Available components (MUST use TRIPLE colons: :::):
• :::hero - Hero section with title and subtitle (MUST be :::hero, NOT ::hero)
• :::col-2 / :::col-3 - Multi-column layouts. Use "---" (three dashes on its own line) as the separator between columns.
• :::steps - Step-by-step numbered instructions
• :::timeline - Chronological events or milestones
• :::card - Styled cards for highlighting key information
• :::callout - Info/warning/success/error callout boxes
• :::quote - Attributed quotes with styling
• :::tabs - Tabbed content sections
• :::accordion - Collapsible expandable sections
• [IMG: description] - Placeholder for AI-generated or stock images

CRITICAL SYNTAX RULES:
- ALWAYS use TRIPLE colons (:::) at the start and end: :::hero ... :::
- NEVER use double colons (::hero) - this is WRONG
- CORRECT: :::hero\n# Title\n## Subtitle\n:::
- WRONG: ::hero\n# Title\n## Subtitle\n:::

Guidelines:
- Suggest components that match the document's purpose (blog, tutorial, announcement, etc.)
- Prefer layout components (hero, columns) for documents > 200 words
- Use callout/quote for important callouts or testimonials
- Suggest images for visual-heavy content or when text alone is insufficient
- Don't suggest all components - pick 3-5 most impactful ones
- Vary component types for visual diversity

Return your suggestions as a JSON array. Each suggestion must be a valid JSON object with these exact fields:
{
  "component": ":::hero" (MUST be triple colons, NOT double colons),
  "location": "document-start | document-end | after-heading | before-heading",
  "headingText": "exact heading text (only if location is after-heading or before-heading)",
  "syntax": "EXACT component syntax with ::: delimiters (triple colons)",
  "reason": "brief explanation of why this component improves the content"
}

Example correct syntax:
":::hero\n# Main Title\n## Subtitle\n:::"

For location values:
- "document-start": Component should go at the very beginning
- "document-end": Component should go at the very end
- "after-heading": Component goes after a specific heading (specify headingText)
- "before-heading": Component goes before a specific heading (specify headingText)

Provide 3-5 suggestions as a JSON array. Return ONLY the JSON array, no other text.

Content to analyze:
${content}`;
    },
  },

  polishWithContext: {
    id: "polishWithContext",
    name: "Polish with Context",
    description: "Refine content with context",
    icon: "🧠",
    gradient: "from-rose-400 to-pink-500",
    hoverGradient: "hover:from-rose-500 hover:to-pink-600",
    shadowColor: "shadow-pink-500/25",
    prompt: (content: string, context?: string) => `${getLanguageHint(content)}

Polish and refine the following content${context ? `\n\n**Context/Goal:** ${context}` : " while preserving its original format and structure."}

Polishing guidelines:
- Improve clarity and conciseness without losing meaning
- Enhance word choice (replace generic words with more precise language)
- Smooth out awkward phrasing and improve sentence flow
- Maintain the author's unique voice and tone
- Keep all markdown formatting intact
- Ensure consistent style throughout
- Make it more engaging and professional
- DO NOT add new information or change the core message

Content to polish:
${content}`,
  },

  suggestViral: {
    id: "suggestViral",
    name: "Make Viral",
    description: "Optimize for viral potential",
    icon: "🔥",
    gradient: "from-red-400 to-orange-500",
    hoverGradient: "hover:from-red-500 hover:to-orange-600",
    shadowColor: "shadow-orange-500/25",
    prompt: (content: string) => `${getLanguageHint(content)}

You are a viral content expert. Rewrite the following content to maximize its viral potential on WeChat/social media.

Make it more shareable by:
- Creating a stronger opening hook
- Adding emotional triggers
- Including attention-grabbing elements
- Making it more relatable
- Adding share-worthy elements (questions, surprising facts)

Keep the core message and meaning. Preserve all markdown formatting (headers, bold, italic, lists, blockquotes, etc.).

Return ONLY the rewritten content, no explanations.

Original content:
${content}`,
  },

  suggestSEO: {
    id: "suggestSEO",
    name: "SEO Optimize",
    description: "Improve search ranking",
    icon: "🔍",
    gradient: "from-green-400 to-emerald-500",
    hoverGradient: "hover:from-green-500 hover:to-emerald-600",
    shadowColor: "shadow-emerald-500/25",
    prompt: (content: string) => `${getLanguageHint(content)}

You are an SEO expert. Rewrite the following content to improve its search engine ranking.

Optimize by:
- Including relevant keywords naturally
- Improving heading structure
- Enhancing content depth
- Better readability
- Clear structure

Keep the content natural and valuable. Preserve all markdown formatting (headers, bold, italic, lists, blockquotes, etc.).

Return ONLY the rewritten content, no explanations.

Original content:
${content}`,
  },
};

// Real AI API calls
export async function callAI(
  config: AIConfig,
  action: AIAction,
  content: string,
  context?: string,
): Promise<string> {
  const prompt = action.prompt(content, context);

  // Route to appropriate provider
  switch (config.provider) {
    case "openai":
      return await callOpenAI(config, prompt);
    case "openrouter":
      return await callOpenRouter(config, prompt);
    case "anthropic":
      return await callAnthropic(config, prompt);
    case "ollama":
      return await callOllama(config, prompt);
    case "deepseek":
      return await callDeepSeek(config, prompt);
    default:
      // Fallback to mock for unsupported providers
      return await mockAICall(action, content);
  }
}

// Streaming callback type
export type StreamingCallback = (text: string) => void;

// Streaming AI API calls
export async function callAIStream(
  config: AIConfig,
  action: AIAction,
  content: string,
  context: string | undefined,
  onChunk: StreamingCallback,
): Promise<void> {
  const prompt = action.prompt(content, context);

  switch (config.provider) {
    case "openai":
      await streamOpenAI(config, prompt, onChunk);
      break;
    case "openrouter":
      await streamOpenRouter(config, prompt, onChunk);
      break;
    case "deepseek":
      await streamDeepSeek(config, prompt, onChunk);
      break;
    case "ollama":
      await streamOllama(config, prompt, onChunk);
      break;
    default:
      // Fallback to non-streaming mock
      const result = await mockAICall(action, content);
      onChunk(result);
  }
}

async function streamOpenAI(
  config: AIConfig,
  prompt: string,
  onChunk: StreamingCallback,
): Promise<void> {
  if (!config.apiKey) {
    throw new Error("OpenAI API key is required");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API call failed");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onChunk(content);
        } catch {}
      }
    }
  }
}

async function streamOpenRouter(
  config: AIConfig,
  prompt: string,
  onChunk: StreamingCallback,
): Promise<void> {
  if (!config.apiKey) {
    throw new Error("OpenRouter API key is required");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "MarkPolish Studio",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("OpenRouter API call failed");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onChunk(content);
        } catch {}
      }
    }
  }
}

async function streamDeepSeek(
  config: AIConfig,
  prompt: string,
  onChunk: StreamingCallback,
): Promise<void> {
  if (!config.apiKey) {
    throw new Error("DeepSeek API key is required");
  }

  const baseUrl = config.baseUrl || "https://api.deepseek.com/v1";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "DeepSeek API call failed");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onChunk(content);
        } catch {}
      }
    }
  }
}

async function streamOllama(
  config: AIConfig,
  prompt: string,
  onChunk: StreamingCallback,
): Promise<void> {
  const baseUrl = config.baseUrl || "http://localhost:11434/v1";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error("Ollama API call failed. Make sure Ollama is running.");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        const content = parsed.message?.content;
        if (content) onChunk(content);
      } catch {}
    }
  }
}

async function callOpenAI(config: AIConfig, prompt: string): Promise<string> {
  if (!config.apiKey) {
    throw new Error("OpenAI API key is required");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API call failed");
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

async function callOpenRouter(
  config: AIConfig,
  prompt: string,
): Promise<string> {
  if (!config.apiKey) {
    throw new Error("OpenRouter API key is required");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "MarkPolish Studio",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: prompt }],
      }),
    },
  );

  if (!response.ok) {
    throw new Error("OpenRouter API call failed");
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

async function callAnthropic(
  config: AIConfig,
  prompt: string,
): Promise<string> {
  if (!config.apiKey) {
    throw new Error("Anthropic API key is required");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error("Anthropic API call failed");
  }

  const data = await response.json();
  return data.content[0]?.text || "";
}

async function callOllama(config: AIConfig, prompt: string): Promise<string> {
  const baseUrl = config.baseUrl || "http://localhost:11434/v1";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error("Ollama API call failed. Make sure Ollama is running.");
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

async function callDeepSeek(config: AIConfig, prompt: string): Promise<string> {
  if (!config.apiKey) {
    throw new Error("DeepSeek API key is required");
  }

  const baseUrl = config.baseUrl || "https://api.deepseek.com/v1";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "DeepSeek API call failed");
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

// Mock fallback for testing
async function mockAICall(action: AIAction, content: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  switch (action.id) {
    case "generateTitles":
      return `10 Ways to Master ${content.substring(0, 20)}
The Ultimate Guide to ${content.substring(0, 20)}
How I ${content.substring(0, 20)} in 30 Days
${content.substring(0, 20)}: Everything You Need to Know
The Secret to ${content.substring(0, 20)}`;

    case "expandContent":
      return `${content}\n\nThis concept is particularly important because it demonstrates how we can approach complex problems with a systematic methodology. Let me elaborate on each aspect:\n\nFirst, consider the foundational principles...`;

    case "smartFormat":
      return content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line)
        .join("\n\n");

    case "suggestComponents":
      return `Component: :::hero
Location: At the beginning
Reason: Create an eye-catching introduction

Component: :::col-2
Location: In the features section
Reason: Better visual comparison of features

Component: [IMG: relevant image]
Location: After the introduction
Reason: Add visual interest and break up text`;

    case "polishWithContext":
      return content.replace(/\b(good|nice|great)\b/gi, "excellent");

    default:
      return content;
  }
}

export async function fetchOllamaModels(
  baseUrl: string = "http://localhost:11434",
): Promise<string[]> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    const data = await response.json();
    return data.models?.map((m: any) => m.name) || [];
  } catch (error) {
    console.error("Failed to fetch Ollama models:", error);
    return [];
  }
}

// Fetch models from OpenAI-compatible API
export async function fetchOpenAICompatibleModels(
  baseUrl: string,
  apiKey: string,
): Promise<string[]> {
  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (data.data && Array.isArray(data.data)) {
      return data.data
        .map((m: any) => m.id)
        .filter((id: string) => !id.includes("embedding"));
    }
    return [];
  } catch (error) {
    return [];
  }
}

// Fetch models from Anthropic
export async function fetchAnthropicModels(
  _baseUrl: string,
  _apiKey: string,
): Promise<string[]> {
  // Anthropic doesn't have a public models list API
  // Return default models
  return [
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
    "claude-3-5-sonnet-20241022",
  ];
}

// Fetch models from Google Gemini
export async function fetchGeminiModels(apiKey: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );
    if (!response.ok) return [];
    const data = await response.json();
    return (
      data.models
        ?.map((m: any) => m.name.replace("models/", ""))
        .filter((id: string) => !id.includes("vision")) || []
    );
  } catch (error) {
    console.error("Failed to fetch Gemini models:", error);
    return [];
  }
}

// Universal fetch function that routes to appropriate provider
export async function fetchProviderModels(
  providerId: string,
  baseUrl?: string,
  apiKey?: string,
): Promise<string[]> {
  switch (providerId) {
    case "ollama":
      return fetchOllamaModels(baseUrl || "http://localhost:11434");
    case "anthropic":
      return fetchAnthropicModels(baseUrl || "", apiKey || "");
    case "gemini":
      return fetchGeminiModels(apiKey || "");
    default:
      // Default to OpenAI-compatible for OpenAI, OpenRouter, DeepSeek
      if (baseUrl && apiKey) {
        return fetchOpenAICompatibleModels(baseUrl, apiKey);
      }
      return [];
  }
}
