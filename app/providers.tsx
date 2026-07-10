"use client";

import { QueryProvider } from "./QueryProvider";
import { LanguageProvider, useLanguage, type Language } from "./LanguageProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </QueryProvider>
  );
}

export { useLanguage, type Language };
