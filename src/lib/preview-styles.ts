export const standardMarkdownStyles = `
  .preview-content { max-width: 100%; }
  .preview-content * { box-sizing: border-box; max-width: 100%; }
  
  .preview-content ul, .preview-content ol { margin: 12px 0; padding-left: 24px; }
  .preview-content ul { list-style-type: disc; }
  .preview-content ol { list-style-type: decimal; }
  .preview-content li { margin: 6px 0; line-height: 1.6; }
  .preview-content li > ul, .preview-content li > ol { margin: 4px 0; }
  .preview-content ul ul { list-style-type: circle; }
  .preview-content ul ul ul { list-style-type: square; }
  .preview-content ol ol { list-style-type: lower-alpha; }
  .preview-content ol ol ol { list-style-type: lower-roman; }
  .preview-content li p { margin: 0; display: inline; }
  
  .preview-content table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
  .preview-content th, .preview-content td { border: 1px solid var(--border, #e5e5e5); padding: 10px 12px; text-align: left; }
  .preview-content th { background: var(--background, #f8f8fa); font-weight: 600; color: var(--heading, #1a1a2e); }
  .preview-content tbody tr:nth-child(odd) td { background: #ffffff; }
  .preview-content tbody tr:nth-child(even) td { background: #f8f8f8; }
  .preview-content hr { border: none; border-top: 1px solid var(--border, #e5e5e5); margin: 20px 0; }
  
  .preview-content blockquote, 
  .preview-content .quote-component { 
    margin: 24px 0 !important; 
    padding: 32px 28px 28px 56px !important; 
    border: none !important;
    border-radius: 12px !important;
    background: var(--blockquote-bg, linear-gradient(135deg, #f8f9fa 0%, #f0f1f4 100%)) !important;
    position: relative !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
  }
  .preview-content blockquote::before,
  .preview-content .quote-component::before {
    content: '"' !important;
    position: absolute !important;
    top: 24px !important;
    left: 18px !important;
    font-size: 48px !important;
    font-family: Georgia, serif !important;
    color: var(--accent, #576b95) !important;
    opacity: 0.25 !important;
    line-height: 1 !important;
  }
  .preview-content blockquote p, 
  .preview-content .quote-component p { 
    margin: 0 !important; 
    color: var(--foreground, #374151) !important; 
    line-height: 1.75 !important; 
    font-size: 1.05em !important;
    font-family: 'Georgia', 'Times New Roman', serif !important;
  }
  .preview-content blockquote cite,
  .preview-content .quote-component cite,
  .preview-content .quote-attribution {
    display: block !important;
    margin-top: 16px !important;
    font-size: 0.85em !important;
    font-style: normal !important;
    color: var(--foreground, #6b7280) !important;
    font-weight: 500 !important;
    letter-spacing: 0.5px !important;
    text-transform: uppercase !important;
  }
  
  .preview-content code { 
    background: var(--background, #f0f0f5); 
    padding: 3px 8px; 
    border-radius: 4px; 
    font-size: 0.9em;
    font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
    color: #e83e8c;
  }
  .preview-content pre { 
    background: #1e1e2e; 
    padding: 18px 20px; 
    border-radius: 12px; 
    overflow-x: auto; 
    margin: 16px 0;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
    white-space: pre;
    tab-size: 2;
  }
  .preview-content pre code { 
    background: none; 
    padding: 0; 
    color: #cdd6f4;
    font-size: 0.875em;
    line-height: 1.6;
    white-space: pre;
    font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
  }
  .preview-content pre .keyword { color: #cba6f7; }
  .preview-content pre .string { color: #a6e3a1; }
  .preview-content pre .comment { color: #6c7086; font-style: italic; }
  .preview-content pre .function { color: #89b4fa; }
  .preview-content pre .number { color: #fab387; }
  .preview-content pre .operator { color: #94e2d5; }
  .preview-content img { max-width: 100%; border-radius: 8px; margin: 12px auto; display: block; }

  .preview-content .image-wrapper {
    margin: 20px 0;
    text-align: center;
  }
  .preview-content .image-wrapper img {
    max-width: 100%;
    border-radius: 8px;
    margin: 0 auto;
    display: block;
  }
  .preview-content .image-wrapper.aspect-1-1 img { aspect-ratio: 1/1; object-fit: cover; }
  .preview-content .image-wrapper.aspect-16-9 img { aspect-ratio: 16/9; object-fit: cover; }
  .preview-content .image-wrapper.aspect-9-16 img { aspect-ratio: 9/16; object-fit: cover; width: 50%; }
  .preview-content .image-wrapper.aspect-4-3 img { aspect-ratio: 4/3; object-fit: cover; }
  .preview-content .image-wrapper.aspect-3-4 img { aspect-ratio: 3/4; object-fit: cover; width: 60%; }
  .preview-content .image-caption {
    margin-top: 10px;
    font-size: 0.9em;
    color: var(--foreground, #666);
    font-style: italic;
    text-align: center;
  }
`;

