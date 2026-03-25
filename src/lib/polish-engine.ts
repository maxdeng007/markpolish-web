// Advanced markdown polishing engine

export interface PolishOptions {
  fixHeadings: boolean;
  fixLists: boolean;
  fixCodeBlocks: boolean;
  fixLinks: boolean;
  fixEmphasis: boolean;
  fixTables: boolean;
  addBlankLines: boolean;
  removeTrailingSpaces: boolean;
  ensureEndingNewline: boolean;
  maxLineLength?: number;
}

export const defaultPolishOptions: PolishOptions = {
  fixHeadings: true,
  fixLists: true,
  fixCodeBlocks: true,
  fixLinks: true,
  fixEmphasis: true,
  fixTables: true,
  addBlankLines: true,
  removeTrailingSpaces: true,
  ensureEndingNewline: true,
  maxLineLength: undefined,
};

export function polishMarkdown(
  markdown: string,
  options: PolishOptions = defaultPolishOptions,
): string {
  let polished = markdown;

  // Fix headings
  if (options.fixHeadings) {
    // Ensure space after # symbols
    polished = polished.replace(/^(#{1,6})([^\s#])/gm, "$1 $2");
    // Remove extra spaces
    polished = polished.replace(/^(#{1,6})\s{2,}/gm, "$1 ");
    // Ensure blank line before headings (except at start)
    polished = polished.replace(/([^\n])\n(#{1,6}\s)/g, "$1\n\n$2");
    // Ensure blank line after headings
    polished = polished.replace(/(#{1,6}\s.+)\n([^\n#])/g, "$1\n\n$2");
  }

  // Fix lists
  if (options.fixLists) {
    // Standardize unordered list markers to -
    polished = polished.replace(/^(\s*)[\*\+]\s/gm, "$1- ");
    // Ensure space after list markers
    polished = polished.replace(/^(\s*[-\*\+]|\d+\.)([^\s])/gm, "$1 $2");
    // Ensure blank line before lists
    polished = polished.replace(/([^\n])\n(\s*[-\*\+\d])/g, (match, p1, p2) => {
      if (p1.match(/^\s*[-\*\+\d]/)) return match; // Already in a list
      return `${p1}\n\n${p2}`;
    });
  }

  // Fix code blocks
  if (options.fixCodeBlocks) {
    // Ensure blank line before code blocks
    polished = polished.replace(/([^\n])\n```/g, "$1\n\n```");
    // Ensure blank line after code blocks
    polished = polished.replace(/```\n([^\n])/g, "```\n\n$1");
  }

  // Fix links
  if (options.fixLinks) {
    // Remove spaces in link syntax
    polished = polished.replace(
      /\[\s+([^\]]+)\s+\]\(\s*([^\)]+)\s*\)/g,
      "[$1]($2)",
    );
  }

  // Fix emphasis
  if (options.fixEmphasis) {
    // Standardize bold to **
    polished = polished.replace(/__([^_]+)__/g, "**$1**");
    // Standardize italic to *
    polished = polished.replace(/_([^_]+)_/g, "*$1*");
  }

  // Fix tables
  if (options.fixTables) {
    const lines = polished.split("\n");
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if this is a table row
      if (line.includes("|")) {
        // Ensure spaces around pipes
        const fixed = line.replace(/\s*\|\s*/g, " | ").trim();
        result.push(fixed);
      } else {
        result.push(line);
      }
    }

    polished = result.join("\n");
  }

  // Add blank lines between different block elements
  if (options.addBlankLines) {
    // Between paragraphs and other elements
    polished = polished.replace(/([^\n])\n([^\n])/g, (match, p1, p2) => {
      // Don't add if already in a list or code block
      if (p1.match(/^\s*[-\*\+\d]/) || p2.match(/^\s*[-\*\+\d]/)) return match;
      if (p1.includes("```") || p2.includes("```")) return match;
      if (p1.match(/^#{1,6}\s/) || p2.match(/^#{1,6}\s/)) return match;
      return `${p1}\n\n${p2}`;
    });
  }

  // Remove trailing spaces
  if (options.removeTrailingSpaces) {
    polished = polished
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n");
  }

  // Remove multiple consecutive blank lines
  polished = polished.replace(/\n{3,}/g, "\n\n");

  // Ensure ending newline
  if (options.ensureEndingNewline && !polished.endsWith("\n")) {
    polished += "\n";
  }

  // Trim start
  polished = polished.trimStart();

  return polished;
}

export interface EnhancedReadability {
  fleschScore: number;
  gradeLevel: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  interpretation: string;
  chineseScore: number;
  chineseInterpretation: string;
  hasChinese: boolean;
  isMixedLanguage: boolean;
}

export function analyzeReadability(markdown: string): EnhancedReadability {
  const plainText = markdown
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "");

  const sentences = plainText
    .split(/[.!?。！？]+/)
    .filter((s) => s.trim().length > 0);
  const words = plainText.split(/\s+/).filter((w) => w.length > 0);

  const chineseChars = (plainText.match(/[\u4e00-\u9fff]/g) || []).length;
  const hasChinese = chineseChars > 0;
  const isMixedLanguage = hasChinese && words.length > 0;

  const syllables = words.reduce(
    (count, word) => count + countSyllables(word),
    0,
  );

  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
  const avgSyllablesPerWord = syllables / Math.max(words.length, 1);
  const fleschScore =
    206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  const gradeLevel =
    0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

  const chineseSentenceRatio =
    sentences.length > 0
      ? sentences.filter((s) => /[\u4e00-\u9fff]/.test(s)).length /
        sentences.length
      : 0;
  const chineseScore = hasChinese
    ? Math.max(0, Math.min(100, 60 + (1 - chineseSentenceRatio) * 40))
    : 100;

  return {
    fleschScore: Math.max(0, Math.min(100, fleschScore)),
    gradeLevel: Math.max(0, gradeLevel),
    avgWordsPerSentence,
    avgSyllablesPerWord,
    interpretation: getFleschInterpretation(fleschScore),
    chineseScore,
    chineseInterpretation: getChineseInterpretation(chineseScore),
    hasChinese,
    isMixedLanguage,
  };
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");

  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

function getFleschInterpretation(score: number): string {
  if (score >= 90) return "stats.fleschVeryEasy";
  if (score >= 80) return "stats.fleschEasy";
  if (score >= 70) return "stats.fleschFairlyEasy";
  if (score >= 60) return "stats.fleschStandard";
  if (score >= 50) return "stats.fleschFairlyDifficult";
  if (score >= 30) return "stats.fleschDifficult";
  return "stats.fleschVeryDifficult";
}

function getChineseInterpretation(score: number): string {
  if (score >= 80) return "stats.chineseEasy";
  if (score >= 60) return "stats.chineseStandard";
  if (score >= 40) return "stats.chineseComplex";
  return "stats.chineseVeryComplex";
}

export interface WeChatAnalysis {
  titleLength: number;
  titleStatus: "good" | "warning" | "error";
  titleSuggestion: string;
  coverImageStatus: "good" | "warning" | "error";
  coverSuggestion: string;
  emojiCount: number;
  ctaCount: number;
  ctaSuggestions: string[];
  keywordDensity: { word: string; density: number }[];
  readingProgress: number;
  visualBalance: number;
}

export function analyzeWeChatSpecifics(markdown: string): WeChatAnalysis {
  const lines = markdown.split("\n");
  const firstLine = lines.find((l) => l.trim().startsWith("#")) || "";
  const titleLength = firstLine.replace(/^#+\s*/, "").length;
  const emojiRegex =
    /[\u{1F000}-\u{1FFFF}]|[\u2600-\u26FF]|[\u2700-\u27BF]|[👍👏🔥✨💡📌⭐❤️💬📖🎯]/gu;
  const emojiCount = (markdown.match(emojiRegex) || []).length;
  const ctaPatterns = [
    /关注|订阅|转发|点赞|点在看|分享/g,
    /follow|subscribe|share|like|retweet/gi,
  ];
  const ctaCount = ctaPatterns.reduce((count, pattern) => {
    return count + (markdown.match(pattern) || []).length;
  }, 0);

  const wordFreq: Record<string, number> = {};
  const words = markdown.toLowerCase().match(/[a-z\u4e00-\u9fff]{2,}/g) || [];
  words.forEach((w) => {
    wordFreq[w] = (wordFreq[w] || 0) + 1;
  });
  const totalWords = words.length;
  const keywordDensity = Object.entries(wordFreq)
    .filter(([word]) => word.length > 2)
    .map(([word, count]) => ({
      word,
      density: totalWords > 0 ? (count / totalWords) * 100 : 0,
    }))
    .filter((k) => k.density > 1)
    .sort((a, b) => b.density - a.density)
    .slice(0, 5);

  const hasImages = (markdown.match(/!\[.*?\]\(.*?\)/g) || []).length;
  const imageCount = hasImages;
  const paragraphs = markdown
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0).length;
  const visualBalance = Math.min(100, imageCount * 20 + paragraphs * 5);

  const readingTime = getDocumentStats(markdown).readingTime;
  const readingProgress = readingTime <= 5 ? 100 : readingTime <= 10 ? 70 : 40;

  return {
    titleLength,
    titleStatus:
      titleLength <= 30 ? "good" : titleLength <= 64 ? "warning" : "error",
    titleSuggestion:
      titleLength <= 30
        ? "stats.titleGood"
        : titleLength <= 64
          ? "stats.titleWarning"
          : "stats.titleTooLong",
    coverImageStatus: imageCount >= 1 ? "good" : "warning",
    coverSuggestion: imageCount >= 1 ? "stats.coverGood" : "stats.coverMissing",
    emojiCount,
    ctaCount,
    ctaSuggestions: ctaCount === 0 ? ["stats.addCta"] : [],
    keywordDensity,
    readingProgress,
    visualBalance,
  };
}

export function validateLinks(
  markdown: string,
): Array<{ line: number; url: string; text: string; issue: string }> {
  const issues: Array<{
    line: number;
    url: string;
    text: string;
    issue: string;
  }> = [];
  const lines = markdown.split("\n");

  lines.forEach((line, index) => {
    // Find markdown links
    const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(line)) !== null) {
      const text = match[1];
      const url = match[2];

      // Check for empty text
      if (!text.trim()) {
        issues.push({
          line: index + 1,
          url,
          text,
          issue: "Empty link text",
        });
      }

      // Check for empty URL
      if (!url.trim()) {
        issues.push({
          line: index + 1,
          url,
          text,
          issue: "Empty URL",
        });
      }

      // Check for spaces in URL
      if (url.includes(" ")) {
        issues.push({
          line: index + 1,
          url,
          text,
          issue: "URL contains spaces",
        });
      }

      // Check for relative links without proper format
      if (url.startsWith("/") && !url.startsWith("//")) {
        issues.push({
          line: index + 1,
          url,
          text,
          issue: "Relative link (may not work in all contexts)",
        });
      }
    }
  });

  return issues;
}

export function optimizeForSEO(
  markdown: string,
): Array<{ type: string; message: string; severity: "info" | "warning" }> {
  const suggestions: Array<{
    type: string;
    message: string;
    severity: "info" | "warning";
  }> = [];

  // Check for H1
  const h1Count = (markdown.match(/^#\s/gm) || []).length;
  if (h1Count === 0) {
    suggestions.push({
      type: "H1 Heading",
      message: "Add an H1 heading for better SEO",
      severity: "warning",
    });
  } else if (h1Count > 1) {
    suggestions.push({
      type: "H1 Heading",
      message: "Multiple H1 headings found. Use only one for better SEO",
      severity: "warning",
    });
  }

  // Check for alt text in images
  const imagesWithoutAlt = (markdown.match(/!\[\s*\]\([^\)]+\)/g) || []).length;
  if (imagesWithoutAlt > 0) {
    suggestions.push({
      type: "Image Alt Text",
      message: `${imagesWithoutAlt} image(s) missing alt text`,
      severity: "warning",
    });
  }

  // Check for heading hierarchy
  const headings = markdown.match(/^#{1,6}\s/gm) || [];
  let prevLevel = 0;
  headings.forEach((heading) => {
    const level = heading.trim().split(" ")[0].length;
    if (level - prevLevel > 1) {
      suggestions.push({
        type: "Heading Hierarchy",
        message: "Skipped heading level (e.g., H1 to H3)",
        severity: "info",
      });
    }
    prevLevel = level;
  });

  // Check for meta description (front matter)
  if (!markdown.includes("description:") && !markdown.includes("---")) {
    suggestions.push({
      type: "Meta Description",
      message: "Consider adding front matter with description for SEO",
      severity: "info",
    });
  }

  return suggestions;
}

// Grammar and style checking
export interface StyleIssue {
  line: number;
  text: string;
  issue: string;
  suggestion: string;
  severity: "error" | "warning" | "info";
}

export function checkGrammarAndStyle(markdown: string): StyleIssue[] {
  const issues: StyleIssue[] = [];
  const lines = markdown.split("\n");

  lines.forEach((line, index) => {
    // Skip code blocks and headings
    if (line.trim().startsWith("```") || line.trim().startsWith("#")) return;

    // Check for passive voice
    const passivePatterns = [
      /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi,
      /\b(is|are|was|were|be|been|being)\s+\w+en\b/gi,
    ];
    passivePatterns.forEach((pattern) => {
      const matches = line.match(pattern);
      if (matches) {
        issues.push({
          line: index + 1,
          text: matches[0],
          issue: "Passive voice detected",
          suggestion: "Consider using active voice for clarity",
          severity: "info",
        });
      }
    });

    // Check for redundant phrases
    const redundantPhrases = [
      { phrase: /\bin order to\b/gi, suggestion: 'Use "to" instead' },
      {
        phrase: /\bdue to the fact that\b/gi,
        suggestion: 'Use "because" instead',
      },
      {
        phrase: /\bat this point in time\b/gi,
        suggestion: 'Use "now" instead',
      },
      {
        phrase: /\bfor the purpose of\b/gi,
        suggestion: 'Use "to" or "for" instead',
      },
      { phrase: /\bin the event that\b/gi, suggestion: 'Use "if" instead' },
    ];
    redundantPhrases.forEach(({ phrase, suggestion }) => {
      const match = line.match(phrase);
      if (match) {
        issues.push({
          line: index + 1,
          text: match[0],
          issue: "Redundant phrase",
          suggestion,
          severity: "info",
        });
      }
    });

    // Check for weak words
    const weakWords = [
      "very",
      "really",
      "quite",
      "just",
      "actually",
      "basically",
    ];
    weakWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      if (regex.test(line)) {
        issues.push({
          line: index + 1,
          text: word,
          issue: "Weak word",
          suggestion: "Consider removing or using a stronger alternative",
          severity: "info",
        });
      }
    });

    // Check for repeated words
    const words = line.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i] === words[i + 1] && words[i].length > 3) {
        issues.push({
          line: index + 1,
          text: `${words[i]} ${words[i + 1]}`,
          issue: "Repeated word",
          suggestion: "Remove duplicate word",
          severity: "warning",
        });
      }
    }

    // Check for long sentences (>30 words)
    const sentenceWords = line.split(/\s+/).filter((w) => w.length > 0);
    if (sentenceWords.length > 30) {
      issues.push({
        line: index + 1,
        text: line.substring(0, 50) + "...",
        issue: "Long sentence",
        suggestion: "Consider breaking into shorter sentences",
        severity: "info",
      });
    }

    // Check for double spaces
    if (line.includes("  ")) {
      issues.push({
        line: index + 1,
        text: "Multiple spaces",
        issue: "Extra spaces found",
        suggestion: "Use single spaces",
        severity: "warning",
      });
    }
  });

  return issues;
}

// Document statistics
export interface DocumentStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTime: number; // minutes
  speakingTime: number; // minutes
  headings: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
  lists: number;
  codeBlocks: number;
  links: number;
  images: number;
  tables: number;
}

export function getDocumentStats(markdown: string): DocumentStats {
  const lines = markdown.split("\n");

  // Remove code blocks for accurate word count
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "");

  const characters = markdown.length;
  const charactersNoSpaces = markdown.replace(/\s/g, "").length;
  const words = withoutCode.split(/\s+/).filter((w) => w.length > 0).length;
  const sentences = withoutCode
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0).length;
  const paragraphs = markdown
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0).length;

  // Reading time: average 200 words per minute
  const readingTime = Math.ceil(words / 200);
  // Speaking time: average 150 words per minute
  const speakingTime = Math.ceil(words / 150);

  const headings = {
    h1: (markdown.match(/^#\s/gm) || []).length,
    h2: (markdown.match(/^##\s/gm) || []).length,
    h3: (markdown.match(/^###\s/gm) || []).length,
    h4: (markdown.match(/^####\s/gm) || []).length,
    h5: (markdown.match(/^#####\s/gm) || []).length,
    h6: (markdown.match(/^######\s/gm) || []).length,
  };

  const lists = lines.filter(
    (line) => /^\s*[-*+]\s/.test(line) || /^\s*\d+\.\s/.test(line),
  ).length;
  const codeBlocks = (markdown.match(/```/g) || []).length / 2;
  const links = (markdown.match(/\[([^\]]+)\]\(([^\)]+)\)/g) || []).length;
  const images = (markdown.match(/!\[([^\]]*)\]\(([^\)]+)\)/g) || []).length;
  const tables = lines.filter((line) => line.includes("|")).length;

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    readingTime,
    speakingTime,
    headings,
    lists,
    codeBlocks,
    links,
    images,
    tables,
  };
}
