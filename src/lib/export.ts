import { convertMarkdownWithComponents } from './markdown-components'

export function exportToMarkdown(markdown: string, filename: string = 'document.md') {
  const blob = new Blob([markdown], { type: 'text/markdown' })
  downloadBlob(blob, filename)
}

export async function exportToHTML(markdown: string, style: 'github' | 'minimal' | 'elegant' = 'github', filename: string = 'document.html') {
  const componentStyles = `
    /* Custom Components */
    .columns-component {
      display: grid !important;
      gap: 32px;
      margin: 32px 0;
      align-items: start;
    }
    .columns-component.col-2 {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .columns-component.col-3 {
      grid-template-columns: repeat(3, 1fr) !important;
    }
    @media (max-width: 480px) {
      .columns-component {
        grid-template-columns: 1fr !important;
      }
    }
    .column-item {
      padding: 24px;
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      min-height: 100px;
    }
  `
  
  const styles = {
    github: `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
        line-height: 1.6;
        max-width: 980px;
        margin: 0 auto;
        padding: 45px;
        color: #24292f;
        background: #ffffff;
      }
      h1, h2 { border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
      h1 { font-size: 2em; margin: 0.67em 0; }
      h2 { font-size: 1.5em; margin-top: 24px; }
      h3 { font-size: 1.25em; }
      code {
        background: #f6f8fa;
        padding: 0.2em 0.4em;
        border-radius: 6px;
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
        font-size: 85%;
      }
      pre {
        background: #f6f8fa;
        padding: 16px;
        border-radius: 6px;
        overflow-x: auto;
        line-height: 1.45;
      }
      pre code { background: none; padding: 0; }
      blockquote {
        border-left: 4px solid #d0d7de;
        padding-left: 1em;
        margin-left: 0;
        color: #57606a;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 16px 0;
      }
      th, td {
        border: 1px solid #d0d7de;
        padding: 6px 13px;
      }
      th {
        background: #f6f8fa;
        font-weight: 600;
      }
      a { color: #0969da; text-decoration: none; }
      a:hover { text-decoration: underline; }
      img { max-width: 100%; }
    `,
    minimal: `
      body {
        font-family: Georgia, serif;
        line-height: 1.8;
        max-width: 650px;
        margin: 0 auto;
        padding: 2rem;
        color: #333;
      }
      h1, h2, h3 { font-weight: normal; }
      code {
        background: #f5f5f5;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
      }
      pre {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 3px;
        overflow-x: auto;
      }
      blockquote {
        border-left: 3px solid #ccc;
        padding-left: 1rem;
        margin-left: 0;
        font-style: italic;
      }
    `,
    elegant: `
      body {
        font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
        line-height: 1.7;
        max-width: 750px;
        margin: 0 auto;
        padding: 3rem;
        color: #2c3e50;
        background: #fafafa;
      }
      h1 { font-size: 2.5em; color: #1a252f; margin-bottom: 0.5em; }
      h2 { font-size: 1.8em; color: #34495e; margin-top: 1.5em; }
      h3 { font-size: 1.3em; color: #34495e; }
      code {
        background: #ecf0f1;
        padding: 3px 8px;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 0.9em;
      }
      pre {
        background: #2c3e50;
        color: #ecf0f1;
        padding: 1.5rem;
        border-radius: 8px;
        overflow-x: auto;
      }
      pre code { background: none; color: inherit; }
      blockquote {
        border-left: 5px solid #3498db;
        padding-left: 1.5rem;
        margin-left: 0;
        color: #7f8c8d;
        font-style: italic;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 1.5rem 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      th, td {
        border: 1px solid #bdc3c7;
        padding: 12px 15px;
      }
      th {
        background: #34495e;
        color: white;
        font-weight: 600;
      }
      a { color: #3498db; text-decoration: none; }
      a:hover { color: #2980b9; text-decoration: underline; }
    `
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Document</title>
  <style>${componentStyles}${styles[style]}</style>
</head>
<body>
${convertMarkdownToHTML(markdown)}
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  downloadBlob(blob, filename)
}

// WeChat-specific HTML export
export function exportForWeChat(markdown: string): void {
  const wechatStyle = `
    /* WeChat公众号样式 */
    section {
      font-size: 16px;
      color: #333;
      line-height: 1.75;
      letter-spacing: 0.5px;
      word-wrap: break-word;
      font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;
    }
    h1 {
      font-size: 24px;
      font-weight: 600;
      text-align: center;
      margin: 24px 0 16px;
      color: #000;
    }
    h2 {
      font-size: 20px;
      font-weight: 600;
      margin: 24px 0 12px;
      padding-left: 10px;
      border-left: 4px solid #576b95;
      color: #000;
    }
    h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 20px 0 10px;
      color: #000;
    }
    p {
      margin: 12px 0;
      text-align: justify;
    }
    strong {
      font-weight: 600;
      color: #000;
    }
    em {
      font-style: italic;
    }
    a {
      color: #576b95;
      text-decoration: none;
    }
    img {
      max-width: 100%;
      display: block;
      margin: 16px auto;
      border-radius: 4px;
    }
    blockquote {
      border-left: 4px solid #e5e5e5;
      padding-left: 16px;
      margin: 16px 0;
      color: #888;
      font-style: italic;
    }
    code {
      background: #f7f7f7;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #d14;
    }
    pre {
      background: #f7f7f7;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 16px 0;
    }
    pre code {
      background: none;
      padding: 0;
      color: #333;
    }
    ul, ol {
      padding-left: 24px;
      margin: 12px 0;
    }
    li {
      margin: 6px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    th, td {
      border: 1px solid #e5e5e5;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background: #f7f7f7;
      font-weight: 600;
    }
  `

  const wechatHTML = `<section style="font-size: 16px; color: #333;">
${convertMarkdownToHTML(markdown)}
</section>`

  // Copy to clipboard for pasting into WeChat editor
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = `<style>${wechatStyle}</style>${wechatHTML}`
  document.body.appendChild(tempDiv)
  
  const range = document.createRange()
  range.selectNodeContents(tempDiv)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
  
  try {
    document.execCommand('copy')
    alert('WeChat HTML copied to clipboard! Paste it directly into WeChat editor.')
  } catch (err) {
    console.error('Failed to copy:', err)
    // Fallback: download as HTML
    const blob = new Blob([`<style>${wechatStyle}</style>${wechatHTML}`], { type: 'text/html' })
    downloadBlob(blob, 'wechat-article.html')
  }
  
  document.body.removeChild(tempDiv)
}

function convertMarkdownToHTML(markdown: string): string {
  // First, process custom components
  const processedMarkdown = convertMarkdownWithComponents(markdown)
  
  // Then convert markdown to HTML
  let html = processedMarkdown
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
  
  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
  
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" />')
  
  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>')
  
  // Inline code
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>')
  
  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>')
  html = '<p>' + html + '</p>'
  
  return html
}

export async function exportToPDF(element: HTMLElement, filename: string = 'document.pdf') {
  try {
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).jsPDF
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    pdf.save(filename)
  } catch (error) {
    console.error('PDF export failed:', error)
    alert('PDF export failed. Please try HTML export instead.')
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