export const aiImageStyles = `
  .ai-image-placeholder {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 32px 24px; border: 2px dashed var(--border, #e0e0e0);
    border-radius: 12px; margin: 20px 0;
    background: var(--background, #ffffff);
    min-height: 160px; transition: all 0.2s ease;
  }
  .ai-image-placeholder:hover {
    border-color: var(--accent, #576b95);
    background: var(--background, #fafafa);
  }
  .ai-image-icon { font-size: 40px; margin-bottom: 16px; opacity: 0.7; }
  .ai-image-ratio-selector { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; justify-content: center; }
  .ai-image-ratio-btn {
    padding: 6px 14px; border: 1px solid var(--border, #e0e0e0);
    border-radius: 6px; background: transparent; cursor: pointer; font-size: 12px; font-weight: 500;
    color: var(--foreground, #666); transition: all 0.15s ease;
  }
  .ai-image-ratio-btn:hover { border-color: var(--accent, #576b95); color: var(--accent, #576b95); }
  .ai-image-ratio-btn.active { background: var(--accent, #576b95); color: #fff; border-color: var(--accent, #576b95); }
  .ai-image-generate-btn {
    padding: 12px 28px; background: var(--accent, #576b95); color: #fff;
    border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;
    transition: all 0.2s ease;
  }
  .ai-image-generate-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .ai-image-generate-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .ai-image-status { margin-top: 12px; font-size: 12px; color: var(--foreground, #888); }
  .ai-image-wrapper { margin: 20px 0; position: relative; border-radius: 12px; overflow: hidden; background: var(--background, #fff); border: 1px solid var(--border, #e5e5e5); }
  .ai-image-wrapper img { width: 100%; display: block; }
  .ai-image-overlay { position: absolute; top: 12px; right: 12px; opacity: 0; transition: opacity 0.2s; }
  .ai-image-wrapper:hover .ai-image-overlay { opacity: 1; }
  .ai-image-action-btn {
    width: 32px; height: 32px; border-radius: 6px;
    background: rgba(0,0,0,0.6); color: #fff; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 14px;
  }
  .ai-image-action-btn:hover { background: rgba(0,0,0,0.8); }
  .ai-image-wecom-placeholder {
    display: flex; align-items: center; justify-content: center;
    padding: 24px; border-radius: 8px;
    background: var(--background, #f5f5f5);
    color: var(--foreground, #999); font-size: 13px;
  }
`;

export const componentStyles = `
  .preview-content .hero-component {
    padding: 48px 36px; border-radius: 16px; text-align: center; margin: 32px 0;
    background: var(--accent, #6366f1);
  }
  .preview-content .hero-component h1, .preview-content .hero-component p { color: #fff !important; margin: 0.6em 0; }
  .preview-content .hero-component h1 { font-size: 2em; font-weight: 700; }
  .preview-content .hero-component p { font-size: 1.1em; opacity: 0.95; }

  .preview-content .steps-component { margin: 32px 0; }
  .preview-content .steps-component table { border: 1px solid var(--border, #e5e5e5) !important; border-radius: 8px; overflow: hidden; }
  .preview-content .steps-component td, .preview-content .steps-component th { border: none !important; background: transparent !important; padding: 14px; }
  .preview-content .step-item {
    display: flex; align-items: center; gap: 14px; padding: 12px 16px; margin-bottom: 10px;
    border: 1px solid var(--border, #e5e5e5); border-radius: 8px;
    background: var(--background, #fff); transition: all 0.2s ease;
  }
  .preview-content .step-item:hover { border-color: var(--accent, #6366f1); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
  .preview-content .step-number {
    width: 26px; height: 26px; min-width: 26px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 600; font-size: 12px; color: #fff;
    background: var(--accent, #6366f1);
    flex-shrink: 0; text-align: center;
  }
  .preview-content .step-content { flex: 1; min-width: 0; }
  .preview-content .step-title { font-weight: 600; font-size: 0.95em; color: var(--heading, #1a1a2e); }
  .preview-content .step-desc { font-size: 0.9em; color: var(--foreground, #666); margin-top: 4px; line-height: 1.6; }

  .preview-content .timeline-component { margin: 32px 0; padding-left: 24px; border-left: 2px solid var(--border, #e5e5e5); }
  .preview-content .timeline-item { margin-bottom: 24px; padding-left: 20px; position: relative; }
  .preview-content .timeline-item::before {
    content: ''; position: absolute; left: -29px; top: 6px;
    width: 12px; height: 12px; border-radius: 50%;
    background: var(--accent, #6366f1);
    border: 2px solid var(--background, #fff);
  }
  .preview-content .timeline-item::after {
    content: ''; position: absolute; left: -24px; top: 18px;
    width: 2px; height: calc(100% + 6px);
    background: var(--border, #e5e5e5);
  }
  .preview-content .timeline-item:last-child::after { display: none; }
  .preview-content .timeline-title { font-weight: 600; font-size: 1em; color: var(--heading, #1a1a2e); }
  .preview-content .timeline-body { font-size: 0.9em; color: var(--foreground, #666); margin-top: 6px; line-height: 1.6; }

  .preview-content .card-component {
    padding: 20px 24px; border: 1px solid var(--border, #e5e5e5); border-radius: 10px;
    margin: 20px 0; background: var(--background, #fff);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: all 0.2s ease;
  }
  .preview-content .card-component:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

  .preview-content .video-component { margin: 24px 0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .preview-content .video-player { width: 100%; display: block; }
  .preview-content .video-caption { text-align: center; font-size: 0.9em; color: var(--foreground, #666); margin-top: 10px; padding: 0 12px 14px; }

  .preview-content .callout-component { padding: 20px 24px; border-radius: 12px; margin: 16px 0; border: none; border-left: 4px solid; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .preview-content .callout-info { background: var(--callout-bg, #eff6ff); border-color: var(--callout-accent, #3b82f6); }
  .preview-content .callout-warning { background: var(--callout-bg, #fffbeb); border-color: var(--callout-accent, #f59e0b); }
  .preview-content .callout-error { background: var(--callout-bg, #fef2f2); border-color: var(--callout-accent, #ef4444); }
  .preview-content .callout-success { background: var(--callout-bg, #f0fdf4); border-color: var(--callout-accent, #22c55e); }
  .preview-content .callout-header { font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .preview-content .callout-title { font-weight: 600; color: var(--callout-title, #1e293b); }
  .preview-content .callout-content { font-size: 0.95em; color: var(--callout-text, #475569); line-height: 1.6; }

  .preview-content .tabs-component { margin: 20px 0; border: 1px solid var(--border, #e5e5e5); border-radius: 10px; overflow: hidden; background: var(--background, #fff); box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
  .preview-content .tab-list { display: flex; border-bottom: 1px solid var(--border, #e5e5e5); background: var(--tab-header-bg, #fafafa); }
  .preview-content .tab-button {
    padding: 12px 20px; border: none; background: none; cursor: pointer;
    font-size: 14px; font-weight: 500; color: var(--foreground, #666);
    border-bottom: 2px solid transparent; transition: all 0.2s ease;
  }
  .preview-content .tab-button:hover { background: rgba(99, 102, 241, 0.05); }
  .preview-content .tab-button.active { color: var(--accent, #6366f1); border-bottom-color: var(--accent, #6366f1); }
  .preview-content .tab-panel { padding: 18px; display: none; }
  .preview-content .tab-panel.active { display: block; }

  .preview-content .accordion-component { margin: 20px 0; }
  .preview-content .accordion-item {
    border: 1px solid var(--border, #e5e5e5); border-radius: 8px; margin-bottom: 8px; overflow: hidden;
    background: var(--background, #fff);
  }
  .preview-content .accordion-header {
    width: 100%; padding: 14px 18px; border: none; background: none; cursor: pointer;
    font-size: 14px; font-weight: 500; color: var(--heading, #1a1a2e);
    display: flex; justify-content: space-between; align-items: center;
    text-align: left;
  }
  .preview-content .accordion-header::after { content: '+'; font-size: 16px; color: var(--accent, #576b95); font-weight: 400; }
  .preview-content .accordion-item[open] .accordion-header::after { content: '−'; }
  .preview-content .accordion-header:hover { background: rgba(0,0,0,0.02); }
  .preview-content .accordion-content { padding: 0 18px 14px; font-size: 0.9em; color: var(--foreground, #475569); line-height: 1.6; }

  .preview-content .columns-flex { display: flex; gap: 20px; margin: 20px 0; }
  .preview-content .column-item { flex: 1; padding: 20px; border: 1px solid var(--border, #e5e5e5); border-radius: 10px; background: var(--background, #fff); }
`;

