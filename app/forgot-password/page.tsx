"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { createPasswordReset, findUser } from "../auth-storage";
import { useLanguage } from "../providers";

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const user = findUser(email);

    if (!user) {
      setError(language === "vi" ? "Không tìm thấy tài khoản với email này." : "No account found for this email.");
      return;
    }

    setIsSending(true);
    setError("");

    try {
      const resetRequest = createPasswordReset(email);
      const resetLink = `${window.location.origin}/account?reset=true&email=${encodeURIComponent(resetRequest.email)}&token=${encodeURIComponent(resetRequest.token)}`;
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: resetRequest.email, name: user.name, resetLink }),
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.error || (language === "vi" ? "Không thể gửi email." : "Cannot send email."));
        return;
      }

      setSent(true);
    } catch {
      setError(language === "vi" ? "Đã có lỗi xảy ra khi gửi email." : "An error occurred while sending email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-hero auth-hero">
        <Image
          src="/assets/auth-bg.png"
          alt="MOCO Smart Electric Luggage"
          fill
          sizes="100vw"
          priority
        />

        <form className="login-card auth-card forgot-card" onSubmit={handleReset}>
          <h1>{language === "vi" ? "Đặt lại mật khẩu" : "Reset password"}</h1>
          <p>
            {language === "vi"
              ? "Nhập email tài khoản MOCO để nhận liên kết xác nhận đổi mật khẩu."
              : "Enter your MOCO email to receive a password reset confirmation link."}
          </p>
          <label>
            <span>{language === "vi" ? "Email tài khoản *" : "Account email *"}</span>
            <input type="email" name="email" required />
          </label>
          <button type="submit" disabled={isSending}>
            {isSending ? (language === "vi" ? "Đang gửi..." : "Sending...") : (language === "vi" ? "Gửi liên kết" : "Send link")}
          </button>
          {sent && (
            <p className="auth-success" aria-live="polite">
              {language === "vi"
                ? "Đã gửi email xác nhận. Nếu không thấy trong Inbox, hãy kiểm tra Promotions/Updates rồi mới kiểm tra Spam."
                : "Confirmation email sent. If it is not in Inbox, check Promotions/Updates before Spam."}
            </p>
          )}
          {error && <p className="auth-error" aria-live="polite">{error}</p>}
          <p>
            <Link href="/login">{language === "vi" ? "Quay lại đăng nhập" : "Back to login"}</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
