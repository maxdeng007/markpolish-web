import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { X } from "lucide-react";

interface PreviewModalProps {
  open: boolean;
  original: string;
  preview: string;
  actionName: string;
  onApply: () => void;
  onCancel: () => void;
}

export default function PreviewModal({
  open,
  original,
  preview,
  actionName,
  onApply,
  onCancel,
}: PreviewModalProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      <div className="relative bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col m-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold">{t("ai.preview")}</h2>
            <p className="text-xs text-muted-foreground">{actionName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="flex flex-col">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                {t("ai.original")}
              </div>
              <pre className="flex-1 overflow-auto p-3 bg-muted/30 rounded border text-sm whitespace-pre-wrap">
                {original}
              </pre>
            </div>
            <div className="flex flex-col">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                {t("ai.previewResult")}
              </div>
              <pre className="flex-1 overflow-auto p-3 bg-muted/30 rounded border text-sm whitespace-pre-wrap">
                {preview}
              </pre>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button onClick={onApply}>{t("ai.apply")}</Button>
        </div>
      </div>
    </div>
  );
}
