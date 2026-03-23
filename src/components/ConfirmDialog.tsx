import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "info",
}: ConfirmDialogProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!visible && !open) return null;

  const variantStyles = {
    danger: {
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-500",
      confirmBtn: "bg-red-500 hover:bg-red-600 text-white",
    },
    warning: {
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-500",
      confirmBtn: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    info: {
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-500",
      confirmBtn: "bg-primary hover:bg-primary/90 text-primary-foreground",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-200 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={`relative bg-background rounded-xl shadow-2xl border border-border w-full max-w-sm transform transition-all duration-200 ${
          open ? "scale-100 translate-y-0" : "scale-95 translate-y-2"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`shrink-0 ${styles.iconBg} ${styles.iconColor} p-2.5 rounded-full`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="text-base font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 bg-muted/30 border-t border-border rounded-b-xl">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted hover:border-muted-foreground/30 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${styles.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
