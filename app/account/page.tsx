"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clearPasswordReset,
  createPasswordReset,
  readCurrentUser,
  saveUser,
  validatePasswordReset,
  type MocoUser,
} from "../auth-storage";
import { useLanguage } from "../providers";

function AccountContent() {
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userInfo, setUserInfo] = useState<MocoUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", city: "", address: "" });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    const user = readCurrentUser();

    if (user) {
      const storedUser = saveUser(user);
      setUserInfo(storedUser);
      setEditForm({
        name: storedUser.name || "",
        phone: storedUser.phone || "",
        city: storedUser.city || "",
        address: storedUser.address || "",
      });
    }
  }, []);

  useEffect(() => {
    const email = searchParams?.get("email") || "";
    const token = searchParams?.get("token") || "";

    if (searchParams?.get("reset") === "true" && email && token && validatePasswordReset(email, token)) {
      setResetEmail(email);
      setResetToken(token);
      setShowPasswordForm(true);
    }
  }, [searchParams]);

  const handleSaveProfile = () => {
    if (!userInfo?.email) return;

    const updatedUser = saveUser({
      ...userInfo,
      ...editForm,
      email: userInfo.email,
    });

    setUserInfo(updatedUser);
    setIsEditing(false);
  };

  const handleSendRealEmail = async () => {
    if (!userInfo?.email) return;

    setIsSendingEmail(true);
    try {
      const resetRequest = createPasswordReset(userInfo.email);
      const resetUrl = `${window.location.origin}/account?reset=true&email=${encodeURIComponent(resetRequest.email)}&token=${encodeURIComponent(resetRequest.token)}`;

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: userInfo.email,
          name: userInfo.name,
          resetLink: resetUrl,
        }),
      });
      const data = await response.json();

      if (data.success) {
        alert(
          language === "vi"
            ? "Đã gửi email xác nhận. Nếu không thấy trong Inbox, vui lòng kiểm tra tab Promotions/Updates trước khi kiểm tra Spam."
            : "Verification email sent. If it is not in Inbox, please check Promotions/Updates before Spam.",
        );
      } else {
        alert(language === "vi" ? `Lỗi: ${data.error || "Không thể gửi email."}` : `Error: ${data.error || "Cannot send email."}`);
      }
    } catch {
      alert(language === "vi" ? "Đã có lỗi xảy ra khi gửi email." : "An error occurred while sending email.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSavePassword = (event: React.FormEvent) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      alert(language === "vi" ? "Mật khẩu xác nhận không khớp!" : "Passwords do not match!");
      return;
    }

    const emailToUpdate = resetEmail || userInfo?.email || "";

    if (!emailToUpdate || (resetToken && !validatePasswordReset(emailToUpdate, resetToken))) {
      alert(language === "vi" ? "Liên kết đổi mật khẩu không hợp lệ hoặc đã hết hạn." : "The password reset link is invalid or expired.");
      return;
    }

    const updatedUser = saveUser({
      ...(userInfo || { email: emailToUpdate, name: emailToUpdate.split("@")[0] }),
      email: emailToUpdate,
      password: newPassword,
    });

    if (resetEmail) clearPasswordReset(resetEmail);

    setUserInfo(updatedUser);
    setShowPasswordForm(false);
    setNewPassword("");
    setConfirmPassword("");
    setResetEmail("");
    setResetToken("");
    alert(language === "vi" ? "Đổi mật khẩu thành công!" : "Password changed successfully!");
    router.replace("/account");
  };

  const closePasswordModal = () => {
    setShowPasswordForm(false);
    setResetEmail("");
    setResetToken("");
    router.replace("/account");
  };

  return (
    <main className="account-page">
      <section className="account-shell">
        <h1>{language === "vi" ? "Cài đặt tài khoản" : "Account settings"}</h1>
        <div className="account-layout">
          <article className="account-card profile-card">
            <div className="account-card-title">
              <h2>{language === "vi" ? "Hồ sơ cá nhân" : "Personal profile"}</h2>
              {!isEditing ? (
                <button type="button" aria-label="Edit profile" onClick={() => setIsEditing(true)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m18 2 4 4-14 14H4v-4Z"></path>
                  </svg>
                </button>
              ) : (
                <div className="account-edit-actions">
                  <button type="button" aria-label="Cancel editing" onClick={() => setIsEditing(false)}>x</button>
                  <button type="button" aria-label="Save profile" onClick={handleSaveProfile}>✓</button>
                </div>
              )}
            </div>

            {!isEditing && (
              <div className="account-success">
                <span>✓</span>
                <p>{language === "vi" ? "Thông tin hồ sơ được giữ lại khi đăng nhập lại hoặc đổi mật khẩu." : "Profile information is preserved when logging in again or changing password."}</p>
              </div>
            )}

            {isEditing ? (
              <div className="account-edit-form">
                <label>
                  <span>{language === "vi" ? "Họ và tên" : "Full name"}</span>
                  <input value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} />
                </label>
                <label>
                  <span>Email</span>
                  <input value={userInfo?.email || ""} disabled />
                </label>
                <label>
                  <span>{language === "vi" ? "Số điện thoại" : "Phone"}</span>
                  <input value={editForm.phone} onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })} />
                </label>
                <label>
                  <span>{language === "vi" ? "Tỉnh/Thành phố" : "City"}</span>
                  <input value={editForm.city} onChange={(event) => setEditForm({ ...editForm, city: event.target.value })} />
                </label>
                <label>
                  <span>{language === "vi" ? "Địa chỉ" : "Address"}</span>
                  <input value={editForm.address} onChange={(event) => setEditForm({ ...editForm, address: event.target.value })} />
                </label>
              </div>
            ) : (
              <dl>
                <dt>{language === "vi" ? "Họ và tên" : "Full name"}</dt>
                <dd>{userInfo?.name || (language === "vi" ? "Chưa cập nhật" : "Not updated")}</dd>
                <dt>Email</dt>
                <dd>{userInfo?.email || (language === "vi" ? "Chưa cập nhật" : "Not updated")}</dd>
                <dt>{language === "vi" ? "Số điện thoại" : "Phone"}</dt>
                <dd>{userInfo?.phone || (language === "vi" ? "Chưa cập nhật" : "Not updated")}</dd>
                <dt>{language === "vi" ? "Tỉnh/Thành phố" : "City"}</dt>
                <dd>{userInfo?.city || (language === "vi" ? "Chưa cập nhật" : "Not updated")}</dd>
                <dt>{language === "vi" ? "Địa chỉ" : "Address"}</dt>
                <dd>{userInfo?.address || (language === "vi" ? "Chưa cập nhật" : "Not updated")}</dd>
              </dl>
            )}
          </article>

          <article className="account-card account-products">
            <h2>{language === "vi" ? "Sản phẩm của tôi" : "My products"}</h2>
            <div className="registered-product">
              <Image src="/assets/Product/mocoGO.png" alt="" width={72} height={96} />
              <div>
                <span>Model</span>
                <strong>MOCO Go</strong>
                <Link href="/product/moco-go">{language === "vi" ? "Xem chi tiết" : "View details"}</Link>
              </div>
              <div>
                <span>{language === "vi" ? "Số serial" : "Serial"}</span>
                <strong>MOCO-GO-000123</strong>
              </div>
              <div>
                <span>{language === "vi" ? "Ngày mua" : "Purchase date"}</span>
                <strong>12/06/2026</strong>
              </div>
              <div>
                <span>{language === "vi" ? "Bảo hành" : "Warranty"}</span>
                <strong className="warranty-active">{language === "vi" ? "Còn hạn" : "Active"}</strong>
              </div>
              <Link className="registered-arrow" href="/product/moco-go">›</Link>
            </div>
          </article>

          <aside className="account-side">
            <article className="account-card">
              <h2>{language === "vi" ? "Bảo mật" : "Security"}</h2>
              <button className="account-dark-button" type="button" onClick={handleSendRealEmail} disabled={isSendingEmail || !userInfo?.email}>
                {isSendingEmail ? (language === "vi" ? "Đang gửi..." : "Sending...") : (language === "vi" ? "Đổi mật khẩu" : "Change password")}
              </button>
            </article>
            <article className="account-card">
              <h2>{language === "vi" ? "Quản lý tài khoản" : "Account management"}</h2>
              <p>{language === "vi" ? "Xóa tài khoản sẽ làm mất quyền truy cập vào hồ sơ và sản phẩm đã đăng ký." : "Deleting your account removes access to your profile and registered products."}</p>
              <button className="account-outline-button" type="button">{language === "vi" ? "Xóa tài khoản" : "Delete account"}</button>
            </article>
          </aside>
        </div>
      </section>

      {showPasswordForm && (
        <div className="password-modal-backdrop">
          <div className="password-modal">
            <button type="button" className="password-modal-close" onClick={closePasswordModal} aria-label="Close">
              x
            </button>
            <h2>{language === "vi" ? "Tạo mật khẩu mới" : "Create new password"}</h2>
            <form onSubmit={handleSavePassword}>
              <label>
                <span>{language === "vi" ? "Mật khẩu mới *" : "New password *"}</span>
                <input type="password" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={6} />
              </label>
              <label>
                <span>{language === "vi" ? "Xác nhận mật khẩu mới *" : "Confirm new password *"}</span>
                <input type="password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={6} />
              </label>
              <button type="submit">{language === "vi" ? "Lưu mật khẩu" : "Save password"}</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>}>
      <AccountContent />
    </Suspense>
  );
}
