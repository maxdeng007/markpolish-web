# AGENTS.md - MarkPolish Studio Codebase Guide

This document provides essential context for agentic coding agents operating in this repository.

## Project Overview

MarkPolish Studio is a WeChat-optimized content creation and editing tool built with React, TypeScript, and shadcn/ui. It features AI-powered content enhancement, custom markdown components, professional themes, and export capabilities.

## Build/Lint/Test Commands

```bash
# Development server (http://localhost:5173)
npm run dev

# Production build (TypeScript check + Vite build)
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck
# or: npx tsc --noEmit

# Run tests
npm run test              # Run all tests once
npm run test:watch        # Watch mode for development
npm run test:coverage     # Run with coverage report

# Run a single test file
npx vitest run src/test/ai-providers.test.ts
npx vitest run --testNamePattern "describe-block-name"

# Lint
npm run lint              # Check linting
npm run lint:fix          # Auto-fix linting issues

# Format
npm run format            # Format code with Prettier
npm run format:check       # Check formatting without modifying
```

## Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   │   ├── button.tsx, textarea.tsx, tabs.tsx, etc.
│   │   └── switch.tsx, select.tsx, card.tsx, input.tsx
│   ├── MarkdownPreview.tsx    # Preview renderer with custom components
│   ├── AIPanel.tsx            # AI assistant panel
│   ├── ThemesPanel.tsx        # Theme selector
│   └── ...
├── lib/
│   ├── utils.ts               # cn() utility
│   ├── export.ts              # HTML/PDF/Markdown export
│   ├── ai-providers.ts        # AI API integrations
│   ├── themes.ts              # Theme definitions
│   └── ...
├── test/                      # Vitest test files
├── App.tsx                    # Main application
└── main.tsx                   # Entry point
```

## Code Style Guidelines

### Imports (ordered groups)

```typescript
// 1. React
import { useState, useEffect } from "react";

// 2. Third-party (lucide-react, etc.)
import { Moon, Sun } from "lucide-react";

// 3. UI components (@/ alias)
import { Button } from "@/components/ui/button";
import { Tabs, TabsList } from "@/components/ui/tabs";

// 4. Custom components
import MarkdownPreview from "@/components/MarkdownPreview";

// 5. Library functions
import { exportToHTML } from "@/lib/export";
import { cn } from "@/lib/utils";
```

**Always use `@/` path alias** for imports from `./src/`.

### TypeScript

- **Strict mode**: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- **Define interfaces** for props, state, and data structures
- **Avoid `any`**: Use proper types or `unknown` with type guards

```typescript
interface MarkdownPreviewProps {
  markdown: string;
  theme?: string;
}

export interface Project {
  id: string;
  name: string;
  content: string;
}
```

### React Components

- **Functional components only** with hooks
- **Default exports** for page components, **named exports** for utilities
- **Use `React.forwardRef`** for UI components needing ref forwarding

```typescript
// Standard component
export default function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  // ...
}

// UI component with forwardRef
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return <button className={cn(baseStyles, className)} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
export { Button };
```

### Styling

- **Tailwind CSS** with shadcn/ui design system
- **Use `cn()` utility** to merge classes conditionally
- **CSS variables** for theming (in `index.css`)
- **Dark mode** via `.dark` class on `document.documentElement`

```typescript
className={cn(
  "base-class",
  condition && "conditional-class",
  className
)}
```

### Naming Conventions

- **Components**: PascalCase (`MarkdownPreview`, `AIPanel`)
- **Functions**: camelCase (`exportToHTML`, `handleFileUpload`)
- **Files**: PascalCase for components, kebab-case for utilities
- **Interfaces**: PascalCase (`ButtonProps`, `AIProvider`)

### Error Handling

```typescript
// Async operations
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Request failed');
  return await response.json();
} catch (error) {
  console.error('Failed to fetch:', error);
  return null;
}

// User-facing errors: alert() or UI feedback
catch (error) {
  console.error('PDF export failed:', error);
  alert('PDF export failed. Please try HTML export instead.');
}
```

### State Management

- **React hooks**: `useState`, `useEffect`, `useRef`
- **Props drilling** for parent-child communication
- **LocalStorage** via `fileOps` class for persistence
- **No global state library** (no Redux, Zustand, etc.)

### Async Patterns

```typescript
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

Processed in `markdown-components.ts`: `:::hero`, `:::col-2`, `:::steps`, `:::timeline`, `:::card`, etc.

### AI Provider System

Unified interface in `ai-providers.ts`: OpenAI, Anthropic, Gemini, Ollama. New providers follow the same pattern.

### Theme System

CSS-based themes in `themes.ts`. Each theme provides a `css` string injected into preview.

### Export System

Three formats in `export.ts`: HTML (multiple styles), PDF (html2canvas + jsPDF), Markdown.

## Common Tasks

### Adding a new UI component

1. Create in `src/components/ui/`
2. Use `React.forwardRef` pattern
3. Use `cn()` for class merging

### Adding a new panel

1. Create component in `src/components/`
2. Add tab trigger in `App.tsx` sidebar
3. Add `TabsContent` wrapper

### Adding a new AI action

1. Define in `aiActions` object in `ai-providers.ts`
2. Include `id`, `name`, `description`, `icon`, `prompt` function
