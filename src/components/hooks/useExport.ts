import { useCallback } from "react";
import {
  exportToMarkdown,
  exportToHTML,
  exportForWeChat,
  type AIImageExportState,
} from "@/lib/export";

interface UseExportOptions {
  aiImageStates: Record<string, AIImageExportState>;
}

export function useExport({ aiImageStates }: UseExportOptions) {
  const handleExportMarkdown = useCallback(
    (markdown: string, filename: string = "content.md") => {
      exportToMarkdown(markdown, filename);
    },
    []
  );

  const handleExportHTML = useCallback(
    (markdown: string, theme: string, filename: string = "document.html") => {
      exportToHTML(markdown, theme, aiImageStates, filename);
    },
    [aiImageStates]
  );

  const handleExportWeChat = useCallback(
    (markdown: string, theme: string) => {
      exportForWeChat(markdown, aiImageStates, theme);
    },
    [aiImageStates]
  );

  // PDF export is handled via PDFExportModal which needs DOM element reference
  // Use that component directly for PDF exports

  return {
    exportMarkdown: handleExportMarkdown,
    exportHTML: handleExportHTML,
    exportWeChat: handleExportWeChat,
  };
}
