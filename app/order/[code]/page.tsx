"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLanguage } from "../../providers";
import { readCurrentUser } from "../../auth-storage";
import { showToast } from "../../toast";
import {
  cancelOrder,
  canUserManageOrder,
  getOrderActionBlockedMessage,
  getOrderState,
  updateOrderRecipient,
  type RecipientInfo,
} from "../order-management";

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
  status?: string;
  paymentStatus: "paid" | "pending";
  fulfillmentStatus?: "pending" | "processing" | "shipping" | "shipped" | "delivered" | "cancelled";
  shipping: string;
  payment: string;
  createdAt?: string;
  estimatedDelivery?: string;
  customer?: { email?: string; fullName?: string; phone?: string; address?: string };
  email?: string;
  fullName?: string;
  phone?: string;
  address?: string;
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
    recipient: "Th\u00f4ng tin nh\u1eadn h\u00e0ng",
    fullName: "H\u1ecd v\u00e0 t\u00ean",
    phone: "S\u1ed1 \u0111i\u1ec7n tho\u1ea1i",
    email: "Email",
    address: "\u0110\u1ecba ch\u1ec9",
    update: "C\u1eadp nh\u1eadt th\u00f4ng tin",
    cancel: "H\u1ee7y \u0111\u01a1n h\u00e0ng",
    save: "L\u01b0u thay \u0111\u1ed5i",
    close: "\u0110\u00f3ng",
    updateTitle: "C\u1eadp nh\u1eadt th\u00f4ng tin nh\u1eadn h\u00e0ng",
    cancelTitle: "X\u00e1c nh\u1eadn h\u1ee7y \u0111\u01a1n",
    cancelText: "B\u1ea1n c\u00f3 ch\u1eafc ch\u1eafn mu\u1ed1n h\u1ee7y \u0111\u01a1n h\u00e0ng n\u00e0y?",
    confirmCancel: "\u0110\u1ed3ng \u00fd h\u1ee7y",
    itemCount: "s\u1ea3n ph\u1ea9m",
    steps: ["\u0110\u00e3 \u0111\u1eb7t h\u00e0ng", "X\u00e1c nh\u1eadn thanh to\u00e1n", "\u0110ang chu\u1ea9n b\u1ecb", "\u0110ang giao h\u00e0ng", "Ho\u00e0n t\u1ea5t"],
    paid: "\u0110\u00e3 thanh to\u00e1n",
    pending: "Thanh to\u00e1n khi nh\u1eadn h\u00e0ng",
    pendingState: "Ch\u1edd x\u00e1c nh\u1eadn",
    confirmedState: "\u0110\u00e3 x\u00e1c nh\u1eadn",
    processing: "\u0110ang chu\u1ea9n b\u1ecb \u0111\u01a1n h\u00e0ng",
    shipping: "\u0110ang giao h\u00e0ng",
    delivered: "\u0110\u00e3 giao th\u00e0nh c\u00f4ng",
    cancelled: "\u0110\u00e3 h\u1ee7y",
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
    recipient: "Recipient information",
    fullName: "Full name",
    phone: "Phone number",
    email: "Email",
    address: "Address",
    update: "Update information",
    cancel: "Cancel order",
    save: "Save changes",
    close: "Close",
    updateTitle: "Update recipient information",
    cancelTitle: "Cancel order",
    cancelText: "Are you sure you want to cancel this order?",
    confirmCancel: "Confirm cancel",
    itemCount: "items",
    steps: ["Order placed", "Payment confirmed", "Preparing", "Out for delivery", "Completed"],
    paid: "Paid",
    pending: "Cash on delivery",
    pendingState: "Pending",
    confirmedState: "Confirmed",
    processing: "Preparing your order",
    shipping: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
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

function getFulfillmentStatus(order: MocoOrder): "processing" | "shipping" | "delivered" | "cancelled" {
  if (order.fulfillmentStatus === "cancelled" || order.status?.toUpperCase() === "CANCELLED") return "cancelled";
  if (order.fulfillmentStatus === "shipped") return "shipping";
  if (order.fulfillmentStatus === "shipping" || order.fulfillmentStatus === "delivered") return order.fulfillmentStatus;
  if (!order.createdAt) return "processing";

  const orderTime = new Date(order.createdAt).getTime();
  const ageInDays = (Date.now() - orderTime) / 86400000;

  if (ageInDays >= 4) return "delivered";
  if (ageInDays >= 1) return "shipping";
  return "processing";
}

function getActiveStep(order: MocoOrder) {
  const fulfillmentStatus = getFulfillmentStatus(order);

  if (fulfillmentStatus === "cancelled") return 0;
  if (fulfillmentStatus === "delivered") return 4;
  if (fulfillmentStatus === "shipping") return 3;
  return order.paymentStatus === "paid" ? 2 : 1;
}

function getRecipientInfo(order: MocoOrder): RecipientInfo {
  return {
    fullName: order.customer?.fullName || order.fullName || "",
    phone: order.customer?.phone || order.phone || "",
    email: order.customer?.email || order.email || "",
    address: order.customer?.address || order.address || "",
  };
}

