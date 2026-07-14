import { ObjectId, type Db, type Document } from "mongodb";

export const WARRANTY_COLLECTION = "registrations";
export const WARRANTY_HISTORY_COLLECTION = "warrantyHistory";
export const WARRANTY_EXTENSION_COLLECTION = "warrantyExtensions";
export const DEFAULT_WARRANTY_MONTHS = 12;

export type WarrantyStatus = "PENDING" | "REJECTED" | "ACTIVE" | "EXPIRED" | "EXTENDED";

type OrderDocument = Document & {
  code?: string;
  email?: string;
  items?: Array<{ name?: string; slug?: string; price?: number; variantId?: string; variant?: string }>;
  status?: string;
  fulfillmentStatus?: string;
  invoiceDate?: Date | string;
  deliveredAt?: Date | string;
  updatedAt?: Date | string;
};

const STATUS_MAP: Record<string, WarrantyStatus> = {
  pending: "PENDING",
  rejected: "REJECTED",
  active: "ACTIVE",
  expired: "EXPIRED",
  extended: "EXTENDED",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  EXTENDED: "EXTENDED",
};

export function normalizeWarrantyStatus(status: unknown): WarrantyStatus {
  return STATUS_MAP[String(status || "pending")] || "PENDING";
}

export function asDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function addMonths(date: Date, months: number) {
  const result = new Date(date);
  const originalDay = result.getUTCDate();
  result.setUTCMonth(result.getUTCMonth() + months + 1, 0);
  result.setUTCDate(Math.min(originalDay, result.getUTCDate()));
  return result;
}

export function isDeliveredOrder(order: OrderDocument) {
  return [order.status, order.fulfillmentStatus]
    .map((value) => String(value || "").toLowerCase())
    .some((value) => value === "delivered");
}

function getInvoiceDate(order: OrderDocument) {
  return asDate(order.invoiceDate) || asDate(order.deliveredAt) || asDate(order.updatedAt);
}

function displayDate(value: unknown) {
  const date = asDate(value);
  return date ? date.toISOString().slice(0, 10) : "";
}

function warrantySerialFilter(serialNumber: string) {
  return { $or: [{ serialNumber }, { serial: serialNumber }] };
}

export async function ensureWarrantyIndexes(db: Db) {
  await Promise.all([
    db.collection(WARRANTY_COLLECTION).createIndex({ serialNumber: 1, status: 1 }),
    db.collection(WARRANTY_COLLECTION).createIndex({ customerEmail: 1, createdAt: -1 }),
    db.collection(WARRANTY_COLLECTION).createIndex({ warrantyEnd: 1, status: 1 }),
    db.collection(WARRANTY_HISTORY_COLLECTION).createIndex({ warrantyId: 1, createdAt: -1 }),
    db.collection(WARRANTY_EXTENSION_COLLECTION).createIndex({ warrantyId: 1, createdAt: -1 }),
  ]);
}

export async function writeWarrantyHistory(
  db: Db,
  warrantyId: ObjectId,
  oldStatus: WarrantyStatus | null,
  newStatus: WarrantyStatus,
  action: string,
  performedBy: string,
  details: Record<string, unknown> = {},
) {
  await db.collection(WARRANTY_HISTORY_COLLECTION).insertOne({
    warrantyId,
    oldStatus,
    newStatus,
    action,
    performedBy,
    details,
    createdAt: new Date(),
  });
}

export async function synchronizeWarrantyStatus(db: Db, warranty: Document): Promise<Document> {
  const currentStatus = normalizeWarrantyStatus(warranty.status);
  const warrantyEnd = asDate(warranty.warrantyEnd);
  const isExpired = Boolean(warrantyEnd && new Date() > warrantyEnd);
  const nextStatus: WarrantyStatus = isExpired ? "EXPIRED" : currentStatus;

  if (nextStatus !== currentStatus || warranty.status !== nextStatus) {
    await db.collection(WARRANTY_COLLECTION).updateOne(
      { _id: warranty._id },
      { $set: { status: nextStatus, updatedAt: new Date() } },
    );
    if (nextStatus !== currentStatus) {
      await writeWarrantyHistory(db, warranty._id, currentStatus, nextStatus, "AUTO_EXPIRE", "system");
    }
  }

  return { ...warranty, status: nextStatus } as Document;
}

