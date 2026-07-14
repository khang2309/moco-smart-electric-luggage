"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../providers";
import { readCurrentUser } from "../auth-storage";
import { fetchWishlist, toggleWishlistItem, type WishlistItem } from "@/lib/wishlist-client";
import { showToast } from "../toast";

const products = [
  {
    slug: "moco-go",
    name: "MOCO Go",
    image: "/assets/Product/mocoGO.png",
    vi: "Phiên bản tiêu chuẩn với hệ thống lái điện tích hợp, hỗ trợ người dùng di chuyển thuận tiện tại sân bay, nhà ga, khu du lịch và các không gian rộng lớn.",
    en: "The standard edition with integrated electric driving for airports, stations, travel areas, and large spaces.",
  },
  {
    slug: "moco-plus",
    name: "MOCO Plus",
    image: "/assets/Product/mocoPLUS.png",
    vi: "Phiên bản vali điện có thể lái được, tích hợp hệ thống định vị GPS và chế độ tự động đi theo người dùng qua Bluetooth và ứng dụng điện thoại.",
    en: "A rideable electric luggage version with GPS positioning and automatic follow mode through Bluetooth and the mobile app.",
  },
  {
    slug: "moco-pro",
    name: "MOCO Pro",
    image: "/assets/Product/mocoPRO.png",
    vi: "Phiên bản vali điện có thể lái được, tích hợp GPS, chế độ tự động đi theo người dùng qua Bluetooth và ứng dụng điện thoại, đồng thời trang bị cảm biến tránh vật cản thông minh.",
    en: "A rideable electric luggage version with GPS, app connection, automatic follow mode, and intelligent obstacle avoidance sensors.",
  },
  {
    slug: "moco-max",
    name: "MOCO Max",
    image: "/assets/Product/mocoMAX.png",
    vi: "Phiên bản cao cấp nhất, tích hợp GPS, chế độ tự động đi theo người dùng qua Bluetooth và ứng dụng điện thoại, cùng hệ thống cảm biến tránh vật cản thông minh toàn diện.",
    en: "The most advanced edition with GPS, Bluetooth app follow mode, and a complete intelligent obstacle avoidance system.",
  },
  {
    slug: "moco-future",
    name: "MOCO Future",
    image: "/assets/Product/mocoFuture.png",
    vi: "MOCO Future là mẫu vali điện thông minh mang phong cách hiện đại, kết hợp giữa thiết kế trong suốt cao cấp và khả năng di chuyển linh hoạt.",
    en: "MOCO Future is a modern smart electric luggage combining premium transparent design with flexible mobility.",
  },
] as const;

function getLoopOffset(index: number, activeIndex: number) {
  const rawOffset = index - activeIndex;
  const half = products.length / 2;

  if (rawOffset > half) return rawOffset - products.length;
  if (rawOffset < -half) return rawOffset + products.length;

  return rawOffset;
}

export interface MocoProduct {
  slug: string;
  name: string;
  nameEn?: string;
  image: string;
  vi: string;
  en: string;
}

