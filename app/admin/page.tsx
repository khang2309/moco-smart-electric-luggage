"use client";


import { useLanguage } from "@/app/providers";
import { useEffect, useMemo, useState } from "react";

type AdminOrder = {
  _id?: string;
  code?: string;
  total?: number;
  status?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  fullName?: string;
  email?: string;
  createdAt?: string;
  items?: { quantity?: number }[];
};

type DashboardStats = {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  monthRevenue: number;
  averageOrderValue: number;
  completedOrders: number;
  pendingOrders: number;
  processingOrders: number;
};

const dashboardLabels = {
  vi: {
    analytics: "MOCO Analytics",
    title: "Dashboard quản trị",
    subtitle:
      "Theo dõi doanh thu, tình trạng đơn hàng, sản phẩm và người dùng theo dữ liệu mới nhất.",
    loading: "Đang tải dữ liệu dashboard...",
    totalRevenue: "Tổng doanh thu",
    monthRevenue: "Doanh thu tháng này",
    averageOrderValue: "Giá trị đơn TB",
    totalOrders: "Tổng đơn hàng",
    revenueReport: "Báo cáo doanh thu 6 tháng",
    revenueReportSub: "Tổng doanh thu và số đơn theo từng tháng.",
    orderStatus: "Tình trạng đơn hàng",
    pending: "Chờ xử lý",
    processing: "Đang xử lý/giao",
    completed: "Hoàn tất",
    operationOverview: "Tổng quan vận hành",
    users: "Người dùng",
    products: "Sản phẩm",
    completionRate: "Tỷ lệ hoàn tất",
    recentOrders: "Đơn hàng gần đây",
    recentOrdersSub: "5 đơn mới nhất trong hệ thống.",
    viewAll: "Xem tất cả",
    noOrders: "Chưa có đơn hàng nào.",
    orderCode: "Mã đơn",
    customer: "Khách hàng",
    revenue: "Doanh thu",
    date: "Ngày",
    retailCustomer: "Khách lẻ",
    orderUnit: "đơn",
  },
  en: {
    analytics: "MOCO Analytics",
    title: "Admin Dashboard",
    subtitle:
      "Track revenue, order status, products, and users from the latest system data.",
    loading: "Loading dashboard data...",
    totalRevenue: "Total revenue",
    monthRevenue: "This month revenue",
    averageOrderValue: "Average order value",
    totalOrders: "Total orders",
    revenueReport: "6-month revenue report",
    revenueReportSub: "Monthly revenue and order volume.",
    orderStatus: "Order status",
    pending: "Pending",
    processing: "Processing/shipping",
    completed: "Completed",
    operationOverview: "Operations overview",
    users: "Users",
    products: "Products",
    completionRate: "Completion rate",
    recentOrders: "Recent orders",
    recentOrdersSub: "The 5 newest orders in the system.",
    viewAll: "View all",
    noOrders: "No orders yet.",
    orderCode: "Order code",
    customer: "Customer",
    revenue: "Revenue",
    date: "Date",
    retailCustomer: "Retail customer",
    orderUnit: "orders",
  },
} as const;

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function getOrderDate(order: AdminOrder) {
  const date = order.createdAt ? new Date(order.createdAt) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function getOrderStatus(order: AdminOrder) {
  return order.fulfillmentStatus || order.status || "pending";
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getLastSixMonths(locale: string) {
  const months: { key: string; label: string }[] = [];
  const now = new Date();

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    months.push({
      key: getMonthKey(date),
      label: date.toLocaleDateString(locale, { month: "short" }),
    });
  }

  return months;
}

function getLocalOrders(): AdminOrder[] {
  try {
    const rawOrders = window.localStorage.getItem("moco-orders");
    const rawLastOrder = window.localStorage.getItem("moco-last-order");
    const parsedOrders: AdminOrder[] = rawOrders ? JSON.parse(rawOrders) : [];
    const lastOrder: AdminOrder | null = rawLastOrder ? JSON.parse(rawLastOrder) : null;

    return lastOrder && !parsedOrders.some((order) => order.code === lastOrder.code)
      ? [lastOrder, ...parsedOrders]
      : parsedOrders;
  } catch {
    return [];
  }
}

function mergeOrders(databaseOrders: AdminOrder[], localOrders: AdminOrder[]) {
  const orderMap = new Map<string, AdminOrder>();

  for (const order of [...localOrders, ...databaseOrders]) {
    if (!order.code) continue;
    orderMap.set(order.code, { ...orderMap.get(order.code), ...order });
  }

  return Array.from(orderMap.values()).sort((a, b) => {
    const left = getOrderDate(a)?.getTime() || 0;
    const right = getOrderDate(b)?.getTime() || 0;
    return right - left;
  });
}

async function syncLocalOrdersToDatabase(localOrders: AdminOrder[], databaseOrders: AdminOrder[]) {
  const databaseCodes = new Set(databaseOrders.map((order) => order.code).filter(Boolean));
  const unsyncedOrders = localOrders.filter((order) =>
    order.code &&
    !databaseCodes.has(order.code) &&
    Array.isArray(order.items) &&
    typeof order.total === "number",
  );

  if (unsyncedOrders.length === 0) {
    return databaseOrders;
  }

  const syncedOrders = await Promise.all(
    unsyncedOrders.map(async (order) => {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });

        if (!response.ok) {
          return order;
        }

        const data = await response.json();
        return data.order || order;
      } catch {
        return order;
      }
    }),
  );

  return [...syncedOrders, ...databaseOrders];
}

