import { useEffect } from "react";
import { fileOps } from "@/lib/file-operations";

interface UseAutoSaveOptions {
  enabled: boolean;
  getContent: () => string;
  getTheme: () => string;
  projectName?: string;
  interval?: number;
}

export function useAutoSave({
  enabled,
  getContent,
  getTheme,
  projectName = "Auto-saved Project",
  interval = 30000,
}: UseAutoSaveOptions) {
  useEffect(() => {
    if (enabled) {
      fileOps.startAutoSave(
        getContent,
        getTheme,
        projectName,
        interval
      );
    } else {
      fileOps.stopAutoSave();
    }

    return () => fileOps.stopAutoSave();
  }, [enabled, getContent, getTheme, projectName, interval]);
}
