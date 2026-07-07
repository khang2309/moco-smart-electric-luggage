"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signUpUser } from "../auth-storage";
import { useLanguage } from "../providers";
import { showToast } from "../toast";

const copy = {
  vi: {
    title: "Tạo tài khoản MOCO",
    hasAccount: "Đã có tài khoản?",
    login: "Đăng nhập",
    google: "Đăng ký với Google",
    or: "Hoặc đăng ký với email",
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
    google: "Sign up with Google",
    or: "Or sign up with email",
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      showToast("Đăng ký thành công!", "success");
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
          <a href="/api/auth/google" className="google-login-btn">
            <Image src="/assets/google-icon.svg" alt="Google" width={20} height={20} />
            {currentCopy.google}
          </a>
          <div className="login-divider">
            <span>{currentCopy.or}</span>
          </div>
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
            <div style={{ position: "relative", width: "100%", display: "block" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                autoComplete="new-password" 
                required 
                style={{ width: "100%", paddingRight: "44px" }} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", color: "#666", transition: "color 0.2s" }}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onMouseOver={(e) => e.currentTarget.style.color = "#333"}
                onMouseOut={(e) => e.currentTarget.style.color = "#666"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c0 0 5-8 10-8s10 8 10 8-5 8-10 8-10-8-10-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-5.52 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94"></path><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"></path><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c5.52 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                )}
              </button>
            </div>
          </label>
          <label>
            <span>{currentCopy.confirmPassword}</span>
            <div style={{ position: "relative", width: "100%", display: "block" }}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                autoComplete="new-password" 
                required 
                style={{ width: "100%", paddingRight: "44px" }} 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", color: "#666", transition: "color 0.2s" }}
                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onMouseOver={(e) => e.currentTarget.style.color = "#333"}
                onMouseOut={(e) => e.currentTarget.style.color = "#666"}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c0 0 5-8 10-8s10 8 10 8-5 8-10 8-10-8-10-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-5.52 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94"></path><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"></path><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c5.52 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                )}
              </button>
            </div>
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