export default function ProductPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [favoriteProducts, setFavoriteProducts] = useState<WishlistItem[]>([]);
  const [visibleProducts, setVisibleProducts] = useState<MocoProduct[] | null>(null);
  const { language } = useLanguage();
  const router = useRouter();
  const activeProduct = visibleProducts ? visibleProducts[activeIndex] : null;

  const copy = useMemo(
    () => ({
      vi: {
        ariaPrevious: "Sản phẩm trước",
        ariaNext: "Sản phẩm tiếp theo",
        hint: "Nhấp vào tên sản phẩm để xem thông tin và mua hàng",
        overviewTitle: "MOCO Smart Electric Luggage",
        overviewParagraphs: [
          "MOCO là vali điện thông minh thế hệ mới, được phát triển nhằm kết hợp hành lý, khả năng di chuyển cá nhân và công nghệ thông minh trong một sản phẩm duy nhất.",
          "Được thiết kế dành cho những người thường xuyên di chuyển, MOCO giúp giảm bớt sự bất tiện của việc kéo hành lý truyền thống bằng cách tích hợp hệ thống lái điện, kết nối ứng dụng thông minh và các tính năng hỗ trợ hiện đại. Không chỉ là một chiếc vali, MOCO hướng đến việc trở thành người bạn đồng hành thông minh trong mọi hành trình.",
        ],
      },
      en: {
        ariaPrevious: "Previous product",
        ariaNext: "Next product",
        hint: "Click the product name to view details and purchase",
        overviewTitle: "MOCO Smart Electric Luggage",
        overviewParagraphs: [
          "MOCO is a new-generation smart electric luggage product developed to combine luggage, personal mobility, and intelligent technology in one product.",
          "Designed for frequent travelers, MOCO reduces the inconvenience of traditional luggage by integrating electric driving, smart app connectivity, and modern support features. More than a suitcase, MOCO is built to become a smart companion for every journey.",
        ],
      },
    }),
    [],
  );

  const t = copy[language];

  const moveProduct = (direction: "next" | "previous") => {
    if (!visibleProducts || visibleProducts.length === 0) return;
    setActiveIndex((current) => {
      if (direction === "next") {
        return (current + 1) % visibleProducts.length;
      }

      return (current - 1 + visibleProducts.length) % visibleProducts.length;
    });
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        
        if (data.products) {
          const activeDbProducts = data.products.filter((p: any) => p.status !== "deleted" && !p.hidden && p.status !== "draft");
          const mappedProducts = activeDbProducts.map((dbProd: any) => {
            const existing = products.find(p => p.slug === dbProd.slug);
            return {
              slug: dbProd.slug,
              name: dbProd.name,
              nameEn: dbProd.nameEn,
              image: dbProd.image || (existing ? existing.image : ""),
              vi: dbProd.subtitle || dbProd.description || (existing ? existing.vi : ""),
              en: dbProd.subtitleEn || dbProd.descriptionEn || dbProd.subtitle || (existing ? existing.en : "")
            };
          });
          setVisibleProducts(mappedProducts);
        } else {
          setVisibleProducts([...products]); // fallback
        }
      } catch {
        setVisibleProducts([...products]); // fallback
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    const loadWishlist = () => {
      const user = readCurrentUser();
      if (!user?.email) { setFavoriteProducts([]); return; }
      void fetchWishlist(user.email).then(setFavoriteProducts).catch(() => setFavoriteProducts([]));
    };
    loadWishlist();
    window.addEventListener("moco-wishlist-updated", loadWishlist);
    window.addEventListener("moco-auth-updated", loadWishlist);
    return () => { window.removeEventListener("moco-wishlist-updated", loadWishlist); window.removeEventListener("moco-auth-updated", loadWishlist); };
  }, []);

  const toggleFavoriteProduct = async (slug: string) => {
    const user = readCurrentUser();
    if (!user?.email) { router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`); return; }
    const existingItem = favoriteProducts.find((item) => item.productSlug === slug);
    try {
      const isAdded = await toggleWishlistItem(user.email, slug, existingItem);
      setFavoriteProducts(await fetchWishlist(user.email));
      showToast(isAdded ? (language === "vi" ? "Đã thêm vào yêu thích." : "Added to wishlist.") : (language === "vi" ? "Đã xóa khỏi yêu thích." : "Removed from wishlist."), "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to update wishlist.", "error");
    }
  };

  return (
    <main className="product-showcase-page">
      <section className="product-carousel-stage" aria-label="MOCO product carousel">
        <div className="product-stage-vignette" aria-hidden="true" />

        <button
          className="product-arrow product-arrow-left"
          type="button"
          aria-label={t.ariaPrevious}
          onClick={() => moveProduct("previous")}
        >
          <span />
        </button>
        <button
          className="product-arrow product-arrow-right"
          type="button"
          aria-label={t.ariaNext}
          onClick={() => moveProduct("next")}
        >
          <span />
        </button>

        <div className="product-wheel" aria-live="polite">
          {visibleProducts?.map((product, index) => {
            const rawOffset = index - activeIndex;
            const half = visibleProducts.length / 2;
            let offset = rawOffset;
            if (rawOffset > half) offset = rawOffset - visibleProducts.length;
            if (rawOffset < -half) offset = rawOffset + visibleProducts.length;
            
            if (offset > 2) offset = 2;
            if (offset < -2) offset = -2;

            const isActive = offset === 0;

            return (
              <div className="product-card-shell" data-position={offset} key={product.slug}>
                <button
                  className="product-3d-card"
                  type="button"
                  aria-label={language === "en" ? (product.nameEn || product.name) : product.name}
                  aria-current={isActive}
                  onClick={() => {
                    window.location.href = `/product/${product.slug}`;
                  }}
                >
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    sizes="(max-width: 560px) 76vw, 38vw"
                    priority={isActive}
                  />
                </button>
                <button
                  className={`product-favorite-button${favoriteProducts.some((item) => item.productSlug === product.slug) ? " active" : ""}`}
                  type="button"
                  aria-label={language === "vi" ? "Th\u00eam v\u00e0o y\u00eau th\u00edch" : "Add to favorites"}
                  onClick={() => void toggleFavoriteProduct(product.slug)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={favoriteProducts.some((item) => item.productSlug === product.slug) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        <div className="product-carousel-copy">
          {activeProduct && (
            <>
              <Link href={`/product/${activeProduct.slug}`} className="product-stage-title">
                {language === "en" ? (activeProduct.nameEn || activeProduct.name) : activeProduct.name}
              </Link>
              <p>{activeProduct[language as keyof MocoProduct]}</p>
              <span>{t.hint}</span>
            </>
          )}
        </div>
      </section>

      <section className="product-info-overview">
        <div className="product-info-copy">
          <h1>{t.overviewTitle}</h1>
          {t.overviewParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="product-info-grid">
          {visibleProducts?.map((product) => (
            <Link href={`/product/${product.slug}`} key={product.slug}>
              <h2>{product.name}</h2>
              <p>{product[language as keyof MocoProduct]}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
