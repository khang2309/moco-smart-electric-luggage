import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({ subsets: ["latin", "vietnamese"], variable: "--font-quicksand" });
import { Providers } from "./providers";
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "MOCO - Smart Electric Luggage",
  description:
    "MOCO - Smart Electric Luggage, vali điện thông minh cho hành trình hiện đại.",
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
      <body className={quicksand.variable}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
