import { useCallback, useEffect, useRef } from "react";

const MAX_HISTORY = 20;
const STORAGE_KEY = "markpolish-history";

interface HistoryState {
  content: string;
  timestamp: number;
}

export function useHistory(initialContent: string) {
  const historyRef = useRef<HistoryState[]>([
    { content: initialContent, timestamp: Date.now() },
  ]);
  const pointerRef = useRef(0);

  const saveToStorage = useCallback((history: HistoryState[]) => {
    try {
      const data = JSON.stringify(history.slice(0, MAX_HISTORY));
      if (data.length < 5 * 1024 * 1024) {
        localStorage.setItem(STORAGE_KEY, data);
      }
    } catch {
      // Storage full, clear oldest entries
      const trimmed = historyRef.current.slice(-Math.floor(MAX_HISTORY / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
  }, []);

  const loadFromStorage = useCallback(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const history = JSON.parse(data) as HistoryState[];
        if (history.length > 0) {
          historyRef.current = history;
          pointerRef.current = history.length - 1;
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const push = useCallback(
    (content: string) => {
      const current = historyRef.current[pointerRef.current];
      if (current?.content === content) return;

      const newHistory = historyRef.current.slice(0, pointerRef.current + 1);
      newHistory.push({ content, timestamp: Date.now() });

      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }

      historyRef.current = newHistory;
      pointerRef.current = newHistory.length - 1;
      saveToStorage(newHistory);
    },
    [saveToStorage],
  );

  const undo = useCallback(
    (currentContent: string, setContent: (c: string) => void): boolean => {
      if (pointerRef.current <= 0) return false;

      historyRef.current[pointerRef.current] = {
        content: currentContent,
        timestamp: Date.now(),
      };

      pointerRef.current--;
      const prev = historyRef.current[pointerRef.current];
      setContent(prev.content);
      saveToStorage(historyRef.current);
      return true;
    },
    [saveToStorage],
  );

  const redo = useCallback(
    (setContent: (c: string) => void): boolean => {
      if (pointerRef.current >= historyRef.current.length - 1) return false;

      pointerRef.current++;
      const next = historyRef.current[pointerRef.current];
      setContent(next.content);
      saveToStorage(historyRef.current);
      return true;
    },
    [saveToStorage],
  );

  const canUndo = useCallback((currentContent: string): boolean => {
    const current = historyRef.current[pointerRef.current];
    return (
      pointerRef.current > 0 || (current && current.content !== currentContent)
    );
  }, []);

  const canRedo = useCallback((): boolean => {
    return pointerRef.current < historyRef.current.length - 1;
  }, []);

  const clear = useCallback(() => {
    historyRef.current = [];
    pointerRef.current = 0;
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    push,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    pointer: pointerRef.current,
    total: historyRef.current.length,
  };
}
