"use client";

import { readCurrentUser } from "@/app/auth-storage";
import { useLanguage } from "@/app/providers";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const labels = {
  vi: {
    loading: "Đang tải...",
    dashboard: "Dashboard",
    products: "Quản lý sản phẩm",
    orders: "Quản lý đơn hàng",
    warranties: "Quản lý bảo hành",
    users: "Quản lý người dùng",
  },
  en: {
    loading: "Loading...",
    dashboard: "Dashboard",
    products: "Product management",
    orders: "Order management",
    warranties: "Warranty management",
    users: "User management",
  },
} as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const t = labels[language];
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const user = readCurrentUser();
    if (!user || user.role !== "admin") {
      router.push("/");
    } else {
      setIsAuthorized(true);
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">{t.loading}</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6">
          <h1 className="text-2xl font-bold">MOCO Admin</h1>
          <button className="md:hidden p-2 -mr-2 text-gray-300 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="space-y-2 px-4">
          <Link href="/admin" className="block rounded px-4 py-2 transition hover:bg-gray-700">
            {t.dashboard}
          </Link>
          <Link href="/admin/products" className="block rounded px-4 py-2 transition hover:bg-gray-700">
            {t.products}
          </Link>
          <Link href="/admin/orders" className="block rounded px-4 py-2 transition hover:bg-gray-700">
            {t.orders}
          </Link>
          <Link href="/admin/warranties" className="block rounded px-4 py-2 transition hover:bg-gray-700">
            {t.warranties}
          </Link>
          <Link href="/admin/users" className="block rounded px-4 py-2 transition hover:bg-gray-700">
            {t.users}
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 flex items-center bg-white px-4 py-3 shadow-sm md:hidden">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="mr-4 p-1 text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">MOCO Admin</h1>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
