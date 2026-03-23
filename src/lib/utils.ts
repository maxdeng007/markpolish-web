import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FormattingWrapper {
  prefix: string;
  suffix: string;
  innerText: string;
}

export function extractTextWithFormatting(text: string): {
  plainText: string;
  wrappers: FormattingWrapper[];
} {
  const wrappers: FormattingWrapper[] = [];
  let plainText = text;

  const patterns: Array<{
    regex: RegExp;
    wrapper: (match: RegExpExecArray) => FormattingWrapper;
  }> = [
    {
      regex:
        /^:::(hero|callout|quote|card|col-\d|steps|timeline|tabs|accordion)(?:\s*\n([\s\S]*?)\n:::|\s+([\s\S]*?)\s*:::)$/gm,
      wrapper: (m) => ({
        prefix: `:::${m[1]}\n`,
        suffix: "\n:::",
        innerText: m[2] || m[3] || "",
      }),
    },
    {
      regex: /^(\s*)>\s+(.+)$/gm,
      wrapper: (m) => ({
        prefix: m[1] ? `${m[1]}> ` : "> ",
        suffix: "",
        innerText: m[2],
      }),
    },
    {
      regex: /^##\s+(.+)$/gm,
      wrapper: (m) => ({ prefix: "## ", suffix: "", innerText: m[1] }),
    },
    {
      regex: /^#\s+(.+)$/gm,
      wrapper: (m) => ({ prefix: "# ", suffix: "", innerText: m[1] }),
    },
    {
      regex: /^###\s+(.+)$/gm,
      wrapper: (m) => ({ prefix: "### ", suffix: "", innerText: m[1] }),
    },
  ];

  for (const pattern of patterns) {
    let match;
    const matches: Array<{
      match: RegExpExecArray;
      wrapper: FormattingWrapper;
      fullMatch: string;
    }> = [];

    pattern.regex.lastIndex = 0;
    while ((match = pattern.regex.exec(text)) !== null) {
      matches.push({
        match,
        wrapper: pattern.wrapper(match),
        fullMatch: match[0],
      });
    }

    for (let i = matches.length - 1; i >= 0; i--) {
      const { wrapper, fullMatch } = matches[i];

      wrappers.unshift(wrapper);

      const mIndex = plainText.indexOf(fullMatch);
      if (mIndex >= 0) {
        const before = plainText.substring(0, mIndex);
        const after = plainText.substring(mIndex + fullMatch.length);
        plainText = before + wrapper.innerText + after;
      }
    }
  }

  return { plainText, wrappers };
}

export function restoreFormatting(
  wrappers: FormattingWrapper[],
  processedText: string,
): string {
  let result = processedText;

  for (const wrapper of wrappers) {
    result = wrapper.prefix + result + wrapper.suffix;
  }

  return result;
}

export function preserveMarkdownFormatting(
  original: string,
  result: string,
): string {
  const { wrappers } = extractTextWithFormatting(original);
  if (wrappers.length === 0) {
    return result;
  }
  return restoreFormatting(wrappers, result);
}
