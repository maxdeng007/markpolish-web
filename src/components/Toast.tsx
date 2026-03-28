import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type ToastType = "success" | "error" | "info";

interface Toast {
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: Toast | null;
  showToast: (message: string, type?: ToastType) => void;
  clearToast: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      setToast({ message, type });
    },
    [],
  );

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast, clearToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastContainer() {
  const { toast, clearToast } = useToast();
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (toast) {
      setIsShowing(true);
      setIsFadingOut(false);

      fadeTimerRef.current = setTimeout(() => {
        setIsFadingOut(true);
      }, 2500);

      fadeTimerRef.current = setTimeout(() => {
        setIsShowing(false);
        setIsFadingOut(false);
        clearToast();
      }, 2800);
    }

    return () => {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
      }
    };
  }, [toast, clearToast]);

  if (!isShowing) return null;

  return createPortal(
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[99999] transition-all duration-300 ease-out ${
        isFadingOut
          ? "opacity-0 translate-y-[-8px] scale-95"
          : "opacity-100 translate-y-0 scale-100"
      }`}
    >
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-md ${
          toast?.type === "success"
            ? "bg-green-500 text-white shadow-[0_8px_30px_rgba(34,197,94,0.4)]"
            : toast?.type === "error"
              ? "bg-red-500 text-white shadow-[0_8px_30px_rgba(239,68,68,0.4)]"
              : "bg-blue-500 text-white shadow-[0_8px_30px_rgba(59,130,246,0.4)]"
        }`}
      >
        {toast?.type === "success" && (
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
        {toast?.type === "error" && (
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        )}
        {toast?.type === "info" && (
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}
        <span className="text-sm font-medium">{toast?.message}</span>
      </div>
    </div>,
    document.body,
  );
}
