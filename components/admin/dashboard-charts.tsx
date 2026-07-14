"use client";

import { useLanguage } from "@/app/providers";

type Trend = { label: string; revenue: number; orders: number };

const formatCurrency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const statusColors: Record<string, string> = {
  pending: "bg-amber-400",
  processing: "bg-blue-500",
  shipping: "bg-cyan-500",
  completed: "bg-emerald-500",
  cancelled: "bg-rose-500",
  refunded: "bg-violet-500",
};

export default function DashboardCharts({ trend, statuses }: { trend: Trend[]; statuses: Record<string, number> }) {
  const { language } = useLanguage();
  const t = language === "vi" ? {
    revenueByDay: "Doanh thu theo ngày", revenueDescription: "Doanh thu đơn hoàn thành trong khoảng thời gian đã chọn.", completedOnly: "Chỉ đơn hoàn thành", noRevenue: "Không có đơn hoàn thành trong khoảng thời gian này.", orderStatus: "Trạng thái đơn hàng", statusDescription: "Phân bổ vận hành theo bộ lọc hiện tại.", orders: "đơn hàng", pending: "Chờ xử lý", processing: "Đang xử lý", shipping: "Đang giao", completed: "Hoàn thành", cancelled: "Đã hủy", refunded: "Đã hoàn tiền",
  } : {
    revenueByDay: "Revenue by day", revenueDescription: "Completed order revenue in the selected period.", completedOnly: "Completed only", noRevenue: "No completed orders in this period.", orderStatus: "Order status", statusDescription: "Operational distribution for the current filters.", orders: "orders", pending: "Pending", processing: "Processing", shipping: "Shipping", completed: "Completed", cancelled: "Cancelled", refunded: "Refunded",
  };
  const statusLabels: Record<string, string> = { pending: t.pending, processing: t.processing, shipping: t.shipping, completed: t.completed, cancelled: t.cancelled, refunded: t.refunded };
  const maxRevenue = Math.max(...trend.map((item) => item.revenue), 1);
  const totalStatuses = Math.max(Object.values(statuses).reduce((sum, value) => sum + value, 0), 1);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(17rem,1fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{t.revenueByDay}</h2>
            <p className="mt-1 text-sm text-slate-500">{t.revenueDescription}</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{t.completedOnly}</span>
        </div>
        {trend.length ? (
          <div className="flex h-64 min-w-0 items-end gap-2 overflow-x-auto pb-1 sm:gap-3">
            {trend.map((item) => (
              <div key={item.label} className="flex h-full min-w-11 flex-1 flex-col justify-end text-center">
                <div className="group relative flex flex-1 items-end justify-center">
                  <div className="pointer-events-none absolute bottom-full z-10 mb-2 hidden w-max max-w-44 rounded bg-slate-900 px-2 py-1 text-xs text-white shadow group-hover:block">
                    {formatCurrency.format(item.revenue)} · {item.orders} orders
                  </div>
                  <div className="w-full max-w-10 rounded-t-md bg-blue-600 transition-[height] duration-300" style={{ height: `${Math.max(6, (item.revenue / maxRevenue) * 100)}%` }} />
                </div>
                <span className="mt-2 truncate text-[11px] text-slate-500">{item.label.slice(5)}</span>
              </div>
            ))}
          </div>
        ) : <EmptyChart label={t.noRevenue} />}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{t.orderStatus}</h2>
        <p className="mt-1 text-sm text-slate-500">{t.statusDescription}</p>
        <div className="mx-auto my-6 grid h-40 w-40 place-items-center rounded-full" style={{ background: `conic-gradient(#10b981 0 ${(statuses.completed || 0) / totalStatuses * 360}deg, #06b6d4 ${(statuses.completed || 0) / totalStatuses * 360}deg ${((statuses.completed || 0) + (statuses.shipping || 0)) / totalStatuses * 360}deg, #3b82f6 ${((statuses.completed || 0) + (statuses.shipping || 0)) / totalStatuses * 360}deg ${((statuses.completed || 0) + (statuses.shipping || 0) + (statuses.processing || 0)) / totalStatuses * 360}deg, #f59e0b ${((statuses.completed || 0) + (statuses.shipping || 0) + (statuses.processing || 0)) / totalStatuses * 360}deg ${((statuses.completed || 0) + (statuses.shipping || 0) + (statuses.processing || 0) + (statuses.pending || 0)) / totalStatuses * 360}deg, #f43f5e ${((statuses.completed || 0) + (statuses.shipping || 0) + (statuses.processing || 0) + (statuses.pending || 0)) / totalStatuses * 360}deg ${((statuses.completed || 0) + (statuses.shipping || 0) + (statuses.processing || 0) + (statuses.pending || 0) + (statuses.cancelled || 0)) / totalStatuses * 360}deg, #8b5cf6 ${((statuses.completed || 0) + (statuses.shipping || 0) + (statuses.processing || 0) + (statuses.pending || 0) + (statuses.cancelled || 0)) / totalStatuses * 360}deg 360deg)` }}>
          <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center">
            <strong className="text-2xl text-slate-900">{Object.values(statuses).reduce((sum, value) => sum + value, 0)}</strong>
            <span className="text-xs text-slate-500">{t.orders}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {Object.entries(statuses).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between gap-2 text-sm text-slate-600">
              <span className="flex min-w-0 items-center gap-2"><i className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusColors[status] || "bg-slate-400"}`} />{statusLabels[status] || status}</span>
              <strong className="text-slate-900">{count}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return <div className="grid h-64 place-items-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">{label}</div>;
}
