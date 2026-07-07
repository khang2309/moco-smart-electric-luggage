export type OrderState = "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED";

export type OrderStateInput = {
  status?: string | null;
  fulfillmentStatus?: string | null;
  paymentStatus?: string | null;
};

const editableStates: OrderState[] = ["PENDING", "CONFIRMED"];

export function normalizeOrderState(order: OrderStateInput): OrderState {
  const rawStatus = String(order.status || "").trim().toUpperCase();
  const rawFulfillment = String(order.fulfillmentStatus || "").trim().toUpperCase();

  if (rawStatus === "CANCELLED" || rawFulfillment === "CANCELLED") return "CANCELLED";
  if (rawStatus === "DELIVERED" || rawFulfillment === "DELIVERED") return "DELIVERED";
  if (
    rawStatus === "SHIPPING" ||
    rawStatus === "SHIPPED" ||
    rawFulfillment === "SHIPPING" ||
    rawFulfillment === "SHIPPED"
  ) {
    return "SHIPPING";
  }
  if (rawStatus === "CONFIRMED" || rawStatus === "PROCESSING" || rawFulfillment === "PROCESSING") {
    return "CONFIRMED";
  }

  return "PENDING";
}

export function canModifyOrder(order: OrderStateInput) {
  return editableStates.includes(normalizeOrderState(order));
}

export function getBlockedOrderMessage(order: OrderStateInput) {
  const state = normalizeOrderState(order);

  if (state === "SHIPPING") return "Kh\u00f4ng th\u1ec3 thao t\u00e1c! \u0110\u01a1n h\u00e0ng n\u00e0y \u0111ang \u0111\u01b0\u1ee3c giao.";
  if (state === "DELIVERED") return "Kh\u00f4ng th\u1ec3 thao t\u00e1c! \u0110\u01a1n h\u00e0ng n\u00e0y \u0111\u00e3 \u0111\u01b0\u1ee3c giao.";
  if (state === "CANCELLED") return "Kh\u00f4ng th\u1ec3 thao t\u00e1c! \u0110\u01a1n h\u00e0ng n\u00e0y \u0111\u00e3 b\u1ecb h\u1ee7y.";

  return "Kh\u00f4ng th\u1ec3 thao t\u00e1c v\u1edbi \u0111\u01a1n h\u00e0ng n\u00e0y.";
}

export function toFulfillmentStatus(state: OrderState) {
  if (state === "SHIPPING") return "shipping";
  if (state === "DELIVERED") return "delivered";
  if (state === "CANCELLED") return "cancelled";
  return "processing";
}
