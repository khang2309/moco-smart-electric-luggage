"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../auth-storage";
import { useLanguage } from "../providers";

export default function LoginPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await loginUser(email, password);

    if (result.success) {
      router.push("/#home");
    } else {
      const msg = result.error || "";
      // Translate known server errors
      if (language === "vi") {
        if (msg.includes("No account")) {
          setError("Không tìm thấy tài khoản với email này.");
        } else if (msg.includes("Incorrect")) {
          setError("Mật khẩu không đúng.");
        } else {
          setError(msg);
        }
      } else {
        setError(msg);
      }
    }

    setIsLoading(false);
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
          <button type="submit" disabled={isLoading}>
            {isLoading
              ? (language === "vi" ? "Đang đăng nhập..." : "Logging in...")
              : (language === "vi" ? "Đăng nhập" : "Login")}
          </button>
        </form>
      </section>
    </main>
  );
}
