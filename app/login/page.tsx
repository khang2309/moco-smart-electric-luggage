"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../auth-storage";
import { useLanguage } from "../providers";

const copy = {
  vi: {
    title: "Đăng nhập MOCO Account",
    noAccount: "Bạn chưa có tài khoản?",
    signup: "Tạo tài khoản mới",
    email: "Email *",
    password: "Mật khẩu *",
    forgot: "Quên mật khẩu?",
    loading: "Đang đăng nhập...",
    submit: "Đăng nhập",
    required: "Vui lòng nhập email và mật khẩu.",
    noUser: "Không tìm thấy tài khoản với email này.",
    incorrect: "Email hoặc mật khẩu chưa đúng.",
    network: "Chưa thể kết nối hệ thống. Vui lòng thử lại.",
    fallback: "Đăng nhập chưa thành công. Vui lòng kiểm tra lại thông tin.",
  },
  en: {
    title: "Log in to your MOCO account",
    noAccount: "Do not have an account?",
    signup: "Create a new account",
    email: "Email *",
    password: "Password *",
    forgot: "Forgot password?",
    loading: "Logging in...",
    submit: "Log in",
    required: "Please enter your email and password.",
    noUser: "No account was found with this email.",
    incorrect: "Email or password is incorrect.",
    network: "Unable to connect. Please try again.",
    fallback: "Login failed. Please check your information.",
  },
} as const;

function friendlyLoginError(error: string | undefined, language: "vi" | "en") {
  const currentCopy = copy[language];
  const normalized = (error || "").toLowerCase();

  if (normalized.includes("no account")) return currentCopy.noUser;
  if (normalized.includes("incorrect")) return currentCopy.incorrect;
  if (normalized.includes("network")) return currentCopy.network;
  return currentCopy.fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const currentCopy = copy[language];
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setError(currentCopy.required);
      setIsLoading(false);
      return;
    }

    const result = await loginUser(email, password);

    if (result.success) router.push("/account");
    else setError(friendlyLoginError(result.error, language));

    setIsLoading(false);
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <Image src="/assets/auth-bg.png" alt="MOCO Smart Electric Luggage" fill sizes="100vw" />
        <form className="login-card" onSubmit={handleLogin}>
          <h1>{currentCopy.title}</h1>
          <p>
            {currentCopy.noAccount} <Link href="/signup">{currentCopy.signup}</Link>
          </p>
          <label>
            <span>{currentCopy.email}</span>
            <input type="email" name="email" autoComplete="email" required />
          </label>
          <label>
            <span>{currentCopy.password}</span>
            <input type="password" name="password" autoComplete="current-password" required />
          </label>
          <Link className="login-forgot" href="/forgot-password">
            {currentCopy.forgot}
          </Link>
          {error ? <p className="auth-error" aria-live="polite">{error}</p> : null}
          <button type="submit" disabled={isLoading}>
            {isLoading ? currentCopy.loading : currentCopy.submit}
          </button>
        </form>
      </section>
    </main>
  );
}
