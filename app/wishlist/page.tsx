"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { readCurrentUser } from "../auth-storage";
import { useLanguage } from '../LanguageProvider';
import { showToast } from "../toast";
import { addWishlistItem, fetchWishlist, removeWishlistItem, type WishlistItem, type WishlistProduct } from "@/lib/wishlist-client";

type Filter = "all" | "in" | "out" | "sale";
type Sort = "newest" | "price-low" | "price-high" | "popular" | "added";
type CatalogProduct = WishlistProduct & { createdAt?: string; reviewCount?: number; rating?: number; battery?: string; speed?: string; range?: string; warranty?: string; weight?: string; hidden?: boolean };

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

function productStatus(product: WishlistProduct | null) {
  if (!product || product.status === "deleted" || product.status === "discontinued") return "out";
  return Number(product.stock) > 0 ? "in" : "out";
}

function toCartProduct(product: WishlistProduct) {
  return { slug: product.slug, name: product.name, image: product.image || "", quantity: 1, price: Number(product.price) || 0, oldPrice: Number(product.oldPrice) || 0, store: product.store || "MOCO Store", subtitle: product.subtitle || "" };
}

function persistCart(product: WishlistProduct) {
  const item = toCartProduct(product);
  const cart = JSON.parse(window.localStorage.getItem("moco-cart") || "[]") as ReturnType<typeof toCartProduct>[];
  const next = cart.some((entry) => entry.slug === item.slug) ? cart.map((entry) => entry.slug === item.slug ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...cart, item];
  window.localStorage.setItem("moco-cart", JSON.stringify(next));
  window.dispatchEvent(new Event("moco-cart-updated"));
}

