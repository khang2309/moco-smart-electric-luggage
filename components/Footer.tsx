"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useLanguage } from "../app/providers";

const footerCopy = {
  vi: {
    brand: "VALI ĐIỆN THÔNG MINH",
    products: "Sản phẩm",
    productLinks: ["MOCO Go", "MOCO Plus", "MOCO Pro", "MOCO Max", "So sánh sản phẩm"],
    support: "Hỗ trợ",
    supportLinks: ["Đăng ký sản phẩm", "Bảo hành & sửa chữa", "Hướng dẫn sử dụng", "Kết nối MOCO App", "Câu hỏi thường gặp", "Liên hệ hỗ trợ"],
    policy: "Chính sách",
    policyLinks: ["Chính sách bảo hành", "Chính sách đổi trả", "Chính sách vận chuyển", "Chính sách thanh toán", "Chính sách bảo mật", "Điều khoản sử dụng"],
    newsletter: "Đăng ký nhận tin",
    newsletterText: "Nhận thông tin sản phẩm mới và ưu đãi từ MOCO",
    placeholder: "Nhập email của bạn",
    terms: "Điều khoản sử dụng",
    privacy: "Chính sách bảo mật",
    success: "Đăng ký thành công. Email xác nhận đã được gửi đến bạn.",
    error: "Chưa thể gửi email xác nhận. Vui lòng thử lại.",
  },
  en: {
    brand: "SMART ELECTRIC LUGGAGE",
    products: "Products",
    productLinks: ["MOCO Go", "MOCO Plus", "MOCO Pro", "MOCO Max", "Compare products"],
    support: "Support",
    supportLinks: ["Register product", "Warranty & repair", "User guide", "Connect MOCO App", "FAQ", "Contact support"],
    policy: "Policy",
    policyLinks: ["Warranty policy", "Return policy", "Shipping policy", "Payment policy", "Privacy policy", "Terms of use"],
    newsletter: "Newsletter",
    newsletterText: "Get new product updates and offers from MOCO",
    placeholder: "Enter your email",
    terms: "Terms of use",
    privacy: "Privacy policy",
    success: "Subscribed successfully. A confirmation email has been sent.",
    error: "Could not send the confirmation email. Please try again.",
  },
} as const;

const productLinks = [
  "/product/moco-go",
  "/product/moco-plus",
  "/product/moco-pro",
  "/product/moco-max",
  "/product",
] as const;

const supportLinks = [
  "/register-product",
  "/contact",
  "/support/user-guide",
  "/contact",
  "/contact",
  "/contact",
] as const;

export default function Footer() {
  const { language } = useLanguage();
  const copy = footerCopy[language];
  const [newsletterState, setNewsletterState] = useState<{
    pending: boolean;
    message: string;
    type: "success" | "error" | "";
  }>({ pending: false, message: "", type: "" });

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();

    setNewsletterState({ pending: true, message: "", type: "" });

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "newsletter" }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) throw new Error(data.error || copy.error);

      setNewsletterState({ pending: false, message: copy.success, type: "success" });
      form.reset();
    } catch {
      setNewsletterState({ pending: false, message: copy.error, type: "error" });
    }
  };

  return (
    <footer className="site-footer global-footer">
      <div className="global-footer-main">
        <section className="global-footer-brand">
          <img src="/assets/logo.jpg" alt="MOCO" />
          <p>{copy.brand}</p>
          <div className="footer-socials" aria-label="Social links">
            <a href="https://web.facebook.com/profile.php?id=61590722004834" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.3l.7-3h-3V9c0-.6.4-1 1-1Z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="https://www.tiktok.com/@mocosmartluggage?_r=1&_t=ZS-97TjyrxkE30" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M15 3c.4 2.7 2 4.4 5 4.8V11c-1.8 0-3.5-.5-5-1.5V16a5 5 0 1 1-5-5c.3 0 .7 0 1 .1v3.2a2 2 0 1 0 1 1.7V3h3Z" />
              </svg>
            </a>
            <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.5 12a31 31 0 0 0 .5 3.8 3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-3.8 31 31 0 0 0-.5-3.8ZM10 15.2V8.8l5.5 3.2L10 15.2Z" />
              </svg>
            </a>
          </div>
        </section>

        <section>
          <h2>{copy.products}</h2>
          {copy.productLinks.map((item, index) => (
            <Link href={productLinks[index]} key={item}>
              {item}
            </Link>
          ))}
        </section>

        <section>
          <h2>{copy.support}</h2>
          {copy.supportLinks.map((item, index) => (
            <Link href={supportLinks[index]} key={item}>
              {item}
            </Link>
          ))}
        </section>

        <section>
          <h2>{copy.policy}</h2>
          {copy.policyLinks.map((item) => (
            <Link href="/contact" key={item}>
              {item}
            </Link>
          ))}
        </section>

        <section className="global-footer-newsletter">
          <h2>{copy.newsletter}</h2>
          <p>{copy.newsletterText}</p>
          <form onSubmit={handleNewsletterSubmit}>
            <input type="email" name="email" placeholder={copy.placeholder} aria-label={copy.placeholder} required />
            <button type="submit" aria-label={copy.newsletter} disabled={newsletterState.pending}>
              {newsletterState.pending ? "..." : "→"}
            </button>
          </form>
          {newsletterState.message && (
            <p className={`newsletter-note ${newsletterState.type}`} aria-live="polite">
              <span aria-hidden="true">{newsletterState.type === "success" ? "✓" : "!"}</span>
              {newsletterState.message}
            </p>
          )}
        </section>
      </div>

      <div className="global-footer-bottom">
        <span>© 2026 MOCO. All rights reserved.</span>
        <span>
          <Link href="/contact">{copy.terms}</Link>
          <Link href="/contact">{copy.privacy}</Link>
        </span>
      </div>
    </footer>
  );
}
