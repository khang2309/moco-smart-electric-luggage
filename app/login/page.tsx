"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../auth-storage";
import { useLanguage } from '../LanguageProvider';
import { showToast } from "../toast";

const copy = {
  vi: {
    title: "Đăng nhập MOCO Account",
    noAccount: "Bạn chưa có tài khoản?",
    signup: "Tạo tài khoản mới",
    google: "Tiếp tục với Google",
    or: "Hoặc đăng nhập với email",
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
    google: "Continue with Google",
    or: "Or log in with email",
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
  const [showPassword, setShowPassword] = useState(false);

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

    if (result.success) {
      showToast("Đăng nhập thành công!", "success");
      const requestedReturn = new URLSearchParams(window.location.search).get("returnTo");
      const returnTo = requestedReturn?.startsWith("/") ? requestedReturn : "";
      if (returnTo) {
        router.push(returnTo);
        setIsLoading(false);
        return;
      }
      
      // Trường hợp A: Lần đầu đăng nhập -> Giữ ở trang hiện tại hoặc sang onboarding/account
      if (result.isFirstLogin) {
        router.push("/account");
      } 
      // Trường hợp B: Các lần đăng nhập sau -> Về trang chủ
      else {
        router.push("/");
      }
    } else {
      setError(friendlyLoginError(result.error, language));
    }

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
          <a href="/api/auth/google" className="google-login-btn">
            <Image src="/assets/google-icon.svg" alt="Google" width={20} height={20} />
            {currentCopy.google}
          </a>
          <div className="login-divider">
            <span>{currentCopy.or}</span>
          </div>
          <label>
            <span>{currentCopy.email}</span>
            <input type="email" name="email" autoComplete="email" required />
          </label>
          <label>
            <span>{currentCopy.password}</span>
            <div style={{ position: "relative", width: "100%", display: "block" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                autoComplete="current-password" 
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
