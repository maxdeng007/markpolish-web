# MarkPolish Studio (React Edition)

A powerful **WeChat-optimized** content creation and editing tool built with React, TypeScript, and shadcn/ui. Create beautifully formatted markdown content with custom components, AI assistance, and professional themes.

> 🎯 **Inspired by**: [MarkPolish Studio (Streamlit)](https://github.com/maxdeng007/markpolish-studio)

## ✨ Core Features

### 🤖 AI-Powered Content Enhancement
- **Generate Titles**: Create catchy, engaging titles
- **Expand Content**: Add detail, examples, and context
- **Smart Format**: Improve structure and readability
- **Suggest Components**: Get AI recommendations for layout
- **Polish with Context**: Refine content with custom context

**Supported AI Providers**:
- OpenAI (GPT-4o, GPT-4o-mini, GPT-3.5-turbo)
- OpenRouter (Multiple models)
- Anthropic (Claude)
- Google Gemini
- DeepSeek
- Ollama (Local, privacy-first)

### 🎨 Custom Markdown Components
WeChat-optimized components for engaging content:

- `:::hero` - Eye-catching hero sections
- `:::col-2` / `:::col-3` - Multi-column layouts
- `:::steps` - Step-by-step instructions
- `:::timeline` - Timeline visualization
- `:::card` - Styled card components
- `:::video` - Video embeds
- `:::callout` - Info/warning/error/success boxes
- `:::quote` - Quotes with attribution
- `:::tabs` - Tabbed content sections
- `:::accordion` - Collapsible sections
- `[IMG: description]` - AI-generated images
- `[LOCAL: filename]` - Local images

### 🎭 Professional Themes
Choose from 14 distinctive themes organized by category:

**Light Themes (8):**
- **WeChat Classic** - Optimized for WeChat reading
- **Apple Minimalist** - Clean, minimal design
- **Nordic Frost** - Cool Scandinavian style
- **Elegant Serif** - Classic typography
- **Warm Sunset** - Cozy, inviting autumn vibes
- **Fresh Garden** - Natural, organic feel
- **Tokyo Dawn** - Vibrant, Japanese aesthetic
- **Newspaper** - Classic, authoritative journalism

**Dark Themes (6):**
- **Midnight** - Pure dark, minimal distraction
- **Dracula** - Vibrant, colorful dark theme
- **Tokyo Night** - Japanese cyberpunk aesthetic
- **Nord Dark** - Arctic, cool dark theme
- **Monokai Pro** - Code editor inspired
- **Coffee** - Warm, cozy dark theme
### 📚 Template Library
Quick-start templates for common content types:

- Blog Post
- WeChat Article (公众号)
- Product Launch
- Tutorial Guide
- Company Timeline
- Event Announcement
- Newsletter
- Case Study

### 🖼️ Advanced Image System
Multiple image sources (coming soon):

- AI Image Generation (DashScope, ModelScope)
- Stock Photos (Picsum)
- Gradients (8 beautiful styles)
- Patterns (SVG-based)
- Aspect ratio control (1:1, 16:9, 9:16)

### 📤 Export Options
- **HTML Export**: WeChat-ready HTML
- **Markdown Download**: Save your work
- **Copy to Clipboard**: Quick sharing

### Export Options
- **Multiple HTML Styles**:
  - GitHub Style (clean, professional)
  - Minimal Style (elegant simplicity)
  - Elegant Style (sophisticated typography)
- **PDF Export**: High-quality PDF generation
- **Markdown Download**: Save your work as .md files

### User Experience
- **Dark Mode**: Easy on the eyes with full dark theme support
- **File Operations**: Upload and manage markdown files
- **Copy to Clipboard**: Quick copy functionality
- **Three-Panel Layout**: Editor, Preview, and Tools sidebar
- **Responsive Design**: Works beautifully on all screen sizes


## Tech Stack

- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **Radix UI** - Headless UI primitives
- **react-markdown** - Markdown rendering engine
- **remark-gfm** - GitHub Flavored Markdown
- **rehype-highlight** - Code syntax highlighting
- **Lucide React** - Beautiful icon set
- **html2canvas + jsPDF** - PDF generation

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Usage Guide

### Basic Editing
1. Type or paste markdown in the left editor pane
2. See live preview in the center pane
3. Use toolbar buttons for quick formatting

### Formatting Tools
- Click **Format & Polish** to auto-format your entire document
- Enable **Auto-format on paste** to clean up pasted content
- Use **Generate TOC** to create a table of contents

### Statistics
- View real-time document statistics in the Stats tab
- Track word count, reading time, and content metrics
- Monitor document structure (headings, links, images)

### Linting
- Check the Lint tab for formatting issues
- See errors and warnings with line numbers
- Fix issues to maintain clean markdown

### Exporting
1. Choose your export style (GitHub, Minimal, or Elegant)
2. Click **Export as HTML** or **Export as PDF**
3. Your document will download automatically

## Keyboard Shortcuts

The toolbar provides quick formatting:
- **Bold**: `**text**`
- **Italic**: `*text*`
- **Headings**: `# H1`, `## H2`, `### H3`
- **Lists**: `- item` or `1. item`
- **Links**: `[text](url)`
- **Images**: `![alt](url)`
- **Code**: ` ```code``` `
- **Quotes**: `> quote`

## Project Structure

\`\`\`
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── textarea.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   └── switch.tsx
│   ├── MarkdownPreview.tsx    # Preview renderer
│   ├── Toolbar.tsx            # Formatting toolbar
│   ├── StatsPanel.tsx         # Statistics display
│   ├── SettingsPanel.tsx      # Tools and settings
│   └── LintPanel.tsx          # Linting display
├── lib/
│   ├── utils.ts               # Utility functions
│   ├── export.ts              # Export functionality
│   └── markdown-utils.ts      # Markdown processing
├── App.tsx                    # Main application
├── main.tsx                   # Entry point
└── index.css                  # Global styles
\`\`\`

## Advanced Features

### Markdown Formatting
The formatter automatically:
- Fixes heading spacing
- Standardizes list formatting
- Ensures proper blank lines
- Removes trailing whitespace
- Cleans up code block formatting

### Table of Contents Generation
- Automatically extracts headings
- Creates clickable anchor links
- Supports H1, H2, and H3 levels
- Configurable heading inclusion

### Export Styles

**GitHub Style**: Clean, professional look matching GitHub's markdown rendering

**Minimal Style**: Simple, elegant typography with serif fonts

**Elegant Style**: Sophisticated design with custom colors and spacing

## Customization

### Adding Toolbar Buttons
Edit `src/components/Toolbar.tsx` to add more formatting options.

### Modifying Export Styles
Update `src/lib/export.ts` to customize HTML export templates.

### Changing Theme Colors
Modify `src/index.css` CSS variables for custom theming.

### Adding Lint Rules
Extend `src/lib/markdown-utils.ts` lintMarkdown function.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Acknowledgments

Inspired by professional markdown editors and the need for a modern, web-based markdown formatting tool.
