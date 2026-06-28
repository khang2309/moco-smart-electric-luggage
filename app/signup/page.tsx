"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signUpUser } from "../auth-storage";
import { useLanguage } from "../providers";

const copy = {
  vi: {
    title: "Tạo tài khoản MOCO",
    hasAccount: "Đã có tài khoản?",
    login: "Đăng nhập",
    fullName: "Họ và tên *",
    email: "Email *",
    phone: "Số điện thoại",
    password: "Mật khẩu *",
    confirmPassword: "Nhập lại mật khẩu *",
    creating: "Đang tạo...",
    submit: "Tạo tài khoản",
    required: "Vui lòng nhập họ tên, email và mật khẩu.",
    passwordShort: "Mật khẩu cần có ít nhất 6 ký tự.",
    passwordMismatch: "Mật khẩu xác nhận không khớp.",
    exists: "Email này đã có tài khoản. Vui lòng đăng nhập.",
    network: "Chưa thể kết nối hệ thống. Vui lòng thử lại.",
    createError: "Chưa thể tạo tài khoản. Vui lòng thử lại.",
  },
  en: {
    title: "Create a MOCO account",
    hasAccount: "Already have an account?",
    login: "Log in",
    fullName: "Full name *",
    email: "Email *",
    phone: "Phone number",
    password: "Password *",
    confirmPassword: "Confirm password *",
    creating: "Creating...",
    submit: "Create account",
    required: "Please enter your name, email, and password.",
    passwordShort: "Password must be at least 6 characters.",
    passwordMismatch: "Passwords do not match.",
    exists: "This email already has an account. Please log in.",
    network: "Unable to connect. Please try again.",
    createError: "Unable to create the account. Please try again.",
  },
} as const;

function friendlySignupError(error: string | undefined, language: "vi" | "en") {
  const currentCopy = copy[language];
  const normalized = (error || "").toLowerCase();

  if (normalized.includes("exist") || normalized.includes("already")) {
    return currentCopy.exists;
  }

  if (normalized.includes("network")) {
    return currentCopy.network;
  }

  return currentCopy.createError;
}

export default function SignupPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const currentCopy = copy[language];
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!name || !email || !password) {
      setError(currentCopy.required);
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(currentCopy.passwordShort);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(currentCopy.passwordMismatch);
      setIsLoading(false);
      return;
    }

    const result = await signUpUser({ name, email, phone, password });

    if (result.success) {
      router.push("/account");
    } else {
      setError(friendlySignupError(result.error, language));
    }

    setIsLoading(false);
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <Image src="/assets/auth-bg.png" alt="MOCO Smart Electric Luggage" fill sizes="100vw" />
        <form className="login-card" onSubmit={handleSignup}>
          <h1>{currentCopy.title}</h1>
          <p>
            {currentCopy.hasAccount} <Link href="/login">{currentCopy.login}</Link>
          </p>
          <label>
            <span>{currentCopy.fullName}</span>
            <input type="text" name="name" autoComplete="name" required />
          </label>
          <label>
            <span>{currentCopy.email}</span>
            <input type="email" name="email" autoComplete="email" required />
          </label>
          <label>
            <span>{currentCopy.phone}</span>
            <input type="tel" name="phone" autoComplete="tel" />
          </label>
          <label>
            <span>{currentCopy.password}</span>
            <input type="password" name="password" autoComplete="new-password" required />
          </label>
          <label>
            <span>{currentCopy.confirmPassword}</span>
            <input type="password" name="confirmPassword" autoComplete="new-password" required />
          </label>
          {error ? <p className="auth-error" aria-live="polite">{error}</p> : null}
          <button type="submit" disabled={isLoading}>
            {isLoading ? currentCopy.creating : currentCopy.submit}
          </button>
        </form>
      </section>
    </main>
  );
}