export default function WishlistPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [selected, setSelected] = useState<string[]>([]);
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removed, setRemoved] = useState<WishlistItem | null>(null);
  const undoTimer = useRef<number | null>(null);
  const t = language === "vi" ? vi : en;

  const load = async () => {
    const user = readCurrentUser();
    if (!user?.email) { router.replace(`/login?returnTo=${encodeURIComponent("/wishlist")}`); return; }
    try {
      setLoading(true);
      const [wishlist, productResponse] = await Promise.all([fetchWishlist(user.email), fetch("/api/admin/products", { cache: "no-store" })]);
      setItems(wishlist);
      const productData = await productResponse.json();
      setCatalog(Array.isArray(productData.products) ? productData.products.filter((product: CatalogProduct) => product.status !== "deleted" && !product.hidden) : []);
      setError("");
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : t.loadError); } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);
  useEffect(() => { const sync = () => void load(); window.addEventListener("moco-wishlist-updated", sync); return () => window.removeEventListener("moco-wishlist-updated", sync); }, []);
  useEffect(() => () => { if (undoTimer.current) window.clearTimeout(undoTimer.current); }, []);

  const filtered = useMemo(() => items.filter((item) => item.product).filter((item) => {
    const product = item.product!;
    const matchesQuery = [product.name, product.slug, product.store, product.subtitle].join(" ").toLowerCase().includes(query.trim().toLowerCase());
    const onSale = Number(product.oldPrice) > Number(product.price);
    return matchesQuery && (filter === "all" || (filter === "sale" ? onSale : productStatus(product) === filter));
  }).sort((a, b) => {
    const productA = a.product!; const productB = b.product!;
    if (sort === "price-low") return Number(productA.price) - Number(productB.price);
    if (sort === "price-high") return Number(productB.price) - Number(productA.price);
    if (sort === "popular") return Number((productB as CatalogProduct).reviewCount || 0) - Number((productA as CatalogProduct).reviewCount || 0);
    if (sort === "added") return +new Date(a.createdAt) - +new Date(b.createdAt);
    return +new Date(b.createdAt) - +new Date(a.createdAt);
  }), [filter, items, query, sort]);

  const recentlyViewed = useMemo(() => {
    try {
      const slugs = JSON.parse(window.localStorage.getItem("moco-recently-viewed") || "[]") as string[];
      return slugs.map((slug) => catalog.find((product) => product.slug === slug)).filter((product): product is CatalogProduct => Boolean(product)).slice(0, 10);
    } catch { return []; }
  }, [catalog]);
  const recommended = useMemo(() => catalog.filter((product) => !items.some((item) => item.productSlug === product.slug)).sort((a, b) => Number(b.stock) - Number(a.stock)).slice(0, 5), [catalog, items]);

  const remove = async (item: WishlistItem, confirm = true) => {
    if (confirm && !window.confirm(`${t.remove} ${item.product?.name || ""}?`)) return false;
    const user = readCurrentUser();
    if (!user?.email) return false;
    await removeWishlistItem(user.email, item.id);
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    setSelected((current) => current.filter((id) => id !== item.id));
    if (confirm) { setRemoved(item); if (undoTimer.current) window.clearTimeout(undoTimer.current); undoTimer.current = window.setTimeout(() => setRemoved(null), 7000); }
    return true;
  };

  const addCart = (product: WishlistProduct) => {
    if (productStatus(product) === "out") { showToast(t.unavailable, "error"); return; }
    persistCart(product); showToast(t.added, "success");
  };
  const buyNow = (product: WishlistProduct) => {
    if (productStatus(product) === "out") { showToast(t.unavailable, "error"); return; }
    window.localStorage.setItem("moco-checkout-items", JSON.stringify([toCartProduct(product)])); router.push("/checkout");
  };
  const moveSelected = async () => {
    const targets = items.filter((item) => selected.includes(item.id) && item.product && productStatus(item.product) === "in");
    if (!targets.length) return;
    targets.forEach((item) => persistCart(item.product!));
    await Promise.all(targets.map((item) => remove(item, false)));
    showToast(t.moved, "success");
  };
  const removeSelected = async () => {
    const targets = items.filter((item) => selected.includes(item.id));
    if (!targets.length || !window.confirm(t.removeSelectedConfirm)) return;
    await Promise.all(targets.map((item) => remove(item, false)));
    showToast(t.removedSelected, "success");
  };
  const undo = async () => {
    const user = readCurrentUser();
    if (!removed || !user?.email) return;
    await addWishlistItem(user.email, removed.productSlug); setRemoved(null); await load(); showToast(t.restored, "success");
  };
  const theme = dark ? "bg-slate-950 text-white" : "bg-[#f7f8fb] text-slate-950";
  const surface = dark ? "border-white/10 bg-white/[0.06]" : "border-slate-200 bg-white";

  return <main className={`min-h-screen transition-colors duration-300 ${theme}`}>
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className={`overflow-hidden rounded-[24px] border p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8 ${surface}`}>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">❤ Wishlist</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{t.title}</h1><p className={`mt-3 max-w-xl text-sm leading-6 sm:text-base ${dark ? "text-slate-300" : "text-slate-500"}`}>{t.subtitle}</p><p className="mt-5 text-sm font-semibold text-blue-600">{items.length} {t.products}</p></div><div className="flex flex-wrap gap-3"><button type="button" onClick={() => setDark((value) => !value)} aria-label={t.toggleTheme} className={`min-h-11 rounded-xl border px-4 text-sm font-bold transition hover:-translate-y-0.5 ${surface}`}>{dark ? "☀" : "◐"}</button><Link href="/product" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-700 dark:bg-white dark:text-slate-950">{t.continueShopping}</Link></div></div>
      </header>

      <section className={`mt-6 rounded-[20px] border p-4 shadow-sm ${surface}`} aria-label={t.filters}><div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_auto_auto]"><label className="relative"><span className="sr-only">{t.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2" /></label><div className="flex min-h-12 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">{(["all", "in", "out", "sale"] as Filter[]).map((option) => <button key={option} type="button" onClick={() => setFilter(option)} className={`whitespace-nowrap rounded-lg px-3 text-sm font-bold transition ${filter === option ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{t[option]}</button>)}</div><select value={sort} onChange={(event) => setSort(event.target.value as Sort)} aria-label={t.sort} className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none ring-blue-500 focus:ring-2"><option value="newest">{t.newest}</option><option value="price-low">{t.priceLow}</option><option value="price-high">{t.priceHigh}</option><option value="popular">{t.popular}</option><option value="added">{t.recentlyAdded}</option></select></div></section>

      {selected.length > 0 && <div className="sticky top-3 z-20 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white shadow-xl"><span className="font-bold">{selected.length} {t.selected}</span><div className="flex gap-2"><button type="button" onClick={() => void moveSelected()} className="min-h-10 rounded-lg bg-white px-3 font-bold text-slate-950">{t.moveToCart}</button><button type="button" onClick={() => void removeSelected()} className="min-h-10 rounded-lg bg-rose-500 px-3 font-bold text-white">{t.removeSelected}</button></div></div>}
      {removed && <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white"><span>{t.removed}</span><button type="button" onClick={() => void undo()} className="min-h-10 rounded-lg bg-white px-3 font-bold text-slate-950">{t.undo}</button></div>}

      {loading ? <Skeleton /> : error ? <StateBox title={t.loadError} action={t.retry} onAction={() => void load()} dark={dark} /> : filtered.length === 0 ? <EmptyState t={t} dark={dark} /> : <><div className="mt-6 flex items-center justify-between"><p className={`text-sm ${dark ? "text-slate-300" : "text-slate-500"}`}>{filtered.length} {t.products}</p><button type="button" onClick={() => setSelected(selected.length === filtered.length ? [] : filtered.map((item) => item.id))} className="min-h-11 rounded-xl px-3 text-sm font-bold text-blue-600 hover:bg-blue-50">{selected.length === filtered.length ? t.clearSelection : t.selectAll}</button></div><section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5" aria-label={t.title}>{filtered.map((item) => <WishlistCard key={item.id} item={item} selected={selected.includes(item.id)} onToggle={() => setSelected((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} onRemove={() => void remove(item)} onCart={addCart} onBuy={buyNow} language={language} t={t} dark={dark} />)}</section></>}

      <ProductRail title={t.recentlyViewed} products={recentlyViewed} onCart={addCart} language={language} t={t} dark={dark} />
      <ProductRail title={t.recommended} products={recommended} onCart={addCart} language={language} t={t} dark={dark} />
    </div>
  </main>;
}

function WishlistCard({ item, selected, onToggle, onRemove, onCart, onBuy, language, t, dark }: { item: WishlistItem; selected: boolean; onToggle: () => void; onRemove: () => void; onCart: (product: WishlistProduct) => void; onBuy: (product: WishlistProduct) => void; language: "vi" | "en"; t: typeof vi; dark: boolean }) {
  const product = item.product! as CatalogProduct; const out = productStatus(product) === "out"; const discount = Number(product.oldPrice) > Number(product.price) ? Math.round((1 - Number(product.price) / Number(product.oldPrice)) * 100) : 0;
  const specs = [product.weight, product.speed, product.range, product.warranty].filter(Boolean).slice(0, 2);
  return <article className={`group relative overflow-hidden rounded-[20px] border shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${dark ? "border-white/10 bg-white/[0.06]" : "border-slate-200 bg-white"}`}><div className="relative aspect-square overflow-hidden bg-slate-100"><Image src={product.image || "/assets/logo.jpg"} alt={product.name} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 20vw" className="object-contain p-5 transition duration-500 group-hover:scale-105" /><div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2"><label className="grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow"><input type="checkbox" checked={selected} onChange={onToggle} aria-label={`${t.select} ${product.name}`} className="h-4 w-4 accent-slate-950" /></label><button type="button" onClick={onRemove} aria-label={`${t.remove} ${product.name}`} className="grid h-10 w-10 place-items-center rounded-full bg-white/95 text-rose-600 shadow transition hover:scale-110"><Heart /></button></div><div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">{discount > 0 && <Badge text={`${t.sale} -${discount}%`} tone="rose" />}{out ? <Badge text={t.out} tone="slate" /> : Number(product.stock) <= 5 ? <Badge text={t.lowStock} tone="amber" /> : <Badge text={t.available} tone="emerald" />}</div></div><div className="p-4"><p className="truncate text-xs font-bold uppercase tracking-[0.12em] text-blue-600">{product.store || "MOCO"}</p><h2 className="mt-1 truncate text-base font-black"><Link href={`/product/${product.slug}`} className="focus:outline-none focus:ring-2 focus:ring-blue-500">{language === "en" ? product.nameEn || product.name : product.name}</Link></h2><p className={`mt-1 line-clamp-2 min-h-10 text-xs leading-5 ${dark ? "text-slate-300" : "text-slate-500"}`}>{product.subtitle || t.smartMobility}</p><div className="mt-3 flex items-end gap-2"><strong className="text-lg">{money.format(Number(product.price) || 0)}</strong>{discount > 0 && <del className="text-xs text-slate-400">{money.format(Number(product.oldPrice))}</del>}</div><p className={`mt-2 text-xs ${dark ? "text-slate-300" : "text-slate-500"}`}>★ {Number(product.rating || 0).toFixed(1)} · {Number(product.reviewCount || 0)} {t.reviews}</p>{specs.length > 0 && <p className={`mt-2 truncate text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{specs.join(" · ")}</p>}<div className="mt-4 grid grid-cols-2 gap-2"><button type="button" disabled={out} onClick={() => onCart(product)} className="min-h-11 rounded-xl border border-slate-300 px-2 text-xs font-bold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45">{t.addToCart}</button><button type="button" disabled={out} onClick={() => onBuy(product)} className="min-h-11 rounded-xl bg-slate-950 px-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-45">{t.buyNow}</button></div></div></article>;
}

function ProductRail({ title, products, onCart, language, t, dark }: { title: string; products: CatalogProduct[]; onCart: (product: WishlistProduct) => void; language: "vi" | "en"; t: typeof vi; dark: boolean }) { if (!products.length) return null; return <section className="mt-12"><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-black tracking-tight">{title}</h2><Link href="/product" className="text-sm font-bold text-blue-600">{t.viewAll}</Link></div><div className="flex snap-x gap-4 overflow-x-auto pb-3">{products.map((product) => <article key={product.slug} className={`w-64 shrink-0 snap-start overflow-hidden rounded-2xl border p-3 ${dark ? "border-white/10 bg-white/[0.06]" : "border-slate-200 bg-white"}`}><Link href={`/product/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-slate-100"><Image src={product.image || "/assets/logo.jpg"} alt={product.name} fill sizes="256px" className="object-contain p-4" /></Link><h3 className="mt-3 truncate font-black">{language === "en" ? product.nameEn || product.name : product.name}</h3><p className="mt-1 text-sm font-bold">{money.format(Number(product.price) || 0)}</p><button type="button" disabled={productStatus(product) === "out"} onClick={() => onCart(product)} className="mt-3 min-h-10 w-full rounded-lg bg-slate-950 px-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-45">{t.addToCart}</button></article>)}</div></section>; }
function Badge({ text, tone }: { text: string; tone: "rose" | "slate" | "amber" | "emerald" }) { const colors = { rose: "bg-rose-600 text-white", slate: "bg-slate-900 text-white", amber: "bg-amber-400 text-slate-950", emerald: "bg-emerald-600 text-white" }; return <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${colors[tone]}`}>{text}</span>; }
function Heart() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" /></svg>; }
function Skeleton() { return <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">{Array.from({ length: 10 }, (_, index) => <div key={index} className="h-[420px] animate-pulse rounded-[20px] bg-slate-200" />)}</section>; }
function EmptyState({ t, dark }: { t: typeof vi; dark: boolean }) { return <section className={`mt-6 grid min-h-[420px] place-items-center rounded-[24px] border border-dashed p-8 text-center ${dark ? "border-white/20 bg-white/[0.04]" : "border-slate-300 bg-white"}`}><div><div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-rose-50 text-5xl text-rose-500">♡</div><h2 className="mt-6 text-2xl font-black">{t.emptyTitle}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">{t.emptyDescription}</p><Link href="/product" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white">{t.explore}</Link></div></section>; }
function StateBox({ title, action, onAction, dark }: { title: string; action: string; onAction: () => void; dark: boolean }) { return <section className={`mt-6 grid min-h-72 place-items-center rounded-[24px] border p-8 text-center ${dark ? "border-white/10 bg-white/[0.06]" : "border-slate-200 bg-white"}`}><div><h2 className="text-xl font-black">{title}</h2><button type="button" onClick={onAction} className="mt-5 min-h-11 rounded-xl bg-slate-950 px-5 font-bold text-white">{action}</button></div></section>; }

const vi = { title: "Sản phẩm yêu thích", subtitle: "Lưu những sản phẩm bạn yêu thích để mua bất cứ lúc nào.", products: "sản phẩm", continueShopping: "Tiếp tục mua sắm", toggleTheme: "Đổi giao diện", filters: "Bộ lọc yêu thích", search: "Tìm kiếm sản phẩm", all: "Tất cả", in: "Còn hàng", out: "Hết hàng", sale: "Đang giảm giá", newest: "Mới nhất", priceLow: "Giá thấp đến cao", priceHigh: "Giá cao đến thấp", popular: "Phổ biến nhất", recentlyAdded: "Mới thêm", sort: "Sắp xếp", selected: "đã chọn", select: "Chọn", selectAll: "Chọn tất cả", clearSelection: "Bỏ chọn", moveToCart: "Chuyển vào giỏ", removeSelected: "Xóa đã chọn", removeSelectedConfirm: "Xóa các sản phẩm đã chọn khỏi danh sách yêu thích?", removedSelected: "Đã xóa các sản phẩm đã chọn.", removed: "Đã xóa khỏi danh sách yêu thích.", undo: "Hoàn tác", restored: "Đã khôi phục sản phẩm yêu thích.", addToCart: "Thêm vào giỏ", buyNow: "Mua ngay", remove: "Xóa", available: "Còn hàng", lowStock: "Sắp hết", reviews: "đánh giá", smartMobility: "Vali điện thông minh", unavailable: "Sản phẩm hiện đã hết hàng.", added: "Đã thêm vào giỏ hàng.", moved: "Đã chuyển sản phẩm vào giỏ.", recentlyViewed: "Đã xem gần đây", recommended: "Gợi ý cho bạn", viewAll: "Xem tất cả", emptyTitle: "Bạn chưa có sản phẩm yêu thích", emptyDescription: "Hãy khám phá cửa hàng và lưu những sản phẩm bạn thích để quay lại sau.", explore: "Khám phá sản phẩm", loadError: "Không thể tải danh sách yêu thích.", retry: "Thử lại" };
const en = { title: "Wishlist", subtitle: "Save the products you love and purchase them whenever you are ready.", products: "products", continueShopping: "Continue shopping", toggleTheme: "Toggle color mode", filters: "Wishlist filters", search: "Search products", all: "All", in: "Available", out: "Out of stock", sale: "On sale", newest: "Newest", priceLow: "Price: low to high", priceHigh: "Price: high to low", popular: "Most popular", recentlyAdded: "Recently added", sort: "Sort", selected: "selected", select: "Select", selectAll: "Select all", clearSelection: "Clear selection", moveToCart: "Move to cart", removeSelected: "Remove selected", removeSelectedConfirm: "Remove selected products from your wishlist?", removedSelected: "Selected products removed.", removed: "Removed from wishlist.", undo: "Undo", restored: "Wishlist item restored.", addToCart: "Add to cart", buyNow: "Buy now", remove: "Remove", available: "Available", lowStock: "Low stock", reviews: "reviews", smartMobility: "Smart electric luggage", unavailable: "This product is currently out of stock.", added: "Added to cart.", moved: "Products moved to cart.", recentlyViewed: "Recently viewed", recommended: "Recommended for you", viewAll: "View all", emptyTitle: "Your wishlist is empty", emptyDescription: "Explore the store and save the products you would like to return to later.", explore: "Explore products", loadError: "Unable to load your wishlist.", retry: "Try again" };
