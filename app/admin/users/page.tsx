"use client";

import { AdminLayout } from "../AdminLayout";
import { useLanguage } from "@/app/providers";
import { useEffect, useMemo, useState } from "react";

type User = {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  createdAt: string;
};

const labels = {
  vi: {
    title: "Quản lý người dùng",
    subtitle: "Theo dõi tài khoản khách hàng và quyền quản trị trong hệ thống.",
    totalUsers: "Tổng người dùng",
    admins: "Quản trị viên",
    customers: "Khách hàng",
    loading: "Đang tải người dùng...",
    empty: "Không có người dùng nào.",
    loadError: "Lỗi khi tải người dùng.",
    name: "Tên",
    email: "Email",
    phone: "Điện thoại",
    role: "Vai trò",
    createdAt: "Ngày tạo",
    admin: "Quản trị viên",
    customer: "Khách hàng",
    unknown: "Chưa cập nhật",
  },
  en: {
    title: "User Management",
    subtitle: "Track customer accounts and administrator access in the system.",
    totalUsers: "Total users",
    admins: "Administrators",
    customers: "Customers",
    loading: "Loading users...",
    empty: "No users found.",
    loadError: "Could not load users.",
    name: "Name",
    email: "Email",
    phone: "Phone",
    role: "Role",
    createdAt: "Created at",
    admin: "Administrator",
    customer: "Customer",
    unknown: "Not updated",
  },
} as const;

export default function AdminUsers() {
  const { language } = useLanguage();
  const t = labels[language];
  const locale = language === "vi" ? "vi-VN" : "en-US";
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      alert(t.loadError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = useMemo(() => {
    const admins = users.filter((user) => user.role === "admin").length;
    return {
      total: users.length,
      admins,
      customers: users.length - admins,
    };
  }, [users]);

  const getRoleColor = (role: string) => {
    return role === "admin"
      ? "bg-red-50 text-red-700 ring-red-100"
      : "bg-emerald-50 text-emerald-700 ring-emerald-100";
  };

  const getRoleLabel = (role: string) => {
    return role === "admin" ? t.admin : t.customer;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
            MOCO Users
          </p>
          <h1 className="mt-2 text-3xl font-black text-gray-950">{t.title}</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-gray-600">
            {t.subtitle}
          </p>
        </div>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { label: t.totalUsers, value: stats.total, tone: "border-blue-100 bg-blue-50 text-blue-700" },
            { label: t.admins, value: stats.admins, tone: "border-red-100 bg-red-50 text-red-700" },
            { label: t.customers, value: stats.customers, tone: "border-emerald-100 bg-emerald-50 text-emerald-700" },
          ].map((item) => (
            <article key={item.label} className={`rounded-lg border p-5 shadow-sm ${item.tone}`}>
              <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{item.label}</p>
              <strong className="mt-3 block text-3xl font-black">{item.value}</strong>
            </article>
          ))}
        </section>

        {isLoading ? (
          <div className="rounded-lg bg-white p-10 text-center font-semibold text-gray-500 shadow-sm">
            {t.loading}
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-lg bg-white p-10 text-center font-semibold text-gray-500 shadow-sm">
            {t.empty}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-gray-50 text-left text-xs font-black uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">{t.name}</th>
                    <th className="px-4 py-3">{t.email}</th>
                    <th className="px-4 py-3">{t.phone}</th>
                    <th className="px-4 py-3">{t.role}</th>
                    <th className="px-4 py-3">{t.createdAt}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-black text-gray-950">
                        {user.name || t.unknown}
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-600">{user.email}</td>
                      <td className="px-4 py-4 font-semibold text-gray-600">
                        {user.phone || "-"}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString(locale) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
