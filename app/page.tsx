"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "./providers";

const featuredProduct = {
  slug: "moco-go",
  name: "MOCO Go",
  image: "/assets/Product/mocoGO.png",
  vi: "Phiên bản tiêu chuẩn với hệ thống lái điện tích hợp, phù hợp cho sân bay, nhà ga và các không gian di chuyển rộng.",
  en: "The standard edition with integrated electric driving for airports, stations, and large mobility spaces.",
} as const;

const highlights = {
  vi: [
    "Di chuyển bằng điện",
    "GPS Tracking",
    "Khóa thông minh",
    "Pin sạc bền bỉ",
  ],
  en: [
    "Electric ride",
    "GPS Tracking",
    "Smart lock",
    "Long-lasting battery",
  ],
};

const benefits = {
  vi: [
    "Di chuyển dễ dàng với hệ thống lái điện thông minh",
    "Kết nối ứng dụng theo thời gian thực",
    "Theo dõi và bảo vệ hành lý mọi lúc mọi nơi",
    "Thiết kế hiện đại, tối ưu cho nhu cầu di chuyển hằng ngày",
    "Kết hợp hài hòa giữa công nghệ, tiện ích và phong cách sống",
  ],
  en: [
    "Move easily with smart electric driving support",
    "Connect to the app in real time",
    "Track and protect your luggage wherever you go",
    "Modern design optimized for everyday mobility",
    "A refined mix of technology, convenience, and lifestyle",
  ],
};

const audiences = {
  vi: [
    "Người thường xuyên đi du lịch và khám phá",
    "Người đi công tác và di chuyển nhiều",
    "Sinh viên và người trẻ năng động",
    "Người yêu thích công nghệ và lifestyle hiện đại",
    "Những ai tìm kiếm giải pháp Smart Travel khác biệt",
  ],
  en: [
    "Frequent travelers and explorers",
    "Business users who move often",
    "Students and active young users",
    "People who love modern tech and lifestyle products",
    "Anyone looking for a different smart travel solution",
  ],
};

function LineIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="6" y="5" width="12" height="15" rx="2" />
      <path d="M9 5V3.8A1.8 1.8 0 0 1 10.8 2h2.4A1.8 1.8 0 0 1 15 3.8V5" />
      <path d="M9 9h6" />
      <path d="M9 14h6" />
      <path d="M9 21v1" />
      <path d="M15 21v1" />
    </svg>
  );
}

