import type { Db, Document } from "mongodb";

const CACHE_TTL_MS = 45_000;
const cache = new Map<string, { expiresAt: number; value: DashboardData }>();

export type DashboardFilters = {
  range?: string;
  start?: string;
  end?: string;
  payment?: string;
  status?: string;
  shipping?: string;
  product?: string;
  customer?: string;
};

export type DashboardData = {
  generatedAt: string;
  financialDataComplete: boolean;
  kpis: Record<string, number | null>;
  statuses: Record<string, number>;
  revenueTrend: { label: string; revenue: number; orders: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  lowStock: { name: string; stock: number }[];
  wishlistInsights: { name: string; slug: string; count: number; stock: number; category: string; brand: string }[];
  recentOrders: Document[];
};

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function resolveRange(filters: DashboardFilters) {
  const now = new Date();
  const today = startOfDay(now);
  const start = new Date(today);
  const end = new Date(now);
  const range = filters.range || "month";
  if (range === "today") return { start: today, end };
  if (range === "yesterday") { start.setDate(start.getDate() - 1); end.setTime(today.getTime() - 1); return { start, end }; }
  if (range === "week") { start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); return { start, end }; }
  if (range === "lastWeek") { start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - 7); end.setTime(start.getTime() + 7 * 86_400_000 - 1); return { start, end }; }
  if (range === "lastMonth") { start.setMonth(start.getMonth() - 1, 1); end.setTime(new Date(now.getFullYear(), now.getMonth(), 1).getTime() - 1); return { start, end }; }
  if (range === "quarter") { start.setMonth(Math.floor(start.getMonth() / 3) * 3, 1); return { start, end }; }
  if (range === "year") { start.setMonth(0, 1); return { start, end }; }
  if (range === "custom" && filters.start && filters.end) return { start: startOfDay(new Date(filters.start)), end: new Date(`${filters.end}T23:59:59.999`) };
  start.setDate(1);
  return { start, end };
}

function statusOf(order: Document) {
  const candidates = [String(order.fulfillmentStatus || "").toLowerCase(), String(order.status || "").toLowerCase()];
  const raw = candidates.find((value) => ["pending", "processing", "confirmed", "shipping", "shipped", "delivered", "completed", "cancelled", "canceled", "refunded", "refund"].includes(value)) || "pending";
  if (["delivered", "completed"].includes(raw)) return "completed";
  if (["shipping", "shipped"].includes(raw)) return "shipping";
  if (["cancelled", "canceled"].includes(raw)) return "cancelled";
  if (["refunded", "refund"].includes(raw)) return "refunded";
  return raw === "processing" ? "processing" : "pending";
}

function toDate(value: unknown) {
  const date = value instanceof Date ? value : new Date(String(value || ""));
  return Number.isNaN(date.getTime()) ? null : date;
}

function cacheKey(filters: DashboardFilters) { return JSON.stringify(filters); }

