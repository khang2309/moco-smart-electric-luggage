"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../providers";

export default function AccountPage() {
  const { language } = useLanguage();

  return (
    <main className="account-page">
      <section className="account-shell">
        <h1>{language === "vi" ? "Cài đặt tài khoản" : "Account settings"}</h1>
        <div className="account-layout">
          <article className="account-card profile-card">
            <div className="account-card-title">
              <h2>{language === "vi" ? "Hồ sơ cá nhân" : "Personal profile"}</h2>
              <button type="button" aria-label="Edit profile">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m18 2 4 4-14 14H4v-4Z"></path>
                </svg>
              </button>
            </div>
            <div className="account-success">
              <span>✓</span>
              <p>{language === "vi" ? "Hoàn thiện hồ sơ để MOCO hỗ trợ bảo hành, cập nhật sản phẩm và chăm sóc khách hàng tốt hơn." : "Complete your profile so MOCO can support warranty, updates, and care better."}</p>
            </div>
            <dl>
              <dt>{language === "vi" ? "Họ và tên" : "Full name"}</dt>
              <dd>Cẩm Niệm Nguyễn Thị</dd>
              <dt>Email</dt>
              <dd>niemntc.cs190222@gmail.com</dd>
              <dt>{language === "vi" ? "Số điện thoại" : "Phone"}</dt>
              <dd>0932402270</dd>
              <dt>{language === "vi" ? "Tỉnh/Thành phố" : "City"}</dt>
              <dd>Cần Thơ</dd>
            </dl>
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
              <button className="account-dark-button" type="button">{language === "vi" ? "Đổi mật khẩu" : "Change password"}</button>
            </article>
            <article className="account-card">
              <h2>{language === "vi" ? "Quản lý tài khoản" : "Account management"}</h2>
              <p>{language === "vi" ? "Xóa tài khoản sẽ làm mất quyền truy cập vào hồ sơ và sản phẩm đã đăng ký." : "Deleting your account removes access to your profile and registered products."}</p>
              <button className="account-outline-button" type="button">{language === "vi" ? "Xóa tài khoản" : "Delete account"}</button>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}
