"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../providers";

const products = [
  {
    slug: "moco-go",
    name: "MOCO Go",
    vi: "Phiên bản tiêu chuẩn với hệ thống lái điện tích hợp, hỗ trợ người dùng di chuyển thuận tiện tại sân bay, nhà ga, khu du lịch và các không gian rộng lớn.",
    en: "The standard edition with integrated electric driving for airports, stations, travel areas, and large spaces.",
  },
  {
    slug: "moco-plus",
    name: "MOCO Plus",
    vi: "Phiên bản vali điện có thể lái được, tích hợp hệ thống định vị GPS và chế độ tự động đi theo người dùng qua Bluetooth và ứng dụng điện thoại.",
    en: "A rideable electric luggage version with GPS positioning and automatic follow mode through Bluetooth and the mobile app.",
  },
  {
    slug: "moco-pro",
    name: "MOCO Pro",
    vi: "Phiên bản vali điện có thể lái được, tích hợp GPS, chế độ tự động đi theo người dùng qua Bluetooth và ứng dụng điện thoại, đồng thời trang bị cảm biến tránh vật cản thông minh.",
    en: "A rideable electric luggage version with GPS, app connection, automatic follow mode, and intelligent obstacle avoidance sensors.",
  },
  {
    slug: "moco-max",
    name: "MOCO Max",
    vi: "Phiên bản cao cấp nhất, tích hợp GPS, chế độ tự động đi theo người dùng qua Bluetooth và ứng dụng điện thoại, cùng hệ thống cảm biến tránh vật cản thông minh toàn diện.",
    en: "The most advanced edition with GPS, Bluetooth app follow mode, and a complete intelligent obstacle avoidance system.",
  },
] as const;

function getLoopOffset(index: number, activeIndex: number) {
  const rawOffset = index - activeIndex;
  const half = products.length / 2;

  if (rawOffset > half) return rawOffset - products.length;
  if (rawOffset < -half) return rawOffset + products.length;

  return rawOffset;
}

export default function ProductPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const { language } = useLanguage();
  const activeProduct = products[activeIndex];

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
    setActiveIndex((current) => {
      if (direction === "next") {
        return (current + 1) % products.length;
      }

      return (current - 1 + products.length) % products.length;
    });
  };

  useEffect(() => {
    try {
      const rawFavorites = window.localStorage.getItem("moco-favorites");
      setFavoriteProducts(rawFavorites ? JSON.parse(rawFavorites) : []);
    } catch {
      setFavoriteProducts([]);
    }
  }, []);

  const toggleFavoriteProduct = (slug: string) => {
    setFavoriteProducts((current) => {
      const nextFavorites = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug];

      window.localStorage.setItem("moco-favorites", JSON.stringify(nextFavorites));
      return nextFavorites;
    });
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
          {products.map((product, index) => {
            const offset = getLoopOffset(index, activeIndex);
            const isActive = offset === 0;

            return (
              <div className="product-card-shell" data-position={offset} key={product.slug}>
                <button
                  className="product-3d-card"
                  type="button"
                  aria-label={product.name}
                  aria-current={isActive}
                  onClick={() => setActiveIndex(index)}
                >
                  <Image
                    src="/assets/product-carousel.png"
                    alt=""
                    fill
                    sizes="(max-width: 560px) 76vw, 38vw"
                    priority={isActive}
                  />
                </button>
                <button
                  className={`product-favorite-button${favoriteProducts.includes(product.slug) ? " active" : ""}`}
                  type="button"
                  aria-label={language === "vi" ? "Th\u00eam v\u00e0o y\u00eau th\u00edch" : "Add to favorites"}
                  onClick={() => toggleFavoriteProduct(product.slug)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={favoriteProducts.includes(product.slug) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        <div className="product-carousel-copy">
          <Link href={`/product/${activeProduct.slug}`} className="product-stage-title">
            {activeProduct.name}
          </Link>
          <p>{activeProduct[language]}</p>
          <span>{t.hint}</span>
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
          {products.map((product) => (
            <Link href={`/product/${product.slug}`} key={product.slug}>
              <h2>{product.name}</h2>
              <p>{product[language]}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
