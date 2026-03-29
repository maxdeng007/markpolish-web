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

function detectLanguage(text: string): "zh" | "en" {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const totalChars = text.replace(/\s/g, "").length;
  return totalChars > 0 && chineseChars / totalChars > 0.3 ? "zh" : "en";
}

function getHookSuggestion(
  firstPara: string,
  lang: "zh" | "en",
): {
  issue: string;
  fix: string;
  example: string;
} {
  const trimmed = firstPara.trim();
  const startsWithNumber = /^\d/.test(trimmed);
  const startsWithQuestion =
    trimmed.startsWith("？") ||
    trimmed.startsWith("?") ||
    trimmed.startsWith("什么") ||
    trimmed.startsWith("如何") ||
    trimmed.startsWith("为什么") ||
    trimmed.startsWith("why") ||
    trimmed.startsWith("how") ||
    trimmed.startsWith("what") ||
    trimmed.startsWith("Is") ||
    trimmed.startsWith("Are") ||
    trimmed.startsWith("Do");
  const startsWithQuote =
    trimmed.startsWith('"') ||
    trimmed.startsWith('"') ||
    trimmed.startsWith('"') ||
    trimmed.startsWith("'");
  const isGenericZh = /^(今天|昨天|明天|最近|现在|给大家|分享|介绍)/.test(
    trimmed,
  );
  const isGenericEn =
    /^(today|yesterday|tomorrow|recently|now|hi|hello|hey|i want to share|i'm going to share|let me share)/i.test(
      trimmed,
    );

  if (lang === "zh") {
    if (startsWithQuestion) {
      return {
        issue: "开头以问题开头，能激发好奇心",
        fix: "问题后立即跟上令人惊讶的答案或数据",
        example:
          "紧接着说：'分析了10000篇帖子后，数据揭示了一个意想不到的结论…'",
      };
    }
    if (startsWithNumber) {
      return {
        issue: "开头有数字，读者会期待具体数据",
        fix: "立即用具体数字或大胆声明来兑现承诺",
        example: "如果你说'3个技巧'，确保每个都有真实的指标或成果",
      };
    }
    if (startsWithQuote) {
      return {
        issue: "以引用开头是经典的钩子技巧",
        fix: "引用后立即添加你自己的解读，建立权威感",
        example: "引用之后加：'这句话让我在挣扎于…时突然醒悟'",
      };
    }
    if (isGenericZh) {
      return {
        issue: "开头太泛 — '给大家分享'无法吸引读者",
        fix: "用具体的结果或转变来替代泛泛的开头",
        example:
          "试试：'我从月薪5000到副业3万，只用了6个月' 而不是 '今天分享我的经验'",
      };
    }
    if (trimmed.length < 20) {
      return {
        issue: "开头太短，无法建立足够的上下文",
        fix: "扩展开头，创造紧迫感或好奇心",
        example: "加上：'这件事改变了100万人的工作方式，我的故事从那天开始…'",
      };
    }
    return {
      issue: "开头缺少明确的价值主张",
      fix: "把读者的收益或转变放在最前面",
      example: "试试：'掌握X后，我每天节省了3小时——这是我亲测有效的方法'",
    };
  }

  if (startsWithQuestion) {
    return {
      issue: "Opening starts with a question — good for curiosity",
      fix: "Follow the question immediately with a surprising answer or statistic",
      example:
        "Follow with: 'After analyzing 10,000 posts, the data reveals something unexpected...'",
    };
  }
  if (startsWithNumber) {
    return {
      issue: "Opening has a number — readers expect specific data",
      fix: "Deliver immediately with concrete numbers or a bold claim",
      example:
        "If you say '3 lessons', make sure each one has a real metric or outcome",
    };
  }
  if (startsWithQuote) {
    return {
      issue: "Opening with a quote is a classic hook",
      fix: "Add your own interpretation immediately after to establish authority",
      example:
        "After the quote, add: 'This hit me when I was struggling with...'",
    };
  }
  if (isGenericEn) {
    return {
      issue:
        "Opening feels generic — 'Hi everyone' or 'Let me share' doesn't hook readers",
      fix: "Replace generic opener with a specific outcome or transformation",
      example:
        "Try: 'I went from $5K/month to $30K/month side income in 6 months' instead of 'Today I want to share my experience'",
    };
  }
  if (trimmed.length < 30) {
    return {
      issue: "Opening is too short to establish context",
      fix: "Expand with a hook that creates urgency or curiosity",
      example:
        "Add: 'This changed how 1 million people work — my story starts the day I...'",
    };
  }
  return {
    issue: "Opening lacks a clear value proposition",
    fix: "Front-load the reader's benefit or transformation",
    example:
      "Try: 'After mastering X, I saved 3 hours every day — here's what actually worked'",
  };
}