export const darkThemeOverrides = `
  .theme-dark .preview-content .hero-component { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
  .theme-dark .preview-content .step-item, .theme-dark .preview-content .card-component, .theme-dark .preview-content .columns-table td, .theme-dark .preview-content .columns-flex .column-item, .theme-dark .preview-content .tabs-component, .theme-dark .preview-content .accordion-item { background: #1a1a2e; border-color: #2d2d44; }
  .theme-dark .preview-content .step-item:hover { border-color: #818cf8; box-shadow: 0 4px 16px rgba(129, 140, 248, 0.15); }
  .theme-dark .preview-content .timeline-component { border-color: #2d2d44; }
  .theme-dark .preview-content .timeline-item::before { background: #818cf8; border-color: #1a1a2e; }
  .theme-dark .preview-content .timeline-item::after { background: #2d2d44; }
  .theme-dark .preview-content .tab-list, .theme-dark .preview-content .accordion-header { background: #16162a; }
  .theme-dark .preview-content .accordion-header::after { color: #818cf8; }
  .theme-dark .preview-content .quote-component,
  .theme-dark .preview-content blockquote { background: #252536; border-left-color: #818cf8 !important; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
  .theme-dark .preview-content .quote-component::before,
  .theme-dark .preview-content blockquote::before { color: #818cf8; opacity: 0.4; }
  .theme-dark .preview-content .quote-component p,
  .theme-dark .preview-content blockquote p { color: #f1f5f9; }
  .theme-dark .preview-content .quote-component cite,
  .theme-dark .preview-content .quote-attribution { color: #94a3b8; }
  .theme-dark .preview-content .local-image-caption { background: #16162a; }
  .theme-dark .preview-content .ai-image-placeholder { background: var(--ai-image-bg, #1a1a2e); border-color: var(--ai-image-border, #3f3f5c); }
  .theme-dark .preview-content .ai-image-placeholder:hover { border-color: var(--accent, #818cf8); background: var(--ai-image-bg, #252536); }
  .theme-dark .preview-content .ai-image-ratio-btn { border-color: var(--ai-image-border, #3f3f5c); color: var(--ai-image-fg, #94a3b8); }
  .theme-dark .preview-content .ai-image-ratio-btn:hover { border-color: var(--accent); color: var(--accent); }
  .theme-dark .preview-content .ai-image-ratio-btn.active { background: var(--accent); border-color: var(--accent); }
  .theme-dark .preview-content .ai-image-generate-btn { background: var(--accent); }
  .theme-dark .preview-content .ai-image-wrapper { border-color: var(--ai-image-border, #3f3f5c); }
  .theme-dark .preview-content .ai-image-wecom-placeholder { background: var(--ai-image-bg, #1a1a2e); color: var(--ai-image-fg, #64748b); }
  .theme-dark .preview-content .accordion-content { background: #1a1a2e; border-color: #2d2d44; }
  .theme-dark .preview-content .callout-component { box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .theme-dark .preview-content .callout-info { background: linear-gradient(135deg, #1e3a5f 0%, #172554 100%); border-color: #60a5fa; }
  .theme-dark .preview-content .callout-warning { background: linear-gradient(135deg, #451a03 0%, #78350f 100%); border-color: #fbbf24; }
  .theme-dark .preview-content .callout-error { background: linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%); border-color: #f87171; }
  .theme-dark .preview-content .callout-success { background: linear-gradient(135deg, #052e16 0%, #14532d 100%); border-color: #4ade80; }
  .theme-dark .preview-content .callout-title { color: #f1f5f9; }
  .theme-dark .preview-content .callout-content { color: #cbd5e1; }
  .theme-dark .preview-content table { border-color: #374151; }
  .theme-dark .preview-content th, .theme-dark .preview-content td { border-color: #374151; color: #e5e7eb; }
  .theme-dark .preview-content th { background: #1f2937; color: #f9fafb; }
  .theme-dark .preview-content tbody tr:nth-child(odd) td { background: #111827; }
  .theme-dark .preview-content tbody tr:nth-child(even) td { background: #1f2937; }
`;

