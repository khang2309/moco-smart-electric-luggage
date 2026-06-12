"use client";

import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FormEvent, useState } from "react";

const navItems = [
  ["About Us", "#about"],
  ["Product", "#product"],
  ["Features", "#features"],
  ["Use Cases", "#use-cases"],
  ["FAQ", "#faq"],
  ["Contact", "#contact"],
] as const;

const content = {
  highlights: ["Di chuyển bằng điện", "GPS Tracking", "Khóa thông minh", "Pin sạc bền bỉ"],
  products: [
    {
      name: "MOCO Pro",
      description: "Pin nâng cấp, tốc độ ổn định hơn, tích hợp GPS và khóa thông minh.",
      specs: ["Tốc độ tối đa 12 km/h", "Pin 10.000mAh", "Dung tích 20L", "Điều khiển đơn giản"],
      featured: true,
    },
    {
      name: "MOCO Basic",
      description: "Phiên bản tiêu chuẩn cho nhu cầu di chuyển cơ bản.",
    },
    {
      name: "Transparent Edition",
      description: "Thiết kế trong suốt hiện đại theo phong cách tương lai.",
    },
  ],
  features: [
    ["Smart Mobility System", "Cho phép vali tự di chuyển, hỗ trợ người dùng trong quá trình di chuyển."],
    ["Battery & Charging", "Pin tích hợp có thể sạc lại và hỗ trợ năng lượng cho thiết bị cá nhân."],
    ["GPS Tracking", "Hỗ trợ định vị hành lý, giảm nguy cơ thất lạc trong chuyến đi."],
    ["Smart Security", "Hệ thống khóa an toàn bảo vệ hành lý trong mọi tình huống."],
  ],
  cases: [
    ["Sân bay", "Di chuyển nhanh hơn mà không cần kéo hành lý nặng."],
    ["Du lịch", "Thoải mái hơn trong các chuyến đi dài và lịch trình dày."],
    ["Công tác", "Tiết kiệm thời gian khi di chuyển giữa nhiều địa điểm."],
    ["Sinh viên", "Hỗ trợ di chuyển hành lý trong ký túc xá và môi trường học tập."],
  ],
  faqs: [
    ["MOCO có nặng không?", "MOCO được thiết kế tối ưu trọng lượng để đảm bảo tính tiện dụng."],
    [
      "Có được mang lên máy bay không?",
      "Tùy theo quy định của từng hãng hàng không, MOCO có thể được mang như hành lý cabin.",
    ],
    [
      "Pin sử dụng được bao lâu?",
      "Thời gian sử dụng phụ thuộc vào mức độ vận hành, phù hợp cho các chuyến di chuyển ngắn trong ngày.",
    ],
    [
      "Cách điều khiển như thế nào?",
      "Thiết kế đơn giản, dễ sử dụng với nút điều khiển cơ bản hoặc tùy chọn kết nối ứng dụng.",
    ],
  ],
};

async function getMocoContent() {
  return content;
}

async function submitLead() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return "Cảm ơn bạn. MOCO sẽ liên hệ lại sớm nhất.";
}

