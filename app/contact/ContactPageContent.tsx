"use client";

import { useLanguage } from "../providers";
import ContactForm from "./ContactForm";

const copy = {
  vi: {
    kicker: "Contact",
    titleLines: ["Đăng ký", "tư vấn MOCO"],
    descriptionLines: [
      "Để lại thông tin, đội ngũ MOCO sẽ phản hồi về sản phẩm,",
      "bảo hành, hợp tác hoặc các chương trình trải nghiệm sớm.",
    ],
    location: "Can Tho, Vietnam",
  },
  en: {
    kicker: "Contact",
    titleLines: ["Book a MOCO", "consultation"],
    descriptionLines: [
      "Leave your details and the MOCO team will follow up about products,",
      "warranty, partnerships, or early experience programs.",
    ],
    location: "Can Tho, Vietnam",
  },
} as const;

export default function ContactPageContent() {
  const { language } = useLanguage();
  const currentCopy = copy[language];

  return (
    <section className="moco-contact-page">
      <div className="moco-contact-copy">
        <p className="moco-kicker">{currentCopy.kicker}</p>
        <h1>
          {currentCopy.titleLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <p>
          {currentCopy.descriptionLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        <div className="moco-contact-info">
          <strong>mocoluggage@gmail.com</strong>
          <span>{currentCopy.location}</span>
        </div>
      </div>
      <ContactForm />
    </section>
  );
}
