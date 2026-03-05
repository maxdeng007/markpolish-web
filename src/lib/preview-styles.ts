// Shared styles for preview and export
// This ensures exported HTML matches the preview exactly

export const standardMarkdownStyles = `
  /* ========================
     STANDARD MARKDOWN STYLES
     ======================== */
  .preview-content { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.75; }
  .preview-content h1 { font-size: 2.25em; font-weight: 800; margin: 1.5em 0 0.75em; letter-spacing: -0.02em; }
  .preview-content h2 { font-size: 1.75em; font-weight: 700; margin: 1.5em 0 0.5em; letter-spacing: -0.01em; }
  .preview-content h3 { font-size: 1.375em; font-weight: 600; margin: 1.25em 0 0.5em; }
  .preview-content h4 { font-size: 1.125em; font-weight: 600; margin: 1em 0 0.375em; }
  .preview-content p { margin: 1em 0; line-height: 1.8; }
  
  /* List Styles - Enhanced */
  .preview-content ul, .preview-content ol { 
    margin: 1.25em 0; 
    padding-left: 0; 
    list-style: none;
  }
  .preview-content ul { 
    counter-reset: ul-item;
  }
  .preview-content ol { 
    counter-reset: ol-item;
  }
  .preview-content li { 
    position: relative;
    margin: 0.75em 0;
    padding-left: 2em;
    line-height: 1.7;
  }
  
  /* Unordered list markers - gradient bullets */
  .preview-content ul > li::before {
    content: '';
    position: absolute;
    left: 0.5em;
    top: 0.6em;
    width: 8px;
    height: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
  }
  
  /* Nested unordered list - different markers */
  .preview-content ul ul > li::before {
    width: 6px;
    height: 6px;
    background: transparent;
    border: 2px solid #667eea;
    box-shadow: none;
  }
  .preview-content ul ul ul > li::before {
    width: 0;
    height: 0;
    border: none;
    background: transparent;
    box-shadow: none;
  }
  .preview-content ul ul ul > li::after {
    content: '◆';
    position: absolute;
    left: 0.4em;
    top: 0.35em;
    font-size: 10px;
    color: #667eea;
  }
  
  /* Ordered list markers - styled numbers */
  .preview-content ol > li {
    counter-increment: ol-item;
  }
  .preview-content ol > li::before {
    content: counter(ol-item);
    position: absolute;
    left: 0;
    top: 0;
    width: 1.75em;
    height: 1.75em;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    color: white;
    font-weight: 700;
    font-size: 0.8em;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.35);
    line-height: 1;
  }
  
  /* Nested ordered lists */
  .preview-content ol ol > li::before {
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;
    box-shadow: none;
    width: 1.5em;
    height: 1.5em;
    font-size: 0.75em;
  }
  .preview-content ol ol ol > li::before {
    border-radius: 4px;
  }
  
  /* List paragraph spacing */
  .preview-content li p {
    margin: 0.25em 0;
  }
  .preview-content li p:first-child {
    margin-top: 0;
  }
  .preview-content li p:last-child {
    margin-bottom: 0;
  }
  
  .preview-content a { color: #667eea; text-decoration: none; border-bottom: 1px solid transparent; transition: all 0.2s; }
  .preview-content a:hover { border-bottom-color: #667eea; }
  .preview-content strong { font-weight: 700; color: #1a1a2e; }
  .preview-content em { font-style: italic; }
  
  /* Inline Code - subtle gradient background */
  .preview-content code { 
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%); 
    padding: 0.2em 0.5em; 
    border-radius: 6px; 
    font-size: 0.875em; 
    color: #764ba2; 
    font-family: 'SF Mono', Monaco, 'Consolas', monospace; 
  }
  
  /* Code Blocks - dark gradient with syntax highlighting */
  .preview-content pre { 
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
    padding: 1.25em 1.5em; 
    border-radius: 12px; 
    overflow-x: auto; 
    margin: 1.5em 0;
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  }
  .preview-content pre code { 
    background: none; 
    padding: 0; 
    color: #e4e8ec; 
    font-size: 0.875em; 
    font-family: 'SF Mono', Monaco, 'Consolas', monospace;
    line-height: 1.6;
  }
  
  /* Blockquotes - styled with left border */
  .preview-content blockquote {
    margin: 1.5em 0;
    padding: 1em 1.25em;
    border-left: 4px solid #667eea;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 0 8px 8px 0;
    color: #4a5568;
    font-style: italic;
  }
  .preview-content blockquote p {
    margin: 0;
    line-height: 1.7;
  }
  .preview-content blockquote p + p {
    margin-top: 0.75em;
  }
  
  /* Horizontal Rule */
  .preview-content hr {
    border: none;
    height: 2px;
    background: linear-gradient(90deg, transparent, #cbd5e1, transparent);
    margin: 2em 0;
  }
  
  /* Tables */
  .preview-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5em 0;
    font-size: 0.95em;
  }
  .preview-content th,
  .preview-content td {
    padding: 0.75em 1em;
    border: 1px solid #e2e8f0;
    text-align: left;
  }
  .preview-content th {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    font-weight: 600;
    color: #1a1a2e;
  }
  .preview-content tr:hover {
    background: #f8fafc;
  }
  
  /* Code Syntax Highlighting - High Contrast */
  .preview-content .hljs-keyword,
  .preview-content .hljs-selector-tag,
  .preview-content .hljs-built_in { color: #ff7b72; font-weight: 600; }
  .preview-content .hljs-type,
  .preview-content .hljs-title,
  .preview-content .hljs-title.class_,
  .preview-content .hljs-title.function_ { color: #79c0ff; font-weight: 600; }
  .preview-content .hljs-string,
  .preview-content .hljs-attr,
  .preview-content .hljs-template-variable,
  .preview-content .hljs-meta-string { color: #a5d6ff; }
  .preview-content .hljs-number,
  .preview-content .hljs-literal { color: #ffab70; }
  .preview-content .hljs-variable,
  .preview-content .hljs-variable-language,
  .preview-content .hljs-params { color: #ffa657; }
`;

