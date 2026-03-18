// WeChat-optimized theme system

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: "light" | "dark";
  styles: {
    background: string;
    foreground: string;
    accent: string;
    border: string;
    heading: string;
    link: string;
    code: string;
    blockquote: string;
    blockquoteBg?: string;
  };
  css: string;
}

export const themes: Record<string, Theme> = {
  "wechat-classic": {
    id: "wechat-classic",
    name: "WeChat Classic",
    description: "Optimized for WeChat reading experience",
    category: "light",
    styles: {
      background: "#ffffff",
      foreground: "#333333",
      accent: "#576b95",
      border: "#e5e5e5",
      heading: "#1a1a1a",
      link: "#576b95",
      code: "#f7f7f7",
      blockquote: "#888888",
      blockquoteBg: "#f0f4f8",
    },
    css: `
      .preview-content {
        font-family: -apple-system-font, "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
        font-size: 16px;
        line-height: 1.8;
        color: #333333;
        background: #ffffff;
        max-width: 677px;
        margin: 0 auto;
        padding: 24px 16px;
      }
      .preview-content h1 { font-size: 32px; font-weight: 700; color: #1a1a1a; margin: 32px 0 20px; letter-spacing: -0.02em; }
      .preview-content h2 { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 28px 0 16px; padding-left: 12px; border-left: 4px solid #576b95; }
      .preview-content h3 { font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 24px 0 12px; }
      .preview-content h4 { font-size: 17px; font-weight: 600; color: #333333; margin: 20px 0 10px; }
      .preview-content p { margin: 14px 0; line-height: 1.85; }
      .preview-content a { color: #576b95; text-decoration: none; }
      .preview-content a:hover { text-decoration: underline; }
      .preview-content img { max-width: 100%; display: block; margin: 16px auto; border-radius: 4px; }
      .preview-content code { background: #f7f7f7; padding: 2px 6px; border-radius: 4px; font-family: "SF Mono", Menlo, Monaco, monospace; font-size: 0.9em; }
      .preview-content pre { background: #f7f7f7; padding: 16px; border-radius: 8px; overflow-x: auto; }
      .preview-content pre code { background: none; padding: 0; }
    `,
  },

  "apple-minimalist": {
    id: "apple-minimalist",
    name: "Apple Minimalist",
    description: "Clean, minimal design inspired by Apple",
    category: "light",
    styles: {
      background: "#ffffff",
      foreground: "#1d1d1f",
      accent: "#0071e3",
      border: "#d2d2d7",
      heading: "#1d1d1f",
      link: "#0071e3",
      code: "#f5f5f7",
      blockquote: "#86868b",
      blockquoteBg: "#f5f5f7",
    },
    css: `
      .preview-content {
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        color: #1d1d1f;
        background: #ffffff;
        max-width: 680px;
        margin: 0 auto;
        padding: 40px 20px;
      }
      .preview-content h1 { font-size: 48px; font-weight: 700; letter-spacing: -0.015em; margin: 0 0 20px; }
      .preview-content h2 { font-size: 32px; font-weight: 600; margin: 40px 0 16px; }
      .preview-content h3 { font-size: 24px; font-weight: 600; margin: 32px 0 12px; }
      .preview-content p { font-size: 17px; line-height: 1.7; margin: 16px 0; }
      .preview-content a { color: #0071e3; text-decoration: none; }
      .preview-content code { background: #f5f5f7; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
      .preview-content pre { background: #f5f5f7; padding: 16px; border-radius: 12px; overflow-x: auto; }
      .preview-content blockquote { border-left: 4px solid #d2d2d7; padding-left: 16px; margin: 16px 0; color: #86868b; font-style: italic; }
    `,
  },

  dracula: {
    id: "dracula",
    name: "Dracula",
    description: "Vibrant, colorful dark theme",
    category: "dark",
    styles: {
      background: "#282a36",
      foreground: "#f8f8f2",
      accent: "#bd93f9",
      border: "#44475a",
      heading: "#f8f8f2",
      link: "#8be9fd",
      code: "#44475a",
      blockquote: "#6272a4",
      blockquoteBg: "#1e1f29",
    },
    css: `
      .preview-content {
        font-family: 'Fira Code', 'JetBrains Mono', monospace;
        line-height: 1.7;
        color: #f8f8f2;
        background: #282a36;
        max-width: 700px;
        margin: 0 auto;
        padding: 40px 24px;
      }
      .preview-content h1 { font-size: 38px; font-weight: 700; color: #f8f8f2; margin: 0 0 20px; }
      .preview-content h2 { font-size: 28px; font-weight: 600; color: #bd93f9; margin: 32px 0 16px; }
      .preview-content h3 { font-size: 22px; font-weight: 600; color: #50fa7b; margin: 24px 0 12px; }
      .preview-content p { font-size: 16px; line-height: 1.8; margin: 16px 0; }
      .preview-content a { color: #8be9fd; text-decoration: none; }
      .preview-content code { background: #44475a; padding: 2px 6px; border-radius: 4px; color: #50fa7b; }
      .preview-content pre { background: #44475a; padding: 16px; border-radius: 8px; overflow-x: auto; }
      .preview-content blockquote { border-left: 4px solid #bd93f9; padding: 16px 20px; margin: 20px 0; color: #6272a4; font-style: italic; }
    `,
  },

  "nordic-frost": {
    id: "nordic-frost",
    name: "Nordic Frost",
    description: "Cool, clean Scandinavian design",
    category: "light",
    styles: {
      background: "#f8f9fa",
      foreground: "#2e3440",
      accent: "#5e81ac",
      border: "#d8dee9",
      heading: "#2e3440",
      link: "#5e81ac",
      code: "#eceff4",
      blockquote: "#4c566a",
      blockquoteBg: "#e5e9f0",
    },
    css: `
      .preview-content {
        font-family: 'Inter', -apple-system, sans-serif;
        line-height: 1.7;
        color: #2e3440;
        background: #f8f9fa;
        max-width: 700px;
        margin: 0 auto;
        padding: 48px 24px;
      }
      .preview-content h1 { font-size: 42px; font-weight: 700; color: #2e3440; margin: 0 0 24px; border-bottom: 3px solid #5e81ac; padding-bottom: 12px; }
      .preview-content h2 { font-size: 28px; font-weight: 600; color: #2e3440; margin: 36px 0 16px; }
      .preview-content h3 { font-size: 22px; font-weight: 600; color: #2e3440; margin: 28px 0 12px; }
      .preview-content p { font-size: 16px; line-height: 1.8; margin: 16px 0; }
      .preview-content a { color: #5e81ac; text-decoration: underline; text-decoration-color: rgba(94, 129, 172, 0.3); }
      .preview-content code { background: #eceff4; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
      .preview-content pre { background: #eceff4; padding: 16px; border-radius: 8px; overflow-x: auto; }
      .preview-content blockquote { border-left: 4px solid #5e81ac; padding-left: 16px; margin: 16px 0; color: #4c566a; font-style: italic; }
    `,
  },

  "tokyo-night": {
    id: "tokyo-night",
    name: "Tokyo Night",
    description: "Japanese cyberpunk aesthetic",
    category: "dark",
    styles: {
      background: "#1a1b26",
      foreground: "#c0caf5",
      accent: "#bb9af7",
      border: "#24283b",
      heading: "#c0caf5",
      link: "#7dcfff",
      code: "#24283b",
      blockquote: "#565f89",
      blockquoteBg: "#16161e",
    },
    css: `
      .preview-content {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        line-height: 1.7;
        color: #c0caf5;
        background: #1a1b26;
        max-width: 700px;
        margin: 0 auto;
        padding: 40px 24px;
      }
      .preview-content h1 { font-size: 36px; font-weight: 700; color: #c0caf5; margin: 0 0 20px; }
      .preview-content h2 { font-size: 28px; font-weight: 600; color: #bb9af7; margin: 32px 0 16px; }
      .preview-content h3 { font-size: 22px; font-weight: 600; color: #7aa2f7; margin: 24px 0 12px; }
      .preview-content p { font-size: 16px; line-height: 1.8; margin: 16px 0; }
      .preview-content a { color: #7dcfff; text-decoration: none; }
      .preview-content code { background: #24283b; padding: 2px 6px; border-radius: 4px; color: #9ece6a; }
      .preview-content pre { background: #24283b; padding: 16px; border-radius: 8px; overflow-x: auto; }
      .preview-content blockquote { border-left: 4px solid #bb9af7; padding: 16px 20px; margin: 20px 0; color: #565f89; font-style: italic; }
    `,
  },

  midnight: {
    id: "midnight",
    name: "Midnight",
    description: "Pure dark, minimal distraction",
    category: "dark",
    styles: {
      background: "#0d0d0d",
      foreground: "#e4e4e7",
      accent: "#60a5fa",
      border: "#27272a",
      heading: "#ffffff",
      link: "#60a5fa",
      code: "#1a1a1a",
      blockquote: "#a1a1aa",
      blockquoteBg: "#171717",
    },
    css: `
      .preview-content {
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 16px;
        line-height: 1.7;
        color: #e4e4e7;
        background: #0d0d0d;
        max-width: 700px;
        margin: 0 auto;
        padding: 40px 24px;
      }
      .preview-content h1 { font-size: 40px; font-weight: 700; color: #ffffff; margin: 0 0 20px; }
      .preview-content h2 { font-size: 30px; font-weight: 600; color: #ffffff; margin: 32px 0 16px; }
      .preview-content h3 { font-size: 22px; font-weight: 600; color: #ffffff; margin: 24px 0 12px; }
      .preview-content p { font-size: 16px; line-height: 1.8; margin: 16px 0; }
      .preview-content a { color: #60a5fa; text-decoration: none; }
      .preview-content code { background: #1a1a1a; padding: 2px 6px; border-radius: 4px; color: #fbbf24; }
      .preview-content pre { background: #1a1a1a; padding: 16px; border-radius: 8px; overflow-x: auto; }
      .preview-content blockquote { border-left: 4px solid #60a5fa; padding: 16px 20px; margin: 20px 0; color: #a1a1aa; font-style: italic; }
    `,
  },

  "warm-sunset": {
    id: "warm-sunset",
    name: "Warm Sunset",
    description: "Cozy, inviting autumn vibes",
    category: "light",
    styles: {
      background: "#fffbf5",
      foreground: "#4a3f35",
      accent: "#e07a38",
      border: "#e8ddd0",
      heading: "#3d322a",
      link: "#c45d1a",
      code: "#f5efe8",
      blockquote: "#7a6b5a",
      blockquoteBg: "#fff8f0",
    },
    css: `
      .preview-content {
        font-family: 'Nunito', -apple-system, sans-serif;
        line-height: 1.75;
        color: #4a3f35;
        background: #fffbf5;
        max-width: 680px;
        margin: 0 auto;
        padding: 40px 24px;
      }
      .preview-content h1 { font-size: 40px; font-weight: 700; color: #3d322a; margin: 0 0 24px; }
      .preview-content h2 { font-size: 28px; font-weight: 600; color: #3d322a; margin: 36px 0 16px; border-bottom: 2px solid #e07a38; padding-bottom: 8px; }
      .preview-content h3 { font-size: 22px; font-weight: 600; color: #3d322a; margin: 28px 0 12px; }
      .preview-content p { font-size: 16px; line-height: 1.8; margin: 16px 0; }
      .preview-content a { color: #c45d1a; text-decoration: underline; }
      .preview-content code { background: #f5efe8; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; color: #c45d1a; }
      .preview-content pre { background: #f5efe8; padding: 16px; border-radius: 8px; overflow-x: auto; }
      .preview-content blockquote { border-left: 4px solid #e07a38; padding: 16px 20px; margin: 20px 0; color: #7a6b5a; font-style: italic; background: #fff8f0; }
    `,
  },

  "elegant-serif": {
    id: "elegant-serif",
    name: "Elegant Serif",
    description: "Sophisticated, editorial design",
    category: "light",
    styles: {
      background: "#fefefe",
      foreground: "#4a4a4a",
      accent: "#c7a27c",
      border: "#e8e4df",
      heading: "#2d2d2d",
      link: "#8b6f47",
      code: "#f5f3f0",
      blockquote: "#7a7a7a",
      blockquoteBg: "#faf8f5",
    },
    css: `
      .preview-content {
        font-family: 'Playfair Display', 'Georgia', serif;
        line-height: 1.7;
        color: #4a4a4a;
        background: #fefefe;
        max-width: 680px;
        margin: 0 auto;
        padding: 40px 24px;
      }
      .preview-content h1 { font-size: 42px; font-weight: 700; color: #2d2d2d; margin: 0 0 20px; letter-spacing: -0.02em; }
      .preview-content h2 { font-size: 28px; font-weight: 600; color: #2d2d2d; margin: 36px 0 14px; border-bottom: 1px solid #c7a27c; padding-bottom: 8px; }
      .preview-content h3 { font-size: 20px; font-weight: 600; color: #2d2d2d; margin: 28px 0 12px; }
      .preview-content p { font-size: 17px; line-height: 1.8; margin: 16px 0; }
      .preview-content a { color: #8b6f47; text-decoration: none; border-bottom: 1px solid #c7a27c; }
      .preview-content code { background: #f5f3f0; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
      .preview-content pre { background: #f5f3f0; padding: 16px; border-radius: 4px; overflow-x: auto; }
      .preview-content blockquote { border-left: 4px solid #c7a27c; padding: 16px 20px; margin: 20px 0; color: #7a7a7a; font-style: italic; }
    `,
  },

  "fresh-garden": {
    id: "fresh-garden",
    name: "Fresh Garden",
    description: "Natural, organic feel",
    category: "light",
    styles: {
      background: "#f5f9f4",
      foreground: "#3d4a3a",
      accent: "#86c8bc",
      border: "#d4e5d0",
      heading: "#2d3a2a",
      link: "#5a9a7c",
      code: "#e8f2e6",
      blockquote: "#6b7a68",
      blockquoteBg: "#edf5eb",
    },
    css: `
      .preview-content {
        font-family: 'Source Sans Pro', -apple-system, sans-serif;
        line-height: 1.75;
        color: #3d4a3a;
        background: #f5f9f4;
        max-width: 680px;
        margin: 0 auto;
        padding: 40px 24px;
      }
      .preview-content h1 { font-size: 38px; font-weight: 700; color: #2d3a2a; margin: 0 0 24px; }
      .preview-content h2 { font-size: 26px; font-weight: 600; color: #2d3a2a; margin: 36px 0 16px; padding-left: 12px; border-left: 4px solid #86c8bc; }
      .preview-content h3 { font-size: 20px; font-weight: 600; color: #2d3a2a; margin: 28px 0 12px; }
      .preview-content p { font-size: 16px; line-height: 1.8; margin: 16px 0; }
      .preview-content a { color: #5a9a7c; text-decoration: none; border-bottom: 1px dashed #86c8bc; }
      .preview-content code { background: #e8f2e6; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; color: #5a9a7c; }
      .preview-content pre { background: #e8f2e6; padding: 16px; border-radius: 8px; overflow-x: auto; }
      .preview-content blockquote { border-left: 4px solid #86c8bc; padding: 16px 20px; margin: 20px 0; color: #6b7a68; font-style: italic; background: #edf5eb; }
    `,
  },

  "tokyo-dawn": {
    id: "tokyo-dawn",
    name: "Tokyo Dawn",
    description: "Vibrant, Japanese aesthetic",
    category: "light",
    styles: {
      background: "#ffffff",
      foreground: "#4a4a4a",
      accent: "#ffb7c5",
      border: "#f0e6e8",
      heading: "#2d2d2d",
      link: "#e8788a",
      code: "#fef6f7",
      blockquote: "#888888",
      blockquoteBg: "#fefafa",
    },
    css: `
      .preview-content {
        font-family: 'Noto Sans JP', 'Hiragino Sans', -apple-system, sans-serif;
        line-height: 1.8;
        color: #4a4a4a;
        background: #ffffff;
        max-width: 680px;
        margin: 0 auto;
        padding: 40px 24px;
      }
      .preview-content h1 { font-size: 38px; font-weight: 700; color: #2d2d2d; margin: 0 0 24px; }
      .preview-content h2 { font-size: 26px; font-weight: 600; color: #2d2d2d; margin: 36px 0 16px; border-bottom: 2px dotted #ffb7c5; padding-bottom: 8px; }
      .preview-content h3 { font-size: 20px; font-weight: 600; color: #2d2d2d; margin: 28px 0 12px; }
      .preview-content p { font-size: 16px; line-height: 1.9; margin: 16px 0; }
      .preview-content a { color: #e8788a; text-decoration: none; border-bottom: 1px solid #ffb7c5; }
      .preview-content code { background: #fef6f7; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; color: #e8788a; }
      .preview-content pre { background: #fef6f7; padding: 16px; border-radius: 8px; overflow-x: auto; }
      .preview-content blockquote { border-left: 4px solid #ffb7c5; padding: 16px 20px; margin: 20px 0; color: #888888; font-style: italic; background: #fefafa; }
    `,
  },

  newspaper: {
    id: "newspaper",
    name: "Newspaper",
    description: "Classic, authoritative print journalism",
    category: "light",
    styles: {
      background: "#faf9f6",
      foreground: "#1a1a1a",
      accent: "#c41e3a",
      border: "#d0d0d0",
      heading: "#000000",
      link: "#c41e3a",
      code: "#f0efec",
      blockquote: "#555555",
      blockquoteBg: "#f5f4f1",
    },
    css: `
      .preview-content {
        font-family: 'Merriweather', 'Georgia', serif;
        line-height: 1.7;
        color: #1a1a1a;
        background: #faf9f6;
        max-width: 700px;
        margin: 0 auto;
        padding: 40px 24px;
      }
      .preview-content h1 { font-size: 42px; font-weight: 900; color: #000000; margin: 0 0 8px; text-transform: uppercase; letter-spacing: -0.02em; }
      .preview-content h2 { font-size: 28px; font-weight: 700; color: #000000; margin: 36px 0 12px; border-top: 2px solid #000; padding-top: 12px; }
      .preview-content h3 { font-size: 16px; font-weight: 700; color: #000000; margin: 28px 0 10px; text-transform: uppercase; letter-spacing: 0.05em; }
      .preview-content p { font-size: 17px; line-height: 1.8; margin: 16px 0; text-align: justify; }
      .preview-content a { color: #c41e3a; text-decoration: underline; }
      .preview-content code { background: #f0efec; padding: 2px 6px; border-radius: 2px; font-size: 0.9em; font-family: 'Courier New', monospace; }
      .preview-content pre { background: #f0efec; padding: 16px; border-radius: 2px; overflow-x: auto; border-left: 4px solid #c41e3a; }
      .preview-content blockquote { border-left: 4px solid #c41e3a; padding: 16px 20px; margin: 20px 0; color: #555555; font-style: italic; background: #f5f4f1; }
    `,
  },

  "nord-dark": {
    id: "nord-dark",
    name: "Nord Dark",
    description: "Arctic, cool dark theme",
    category: "dark",
    styles: {
      background: "#2e3440",
      foreground: "#d8dee9",
      accent: "#88c0d0",
      border: "#3b4252",
      heading: "#eceff4",
      link: "#88c0d0",
      code: "#3b4252",
      blockquote: "#a8b4c4",
      blockquoteBg: "#262c36",
    },
    css: `
      .preview-content {
        font-family: 'Inter', -apple-system, sans-serif;
        line-height: 1.7;
        color: #d8dee9;
        background: #2e3440;
        max-width: 700px;
        margin: 0 auto;
        padding: 40px 24px;
      }
      .preview-content h1 { font-size: 36px; font-weight: 700; color: #eceff4; margin: 0 0 20px; }
      .preview-content h2 { font-size: 28px; font-weight: 600; color: #88c0d0; margin: 32px 0 16px; }
      .preview-content h3 { font-size: 22px; font-weight: 600; color: #d8dee9; margin: 24px 0 12px; }
      .preview-content p { font-size: 16px; line-height: 1.8; margin: 16px 0; }
      .preview-content a { color: #88c0d0; text-decoration: none; }
      .preview-content code { background: #3b4252; padding: 2px 6px; border-radius: 4px; color: #81a1c1; }
      .preview-content pre { background: #3b4252; padding: 16px; border-radius: 8px; overflow-x: auto; }
      .preview-content blockquote { border-left: 4px solid #88c0d0; padding: 16px 20px; margin: 20px 0; color: #a8b4c4; font-style: italic; }
    `,
  },

  "monokai-pro": {
    id: "monokai-pro",
    name: "Monokai Pro",
    description: "Code editor inspired",
    category: "dark",
    styles: {
      background: "#2d2a2e",
      foreground: "#fcfcfa",
      accent: "#ffd866",
      border: "#363337",
      heading: "#fcfcfa",
      link: "#ff6188",
      code: "#363337",
      blockquote: "#727072",
      blockquoteBg: "#272528",
    },
    css: `
      .preview-content {
        font-family: 'Fira Code', 'JetBrains Mono', monospace;
        line-height: 1.7;
        color: #fcfcfa;
        background: #2d2a2e;
        max-width: 700px;
        margin: 0 auto;
        padding: 40px 24px;
      }
      .preview-content h1 { font-size: 36px; font-weight: 700; color: #fcfcfa; margin: 0 0 20px; }
      .preview-content h2 { font-size: 28px; font-weight: 600; color: #ffd866; margin: 32px 0 16px; }
      .preview-content h3 { font-size: 22px; font-weight: 600; color: #ff6188; margin: 24px 0 12px; }
      .preview-content p { font-size: 16px; line-height: 1.8; margin: 16px 0; }
      .preview-content a { color: #ff6188; text-decoration: none; }
      .preview-content code { background: #363337; padding: 2px 6px; border-radius: 4px; color: #a9dc76; }
      .preview-content pre { background: #363337; padding: 16px; border-radius: 8px; overflow-x: auto; }
      .preview-content blockquote { border-left: 4px solid #ffd866; padding: 16px 20px; margin: 20px 0; color: #727072; font-style: italic; }
    `,
  },

  coffee: {
    id: "coffee",
    name: "Coffee",
    description: "Warm, cozy dark theme",
    category: "dark",
    styles: {
      background: "#2c2418",
      foreground: "#f5e6d3",
      accent: "#d4a574",
      border: "#3d3226",
      heading: "#f5e6d3",
      link: "#e8b86d",
      code: "#3d3226",
      blockquote: "#8b7355",
      blockquoteBg: "#241c12",
    },
    css: `
      .preview-content {
        font-family: 'Lora', 'Georgia', serif;
        line-height: 1.7;
        color: #f5e6d3;
        background: #2c2418;
        max-width: 700px;
        margin: 0 auto;
        padding: 40px 24px;
      }
      .preview-content h1 { font-size: 36px; font-weight: 700; color: #f5e6d3; margin: 0 0 20px; }
      .preview-content h2 { font-size: 28px; font-weight: 600; color: #d4a574; margin: 32px 0 16px; }
      .preview-content h3 { font-size: 22px; font-weight: 600; color: #e8b86d; margin: 24px 0 12px; }
      .preview-content p { font-size: 16px; line-height: 1.8; margin: 16px 0; }
      .preview-content a { color: #e8b86d; text-decoration: none; }
      .preview-content code { background: #3d3226; padding: 2px 6px; border-radius: 4px; color: #a8c97f; }
      .preview-content pre { background: #3d3226; padding: 16px; border-radius: 8px; overflow-x: auto; }
      .preview-content blockquote { border-left: 4px solid #d4a574; padding: 16px 20px; margin: 20px 0; color: #8b7355; font-style: italic; background: #352d20; }
    `,
  },
};

export function getTheme(id: string): Theme {
  return themes[id] || themes["wechat-classic"];
}

export function getThemeList(): Theme[] {
  return Object.values(themes);
}

export function getLightThemes(): Theme[] {
  return Object.values(themes).filter((t) => t.category === "light");
}

export function getDarkThemes(): Theme[] {
  return Object.values(themes).filter((t) => t.category === "dark");
}

// Get default theme based on dark/light mode
export function getDefaultTheme(isDark: boolean): Theme {
  if (isDark) {
    const darkThemes = getDarkThemes();
    return darkThemes[0] || themes["midnight"] || themes["wechat-classic"];
  }
  return themes["wechat-classic"];
}
