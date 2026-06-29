"use client";

import { AdminLayout } from "../AdminLayout";
import { useLanguage } from "@/app/providers";
import { useEffect, useMemo, useState } from "react";

type OrderItem = {
  name?: string;
  quantity?: number;
  price?: number;
};

type Order = {
  _id: string;
  code: string;
  email?: string;
  phone?: string;
  fullName?: string;
  address?: string;
  total: number;
  status?: string;
  fulfillmentStatus?: string;
  paymentStatus?: string;
  payment?: string;
  shipping?: string;
  items: OrderItem[];
  createdAt: string;
};

const labels = {
  vi: {
    title: "Quản lý đơn hàng",
    subtitle: "Theo dõi đơn hàng, trạng thái giao hàng và thông tin khách hàng.",
    totalOrders: "Tổng đơn",
    pendingOrders: "Chờ xử lý",
    completedOrders: "Hoàn tất",
    revenue: "Doanh thu",
    loading: "Đang tải đơn hàng...",
    empty: "Không có đơn hàng nào.",
    loadError: "Lỗi khi tải đơn hàng.",
    orderCode: "Mã đơn",
    customer: "Khách hàng",
    total: "Tổng tiền",
    status: "Trạng thái",
    detailTitle: "Chi tiết đơn hàng",
    email: "Email",
    phone: "Điện thoại",
    address: "Địa chỉ",
    products: "Sản phẩm",
    payment: "Thanh toán",
    shipping: "Giao hàng",
    createdAt: "Ngày tạo",
    retailCustomer: "Khách lẻ",
    selectHint: "Chọn một đơn hàng để xem chi tiết.",
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    shipped: "Đã gửi",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
    paid: "Đã thanh toán",
    unpaid: "Chưa thanh toán",
  },
  en: {
    title: "Order Management",
    subtitle: "Track orders, delivery status, and customer information.",
    totalOrders: "Total orders",
    pendingOrders: "Pending",
    completedOrders: "Completed",
    revenue: "Revenue",
    loading: "Loading orders...",
    empty: "No orders found.",
    loadError: "Could not load orders.",
    orderCode: "Order code",
    customer: "Customer",
    total: "Total",
    status: "Status",
    detailTitle: "Order detail",
    email: "Email",
    phone: "Phone",
    address: "Address",
    products: "Products",
    payment: "Payment",
    shipping: "Shipping",
    createdAt: "Created at",
    retailCustomer: "Retail customer",
    selectHint: "Select an order to view details.",
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    paid: "Paid",
    unpaid: "Unpaid",
  },
} as const;

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function getOrderStatus(order: Order) {
  return order.fulfillmentStatus || order.status || "pending";
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 ring-amber-100";
    case "processing":
      return "bg-blue-50 text-blue-700 ring-blue-100";
    case "shipped":
      return "bg-violet-50 text-violet-700 ring-violet-100";
    case "delivered":
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    case "cancelled":
      return "bg-red-50 text-red-700 ring-red-100";
    default:
      return "bg-gray-50 text-gray-700 ring-gray-100";
  }
}

