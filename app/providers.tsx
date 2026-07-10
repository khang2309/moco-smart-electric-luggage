"use client";

import { QueryProvider } from "./QueryProvider";
import { LanguageProvider, useLanguage, type Language } from "./LanguageProvider";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <LanguageProvider>
        {children}
        <Toaster position="bottom-right" />
      </LanguageProvider>
    </QueryProvider>
  );
}

export { useLanguage, type Language };