export default function Home() {
  const { data } = useQuery({
    queryKey: ["moco-content"],
    queryFn: getMocoContent,
    initialData: content,
  });
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const leadMutation = useMutation({ mutationFn: submitLead });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    leadMutation.mutate();
    event.currentTarget.reset();
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="MOCO home">
          <Image src="/assets/logo.jpg" alt="MOCO logo" width={34} height={34} style={{ borderRadius: '8px', objectFit: 'cover' }} />
          <span>MOCO</span>
        </a>
        <nav className="nav" aria-label="Điều hướng chính">
          {navItems.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a className="nav-cta" href="#preorder">
          Pre-order
        </a>
      </header>

      <main>
        <section className="hero section" id="home">
          <div className="hero-copy">
            <p className="eyebrow">Smart Travel. Smarter Movement.</p>
            <h2 className="hero-title">MOCO Smart Electric Luggage</h2>
            <p>
              MOCO là giải pháp vali điện thông minh giúp việc mang hành lý trở nên nhẹ nhàng,
              nhanh chóng và tiện lợi hơn trong mọi hành trình hiện đại.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#product">
                Khám phá sản phẩm
              </a>
              <a className="button secondary" href="#features">
                Xem tính năng
              </a>
            </div>
          </div>
          <div className="hero-visual" aria-label="MOCO website mockup">
            <Image
              src="/assets/moco-ui-reference.png"
              alt="Giao diện tham chiếu MOCO"
              width={2200}
              height={1334}
              priority
            />
          </div>
          <div className="feature-strip" aria-label="Điểm nổi bật">
            {data.highlights.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section className="section split" id="about">
          <div>
            <p className="eyebrow">About us</p>
            <h2>Câu chuyện của MOCO</h2>
            <p>
              MOCO ra đời từ một câu hỏi đơn giản: tại sao việc mang hành lý lại luôn nặng nề
              và bất tiện? Từ đó, nhóm sinh viên FPT Cần Thơ tạo nên một giải pháp biến hành lý
              thành phương tiện di chuyển thông minh.
            </p>
          </div>
          <div className="mission-grid">
            <article>
              <h3>Sứ mệnh</h3>
              <p>Mang đến trải nghiệm di chuyển hiện đại, tiện lợi và thông minh hơn.</p>
            </article>
            <article>
              <h3>Tầm nhìn</h3>
              <p>Trở thành giải pháp dẫn đầu về hành lý thông minh và di chuyển cá nhân.</p>
            </article>
            <article>
              <h3>Đội ngũ</h3>
              <p>Nhóm sinh viên FPT Cần Thơ phát triển sản phẩm công nghệ ứng dụng thực tiễn.</p>
            </article>
          </div>
        </section>

        <section className="section product" id="product">
          <div className="section-heading">
            <p className="eyebrow">Product</p>
            <h2>MOCO Smart Electric Luggage</h2>
            <p>
              Vali điện thông minh tích hợp khả năng di chuyển, sạc và định vị, phù hợp cho du
              lịch, công tác và cuộc sống năng động.
            </p>
          </div>
          <div className="product-layout">
            {data.products.map((product) => (
              <article
                key={product.name}
                className={`product-card${product.featured ? " featured" : ""}`}
              >
                {product.featured && <span className="badge">Best choice</span>}
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                {product.specs && (
                  <ul>
                    {product.specs.map((spec) => (
                      <li key={spec}>{spec}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="section features" id="features">
          <div className="section-heading">
            <p className="eyebrow">Features</p>
            <h2>Công nghệ của MOCO</h2>
          </div>
          <div className="feature-grid">
            {data.features.map(([title, description], index) => (
              <article key={title}>
                <span className="icon">{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section use-cases" id="use-cases">
          <div className="section-heading">
            <p className="eyebrow">Use cases</p>
            <h2>MOCO đồng hành ở mọi nơi</h2>
          </div>
          <div className="case-grid">
            {data.cases.map(([title, description]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section faq" id="faq">
          <div className="section-heading">
            <p className="eyebrow">FAQ</p>
            <h2>Câu hỏi thường gặp</h2>
          </div>
          <div className="accordion">
            {data.faqs.map(([question, answer], index) => {
              const isOpen = openFaq === index;

              return (
                <div key={question}>
                  <button
                    className={isOpen ? "is-open" : ""}
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    {question}
                    <span>{isOpen ? "-" : "+"}</span>
                  </button>
                  {isOpen && <p>{answer}</p>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="section contact" id="contact">
          <div>
            <p className="eyebrow">Contact</p>
            <h2>Liên hệ MOCO</h2>
            <p>Nếu bạn quan tâm đến dự án hoặc muốn hợp tác, vui lòng để lại thông tin.</p>
            <div className="contact-list">
              <span>Email: moco.project@gmail.com</span>
              <span>Fanpage: MOCO - Smart Electric Luggage</span>
              <span>Địa điểm: FPT University Cần Thơ</span>
            </div>
          </div>
          <form className="form" onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Họ và tên" required />
            <input type="email" name="email" placeholder="Email" required />
            <textarea name="message" placeholder="Nội dung tin nhắn" required />
            <button className="button primary" type="submit">
              {leadMutation.isPending ? "Đang gửi..." : "Gửi tư vấn"}
            </button>
            <p className="form-note" aria-live="polite">
              {leadMutation.data}
            </p>
          </form>
        </section>

        <section className="section preorder" id="preorder">
          <div>
            <p className="eyebrow">Pre-order</p>
            <h2>Đăng ký quan tâm MOCO</h2>
            <p>
              MOCO đang trong giai đoạn phát triển. Đăng ký để nhận cập nhật về phiên bản đầu
              tiên, tiến trình sản phẩm và cơ hội trải nghiệm sớm.
            </p>
          </div>
          <form className="form compact" onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Họ và tên" required />
            <input type="email" name="email" placeholder="Email" required />
            <button className="button primary" type="submit">
              {leadMutation.isPending ? "Đang đăng ký..." : "Đăng ký quan tâm ngay"}
            </button>
            <p className="form-note" aria-live="polite">
              {leadMutation.data}
            </p>
          </form>
        </section>
      </main>

      <footer>
        <strong>MOCO</strong>
        <span>Smart Travel. Smarter Movement.</span>
      </footer>
    </>
  );
}
