# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MarkPolish Studio is a Wecom-optimized markdown content creation tool built with React, TypeScript, and shadcn/ui. It provides AI-powered content enhancement, custom markdown components, professional themes, and export options optimized for WeChat/Wecom publishing.

## Common Commands

```bash
# Development
npm run dev              # Start Vite dev server at http://localhost:5173
npm run build            # Type-check and build for production
npm run preview          # Preview production build locally

# Testing
npm run test             # Run Vitest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report

# Linting & Formatting
npm run lint             # Run ESLint
npm run lint:fix         # Run ESLint with auto-fix
npm run format           # Format code with Prettier
npm run format:check    # Check formatting without fixing
npm run typecheck        # Type-check with TypeScript
```

## Architecture

### Three-Panel Layout
The main application (`src/App.tsx`) uses a three-panel layout:
- **Left Sidebar**: Tabbed panels for AI, Projects, Templates, Components, Themes, Images
- **Center Editor**: Markdown textarea with live editing
- **Right Preview**: Live preview with Full/WeCom mode toggle

### Core Modules (src/lib/)

| File | Purpose |
|------|---------|
| `themes.ts` | Theme definitions (14 themes: 8 light, 6 dark) with styles and CSS |
| `markdown-components.ts` | Custom component parsing and rendering (hero, col-2, steps, timeline, card, callout, quote, tabs, accordion, video) |
| `export.ts` | Export functionality for HTML, PDF, Markdown, and WeChat/Wecom |
| `ai-providers.ts` | AI API integrations (OpenAI, Claude, Gemini, DeepSeek, Ollama, OpenRouter) |
| `ai-image-generation.ts` | AI image generation via DashScope/ModelScope |
| `preview-styles.ts` | Dynamic CSS generation for preview and export |
| `file-operations.ts` | LocalStorage persistence and project management |
| `polish-engine.ts` | Content formatting and enhancement logic |

### Component Flow

1. User edits markdown in textarea (`App.tsx`)
2. `MarkdownPreview.tsx` receives markdown and theme
3. `markdown-components.ts` processes custom components (`:::hero`, `:::col-2`, etc.)
4. `react-markdown` renders standard markdown with remark-gfm plugins
5. Theme CSS from `themes.ts` is applied to preview

### Key Patterns

- **Theme System**: Themes are objects with `styles` (colors) and `css` (preview styles). The `getTheme()` function retrieves themes by ID.
- **Custom Components**: Parsed via regex in `markdown-components.ts`, converted to HTML during markdown processing.
- **AI Image**: Uses `[IMG: description]` syntax, generates images via external APIs, stores state by position index.
- **Export**: `exportForWeChat()` generates inline-styled HTML optimized for WeCom's limited CSS support.

## Testing

Tests are located in `src/test/` and use Vitest with @testing-library/react. Run specific test files with `npm run test -- <filename>`.
