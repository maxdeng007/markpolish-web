// Markdown formatting and beautification utilities

export function formatMarkdown(markdown: string): string {
  let formatted = markdown

  // Fix heading spacing
  formatted = formatted.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2')
  
  // Ensure blank lines before and after headings
  formatted = formatted.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2')
  formatted = formatted.replace(/(#{1,6}\s.+)\n([^\n#])/g, '$1\n\n$2')
  
  // Fix list formatting
  formatted = formatted.replace(/^(\s*[-*+])\s+/gm, '$1 ')
  formatted = formatted.replace(/^(\s*\d+\.)\s+/gm, '$1 ')
  
  // Ensure blank lines before and after code blocks
  formatted = formatted.replace(/([^\n])\n```/g, '$1\n\n```')
  formatted = formatted.replace(/```\n([^\n])/g, '```\n\n$1')
  
  // Fix multiple blank lines
  formatted = formatted.replace(/\n{3,}/g, '\n\n')
  
  // Trim trailing whitespace
  formatted = formatted.split('\n').map(line => line.trimEnd()).join('\n')
  
  return formatted.trim() + '\n'
}

export function generateTableOfContents(markdown: string, includeH1: boolean = true, includeH2: boolean = true): string {
  const lines = markdown.split('\n')
  const toc: string[] = ['## Table of Contents\n']
  
  for (const line of lines) {
    const h1Match = line.match(/^#\s+(.+)$/)
    const h2Match = line.match(/^##\s+(.+)$/)
    const h3Match = line.match(/^###\s+(.+)$/)
    
    if (h1Match && includeH1) {
      const title = h1Match[1]
      const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      toc.push(`- [${title}](#${slug})`)
    } else if (h2Match && includeH2) {
      const title = h2Match[1]
      const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      toc.push(`  - [${title}](#${slug})`)
    } else if (h3Match) {
      const title = h3Match[1]
      const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      toc.push(`    - [${title}](#${slug})`)
    }
  }
  
  return toc.join('\n') + '\n\n'
}

export function getMarkdownStats(markdown: string) {
  const words = markdown.split(/\s+/).filter(word => word.length > 0).length
  const characters = markdown.length
  const charactersNoSpaces = markdown.replace(/\s/g, '').length
  const lines = markdown.split('\n').length
  const paragraphs = markdown.split(/\n\n+/).filter(p => p.trim().length > 0).length
  
  // Reading time (average 200 words per minute)
  const readingTimeMinutes = Math.ceil(words / 200)
  
  // Count headings
  const headings = (markdown.match(/^#{1,6}\s/gm) || []).length
  
  // Count code blocks
  const codeBlocks = (markdown.match(/```/g) || []).length / 2
  
  // Count links
  const links = (markdown.match(/\[.+?\]\(.+?\)/g) || []).length
  
  // Count images
  const images = (markdown.match(/!\[.+?\]\(.+?\)/g) || []).length
  
  return {
    words,
    characters,
    charactersNoSpaces,
    lines,
    paragraphs,
    readingTimeMinutes,
    headings,
    codeBlocks,
    links,
    images
  }
}

export function lintMarkdown(markdown: string): Array<{ line: number; message: string; severity: 'error' | 'warning' }> {
  const issues: Array<{ line: number; message: string; severity: 'error' | 'warning' }> = []
  const lines = markdown.split('\n')
  
  lines.forEach((line, index) => {
    // Check for trailing whitespace
    if (line.endsWith(' ') && line.trim().length > 0) {
      issues.push({
        line: index + 1,
        message: 'Trailing whitespace',
        severity: 'warning'
      })
    }
    
    // Check for multiple consecutive blank lines
    if (index > 0 && line === '' && lines[index - 1] === '') {
      issues.push({
        line: index + 1,
        message: 'Multiple consecutive blank lines',
        severity: 'warning'
      })
    }
    
    // Check for heading without space
    if (/^#{1,6}[^\s]/.test(line)) {
      issues.push({
        line: index + 1,
        message: 'Heading should have a space after #',
        severity: 'error'
      })
    }
    
    // Check for unmatched code blocks
    const codeBlockCount = markdown.split('```').length - 1
    if (codeBlockCount % 2 !== 0) {
      issues.push({
        line: index + 1,
        message: 'Unmatched code block delimiter',
        severity: 'error'
      })
    }
  })
  
  return issues
}
