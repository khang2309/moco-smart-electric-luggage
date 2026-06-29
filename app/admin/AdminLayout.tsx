"use client";

import { readCurrentUser } from "@/app/auth-storage";
import { useLanguage } from "@/app/providers";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const labels = {
  vi: {
    loading: "Đang tải...",
    dashboard: "Dashboard",
    products: "Quản lý sản phẩm",
    orders: "Quản lý đơn hàng",
    users: "Quản lý người dùng",
  },
  en: {
    loading: "Loading...",
    dashboard: "Dashboard",
    products: "Product management",
    orders: "Order management",
    users: "User management",
  },
} as const;

export function AdminLayout({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const t = labels[language];
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = readCurrentUser();
    if (!user || user.role !== "admin") {
      router.push("/");
    } else {
      setIsAuthorized(true);
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">{t.loading}</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">MOCO Admin</h1>
        </div>
        <nav className="space-y-2 px-4">
          <a href="/admin" className="block rounded px-4 py-2 transition hover:bg-gray-700">
            {t.dashboard}
          </a>
          <a href="/admin/products" className="block rounded px-4 py-2 transition hover:bg-gray-700">
            {t.products}
          </a>
          <a href="/admin/orders" className="block rounded px-4 py-2 transition hover:bg-gray-700">
            {t.orders}
          </a>
          <a href="/admin/users" className="block rounded px-4 py-2 transition hover:bg-gray-700">
            {t.users}
          </a>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-6">{children}</div>
      </main>
    </div>
  );
}
