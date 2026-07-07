"use client";

import {
  canModifyOrder,
  getBlockedOrderMessage,
  normalizeOrderState,
  type OrderState,
  type OrderStateInput,
} from "@/lib/order-state";

export type RecipientInfo = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
};

export type StoredOrder = OrderStateInput & {
  code: string;
  customer?: Partial<RecipientInfo>;
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
};

function updateOrderShape<T extends StoredOrder>(order: T, updates: Partial<RecipientInfo>): T {
  return {
    ...order,
    ...updates,
    customer: {
      ...(order.customer || {}),
      ...updates,
    },
  };
}

export function getOrderState(order: OrderStateInput): OrderState {
  return normalizeOrderState(order);
}

export function canUserManageOrder(order: OrderStateInput) {
  return canModifyOrder(order);
}

export function getOrderActionBlockedMessage(order: OrderStateInput) {
  return getBlockedOrderMessage(order);
}

export function syncStoredOrder(code: string, updater: (order: StoredOrder) => StoredOrder) {
  const normalizedCode = code.toUpperCase();
  const rawOrders = window.localStorage.getItem("moco-orders");
  const rawLastOrder = window.localStorage.getItem("moco-last-order");
  const orders: StoredOrder[] = rawOrders ? JSON.parse(rawOrders) : [];
  const nextOrders = orders.map((order) =>
    order.code.toUpperCase() === normalizedCode ? updater(order) : order,
  );

  window.localStorage.setItem("moco-orders", JSON.stringify(nextOrders));

  if (rawLastOrder) {
    const lastOrder: StoredOrder = JSON.parse(rawLastOrder);
    if (lastOrder.code.toUpperCase() === normalizedCode) {
      window.localStorage.setItem("moco-last-order", JSON.stringify(updater(lastOrder)));
    }
  }

  return nextOrders;
}

export async function updateOrderRecipient(code: string, updates: RecipientInfo) {
  const response = await fetch(`/api/orders/${encodeURIComponent(code)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "update", recipient: updates }),
  });
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt \u0111\u01a1n h\u00e0ng.");
  }

  syncStoredOrder(code, (order) => updateOrderShape(order, updates));
  return data.order;
}

export async function cancelOrder(code: string) {
  const response = await fetch(`/api/orders/${encodeURIComponent(code)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "cancel" }),
  });
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Kh\u00f4ng th\u1ec3 h\u1ee7y \u0111\u01a1n h\u00e0ng.");
  }

  syncStoredOrder(code, (order) => ({
    ...order,
    status: "CANCELLED",
    fulfillmentStatus: "cancelled",
  }));

  return data.order;
}
