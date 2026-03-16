import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Loader2 } from "lucide-react";
import { exportToPDF } from "@/lib/export";
import { getTheme } from "@/lib/themes";
import { convertMarkdownWithComponents } from "@/lib/markdown-components";
import { getAllPreviewStyles } from "@/lib/preview-styles";

interface AIImageState {
  description: string;
  ratio: string;
  imageUrl: string | null;
  status: "idle" | "generating" | "done" | "error";
}

interface PDFExportModalProps {
  markdown: string;
  theme: string;
  aiImageStates: Record<string, AIImageState>;
  onClose: () => void;
}

export default function PDFExportModal({
  markdown,
  theme,
  aiImageStates: _aiImageStates,
  onClose,
}: PDFExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [previewRef, setPreviewRef] = useState<HTMLDivElement | null>(null);

  const currentTheme = getTheme(theme);
  const themeColors = {
    accent: currentTheme.styles.accent,
    foreground: currentTheme.styles.foreground,
    heading: currentTheme.styles.heading,
    link: currentTheme.styles.link,
    border: currentTheme.styles.border,
    code: currentTheme.styles.code,
    background: currentTheme.styles.background,
  };

  const processedMarkdown = convertMarkdownWithComponents(markdown, themeColors);
  const previewStyles = getAllPreviewStyles();

  const handleExport = async () => {
    if (!previewRef) return;

    setIsExporting(true);
    try {
      await exportToPDF(previewRef, "document.pdf");
      onClose();
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export PDF. Please try HTML export instead.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Export to PDF</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Preview your document before exporting to PDF.
        </p>

        {/* PDF Preview */}
        <div
          ref={setPreviewRef}
          className="border border-border rounded p-4 mb-4 max-h-96 overflow-auto bg-white"
          style={{ color: currentTheme.styles.foreground }}
        >
          <style>{previewStyles}</style>
          <div
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: processedMarkdown }}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
