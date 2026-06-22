"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../providers";

export default function LoginPage() {
  const { language } = useLanguage();
  const router = useRouter();

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const name = email ? email.split('@')[0] : "User";
    
    window.localStorage.setItem("moco-auth", "true");
    window.localStorage.setItem("moco-user", JSON.stringify({ email, name }));
    window.dispatchEvent(new Event("moco-auth-updated"));
    router.push("/#home");
  };

  return (
    <main className="login-page">
      <section className="login-hero">
        <Image
          src="/assets/auth-bg.png"
          alt="MOCO Smart Electric Luggage"
          fill
          sizes="100vw"
          priority
        />
        <div className="login-brand">MOCO</div>
        <form className="login-card" onSubmit={handleLogin}>
          <h1>{language === "vi" ? "Đăng nhập MOCO Account" : "Login to MOCO Account"}</h1>
          <p>
            {language === "vi" ? "Bạn chưa có tài khoản MOCO?" : "Do not have a MOCO account?"}{" "}
            <Link href="/signup">{language === "vi" ? "Tạo tài khoản MOCO mới" : "Create a new MOCO account"}</Link>
          </p>
          <label>
            <span>{language === "vi" ? "Địa chỉ email đăng nhập *" : "Login email address *"}</span>
            <input type="email" name="email" required />
          </label>
          <Link className="login-forgot" href="/forgot-password">
            {language === "vi" ? "Bạn quên mật khẩu?" : "Forgot password?"}
          </Link>
          <label>
            <span>{language === "vi" ? "Mật khẩu *" : "Password *"}</span>
            <input type="password" required />
          </label>
          <button type="submit">{language === "vi" ? "Đăng nhập" : "Login"}</button>
        </form>
      </section>
    </main>
  );
}
