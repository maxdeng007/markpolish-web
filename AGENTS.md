# AGENTS.md - MarkPolish Studio Codebase Guide

This document provides essential context for agentic coding agents operating in this repository.

## Project Overview

MarkPolish Studio is a WeChat-optimized content creation and editing tool built with React, TypeScript, and shadcn/ui. It features AI-powered content enhancement, custom markdown components, professional themes, and export capabilities.

## Build/Lint/Test Commands

```bash
# Development server (http://localhost:5173)
npm run dev

# Production build (runs TypeScript check + Vite build)
npm run build

# Preview production build
npm run preview

# Type checking (implicit via build)
npx tsc --noEmit
```

**Note**: This project has no dedicated test framework or lint commands. TypeScript strict mode provides type safety. Prettier is available for formatting.

## Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── textarea.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   └── switch.tsx
│   ├── MarkdownPreview.tsx    # Preview renderer with custom components
│   ├── AIPanel.tsx            # AI assistant panel
│   ├── TemplatesPanel.tsx     # Template library
│   ├── ComponentsPanel.tsx    # Custom component inserter
│   ├── ThemesPanel.tsx        # Theme selector
│   ├── ProjectManager.tsx     # File/project management
│   └── ...
├── lib/
│   ├── utils.ts               # cn() utility and helpers
│   ├── export.ts              # HTML/PDF/Markdown export
│   ├── ai-providers.ts        # AI API integrations
│   ├── file-operations.ts     # LocalStorage persistence
│   ├── markdown-components.ts # Custom component processing
│   ├── themes.ts              # Theme definitions
│   └── templates.ts           # Template library
├── App.tsx                    # Main application component
├── main.tsx                   # Entry point
└── index.css                  # Tailwind + CSS variables
```

## Code Style Guidelines

### Imports

```typescript
// React imports first
import { useState, useEffect, useRef } from "react";

// Third-party libraries (lucide-react, etc.)
import { Moon, Sun, Download } from "lucide-react";

// UI components (@/ alias)
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom components
import MarkdownPreview from "@/components/MarkdownPreview";

// Library functions
import { exportToMarkdown, exportToHTML } from "@/lib/export";
import { cn } from "@/lib/utils";
```

**Path alias**: Always use `@/` for imports from `./src/`:

```typescript
// Good
import { Button } from "@/components/ui/button";

// Bad
import { Button } from "../components/ui/button";
```

### TypeScript

- **Strict mode enabled**: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- **Define interfaces** for all props, state, and data structures
- **Export interfaces** alongside implementations when used elsewhere
- **Avoid `any`**: Use proper types or `unknown` with type guards

```typescript
// Component props interface
interface MarkdownPreviewProps {
  markdown: string;
  theme?: string;
}

// Data structure interface
export interface Project {
  id: string;
  name: string;
  content: string;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### React Components

- **Functional components only** with hooks
- **Default exports** for page-level components, named exports for utilities
- **Use `React.forwardRef`** for UI components that need ref forwarding

```typescript
// Standard component
export default function MarkdownPreview({ markdown, theme }: MarkdownPreviewProps) {
  // ...
}

// UI component with forwardRef
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(/* base styles */, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
export { Button }
```

### Styling

- **Tailwind CSS** with shadcn/ui design system
- **Use `cn()` utility** to merge classes conditionally

```typescript
import { cn } from '@/lib/utils'

// Class merging pattern
className={cn(
  "base-class another-class",
  condition && "conditional-class",
  className
)}
```

- **CSS variables** for theming (defined in `index.css`)
- **Dark mode** via `.dark` class on `document.documentElement`

### Error Handling

```typescript
// Use try/catch with console.error for async operations
try {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Request failed')
  }
  const data = await response.json()
  return data
} catch (error) {
  console.error('Failed to fetch:', error)
  return null // or throw, or return default value
}

// User-facing errors should use alert() or UI feedback
catch (error) {
  console.error('PDF export failed:', error)
  alert('PDF export failed. Please try HTML export instead.')
}
```

### Naming Conventions

- **Components**: PascalCase (`MarkdownPreview`, `AIPanel`)
- **Functions**: camelCase (`exportToHTML`, `handleFileUpload`)
- **Constants**: camelCase for values, SCREAMING_SNAKE_CASE for true constants
- **Files**: PascalCase for components, kebab-case for utilities
- **Interfaces**: PascalCase with descriptive names (`ButtonProps`, `AIProvider`)

### State Management

- **React hooks** for local state (`useState`, `useEffect`, `useRef`)
- **Props drilling** for simple parent-child communication
- **LocalStorage** for persistence via `fileOps` class
- **No global state library** (Redux, Zustand, etc.)

### Async Patterns

```typescript
// Async function calls in useEffect
useEffect(() => {
  async function fetchData() {
    try {
      const result = await someAsyncOperation();
      setState(result);
    } catch (error) {
      console.error("Failed:", error);
    }
  }
  fetchData();
}, [dependencies]);

// Dynamic imports for code splitting
const html2canvas = (await import("html2canvas")).default;
```

## Key Architectural Patterns

### Custom Markdown Components

The app supports custom markdown blocks like `:::hero`, `:::col-2`, `:::steps`, etc. These are processed in `markdown-components.ts` before rendering.

### AI Provider System

Multiple AI providers (OpenAI, Anthropic, Gemini, Ollama) are supported via a unified interface in `ai-providers.ts`. New providers should follow the same pattern.

### Theme System

Themes are CSS-based and defined in `themes.ts`. Each theme provides a `css` string that gets injected into the preview.

### Export System

Three export formats: HTML (multiple styles), PDF (via html2canvas + jsPDF), and Markdown. All exports go through `export.ts`.

## Dependencies of Note

- `react-markdown` + `remark-gfm` + `rehype-*` for markdown processing
- `lucide-react` for icons
- `class-variance-authority` + `clsx` + `tailwind-merge` for styling
- `@radix-ui/*` for accessible UI primitives
- `html2canvas` + `jspdf` for PDF generation

## Common Tasks

### Adding a new UI component

1. Create in `src/components/ui/`
2. Use `React.forwardRef` pattern
3. Export from component file
4. Use `cn()` for class merging

### Adding a new panel

1. Create component in `src/components/`
2. Add tab trigger in `App.tsx` sidebar
3. Add `TabsContent` wrapper

### Adding a new AI action

1. Define in `aiActions` object in `ai-providers.ts`
2. Include `id`, `name`, `description`, `icon`, `prompt` function

### Modifying export formats

1. Add style definition in `exportToHTML()` function
2. Update UI to expose new option