export const aiImageStyles = `
  /* ========================
     AI IMAGE STYLES
     ======================== */
  .ai-image-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 24px; border: 2px solid #e2e8f0; border-radius: 16px; margin: 32px 0; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); min-height: 200px; transition: all 0.3s ease; }
  .ai-image-placeholder:hover { border-color: #cbd5e1; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); }
  .ai-image-icon { font-size: 56px; margin-bottom: 16px; filter: grayscale(20%); }
  .ai-image-ratio-selector { display: flex; gap: 8px; margin-bottom: 20px; }
  .ai-image-ratio-btn { padding: 8px 16px; border: 2px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; font-size: 13px; font-weight: 600; color: #64748b; transition: all 0.2s ease; }
  .ai-image-ratio-btn:hover { border-color: #667eea; color: #667eea; }
  .ai-image-ratio-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-color: transparent; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
  .ai-image-generate-btn { padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 600; letter-spacing: 0.02em; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.35); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .ai-image-generate-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(102, 126, 234, 0.45); }
  .ai-image-generate-btn:disabled { background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%); cursor: not-allowed; box-shadow: none; transform: none; }
  .ai-image-status { margin-top: 16px; font-size: 13px; color: #94a3b8; font-weight: 500; }
  .ai-image-wrapper { position: relative; display: block; margin: 32px 0; width: 100%; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.12); background: transparent; }
  .ai-image-wrapper img { position: absolute; top: 50%; left: 50%; width: 100%; height: 100%; display: block; object-fit: cover; object-position: center; transform: translate(-50%, -50%) scale(1.12); transition: transform 0.5s ease; }
  .ai-image-wrapper:hover img { transform: translate(-50%, -50%) scale(1.16); }
  .ai-image-wrapper.aspect-square { aspect-ratio: 1/1; }
  .ai-image-wrapper.aspect-video { aspect-ratio: 16/9; }
  .ai-image-wrapper.aspect-9-16 { aspect-ratio: 9/16; }
  .ai-image-wrapper.aspect-4-3 { aspect-ratio: 4/3; }
  .ai-image-wrapper.aspect-3-4 { aspect-ratio: 3/4; }
  .ai-image-overlay { position: absolute; bottom: 16px; right: 16px; display: flex; gap: 10px; opacity: 0; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); transform: translateY(10px); }
  .ai-image-wrapper:hover .ai-image-overlay { opacity: 1; transform: translateY(0); }
  .ai-image-action-btn { width: 44px; height: 44px; border: none; border-radius: 50%; background: rgba(255,255,255,0.98); color: #1e293b; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(0,0,0,0.15); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .ai-image-action-btn:hover { transform: scale(1.15) rotate(5deg); background: white; }
  
  /* AI Image Export - static image without interactive elements */
  .ai-image-export { display: block; margin: 32px 0; width: 100%; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.12); }
  .ai-image-export img { width: 100%; display: block; object-fit: cover; }
  .ai-image-export.aspect-square { aspect-ratio: 1/1; }
  .ai-image-export.aspect-video { aspect-ratio: 16/9; }
  .ai-image-export.aspect-9-16 { aspect-ratio: 9/16; }
  .ai-image-export.aspect-4-3 { aspect-ratio: 4/3; }
  .ai-image-export.aspect-3-4 { aspect-ratio: 3/4; }
`;

