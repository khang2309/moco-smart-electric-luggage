"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../providers";

const products = [
  {
    slug: "moco-go",
    name: "MOCO Go",
    image: "/assets/product-carousel.png",
    vi: {
      description:
        "Phiên bản tiêu chuẩn với hệ thống lái điện tích hợp, hỗ trợ người dùng di chuyển thuận tiện tại sân bay, nhà ga, khu du lịch và các không gian rộng lớn.",
      specs: [
        ["Hệ thống lái điện tích hợp", "Hỗ trợ di chuyển nhẹ nhàng trong các không gian rộng như sân bay, nhà ga và khu du lịch."],
        ["Thiết kế nhỏ gọn", "Phù hợp cho nhu cầu di chuyển hằng ngày và hành trình ngắn."],
        ["Pin bền bỉ", "Đáp ứng các nhu cầu vận hành cơ bản với trải nghiệm mượt mà."],
      ],
    },
    en: {
      description:
        "The standard edition with integrated electric driving for airports, stations, travel areas, and large spaces.",
      specs: [
        ["Integrated electric drive", "Supports smooth movement across airports, stations, and travel spaces."],
        ["Compact design", "Suitable for daily movement and short journeys."],
        ["Durable battery", "Covers essential operation needs with a smooth experience."],
      ],
    },
  },
  {
    slug: "moco-plus",
    name: "MOCO Plus",
    image: "/assets/product-carousel.png",
    vi: {
      description:
        "Phiên bản vali điện có thể lái được, tích hợp hệ thống định vị GPS và chế độ tự động đi theo người dùng, cho phép vali nhận diện và di chuyển theo chủ sở hữu thông qua kết nối Bluetooth và ứng dụng trên điện thoại.",
      specs: [
        ["Định vị GPS", "Theo dõi vị trí hành lý trực tiếp qua ứng dụng."],
        ["Tự động đi theo", "Vali nhận diện và di chuyển theo chủ sở hữu qua Bluetooth."],
        ["Kết nối ứng dụng", "Quản lý trạng thái vali và các tính năng thông minh trên điện thoại."],
      ],
    },
    en: {
      description:
        "A rideable electric luggage edition with GPS positioning and automatic follow mode, allowing the suitcase to recognize and move with its owner through Bluetooth and the mobile app.",
      specs: [
        ["GPS positioning", "Track luggage location directly through the app."],
        ["Automatic follow mode", "Recognizes and follows the owner through Bluetooth."],
        ["Mobile app connection", "Manage suitcase status and smart features from the phone."],
      ],
    },
  },
  {
    slug: "moco-pro",
    name: "MOCO Pro",
    image: "/assets/product-carousel.png",
    vi: {
      description:
        "Phiên bản vali điện có thể lái được, tích hợp GPS, chế độ tự động đi theo người dùng thông qua Bluetooth và ứng dụng điện thoại, đồng thời được trang bị hệ thống cảm biến tránh vật cản thông minh giúp vali di chuyển an toàn hơn trong môi trường đông người.",
      specs: [
        ["GPS và Bluetooth", "Kết hợp định vị và kết nối gần để hỗ trợ theo dõi chính xác."],
        ["Cảm biến tránh vật cản", "Giúp vali phản ứng an toàn hơn trong môi trường đông người."],
        ["Chế độ Pro", "Tối ưu cho người đi công tác và di chuyển thường xuyên."],
      ],
    },
    en: {
      description:
        "A rideable electric luggage edition with GPS, Bluetooth app follow mode, and intelligent obstacle avoidance sensors for safer movement in crowded environments.",
      specs: [
        ["GPS and Bluetooth", "Combines positioning and nearby connection for accurate tracking."],
        ["Obstacle avoidance sensors", "Helps the suitcase react more safely in crowded spaces."],
        ["Pro mode", "Optimized for business travelers and frequent movement."],
      ],
    },
  },
  {
    slug: "moco-max",
    name: "MOCO Max",
    image: "/assets/product-carousel.png",
    vi: {
      description:
        "Phiên bản vali điện cao cấp nhất, tích hợp GPS, chế độ tự động đi theo người dùng thông qua Bluetooth và ứng dụng điện thoại, cùng hệ thống cảm biến tránh vật cản thông minh, mang đến trải nghiệm di chuyển toàn diện.",
      specs: [
        ["Trải nghiệm cao cấp", "Tập hợp đầy đủ các tính năng thông minh nhất của MOCO."],
        ["Cảm biến toàn diện", "Hỗ trợ nhận diện vật cản và di chuyển an toàn hơn."],
        ["Kết nối thông minh", "GPS, Bluetooth và ứng dụng điện thoại phối hợp trong một hệ thống liền mạch."],
      ],
    },
    en: {
      description:
        "The most advanced electric luggage edition with GPS, Bluetooth app follow mode, and intelligent obstacle avoidance sensors for a complete mobility experience.",
      specs: [
        ["Premium experience", "Combines MOCO's most advanced smart features."],
        ["Complete sensor system", "Supports obstacle recognition and safer movement."],
        ["Smart connectivity", "GPS, Bluetooth, and the mobile app work as one connected system."],
      ],
    },
  },
] as const;

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [openIndex, setOpenIndex] = useState(0);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const [showCartFlyer, setShowCartFlyer] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);

  const product = products.find((item) => item.slug === params.slug) ?? products[0];
  const details = product[language];

  const copy = useMemo(
    () => ({
      vi: {
        back: "Quay lại sản phẩm",
        quantity: "Số lượng",
        add: "Thêm vào giỏ hàng",
        imageAlt: "Vali điện MOCO",
      },
      en: {
        back: "Back to products",
        quantity: "Quantity",
        add: "Add to cart",
        imageAlt: "MOCO electric luggage",
      },
    }),
    [],
  );

  const t = copy[language];

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

  const handleAddToCart = () => {
    const cartItem = {
      slug: product.slug,
      name: "MOCO Smart Electric Luggage",
      image: product.image,
      quantity,
      price: 8990000,
      oldPrice: 9490000,
      store: "MOCO Store",
      subtitle: "Smart Mobility Carry-on",
    };

    try {
      const rawCart = window.localStorage.getItem("moco-cart");
      const currentCart = rawCart ? JSON.parse(rawCart) : [];
      const nextCart = currentCart.some((item: { slug: string }) => item.slug === cartItem.slug)
        ? currentCart.map((item: { slug: string; quantity: number }) =>
            item.slug === cartItem.slug ? { ...item, quantity: item.quantity + quantity } : item,
          )
        : [...currentCart, cartItem];

      window.localStorage.setItem("moco-cart", JSON.stringify(nextCart));
    } catch {
      window.localStorage.setItem("moco-cart", JSON.stringify([cartItem]));
    }

    setShowAddedFeedback(true);
    setShowCartFlyer(true);
    window.setTimeout(() => setShowCartFlyer(false), 900);
    window.setTimeout(() => setShowAddedFeedback(false), 1800);
    window.dispatchEvent(new Event("moco-cart-updated"));
  };

  return (
    <main className="product-detail-page">
      <Link href="/product" className="product-back-link">
        {t.back}
      </Link>
      <section className="product-detail-shell" aria-label={product.name}>
        <div className="product-detail-visual">
          <button
            className={`product-favorite-button detail-favorite${favoriteProducts.includes(product.slug) ? " active" : ""}`}
            type="button"
            aria-label={language === "vi" ? "Th\u00eam v\u00e0o y\u00eau th\u00edch" : "Add to favorites"}
            onClick={() => toggleFavoriteProduct(product.slug)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={favoriteProducts.includes(product.slug) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path>
            </svg>
          </button>
          <Image
            src={product.image}
            alt={t.imageAlt}
            fill
            sizes="(max-width: 920px) 100vw, 56vw"
            priority
          />
        </div>

        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <span className="product-title-line" aria-hidden="true" />
          <p>{details.description}</p>

          <div className="product-buy-row">
            <strong>{t.quantity}</strong>
            <div className="quantity-control" aria-label={t.quantity}>
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                -
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => value + 1)}>
                +
              </button>
            </div>
          </div>

          <button className={`add-cart-button${showAddedFeedback ? " added" : ""}`} type="button" onClick={handleAddToCart}>
            <svg className="add-cart-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
              <path d="M3 6h18"></path>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span aria-hidden="true">□</span>
            {t.add}
          </button>

          {showAddedFeedback && (
            <div className="add-cart-feedback">
              {language === "vi" ? "\u0110\u00e3 th\u00eam v\u00e0o gi\u1ecf h\u00e0ng" : "Added to cart"}
            </div>
          )}
          {showCartFlyer && (
            <Image
              className="cart-flyer"
              src={product.image}
              alt=""
              width={74}
              height={74}
              aria-hidden="true"
            />
          )}

          <div className="product-detail-accordions">
            {details.specs.map(([title, body], index) => (
              <article key={title}>
                <button type="button" onClick={() => setOpenIndex(index)}>
                  <span>{title}</span>
                  <span aria-hidden="true">{openIndex === index ? "^" : "v"}</span>
                </button>
                {openIndex === index && <p>{body}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
