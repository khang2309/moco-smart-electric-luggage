"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from '@/app/LanguageProvider';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, Percent, 
  ShoppingCart, Package, Users, UserPlus, AlertCircle, 
  Heart, CreditCard, Box, Calendar, Download, RefreshCw,
  Search, Eye, Printer, ChevronLeft, ChevronRight, CheckCircle2,
  Clock, XCircle, RotateCcw
} from "lucide-react";

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

function MetricCard({ label, value, detail, tone = "blue", icon: Icon }: { label: string; value: string; detail?: string; tone?: "blue" | "emerald" | "violet" | "amber" | "slate" | "rose", icon?: React.ElementType }) {
  const tones = { 
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-700 icon-blue-600 bg-blue-500/10", 
    emerald: "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700 icon-emerald-600 bg-emerald-500/10", 
    violet: "from-violet-50 to-violet-100 border-violet-200 text-violet-700 icon-violet-600 bg-violet-500/10", 
    amber: "from-amber-50 to-amber-100 border-amber-200 text-amber-700 icon-amber-600 bg-amber-500/10", 
    slate: "from-slate-50 to-slate-100 border-slate-200 text-slate-700 icon-slate-600 bg-slate-500/10", 
    rose: "from-rose-50 to-rose-100 border-rose-200 text-rose-700 icon-rose-600 bg-rose-500/10" 
  };
  
  const selectedTone = tones[tone];
  const [gradient, border, text, iconColor, bgIcon] = selectedTone.split(" ");

  return (
    <section className={`group relative min-w-0 overflow-hidden rounded-2xl border ${border} bg-gradient-to-br ${gradient} p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-75">{label}</p>
          <p className="mt-3 truncate text-2xl font-bold tracking-tight sm:text-3xl text-slate-900">{value}</p>
        </div>
        {Icon && (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${bgIcon}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        )}
      </div>
      {detail && (
        <div className="mt-4 flex items-center gap-2">
          <p className="text-xs font-medium text-slate-600 opacity-90 line-clamp-1">{detail}</p>
        </div>
      )}
    </section>
  );
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
  const panel = "border-slate-200 bg-white text-slate-900";
  const muted = "text-slate-500";

  return <div className="min-h-full bg-slate-50 text-slate-900">
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
             <TrendingUp className="w-4 h-4" /> {t.analytics}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-slate-900">{t.title}</h1>
          <p className={`mt-2 max-w-2xl text-sm sm:text-base ${muted}`}>{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void loadDashboard()} className="group flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md">
            <RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" /> {t.refresh}
          </button>
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
          <MetricCard label={t.totalRevenue} value={displayMoney(data.kpis.totalRevenue)} detail={t.completedLessRefunds} tone="blue" icon={DollarSign} />
          <MetricCard label={t.grossProfit} value={displayMoney(data.kpis.grossProfit)} detail={t.grossDetail} tone="emerald" icon={Wallet} />
          <MetricCard label={t.netProfit} value={displayMoney(data.kpis.netProfit)} detail={t.netDetail} tone="violet" icon={Percent} />
          <MetricCard label={t.averageOrder} value={displayMoney(data.kpis.averageOrderValue)} detail={t.completedOnly} tone="slate" icon={CreditCard} />
        </section>
        
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MetricCard label={t.completedOrders} value={String(data.kpis.completedOrders || 0)} tone="emerald" icon={CheckCircle2} />
          <MetricCard label={t.processingOrders} value={String(data.kpis.processingOrders || 0)} detail={t.processingDetail} tone="blue" icon={Clock} />
          <MetricCard label={t.pendingOrders} value={String(data.kpis.pendingOrders || 0)} tone="amber" icon={AlertCircle} />
          <MetricCard label={t.cancelledOrders} value={String(data.kpis.cancelledOrders || 0)} tone="rose" icon={XCircle} />
          <MetricCard label={t.refundedOrders} value={String(data.kpis.refundedOrders || 0)} detail={displayMoney(data.kpis.refunds)} tone="violet" icon={RotateCcw} />
          <MetricCard label={t.customers} value={String(data.kpis.totalCustomers || 0)} tone="slate" icon={Users} />
          <MetricCard label={t.newCustomers} value={String(data.kpis.newCustomersToday || 0)} tone="blue" icon={UserPlus} />
          <MetricCard label={t.lowStock} value={String(data.kpis.lowStockProducts || 0)} detail={`${data.kpis.totalProducts || 0} ${t.catalogue}`} tone="amber" icon={Box} />
          <MetricCard label={t.savedProducts} value={String(data.kpis.totalWishlistItems || 0)} detail={t.wishlistDetail} tone="rose" icon={Heart} />
        </section>

        <DashboardCharts trend={data.revenueTrend} statuses={data.statuses} />

        <section className="grid gap-6 xl:grid-cols-2">
          <article className={`rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${panel}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                 <h2 className="text-lg font-semibold flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-blue-500"/>{t.topProducts}</h2>
                 <p className={`mt-1 text-sm ${muted}`}>{t.topProductDetail}</p>
              </div>
              <Link href="/admin/products" className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">{t.manageProducts}</Link>
            </div>
            {data.topProducts.length ? <div className="mt-6 divide-y divide-slate-100">{data.topProducts.map((product, index) => <div key={product.name} className="group flex items-center justify-between gap-4 py-4 transition-colors hover:bg-slate-50 -mx-4 px-4 rounded-lg"><div className="min-w-0 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 group-hover:bg-white">{index + 1}</span><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{product.name}</p><p className={`mt-1 text-sm ${muted}`}>{product.quantity} {t.sold}</p></div></div><strong className="shrink-0 text-sm">{currency.format(product.revenue)}</strong></div>)}</div> : <EmptyState text={t.noSales} />}
          </article>
          
          <article className={`rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${panel}`}>
            <div className="flex items-center justify-between gap-3">
               <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2"><AlertCircle className="w-5 h-5 text-amber-500"/>{t.lowInventory}</h2>
                  <p className={`mt-1 text-sm ${muted}`}>{t.lowInventoryDetail}</p>
               </div>
               <Link href="/admin/products" className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">{t.restock}</Link>
            </div>
            {data.lowStock.length ? <div className="mt-6 divide-y divide-slate-100">{data.lowStock.map((product) => <div key={product.name} className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-slate-50 -mx-4 px-4 rounded-lg"><div className="flex items-center gap-3 min-w-0"><Package className="w-8 h-8 p-1.5 rounded-lg bg-amber-50 text-amber-600 shrink-0"/><p className="min-w-0 truncate font-semibold text-slate-900">{product.name}</p></div><span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">{product.stock} {t.left}</span></div>)}</div> : <EmptyState text={t.noLowStock} />}
          </article>
        </section>

        <section className={`rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${panel}`}>
          <div className="mb-6">
             <h2 className="text-lg font-semibold flex items-center gap-2"><Heart className="w-5 h-5 text-rose-500"/>{t.mostWishlisted}</h2>
             <p className={`mt-1 text-sm ${muted}`}>{t.wishlistInsight}</p>
          </div>
          {data.wishlistInsights.length ? <div className="mt-5 overflow-x-auto"><table className="min-w-[580px] w-full text-left text-sm"><thead className="text-slate-500 bg-slate-50"><tr><th className="px-4 py-3 font-semibold rounded-l-lg">{t.product}</th><th className="px-4 py-3 font-semibold">{t.category}</th><th className="px-4 py-3 font-semibold">{t.brand}</th><th className="px-4 py-3 font-semibold">{t.wishlists}</th><th className="px-4 py-3 font-semibold rounded-r-lg">{t.stock}</th></tr></thead><tbody className="divide-y divide-slate-100">{data.wishlistInsights.map((item) => <tr key={item.slug} className="hover:bg-slate-50 transition-colors"><td className="px-4 py-4 font-semibold text-slate-900">{item.name}</td><td className="px-4 py-4 text-slate-600">{item.category}</td><td className="px-4 py-4 text-slate-600">{item.brand}</td><td className="px-4 py-4 font-bold text-rose-600 flex items-center gap-1"><Heart className="w-4 h-4 fill-current"/> {item.count}</td><td className="px-4 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.stock > 10 ? 'bg-emerald-50 text-emerald-700' : item.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>{item.stock}</span></td></tr>)}</tbody></table></div> : <EmptyState text={t.noWishlistData} />}
        </section>

        <section className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${panel}`}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-6 bg-slate-50/50">
             <div>
                <h2 className="text-lg font-semibold flex items-center gap-2"><Clock className="w-5 h-5 text-slate-500"/>{t.recentOrders}</h2>
                <p className={`mt-1 text-sm ${muted}`}>{t.recentDetail}</p>
             </div>
             <Link href="/admin/orders" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
               <span className="text-white">{t.openOrders}</span> <ChevronRight className="w-4 h-4 text-white" />
             </Link>
          </div>
          {paginatedOrders.length ? <><div className="overflow-x-auto"><table className="min-w-[980px] w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500 border-b border-slate-200"><tr><th className="px-6 py-4 font-semibold">{t.orderId}</th><th className="px-6 py-4 font-semibold">{t.customerLabel}</th><th className="px-6 py-4 font-semibold">{t.total}</th><th className="px-6 py-4 font-semibold">{t.paymentLabel}</th><th className="px-6 py-4 font-semibold">{t.shippingLabel}</th><th className="px-6 py-4 font-semibold">{t.status}</th><th className="px-6 py-4 font-semibold">{t.created}</th><th className="min-w-40 whitespace-nowrap px-6 py-4 font-semibold text-right">{t.actions}</th></tr></thead><tbody className="divide-y divide-slate-100">{paginatedOrders.map((order) => <tr key={order._id || order.code} className="hover:bg-slate-50 transition-colors"><td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">{order.code || "—"}</td><td className="px-6 py-4"><p className="font-semibold text-slate-900">{order.fullName || t.retail}</p><p className={`mt-0.5 text-xs text-slate-500 truncate max-w-[150px]`}>{order.email || "—"}</p></td><td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">{currency.format(Number(order.total) || 0)}</td><td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">{order.paymentStatus || order.payment || "—"}</span></td><td className="px-6 py-4 text-slate-600">{order.shipping || "—"}</td><td className="px-6 py-4"><StatusBadge status={orderStatus(order)} /></td><td className="whitespace-nowrap px-6 py-4 text-slate-600">{order.createdAt ? new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt)) : "—"}</td><td className="min-w-40 whitespace-nowrap px-6 py-4 text-right"><div className="flex flex-nowrap items-center justify-end gap-2"><Link href="/admin/orders" className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title={t.view}><Eye className="w-4 h-4" /></Link><button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title={t.printAction}><Printer className="w-4 h-4" /></button></div></td></tr>)}</tbody></table></div><div className="flex items-center justify-between gap-3 p-5 border-t border-slate-200 bg-slate-50"><p className={`text-sm font-medium ${muted}`}>{t.page} {page} {t.of} {totalPages}</p><div className="flex gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4"/></button><button type="button" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"><ChevronRight className="w-4 h-4"/></button></div></div></> : <EmptyState text={t.noMatching} />}
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
