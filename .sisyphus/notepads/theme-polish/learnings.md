# Theme Polish - Learnings

## Completed: 14 Themes (8 Light + 6 Dark)

### Light Themes

1. wechat-classic - WeChat Classic (Navy blue)
2. apple-minimalist - Apple Minimalist (SF Blue)
3. nordic-frost - Nordic Frost (Cool blue)
4. elegant-serif - Elegant Serif (Gold)
5. warm-sunset - Warm Sunset (Orange)
6. fresh-garden - Fresh Garden (Mint green)
7. tokyo-dawn - Tokyo Dawn (Sakura pink)
8. newspaper - Newspaper (Classic red)

### Dark Themes

1. midnight - Midnight (Pure dark + blue)
2. dracula - Dracula (Purple + green + pink)
3. tokyo-night - Tokyo Night (Purple + cyan)
4. nord-dark - Nord Dark (Arctic blue)
5. monokai-pro - Monokai Pro (Yellow + pink)
6. coffee - Coffee (Warm brown)

## Hero Component Theme Integration

- Hero uses inline CSS variables set on preview-container
- --hero-bg: linear-gradient(accent color, darker version)
- --hero-text: white
- Function adjustColor() darkens accent by 30% for gradient

## Key Files

- src/lib/themes.ts - Theme definitions
- src/components/ThemesPanel.tsx - Light/Dark tabs UI
- src/components/MarkdownPreview.tsx - Hero gradient integration
