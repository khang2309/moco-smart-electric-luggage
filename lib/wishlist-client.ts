"use client";

export type WishlistProduct = {
  slug: string;
  name: string;
  nameEn?: string;
  image?: string;
  price?: number;
  oldPrice?: number;
  stock?: number;
  status?: string;
  store?: string;
  subtitle?: string;
  colors?: { name: string; hex: string; image?: string }[];
  updatedAt?: string;
};

export type WishlistItem = {
  id: string;
  productSlug: string;
  createdAt: string;
  updatedAt: string;
  product: WishlistProduct | null;
};

function owner(email: string) {
  return email.trim().toLowerCase();
}

function notify() {
  window.dispatchEvent(new Event("moco-wishlist-updated"));
}

export async function fetchWishlist(email: string): Promise<WishlistItem[]> {
  const response = await fetch(`/api/wishlist?email=${encodeURIComponent(owner(email))}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || "Unable to load wishlist.");
  return data.items || [];
}

export async function fetchWishlistSlugs(email: string) {
  return (await fetchWishlist(email)).map((item) => item.productSlug);
}

export async function addWishlistItem(email: string, productSlug: string) {
  const response = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: owner(email), productSlug }) });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || "Unable to add product to wishlist.");
  notify();
  return data.item as WishlistItem;
}

export async function removeWishlistItem(email: string, itemId: string) {
  const response = await fetch(`/api/wishlist/${encodeURIComponent(itemId)}?email=${encodeURIComponent(owner(email))}`, { method: "DELETE" });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || "Unable to remove product from wishlist.");
  notify();
}

export async function toggleWishlistItem(email: string, productSlug: string, existingItem?: WishlistItem) {
  if (existingItem) {
    await removeWishlistItem(email, existingItem.id);
    return false;
  }
  await addWishlistItem(email, productSlug);
  return true;
}
