import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { en } from "@/locales/en";
import { zh } from "@/locales/zh";

export type Language = "en" | "zh";

const STORAGE_KEY = "markpolish-language";

const translations = { en, zh };

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

function getNestedValue(obj: any, path: string): string {
  const keys = path.split(".");
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return path;
    }
  }
  return typeof value === "string" ? value : path;
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "zh") {
        return saved;
      }
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      const currentTranslations = translations[language];
      let value = getNestedValue(currentTranslations, key);
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(new RegExp(`\\{${k}\\}`, "g"), v);
        });
      }
      return value;
    },
    [language],
  );

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "zh" : "en");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleLanguage}
      title={language === "en" ? "切换到中文" : "Switch to English"}
      className="text-base"
    >
      {language === "en" ? "🇬🇧" : "🇨🇳"}
    </Button>
  );
}