export function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

export function getAllPreviewStyles(): string {
  return (
    standardMarkdownStyles +
    aiImageStyles +
    componentStyles +
    darkThemeOverrides
  );
}

export function getExportStyles(isDark: boolean): string {
  const styles = standardMarkdownStyles + aiImageStyles + componentStyles;
  return isDark ? styles + darkThemeOverrides : styles;
}

export const wechatStyles = `
.preview-content { font-family: -apple-system-font, "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; font-size: 16px; line-height: 1.8; color: #333; }
.preview-content h1 { font-size: 28px; font-weight: 700; margin: 28px 0 16px; letter-spacing: -0.01em; }
.preview-content h2 { font-size: 22px; font-weight: 600; margin: 24px 0 12px; padding-left: 12px; border-left: 4px solid var(--accent, #576b95); }
.preview-content h3 { font-size: 18px; font-weight: 600; margin: 20px 0 10px; }
.preview-content h4, .preview-content h5, .preview-content h6 { font-size: 16px; font-weight: 600; margin: 16px 0 8px; }
.preview-content p { margin: 12px 0; }
.preview-content a { color: var(--accent, #576b95); text-decoration: none; }
.preview-content ul, .preview-content ol { padding-left: 24px; margin: 12px 0; }
.preview-content li { margin: 8px 0; }
.preview-content code { background: var(--accent, #576b95); background: rgba(87, 107, 149, 0.12); padding: 3px 8px; border-radius: 4px; font-size: 0.9em; font-family: 'SF Mono', 'Monaco', 'Menlo', monospace; color: var(--accent, #576b95); }
.preview-content pre { background: #f7f8fa; padding: 16px 20px; border-radius: 8px; overflow-x: auto; margin: 16px 0; border: 1px solid #e5e5e5; white-space: pre; tab-size: 2; }
.preview-content pre code { background: none; padding: 0; font-size: 0.9em; line-height: 1.6; white-space: pre; font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace; color: #333333; }

/* Blockquote */
.preview-content blockquote { margin: 20px 0; padding: 16px 20px 16px 24px; border: none; border-left: 4px solid var(--accent, #576b95); background: rgba(87, 107, 149, 0.06); border-radius: 0 8px 8px 0; }
.preview-content blockquote p { margin: 0; color: #555; line-height: 1.7; font-style: italic; }
.preview-content .quote-component { margin: 20px 0; padding: 16px 20px 16px 24px; border: none; border-left: 4px solid var(--accent, #576b95); background: rgba(87, 107, 149, 0.06); border-radius: 0 8px 8px 0; }
.preview-content .quote-component p { margin: 0; color: #555; line-height: 1.7; font-style: italic; }

/* Table */
.preview-content table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; }
.preview-content th, .preview-content td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #e5e5e5; }
.preview-content th { background: #f8f9fa; font-weight: 600; color: #1a1a2e; }
.preview-content tbody tr:last-child td { border-bottom: none; }
.preview-content tbody tr:nth-child(odd) td { background: #ffffff; }
.preview-content tbody tr:nth-child(even) td { background: #fafbfc; }
.preview-content hr { border: none; border-top: 1px solid #e5e5e5; margin: 24px 0; }
.preview-content img { max-width: 100%; border-radius: 8px; }

/* Hero */
.preview-content .hero-component { padding: 40px 32px; border-radius: 12px; text-align: center; margin: 24px 0; background: linear-gradient(135deg, var(--accent, #576b95) 0%, var(--accent-end, #7b8fc4) 100%); }
.preview-content .hero-component h1, .preview-content .hero-component p { color: #fff !important; margin: 0.5em 0; }
.preview-content .hero-component h1 { font-size: 1.8em; font-weight: 700; }
.preview-content .hero-component p { font-size: 1.05em; opacity: 0.95; }

/* Steps */
.preview-content .steps-component { margin: 20px 0; }
.preview-content .step-item { display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; margin-bottom: 10px; border: 1px solid #e5e5e5; border-radius: 8px; background: #fff; }
.preview-content .step-number { width: 28px; height: 28px; min-width: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; color: #fff; background: var(--accent, #576b95); flex-shrink: 0; }
.preview-content .step-content { flex: 1; min-width: 0; }
.preview-content .step-title { font-weight: 600; font-size: 0.95em; color: #1a1a2e; }
.preview-content .step-desc { font-size: 0.9em; color: #666; margin-top: 4px; line-height: 1.6; }

/* Timeline */
.preview-content .timeline-component { margin: 20px 0; padding-left: 20px; border-left: 2px solid var(--accent, #576b95); }
.preview-content .timeline-item { margin-bottom: 20px; padding-left: 20px; position: relative; }
.preview-content .timeline-item::before { content: ''; position: absolute; left: -26px; top: 6px; width: 10px; height: 10px; border-radius: 50%; background: var(--accent, #576b95); border: 2px solid #fff; }
.preview-content .timeline-item::after { content: ''; position: absolute; left: -22px; top: 16px; width: 2px; height: calc(100% + 4px); background: #e5e5e5; }
.preview-content .timeline-item:last-child::after { display: none; }
.preview-content .timeline-title { font-weight: 600; font-size: 1em; color: #1a1a2e; }
.preview-content .timeline-body { font-size: 0.9em; color: #666; margin-top: 6px; line-height: 1.6; }

/* Card */
.preview-content .card-component { padding: 18px 20px; border: 1px solid #e5e5e5; border-radius: 8px; margin: 16px 0; background: #fff; }

/* Callout */
.preview-content .callout-component { padding: 16px 20px; border-radius: 8px; margin: 16px 0; border: none; border-left: 4px solid; }
.preview-content .callout-info { background: #f0f7ff; border-color: #3b82f6; }
.preview-content .callout-warning { background: #fffbeb; border-color: #f59e0b; }
.preview-content .callout-error { background: #fef2f2; border-color: #ef4444; }
.preview-content .callout-success { background: #f0fdf4; border-color: #22c55e; }
.preview-content .callout-title { font-weight: 600; color: #1e293b; }
.preview-content .callout-content { font-size: 0.95em; color: #475569; line-height: 1.6; }

/* Columns */
.preview-content .columns-table { width: 100%; border-collapse: collapse; margin: 20px 0; display: table; table-layout: fixed; }
.preview-content .columns-table tr { display: table-row; }
.preview-content .columns-table td { padding: 16px; border: 1px solid #e5e5e5; border-radius: 8px; vertical-align: top; background: #fff; word-wrap: break-word; }
.preview-content .columns-table td:first-child { border-left: none; border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
.preview-content .columns-table td:last-child { border-right: none; border-top-right-radius: 8px; border-bottom-right-radius: 8px; }
.preview-content .columns-table td:hover { background: #fafbfc; }
.preview-content .columns-table td h1,
.preview-content .columns-table td h2,
.preview-content .columns-table td h3,
.preview-content .columns-table td h4 { margin-top: 0; }
.preview-content .columns-table td h3 { font-size: 17px; color: #1a1a2e; margin-bottom: 10px; }
.preview-content .columns-table td p { margin: 8px 0; }

.preview-content .columns-flex { display: flex; gap: 14px; margin: 20px 0; flex-wrap: wrap; }
.preview-content .columns-flex .column-item { flex: 1; min-width: 200px; padding: 16px; border: 1px solid #e5e5e5; border-radius: 8px; background: #fff; vertical-align: top; word-wrap: break-word; }
.preview-content .columns-flex .column-item:hover { background: #fafbfc; }
.preview-content .columns-flex .column-item h1, .preview-content .columns-flex .column-item h2, .preview-content .columns-flex .column-item h3, .preview-content .columns-flex .column-item h4 { margin-top: 0; }
.preview-content .columns-flex .column-item h3 { font-size: 17px; color: #1a1a2e; margin-bottom: 10px; }
.preview-content .columns-flex .column-item p { margin: 8px 0; }

/* Tabs */
.preview-content .tabs-component { margin: 16px 0; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; background: #fff; }
.preview-content .tab-list { display: flex; border-bottom: 1px solid #e5e5e5; background: #fafafa; }
.preview-content .tab-button { padding: 12px 18px; border: none; background: none; cursor: pointer; font-size: 14px; font-weight: 500; color: #666; border-bottom: 2px solid transparent; transition: all 0.2s; }
.preview-content .tab-button:hover { color: var(--accent, #576b95); background: rgba(87, 107, 149, 0.05); }
.preview-content .tab-button.active { color: var(--accent, #576b95); border-bottom-color: var(--accent, #576b95); }
.preview-content .tab-panel { padding: 16px; display: none; }
.preview-content .tab-panel.active { display: block; }

/* Accordion */
.preview-content .accordion-component { margin: 16px 0; }
.preview-content .accordion-item { border: 1px solid #e5e5e5; border-radius: 8px; margin-bottom: 8px; overflow: hidden; background: #fff; }
.preview-content .accordion-header { padding: 14px 16px; font-weight: 500; font-size: 1em; background: #fafafa; color: #1a1a2e; cursor: pointer; display: flex; align-items: center; justify-content: space-between; }
.preview-content .accordion-header::after { content: '+'; font-size: 16px; color: var(--accent, #576b95); font-weight: 400; }
.preview-content .accordion-item[open] .accordion-header::after { content: '−'; }
.preview-content .accordion-content { padding: 14px 16px; color: #555; line-height: 1.6; border-top: 1px solid #f0f0f0; }

.preview-content .wecom-tabs { margin: 16px 0; }
.preview-content .wecom-tab-section { margin-bottom: 16px; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; background: #fff; }
.preview-content .wecom-tab-title { padding: 12px 16px; font-weight: 600; font-size: 14px; color: var(--accent, #576b95); background: #fafafa; border-bottom: 1px solid #e5e5e5; margin: 0; }
.preview-content .wecom-tab-content { padding: 16px; color: #333; line-height: 1.7; }
.preview-content .wecom-tab-content p { margin: 8px 0; }
.preview-content .wecom-accordion { margin: 16px 0; }
.preview-content .wecom-accordion-section { margin-bottom: 10px; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; background: #fff; }
.preview-content .wecom-accordion-title { padding: 14px 16px; font-weight: 500; font-size: 15px; color: #1a1a2e; background: #fafafa; border-bottom: 1px solid #e5e5e5; margin: 0; cursor: default; }
.preview-content .wecom-accordion-content { padding: 16px; color: #555; line-height: 1.7; }
.preview-content .wecom-accordion-content p { margin: 8px 0; }

/* Images */
.preview-content .local-image-wrapper { margin: 20px 0; border-radius: 8px; overflow: hidden; border: 1px solid #e5e5e5; }
.preview-content .local-image-wrapper img { width: 100%; display: block; }
.preview-content .local-image-caption { text-align: center; font-size: 0.85em; color: #888; padding: 10px; background: #fafafa; }
`;