export default function AdminOrders() {
  const { language } = useLanguage();
  const t = labels[language];
  const locale = language === "vi" ? "vi-VN" : "en-US";
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      alert(t.loadError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = useMemo(() => {
    const completed = orders.filter((order) => getOrderStatus(order) === "delivered").length;
    const pending = orders.filter((order) => getOrderStatus(order) === "pending").length;
    const revenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

    return {
      total: orders.length,
      pending,
      completed,
      revenue,
    };
  }, [orders]);

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      pending: t.pending,
      processing: t.processing,
      shipped: t.shipped,
      delivered: t.delivered,
      cancelled: t.cancelled,
    };
    return statusLabels[status] || status;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
            MOCO Orders
          </p>
          <h1 className="mt-2 text-3xl font-black text-gray-950">{t.title}</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-gray-600">
            {t.subtitle}
          </p>
        </div>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: t.totalOrders, value: stats.total, tone: "border-blue-100 bg-blue-50 text-blue-700" },
            { label: t.pendingOrders, value: stats.pending, tone: "border-amber-100 bg-amber-50 text-amber-700" },
            { label: t.completedOrders, value: stats.completed, tone: "border-emerald-100 bg-emerald-50 text-emerald-700" },
            { label: t.revenue, value: currency.format(stats.revenue), tone: "border-gray-200 bg-white text-gray-950" },
          ].map((item) => (
            <article key={item.label} className={`rounded-lg border p-5 shadow-sm ${item.tone}`}>
              <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{item.label}</p>
              <strong className="mt-3 block text-2xl font-black">{item.value}</strong>
            </article>
          ))}
        </section>

        {isLoading ? (
          <div className="rounded-lg bg-white p-10 text-center font-semibold text-gray-500 shadow-sm">
            {t.loading}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg bg-white p-10 text-center font-semibold text-gray-500 shadow-sm">
            {t.empty}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-gray-50 text-left text-xs font-black uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">{t.orderCode}</th>
                      <th className="px-4 py-3">{t.customer}</th>
                      <th className="px-4 py-3">{t.total}</th>
                      <th className="px-4 py-3">{t.status}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {orders.map((order) => {
                      const status = getOrderStatus(order);
                      return (
                        <tr
                          key={order._id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <td className="px-4 py-4 font-black text-blue-700">{order.code}</td>
                          <td className="px-4 py-4 font-semibold text-gray-700">
                            {order.fullName || order.email || t.retailCustomer}
                          </td>
                          <td className="px-4 py-4 font-black text-gray-950">
                            {currency.format(Number(order.total) || 0)}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${getStatusColor(status)}`}>
                              {getStatusLabel(status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="h-fit rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              {selectedOrder ? (
                <div className="space-y-4 text-sm">
                  <h2 className="text-xl font-black text-gray-950">{t.detailTitle}</h2>
                  <dl className="grid gap-3">
                    <div>
                      <dt className="font-bold text-gray-500">{t.orderCode}</dt>
                      <dd className="mt-1 font-black text-blue-700">{selectedOrder.code}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-gray-500">{t.customer}</dt>
                      <dd className="mt-1 font-semibold text-gray-900">
                        {selectedOrder.fullName || t.retailCustomer}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold text-gray-500">{t.email}</dt>
                      <dd className="mt-1 font-semibold text-gray-900">{selectedOrder.email || "-"}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-gray-500">{t.phone}</dt>
                      <dd className="mt-1 font-semibold text-gray-900">{selectedOrder.phone || "-"}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-gray-500">{t.address}</dt>
                      <dd className="mt-1 font-semibold text-gray-900">{selectedOrder.address || "-"}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-gray-500">{t.payment}</dt>
                      <dd className="mt-1 font-semibold text-gray-900">
                        {selectedOrder.payment || "-"} · {selectedOrder.paymentStatus === "paid" ? t.paid : t.unpaid}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold text-gray-500">{t.shipping}</dt>
                      <dd className="mt-1 font-semibold text-gray-900">{selectedOrder.shipping || "-"}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-gray-500">{t.createdAt}</dt>
                      <dd className="mt-1 font-semibold text-gray-900">
                        {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString(locale) : "-"}
                      </dd>
                    </div>
                  </dl>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="mb-2 font-bold text-gray-500">{t.products}</p>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                          <span className="font-semibold text-gray-800">
                            {item.name || "-"} x{item.quantity || 1}
                          </span>
                          <span className="font-black text-gray-950">
                            {currency.format((Number(item.price) || 0) * (Number(item.quantity) || 1))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-lg font-black text-gray-950">
                      {t.total}: {currency.format(Number(selectedOrder.total) || 0)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center font-semibold text-gray-500">{t.selectHint}</div>
              )}
            </aside>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
