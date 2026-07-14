"use client";

import { QueryProvider } from "./QueryProvider";
import { LanguageProvider } from "./LanguageProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </QueryProvider>
  );
}
