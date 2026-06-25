"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../providers";
import { findUser, saveUser } from "../auth-storage";

export default function SignupPage() {
  const { language } = useLanguage();
  const router = useRouter();

  const handleSignup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string || "";
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      alert(language === "vi" ? "Mật khẩu xác nhận không khớp." : "Passwords do not match.");
      return;
    }

    if (findUser(email)) {
      alert(language === "vi" ? "Email này đã có tài khoản. Vui lòng đăng nhập." : "This email already has an account. Please login.");
      return;
    }

    saveUser({ name, email, phone, password });
    router.push("/account");
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
        
        <form className="login-card auth-card" onSubmit={handleSignup}>
          <h1>{language === "vi" ? "Tạo tài khoản MOCO" : "Create MOCO Account"}</h1>
          <p>
            {language === "vi" ? "Đã có tài khoản?" : "Already have an account?"}{" "}
            <Link href="/login">{language === "vi" ? "Đăng nhập" : "Login"}</Link>
          </p>
          <label>
            <span>{language === "vi" ? "Họ và tên *" : "Full name *"}</span>
            <input type="text" name="name" required />
          </label>
          <label>
            <span>{language === "vi" ? "Email *" : "Email *"}</span>
            <input type="email" name="email" required />
          </label>
          <label>
            <span>{language === "vi" ? "Số điện thoại" : "Phone number"}</span>
            <input type="tel" name="phone" />
          </label>
          <label>
            <span>{language === "vi" ? "Mật khẩu *" : "Password *"}</span>
            <input type="password" name="password" required minLength={6} />
          </label>
          <label>
            <span>{language === "vi" ? "Nhập lại mật khẩu *" : "Confirm password *"}</span>
            <input type="password" name="confirmPassword" required minLength={6} />
          </label>
          <button type="submit">{language === "vi" ? "Tạo tài khoản" : "Create account"}</button>
        </form>
      </section>
    </main>
  );
}
