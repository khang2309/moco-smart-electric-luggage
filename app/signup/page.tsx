"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../providers";

export default function SignupPage() {
  const { language } = useLanguage();
  const router = useRouter();

  const handleSignup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string || "";
    
    window.localStorage.setItem("moco-auth", "true");
    window.localStorage.setItem("moco-user", JSON.stringify({ name, email, phone }));
    window.dispatchEvent(new Event("moco-auth-updated"));
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
        <div className="login-brand">MOCO</div>
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
