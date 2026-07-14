"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/providers";

const DashboardCharts = dynamic(() => import("@/components/admin/dashboard-charts"), {
  loading: () => <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />,
  ssr: false,
});

type DashboardData = {
  generatedAt: string;
  financialDataComplete: boolean;
  kpis: Record<string, number | null>;
  statuses: Record<string, number>;
  revenueTrend: { label: string; revenue: number; orders: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  lowStock: { name: string; stock: number }[];
  wishlistInsights: { name: string; slug: string; count: number; stock: number; category: string; brand: string }[];
  recentOrders: Order[];
};

type Order = {
  _id?: string;
  code?: string;
  fullName?: string;
  email?: string;
  total?: number;
  payment?: string;
  paymentStatus?: string;
  shipping?: string;
  fulfillmentStatus?: string;
  status?: string;
  createdAt?: string;
};

type Filters = {
  range: string;
  start: string;
  end: string;
  payment: string;
  status: string;
  shipping: string;
  product: string;
  customer: string;
};

const initialFilters: Filters = { range: "month", start: "", end: "", payment: "", status: "", shipping: "", product: "", customer: "" };
const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

const ranges = [
  ["today", "Today"], ["yesterday", "Yesterday"], ["week", "This week"], ["lastWeek", "Last week"],
  ["month", "This month"], ["lastMonth", "Last month"], ["quarter", "This quarter"], ["year", "This year"], ["custom", "Custom range"],
];

const statusLabels: Record<string, string> = { pending: "Pending", processing: "Processing", shipping: "Shipping", completed: "Completed", cancelled: "Cancelled", refunded: "Refunded" };

function orderStatus(order: Order) {
  const candidates = [order.fulfillmentStatus, order.status].map((value) => String(value || "").toLowerCase());
  return candidates.find((value) => statusLabels[value]) || "pending";
}

function StatusBadge({ status }: { status: string }) {
  const { language } = useLanguage();
  const localizedLabels = language === "vi" ? { pending: "Chờ xử lý", processing: "Đang xử lý", shipping: "Đang giao", completed: "Hoàn thành", cancelled: "Đã hủy", refunded: "Đã hoàn tiền" } : statusLabels;
  const colors: Record<string, string> = { pending: "bg-amber-50 text-amber-700 ring-amber-200", processing: "bg-blue-50 text-blue-700 ring-blue-200", shipping: "bg-cyan-50 text-cyan-700 ring-cyan-200", completed: "bg-emerald-50 text-emerald-700 ring-emerald-200", cancelled: "bg-rose-50 text-rose-700 ring-rose-200", refunded: "bg-violet-50 text-violet-700 ring-violet-200" };
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${colors[status] || "bg-slate-50 text-slate-700 ring-slate-200"}`}>{localizedLabels[status] || status}</span>;
}

function MetricCard({ label, value, detail, tone = "blue" }: { label: string; value: string; detail?: string; tone?: "blue" | "emerald" | "violet" | "amber" | "slate" | "rose" }) {
  const tones = { blue: "border-blue-100 bg-blue-50 text-blue-700", emerald: "border-emerald-100 bg-emerald-50 text-emerald-700", violet: "border-violet-100 bg-violet-50 text-violet-700", amber: "border-amber-100 bg-amber-50 text-amber-700", slate: "border-slate-200 bg-white text-slate-700", rose: "border-rose-100 bg-rose-50 text-rose-700" };
  return <section className={`min-w-0 rounded-2xl border p-5 shadow-sm ${tones[tone]}`}>
    <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-75">{label}</p>
    <p className="mt-3 truncate text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
    {detail && <p className="mt-2 text-xs opacity-75">{detail}</p>}
  </section>;
}

export default function AdminDashboard() {
  const { language } = useLanguage();
  const t = language === "vi" ? {
    analytics: "Phân tích MOCO", title: "Hiệu quả kinh doanh", subtitle: "Báo cáo vận hành và tài chính từ dữ liệu đơn hàng hiện tại. Doanh thu chỉ tính từ đơn hàng hoàn thành.", light: "Chế độ sáng", dark: "Chế độ tối", refresh: "Làm mới", timeRange: "Khoảng thời gian", orderStatus: "Trạng thái đơn hàng", payment: "Phương thức thanh toán", shipping: "Phương thức giao hàng", product: "Sản phẩm", customer: "Khách hàng", allStatuses: "Tất cả trạng thái", allRanges: ["Hôm nay", "Hôm qua", "Tuần này", "Tuần trước", "Tháng này", "Tháng trước", "Quý này", "Năm nay", "Tùy chỉnh"], from: "Từ ngày", to: "Đến ngày", clear: "Xóa bộ lọc", csv: "Xuất CSV", excel: "Xuất Excel", print: "In / PDF", unavailableProfit: "Lợi nhuận gộp và lợi nhuận ròng chưa khả dụng vì chi phí sản phẩm của các đơn hoàn thành chưa được lưu. Doanh thu vẫn chính xác và không hiển thị lợi nhuận ước tính.", totalRevenue: "Tổng doanh thu", grossProfit: "Lợi nhuận gộp", netProfit: "Lợi nhuận ròng", averageOrder: "Giá trị đơn hàng trung bình", completedOrders: "Đơn hoàn thành", processingOrders: "Đơn đang xử lý", pendingOrders: "Đơn chờ xử lý", cancelledOrders: "Đơn đã hủy", refundedOrders: "Đơn hoàn tiền", customers: "Tổng khách hàng", newCustomers: "Khách hàng mới hôm nay", lowStock: "Sản phẩm sắp hết hàng", savedProducts: "Sản phẩm đã lưu", completedLessRefunds: "Doanh thu hoàn thành trừ hoàn tiền", grossDetail: "Doanh thu trừ chi phí sản phẩm, vận chuyển, voucher và phí", netDetail: "Lợi nhuận gộp trừ hoàn tiền và chi phí vận hành", completedOnly: "Chỉ đơn hoàn thành", processingDetail: "Đang xử lý và đang giao", catalogue: "sản phẩm trong danh mục", wishlistDetail: "Sản phẩm yêu thích của khách hàng", topProducts: "Sản phẩm bán chạy", topProductDetail: "Xếp hạng theo doanh thu từ đơn hoàn thành.", manageProducts: "Quản lý sản phẩm", sold: "đã bán", noSales: "Không có sản phẩm bán từ đơn hoàn thành trong kỳ này.", lowInventory: "Tồn kho thấp", lowInventoryDetail: "Sản phẩm ở hoặc dưới ngưỡng tồn kho thấp.", restock: "Nhập hàng", left: "còn lại", noLowStock: "Không có sản phẩm tồn kho thấp.", mostWishlisted: "Sản phẩm được yêu thích nhiều nhất", wishlistInsight: "Nhu cầu lưu sản phẩm kèm tồn kho hiện tại để theo dõi.", category: "Danh mục", brand: "Thương hiệu", wishlists: "Lượt yêu thích", stock: "Tồn kho", noWishlistData: "Chưa có dữ liệu sản phẩm yêu thích.", recentOrders: "Đơn hàng gần đây", recentDetail: "Các đơn mới nhất theo bộ lọc đã chọn.", openOrders: "Mở quản lý đơn hàng", orderId: "Mã đơn", customerLabel: "Khách hàng", total: "Tổng tiền", paymentLabel: "Thanh toán", shippingLabel: "Giao hàng", status: "Trạng thái", created: "Ngày tạo", actions: "Thao tác", retail: "Khách lẻ", view: "Xem", edit: "Sửa", printAction: "In", previous: "Trước", next: "Sau", page: "Trang", of: "trên", noMatching: "Không có đơn hàng phù hợp với bộ lọc hiện tại.", lastRefreshed: "Làm mới lần cuối", autoRefresh: "Dữ liệu tự động làm mới mỗi 45 giây.", unavailable: "Chưa có dữ liệu", errorTitle: "Không thể tải dữ liệu Dashboard", tryAgain: "Thử lại", checking: "Đang tải dữ liệu Dashboard...", cod: "VD: COD", standard: "VD: Tiêu chuẩn", productName: "Tên sản phẩm", customerSearch: "Tên, email hoặc số điện thoại",
  } : {
    analytics: "MOCO Analytics", title: "Commerce performance", subtitle: "Operational and financial reporting from the current order data. Revenue is calculated from completed orders only.", light: "Light mode", dark: "Dark mode", refresh: "Refresh", timeRange: "Time range", orderStatus: "Order status", payment: "Payment method", shipping: "Shipping method", product: "Product", customer: "Customer", allStatuses: "All statuses", allRanges: ranges.map((item) => item[1]), from: "From", to: "To", clear: "Clear filters", csv: "Export CSV", excel: "Export Excel", print: "Print / PDF", unavailableProfit: "Gross and net profit are unavailable because completed-order product costs are not stored yet. Revenue remains accurate; no estimated profit is shown.", totalRevenue: "Total revenue", grossProfit: "Gross profit", netProfit: "Net profit", averageOrder: "Average order value", completedOrders: "Completed orders", processingOrders: "Processing orders", pendingOrders: "Pending orders", cancelledOrders: "Cancelled orders", refundedOrders: "Refunded orders", customers: "Total customers", newCustomers: "New customers today", lowStock: "Low stock products", savedProducts: "Saved products", completedLessRefunds: "Completed revenue less refunds", grossDetail: "Revenue less product, shipping, voucher and fee costs", netDetail: "Gross profit less refunds and operating expenses", completedOnly: "Completed orders only", processingDetail: "Processing and shipping", catalogue: "products in catalogue", wishlistDetail: "Customer wishlist items", topProducts: "Top selling products", topProductDetail: "Ranked by completed-order revenue.", manageProducts: "Manage products", sold: "sold", noSales: "No completed product sales in this period.", lowInventory: "Low inventory", lowInventoryDetail: "Products at or below the low-stock threshold.", restock: "Restock", left: "left", noLowStock: "No low-stock products.", mostWishlisted: "Most wishlisted products", wishlistInsight: "Saved-product demand, with current inventory for follow-up.", category: "Category", brand: "Brand", wishlists: "Wishlists", stock: "Stock", noWishlistData: "No saved-product data yet.", recentOrders: "Recent orders", recentDetail: "Latest orders matching the selected filters.", openOrders: "Open order management", orderId: "Order ID", customerLabel: "Customer", total: "Total", paymentLabel: "Payment", shippingLabel: "Shipping", status: "Status", created: "Created", actions: "Actions", retail: "Retail customer", view: "View", edit: "Edit", printAction: "Print", previous: "Previous", next: "Next", page: "Page", of: "of", noMatching: "No orders match the current filters.", lastRefreshed: "Last refreshed", autoRefresh: "Data refreshes automatically every 45 seconds.", unavailable: "Unavailable", errorTitle: "Dashboard data could not be loaded", tryAgain: "Try again", checking: "Loading dashboard data...", cod: "e.g. COD", standard: "e.g. Standard", productName: "Product name", customerSearch: "Name, email or phone",
  };
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [page, setPage] = useState(1);

  const filterQuery = useMemo(() => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value) query.set(key, value); });
    return query.toString();
  }, [filters]);

  const loadDashboard = useCallback(async (background = false) => {
    if (!background) setLoading(true);
    try {
      const response = await fetch(`/api/admin/dashboard?${filterQuery}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Unable to load dashboard analytics.");
      setData(result.data);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard analytics.");
    } finally {
      setLoading(false);
    }
  }, [filterQuery]);

  useEffect(() => { setPage(1); void loadDashboard(); }, [loadDashboard]);
  useEffect(() => {
    const timer = window.setInterval(() => void loadDashboard(true), 45_000);
    return () => window.clearInterval(timer);
  }, [loadDashboard]);

  const updateFilter = (key: keyof Filters, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const displayMoney = (value: number | null | undefined) => value === null || value === undefined ? t.unavailable : currency.format(value);
  const recentOrders = data?.recentOrders || [];
  const totalPages = Math.max(1, Math.ceil(recentOrders.length / 5));
  const paginatedOrders = recentOrders.slice((page - 1) * 5, page * 5);
  const exportUrl = `/api/admin/dashboard/export?${filterQuery}`;
  const root = darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900";
  const panel = darkMode ? "border-slate-700 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900";
  const muted = darkMode ? "text-slate-400" : "text-slate-500";

  return <div className={`min-h-full transition-colors ${root}`}>
    <div className="space-y-6 p-1 sm:p-2">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">{t.analytics}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{t.title}</h1>
          <p className={`mt-2 max-w-2xl text-sm sm:text-base ${muted}`}>{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setDarkMode((value) => !value)} className={`min-h-11 rounded-xl border px-4 text-sm font-semibold transition hover:bg-slate-100 ${panel}`}>{darkMode ? t.light : t.dark}</button>
          <button type="button" onClick={() => void loadDashboard()} className="min-h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700">{t.refresh}</button>
        </div>
      </header>

      <section className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${panel}`} aria-label="Dashboard filters">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium">{t.timeRange}<select value={filters.range} onChange={(event) => updateFilter("range", event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 outline-none ring-blue-500 focus:ring-2">{ranges.map(([value], index) => <option key={value} value={value}>{t.allRanges[index]}</option>)}</select></label>
          <label className="text-sm font-medium">{t.orderStatus}<select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 outline-none ring-blue-500 focus:ring-2"><option value="">{t.allStatuses}</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{language === "vi" ? ({ pending: "Chờ xử lý", processing: "Đang xử lý", shipping: "Đang giao", completed: "Hoàn thành", cancelled: "Đã hủy", refunded: "Đã hoàn tiền" }[value] || label) : label}</option>)}</select></label>
          <label className="text-sm font-medium">{t.payment}<input value={filters.payment} onChange={(event) => updateFilter("payment", event.target.value)} placeholder={t.cod} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2" /></label>
          <label className="text-sm font-medium">{t.shipping}<input value={filters.shipping} onChange={(event) => updateFilter("shipping", event.target.value)} placeholder={t.standard} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2" /></label>
          <label className="text-sm font-medium">{t.product}<input value={filters.product} onChange={(event) => updateFilter("product", event.target.value)} placeholder={t.productName} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2" /></label>
          <label className="text-sm font-medium">{t.customer}<input value={filters.customer} onChange={(event) => updateFilter("customer", event.target.value)} placeholder={t.customerSearch} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2" /></label>
          {filters.range === "custom" && <><label className="text-sm font-medium">{t.from}<input type="date" value={filters.start} onChange={(event) => updateFilter("start", event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 outline-none ring-blue-500 focus:ring-2" /></label><label className="text-sm font-medium">{t.to}<input type="date" value={filters.end} onChange={(event) => updateFilter("end", event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 outline-none ring-blue-500 focus:ring-2" /></label></>}
        </div>
        <div className="mt-4 flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-4">
          <button type="button" onClick={() => setFilters(initialFilters)} className="min-h-11 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">{t.clear}</button>
          <div className="flex flex-wrap gap-2"><a href={`${exportUrl}&format=csv`} className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">{t.csv}</a><a href={`${exportUrl}&format=excel`} className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">{t.excel}</a><button type="button" onClick={() => window.print()} className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">{t.print}</button></div>
        </div>
      </section>

      {loading && !data ? <DashboardSkeleton /> : error && !data ? <section className={`rounded-2xl border p-8 text-center shadow-sm ${panel}`}><h2 className="text-lg font-bold">{t.errorTitle}</h2><p className={`mt-2 text-sm ${muted}`}>{error}</p><button type="button" onClick={() => void loadDashboard()} className="mt-4 min-h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white">{t.tryAgain}</button></section> : data && <>
        {!data.financialDataComplete && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{t.unavailableProfit}</div>}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={t.totalRevenue} value={displayMoney(data.kpis.totalRevenue)} detail={t.completedLessRefunds} tone="blue" />
          <MetricCard label={t.grossProfit} value={displayMoney(data.kpis.grossProfit)} detail={t.grossDetail} tone="emerald" />
          <MetricCard label={t.netProfit} value={displayMoney(data.kpis.netProfit)} detail={t.netDetail} tone="violet" />
          <MetricCard label={t.averageOrder} value={displayMoney(data.kpis.averageOrderValue)} detail={t.completedOnly} tone="slate" />
          <MetricCard label={t.completedOrders} value={String(data.kpis.completedOrders || 0)} tone="emerald" />
          <MetricCard label={t.processingOrders} value={String(data.kpis.processingOrders || 0)} detail={t.processingDetail} tone="blue" />
          <MetricCard label={t.pendingOrders} value={String(data.kpis.pendingOrders || 0)} tone="amber" />
          <MetricCard label={t.cancelledOrders} value={String(data.kpis.cancelledOrders || 0)} tone="rose" />
          <MetricCard label={t.refundedOrders} value={String(data.kpis.refundedOrders || 0)} detail={displayMoney(data.kpis.refunds)} tone="violet" />
          <MetricCard label={t.customers} value={String(data.kpis.totalCustomers || 0)} tone="slate" />
          <MetricCard label={t.newCustomers} value={String(data.kpis.newCustomersToday || 0)} tone="blue" />
          <MetricCard label={t.lowStock} value={String(data.kpis.lowStockProducts || 0)} detail={`${data.kpis.totalProducts || 0} ${t.catalogue}`} tone="amber" />
          <MetricCard label={t.savedProducts} value={String(data.kpis.totalWishlistItems || 0)} detail={t.wishlistDetail} tone="rose" />
        </section>

        <DashboardCharts trend={data.revenueTrend} statuses={data.statuses} />

        <section className="grid gap-6 xl:grid-cols-2">
          <article className={`rounded-2xl border p-5 shadow-sm ${panel}`}><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">{t.topProducts}</h2><p className={`mt-1 text-sm ${muted}`}>{t.topProductDetail}</p></div><Link href="/admin/products" className="text-sm font-semibold text-blue-600 hover:text-blue-800">{t.manageProducts}</Link></div>{data.topProducts.length ? <div className="mt-5 divide-y divide-slate-100">{data.topProducts.map((product, index) => <div key={product.name} className="flex items-center justify-between gap-4 py-3"><div className="min-w-0"><p className="truncate font-semibold">{index + 1}. {product.name}</p><p className={`mt-1 text-sm ${muted}`}>{product.quantity} {t.sold}</p></div><strong className="shrink-0 text-sm">{currency.format(product.revenue)}</strong></div>)}</div> : <EmptyState text={t.noSales} />}</article>
          <article className={`rounded-2xl border p-5 shadow-sm ${panel}`}><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">{t.lowInventory}</h2><p className={`mt-1 text-sm ${muted}`}>{t.lowInventoryDetail}</p></div><Link href="/admin/products" className="text-sm font-semibold text-blue-600 hover:text-blue-800">{t.restock}</Link></div>{data.lowStock.length ? <div className="mt-5 divide-y divide-slate-100">{data.lowStock.map((product) => <div key={product.name} className="flex items-center justify-between gap-4 py-3"><p className="min-w-0 truncate font-semibold">{product.name}</p><span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">{product.stock} {t.left}</span></div>)}</div> : <EmptyState text={t.noLowStock} />}</article>
        </section>

        <section className={`rounded-2xl border p-5 shadow-sm ${panel}`}><div><h2 className="text-lg font-semibold">{t.mostWishlisted}</h2><p className={`mt-1 text-sm ${muted}`}>{t.wishlistInsight}</p></div>{data.wishlistInsights.length ? <div className="mt-5 overflow-x-auto"><table className="min-w-[580px] w-full text-left text-sm"><thead className={darkMode ? "text-slate-400" : "text-slate-500"}><tr><th className="pb-3 font-semibold">{t.product}</th><th className="pb-3 font-semibold">{t.category}</th><th className="pb-3 font-semibold">{t.brand}</th><th className="pb-3 font-semibold">{t.wishlists}</th><th className="pb-3 font-semibold">{t.stock}</th></tr></thead><tbody>{data.wishlistInsights.map((item) => <tr key={item.slug} className="border-t border-slate-100"><td className="py-3 font-semibold">{item.name}</td><td className="py-3">{item.category}</td><td className="py-3">{item.brand}</td><td className="py-3 font-bold text-rose-600">{item.count}</td><td className="py-3">{item.stock}</td></tr>)}</tbody></table></div> : <EmptyState text={t.noWishlistData} />}</section>

        <section className={`overflow-hidden rounded-2xl border shadow-sm ${panel}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5"><div><h2 className="text-lg font-semibold">{t.recentOrders}</h2><p className={`mt-1 text-sm ${muted}`}>{t.recentDetail}</p></div><Link href="/admin/orders" className="inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">{t.openOrders}</Link></div>
          {paginatedOrders.length ? <><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead className={darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-50 text-slate-500"}><tr><th className="px-5 py-3 font-semibold">{t.orderId}</th><th className="px-5 py-3 font-semibold">{t.customerLabel}</th><th className="px-5 py-3 font-semibold">{t.total}</th><th className="px-5 py-3 font-semibold">{t.paymentLabel}</th><th className="px-5 py-3 font-semibold">{t.shippingLabel}</th><th className="px-5 py-3 font-semibold">{t.status}</th><th className="px-5 py-3 font-semibold">{t.created}</th><th className="px-5 py-3 font-semibold">{t.actions}</th></tr></thead><tbody>{paginatedOrders.map((order) => <tr key={order._id || order.code} className="border-t border-slate-100"><td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-600">{order.code || "—"}</td><td className="px-5 py-4"><p className="font-medium">{order.fullName || t.retail}</p><p className={`mt-0.5 text-xs ${muted}`}>{order.email || "—"}</p></td><td className="whitespace-nowrap px-5 py-4 font-semibold">{currency.format(Number(order.total) || 0)}</td><td className="px-5 py-4">{order.paymentStatus || order.payment || "—"}</td><td className="px-5 py-4">{order.shipping || "—"}</td><td className="px-5 py-4"><StatusBadge status={orderStatus(order)} /></td><td className="whitespace-nowrap px-5 py-4">{order.createdAt ? new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt)) : "—"}</td><td className="px-5 py-4"><div className="flex gap-2"><Link href="/admin/orders" className="rounded-lg px-2 py-1 font-semibold text-blue-600 hover:bg-blue-50">{t.view}</Link><Link href="/admin/orders" className="rounded-lg px-2 py-1 font-semibold text-blue-600 hover:bg-blue-50">{t.edit}</Link><button type="button" onClick={() => window.print()} className="rounded-lg px-2 py-1 font-semibold text-blue-600 hover:bg-blue-50">{t.printAction}</button></div></td></tr>)}</tbody></table></div><div className="flex items-center justify-between gap-3 p-4"><p className={`text-sm ${muted}`}>{t.page} {page} {t.of} {totalPages}</p><div className="flex gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold disabled:opacity-40">{t.previous}</button><button type="button" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)} className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold disabled:opacity-40">{t.next}</button></div></div></> : <EmptyState text={t.noMatching} />}
        </section>
        <p className={`text-xs ${muted}`}>{t.lastRefreshed}: {new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", { dateStyle: "medium", timeStyle: "medium" }).format(new Date(data.generatedAt))}. {t.autoRefresh}</p>
      </>}
    </div>
  </div>;
}

function DashboardSkeleton() {
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 12 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl bg-slate-200" />)}</div><div className="h-96 animate-pulse rounded-2xl bg-slate-200" /></div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="grid min-h-40 place-items-center px-4 text-center text-sm text-slate-500">{text}</div>;
}
