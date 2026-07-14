import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist | MOCO Smart Electric Luggage",
  description: "Save your favorite MOCO smart electric luggage products for later.",
  openGraph: { title: "MOCO Wishlist", description: "Your favorite MOCO products in one place." },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
