"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "../providers";

type FormState = {
  pending: boolean;
  message: string;
  type: "success" | "error" | "";
};

const copy = {
  vi: {
    required: "Vui lòng nhập đầy đủ họ tên, email và nội dung liên hệ.",
    fallbackError: "Không thể gửi liên hệ.",
    success: "MOCO đã nhận thông tin. Đội ngũ tư vấn sẽ phản hồi sớm.",
    error: "Chưa thể gửi liên hệ. Vui lòng thử lại sau.",
    name: "Họ và tên *",
    email: "Email *",
    phone: "Số điện thoại",
    message: "Nội dung liên hệ *",
    sending: "Đang gửi...",
    submit: "Gửi liên hệ",
  },
  en: {
    required: "Please enter your name, email, and message.",
    fallbackError: "Unable to send your message.",
    success: "MOCO has received your information. Our team will get back to you soon.",
    error: "We could not send your message. Please try again later.",
    name: "Full name *",
    email: "Email *",
    phone: "Phone number",
    message: "Message *",
    sending: "Sending...",
    submit: "Send message",
  },
} as const;

export default function ContactForm() {
  const { language } = useLanguage();
  const t = copy[language];
  const [state, setState] = useState<FormState>({
    pending: false,
    message: "",
    type: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setState({ pending: false, message: t.required, type: "error" });
      return;
    }

    setState({ pending: true, message: "", type: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || t.fallbackError);
      }

      setState({ pending: false, message: t.success, type: "success" });
      form.reset();
    } catch {
      setState({ pending: false, message: t.error, type: "error" });
    }
  }

  return (
    <form className="moco-contact-form" onSubmit={handleSubmit}>
      <label>
        {t.name}
        <input name="name" type="text" autoComplete="name" required />
      </label>
      <label>
        {t.email}
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        {t.phone}
        <input name="phone" type="tel" autoComplete="tel" />
      </label>
      <label>
        {t.message}
        <textarea name="message" rows={5} required />
      </label>
      <button className="moco-button moco-button-dark" type="submit" disabled={state.pending}>
        {state.pending ? t.sending : t.submit}
      </button>
      {state.message ? (
        <p className={`moco-form-note ${state.type}`} aria-live="polite">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
