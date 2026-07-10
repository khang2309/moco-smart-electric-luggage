"use client";
import { toast } from "react-hot-toast";


import { useLanguage } from "@/app/providers";
import { useEffect, useMemo, useState, useRef } from "react";

type Product = {
  _id: string;
  slug?: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  store?: string;
  price: number;
  oldPrice?: number;
  image?: string;
  imagePublicId?: string;
  stock: number;
  status?: "active" | "draft" | "deleted";
  active?: boolean;
  hidden?: boolean;
  colors?: { name: string; nameEn?: string; hex: string; image: string; imagePublicId?: string }[];
  features?: string[];
  createdAt?: string;
  updatedAt?: string;
};

type ProductForm = {
  slug: string;
  name: string;
  nameEn: string;
  subtitle: string;
  subtitleEn: string;
  description: string;
  descriptionEn: string;
  price: string;
  oldPrice: string;
  image: string;
  imagePublicId: string;
  stock: string;
  store: string;
  active: boolean;
  hidden: boolean;
  colors: { name: string; nameEn: string; hex: string; image: string; imagePublicId: string }[];
  features: string[];
};

const emptyForm: ProductForm = {
  slug: "",
  name: "",
  nameEn: "",
  subtitle: "",
  subtitleEn: "",
  description: "",
  descriptionEn: "",
  price: "",
  oldPrice: "",
  image: "",
  imagePublicId: "",
  stock: "",
  store: "MOCO Official",
  active: true,
  hidden: false,
  colors: [],
  features: [],
};

