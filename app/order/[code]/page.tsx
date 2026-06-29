"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../providers";

type OrderItem = {
  slug: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
};

type MocoOrder = {
  code: string;
  items?: OrderItem[];
  total: number;
  paymentStatus: "paid" | "pending";
  fulfillmentStatus?: "processing" | "shipping" | "delivered";
  shipping: string;
  payment: string;
  createdAt?: string;
  estimatedDelivery?: string;
};

const copy = {
  vi: {
    back: "Quay l\u1ea1i danh s\u00e1ch",
    kicker: "Chi ti\u1ebft \u0111\u01a1n h\u00e0ng",
    title: "\u0110\u01a1n h\u00e0ng",
    notFoundTitle: "Kh\u00f4ng t\u00ecm th\u1ea5y \u0111\u01a1n h\u00e0ng",
    notFoundText: "M\u00e3 \u0111\u01a1n n\u00e0y kh\u00f4ng c\u00f3 trong d\u1eef li\u1ec7u \u0111\u01a1n h\u00e0ng tr\u00ean thi\u1ebft b\u1ecb hi\u1ec7n t\u1ea1i.",
    statusLabel: "Tr\u1ea1ng th\u00e1i hi\u1ec7n t\u1ea1i",
    summary: "T\u00f3m t\u1eaft \u0111\u01a1n h\u00e0ng",
    items: "S\u1ea3n ph\u1ea9m trong \u0111\u01a1n",
    orderCode: "M\u00e3 \u0111\u01a1n",
    orderDate: "Ng\u00e0y \u0111\u1eb7t",
    estimate: "D\u1ef1 ki\u1ebfn giao",
    payment: "Thanh to\u00e1n",
    delivery: "V\u1eadn chuy\u1ec3n",
    total: "T\u1ed5ng thanh to\u00e1n",
    itemCount: "s\u1ea3n ph\u1ea9m",
    steps: ["\u0110\u00e3 \u0111\u1eb7t h\u00e0ng", "X\u00e1c nh\u1eadn thanh to\u00e1n", "\u0110ang chu\u1ea9n b\u1ecb", "\u0110ang giao h\u00e0ng", "Ho\u00e0n t\u1ea5t"],
    paid: "\u0110\u00e3 thanh to\u00e1n",
    pending: "Thanh to\u00e1n khi nh\u1eadn h\u00e0ng",
    processing: "\u0110ang chu\u1ea9n b\u1ecb \u0111\u01a1n h\u00e0ng",
    shipping: "\u0110ang giao h\u00e0ng",
    delivered: "\u0110\u00e3 giao th\u00e0nh c\u00f4ng",
  },
  en: {
    back: "Back to orders",
    kicker: "Order details",
    title: "Order",
    notFoundTitle: "Order not found",
    notFoundText: "This order code is not available in the order data saved on this device.",
    statusLabel: "Current status",
    summary: "Order summary",
    items: "Order items",
    orderCode: "Order code",
    orderDate: "Order date",
    estimate: "Estimated delivery",
    payment: "Payment",
    delivery: "Delivery",
    total: "Order total",
    itemCount: "items",
    steps: ["Order placed", "Payment confirmed", "Preparing", "Out for delivery", "Completed"],
    paid: "Paid",
    pending: "Cash on delivery",
    processing: "Preparing your order",
    shipping: "Out for delivery",
    delivered: "Delivered",
  },
} as const;

function formatDate(value: string | undefined, language: "vi" | "en") {
  if (!value) return "-";

  return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getFulfillmentStatus(order: MocoOrder): "processing" | "shipping" | "delivered" {
  if (order.fulfillmentStatus) return order.fulfillmentStatus;
  if (!order.createdAt) return "processing";

  const orderTime = new Date(order.createdAt).getTime();
  const ageInDays = (Date.now() - orderTime) / 86400000;

  if (ageInDays >= 4) return "delivered";
  if (ageInDays >= 1) return "shipping";
  return "processing";
}

function getActiveStep(order: MocoOrder) {
  const fulfillmentStatus = getFulfillmentStatus(order);

  if (fulfillmentStatus === "delivered") return 4;
  if (fulfillmentStatus === "shipping") return 3;
  return order.paymentStatus === "paid" ? 2 : 1;
}

export default function OrderDetailPage() {
  const params = useParams<{ code: string }>();
  const [orders, setOrders] = useState<MocoOrder[]>([]);
  const { language } = useLanguage();
  const labels = copy[language];
  const currency = new Intl.NumberFormat("vi-VN").format;
  const orderCode = decodeURIComponent(params?.code ?? "");

  useEffect(() => {
    try {
      const rawOrders = window.localStorage.getItem("moco-orders");
      const rawLastOrder = window.localStorage.getItem("moco-last-order");
      const parsedOrders: MocoOrder[] = rawOrders ? JSON.parse(rawOrders) : [];
      const lastOrder: MocoOrder | null = rawLastOrder ? JSON.parse(rawLastOrder) : null;
      const mergedOrders =
        lastOrder && !parsedOrders.some((order) => order.code === lastOrder.code)
          ? [lastOrder, ...parsedOrders]
          : parsedOrders;

      setOrders(mergedOrders);
    } catch {
      setOrders([]);
    }
  }, []);

  const order = useMemo(
    () => orders.find((item) => item.code.toUpperCase() === orderCode.toUpperCase()) ?? null,
    [orders, orderCode],
  );

  if (!order) {
    return (
      <main className="order-page">
        <section className="order-empty">
          <h2>{labels.notFoundTitle}</h2>
          <p>{labels.notFoundText}</p>
          <Link href="/order">{labels.back}</Link>
        </section>
      </main>
    );
  }

  const activeStep = getActiveStep(order);
  const fulfillmentStatus = getFulfillmentStatus(order);
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <main className="order-page">
      <section className="order-detail-hero">
        <Link href="/order">{labels.back}</Link>
        <p className="order-kicker">{labels.kicker}</p>
        <h1>{labels.title} {order.code}</h1>
      </section>

      <section className="order-detail-layout">
        <div className="order-detail-main">
          <article className="order-card order-status-card">
            <div className="order-current-status">
              <small>{labels.statusLabel}</small>
              <span>{labels[fulfillmentStatus]}</span>
              <strong>{order.paymentStatus === "paid" ? labels.paid : labels.pending}</strong>
            </div>
            <ol className="order-timeline">
              {labels.steps.map((step, index) => (
                <li className={index <= activeStep ? "active" : ""} key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </article>

          <article className="order-card order-items-card">
            <div className="order-section-title">
              <h2>{labels.items}</h2>
              <span>{itemCount} {labels.itemCount}</span>
            </div>
            <div className="order-items">
              {(order.items ?? []).map((item) => (
                <div key={item.slug}>
                  <Image src={item.image} alt="" width={76} height={76} loading="lazy" decoding="async" />
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.quantity} x {currency(item.price)} VND</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="order-card order-details-card">
          <h2>{labels.summary}</h2>
          <dl>
            <div><dt>{labels.orderCode}</dt><dd>{order.code}</dd></div>
            <div><dt>{labels.orderDate}</dt><dd>{formatDate(order.createdAt, language)}</dd></div>
            <div><dt>{labels.estimate}</dt><dd>{formatDate(order.estimatedDelivery, language)}</dd></div>
            <div><dt>{labels.payment}</dt><dd>{order.payment}</dd></div>
            <div><dt>{labels.delivery}</dt><dd>{order.shipping}</dd></div>
            <div className="order-total"><dt>{labels.total}</dt><dd>{currency(order.total)} VND</dd></div>
          </dl>
        </aside>
      </section>
    </main>
  );
}
