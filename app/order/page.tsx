"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLanguage } from "../providers";

type OrderItem = {
  quantity: number;
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
    kicker: "Qu\u1ea3n l\u00fd \u0111\u01a1n h\u00e0ng",
    title: "Danh s\u00e1ch \u0111\u01a1n h\u00e0ng",
    intro: "Xem l\u1ea1i c\u00e1c \u0111\u01a1n MOCO \u0111\u00e3 \u0111\u1eb7t tr\u00ean thi\u1ebft b\u1ecb n\u00e0y. Ch\u1ecdn m\u1ed9t \u0111\u01a1n \u0111\u1ec3 xem chi ti\u1ebft tr\u1ea1ng th\u00e1i, thanh to\u00e1n v\u00e0 s\u1ea3n ph\u1ea9m.",
    searchPlaceholder: "Nh\u1eadp m\u00e3 \u0111\u01a1n h\u00e0ng",
    search: "T\u00ecm \u0111\u01a1n",
    clear: "Xem t\u1ea5t c\u1ea3",
    emptyTitle: "B\u1ea1n ch\u01b0a c\u00f3 \u0111\u01a1n h\u00e0ng n\u00e0o",
    emptyText: "Khi b\u1ea1n ho\u00e0n t\u1ea5t checkout, \u0111\u01a1n h\u00e0ng s\u1ebd xu\u1ea5t hi\u1ec7n \u1edf \u0111\u00e2y.",
    noMatch: "Kh\u00f4ng t\u00ecm th\u1ea5y \u0111\u01a1n h\u00e0ng ph\u00f9 h\u1ee3p.",
    shop: "Mua s\u1eafm ngay",
    overview: "T\u1ed5ng quan \u0111\u01a1n h\u00e0ng",
    overviewText: "Theo d\u00f5i nhanh s\u1ed1 l\u01b0\u1ee3ng v\u00e0 ti\u1ebfn \u0111\u1ed9 c\u00e1c \u0111\u01a1n MOCO.",
    totalOrders: "T\u1ed5ng \u0111\u01a1n",
    activeOrders: "\u0110ang x\u1eed l\u00fd",
    completedOrders: "Ho\u00e0n t\u1ea5t",
    totalHint: "T\u1ea5t c\u1ea3 \u0111\u01a1n \u0111\u00e3 l\u01b0u",
    activeHint: "Ch\u01b0a giao ho\u00e0n t\u1ea5t",
    completedHint: "\u0110\u00e3 giao th\u00e0nh c\u00f4ng",
    orderList: "T\u1ea5t c\u1ea3 \u0111\u01a1n h\u00e0ng",
    orderCode: "M\u00e3 \u0111\u01a1n",
    orderDate: "Ng\u00e0y \u0111\u1eb7t",
    estimate: "D\u1ef1 ki\u1ebfn giao",
    total: "T\u1ed5ng thanh to\u00e1n",
    details: "Xem chi ti\u1ebft",
    itemCount: "s\u1ea3n ph\u1ea9m",
    paid: "\u0110\u00e3 thanh to\u00e1n",
    pending: "Thanh to\u00e1n khi nh\u1eadn h\u00e0ng",
    processing: "\u0110ang chu\u1ea9n b\u1ecb",
    shipping: "\u0110ang giao h\u00e0ng",
    delivered: "\u0110\u00e3 giao th\u00e0nh c\u00f4ng",
  },
  en: {
    kicker: "Order management",
    title: "Your orders",
    intro: "Review MOCO orders saved on this device. Select an order to see its status, payment details, and items.",
    searchPlaceholder: "Enter order code",
    search: "Find order",
    clear: "Show all",
    emptyTitle: "You do not have any orders yet",
    emptyText: "Once you complete checkout, your order will appear here.",
    noMatch: "No matching order was found.",
    shop: "Shop now",
    overview: "Order overview",
    overviewText: "Quickly review the number and progress of your MOCO orders.",
    totalOrders: "Total orders",
    activeOrders: "In progress",
    completedOrders: "Completed",
    totalHint: "All saved orders",
    activeHint: "Not delivered yet",
    completedHint: "Delivered orders",
    orderList: "All orders",
    orderCode: "Order code",
    orderDate: "Order date",
    estimate: "Estimated delivery",
    total: "Order total",
    details: "View details",
    itemCount: "items",
    paid: "Paid",
    pending: "Cash on delivery",
    processing: "Preparing",
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

export default function OrderPage() {
  const [orders, setOrders] = useState<MocoOrder[]>([]);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const { language } = useLanguage();
  const labels = copy[language];
  const currency = new Intl.NumberFormat("vi-VN").format;

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

  const visibleOrders = useMemo(() => {
    const normalizedQuery = submittedQuery.trim().toUpperCase();
    if (!normalizedQuery) return orders;

    return orders.filter((order) => order.code.toUpperCase().includes(normalizedQuery));
  }, [orders, submittedQuery]);
  const completedOrders = orders.filter((order) => getFulfillmentStatus(order) === "delivered").length;
  const activeOrders = orders.length - completedOrders;

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(query);
  };

  return (
    <main className="order-page">
      <section className="order-hero">
        <div className="order-hero-copy">
          <p className="order-kicker">{labels.kicker}</p>
          <h1>{labels.title}</h1>
          <p>{labels.intro}</p>
        </div>
        <form className="order-search" onSubmit={handleSearch}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.orderCode}
          />
          <button type="submit">{labels.search}</button>
        </form>
      </section>

      {orders.length > 0 && (
        <section className="order-overview" aria-label={labels.overview}>
          <div className="order-overview-heading">
            <h2>{labels.overview}</h2>
            <p>{labels.overviewText}</p>
          </div>
          <div className="order-metrics">
            <article className="order-metric-card">
              <div className="order-metric-icon" aria-hidden="true">01</div>
              <div>
                <span>{labels.totalOrders}</span>
                <strong>{orders.length}</strong>
                <small>{labels.totalHint}</small>
              </div>
            </article>
            <article className="order-metric-card">
              <div className="order-metric-icon" aria-hidden="true">02</div>
              <div>
                <span>{labels.activeOrders}</span>
                <strong>{activeOrders}</strong>
                <small>{labels.activeHint}</small>
              </div>
            </article>
            <article className="order-metric-card">
              <div className="order-metric-icon" aria-hidden="true">03</div>
              <div>
                <span>{labels.completedOrders}</span>
                <strong>{completedOrders}</strong>
                <small>{labels.completedHint}</small>
              </div>
            </article>
          </div>
        </section>
      )}

      {orders.length === 0 ? (
        <section className="order-empty">
          <h2>{labels.emptyTitle}</h2>
          <p>{labels.emptyText}</p>
          <Link href="/product">{labels.shop}</Link>
        </section>
      ) : visibleOrders.length === 0 ? (
        <section className="order-empty">
          <h2>{labels.noMatch}</h2>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSubmittedQuery("");
            }}
          >
            {labels.clear}
          </button>
        </section>
      ) : (
        <section className="order-list-section">
          <div className="order-list-heading">
            <h2>{labels.orderList}</h2>
            <span>{visibleOrders.length} / {orders.length}</span>
          </div>
          <div className="order-list-grid">
          {visibleOrders.map((order) => {
            const status = getFulfillmentStatus(order);
            const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

            return (
              <article className="order-list-card" data-status={status} key={order.code}>
                <div className="order-list-card-top">
                  <span>{labels[status]}</span>
                  <strong>{order.code}</strong>
                </div>
                <dl>
                  <div><dt>{labels.orderDate}</dt><dd>{formatDate(order.createdAt, language)}</dd></div>
                  <div><dt>{labels.estimate}</dt><dd>{formatDate(order.estimatedDelivery, language)}</dd></div>
                  <div><dt>{labels.total}</dt><dd>{currency(order.total)} VND</dd></div>
                </dl>
                <div className="order-list-card-footer">
                  <div>
                    <span>{itemCount} {labels.itemCount}</span>
                    <small>{order.paymentStatus === "paid" ? labels.paid : labels.pending}</small>
                  </div>
                  <Link href={`/order/${encodeURIComponent(order.code)}`}>{labels.details}</Link>
                </div>
              </article>
            );
          })}
          </div>
        </section>
      )}
    </main>
  );
}