const AVAILABLE_FEATURES = [
  { id: "ride", label: "Ngồi lái (Ride-on control)" },
  { id: "removableBattery", label: "Pin tháo rời (Removable battery)" },
  { id: "phoneCharge", label: "Sạc điện thoại (Phone charging)" },
  { id: "airlineBattery", label: "Pin tiêu chuẩn bay (Airline-ready battery)" },
  { id: "brake", label: "Phanh điện tử (Electronic brake)" },
  { id: "lock", label: "Khóa thông minh (Smart lock)" },
  { id: "gps", label: "Định vị GPS (GPS tracking)" },
  { id: "follow", label: "Tự động đi theo (Auto-follow mode)" },
  { id: "obstacle", label: "Tránh vật cản (Obstacle avoidance)" },
  { id: "alarm", label: "Còi cảnh báo (Warning alarm)" },
  { id: "light", label: "Đèn cảnh báo (Warning light)" },
  { id: "app", label: "Kết nối App (App control)" }
];

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
    colors: "Màu sắc",
    addColor: "Thêm màu",
    colorName: "Tên màu",
    colorHex: "Mã màu (Hex)",
    colorImage: "URL ảnh màu",
    productImageUpload: "Chọn ảnh để tải lên (tối đa 5 MB)",
    restore: "Khôi phục",
    confirmRestore: "Bạn có chắc muốn khôi phục sản phẩm này?",
    restored: "Khôi phục sản phẩm thành công.",
    restoreError: "Lỗi khi khôi phục sản phẩm.",
    translating: "Đang dịch...",
    translateSuccess: "Đã tạo và dịch nội dung sản phẩm thành công.",
    translateError: "Sản phẩm đã được lưu nhưng chưa thể tạo bản dịch tiếng Anh.",
    translateAgain: "Dịch lại",
    translateWarning: "Nội dung tiếng Việt đã thay đổi. Bạn có muốn cập nhật lại bản dịch tiếng Anh không?",
    productNameEn: "Tên sản phẩm (English)",
    subtitleFieldEn: "Mô tả ngắn (English)",
    descriptionEnField: "Mô tả chi tiết (English)",
    colorNameEn: "Tên màu (English)",
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
    colors: "Colors",
    addColor: "Add color",
    colorName: "Color name",
    colorHex: "Color hex",
    colorImage: "Color image URL",
    productImageUpload: "Choose an image from your computer (Maximum 5MB)",
    restore: "Restore",
    confirmRestore: "Are you sure you want to restore this product?",
    restored: "Product restored successfully.",
    restoreError: "Could not restore product.",
    translating: "Translating...",
    translateSuccess: "Product created and translated successfully.",
    translateError: "Product saved but could not generate English translation.",
    translateAgain: "Translate again",
    translateWarning: "Vietnamese content has changed. Do you want to update the English translation?",
    productNameEn: "Product name (English)",
    subtitleFieldEn: "Short description (English)",
    descriptionEnField: "Full description (English)",
    colorNameEn: "Color name (English)",
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
    nameEn: product.nameEn || "",
    subtitle: product.subtitle || "",
    subtitleEn: product.subtitleEn || "",
    description: product.description || "",
    descriptionEn: product.descriptionEn || "",
    price: String(product.price || ""),
    oldPrice: String(product.oldPrice || ""),
    image: product.image || "",
    imagePublicId: product.imagePublicId || "",
    stock: String(product.stock || 0),
    store: product.store || "MOCO Official",
    active: product.active !== undefined ? product.active : (product.status !== "draft" && product.status !== "deleted"),
    hidden: product.hidden !== undefined ? product.hidden : (product.status === "draft"),
    colors: product.colors?.map(c => ({...c, nameEn: c.nameEn || "", imagePublicId: c.imagePublicId || ""})) || [],
    features: product.features || [],
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [colorImageFiles, setColorImageFiles] = useState<Record<number, File>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [translateStatus, setTranslateStatus] = useState<"idle" | "translating" | "translated" | "error">("idle");
  const [originalViData, setOriginalViData] = useState<ProductForm | null>(null);

  const formSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showForm && formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Chỉ hỗ trợ định dạng ảnh (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dung lượng file không được vượt quá 5MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImageFile(file);
    setFormData((current) => ({ ...current, image: previewUrl }));
    setIsDirty(true);
  };

  const handleColorImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Chỉ hỗ trợ định dạng ảnh (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dung lượng file không được vượt quá 5MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setColorImageFiles((prev) => ({ ...prev, [index]: file }));
    setFormData((current) => {
      const newColors = [...current.colors];
      newColors[index].image = previewUrl;
      return { ...current, colors: newColors };
    });
    setIsDirty(true);
  };


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
      toast.error(labels.loadError);
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

  const cleanupPreviews = () => {
    if (formData.image && formData.image.startsWith("blob:")) URL.revokeObjectURL(formData.image);
    formData.colors.forEach(c => {
      if (c.image && c.image.startsWith("blob:")) URL.revokeObjectURL(c.image);
    });
    setImageFile(null);
    setColorImageFiles({});
    setIsDirty(false);
  };

  const resetForm = () => {
    cleanupPreviews();
    setEditingId(null);
    setFormData(emptyForm);
    setOriginalViData(null);
    setTranslateStatus("idle");
    setShowForm(false);
  };
  
  const handleCancel = () => {
    if (isDirty) {
      if (!window.confirm("Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.")) {
        return;
      }
    }
    resetForm();
  };

  const startCreate = () => {
    cleanupPreviews();
    setEditingId(null);
    setFormData(emptyForm);
    setOriginalViData(emptyForm);
    setTranslateStatus("idle");
    setShowForm(true);
  };

  const startEdit = (product: Product) => {
    cleanupPreviews();
    setEditingId(product._id);
    const mapped = productToForm(product);
    setFormData(mapped);
    setOriginalViData(mapped);
    setTranslateStatus("idle");
    setShowForm(true);
  };

  const handleChange = (field: keyof ProductForm, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.price) {
      toast.error(labels.requiredError);
      return;
    }

    const viChanged = originalViData && (
      formData.name !== originalViData.name ||
      formData.subtitle !== originalViData.subtitle ||
      formData.description !== originalViData.description ||
      JSON.stringify(formData.colors.map(c => c.name)) !== JSON.stringify(originalViData.colors.map(c => c.name))
    );

    let shouldTranslate = false;
    if (!editingId) {
      shouldTranslate = true;
    } else if (viChanged) {
      if (window.confirm(labels.translateWarning)) {
        shouldTranslate = true;
      }
    }

    let uploadedImage = formData.image;
    let uploadedImagePublicId = formData.imagePublicId;
    const newDeletedPublicIds: string[] = [];
    const newlyUploadedPublicIds: string[] = [];
    const updatedColors = [...formData.colors];

    const uploadFile = async (file: File) => {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Lỗi khi upload ảnh");
      }
      return data;
    };

    try {
      setIsSaving(true);

      if (imageFile) {
        const data = await uploadFile(imageFile);
        uploadedImage = data.url;
        if (formData.imagePublicId) newDeletedPublicIds.push(formData.imagePublicId);
        uploadedImagePublicId = data.publicId;
        newlyUploadedPublicIds.push(data.publicId);
      }

      for (const [indexStr, file] of Object.entries(colorImageFiles)) {
        const idx = Number(indexStr);
        const data = await uploadFile(file);
        if (updatedColors[idx].imagePublicId) newDeletedPublicIds.push(updatedColors[idx].imagePublicId);
        updatedColors[idx].image = data.url;
        updatedColors[idx].imagePublicId = data.publicId;
        newlyUploadedPublicIds.push(data.publicId);
      }

      const payload = {
        ...formData,
        price: Number(formData.price),
        oldPrice: Number(formData.oldPrice) || 0,
        stock: Number(formData.stock) || 0,
        active: formData.active,
        hidden: formData.hidden,
        image: uploadedImage,
        imagePublicId: uploadedImagePublicId,
        colors: updatedColors,
        deletedPublicIds: newDeletedPublicIds,
      };

      const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || labels.saveError);
      }

      let savedProduct = data.product;
      const isEditing = !!editingId;

      if (isEditing) {
        setProducts((current) =>
          current.map((product) => (product._id === editingId ? savedProduct : product)),
        );
      } else {
        setProducts((current) => [savedProduct, ...current]);
        setEditingId(savedProduct._id);
        setFormData(productToForm(savedProduct));
      }

      if (shouldTranslate) {
        setTranslateStatus("translating");
        try {
          const translateRes = await fetch(`/api/admin/products/${savedProduct._id}/translate`, { method: "POST" });
          const translateData = await translateRes.json();
          if (translateRes.ok && translateData.success) {
            setTranslateStatus("translated");
            setProducts((current) => current.map((product) => (product._id === savedProduct._id ? translateData.product : product)));
            toast.success(labels.translateSuccess);
            resetForm();
          } else {
            setTranslateStatus("error");
            toast.error(labels.translateError);
          }
        } catch (err) {
          setTranslateStatus("error");
          toast.error(labels.translateError);
        }
      } else {
        toast.success(labels.saved);
        resetForm();
      }
    } catch (error: any) {
      console.error("Failed to save product:", error);
      toast.error(error.message || labels.saveError);
      
      // Rollback any newly uploaded images from Cloudinary
      for (const pid of newlyUploadedPublicIds) {
        try {
          await fetch("/api/upload", { 
            method: "DELETE", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ publicId: pid }) 
          });
        } catch (cleanupError) {
          console.error("Cleanup error:", cleanupError);
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTranslateAgain = async () => {
    if (!editingId) return;
    setTranslateStatus("translating");
    try {
      const translateRes = await fetch(`/api/admin/products/${editingId}/translate`, { method: "POST" });
      const translateData = await translateRes.json();
      if (translateRes.ok && translateData.success) {
        setTranslateStatus("translated");
        setProducts((current) => current.map((product) => (product._id === editingId ? translateData.product : product)));
        toast.success(labels.translateSuccess);
        resetForm();
      } else {
        setTranslateStatus("error");
        toast.error(labels.translateError);
      }
    } catch (err) {
      setTranslateStatus("error");
      toast.error(labels.translateError);
    }
  };

  const handleRestore = async (product: Product) => {
    if (!window.confirm(labels.confirmRestore)) return;
    try {
      const res = await fetch(`/api/admin/products/${product._id}/restore`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || labels.restoreError);
      setProducts((current) => current.map((item) => item._id === product._id ? data.product : item));
      toast.success(labels.restored);
    } catch (error) {
      console.error("Failed to restore product:", error);
      toast.error(labels.restoreError);
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
      toast.success(labels.deleted);
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error(labels.deleteError);
    }
  };

  const cards = [
    { label: labels.totalProducts, value: inventory.totalProducts, tone: "border-blue-100 bg-blue-50 text-blue-700" },
    { label: labels.totalStock, value: inventory.totalStock, tone: "border-emerald-100 bg-emerald-50 text-emerald-700" },
    { label: labels.lowStock, value: inventory.lowStock, tone: "border-amber-100 bg-amber-50 text-amber-700" },
    { label: labels.outOfStock, value: inventory.outOfStock, tone: "border-red-100 bg-red-50 text-red-700" },
  ];

  return (
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
          <section ref={formSectionRef} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-950 flex items-center gap-2">
                  {editingId ? labels.editProduct : labels.addProduct}
                  {translateStatus === "translating" && (
                     <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{labels.translating}</span>
                  )}
                  {translateStatus === "error" && (
                     <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded-full">{labels.translateError}</span>
                  )}
                </h2>
                <p className="mt-1 text-sm font-semibold text-gray-500">{labels.productInfo}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div className="lg:col-span-2">
                {language === 'vi' ? (
                  <label className="grid gap-1 text-sm font-bold text-gray-700">
                    {labels.productName}
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(event) => handleChange("name", event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                ) : (
                  <label className="grid gap-1 text-sm font-bold text-gray-700">
                    {labels.productNameEn}
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(event) => handleChange("nameEn", event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-blue-50/30"
                    />
                  </label>
                )}
              </div>
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
              <div className="lg:col-span-2">
                {language === 'vi' ? (
                  <label className="grid gap-1 text-sm font-bold text-gray-700">
                    {labels.subtitleField}
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(event) => handleChange("subtitle", event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                ) : (
                  <label className="grid gap-1 text-sm font-bold text-gray-700">
                    {labels.subtitleFieldEn}
                    <input
                      type="text"
                      value={formData.subtitleEn}
                      onChange={(event) => handleChange("subtitleEn", event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-blue-50/30"
                    />
                  </label>
                )}
              </div>
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
              <div className="grid gap-1 text-sm font-bold text-gray-700 lg:col-span-2">
                <label>{labels.image}</label>
                <div className="flex gap-4 items-end">
                  {formData.image ? (
                    <div className="h-[90px] w-[90px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      <img src={formData.image} alt="Preview" className="h-full w-full object-contain p-1" />
                    </div>
                  ) : (
                    <div className="flex h-[90px] w-[90px] shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Hoặc nhập URL ảnh..."
                      value={formData.image}
                      onChange={(event) => handleChange("image", event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        onChange={handleImageUpload}
                        disabled={isSaving}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        disabled={isSaving}
                        className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <span className="flex items-center gap-2">
                            <svg className="h-4 w-4 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Đang tải lên...
                          </span>
                        ) : (
                          labels.productImageUpload
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
              <div className="grid gap-2 text-sm font-bold text-gray-700">
                <label>{labels.status}</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData(cur => ({ ...cur, active: checked, hidden: !checked }));
                        setIsDirty(true);
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {labels.activeStatus}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={formData.hidden}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData(cur => ({ ...cur, hidden: checked, active: !checked }));
                        setIsDirty(true);
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {labels.draftStatus}
                  </label>
                </div>
              </div>
              <div className="lg:col-span-4">
                {language === 'vi' ? (
                  <label className="grid gap-1 text-sm font-bold text-gray-700">
                    {labels.description}
                    <textarea
                      value={formData.description}
                      onChange={(event) => handleChange("description", event.target.value)}
                      rows={3}
                      className="rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                ) : (
                  <label className="grid gap-1 text-sm font-bold text-gray-700">
                    {labels.descriptionEnField}
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(event) => handleChange("descriptionEn", event.target.value)}
                      rows={3}
                      className="rounded-lg border border-gray-200 px-3 py-2 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-blue-50/30"
                    />
                  </label>
                )}
              </div>

              <div className="lg:col-span-4 border-t border-gray-100 pt-4 mt-2">
                <label className="text-sm font-bold text-gray-700 mb-3 block">Tính năng (Features)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {AVAILABLE_FEATURES.map((feature) => (
                    <label key={feature.id} className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={formData.features.includes(feature.id)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setFormData(cur => ({
                            ...cur,
                            features: isChecked 
                              ? [...cur.features, feature.id] 
                              : cur.features.filter(f => f !== feature.id)
                          }));
                          setIsDirty(true);
                        }}
                      />
                      {feature.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 border-t border-gray-100 pt-4 mt-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-gray-700">{labels.colors}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(cur => ({ ...cur, colors: [...cur.colors, { name: "", nameEn: "", hex: "#000000", image: "", imagePublicId: "" }] }));
                      setIsDirty(true);
                    }}
                    className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100"
                  >
                    + {labels.addColor}
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.colors.map((color, index) => (
                    <div key={index} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 md:flex-row md:items-center">
                      <div className="flex flex-1 items-center gap-3">
                        <label className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200 hover:ring-blue-400" title="Chọn màu">
                          <input
                            type="color"
                            value={color.hex}
                            onChange={(e) => {
                              const newColors = [...formData.colors];
                              newColors[index].hex = e.target.value;
                              setFormData(cur => ({ ...cur, colors: newColors }));
                              setIsDirty(true);
                            }}
                            className="absolute -left-4 -top-4 h-20 w-20 cursor-pointer"
                          />
                        </label>
                        <div className="flex-1">
                          {language === 'vi' ? (
                            <input
                              type="text"
                              placeholder={labels.colorName}
                              required
                              value={color.name}
                              onChange={(e) => {
                                const newColors = [...formData.colors];
                                newColors[index].name = e.target.value;
                                setFormData(cur => ({ ...cur, colors: newColors }));
                                setIsDirty(true);
                              }}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          ) : (
                            <input
                              type="text"
                              placeholder={labels.colorNameEn}
                              value={color.nameEn}
                              onChange={(e) => {
                                const newColors = [...formData.colors];
                                newColors[index].nameEn = e.target.value;
                                setFormData(cur => ({ ...cur, colors: newColors }));
                                setIsDirty(true);
                              }}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-blue-50/30"
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex flex-[1.5] items-center gap-3">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            placeholder={labels.colorImage}
                            required
                            value={color.image}
                            onChange={(e) => {
                              const newColors = [...formData.colors];
                              newColors[index].image = e.target.value;
                              setFormData(cur => ({ ...cur, colors: newColors }));
                              setIsDirty(true);
                            }}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                          <div className="relative h-9">
                            <input
                              type="file"
                              accept="image/jpeg, image/png, image/webp"
                              onChange={(e) => handleColorImageUpload(index, e)}
                              disabled={isSaving}
                              className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                            />
                            <button
                              type="button"
                              disabled={isSaving}
                              className="flex h-full w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                              Upload ảnh màu sắc
                            </button>
                          </div>
                        </div>
                        {color.image && (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white p-1">
                            <img src={color.image} alt="" className="h-full w-full object-contain" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const newColors = formData.colors.filter((_, i) => i !== index);
                            setFormData(cur => ({ ...cur, colors: newColors }));
                            setIsDirty(true);
                            // Cleanup corresponding preview file if any
                            if (colorImageFiles[index]) {
                               const newFiles = { ...colorImageFiles };
                               delete newFiles[index];
                               setColorImageFiles(newFiles);
                            }
                          }}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                          title="Xóa màu này"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 lg:col-span-4 mt-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? labels.loading : editingId ? labels.save : labels.create}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-black text-gray-700 transition hover:bg-gray-50"
                  >
                    {labels.cancel}
                  </button>
                </div>
                {translateStatus === "error" && (
                  <button
                    type="button"
                    onClick={handleTranslateAgain}
                    className="rounded-lg border border-red-200 bg-red-50 text-red-600 px-5 py-2.5 text-sm font-black transition hover:bg-red-100"
                  >
                    {labels.translateAgain}
                  </button>
                )}
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
                            product.hidden ? "bg-amber-50 text-amber-700 ring-amber-200" :
                            "bg-blue-50 text-blue-700 ring-blue-200"
                          }`}>
                            {product.status === "deleted" ? labels.deletedStatus : product.hidden ? labels.draftStatus : labels.activeStatus}
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
                          {product.status === "deleted" ? (
                            <button
                              type="button"
                              onClick={() => handleRestore(product)}
                              className="flex-1 md:flex-none justify-center rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2.5 md:px-3 md:py-2 text-sm md:text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
                            >
                              {labels.restore}
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(product)}
                                className="flex-1 md:flex-none justify-center rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 md:px-3 md:py-2 text-sm md:text-xs font-black text-blue-700 transition hover:bg-blue-100"
                              >
                                {labels.edit}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(product)}
                                className="flex-1 md:flex-none justify-center rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 md:px-3 md:py-2 text-sm md:text-xs font-black text-red-700 transition hover:bg-red-100"
                              >
                                {labels.delete}
                              </button>
                            </>
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
  );
}