export function serializeWarranty(warranty: Document) {
  const status = normalizeWarrantyStatus(warranty.status);
  const warrantyEnd = asDate(warranty.warrantyEnd);
  const remainingMilliseconds = warrantyEnd ? warrantyEnd.getTime() - Date.now() : 0;
  const remainingDays = warrantyEnd ? Math.max(0, Math.ceil(remainingMilliseconds / 86_400_000)) : null;
  const remainingMonths = remainingDays === null ? null : Math.max(0, Math.floor(remainingDays / 30));
  const currentStatus: WarrantyStatus = warrantyEnd && Date.now() > warrantyEnd.getTime() ? "EXPIRED" : status;

  return {
    ...warranty,
    _id: warranty._id.toString(),
    status: currentStatus,
    currentStatus,
    serialNumber: warranty.serialNumber || warranty.serial || "",
    serial: warranty.serialNumber || warranty.serial || "",
    customerEmail: warranty.customerEmail || warranty.userEmail || warranty.contact || "",
    userEmail: warranty.customerEmail || warranty.userEmail || null,
    invoiceDate: displayDate(warranty.invoiceDate || warranty.purchaseDate),
    purchaseDate: displayDate(warranty.invoiceDate || warranty.purchaseDate) || warranty.purchaseDate || "",
    warrantyStart: displayDate(warranty.warrantyStart || warranty.invoiceDate || warranty.purchaseDate),
    warrantyEnd: displayDate(warranty.warrantyEnd),
    warrantyExpiry: displayDate(warranty.warrantyEnd) || warranty.warrantyExpiry || "",
    defaultWarrantyMonths: Number(warranty.defaultWarrantyMonths || DEFAULT_WARRANTY_MONTHS),
    extensionMonths: Number(warranty.extensionMonths || 0),
    remainingDays,
    remainingMonths,
  };
}

export async function listWarranties(db: Db, filter: Document = {}) {
  await ensureWarrantyIndexes(db);
  const warranties = await db.collection(WARRANTY_COLLECTION).find(filter).sort({ createdAt: -1 }).toArray();
  return Promise.all(warranties.map(async (warranty) => serializeWarranty(await synchronizeWarrantyStatus(db, warranty))));
}

export async function registerWarranty(
  db: Db,
  input: {
    orderCode?: string;
    orderItemIndex?: number | string;
    serial?: string;
    contact?: string;
    userEmail?: string;
    invoiceImage?: string | null;
    language?: string;
  },
) {
  await ensureWarrantyIndexes(db);
  const orderCode = String(input.orderCode || "").trim();
  const serialNumber = String(input.serial || "").trim().toUpperCase();
  const orderItemIndex = Number(input.orderItemIndex);
  const customerEmail = String(input.userEmail || input.contact || "").trim().toLowerCase();

  if (!orderCode || !serialNumber || !customerEmail || !Number.isInteger(orderItemIndex) || orderItemIndex < 0) {
    throw new Error("A delivered order, order item, serial number, and customer email are required.");
  }

  const order = await db.collection<OrderDocument>("orders").findOne({ code: orderCode });
  if (!order || !isDeliveredOrder(order)) {
    throw new Error("Warranty registration requires a delivered order.");
  }
  if (String(order.email || "").trim().toLowerCase() !== customerEmail) {
    throw new Error("The delivered order does not belong to this customer.");
  }

  const item = order.items?.[orderItemIndex];
  const invoiceDate = getInvoiceDate(order);
  if (!item || !invoiceDate) {
    throw new Error("The delivered order is missing invoice information.");
  }

  const existing = await db.collection(WARRANTY_COLLECTION).findOne(warrantySerialFilter(serialNumber));
  const now = new Date();
  const defaultWarrantyMonths = DEFAULT_WARRANTY_MONTHS;
  const warrantyEnd = addMonths(invoiceDate, defaultWarrantyMonths);

  if (existing && normalizeWarrantyStatus(existing.status) !== "REJECTED") {
    throw new Error("This serial number already has a warranty registration.");
  }

  const document = {
    schemaVersion: 2,
    customerEmail,
    customerId: customerEmail,
    userEmail: customerEmail,
    contact: input.contact || customerEmail,
    orderId: order._id,
    orderCode,
    orderItemId: String(orderItemIndex),
    productId: item.slug || item.name || "",
    variantId: item.variantId || item.variant || "",
    model: item.name || "MOCO product",
    serialNumber,
    serial: serialNumber,
    invoiceDate,
    registrationDate: now,
    warrantyStart: invoiceDate,
    warrantyEnd,
    defaultWarrantyMonths,
    extensionMonths: 0,
    invoiceImage: input.invoiceImage || null,
    status: "PENDING" as WarrantyStatus,
    rejectedReason: null,
    approvedBy: null,
    approvedDate: null,
    createdAt: now,
    updatedAt: now,
  };

  if (existing) {
    const oldStatus = normalizeWarrantyStatus(existing.status);
    await db.collection(WARRANTY_COLLECTION).updateOne({ _id: existing._id }, { $set: document });
    await writeWarrantyHistory(db, existing._id, oldStatus, "PENDING", "RESUBMIT", customerEmail);
    return { id: existing._id.toString(), warranty: serializeWarranty({ ...existing, ...document }) };
  }

  const result = await db.collection(WARRANTY_COLLECTION).insertOne(document);
  await writeWarrantyHistory(db, result.insertedId, null, "PENDING", "REGISTER", customerEmail);
  return { id: result.insertedId.toString(), warranty: serializeWarranty({ _id: result.insertedId, ...document }) };
}