export const componentStyles = `
  /* ========================
     COMPONENT STYLES
     ======================== */
  
  /* Hero Component */
  .preview-content .hero-component { 
    padding: 60px 48px; 
    border-radius: 24px; 
    text-align: center; 
    margin: 32px 0; 
    position: relative;
    overflow: hidden;
    background: var(--hero-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
    box-shadow: 
      0 20px 60px rgba(0,0,0,0.15),
      0 0 0 1px rgba(255,255,255,0.1) inset;
  }
  .preview-content .hero-component::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.6;
  }
  .preview-content .hero-component::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%);
    animation: heroGlow 8s ease-in-out infinite;
  }
  @keyframes heroGlow {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
  .preview-content .hero-component {
    position: relative;
    z-index: 1;
    color: white;
  }
  .preview-content .hero-component *,
  .preview-content .hero-component *::before,
  .preview-content .hero-component *::after {
    color: white !important;
  }
  .preview-content .hero-component h1,
  .preview-content .hero-component h2,
  .preview-content .hero-component h3,
  .preview-content .hero-component h4,
  .preview-content .hero-component h5,
  .preview-content .hero-component h6,
  .preview-content .hero-component p,
  .preview-content .hero-component span,
  .preview-content .hero-component strong,
  .preview-content .hero-component em,
  .preview-content .hero-component div,
  .preview-content .hero-component li,
  .preview-content .hero-component a {
    color: white !important;
    position: relative;
    z-index: 1;
  }
  .preview-content .hero-component h1 { 
    margin: 0 0 20px !important; 
    font-size: 42px !important; 
    font-weight: 800; 
    letter-spacing: -0.02em;
    text-shadow: 0 4px 20px rgba(0,0,0,0.25);
    line-height: 1.2;
  }
  .preview-content .hero-component p { 
    margin: 0 !important; 
    font-size: 20px !important; 
    opacity: 0.95;
    font-weight: 400;
    line-height: 1.6;
    max-width: 700px;
    margin-left: auto !important;
    margin-right: auto !important;
  }

  .columns-component { display: flex; gap: 24px; margin: 24px 0; }
  .columns-component.col-2 { flex-direction: row; }
  .columns-component.col-3 { flex-direction: row; }
  .columns-component.col-4 { flex-direction: row; flex-wrap: wrap; }
  .column-item { flex: 1; min-width: 200px; padding: 16px; border: 1px solid #e5e5e5; border-radius: 8px; }
  
  /* Steps Component */
  .steps-component { margin: 24px 0; padding-left: 0; list-style: none; }
  .step-item { display: flex; gap: 16px; margin-bottom: 20px; padding: 16px; border: 1px solid #e5e5e5; border-radius: 8px; background: #fafafa; }
  .step-number { width: 32px; height: 32px; min-width: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; }
  .step-content { flex: 1; }
  .step-title { font-weight: 600; margin-bottom: 4px; }
  .step-description { font-size: 14px; color: #666; }
  
  /* Timeline Component */
  .timeline-component { margin: 24px 0; padding-left: 20px; border-left: 2px solid #e5e5e5; }
  .timeline-item { position: relative; padding-left: 20px; margin-bottom: 24px; }
  .timeline-item::before { content: ''; position: absolute; left: -26px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: #4a90d9; }
  .timeline-title { font-weight: 600; margin-bottom: 4px; }
  .timeline-body { font-size: 14px; color: #666; }
  
  /* Card Component */
  .card-component { padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px; margin: 16px 0; background: #fafafa; }
  .card-component p { margin: 0 !important; }
  
  /* Video Component */
  .video-component { margin: 16px 0; }
  .video-player { width: 100%; max-width: 100%; border-radius: 8px; }
  .video-caption { text-align: center; font-size: 14px; color: #666; margin-top: 8px; }
  
  /* Local Image */
  .local-image-wrapper { margin: 16px 0; }
  .local-image { width: 100%; border-radius: 8px; }
  .local-image-caption { text-align: center; font-size: 14px; color: #666; margin-top: 8px; }
  
  /* Callout Component - Enhanced styling */
  .callout-component { 
    padding: 16px 20px; 
    border-radius: 12px; 
    margin: 20px 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .callout-component.callout-info { 
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); 
    border-left: 4px solid #2196f3;
  }
  .callout-component.callout-warning { 
    background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%); 
    border-left: 4px solid #f59e0b;
  }
  .callout-component.callout-error { 
    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); 
    border-left: 4px solid #ef4444;
  }
  .callout-component.callout-success { 
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); 
    border-left: 4px solid #4caf50;
  }
  .callout-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .callout-icon { font-size: 20px; line-height: 1; }
  .callout-title { font-weight: 600; font-size: 15px; }
  .callout-content { font-size: 14px; line-height: 1.6; }
  .callout-content p { margin: 0.5em 0; }
  .callout-content p:first-child { margin-top: 0; }
  .callout-content p:last-child { margin-bottom: 0; }
  /* Quote Component - Enhanced styling */
  .quote-component { 
    padding: 20px 24px; 
    margin: 20px 0; 
    border-left: 4px solid #4a90d9; 
    background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%); 
    border-radius: 0 12px 12px 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .quote-content { font-style: italic; font-size: 16px; line-height: 1.7; color: #333; }
  .quote-content p { margin: 0; }
  .quote-attribution { margin-top: 14px; font-size: 14px; color: #666; }
  .quote-author { font-weight: 600; color: #4a90d9; }
  .quote-source { color: #888; }
  /* Tabs Component */
  .tabs-component { margin: 16px 0; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; }
  .tab-item { border-bottom: 1px solid #e5e5e5; }
  .tab-item:last-child { border-bottom: none; }
  .tab-title { padding: 12px 16px; cursor: pointer; font-weight: 500; background: #fafafa; }
  .tab-title:hover { background: #f0f0f0; }
  .tab-content { padding: 16px; display: none; }
  .tab-item.active .tab-content { display: block; }
  
  /* Accordion Component */
  .accordion-component { margin: 16px 0; }
  .accordion-item { border: 1px solid #e5e5e5; border-radius: 8px; margin-bottom: 8px; overflow: hidden; }
  .accordion-title { padding: 12px 16px; cursor: pointer; font-weight: 500; background: #fafafa; }
  .accordion-title:hover { background: #f0f0f0; }
  .accordion-content { padding: 16px; }
`;

