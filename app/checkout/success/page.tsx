"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "../../providers";

type LastOrder = {
  code: string;
  total: number;
  paymentStatus: "paid" | "pending";
  shipping: string;
  payment: string;
};

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<LastOrder | null>(null);
  const { language } = useLanguage();
  const currency = new Intl.NumberFormat("vi-VN").format;

  useEffect(() => {
    try {
      const rawOrder = window.localStorage.getItem("moco-last-order");
      setOrder(rawOrder ? JSON.parse(rawOrder) : null);
    } catch {
      setOrder(null);
    }
  }, []);

  return (
    <main className="checkout-page">
      <section className="checkout-success-card">
        <div className="checkout-success-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5"></path>
          </svg>
        </div>
        <h1>{language === "vi" ? "Thanh toán thành công" : "Order complete"}</h1>
        {order ? (
          <dl>
            <div><dt>{language === "vi" ? "Mã đơn hàng" : "Order code"}</dt><dd>{order.code}</dd></div>
            <div><dt>{language === "vi" ? "Tổng tiền" : "Total"}</dt><dd>{currency(order.total)} VND</dd></div>
            <div><dt>{language === "vi" ? "Trạng thái thanh toán" : "Payment status"}</dt><dd>{order.paymentStatus === "paid" ? (language === "vi" ? "Đã thanh toán" : "Paid") : (language === "vi" ? "Chờ thanh toán khi nhận hàng" : "Pending COD")}</dd></div>
            <div><dt>{language === "vi" ? "Giao hàng" : "Delivery"}</dt><dd>{order.shipping}</dd></div>
            <div><dt>{language === "vi" ? "Phương thức thanh toán" : "Payment method"}</dt><dd>{order.payment}</dd></div>
          </dl>
        ) : (
          <p>{language === "vi" ? "Không tìm thấy đơn hàng gần nhất." : "No recent order found."}</p>
        )}
        <Link href="/product">{language === "vi" ? "Tiếp tục mua sắm" : "Continue shopping"}</Link>
      </section>
    </main>
  );
}
