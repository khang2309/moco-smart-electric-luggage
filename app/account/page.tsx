"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../providers";

function AccountContent() {
  const { language } = useLanguage();
  const [userInfo, setUserInfo] = useState<{name: string, email: string, phone?: string, city?: string} | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", city: "" });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // If user clicked the link in the real email
    if (searchParams?.get("reset") === "true") {
      setShowPasswordForm(true);
    }
  }, [searchParams]);
  
  useEffect(() => {
    const user = window.localStorage.getItem("moco-user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUserInfo(parsed);
        setEditForm({
          name: parsed.name || "",
          phone: parsed.phone || "",
          city: parsed.city || ""
        });
      } catch (e) {}
    }
  }, []);

  const handleSaveProfile = () => {
    const updatedUser = { ...userInfo, ...editForm, email: userInfo?.email || "" };
    setUserInfo(updatedUser);
    window.localStorage.setItem("moco-user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("moco-auth-updated"));
    setIsEditing(false);
  };

  const handleSendRealEmail = async () => {
    if (!userInfo?.email) return;
    
    setIsSendingEmail(true);
    try {
      const resetUrl = `${window.location.origin}/account?reset=true`;
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userInfo.email,
          name: userInfo.name,
          resetLink: resetUrl
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(language === "vi" 
          ? "Đã gửi email xác nhận thành công! Vui lòng kiểm tra hộp thư của bạn." 
          : "Verification email sent successfully! Please check your inbox.");
      } else {
        alert(language === "vi"
          ? "Lỗi: " + (data.error || "Không thể gửi email. Bạn đã cấu hình App Password chưa?")
          : "Error: " + (data.error || "Cannot send email. Did you configure App Password?"));
      }
    } catch (error) {
      alert(language === "vi" ? "Đã có lỗi xảy ra khi gửi email." : "An error occurred while sending email.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert(language === "vi" ? "Mật khẩu xác nhận không khớp!" : "Passwords do not match!");
      return;
    }
    // Simulate API call to save password
    alert(language === "vi" ? "Đổi mật khẩu thành công!" : "Password changed successfully!");
    setShowPasswordForm(false);
    setNewPassword("");
    setConfirmPassword("");
    router.replace('/account');
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
                <button type="button" aria-label="Edit profile" onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-black">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m18 2 4 4-14 14H4v-4Z"></path>
                  </svg>
                </button>
              ) : (
                <div className="flex gap-1">
                  <button type="button" aria-label="Cancel editing" onClick={() => setIsEditing(false)} className="p-2 rounded-full hover:bg-red-50 transition-colors text-red-500 hover:text-red-600" title={language === "vi" ? "Hủy" : "Cancel"}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                  <button type="button" aria-label="Save profile" onClick={handleSaveProfile} className="p-2 rounded-full hover:bg-green-50 transition-colors text-green-600 hover:text-green-700" title={language === "vi" ? "Lưu" : "Save"}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {!isEditing && (
              <div className="account-success">
                <span>✓</span>
                <p>{language === "vi" ? "Hoàn thiện hồ sơ để MOCO hỗ trợ bảo hành, cập nhật sản phẩm và chăm sóc khách hàng tốt hơn." : "Complete your profile so MOCO can support warranty, updates, and care better."}</p>
              </div>
            )}
            
            {isEditing ? (
              <div className="flex flex-col gap-5 mt-6">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-gray-500">{language === "vi" ? "Họ và tên" : "Full name"}</span>
                  <input type="text" className="border border-gray-200 rounded-lg p-3 text-[15px] focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                </label>
                <label className="flex flex-col gap-1 text-sm opacity-60">
                  <span className="text-gray-500">Email ({language === "vi" ? "Không thể thay đổi" : "Cannot be changed"})</span>
                  <input type="email" className="border border-gray-200 rounded-lg p-3 text-[15px] bg-gray-50 cursor-not-allowed" value={userInfo?.email || ""} disabled />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-gray-500">{language === "vi" ? "Số điện thoại" : "Phone"}</span>
                  <input type="tel" className="border border-gray-200 rounded-lg p-3 text-[15px] focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-gray-500">{language === "vi" ? "Tỉnh/Thành phố" : "City"}</span>
                  <input type="text" className="border border-gray-200 rounded-lg p-3 text-[15px] focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none" value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})} />
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
              </dl>
            )}
          </article>

          <article className="account-card account-products">
            <h2>{language === "vi" ? "Sản phẩm của tôi" : "My products"}</h2>
            <div className="registered-product">
              <Image src="/assets/product-carousel.png" alt="" width={72} height={96} />
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
              <button 
                className="account-dark-button" 
                type="button" 
                onClick={handleSendRealEmail}
                disabled={isSendingEmail}
              >
                {isSendingEmail 
                  ? (language === "vi" ? "Đang gửi..." : "Sending...") 
                  : (language === "vi" ? "Đổi mật khẩu" : "Change password")}
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

      {/* Change Password Form Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 relative">
            <button 
              type="button" 
              onClick={() => {
                setShowPasswordForm(false);
                // remove reset=true from URL
                router.replace('/account');
              }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2 className="text-2xl font-bold mb-6">
              {language === "vi" ? "Tạo mật khẩu mới" : "Create new password"}
            </h2>
            <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">
                  {language === "vi" ? "Mật khẩu mới *" : "New password *"}
                </span>
                <input 
                  type="password" 
                  required 
                  className="border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-black focus:outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">
                  {language === "vi" ? "Xác nhận mật khẩu mới *" : "Confirm new password *"}
                </span>
                <input 
                  type="password" 
                  required 
                  className="border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-black focus:outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                />
              </label>
              <button 
                type="submit" 
                className="mt-4 bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                {language === "vi" ? "Lưu mật khẩu" : "Save password"}
              </button>
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
