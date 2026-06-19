"use client";

import Image from "next/image";
import { FormEvent } from "react";
import { useLanguage } from "../providers";

export default function SignupPage() {
  const { language } = useLanguage();

  const handleSignup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.localStorage.setItem("moco-auth", "true");
    window.dispatchEvent(new Event("moco-auth-updated"));
    window.location.href = "/account";
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
        <div className="login-brand">MOCO</div>
        <form className="login-card auth-card" onSubmit={handleSignup}>
          <h1>{language === "vi" ? "Tạo tài khoản MOCO" : "Create MOCO Account"}</h1>
          <p>
            {language === "vi" ? "Đã có tài khoản?" : "Already have an account?"}{" "}
            <a href="/login">{language === "vi" ? "Đăng nhập" : "Login"}</a>
          </p>
          <label>
            <span>{language === "vi" ? "Họ và tên *" : "Full name *"}</span>
            <input type="text" required />
          </label>
          <label>
            <span>{language === "vi" ? "Email *" : "Email *"}</span>
            <input type="email" required />
          </label>
          <label>
            <span>{language === "vi" ? "Số điện thoại" : "Phone number"}</span>
            <input type="tel" />
          </label>
          <label>
            <span>{language === "vi" ? "Mật khẩu *" : "Password *"}</span>
            <input type="password" required />
          </label>
          <label>
            <span>{language === "vi" ? "Nhập lại mật khẩu *" : "Confirm password *"}</span>
            <input type="password" required />
          </label>
          <button type="submit">{language === "vi" ? "Tạo tài khoản" : "Create account"}</button>
        </form>
      </section>
    </main>
  );
}
