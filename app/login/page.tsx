"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { findUser, readCurrentUser, saveUser } from "../auth-storage";
import { useLanguage } from "../providers";

export default function LoginPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [error, setError] = useState("");

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const existingUser = findUser(email);
    const currentUser = readCurrentUser();

    if (!existingUser && currentUser?.email?.toLowerCase() === email.trim().toLowerCase()) {
      saveUser({
        ...currentUser,
        email: currentUser.email,
        password,
      });
      setError("");
      router.push("/#home");
      return;
    }

    if (!existingUser) {
      setError(language === "vi" ? "Không tìm thấy tài khoản với email này." : "No account found for this email.");
      return;
    }

    if (existingUser.password && existingUser.password !== password) {
      setError(language === "vi" ? "Mật khẩu không đúng." : "Incorrect password.");
      return;
    }

    saveUser({
      ...currentUser,
      ...existingUser,
      email: existingUser.email,
      name: existingUser.name || existingUser.email.split("@")[0],
    });
    setError("");
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
            <input type="password" name="password" required />
          </label>
          {error && <p className="auth-error" aria-live="polite">{error}</p>}
          <button type="submit">{language === "vi" ? "Đăng nhập" : "Login"}</button>
        </form>
      </section>
    </main>
  );
}