export const darkThemeOverrides = `
  /* ========================
     DARK THEME OVERRIDES
     ======================== */
  .theme-dark .preview-content strong { color: #f0f0f0; }
  .theme-dark .preview-content code { background: rgba(255,255,255,0.1); color: #e0e0e0; }
  .theme-dark .preview-content pre { background: rgba(0,0,0,0.4); }
  .theme-dark .preview-content pre code { color: #e0e0e0; }
  
  /* Dark AI Image Styles */
  .theme-dark .ai-image-placeholder { border-color: rgba(255,255,255,0.15); background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.08) 100%); }
  .theme-dark .ai-image-placeholder:hover { border-color: rgba(255,255,255,0.25); background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.12) 100%); }
  .theme-dark .ai-image-ratio-btn { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.08); color: #a0a0a0; }
  .theme-dark .ai-image-ratio-btn:hover { border-color: #a78bfa; color: #c4b5fd; }
  .theme-dark .ai-image-generate-btn:disabled { background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.15) 100%); }
  .theme-dark .ai-image-status { color: #707070; }
  .theme-dark .ai-image-wrapper { box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
  .theme-dark .ai-image-action-btn { background: rgba(30,30,30,0.95); color: #e0e0e0; }
  .theme-dark .ai-image-action-btn:hover { background: rgba(40,40,40,1); }
  .theme-dark .ai-image-export { box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
  
  /* Dark Columns */
  .theme-dark .column-item { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); }
  
  /* Dark Steps */
  .theme-dark .step-item { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); }
  .theme-dark .step-description { color: #a0a0a0; }
  
  /* Dark Timeline */
  .theme-dark .timeline-component { border-left-color: rgba(255,255,255,0.2); }
  .theme-dark .timeline-item::before { background: #a78bfa; }
  .theme-dark .timeline-body { color: #a0a0a0; }
  
  /* Dark Card */
  .theme-dark .card-component { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); }
  
  /* Dark Video & Image Captions */
  .theme-dark .video-caption { color: #a0a0a0; }
  .theme-dark .local-image-caption { color: #a0a0a0; }
  
  /* Dark Callout - darker backgrounds with proper contrast */
  .theme-dark .callout-component.callout-info { background: rgba(33, 150, 243, 0.15); border-left-color: #64b5f6; }
  .theme-dark .callout-component.callout-warning { background: rgba(255, 152, 0, 0.15); border-left-color: #ffb74d; }
  .theme-dark .callout-component.callout-error { background: rgba(244, 67, 54, 0.15); border-left-color: #ef5350; }
  .theme-dark .callout-component.callout-success { background: rgba(76, 175, 80, 0.15); border-left-color: #81c784; }
  .theme-dark .callout-content { color: #d0d0d0; }
  
  /* Dark Quote */
  .theme-dark .quote-component { background: rgba(255,255,255,0.03); border-left-color: #a78bfa; }
  .theme-dark .quote-attribution { color: #a0a0a0; }
  
  /* Dark Tabs */
  .theme-dark .tabs-component { border-color: rgba(255,255,255,0.12); }
  .theme-dark .tab-item { border-bottom-color: rgba(255,255,255,0.08); }
  .theme-dark .tab-title { background: rgba(255,255,255,0.03); }
  .theme-dark .tab-title:hover { background: rgba(255,255,255,0.08); }
  
  /* Dark Accordion */
  .theme-dark .accordion-item { border-color: rgba(255,255,255,0.12); }
  .theme-dark .accordion-title { background: rgba(255,255,255,0.03); }
  .theme-dark .accordion-title:hover { background: rgba(255,255,255,0.08); }
  
  /* Dark Blockquote Styles */
  .theme-dark .preview-content blockquote {
    background: rgba(255,255,255,0.03);
    border-left-color: #a78bfa;
    color: #c4b5fd;
  }
  .theme-dark .preview-content blockquote p {
    color: #c4b5fd;
  }
  
  /* Dark Table Styles */
  .theme-dark .preview-content th,
  .theme-dark .preview-content td {
    border-color: rgba(255,255,255,0.12);
  }
  .theme-dark .preview-content th {
    background: rgba(255,255,255,0.05);
    color: #e0e0e0;
  }
  .theme-dark .preview-content tr:hover {
    background: rgba(255,255,255,0.03);
  }
  
  /* Dark List Styles */
  
  /* Dark List Styles */
  .theme-dark .preview-content ul > li::before {
    background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
    box-shadow: 0 2px 4px rgba(167, 139, 250, 0.3);
  }
  .theme-dark .preview-content ul ul > li::before {
    background: transparent;
    border-color: #a78bfa;
  }
  .theme-dark .preview-content ul ul ul > li::after {
    color: #a78bfa;
  }
  .theme-dark .preview-content ol > li::before {
    background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
    box-shadow: 0 2px 8px rgba(167, 139, 250, 0.35);
  }
  .theme-dark .preview-content ol ol > li::before {
    background: transparent;
    color: #a78bfa;
    border-color: #a78bfa;
  }
`;

// Get all styles combined
export function getAllPreviewStyles(): string {
  return (
    standardMarkdownStyles +
    aiImageStyles +
    componentStyles +
    darkThemeOverrides
  );
}

// Get styles for export (without interactive AI image elements)
export function getExportStyles(isDark: boolean): string {
  const styles = standardMarkdownStyles + aiImageStyles + componentStyles;
  if (isDark) {
    return styles + darkThemeOverrides;
  }
  return styles;
}
