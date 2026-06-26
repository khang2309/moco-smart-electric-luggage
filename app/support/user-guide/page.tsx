"use client";

import Link from "next/link";
import { useLanguage, type Language } from "../../providers";

const copy = {
  vi: {
    breadcrumb: ["Trung tâm hỗ trợ", "Hướng dẫn sử dụng"],
    eyebrow: "Hướng dẫn sử dụng",
    title: "Vận hành vali điện Moco an toàn",
    intro:
      "Tìm hiểu cách vận hành vali điện Moco một cách dễ dàng, an toàn và hiệu quả trong mọi hành trình.",
    sections: [
      {
        title: "1. Cách vận hành vali",
        paragraphs: [
          "Trước khi sử dụng, hãy kiểm tra pin đã được lắp đúng vị trí và vali đã được bật nguồn. Người dùng có thể ngồi lên vali và điều khiển hướng di chuyển bằng tay lái. Khi di chuyển, nên giữ tốc độ vừa phải, quan sát xung quanh và sử dụng thắng tay khi cần giảm tốc hoặc dừng lại.",
          "Các tính năng thông minh như đi theo chủ nhân, tránh vật cản, định vị GPS và còi cảnh báo cần được kích hoạt theo hướng dẫn trên ứng dụng hoặc bảng điều khiển của sản phẩm. Không nên sử dụng chế độ di chuyển điện trong khu vực đông người, đường dốc, mặt đường trơn trượt hoặc nơi có nhiều chướng ngại vật.",
        ],
      },
      {
        title: "2. Cách sạc pin",
        paragraphs: [
          "Vali điện Moco sử dụng pin tháo rời, thuận tiện cho việc sạc và mang theo khi di chuyển. Trước khi sạc, hãy tháo pin khỏi vali hoặc kết nối sạc theo đúng cổng sạc được thiết kế. Sử dụng bộ sạc chính hãng hoặc bộ sạc đạt tiêu chuẩn phù hợp với thông số của pin.",
          "Không sạc pin ở nơi ẩm ướt, gần nguồn nhiệt cao hoặc dưới ánh nắng trực tiếp. Sau khi pin đầy, nên ngắt sạc để đảm bảo tuổi thọ pin. Pin cũng có thể dùng để sạc điện thoại trong trường hợp cần thiết, tương tự như một pin sạc dự phòng.",
        ],
      },
      {
        title: "3. Lưu ý an toàn khi sử dụng",
        paragraphs: [
          "Luôn kiểm tra tình trạng vali, tay lái, thắng cơ và pin trước khi vận hành. Không chở quá tải trọng khuyến nghị của nhà sản xuất. Không để trẻ em tự ý điều khiển vali khi không có người lớn giám sát.",
          "Khi đi máy bay, hãy tháo pin ra khỏi vali nếu cần ký gửi hành lý và mang pin theo hành lý xách tay. Không bật nguồn, không sử dụng tính năng di chuyển, không sạc pin hoặc dùng pin để sạc thiết bị khác trong suốt chuyến bay.",
        ],
      },
      {
        title: "4. Bảo quản sản phẩm",
        paragraphs: [
          "Sau khi sử dụng, nên tắt nguồn vali và bảo quản ở nơi khô ráo, thoáng mát. Tránh để vali tiếp xúc lâu với nước, bụi bẩn, nhiệt độ cao hoặc va đập mạnh. Nếu không sử dụng trong thời gian dài, nên sạc pin định kỳ để duy trì hiệu suất hoạt động.",
        ],
      },
    ],
    actions: ["Xem chính sách pin & hàng không", "Liên hệ hỗ trợ"],
  },
  en: {
    breadcrumb: ["Support Center", "User Guide"],
    eyebrow: "User guide",
    title: "Operate your Moco electric luggage safely",
    intro:
      "Learn how to use Moco electric luggage easily, safely, and effectively on every journey.",
    sections: [
      {
        title: "1. Operating the suitcase",
        paragraphs: [
          "Before use, check that the battery is installed correctly and the suitcase is powered on. Users can sit on the suitcase and steer with the handlebar. While moving, keep a moderate speed, watch your surroundings, and use the hand brake when slowing down or stopping.",
          "Smart features such as follow mode, obstacle avoidance, GPS tracking, and alarm alerts should be activated according to the instructions in the app or on the product control panel. Do not use electric movement mode in crowded areas, on slopes, on slippery surfaces, or where there are many obstacles.",
        ],
      },
      {
        title: "2. Charging the battery",
        paragraphs: [
          "Moco electric luggage uses a removable battery, making it convenient to charge and carry while traveling. Before charging, remove the battery from the suitcase or connect the charger to the designed charging port. Use the official charger or a certified charger that matches the battery specifications.",
          "Do not charge the battery in wet areas, near high heat sources, or under direct sunlight. Once fully charged, unplug the charger to help preserve battery life. The battery can also be used to charge a phone when needed, similar to a power bank.",
        ],
      },
      {
        title: "3. Safety notes",
        paragraphs: [
          "Always check the suitcase condition, handlebar, mechanical brake, and battery before operating. Do not exceed the manufacturer's recommended load. Children should not operate the suitcase without adult supervision.",
          "When flying, remove the battery from the suitcase if the luggage needs to be checked and carry the battery in carry-on baggage. Do not power on the suitcase, use movement features, charge the battery, or use the battery to charge other devices during the flight.",
        ],
      },
      {
        title: "4. Product storage",
        paragraphs: [
          "After use, turn off the suitcase and store it in a dry, cool, and well-ventilated place. Avoid long exposure to water, dust, high temperatures, or strong impacts. If the suitcase is not used for a long time, charge the battery periodically to maintain performance.",
        ],
      },
    ],
    actions: ["View battery & airline policy", "Contact support"],
  },
} satisfies Record<Language, unknown>;

export default function UserGuidePage() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <main className="support-article-page">
      <nav className="support-article-breadcrumb" aria-label="Breadcrumb">
        <Link href="/#support">{text.breadcrumb[0]}</Link>
        <span>/</span>
        <span>{text.breadcrumb[1]}</span>
      </nav>

      <section className="support-article-hero">
        <p>{text.eyebrow}</p>
        <h1>{text.title}</h1>
        <span>{text.intro}</span>
      </section>

      <article className="support-article-content">
        {text.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}

        <div className="support-article-actions">
          <Link href="/support/battery-airline-policy">{text.actions[0]}</Link>
          <Link href="/#contact">{text.actions[1]}</Link>
        </div>
      </article>
    </main>
  );
}
