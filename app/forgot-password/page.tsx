"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { createPasswordReset } from "../auth-storage";
import { useLanguage } from "../providers";

const copy = {
  vi: {
    hiddenResult:
      "Nếu email tồn tại trong hệ thống, MOCO sẽ gửi hướng dẫn đặt lại mật khẩu.",
    sendError: "Chưa thể gửi email xác nhận. Vui lòng thử lại sau.",
    requestError: "Đã có lỗi khi gửi yêu cầu. Vui lòng thử lại.",
    title: "Đặt lại mật khẩu",
    intro: "Nhập email tài khoản MOCO để nhận liên kết xác nhận đổi mật khẩu.",
    email: "Email tài khoản *",
    sending: "Đang gửi...",
    submit: "Gửi liên kết",
    success:
      "Đã gửi email xác nhận. Nếu không thấy trong Inbox, hãy kiểm tra Promotions hoặc Spam.",
    back: "Quay lại đăng nhập",
  },
  en: {
    hiddenResult:
      "If this email exists in our system, MOCO will send password reset instructions.",
    sendError: "We could not send the confirmation email. Please try again later.",
    requestError: "An error occurred while sending your request. Please try again.",
    title: "Reset password",
    intro: "Enter your MOCO account email to receive a password reset link.",
    email: "Account email *",
    sending: "Sending...",
    submit: "Send link",
    success:
      "A confirmation email has been sent. If you do not see it in your inbox, please check Promotions or Spam.",
    back: "Back to login",
  },
} as const;

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const t = copy[language];
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();

    setIsSending(true);
    setError("");

    try {
      const resetResult = await createPasswordReset(email);

      if (!resetResult.success || !resetResult.email || !resetResult.token) {
        setError(t.hiddenResult);
        setIsSending(false);
        return;
      }

      const resetLink = `${window.location.origin}/account?reset=true&email=${encodeURIComponent(resetResult.email)}&token=${encodeURIComponent(resetResult.token)}`;
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: resetResult.email, name: email.split("@")[0], resetLink, language }),
      });
      const data = await response.json();

      if (!data.success) {
        setError(t.sendError);
        return;
      }

      setSent(true);
    } catch {
      setError(t.requestError);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-hero auth-hero">
        <Image src="/assets/auth-bg.png" alt="MOCO Smart Electric Luggage" fill sizes="100vw" />
        <form className="login-card auth-card forgot-card" onSubmit={handleReset}>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
          <label>
            <span>{t.email}</span>
            <input type="email" name="email" autoComplete="email" required />
          </label>
          <button type="submit" disabled={isSending}>
            {isSending ? t.sending : t.submit}
          </button>
          {sent ? (
            <p className="auth-success" aria-live="polite">
              {t.success}
            </p>
          ) : null}
          {error ? <p className="auth-error" aria-live="polite">{error}</p> : null}
          <p>
            <Link href="/login">{t.back}</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
