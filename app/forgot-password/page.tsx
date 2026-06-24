"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useLanguage } from "../providers";

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const [sent, setSent] = useState(false);

  const handleReset = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
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
              ? "Nhập email tài khoản MOCO để nhận liên kết khôi phục."
              : "Enter your MOCO email to receive a recovery link."}
          </p>
          <label>
            <span>{language === "vi" ? "Email tài khoản *" : "Account email *"}</span>
            <input type="email" required />
          </label>
          <button type="submit">{language === "vi" ? "Gửi liên kết" : "Send link"}</button>
          {sent ? (
            <p className="auth-success" aria-live="polite">
              {language === "vi"
                ? "Đã gửi hướng dẫn khôi phục. Hãy kiểm tra hộp thư của bạn."
                : "Recovery instructions sent. Please check your inbox."}
            </p>
          ) : null}
          <p>
            <Link href="/login">{language === "vi" ? "Quay lại đăng nhập" : "Back to login"}</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
