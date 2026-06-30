"use client";

import { AdminLayout } from "../AdminLayout";
import { useLanguage } from "@/app/providers";
import { useEffect, useMemo, useState } from "react";

type Product = {
  _id: string;
  slug?: string;
  name: string;
  description?: string;
  subtitle?: string;
  store?: string;
  price: number;
  oldPrice?: number;
  image?: string;
  stock: number;
  status?: "active" | "draft" | "deleted";
  createdAt?: string;
  updatedAt?: string;
};

type ProductForm = {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  price: string;
  oldPrice: string;
  image: string;
  stock: string;
  store: string;
  status: string;
};

const emptyForm: ProductForm = {
  slug: "",
  name: "",
  subtitle: "",
  description: "",
  price: "",
  oldPrice: "",
  image: "",
  stock: "",
  store: "MOCO Official",
  status: "active",
};

const text = {
  vi: {
    title: "Quản lý sản phẩm & kho",
    subtitle: "Thêm, sửa, xóa sản phẩm và theo dõi tồn kho từ MongoDB.",
    addProduct: "Thêm sản phẩm",
    editProduct: "Sửa sản phẩm",
    cancel: "Hủy",
    save: "Lưu thay đổi",
    create: "Tạo sản phẩm",
    refresh: "Làm mới",
    search: "Tìm theo tên, slug hoặc mô tả...",
    totalProducts: "Tổng sản phẩm",
    totalStock: "Tổng tồn kho",
    lowStock: "Sắp hết hàng",
    outOfStock: "Hết hàng",
    productInfo: "Thông tin sản phẩm",
    productName: "Tên sản phẩm",
    slug: "Slug",
    subtitleField: "Mô tả ngắn",
    description: "Mô tả chi tiết",
    price: "Giá bán",
    oldPrice: "Giá gốc",
    image: "URL hình ảnh",
    stock: "Tồn kho",
    store: "Cửa hàng",
    product: "Sản phẩm",
    inventory: "Kho",
    status: "Trạng thái",
    updated: "Cập nhật",
    actions: "Thao tác",
    edit: "Sửa",
    delete: "Xóa",
    loading: "Đang tải sản phẩm...",
    empty: "Chưa có sản phẩm nào.",
    inStock: "Còn hàng",
    lowStockLabel: "Sắp hết",
    outOfStockLabel: "Hết hàng",
    saved: "Đã lưu sản phẩm.",
    deleted: "Đã xóa sản phẩm.",
    confirmDelete: "Bạn có chắc muốn xóa sản phẩm này?",
    loadError: "Lỗi khi tải sản phẩm.",
    saveError: "Lỗi khi lưu sản phẩm.",
    deleteError: "Lỗi khi xóa sản phẩm.",
    requiredError: "Vui lòng nhập tên sản phẩm và giá bán.",
    noImage: "Không có ảnh",
    activeStatus: "Đang kích hoạt",
    draftStatus: "Đã ẩn",
    deletedStatus: "Đã xóa",
  },
  en: {
    title: "Product & Inventory Management",
    subtitle: "Create, update, delete products and track MongoDB inventory.",
    addProduct: "Add product",
    editProduct: "Edit product",
    cancel: "Cancel",
    save: "Save changes",
    create: "Create product",
    refresh: "Refresh",
    search: "Search by name, slug, or description...",
    totalProducts: "Total products",
    totalStock: "Total stock",
    lowStock: "Low stock",
    outOfStock: "Out of stock",
    productInfo: "Product information",
    productName: "Product name",
    slug: "Slug",
    subtitleField: "Short description",
    description: "Full description",
    price: "Sale price",
    oldPrice: "Original price",
    image: "Image URL",
    stock: "Stock",
    store: "Store",
    product: "Product",
    inventory: "Inventory",
    status: "Status",
    updated: "Updated",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    loading: "Loading products...",
    empty: "No products found.",
    inStock: "In stock",
    lowStockLabel: "Low stock",
    outOfStockLabel: "Out of stock",
    saved: "Product saved.",
    deleted: "Product deleted.",
    confirmDelete: "Are you sure you want to delete this product?",
    loadError: "Could not load products.",
    saveError: "Could not save product.",
    deleteError: "Could not delete product.",
    requiredError: "Please enter product name and sale price.",
    noImage: "No image",
    activeStatus: "Active",
    draftStatus: "Hidden",
    deletedStatus: "Deleted",
  },
} as const;