function buildStats(orders: AdminOrder[], totalUsers: number, totalProducts: number): DashboardStats {
  const now = new Date();
  const currentMonthKey = getMonthKey(now);
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const monthRevenue = orders.reduce((sum, order) => {
    const date = getOrderDate(order);
    if (!date || getMonthKey(date) !== currentMonthKey) return sum;
    return sum + (Number(order.total) || 0);
  }, 0);
  const completedOrders = orders.filter((order) => getOrderStatus(order) === "delivered").length;
  const pendingOrders = orders.filter((order) => getOrderStatus(order) === "pending").length;
  const processingOrders = orders.filter((order) =>
    ["processing", "shipping", "shipped"].includes(getOrderStatus(order)),
  ).length;

  return {
    totalUsers,
    totalProducts,
    totalOrders: orders.length,
    totalRevenue,
    monthRevenue,
    averageOrderValue: orders.length ? totalRevenue / orders.length : 0,
    completedOrders,
    pendingOrders,
    processingOrders,
  };
}

export default function AdminDashboard() {
  const { language } = useLanguage();
  const labels = dashboardLabels[language];
  const locale = language === "vi" ? "vi-VN" : "en-US";
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    monthRevenue: 0,
    averageOrderValue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
  });
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, ordersRes, productsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/orders"),
          fetch("/api/admin/products"),
        ]);

        const usersData = await usersRes.json();
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        const localOrders = getLocalOrders();
        const databaseOrders = await syncLocalOrdersToDatabase(localOrders, ordersData.orders || []);
        const mergedOrders = mergeOrders(databaseOrders, localOrders);

        setOrders(mergedOrders);
        setStats(buildStats(
          mergedOrders,
          usersData.total || 0,
          productsData.total || 0,
        ));
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const revenueByMonth = useMemo(() => {
    const report = getLastSixMonths(locale).map((month) => ({ ...month, revenue: 0, orders: 0 }));

    for (const order of orders) {
      const date = getOrderDate(order);
      if (!date) continue;
      const month = report.find((item) => item.key === getMonthKey(date));
      if (!month) continue;
      month.revenue += Number(order.total) || 0;
      month.orders += 1;
    }

    return report;
  }, [orders, locale]);
  const maxMonthlyRevenue = Math.max(...revenueByMonth.map((item) => item.revenue), 1);
  const recentOrders = orders.slice(0, 5);
  const kpis = [
    { label: labels.totalRevenue, value: currency.format(stats.totalRevenue), tone: "from-slate-900 to-blue-600" },
    { label: labels.monthRevenue, value: currency.format(stats.monthRevenue), tone: "from-blue-600 to-cyan-500" },
    { label: labels.averageOrderValue, value: currency.format(stats.averageOrderValue), tone: "from-emerald-600 to-teal-400" },
    { label: labels.totalOrders, value: String(stats.totalOrders), tone: "from-violet-600 to-indigo-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">{labels.analytics}</p>
            <h1 className="mt-2 text-3xl font-black text-gray-950 sm:text-4xl">{labels.title}</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-gray-600">{labels.subtitle}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">
            {new Date().toLocaleDateString(locale, { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-lg bg-white p-10 text-center font-semibold text-gray-500 shadow-sm">
            {labels.loading}
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((item) => (
                <article key={item.label} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className={`h-2 bg-gradient-to-r ${item.tone}`} />
                  <div className="p-5">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">{item.label}</p>
                    <strong className="mt-3 block text-2xl font-black text-gray-950">{item.value}</strong>
                  </div>
                </article>
              ))}
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-gray-950">{labels.revenueReport}</h2>
                    <p className="mt-1 text-sm font-medium text-gray-500">{labels.revenueReportSub}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
                    {currency.format(stats.totalRevenue)}
                  </span>
                </div>
                <div className="grid min-h-[260px] grid-cols-6 items-end gap-3">
                  {revenueByMonth.map((item) => {
                    const height = Math.max(10, Math.round((item.revenue / maxMonthlyRevenue) * 100));
                    return (
                      <div key={item.key} className="grid h-full content-end gap-2">
                        <div className="flex h-44 items-end rounded-lg bg-gray-50 p-2">
                          <div
                            className="w-full rounded-md bg-gradient-to-t from-blue-700 to-cyan-400"
                            style={{ height: `${height}%` }}
                            title={currency.format(item.revenue)}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-black uppercase text-gray-500">{item.label}</p>
                          <p className="text-xs font-bold text-gray-400">{item.orders} {labels.orderUnit}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-gray-950">{labels.orderStatus}</h2>
                <div className="mt-5 space-y-4">
                  {[
                    { label: labels.pending, value: stats.pendingOrders, color: "bg-amber-500" },
                    { label: labels.processing, value: stats.processingOrders, color: "bg-blue-600" },
                    { label: labels.completed, value: stats.completedOrders, color: "bg-emerald-600" },
                  ].map((item) => {
                    const percent = stats.totalOrders ? Math.round((item.value / stats.totalOrders) * 100) : 0;
                    return (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between text-sm font-bold">
                          <span className="text-gray-700">{item.label}</span>
                          <span className="text-gray-500">{item.value} {labels.orderUnit}</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                          <div className={`h-full ${item.color}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.75fr_1.25fr]">
              <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-gray-950">{labels.operationOverview}</h2>
                <dl className="mt-5 grid gap-4">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <dt className="font-bold text-gray-600">{labels.users}</dt>
                    <dd className="text-2xl font-black text-gray-950">{stats.totalUsers}</dd>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <dt className="font-bold text-gray-600">{labels.products}</dt>
                    <dd className="text-2xl font-black text-gray-950">{stats.totalProducts}</dd>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <dt className="font-bold text-gray-600">{labels.completionRate}</dt>
                    <dd className="text-2xl font-black text-gray-950">
                      {stats.totalOrders ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                    </dd>
                  </div>
                </dl>
              </article>

              <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-gray-950">{labels.recentOrders}</h2>
                    <p className="mt-1 text-sm font-medium text-gray-500">{labels.recentOrdersSub}</p>
                  </div>
                  <a href="/admin/orders" className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-black text-white">
                    {labels.viewAll}
                  </a>
                </div>
                {recentOrders.length === 0 ? (
                  <div className="rounded-lg bg-gray-50 p-6 text-center font-semibold text-gray-500">
                    {labels.noOrders}
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-gray-100">
                    <table className="w-full">
                      <thead className="bg-gray-50 text-left text-xs font-black uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-4 py-3">{labels.orderCode}</th>
                          <th className="px-4 py-3">{labels.customer}</th>
                          <th className="px-4 py-3">{labels.revenue}</th>
                          <th className="px-4 py-3">{labels.date}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {recentOrders.map((order) => (
                          <tr key={order._id || order.code}>
                            <td className="px-4 py-3 font-black text-blue-700">{order.code || "N/A"}</td>
                            <td className="px-4 py-3 font-semibold text-gray-700">{order.fullName || order.email || labels.retailCustomer}</td>
                            <td className="px-4 py-3 font-black text-gray-950">{currency.format(Number(order.total) || 0)}</td>
                            <td className="px-4 py-3 font-semibold text-gray-500">
                              {getOrderDate(order)?.toLocaleDateString(locale) || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            </section>
          </>
        )}
      </div>
  );
}
