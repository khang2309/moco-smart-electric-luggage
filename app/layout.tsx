import type { Metadata } from "next";
import "./globals.css";

import Header from "../components/Header";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MOCO - Smart Electric Luggage",
  description: "MOCO - Smart Electric Luggage, vali dien thong minh cho hanh trinh hien dai.",
  icons: {
    icon: "/assets/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