export function getWeChatStyles(
  themeAccent: string = "#576b95",
  blockquoteBg: string = "#f8f9fa",
  isDark: boolean = false,
  themeColors: Record<string, string> = {},
): string {
  const accentEnd = adjustColorBrightness(themeAccent, 20);
  let styles = wechatStyles
    .replace(/#576b95/g, themeAccent)
    .replace(/#6366f1/g, themeAccent)
    .replace(/var\(--accent, #576b95\)/g, themeAccent)
    .replace(/var\(--accent, #576b95\)/g, themeAccent)
    .replace(/var\(--accent-end, #7b8fc4\)/g, accentEnd)
    .replace(/#blockquote-bg/g, blockquoteBg)
    .replace(/#blockquote-bg-end/g, blockquoteBg);

  if (isDark) {
    const bg = themeColors.background || "#1a1a2e";
    const fg = themeColors.foreground || "#e5e7eb";
    const heading = themeColors.heading || "#f9fafb";
    const border = themeColors.border || "#374151";
    const calloutText = themeColors.calloutText || "#cbd5e1";
    const tabHeaderBg = themeColors.tabHeaderBg || "#16162a";
    const dividerColor = adjustColorBrightness(bg, -20);
    const hoverBg = adjustColorBrightness(bg, -15);
    const altRowBg = adjustColorBrightness(bg, 8);

    styles += `
      .preview-content {
        background: ${bg};
        color: ${fg};
      }
      .preview-content h1, .preview-content h2, .preview-content h3,
      .preview-content h4, .preview-content h5, .preview-content h6 {
        color: ${heading};
      }
      .preview-content p { color: ${fg}; }
      .preview-content code {
        background: rgba(255,255,255,0.1);
        color: ${themeAccent};
      }
      .preview-content pre {
        background: ${dividerColor};
        border: 1px solid ${border};
      }
      .preview-content pre code { color: #abb2bf; }
      .preview-content blockquote, .preview-content .quote-component {
        background: ${blockquoteBg};
        border-left-color: ${themeAccent};
      }
      .preview-content blockquote p, .preview-content .quote-component p { color: ${fg}; }
      .preview-content hr { border-color: ${border}; }

      /* Tables */
      .preview-content table { border-color: ${border}; }
      .preview-content th, .preview-content td { border-color: ${border} !important; color: ${fg}; }
      .preview-content th { background: ${tabHeaderBg} !important; color: ${heading}; }
      .preview-content tbody tr:nth-child(odd) td { background: ${altRowBg} !important; }
      .preview-content tbody tr:nth-child(even) td { background: ${bg} !important; }
      .preview-content tbody tr:last-child td { border-bottom-color: ${border}; }

      /* Hero */
      .preview-content .hero-component { background: linear-gradient(135deg, ${themeAccent} 0%, ${accentEnd} 100%); }

      /* Steps */
      .preview-content .step-item { background: ${bg} !important; border: 1px solid ${border} !important; border-radius: 8px; }
      .preview-content .step-title { color: ${heading}; }
      .preview-content .step-desc { color: ${fg}; }
      .preview-content .step-number { background: ${themeAccent}; }
      .preview-content .steps-component table { border: 1px solid ${border} !important; border-radius: 8px; overflow: hidden; }
      .preview-content .steps-component td, .preview-content .steps-component th { border: none !important; background: transparent !important; padding: 14px; }

      /* Timeline */
      .preview-content .timeline-component { border-color: ${border}; }
      .preview-content .timeline-item::before { background: ${themeAccent}; border-color: ${bg}; }
      .preview-content .timeline-item::after { background: ${border}; }
      .preview-content .timeline-title { color: ${heading}; }
      .preview-content .timeline-body { color: ${fg}; }

      /* Card */
      .preview-content .card-component { background: ${bg} !important; border-top-color: ${border} !important; border-right-color: ${border} !important; border-bottom-color: ${border} !important; border-left-color: ${border} !important; }

      /* Callout */
      .preview-content .callout-component { box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
      .preview-content .callout-info { background: ${dividerColor}; border-color: ${themeAccent}; }
      .preview-content .callout-warning { background: ${adjustColorBrightness("#451a03", 10)}; border-color: #fbbf24; }
      .preview-content .callout-error { background: ${adjustColorBrightness("#450a0a", 10)}; border-color: #f87171; }
      .preview-content .callout-success { background: ${adjustColorBrightness("#052e16", 10)}; border-color: #4ade80; }
      .preview-content .callout-title { color: ${heading}; }
      .preview-content .callout-content { color: ${calloutText}; }

      /* Columns */
      .preview-content .columns-table { border-color: ${border}; }
      .preview-content .columns-table td { background: ${bg} !important; border: 1px solid ${border} !important; }
      .preview-content .columns-table td:first-child { border-left: 1px solid ${themeAccent} !important; border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
      .preview-content .columns-table td:last-child { border-right: 1px solid ${border} !important; border-top-right-radius: 8px; border-bottom-right-radius: 8px; }
      .preview-content .columns-table td:hover { background: ${hoverBg} !important; }
  .preview-content .columns-flex .column-item { background: ${bg} !important; border: 1px solid ${border} !important; }
  .preview-content .columns-flex .column-item:hover { background: ${hoverBg} !important; }

      /* Tabs */
      .preview-content .tabs-component { background: ${bg} !important; border-top-color: ${border} !important; border-right-color: ${border} !important; border-bottom-color: ${border} !important; border-left-color: ${border} !important; }
      .preview-content .tab-list { background: ${tabHeaderBg} !important; border-color: ${border} !important; }
      .preview-content .tab-button { color: ${fg}; }
      .preview-content .tab-button:hover { background: ${hoverBg} !important; }
      .preview-content .tab-button.active { color: ${themeAccent}; border-bottom-color: ${themeAccent}; }
      .preview-content .tab-panel { color: ${fg}; }

      /* Accordion */
      .preview-content .accordion-item { background: ${bg} !important; border-top-color: ${border} !important; border-right-color: ${border} !important; border-bottom-color: ${border} !important; border-left-color: ${border} !important; }
      .preview-content .accordion-header { background: ${tabHeaderBg} !important; color: ${heading}; border-bottom: 1px solid ${border}; }
      .preview-content .accordion-content { background: ${bg} !important; color: ${fg}; border-top: 1px solid ${border}; }

      /* WeCom Tabs & Accordion */
      .preview-content .wecom-tab-section { background: ${bg} !important; border-color: ${border} !important; }
      .preview-content .wecom-tab-title { background: ${tabHeaderBg} !important; color: ${themeAccent}; border-bottom: 1px solid ${border}; }
      .preview-content .wecom-tab-content { color: ${fg}; }
      .preview-content .wecom-accordion-section { background: ${bg} !important; border-color: ${border} !important; }
      .preview-content .wecom-accordion-title { background: ${tabHeaderBg} !important; color: ${heading}; border-bottom: 1px solid ${border}; }
      .preview-content .wecom-accordion-content { background: ${bg} !important; color: ${fg}; }

      /* Images */
      .preview-content .local-image-wrapper { border-color: ${border}; }
      .preview-content .local-image-caption { background: ${tabHeaderBg}; color: ${fg}; }

      .preview-content ul, .preview-content ol { padding-left: 20px; }
      .preview-content li { margin-bottom: 4px; }
      .preview-content li:last-child { margin-bottom: 0; }
    `;
  }

  return styles;
}

export const wecomExportStyles = wechatStyles;

export function getWeComExportStyles(
  themeAccent: string = "#576b95",
  blockquoteBg: string = "#f8f9fa",
  isDark: boolean = false,
  themeColors: Record<string, string> = {},
): string {
  const accentEnd = adjustColorBrightness(themeAccent, 20);
  let styles = wechatStyles
    .replace(/#576b95/g, themeAccent)
    .replace(/#6366f1/g, themeAccent)
    .replace(/var\(--accent, #576b95\)/g, themeAccent)
    .replace(/var\(--accent, #576b95\)/g, themeAccent)
    .replace(/var\(--accent-end, #7b8fc4\)/g, accentEnd)
    .replace(/#blockquote-bg/g, blockquoteBg)
    .replace(/#blockquote-bg-end/g, blockquoteBg);

  if (isDark) {
    const bg = themeColors.background || "#1a1a2e";
    const fg = themeColors.foreground || "#e5e7eb";
    const heading = themeColors.heading || "#f9fafb";
    const border = themeColors.border || "#374151";
    const calloutText = themeColors.calloutText || "#cbd5e1";
    const tabHeaderBg = themeColors.tabHeaderBg || "#16162a";
    const dividerColor = adjustColorBrightness(bg, -20);
    const hoverBg = adjustColorBrightness(bg, -15);
    const altRowBg = adjustColorBrightness(bg, 8);

    styles += `
      .preview-content {
        background: ${bg};
        color: ${fg};
      }
      .preview-content h1, .preview-content h2, .preview-content h3,
      .preview-content h4, .preview-content h5, .preview-content h6 {
        color: ${heading};
      }
      .preview-content p { color: ${fg}; }
      .preview-content code {
        background: rgba(255,255,255,0.1);
        color: ${themeAccent};
      }
      .preview-content pre {
        background: ${dividerColor};
        border: 1px solid ${border};
      }
      .preview-content pre code { color: #abb2bf; }
      .preview-content blockquote, .preview-content .quote-component {
        background: ${blockquoteBg};
        border-left-color: ${themeAccent};
      }
      .preview-content blockquote p, .preview-content .quote-component p { color: ${fg}; }
      .preview-content hr { border-color: ${border}; }

      /* Tables */
      .preview-content table { border-color: ${border}; }
      .preview-content th, .preview-content td { border-color: ${border} !important; color: ${fg}; }
      .preview-content th { background: ${tabHeaderBg} !important; color: ${heading}; }
      .preview-content tbody tr:nth-child(odd) td { background: ${altRowBg} !important; }
      .preview-content tbody tr:nth-child(even) td { background: ${bg} !important; }
      .preview-content tbody tr:last-child td { border-bottom-color: ${border}; }

      /* Hero */
      .preview-content .hero-component { background: linear-gradient(135deg, ${themeAccent} 0%, ${accentEnd} 100%); }

      /* Steps */
      .preview-content .step-item { background: ${bg} !important; border: 1px solid ${border} !important; border-radius: 8px; }
      .preview-content .step-title { color: ${heading}; }
      .preview-content .step-desc { color: ${fg}; }
      .preview-content .step-number { background: ${themeAccent}; }
      .preview-content .steps-component table { border: 1px solid ${border} !important; border-radius: 8px; overflow: hidden; }
      .preview-content .steps-component td, .preview-content .steps-component th { border: none !important; background: transparent !important; padding: 14px; }

      /* Timeline */
      .preview-content .timeline-component { border-color: ${border}; }
      .preview-content .timeline-item::before { background: ${themeAccent}; border-color: ${bg}; }
      .preview-content .timeline-item::after { background: ${border}; }
      .preview-content .timeline-title { color: ${heading}; }
      .preview-content .timeline-body { color: ${fg}; }

      /* Card */
      .preview-content .card-component { background: ${bg} !important; border-top-color: ${border} !important; border-right-color: ${border} !important; border-bottom-color: ${border} !important; border-left-color: ${border} !important; }

      /* Callout */
      .preview-content .callout-component { box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
      .preview-content .callout-info { background: ${dividerColor}; border-color: ${themeAccent}; }
      .preview-content .callout-warning { background: ${adjustColorBrightness("#451a03", 10)}; border-color: #fbbf24; }
      .preview-content .callout-error { background: ${adjustColorBrightness("#450a0a", 10)}; border-color: #f87171; }
      .preview-content .callout-success { background: ${adjustColorBrightness("#052e16", 10)}; border-color: #4ade80; }
      .preview-content .callout-title { color: ${heading}; }
      .preview-content .callout-content { color: ${calloutText}; }

      /* Columns */
      .preview-content .columns-table { border-color: ${border}; }
      .preview-content .columns-table td { background: ${bg} !important; border: 1px solid ${border} !important; }
      .preview-content .columns-table td:first-child { border-left: 1px solid ${themeAccent} !important; border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
      .preview-content .columns-table td:last-child { border-right: 1px solid ${border} !important; border-top-right-radius: 8px; border-bottom-right-radius: 8px; }
      .preview-content .columns-table td:hover { background: ${hoverBg} !important; }
  .preview-content .columns-flex .column-item { background: ${bg} !important; border: 1px solid ${border} !important; }
  .preview-content .columns-flex .column-item:hover { background: ${hoverBg} !important; }

      /* Tabs */
      .preview-content .tabs-component { background: ${bg} !important; border-top-color: ${border} !important; border-right-color: ${border} !important; border-bottom-color: ${border} !important; border-left-color: ${border} !important; }
      .preview-content .tab-list { background: ${tabHeaderBg} !important; border-color: ${border} !important; }
      .preview-content .tab-button { color: ${fg}; }
      .preview-content .tab-button:hover { background: ${hoverBg} !important; }
      .preview-content .tab-button.active { color: ${themeAccent}; border-bottom-color: ${themeAccent}; }
      .preview-content .tab-panel { color: ${fg}; }

      /* Accordion */
      .preview-content .accordion-item { background: ${bg} !important; border-top-color: ${border} !important; border-right-color: ${border} !important; border-bottom-color: ${border} !important; border-left-color: ${border} !important; }
      .preview-content .accordion-header { background: ${tabHeaderBg} !important; color: ${heading}; border-bottom: 1px solid ${border}; }
      .preview-content .accordion-content { background: ${bg} !important; color: ${fg}; border-top: 1px solid ${border}; }

      /* WeCom Tabs & Accordion */
      .preview-content .wecom-tab-section { background: ${bg} !important; border-color: ${border} !important; }
      .preview-content .wecom-tab-title { background: ${tabHeaderBg} !important; color: ${themeAccent}; border-bottom: 1px solid ${border}; }
      .preview-content .wecom-tab-content { color: ${fg}; }
      .preview-content .wecom-accordion-section { background: ${bg} !important; border-color: ${border} !important; }
      .preview-content .wecom-accordion-title { background: ${tabHeaderBg} !important; color: ${heading}; border-bottom: 1px solid ${border}; }
      .preview-content .wecom-accordion-content { background: ${bg} !important; color: ${fg}; }

      /* Images */
      .preview-content .local-image-wrapper { border-color: ${border}; }
      .preview-content .local-image-caption { background: ${tabHeaderBg}; color: ${fg}; }

      /* Lists */
      .preview-content ul, .preview-content ol { padding-left: 20px; }
      .preview-content li { margin-bottom: 4px; }
      .preview-content li:last-child { margin-bottom: 0; }
    `;
  }

  return styles;
}
