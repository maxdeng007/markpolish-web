import { useEffect, useRef, useCallback } from "react";

export function useEditorScrollSync(
  editorContainerRef: React.RefObject<HTMLElement | null>,
  previewContainerRef: React.RefObject<HTMLElement | null>,
  options: { enabled: boolean },
) {
  const { enabled } = options;
  const isScrollingRef = useRef<"editor" | "preview" | null>(null);

  const syncEditorToPreview = useCallback(() => {
    if (!enabled) return;

    const editorContainer = editorContainerRef.current;
    const previewContainer = previewContainerRef.current;

    if (!editorContainer || !previewContainer) return;
    if (isScrollingRef.current === "preview") return;

    const textarea = editorContainer.querySelector(
      "textarea",
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const editorScrollHeight = textarea.scrollHeight - textarea.clientHeight;
    const previewScrollHeight =
      previewContainer.scrollHeight - previewContainer.clientHeight;

    if (editorScrollHeight <= 0 || previewScrollHeight <= 0) return;

    const scrollPercentage = textarea.scrollTop / editorScrollHeight;
    previewContainer.scrollTop = scrollPercentage * previewScrollHeight;
  }, [enabled, editorContainerRef, previewContainerRef]);

  const syncPreviewToEditor = useCallback(() => {
    if (!enabled) return;

    const editorContainer = editorContainerRef.current;
    const previewContainer = previewContainerRef.current;

    if (!editorContainer || !previewContainer) return;
    if (isScrollingRef.current === "editor") return;

    const textarea = editorContainer.querySelector(
      "textarea",
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const editorScrollHeight = textarea.scrollHeight - textarea.clientHeight;
    const previewScrollHeight =
      previewContainer.scrollHeight - previewContainer.clientHeight;

    if (previewScrollHeight <= 0 || editorScrollHeight <= 0) return;

    const scrollPercentage = previewContainer.scrollTop / previewScrollHeight;
    textarea.scrollTop = scrollPercentage * editorScrollHeight;
  }, [enabled, editorContainerRef, previewContainerRef]);

  useEffect(() => {
    const editorContainer = editorContainerRef.current;
    const previewContainer = previewContainerRef.current;

    if (!editorContainer || !previewContainer) return;

    const textarea = editorContainer.querySelector(
      "textarea",
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    textarea.addEventListener("scroll", syncEditorToPreview);
    previewContainer.addEventListener("scroll", syncPreviewToEditor);

    return () => {
      textarea.removeEventListener("scroll", syncEditorToPreview);
      previewContainer.removeEventListener("scroll", syncPreviewToEditor);
    };
  }, [
    syncEditorToPreview,
    syncPreviewToEditor,
    editorContainerRef,
    previewContainerRef,
  ]);
}
