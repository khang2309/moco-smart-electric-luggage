"use client";

import Link from "next/link";

import { useLanguage } from "../app/providers";

const footerCopy = {
  vi: {
    brand: "ELECTRIC SUITCASE",
    products: "Sản phẩm",
    productLinks: ["MOCO Go", "MOCO Air", "MOCO Clear", "Phụ kiện", "So sánh sản phẩm"],
    support: "Hỗ trợ",
    supportLinks: ["Đăng ký sản phẩm", "Bảo hành & sửa chữa", "Hướng dẫn sử dụng", "Kết nối MOCO App", "Câu hỏi thường gặp", "Liên hệ hỗ trợ"],
    policy: "Chính sách",
    policyLinks: ["Chính sách bảo hành", "Chính sách đổi trả", "Chính sách vận chuyển", "Chính sách thanh toán", "Chính sách bảo mật", "Điều khoản sử dụng"],
    newsletter: "Đăng ký nhận tin",
    newsletterText: "Nhận thông tin sản phẩm mới và ưu đãi từ MOCO",
    placeholder: "Nhập email của bạn",
    terms: "Điều khoản sử dụng",
    privacy: "Chính sách bảo mật",
  },
  en: {
    brand: "ELECTRIC SUITCASE",
    products: "Products",
    productLinks: ["MOCO Go", "MOCO Air", "MOCO Clear", "Accessories", "Compare products"],
    support: "Support",
    supportLinks: ["Register product", "Warranty & repair", "User guide", "Connect MOCO App", "FAQ", "Contact support"],
    policy: "Policy",
    policyLinks: ["Warranty policy", "Return policy", "Shipping policy", "Payment policy", "Privacy policy", "Terms of use"],
    newsletter: "Newsletter",
    newsletterText: "Get new product news and offers from MOCO",
    placeholder: "Enter your email",
    terms: "Terms of use",
    privacy: "Privacy policy",
  },
} as const;

export default function Footer() {
  const { language } = useLanguage();
  const copy = footerCopy[language];

  return (
    <footer className="site-footer global-footer">
      <div className="global-footer-main">
        <section className="global-footer-brand">
          <img src="/assets/logo.jpg" alt="MOCO" />
          <p>{copy.brand}</p>
          <div className="footer-socials" aria-label="Social links">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Instagram">◎</a>
            <a href="#" aria-label="TikTok">♪</a>
            <a href="#" aria-label="YouTube">▶</a>
          </div>
        </section>

        <section>
          <h2>{copy.products}</h2>
          {copy.productLinks.map((item, index) => (
            <Link href={index === 0 ? "/product/moco-go" : "/#product"} key={item}>
              {item}
            </Link>
          ))}
        </section>

        <section>
          <h2>{copy.support}</h2>
          {copy.supportLinks.map((item, index) => (
            <Link href={index === 0 ? "/register-product" : index === 5 ? "/#contact" : "/#support"} key={item}>
              {item}
            </Link>
          ))}
        </section>

        <section>
          <h2>{copy.policy}</h2>
          {copy.policyLinks.map((item) => (
            <Link href="/#faq" key={item}>
              {item}
            </Link>
          ))}
        </section>

        <section className="global-footer-newsletter">
          <h2>{copy.newsletter}</h2>
          <p>{copy.newsletterText}</p>
          <form>
            <input type="email" placeholder={copy.placeholder} aria-label={copy.placeholder} />
            <button type="submit" aria-label={copy.newsletter}>→</button>
          </form>
        </section>
      </div>

      <div className="global-footer-bottom">
        <span>© 2026 MOCO. All rights reserved.</span>
        <span>
          <Link href="/#faq">{copy.terms}</Link>
          <Link href="/#faq">{copy.privacy}</Link>
        </span>
      </div>
    </footer>
  );
}