export default function HomePage() {
  const { language } = useLanguage();
  const [activeFeatured, setActiveFeatured] = useState<typeof featuredProduct | null>(featuredProduct);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        
        if (data.products) {
          const dbFeatured = data.products.find((p: any) => p.slug === featuredProduct.slug);
          if (!dbFeatured || dbFeatured.status === "deleted" || dbFeatured.status === "draft") {
            const firstActive = data.products.find((p: any) => p.status !== "deleted" && p.status !== "draft");
            if (firstActive) {
              setActiveFeatured({
                ...featuredProduct,
                slug: firstActive.slug,
                name: firstActive.name,
                image: firstActive.image || featuredProduct.image
              });
            } else {
              setActiveFeatured(null);
            }
          }
        }
      } catch {
        // Fallback silently
      }
    };
    fetchStatus();
  }, []);
  const copy = {
    vi: {
      heroDescription: (
        <>
          Vali điện thông minh cho những chuyến đi hiện đại
          <br />
          và trải nghiệm di chuyển tiện lợi.
        </>
      ),
      explore: "Khám phá sản phẩm",
      badge: "Sản phẩm mới",
      introTitle: "Vali điện cho hành trình hiện đại",
      intro: [
        "MOCO là vali điện thông minh thế hệ mới, được thiết kế để đồng hành cùng những người yêu thích sự tiện lợi, công nghệ và trải nghiệm di chuyển hiện đại.",
        "Không chỉ là một chiếc vali, MOCO kết hợp giữa hành lý, phương tiện di chuyển cá nhân và công nghệ thông minh trong một sản phẩm duy nhất.",
        "Từ sân bay, nhà ga đến khu du lịch hay đô thị hiện đại, MOCO giúp mỗi hành trình trở nên nhẹ nhàng, linh hoạt và thú vị hơn.",
      ],
      why: "Vì sao chọn MOCO?",
      audienceTitle: "MOCO dành cho ai?",
      audienceText:
        "Dù bạn là ai, MOCO luôn là người bạn đồng hành đáng tin cậy trên mọi hành trình.",
      productTitle: "Sản phẩm nổi bật",
      productLink: "Xem chi tiết sản phẩm",
    },
    en: {
      heroDescription: (
        <>
          Smart electric luggage for modern journeys
          <br />
          and a more convenient travel experience.
        </>
      ),
      explore: "Explore products",
      badge: "New arrival",
      introTitle: "Electric luggage for modern journeys",
      intro: [
        "MOCO is a next-generation smart electric suitcase designed for people who value convenience, technology, and modern mobility.",
        "More than luggage, MOCO combines a suitcase, a personal mobility device, and smart technology in one product.",
        "From airports and stations to travel destinations and modern cities, MOCO makes every journey lighter, more flexible, and more enjoyable.",
      ],
      why: "Why choose MOCO?",
      audienceTitle: "Who is MOCO for?",
      audienceText:
        "Whoever you are, MOCO is a reliable travel companion for every journey.",
      productTitle: "Featured product",
      productLink: "View product details",
    },
  }[language];

  return (
    <main>
      <section className="hero" id="home">
        <div className="hero-content">
          <h1 className="hero-title-main">MOCO</h1>
          <h2 className="hero-subtitle">SMART ELECTRIC LUGGAGE</h2>
          <p className="hero-description">{copy.heroDescription}</p>
          <div className="hero-actions">
            <Link className="button primary glow" href="/product">
              {copy.explore}
            </Link>
          </div>
        </div>
      </section>

      <section className="new-arrival" id="new-arrival">
        <div className="new-arrival-content">
          <span className="badge-outline">{copy.badge}</span>
          <h2 className="new-arrival-title">{copy.introTitle}</h2>
          <div className="new-arrival-text">
            {copy.intro.map((paragraph, index) => (
              <p className={index === 0 ? "highlight-text" : ""} key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="home-showcase" aria-labelledby="home-showcase-title">
        <div className="home-showcase-panel">
          <div className="home-showcase-copy">
            <h2 id="home-showcase-title">{copy.why}</h2>
            <div className="home-benefit-list">
              {benefits[language].map((benefit) => (
                <article key={benefit}>
                  <span className="benefit-icon">
                    <LineIcon />
                  </span>
                  <p>{benefit}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-audience" aria-labelledby="home-audience-title">
        <div className="home-audience-heading">
          <h2 id="home-audience-title">{copy.audienceTitle}</h2>
          <p>{copy.audienceText}</p>
        </div>
        <div className="home-audience-grid">
          {audiences[language].map((audience) => (
            <article key={audience}>
              <span className="audience-icon">
                <LineIcon />
              </span>
              <p>{audience}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="feature-strip-container">
        <div className="feature-strip" aria-label="Điểm nổi bật">
          {highlights[language].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      {activeFeatured && (
        <section className="home-featured-product" aria-label={copy.productTitle}>
          <Link
            className="home-featured-visual"
            href={`/product/${activeFeatured.slug}`}
            aria-label={activeFeatured.name}
          >
            <Image
              src={activeFeatured.image}
              alt={activeFeatured.name}
              fill
              sizes="(max-width: 760px) 76vw, 420px"
            />
          </Link>

          <div className="home-featured-card">
            <h2 className="home-featured-title">{copy.productTitle}</h2>
            <Link href={`/product/${activeFeatured.slug}`} className="product-stage-title">
              {activeFeatured.name}
            </Link>
            <p className="home-featured-description">{activeFeatured[language]}</p>
            <Link className="home-product-link" href={`/product/${activeFeatured.slug}`}>
              {copy.productLink}
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
