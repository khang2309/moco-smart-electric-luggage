"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../providers";

const copy = {
  vi: {
    title: "Trung tâm hỗ trợ MOCO",
    description: "Tìm hướng dẫn, bảo hành và hỗ trợ cho vali điện của bạn.",
    searchPlaceholder: "Tìm theo model, số serial hoặc từ khóa...",
    searchButton: "Tìm kiếm",
    modelHelp: "Không biết model của bạn ở đâu?",
    sectionTitle: "Bạn cần hỗ trợ gì?",
    tip: "Mẹo: Hãy chuẩn bị số serial hoặc tên model để được hỗ trợ nhanh hơn.",
    quickInfo: "Thông tin nhanh",
    supportTime: "Thời gian hỗ trợ: 8:00 - 21:00",
    hotline: "Hotline: 1900 6868",
    email: "Email hỗ trợ: mocoluggage@gmail.com",
    directTitle: "Cần hỗ trợ trực tiếp?",
    directDescription: "Đội ngũ MOCO sẵn sàng hỗ trợ bạn về bảo hành, app và kỹ thuật.",
    contactNow: "Liên hệ ngay",
    chat: "Chat với MOCO",
    cards: [
      ["Đăng ký sản phẩm", "Kích hoạt bảo hành cho vali MOCO.", "/register-product"],
      ["Bảo hành & sửa chữa", "Kiểm tra tình trạng và gửi yêu cầu hỗ trợ.", "/contact"],
      ["Hướng dẫn sử dụng", "Xem cách vận hành, sạc pin và an toàn khi dùng.", "/support/user-guide"],
      ["Thiết lập MOCO App", "Kết nối GPS, theo dõi pin và quản lý thiết bị.", "/contact"],
      ["Chính sách pin & hàng không", "Thông tin mang vali điện lên máy bay.", "/support/battery-airline-policy"],
      ["Câu hỏi thường gặp", "Giải đáp các thắc mắc phổ biến.", "/contact"],
    ],
  },
  en: {
    title: "MOCO Support Center",
    description: "Find guides, warranty information, and support for your electric luggage.",
    searchPlaceholder: "Search by model, serial number, or keyword...",
    searchButton: "Search",
    modelHelp: "Not sure where to find your model?",
    sectionTitle: "What do you need help with?",
    tip: "Tip: Have your serial number or model name ready so we can support you faster.",
    quickInfo: "Quick information",
    supportTime: "Support hours: 8:00 AM - 9:00 PM",
    hotline: "Hotline: 1900 6868",
    email: "Support email: mocoluggage@gmail.com",
    directTitle: "Need direct support?",
    directDescription: "The MOCO team is ready to help with warranty, app, and technical questions.",
    contactNow: "Contact now",
    chat: "Chat with MOCO",
    cards: [
      ["Register product", "Activate warranty for your MOCO luggage.", "/register-product"],
      ["Warranty & repair", "Check status and submit a support request.", "/contact"],
      ["User guide", "Learn how to operate, charge, and use MOCO safely.", "/support/user-guide"],
      ["Set up MOCO App", "Connect GPS, monitor battery, and manage your device.", "/contact"],
      ["Battery & airline policy", "Information about bringing electric luggage on flights.", "/support/battery-airline-policy"],
      ["FAQ", "Answers to common questions.", "/contact"],
    ],
  },
} as const;

export default function SupportPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const text = copy[language];
  const [query, setQuery] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return;

    if (
      normalizedQuery.includes("pin") ||
      normalizedQuery.includes("battery") ||
      normalizedQuery.includes("airline") ||
      normalizedQuery.includes("hàng không") ||
      normalizedQuery.includes("bay")
    ) {
      router.push("/support/battery-airline-policy");
      return;
    }

    if (
      normalizedQuery.includes("guide") ||
      normalizedQuery.includes("hướng dẫn") ||
      normalizedQuery.includes("sạc") ||
      normalizedQuery.includes("charge")
    ) {
      router.push("/support/user-guide");
      return;
    }

    if (
      normalizedQuery.includes("model") ||
      normalizedQuery.includes("serial") ||
      normalizedQuery.includes("moco")
    ) {
      router.push("/product");
      return;
    }

    router.push("/contact");
  }

  return (
    <main>
      <section className="support-center" id="support" aria-labelledby="support-title">
        <div className="support-hero">
          <div className="support-copy">
            <h1 id="support-title">{text.title}</h1>
            <p>{text.description}</p>
            <form className="support-search" role="search" onSubmit={handleSearch}>
              <span aria-hidden="true">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="m16.5 16.5 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                </svg>
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={text.searchPlaceholder}
                aria-label={text.searchPlaceholder}
              />
              <button type="submit">{text.searchButton}</button>
            </form>
            <Link className="support-model-link" href="/product">
              {text.modelHelp}
            </Link>
          </div>
        </div>

        <div className="support-layout">
          <div className="support-main" id="support-options">
            <h2>{text.sectionTitle}</h2>
            <div className="support-card-grid">
              {text.cards.map(([title, description, href]) => (
                <Link href={href} key={title}>
                  <span>
                    <strong>{title}</strong>
                    {description}
                  </span>
                </Link>
              ))}
            </div>
            <p className="support-tip">{text.tip}</p>
          </div>

          <aside className="support-side">
            <h2>{text.quickInfo}</h2>
            <p>{text.supportTime}</p>
            <p>{text.hotline}</p>
            <p>{text.email}</p>
            <div className="direct-support">
              <strong>{text.directTitle}</strong>
              <span>{text.directDescription}</span>
              <Link className="support-contact-button" href="/contact">
                {text.contactNow}
              </Link>
              <a className="support-chat-button" href="mailto:mocoluggage@gmail.com?subject=MOCO%20Support">
                {text.chat}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