export default function OrderDetailPage() {
  const params = useParams<{ code: string }>();
  const [orders, setOrders] = useState<MocoOrder[]>([]);
  const [isChecking, setIsChecking] = useState(true);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipientForm, setRecipientForm] = useState<RecipientInfo>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
  });
  const router = useRouter();
  const { language } = useLanguage();
  const labels = copy[language];
  const currency = new Intl.NumberFormat("vi-VN").format;
  const orderCode = decodeURIComponent(params?.code ?? "");

  useEffect(() => {
    const user = readCurrentUser();

    try {
      const rawOrders = window.localStorage.getItem("moco-orders");
      const rawLastOrder = window.localStorage.getItem("moco-last-order");
      let parsedOrders: MocoOrder[] = rawOrders ? JSON.parse(rawOrders) : [];
      let lastOrder: MocoOrder | null = rawLastOrder ? JSON.parse(rawLastOrder) : null;

      if (user) {
        parsedOrders = parsedOrders.filter((o) => o.customer?.email === user.email);
        if (lastOrder && lastOrder.customer?.email !== user.email) {
          lastOrder = null;
        }
      } else {
        parsedOrders = [];
        lastOrder = null;
      }

      const mergedOrders =
        lastOrder && !parsedOrders.some((order) => order.code === lastOrder.code)
          ? [lastOrder, ...parsedOrders]
          : parsedOrders;

      setOrders(mergedOrders);
    } catch {
      setOrders([]);
    } finally {
      setIsChecking(false);
    }
  }, [router]);

  const order = useMemo(
    () => orders.find((item) => item.code.toUpperCase() === orderCode.toUpperCase()) ?? null,
    [orders, orderCode],
  );

  useEffect(() => {
    if (order) {
      setRecipientForm(getRecipientInfo(order));
    }
  }, [order]);

  const patchOrderInState = (code: string, patch: Partial<MocoOrder>) => {
    setOrders((current) =>
      current.map((item) =>
        item.code.toUpperCase() === code.toUpperCase()
          ? {
              ...item,
              ...patch,
              customer: {
                ...(item.customer || {}),
                ...(patch.customer || {}),
              },
            }
          : item,
      ),
    );
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!order) return;

    if (!canUserManageOrder(order)) {
      showToast(getOrderActionBlockedMessage(order), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateOrderRecipient(order.code, recipientForm);
      patchOrderInState(order.code, {
        ...recipientForm,
        customer: recipientForm,
      });
      setIsUpdateOpen(false);
      showToast("Th\u00f4ng tin \u0111\u01a1n h\u00e0ng \u0111\u00e3 \u0111\u01b0\u1ee3c c\u1eadp nh\u1eadt.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : getOrderActionBlockedMessage(order), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;

    if (!canUserManageOrder(order)) {
      showToast(getOrderActionBlockedMessage(order), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await cancelOrder(order.code);
      patchOrderInState(order.code, {
        status: "CANCELLED",
        fulfillmentStatus: "cancelled",
      });
      setIsCancelOpen(false);
      showToast("\u0110\u01a1n h\u00e0ng \u0111\u00e3 \u0111\u01b0\u1ee3c h\u1ee7y th\u00e0nh c\u00f4ng.", "info");
    } catch (error) {
      showToast(error instanceof Error ? error.message : getOrderActionBlockedMessage(order), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) return null;

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
  const orderState = getOrderState(order);
  const canManageOrder = canUserManageOrder(order);
  const recipient = getRecipientInfo(order);
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const statusLabel =
    orderState === "PENDING"
      ? labels.pendingState
      : orderState === "CONFIRMED"
        ? labels.confirmedState
        : orderState === "SHIPPING"
          ? labels.shipping
          : orderState === "DELIVERED"
            ? labels.delivered
            : labels.cancelled;

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
              <span>{statusLabel}</span>
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
          <div className="order-recipient-block">
            <h3>{labels.recipient}</h3>
            <p>{recipient.fullName || "-"}</p>
            <p>{recipient.phone || "-"}</p>
            <p>{recipient.email || "-"}</p>
            <p>{recipient.address || "-"}</p>
          </div>
          {canManageOrder && (
            <div className="order-action-row">
              <button type="button" onClick={() => setIsUpdateOpen(true)}>
                {labels.update}
              </button>
              <button type="button" className="danger" onClick={() => setIsCancelOpen(true)}>
                {labels.cancel}
              </button>
            </div>
          )}
        </aside>
      </section>

      {isUpdateOpen && (
        <div className="order-modal-backdrop" role="presentation">
          <form className="order-modal" onSubmit={handleUpdate}>
            <h2>{labels.updateTitle}</h2>
            <label>
              <span>{labels.fullName}</span>
              <input
                required
                value={recipientForm.fullName}
                onChange={(event) => setRecipientForm((current) => ({ ...current, fullName: event.target.value }))}
              />
            </label>
            <label>
              <span>{labels.phone}</span>
              <input
                required
                value={recipientForm.phone}
                onChange={(event) => setRecipientForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
            <label>
              <span>{labels.email}</span>
              <input
                type="email"
                value={recipientForm.email}
                onChange={(event) => setRecipientForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label>
              <span>{labels.address}</span>
              <textarea
                required
                value={recipientForm.address}
                onChange={(event) => setRecipientForm((current) => ({ ...current, address: event.target.value }))}
              />
            </label>
            <div className="order-modal-actions">
              <button type="button" onClick={() => setIsUpdateOpen(false)} disabled={isSubmitting}>
                {labels.close}
              </button>
              <button type="submit" disabled={isSubmitting}>
                {labels.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {isCancelOpen && (
        <div className="order-modal-backdrop" role="presentation">
          <div className="order-modal order-confirm-dialog" role="dialog" aria-modal="true">
            <h2>{labels.cancelTitle}</h2>
            <p>{labels.cancelText}</p>
            <div className="order-modal-actions">
              <button type="button" onClick={() => setIsCancelOpen(false)} disabled={isSubmitting}>
                {labels.close}
              </button>
              <button type="button" className="danger" onClick={handleCancel} disabled={isSubmitting}>
                {labels.confirmCancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
