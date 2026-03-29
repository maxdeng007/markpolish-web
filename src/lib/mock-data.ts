export function contentHash(text: string): number {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function clampScore(value: number, min = 30, max = 95): number {
  return Math.round(min + (value % (max - min + 1)));
}

const hookIssues = [
  {
    issue: "Opening is generic",
    fix: "Start with a surprising statistic or bold claim",
    example:
      "Instead of 'Tips for success', try '3 decisions that changed my career in 30 days'",
  },
  {
    issue: "Weak first sentence",
    fix: "Open with a provocative question or bold assertion",
    example: "Try 'What if everything you knew about productivity was wrong?'",
  },
  {
    issue: "No curiosity gap",
    fix: "Create an information gap that compels reading",
    example:
      "Start with 'The one thing top performers do that nobody talks about...'",
  },
];

const structureIssues = [
  {
    issue: "Paragraphs are too long",
    fix: "Break into 3-4 sentence chunks for mobile",
    example: "Each paragraph should be scannable within 5 seconds",
  },
  {
    issue: "Lacks visual hierarchy",
    fix: "Use subheadings every 200-300 words",
    example: "Add ## subheadings to break up long sections",
  },
  {
    issue: "Wall of text",
    fix: "Add line breaks, bullet points, or numbered lists",
    example: "Replace dense paragraphs with scannable lists",
  },
];

const emotionIssues = [
  {
    issue: "Lacks emotional trigger",
    fix: "Add a personal story or surprising fact",
    example: "Include a moment of vulnerability or a surprising outcome",
  },
  {
    issue: "Too analytical",
    fix: "Weave in personal experience or anecdotes",
    example: "Add 'When I first tried this, I was skeptical...' somewhere",
  },
  {
    issue: "No emotional arc",
    fix: "Take readers through a challenge → struggle → resolution",
    example: "Frame content as a story with highs and lows",
  },
];

function getHookReason(score: number, text: string): string {
  const hasNumbers = /\d/.test(text.substring(0, 100));
  if (score >= 20)
    return hasNumbers
      ? "Opens with specific data that creates curiosity"
      : "Strong opening that grabs attention";
  if (score >= 15)
    return hasNumbers
      ? "Contains numbers but could be more specific"
      : "Decent opening but could be more compelling";
  return "Opening lacks a clear hook to draw readers in";
}

function getStructureReason(score: number, text: string): string {
  const hasLists = /^[\s]*[-*]\s/m.test(text);
  if (score >= 18)
    return hasLists
      ? "Good use of lists and visual breaks"
      : "Well-structured with clear sections";
  if (score >= 14)
    return "Good paragraph length but could use more visual breaks";
  return "Long blocks of text need breaking up for mobile readers";
}

function getEmotionReason(score: number): string {
  if (score >= 18)
    return "Strong emotional language that resonates with readers";
  if (score >= 14)
    return "Contains some emotional language but could be stronger";
  return "Lacks emotional depth — readers won't feel connected";
}

function getClarityReason(score: number): string {
  if (score >= 18) return "Clear message with a strong call-to-action";
  if (score >= 14) return "Generally clear but could sharpen the key takeaway";
  return "Core message gets lost — needs a clearer focal point";
}

export function generateViralScores(markdown: string) {
  const h = contentHash(markdown);
  const rand = seededRandom(h);

  const hookScore = clampScore(Math.floor(rand() * 100), 12, 25);
  const structureScore = clampScore(Math.floor(rand() * 100), 10, 25);
  const emotionScore = clampScore(Math.floor(rand() * 100), 8, 25);
  const clarityScore = clampScore(Math.floor(rand() * 100), 10, 25);
  const totalScore = hookScore + structureScore + emotionScore + clarityScore;

  const wechatScore = clampScore(Math.floor(rand() * 100));
  const xiaohongshuScore = clampScore(Math.floor(rand() * 100));
  const twitterScore = clampScore(Math.floor(rand() * 100));
  const linkedinScore = clampScore(Math.floor(rand() * 100));

  const hookIdx = Math.floor(rand() * hookIssues.length);
  const structIdx = Math.floor(rand() * structureIssues.length);
  const emotionIdx = Math.floor(rand() * emotionIssues.length);

  return {
    totalScore,
    platformScores: {
      wechat: wechatScore,
      xiaohongshu: xiaohongshuScore,
      twitter: twitterScore,
      linkedin: linkedinScore,
    },
    breakdown: {
      hook: {
        score: hookScore,
        verdict: hookScore >= 18 ? "strong" : "moderate",
        reason: getHookReason(hookScore, markdown),
      },
      structure: {
        score: structureScore,
        verdict: structureScore >= 15 ? "good" : "needs work",
        reason: getStructureReason(structureScore, markdown),
      },
      emotion: {
        score: emotionScore,
        verdict: emotionScore >= 16 ? "moderate" : "weak",
        reason: getEmotionReason(emotionScore),
      },
      clarity: {
        score: clarityScore,
        verdict: clarityScore >= 18 ? "strong" : "adequate",
        reason: getClarityReason(clarityScore),
      },
    },
    suggestions: [
      { element: "hook", ...hookIssues[hookIdx] },
      { element: "structure", ...structureIssues[structIdx] },
      { element: "emotion", ...emotionIssues[emotionIdx] },
    ],
  };
}

export function generateAmplifyVariants(markdown: string) {
  const h = contentHash(markdown);
  const rand = seededRandom(h);
  const lines = markdown.split("\n").filter((l) => l.trim());
  const firstLine = lines[0] || "";
  const plainLines = lines.filter((l) => !l.startsWith("#"));
  const bodyPreview = plainLines.join("\n").substring(0, 600);
  const title = markdown.match(/^#\s+(.+)/m)?.[1] || "Insight";

  return {
    variants: [
      {
        platform: "wechat",
        platformName: "WeChat Article",
        content: `我发现了一个秘密，让我效率提升了${clampScore(Math.floor(rand() * 100), 2, 10)}倍...\n\n${bodyPreview}\n\n你觉得呢？评论区聊聊 👇`,
        length: "around 1000 chars",
        emojiCount: "2 emojis",
      },
      {
        platform: "xiaohongshu",
        platformName: "RED (Xiaohongshu)",
        content: `${firstLine.replace(/^#+\s*/, "")}✨\n\n太有用了！必须分享💪\n\n${plainLines.slice(0, 2).join("\n").substring(0, 200)}\n\n#干货分享 #自我成长 #职场干货`,
        length: "around 400 chars",
        emojiCount: "9 emojis",
      },
      {
        platform: "zhihu",
        platformName: "Zhihu",
        content: `# ${title}\n\n${bodyPreview}\n\n#深度思考 #个人成长`,
        length: "around 600 chars",
        emojiCount: "1 emoji",
      },
      {
        platform: "twitter",
        platformName: "Twitter/X",
        content: `${plainLines[0]?.substring(0, 180) || "Key insight"}\n\nThe compound effect is underrated.`,
        length: "under 280 chars",
        emojiCount: "1 emoji",
      },
      {
        platform: "linkedin",
        platformName: "LinkedIn",
        content: `${plainLines[0] || ""}\n\nHere's what I learned from this experience. What has worked best for you? 👇`,
        length: "under 300 chars",
        emojiCount: "0 emojis",
      },
    ],
  };
}

export function smartReplace(
  markdown: string,
  element: string,
  example: string,
): string {
  switch (element) {
    case "hook": {
      const firstParaEnd = markdown.indexOf("\n\n");
      if (firstParaEnd === -1) {
        return example + "\n\n" + markdown;
      }
      return example + "\n\n" + markdown.substring(firstParaEnd + 2);
    }
    case "structure": {
      const lines = markdown.split("\n");
      let inCodeBlock = false;
      let inserted = false;
      const result: string[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith("```")) inCodeBlock = !inCodeBlock;
        if (
          !inCodeBlock &&
          !inserted &&
          line.trim() &&
          !line.startsWith("#") &&
          line.trim().length > 80
        ) {
          result.push(line);
          result.push(example);
          inserted = true;
        } else {
          result.push(line);
        }
      }
      if (!inserted) {
        const insertAt = Math.floor(lines.length * 0.4);
        lines.splice(insertAt, 0, "", example);
        return lines.join("\n");
      }
      return result.join("\n");
    }
    case "emotion": {
      const lastParaStart = markdown.lastIndexOf("\n\n");
      if (lastParaStart === -1) {
        return markdown + "\n\n" + example;
      }
      return (
        markdown.substring(0, lastParaStart) +
        "\n\n" +
        example +
        markdown.substring(lastParaStart + 2)
      );
    }
    default:
      return markdown;
  }
}
