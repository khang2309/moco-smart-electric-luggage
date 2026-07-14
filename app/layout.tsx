import type { Metadata } from "next";
import "./globals.css";

import Footer from "../components/Footer";
import Header from "../components/Header";
import ToastContainer from "../components/ToastContainer";
import { Providers } from "./providers";

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
      <body>
        <Providers>
          <Header />
          {children}
          <Footer />
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
