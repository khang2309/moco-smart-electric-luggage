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
        <h1>{language === "vi" ? "Thanh to\u00e1n th\u00e0nh c\u00f4ng" : "Order complete"}</h1>
        {order ? (
          <dl>
            <div><dt>{language === "vi" ? "M\u00e3 \u0111\u01a1n h\u00e0ng" : "Order code"}</dt><dd>{order.code}</dd></div>
            <div><dt>{language === "vi" ? "T\u1ed5ng ti\u1ec1n" : "Total"}</dt><dd>{currency(order.total)} VND</dd></div>
            <div><dt>{language === "vi" ? "Tr\u1ea1ng th\u00e1i thanh to\u00e1n" : "Payment status"}</dt><dd>{order.paymentStatus === "paid" ? (language === "vi" ? "\u0110\u00e3 thanh to\u00e1n" : "Paid") : (language === "vi" ? "Ch\u1edd thanh to\u00e1n khi nh\u1eadn h\u00e0ng" : "Pending COD")}</dd></div>
            <div><dt>{language === "vi" ? "Giao h\u00e0ng" : "Delivery"}</dt><dd>{order.shipping}</dd></div>
            <div><dt>{language === "vi" ? "Ph\u01b0\u01a1ng th\u1ee9c thanh to\u00e1n" : "Payment method"}</dt><dd>{order.payment}</dd></div>
          </dl>
        ) : (
          <p>{language === "vi" ? "Kh\u00f4ng t\u00ecm th\u1ea5y \u0111\u01a1n h\u00e0ng g\u1ea7n nh\u1ea5t." : "No recent order found."}</p>
        )}
        <div className="checkout-success-actions">
          <Link href={order ? `/order/${encodeURIComponent(order.code)}` : "/order"}>
            {language === "vi" ? "Xem \u0111\u01a1n h\u00e0ng" : "View order"}
          </Link>
          <Link href="/product">{language === "vi" ? "Ti\u1ebfp t\u1ee5c mua s\u1eafm" : "Continue shopping"}</Link>
        </div>
      </section>
    </main>
  );
}
