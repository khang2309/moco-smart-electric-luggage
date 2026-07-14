"use client";

import { useEffect, useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  useEffect(() => {
    if (window.localStorage.getItem("moco-language") === "en") setLanguage("en");
  }, []);
  const t = language === "vi" ? { title: "Đã xảy ra lỗi hệ thống!", retry: "Thử lại" } : { title: "A system error occurred.", retry: "Try again" };
  return (
    <html lang={language}>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold mb-4">{t.title}</h2>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            {t.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