function getStructureSuggestion(
  paragraphs: string[],
  lang: "zh" | "en",
): {
  issue: string;
  fix: string;
  example: string;
} {
  const avgParaLength =
    paragraphs.reduce((sum, p) => sum + p.length, 0) / (paragraphs.length || 1);
  const hasLists = paragraphs.some((p) => /^[-\*]\s/.test(p.trim()));
  const hasHeadings = paragraphs.some((p) => /^#{1,3}\s/.test(p.trim()));

  if (lang === "zh") {
    if (avgParaLength > 200) {
      return {
        issue: `平均段落长度${Math.round(avgParaLength)}字，太密了`,
        fix: "拆成2-3段，每段控制在100字以内",
        example: "在自然转折处拆分长段落——每段只讲一个观点",
      };
    }
    if (!hasLists) {
      return {
        issue: "没有找到列表，扫描困难",
        fix: "把关键点转成列表——读者吸收列表格式更快",
        example: "把'时间管理的关键是：优先级、专注、环境'变成项目符号列表",
      };
    }
    if (!hasHeadings) {
      return {
        issue: "没有副标题——读者无法预览结构",
        fix: "每200-300字加一个##副标题来辅助扫描",
        example: "在每个主要观点或话题转换前插入##",
      };
    }
    return {
      issue: "结构还行，但可以增加更多视觉间隔",
      fix: "在段落之间添加空白——空行是免费的视觉层次",
      example: "每组段落之间留一行空白",
    };
  }

  if (avgParaLength > 200) {
    return {
      issue: `Average paragraph is ${Math.round(avgParaLength)} characters — too dense for mobile`,
      fix: "Break each paragraph into 2-3 shorter ones, max 100 characters each",
      example:
        "Split long paragraphs at natural transitions — each should make one point",
    };
  }
  if (!hasLists) {
    return {
      issue: "No bullet or numbered lists found — hard to scan",
      fix: "Convert key points into lists — readers absorb list format faster",
      example:
        "Turn 'The keys to time management: priorities, focus, environment' into a bullet list",
    };
  }
  if (!hasHeadings) {
    return {
      issue: "No subheadings — readers can't preview structure",
      fix: "Add ## subheadings every 200-300 words to aid scanning",
      example: "Insert ## before each major point or topic shift",
    };
  }
  return {
    issue: "Structure is adequate but could use more visual breaks",
    fix: "Add whitespace between sections — blank lines are free visual hierarchy",
    example: "Leave a blank line between every paragraph group",
  };
}

function getEmotionSuggestion(
  text: string,
  lang: "zh" | "en",
): {
  issue: string;
  fix: string;
  example: string;
} {
  const zhEmotion =
    /惊讶|震惊|激动|兴奋|痛苦|后悔|害怕|担心|感动|温暖|幸福|失望|崩溃|尖叫|爆哭|笑|哭|感动|心碎|热血/.test(
      text,
    );
  const enEmotion =
    /surprised|shocked|excited|painful|regret|afraid|worried|touched|warm|happy|disappointed|crying|laughing|heartbreak|passionate/.test(
      text,
    );
  const personalZh = /我|我们|我的/.test(text);
  const personalEn = /\bI\b|\bwe\b|\bmy\b|\bme\b/i.test(text);
  const hasQuestion = /[？?]/.test(text);

  if (lang === "zh") {
    if (!personalZh) {
      return {
        issue: "内容缺乏个人视角——没有检测到'我'或'我们'",
        fix: "添加个人视角：'我尝试过'、'我们发现'",
        example: "插入：'坦白说我也怀疑过，但实测3周后…'",
      };
    }
    if (!hasQuestion && !zhEmotion) {
      return {
        issue: "内容偏理性，但情感上比较平",
        fix: "添加一个反问或情感时刻",
        example: "试试：'你有没有想过，为什么努力了却看不到结果？'",
      };
    }
    if (!zhEmotion) {
      return {
        issue: "缺乏情感共鸣——事实没有感情不容易传播",
        fix: "添加一个脆弱时刻或令人惊讶的结果",
        example: "插入：'说实话我当时真的想放弃，但后来…'",
      };
    }
    return {
      issue: "情感基调存在，但可以更生动",
      fix: "使用更具体的情感描述而不是泛泛的词",
      example: "不说'很棒'，试试'那一刻我真的激动到说不出话'",
    };
  }

  if (!personalEn) {
    return {
      issue: "Content is impersonal — no 'I' or 'we' voice detected",
      fix: "Add personal perspective: 'I tried this', 'We discovered'",
      example:
        "Insert: 'Honestly I was skeptical too, but after 3 weeks of testing...'",
    };
  }
  if (!hasQuestion && !enEmotion) {
    return {
      issue: "Content feels factual but emotionally flat",
      fix: "Add a rhetorical question or emotional moment",
      example:
        "Try: 'Have you ever wondered why effort doesn't always equal results?'",
    };
  }
  if (!enEmotion) {
    return {
      issue:
        "Lacks emotional resonance — facts without feelings don't go viral",
      fix: "Add a moment of vulnerability or a surprising outcome",
      example: "Insert: 'Honestly I wanted to give up, but then...'",
    };
  }
  return {
    issue: "Emotional tone is present but could be more vivid",
    fix: "Use more specific emotional descriptors instead of generic ones",
    example:
      "Instead of 'it was great' try 'I was so excited I couldn't sleep that night'",
  };
}

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

  const paragraphs = markdown.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const firstPara = paragraphs[0] || "";
  const lang = detectLanguage(markdown);

  const hookScore = clampScore(Math.floor(rand() * 100), 12, 25);
  const structureScore = clampScore(Math.floor(rand() * 100), 10, 25);
  const emotionScore = clampScore(Math.floor(rand() * 100), 8, 25);
  const clarityScore = clampScore(Math.floor(rand() * 100), 10, 25);
  const totalScore = hookScore + structureScore + emotionScore + clarityScore;

  const wechatScore = clampScore(Math.floor(rand() * 100));
  const xiaohongshuScore = clampScore(Math.floor(rand() * 100));
  const twitterScore = clampScore(Math.floor(rand() * 100));
  const linkedinScore = clampScore(Math.floor(rand() * 100));

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
      { element: "hook", ...getHookSuggestion(firstPara, lang) },
      { element: "structure", ...getStructureSuggestion(paragraphs, lang) },
      { element: "emotion", ...getEmotionSuggestion(markdown, lang) },
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
  const cleanExample = example
    .replace(/^Try:\s*/i, "")
    .replace(/^试试：\s*/, "")
    .replace(/^Insert:\s*/i, "")
    .replace(/^插入：\s*/, "");
  switch (element) {
    case "hook": {
      const firstParaEnd = markdown.indexOf("\n\n");
      if (firstParaEnd === -1) {
        return cleanExample + "\n\n" + markdown;
      }
      return cleanExample + "\n\n" + markdown.substring(firstParaEnd + 2);
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
          result.push(cleanExample);
          inserted = true;
        } else {
          result.push(line);
        }
      }
      if (!inserted) {
        const insertAt = Math.floor(lines.length * 0.4);
        lines.splice(insertAt, 0, "", cleanExample);
        return lines.join("\n");
      }
      return result.join("\n");
    }
    case "emotion": {
      const lastParaStart = markdown.lastIndexOf("\n\n");
      if (lastParaStart === -1) {
        return markdown + "\n\n" + cleanExample;
      }
      return (
        markdown.substring(0, lastParaStart) +
        "\n\n" +
        cleanExample +
        markdown.substring(lastParaStart + 2)
      );
    }
    default:
      return markdown;
  }
}