type ProductLabels = {
  [Key in keyof (typeof text)["vi"]]: string;
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function getStockStatus(stock: number, labels: ProductLabels) {
  if (stock <= 0) {
    return {
      label: labels.outOfStockLabel,
      className: "bg-red-50 text-red-700 ring-red-100",
      bar: "bg-red-500",
    };
  }

  if (stock <= 5) {
    return {
      label: labels.lowStockLabel,
      className: "bg-amber-50 text-amber-700 ring-amber-100",
      bar: "bg-amber-500",
    };
  }

  return {
    label: labels.inStock,
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    bar: "bg-emerald-500",
  };
}

function productToForm(product: Product): ProductForm {
  return {
    slug: product.slug || "",
    name: product.name || "",
    subtitle: product.subtitle || "",
    description: product.description || "",
    price: String(product.price || ""),
    oldPrice: String(product.oldPrice || ""),
    image: product.image || "",
    stock: String(product.stock || 0),
    store: product.store || "MOCO Official",
    status: product.status || "active",
  };
}

export default function AdminProducts() {
  const { language } = useLanguage();
  const labels = text[language];
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [formData, setFormData] = useState<ProductForm>(emptyForm);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      alert(labels.loadError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return products;

    return products.filter((product) =>
      [product.name, product.slug, product.subtitle, product.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [products, query]);

  const inventory = useMemo(() => {
    const totalStock = products.reduce((sum, product) => sum + (Number(product.stock) || 0), 0);
    const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 5).length;
    const outOfStock = products.filter((product) => product.stock <= 0).length;

    return {
      totalProducts: products.length,
      totalStock,
      lowStock,
      outOfStock,
    };
  }, [products]);

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(false);
  };

  const startCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const startEdit = (product: Product) => {
    setEditingId(product._id);
    setFormData(productToForm(product));
    setShowForm(true);
  };

  const handleChange = (field: keyof ProductForm, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.price) {
      alert(labels.requiredError);
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      oldPrice: Number(formData.oldPrice) || 0,
      stock: Number(formData.stock) || 0,
      status: formData.status,
    };
    const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";

    try {
      setIsSaving(true);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || labels.saveError);
      }

      if (editingId) {
        setProducts((current) =>
          current.map((product) => (product._id === editingId ? data.product : product)),
        );
      } else {
        setProducts((current) => [data.product, ...current]);
      }

      resetForm();
      alert(labels.saved);
    } catch (error) {
      console.error("Failed to save product:", error);
      alert(labels.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(labels.confirmDelete)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${product._id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || labels.deleteError);
      }

      setProducts((current) => current.map((item) => item._id === product._id ? { ...item, status: "deleted" as const } : item));
      if (editingId === product._id) {
        resetForm();
      }
      alert(labels.deleted);
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert(labels.deleteError);
    }
  };

  const cards = [
    { label: labels.totalProducts, value: inventory.totalProducts, tone: "border-blue-100 bg-blue-50 text-blue-700" },
    { label: labels.totalStock, value: inventory.totalStock, tone: "border-emerald-100 bg-emerald-50 text-emerald-700" },
    { label: labels.lowStock, value: inventory.lowStock, tone: "border-amber-100 bg-amber-50 text-amber-700" },
    { label: labels.outOfStock, value: inventory.outOfStock, tone: "border-red-100 bg-red-50 text-red-700" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
              MOCO Inventory
            </p>
            <h1 className="mt-2 text-3xl font-black text-gray-950">{labels.title}</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-gray-600">
              {labels.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={fetchProducts}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-black text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              {labels.refresh}
            </button>
            <button
              type="button"
              onClick={showForm ? resetForm : startCreate}
              className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-gray-800"
            >
              {showForm ? labels.cancel : labels.addProduct}
            </button>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article key={card.label} className={`rounded-lg border p-5 shadow-sm ${card.tone}`}>
              <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{card.label}</p>
              <strong className="mt-3 block text-3xl font-black">{card.value}</strong>
            </article>
          ))}
        </section>

        {showForm && (
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-black text-gray-950">
                {editingId ? labels.editProduct : labels.addProduct}
              </h2>
              <p className="mt-1 text-sm font-semibold text-gray-500">{labels.productInfo}</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <label className="grid gap-1 text-sm font-bold text-gray-700 lg:col-span-2">
                {labels.productName}
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="grid gap-1 text-sm font-bold text-gray-700">
                {labels.slug}
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(event) => handleChange("slug", event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="grid gap-1 text-sm font-bold text-gray-700">
                {labels.store}
                <input
                  type="text"
                  value={formData.store}
                  onChange={(event) => handleChange("store", event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="grid gap-1 text-sm font-bold text-gray-700 lg:col-span-2">
                {labels.subtitleField}
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(event) => handleChange("subtitle", event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="grid gap-1 text-sm font-bold text-gray-700">
                {labels.price}
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(event) => handleChange("price", event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="grid gap-1 text-sm font-bold text-gray-700">
                {labels.oldPrice}
                <input
                  type="number"
                  min="0"
                  value={formData.oldPrice}
                  onChange={(event) => handleChange("oldPrice", event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="grid gap-1 text-sm font-bold text-gray-700 lg:col-span-3">
                {labels.image}
                <input
                  type="text"
                  value={formData.image}
                  onChange={(event) => handleChange("image", event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="grid gap-1 text-sm font-bold text-gray-700">
                {labels.stock}
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(event) => handleChange("stock", event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="grid gap-1 text-sm font-bold text-gray-700">
                {labels.status}
                <select
                  value={formData.status}
                  onChange={(event) => handleChange("status", event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="active">{labels.activeStatus}</option>
                  <option value="draft">{labels.draftStatus}</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm font-bold text-gray-700 lg:col-span-4">
                {labels.description}
                <textarea
                  value={formData.description}
                  onChange={(event) => handleChange("description", event.target.value)}
                  rows={3}
                  className="rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <div className="flex flex-wrap gap-2 lg:col-span-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? labels.loading : editingId ? labels.save : labels.create}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-black text-gray-700 transition hover:bg-gray-50"
                >
                  {labels.cancel}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-black text-gray-950">{labels.productInfo}</h2>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.search}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="p-10 text-center font-semibold text-gray-500">{labels.loading}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-10 text-center font-semibold text-gray-500">{labels.empty}</div>
          ) : (
            <table className="w-full block md:table">
              <thead className="bg-gray-50 text-left text-xs font-black uppercase tracking-wide text-gray-500 hidden md:table-header-group">
                <tr>
                  <th className="px-4 py-3">{labels.product}</th>
                  <th className="px-4 py-3">{labels.price}</th>
                  <th className="px-4 py-3">{labels.inventory}</th>
                  <th className="px-4 py-3">{labels.status}</th>
                  <th className="px-4 py-3">{labels.updated}</th>
                  <th className="px-4 py-3 text-right">{labels.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm block md:table-row-group">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(Number(product.stock) || 0, labels);
                  const stockPercent = Math.min(100, Math.max(4, ((Number(product.stock) || 0) / 30) * 100));

                  return (
                    <tr key={product._id} className="hover:bg-gray-50 flex flex-col p-4 gap-4 md:table-row md:p-0 md:gap-0">
                      <td className="md:px-4 md:py-4 block md:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="flex h-16 w-16 md:h-14 md:w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-xs font-black text-gray-400">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="h-full w-full object-cover md:object-contain" />
                            ) : (
                              labels.noImage
                            )}
                          </div>
                          <div>
                            <p className="font-black text-gray-950 text-base md:text-sm">{product.name}</p>
                            <p className="mt-1 text-xs font-semibold text-gray-500 line-clamp-1">{product.slug || product.subtitle || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="md:px-4 md:py-4 flex justify-between items-center md:items-start md:flex-col md:justify-center md:table-cell">
                        <span className="md:hidden text-xs font-bold text-gray-500 uppercase">{labels.price}</span>
                        <div className="text-right md:text-left">
                          <p className="font-black text-gray-950">{currency.format(Number(product.price) || 0)}</p>
                          {Number(product.oldPrice) > 0 && (
                            <p className="text-xs font-semibold text-gray-400 line-through">
                              {currency.format(Number(product.oldPrice))}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="md:px-4 md:py-4 flex justify-between items-center md:table-cell">
                        <span className="md:hidden text-xs font-bold text-gray-500 uppercase">{labels.inventory}</span>
                        <div className="flex flex-col items-end md:items-start">
                          <p className="mb-2 font-black text-gray-950">{product.stock}</p>
                          <div className="h-2 w-24 md:w-28 overflow-hidden rounded-full bg-gray-100">
                            <div className={`h-full ${stockStatus.bar}`} style={{ width: `${stockPercent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="md:px-4 md:py-4 flex justify-between items-center md:table-cell">
                        <span className="md:hidden text-xs font-bold text-gray-500 uppercase">{labels.status}</span>
                        <div className="flex gap-2 flex-wrap justify-end md:justify-start md:space-y-2 md:space-x-0 md:block">
                          <span className={`block w-max rounded-full px-3 py-1 text-xs font-black ring-1 ${stockStatus.className}`}>
                            {stockStatus.label}
                          </span>
                          <span className={`block w-max rounded-full px-3 py-1 text-xs font-black ring-1 ${
                            product.status === "deleted" ? "bg-gray-50 text-gray-700 ring-gray-200" :
                            product.status === "draft" ? "bg-amber-50 text-amber-700 ring-amber-200" :
                            "bg-blue-50 text-blue-700 ring-blue-200"
                          }`}>
                            {product.status === "deleted" ? labels.deletedStatus : product.status === "draft" ? labels.draftStatus : labels.activeStatus}
                          </span>
                        </div>
                      </td>
                      <td className="md:px-4 md:py-4 flex justify-between items-center md:table-cell font-semibold text-gray-500">
                        <span className="md:hidden text-xs font-bold text-gray-500 uppercase">{labels.updated}</span>
                        <span>
                          {product.updatedAt || product.createdAt
                            ? new Date(product.updatedAt || product.createdAt || "").toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")
                            : "-"}
                        </span>
                      </td>
                      <td className="md:px-4 md:py-4 flex justify-end md:table-cell border-t border-gray-100 md:border-0 pt-4 mt-2 md:pt-4 md:mt-0">
                        <div className="flex justify-end gap-2 w-full md:w-auto">
                          <button
                            type="button"
                            onClick={() => startEdit(product)}
                            className="flex-1 md:flex-none justify-center rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 md:px-3 md:py-2 text-sm md:text-xs font-black text-blue-700 transition hover:bg-blue-100"
                          >
                            {labels.edit}
                          </button>
                          {product.status !== "deleted" && (
                            <button
                              type="button"
                              onClick={() => handleDelete(product)}
                              className="flex-1 md:flex-none justify-center rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 md:px-3 md:py-2 text-sm md:text-xs font-black text-red-700 transition hover:bg-red-100"
                            >
                              {labels.delete}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
