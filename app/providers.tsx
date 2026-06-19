"use client";

import { createContext, useContext, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export type Language = "vi" | "en";

type LanguageContextValue = {
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage() {
  const value = useContext(LanguageContext);

  if (!value) {
    throw new Error("useLanguage must be used inside Providers");
  }

  return value;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 10,
          },
        },
      }),
  );
  const [language, setLanguage] = useState<Language>("vi");

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("moco-language");

    if (storedLanguage === "vi" || storedLanguage === "en") {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("moco-language", language);
  }, [language]);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageContext.Provider value={{ language, setLanguage }}>
        {children}
      </LanguageContext.Provider>
    </QueryClientProvider>
  );
}
