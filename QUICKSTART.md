# MarkPolish Studio - Quick Start Guide

## 🚀 Getting Started

### Installation
```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to start using MarkPolish Studio.

## 📚 Core Features

### 1. Editor & Preview
- **Left Panel**: Sidebar with 6 tabs (AI, Projects, Templates, Components, Themes, Images)
- **Center Panel**: Markdown editor with syntax highlighting
- **Right Panel**: Live preview with theme styling

### 2. Six Powerful Tabs

#### 🤖 AI Tab
- Connect to AI providers (OpenAI, Anthropic, Gemini, DeepSeek, Ollama, OpenRouter)
- Generate titles, expand content, summarize, improve writing
- Add emojis, translate, generate outlines, SEO optimize
- Configure API keys and select models

#### 📁 Projects Tab
- Save and load projects
- Auto-save every 30 seconds
- Version history (last 20 versions)
- Export/import projects as JSON
- Delete old projects

#### 📄 Templates Tab
- 8 pre-built templates:
  - Product Launch
  - Tutorial Guide
  - Company News
  - Event Invitation
  - Interview Article
  - Case Study
  - Weekly Newsletter
  - How-to Guide
- One-click template loading

#### 🎨 Components Tab
- Insert custom markdown components:
  - **Hero**: Eye-catching headers
  - **Columns**: 2 or 3 column layouts
  - **Timeline**: Event sequences
  - **Steps**: Step-by-step guides
  - **Cards**: Highlighted content boxes
  - **Videos**: Video embeds
- Live preview of each component

#### 🎭 Themes Tab
- 5 WeChat-optimized themes:
  - WeChat Classic (default)
  - Tech Blue
  - Elegant Purple
  - Fresh Green
  - Warm Orange
- Live theme switching
- Theme persistence

#### 🖼️ Images Tab
- Upload multiple images
- Search and filter images
- Insert images into editor
- Copy image URLs
- Delete images
- View image details

### 3. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save project |
| `Ctrl+B` | Bold text |
| `Ctrl+I` | Italic text |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+F` | Find in document |
| `Ctrl+N` | New project |
| `Ctrl+Shift+P` | Toggle preview |
| `Ctrl+Shift+D` | Toggle dark mode |

Click the keyboard icon in the header to view all shortcuts.

### 4. Export Options

#### Markdown Export
- Download as `.md` file
- Preserves all formatting

#### HTML Export
- 3 styles: GitHub, Minimal, Elegant
- Download as `.html` file
- Ready for web publishing

#### WeChat Export
- Optimized for WeChat公众号
- Copies HTML to clipboard
- Paste directly into WeChat editor
- Official account styling

## 🎯 Quick Workflows

### Create a Product Launch Article
1. Click **Templates** tab
2. Select "Product Launch"
3. Edit the content in the editor
4. Click **Themes** tab and choose "Tech Blue"
5. Click **AI** tab and use "Improve Writing"
6. Click **WeChat** button to export

### Build a Tutorial with Images
1. Click **Templates** tab and select "Tutorial Guide"
2. Click **Images** tab and upload screenshots
3. Insert images at appropriate positions
4. Click **Components** tab and add "Steps" component
5. Apply "WeChat Classic" theme
6. Export as HTML or WeChat format

### Create Custom Content from Scratch
1. Start typing in the editor
2. Use `Ctrl+B` and `Ctrl+I` for formatting
3. Click **Components** tab to add hero, columns, or cards
4. Click **AI** tab to generate title or expand content
5. Click **Themes** tab to apply styling
6. Save with `Ctrl+S`

## 💡 Pro Tips

### AI Integration
- Set up API keys in the AI tab first
- Use "Generate Title" after writing content
- Use "Expand Content" to add more details
- Use "Add Emojis" for WeChat-friendly content

### Image Management
- Upload all images at once
- Use descriptive filenames for easy searching
- Images are stored locally (no internet required)
- Click "Insert" to add image at cursor position

### Project Management
- Auto-save runs every 30 seconds
- Use version history to restore previous versions
- Export projects as JSON for backup
- Import projects to restore from backup

### Custom Components
- Use `:::hero` for attention-grabbing headers
- Use `:::col-2` or `:::col-3` for layouts
- Use `:::steps` for tutorials
- Use `:::timeline` for event sequences
- Use `:::card` for highlighted content

### Theme Selection
- WeChat Classic: Best for general content
- Tech Blue: Best for technical articles
- Elegant Purple: Best for lifestyle content
- Fresh Green: Best for health/nature topics
- Warm Orange: Best for creative content

## 🔧 Configuration

### AI Provider Setup

#### OpenAI
1. Get API key from https://platform.openai.com
2. Paste in AI tab
3. Select model (gpt-4, gpt-3.5-turbo)

#### Anthropic
1. Get API key from https://console.anthropic.com
2. Paste in AI tab
3. Select model (claude-3-opus, claude-3-sonnet)

#### Gemini
1. Get API key from https://makersuite.google.com
2. Paste in AI tab
3. Select model (gemini-pro)

#### DeepSeek
1. Get API key from https://platform.deepseek.com
2. Paste in AI tab
3. Select model (deepseek-chat)

#### Ollama (Local)
1. Install Ollama from https://ollama.ai
2. Run `ollama serve`
3. Select model (llama2, mistral, etc.)

#### OpenRouter
1. Get API key from https://openrouter.ai
2. Paste in AI tab
3. Select any supported model

## 🎨 Custom Component Syntax

### Hero Section
```markdown
:::hero
# Your Amazing Title
Your compelling subtitle or description
:::
```

### Two Columns
```markdown
:::col-2
Left column content
---
Right column content
:::
```

### Three Columns
```markdown
:::col-3
Column 1
---
Column 2
---
Column 3
:::
```

### Steps
```markdown
:::steps
1. First Step
   Description of first step

2. Second Step
   Description of second step
:::
```

### Timeline
```markdown
:::timeline
**2024-01** - Event Title
Event description

**2024-02** - Another Event
Another description
:::
```

### Card
```markdown
:::card
**Important Note**
This content will be highlighted in a card.
:::
```

### Video
```markdown
:::video https://www.youtube.com/watch?v=VIDEO_ID
Video title or description
:::
```

## 🐛 Troubleshooting

### AI Not Working
- Check API key is correct
- Verify internet connection
- Check API provider status
- Try different model

### Images Not Showing
- Check image file format (jpg, png, gif, webp)
- Verify image uploaded successfully
- Try re-uploading image

### Auto-save Not Working
- Check browser localStorage is enabled
- Clear browser cache and reload
- Check console for errors

### Export Issues
- For WeChat: Use Chrome or Edge browser
- For PDF: Ensure html2canvas is loaded
- For HTML: Check file download permissions

## 📖 Learn More

- **README.md**: Project overview and setup
- **FEATURES.md**: Detailed feature documentation
- **CHANGELOG.md**: Version history and updates
- **SIMULATION_STATUS.md**: Completion status and roadmap

## 🆘 Support

For issues or questions:
1. Check this Quick Start guide
2. Review FEATURES.md for detailed documentation
3. Check SIMULATION_STATUS.md for known limitations
4. Review code comments in source files

---

**Happy Writing!** 🎉
