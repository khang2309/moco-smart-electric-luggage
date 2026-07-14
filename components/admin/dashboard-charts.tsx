"use client";

import { useLanguage } from '@/app/LanguageProvider';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";

type Trend = { label: string; revenue: number; orders: number };

const formatCurrency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const statusColors: Record<string, string> = {
  pending: "#fbbf24", // amber-400
  processing: "#3b82f6", // blue-500
  shipping: "#06b6d4", // cyan-500
  completed: "#10b981", // emerald-500
  cancelled: "#f43f5e", // rose-500
  refunded: "#8b5cf6", // violet-500
};

export default function DashboardCharts({ trend, statuses }: { trend: Trend[]; statuses: Record<string, number> }) {
  const { language } = useLanguage();
  const t = language === "vi" ? {
    revenueByDay: "Phân tích doanh thu", revenueDescription: "Theo dõi biến động doanh thu và đơn hàng theo thời gian.", completedOnly: "Chỉ đơn hoàn thành", noRevenue: "Không có đơn hoàn thành trong khoảng thời gian này.", orderStatus: "Trạng thái đơn hàng", statusDescription: "Phân bổ đơn hàng theo trạng thái hiện tại.", orders: "Đơn hàng", pending: "Chờ xử lý", processing: "Đang xử lý", shipping: "Đang giao", completed: "Hoàn thành", cancelled: "Đã hủy", refunded: "Đã hoàn tiền", salesAnalytics: "Phân tích đơn hàng", salesDescription: "So sánh các trạng thái đơn hàng chính.", revenue: "Doanh thu"
  } : {
    revenueByDay: "Revenue Analytics", revenueDescription: "Track revenue and order trends over time.", completedOnly: "Completed only", noRevenue: "No completed orders in this period.", orderStatus: "Order Status", statusDescription: "Order distribution by current status.", orders: "Orders", pending: "Pending", processing: "Processing", shipping: "Shipping", completed: "Completed", cancelled: "Cancelled", refunded: "Refunded", salesAnalytics: "Sales Analytics", salesDescription: "Compare main order statuses.", revenue: "Revenue"
  };
  const statusLabels: Record<string, string> = { pending: t.pending, processing: t.processing, shipping: t.shipping, completed: t.completed, cancelled: t.cancelled, refunded: t.refunded };
  const totalStatuses = Math.max(Object.values(statuses).reduce((sum, value) => sum + value, 0), 1);

  const pieData = Object.entries(statuses)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
      color: statusColors[status] || "#cbd5e1"
    }));

  const barData = [
    { name: t.completed, value: statuses.completed || 0, fill: statusColors.completed },
    { name: t.pending, value: statuses.pending || 0, fill: statusColors.pending },
    { name: t.cancelled, value: statuses.cancelled || 0, fill: statusColors.cancelled },
    { name: t.refunded, value: statuses.refunded || 0, fill: statusColors.refunded },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {/* Revenue Line Chart */}
      <section className="col-span-full xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{t.revenueByDay}</h2>
            <p className="mt-1 text-sm text-slate-500">{t.revenueDescription}</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{t.completedOnly}</span>
        </div>
        {trend.length ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(val) => val.slice(5)} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} dx={-10} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dx={10} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
                  formatter={(value: any, name: any) => [name === "revenue" ? formatCurrency.format(Number(value)) : value, name === "revenue" ? t.revenue : t.orders]}
                  labelStyle={{ fontWeight: "bold", color: "#0f172a", marginBottom: "4px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name={t.revenue} stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
                <Line yAxisId="right" type="monotone" dataKey="orders" name={t.orders} stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : <EmptyChart label={t.noRevenue} />}
      </section>

      {/* Order Status Donut Chart */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t.orderStatus}</h2>
          <p className="mt-1 text-sm text-slate-500">{t.statusDescription}</p>
        </div>
        <div className="flex-1 flex flex-col justify-center mt-6">
          <div className="h-48 w-full relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={2}
                   dataKey="value"
                   stroke="none"
                 >
                   {pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <RechartsTooltip 
                   contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                   itemStyle={{ color: "#0f172a", fontWeight: "500" }}
                 />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900">{Object.values(statuses).reduce((a, b) => a + b, 0)}</span>
                <span className="text-xs text-slate-500">{t.orders}</span>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3 mt-6">
            {Object.entries(statuses).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between gap-2 text-sm text-slate-600">
                <span className="flex min-w-0 items-center gap-2 truncate"><i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: statusColors[status] || "#cbd5e1" }} />{statusLabels[status] || status}</span>
                <strong className="text-slate-900 shrink-0">{count}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sales Analytics Bar Chart */}
      <section className="col-span-full xl:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t.salesAnalytics}</h2>
          <p className="mt-1 text-sm text-slate-500">{t.salesDescription}</p>
        </div>
        <div className="h-64 w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              <RechartsTooltip 
                cursor={{ fill: "#f1f5f9" }}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
              <Bar dataKey="value" name={t.orders} radius={[4, 4, 0, 0]} maxBarSize={60}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return <div className="grid h-80 place-items-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">{label}</div>;
}