export async function getEligibleWarrantyOrders(db: Db, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const orders = await db.collection<OrderDocument>("orders").find({ email: normalizedEmail }).sort({ updatedAt: -1 }).toArray();
  return orders
    .filter((order) => isDeliveredOrder(order) && getInvoiceDate(order))
    .flatMap((order) => (order.items || []).map((item, index) => ({
      orderCode: order.code,
      orderItemIndex: index,
      model: item.name || "MOCO product",
      invoiceDate: displayDate(getInvoiceDate(order)),
    })));
}

export async function updateWarrantyByAdmin(
  db: Db,
  id: string,
  input: { action?: string; rejectionReason?: string; months?: number | string; price?: number | string; performedBy?: string },
) {
  if (!ObjectId.isValid(id)) throw new Error("Invalid warranty ID.");
  const warrantyId = new ObjectId(id);
  const warranty = await db.collection(WARRANTY_COLLECTION).findOne({ _id: warrantyId });
  if (!warranty) throw new Error("Warranty not found.");

  const synchronized = await synchronizeWarrantyStatus(db, warranty);
  const oldStatus = normalizeWarrantyStatus(synchronized.status);
  const performedBy = input.performedBy || "admin";
  const action = String(input.action || "").toLowerCase();
  const now = new Date();

  if (action === "approve") {
    if (oldStatus !== "PENDING") throw new Error("Only pending warranties can be approved.");
    if (asDate(synchronized.warrantyEnd) && now > asDate(synchronized.warrantyEnd)!) {
      throw new Error("Expired warranty registrations cannot be approved.");
    }
    await db.collection(WARRANTY_COLLECTION).updateOne({ _id: warrantyId }, { $set: { status: "ACTIVE", approvedBy: performedBy, approvedDate: now, updatedAt: now } });
    await writeWarrantyHistory(db, warrantyId, oldStatus, "ACTIVE", "APPROVE", performedBy);
  } else if (action === "reject") {
    const rejectionReason = String(input.rejectionReason || "").trim();
    if (oldStatus !== "PENDING") throw new Error("Only pending warranties can be rejected.");
    if (!rejectionReason) throw new Error("A rejection reason is required.");
    await db.collection(WARRANTY_COLLECTION).updateOne({ _id: warrantyId }, { $set: { status: "REJECTED", rejectedReason: rejectionReason, approvedBy: null, approvedDate: null, updatedAt: now } });
    await writeWarrantyHistory(db, warrantyId, oldStatus, "REJECTED", "REJECT", performedBy, { rejectionReason });
  } else if (action === "extend") {
    const months = Number(input.months);
    const price = Number(input.price || 0);
    if (!Number.isInteger(months) || months <= 0) throw new Error("Extension months must be a positive whole number.");
    if (!Number.isFinite(price) || price < 0) throw new Error("Extension price is invalid.");
    if (!["ACTIVE", "EXTENDED"].includes(oldStatus)) throw new Error("Only active warranties can be extended.");
    const totalExtensionMonths = Number(synchronized.extensionMonths || 0) + months;
    const warrantyStart = asDate(synchronized.warrantyStart);
    if (!warrantyStart) throw new Error("Warranty start date is missing.");
    const warrantyEnd = addMonths(warrantyStart, Number(synchronized.defaultWarrantyMonths || DEFAULT_WARRANTY_MONTHS) + totalExtensionMonths);
    await db.collection(WARRANTY_EXTENSION_COLLECTION).insertOne({ warrantyId, months, purchaseDate: now, price, createdBy: performedBy, createdAt: now });
    await db.collection(WARRANTY_COLLECTION).updateOne({ _id: warrantyId }, { $set: { status: "EXTENDED", extensionMonths: totalExtensionMonths, warrantyEnd, updatedAt: now } });
    await writeWarrantyHistory(db, warrantyId, oldStatus, "EXTENDED", "EXTEND", performedBy, { months, price, totalExtensionMonths });
  } else {
    throw new Error("Unsupported warranty action.");
  }

  const updated = await db.collection(WARRANTY_COLLECTION).findOne({ _id: warrantyId });
  return serializeWarranty(await synchronizeWarrantyStatus(db, updated!));
}