export async function getDashboardData(db: Db, filters: DashboardFilters): Promise<DashboardData> {
  const key = cacheKey(filters);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const { start, end } = resolveRange(filters);
  const orders = await db.collection("orders").aggregate<Document>([
    { $addFields: { dashboardCreatedAt: { $convert: { input: "$createdAt", to: "date", onError: null, onNull: null } } } },
    { $match: { dashboardCreatedAt: { $gte: start, $lte: end } } },
    { $sort: { dashboardCreatedAt: -1 } },
  ]).toArray();

  const filteredOrders = orders.filter((order) => {
    const status = statusOf(order);
    const matchesStatus = !filters.status || status === filters.status;
    const matchesPayment = !filters.payment || String(order.payment || "").toLowerCase().includes(filters.payment.toLowerCase());
    const matchesShipping = !filters.shipping || String(order.shipping || "").toLowerCase().includes(filters.shipping.toLowerCase());
    const matchesCustomer = !filters.customer || [order.fullName, order.email, order.phone].some((value) => String(value || "").toLowerCase().includes(filters.customer!.toLowerCase()));
    const matchesProduct = !filters.product || (Array.isArray(order.items) && order.items.some((item: Document) => String(item.name || item.slug || "").toLowerCase().includes(filters.product!.toLowerCase())));
    return matchesStatus && matchesPayment && matchesShipping && matchesCustomer && matchesProduct;
  });

  const statuses = { pending: 0, processing: 0, shipping: 0, completed: 0, cancelled: 0, refunded: 0 };
  const products = new Map<string, { quantity: number; revenue: number }>();
  let completedRevenue = 0;
  let refunds = 0;
  let productCost = 0;
  let shippingCost = 0;
  let voucherDiscount = 0;
  let paymentFee = 0;
  let operatingExpenses = 0;
  let financialDataComplete = true;

  for (const order of filteredOrders) {
    const status = statusOf(order);
    if (status in statuses) statuses[status as keyof typeof statuses] += 1;
    const total = Number(order.total) || 0;
    if (status === "refunded") { refunds += Number(order.refundAmount ?? total) || 0; continue; }
    if (status !== "completed") continue;
    completedRevenue += total;
    shippingCost += Number(order.shippingCost || 0);
    voucherDiscount += Number(order.discount || order.voucherDiscount || 0);
    paymentFee += Number(order.paymentFee || order.transactionFee || 0);
    operatingExpenses += Number(order.operatingExpenses || 0) + Number(order.marketingExpenses || 0) + Number(order.otherExpenses || 0);
    const items = Array.isArray(order.items) ? order.items : [];
    if (items.length === 0) financialDataComplete = false;
    for (const item of items) {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const name = String(item.name || item.slug || "Product");
      const itemRevenue = (Number(item.price) || 0) * quantity;
      const product = products.get(name) || { quantity: 0, revenue: 0 };
      product.quantity += quantity;
      product.revenue += itemRevenue;
      products.set(name, product);
      const itemCost = Number(item.costPrice ?? item.cost);
      if (!Number.isFinite(itemCost)) financialDataComplete = false;
      else productCost += itemCost * quantity;
    }
  }

  const recognizedRevenue = completedRevenue - refunds;
  // Revenue KPI includes refunds. Gross profit is calculated before refund deductions;
  // refunds are subtracted once in net profit, alongside operating expenses.
  const grossProfit = financialDataComplete ? completedRevenue - productCost - shippingCost - voucherDiscount - paymentFee : null;
  const netProfit = grossProfit === null ? null : grossProfit - operatingExpenses - refunds;
  const revenueTrendMap = new Map<string, { revenue: number; orders: number }>();
  for (const order of filteredOrders) {
    const status = statusOf(order);
    if (status !== "completed" && status !== "refunded") continue;
    const date = toDate(order.dashboardCreatedAt || order.createdAt);
    if (!date) continue;
    const keyLabel = date.toLocaleDateString("en-CA");
    const row = revenueTrendMap.get(keyLabel) || { revenue: 0, orders: 0 };
    if (status === "completed") {
      row.revenue += Number(order.total) || 0;
      row.orders += 1;
    } else {
      row.revenue -= Number(order.refundAmount ?? order.total) || 0;
    }
    revenueTrendMap.set(keyLabel, row);
  }

  const [users, productsList, wishlistInsights] = await Promise.all([
    db.collection("users").find({}, { projection: { role: 1, createdAt: 1 } }).toArray(),
    db.collection("products").find({}, { projection: { name: 1, stock: 1 } }).toArray(),
    db.collection("wishlists").aggregate<Document>([
      { $group: { _id: "$productSlug", count: { $sum: 1 } } },
      { $lookup: { from: "products", localField: "_id", foreignField: "slug", as: "product" } },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, slug: "$_id", count: 1, name: { $ifNull: ["$product.name", "Unknown product"] }, stock: { $ifNull: ["$product.stock", 0] }, category: { $ifNull: ["$product.category", "Uncategorized"] }, brand: { $ifNull: ["$product.brand", "$product.store"] } } },
    ]).toArray(),
  ]);
  const today = startOfDay(new Date());
  const customers = users.filter((user) => String(user.role || "customer").toLowerCase() === "customer");
  const data: DashboardData = {
    generatedAt: new Date().toISOString(),
    financialDataComplete,
    kpis: { totalRevenue: recognizedRevenue, grossProfit, netProfit, completedOrders: statuses.completed, processingOrders: statuses.processing + statuses.shipping, pendingOrders: statuses.pending, cancelledOrders: statuses.cancelled, refundedOrders: statuses.refunded, totalCustomers: customers.length, newCustomersToday: customers.filter((user) => { const date = toDate(user.createdAt); return Boolean(date && date >= today); }).length, totalProducts: productsList.length, lowStockProducts: productsList.filter((product) => Number(product.stock) > 0 && Number(product.stock) <= 5).length, averageOrderValue: statuses.completed ? completedRevenue / statuses.completed : 0, refunds, totalWishlistItems: wishlistInsights.reduce((sum, item) => sum + Number(item.count || 0), 0) },
    statuses,
    revenueTrend: Array.from(revenueTrendMap, ([label, value]) => ({ label, ...value })).sort((a, b) => a.label.localeCompare(b.label)),
    topProducts: Array.from(products, ([name, value]) => ({ name, ...value })).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    lowStock: productsList.filter((product) => Number(product.stock) <= 5).map((product) => ({ name: String(product.name || "Product"), stock: Number(product.stock) || 0 })).slice(0, 5),
    wishlistInsights: wishlistInsights.map((item) => ({ name: String(item.name), slug: String(item.slug), count: Number(item.count || 0), stock: Number(item.stock || 0), category: String(item.category || "Uncategorized"), brand: String(item.brand || "Unknown") })),
    recentOrders: filteredOrders.slice(0, 8),
  };
  cache.set(key, { value: data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}
