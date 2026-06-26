"use client";

import Link from "next/link";
import { useLanguage, type Language } from "../../providers";

const copy = {
  vi: {
    breadcrumb: ["Trung tâm hỗ trợ", "Chính sách pin & hàng không"],
    eyebrow: "Thông tin an toàn bay",
    title: "Chính sách pin & hàng không",
    intro:
      "Hướng dẫn chuẩn bị pin lithium-ion tháo rời của Moco khi di chuyển bằng máy bay.",
    sections: [
      {
        title: "Pin lithium-ion tháo rời dưới 100Wh",
        paragraphs: [
          "Vali điện Moco sử dụng pin lithium-ion tháo rời, dung lượng dưới 100Wh, phù hợp với ngưỡng pin phổ biến được chấp nhận trong vận chuyển hàng không đối với thiết bị điện tử cá nhân. Theo hướng dẫn của IATA, pin dự phòng/power bank phải được mang theo trong hành lý xách tay, không được để trong hành lý ký gửi; vali thông minh có pin lithium nếu ký gửi thì phải tháo pin và mang pin theo khoang hành khách.",
          "Pin của Moco được thiết kế có thể tháo rời nhanh, vừa đóng vai trò cấp nguồn cho vali, vừa có thể dùng như pin sạc dự phòng cho điện thoại. Khi di chuyển bằng máy bay, người dùng cần tháo pin ra khỏi vali nếu vali được gửi khoang hành lý, bảo quản pin trong túi riêng hoặc túi bảo vệ để tránh va đập, chập mạch.",
        ],
      },
      {
        title: "Quy định áp dụng tại Việt Nam",
        paragraphs: [
          "Tại Việt Nam, từ 01/07/2026, Cục Hàng không Việt Nam quy định mỗi hành khách không mang quá 02 sạc dự phòng, pin lithium-ion không vượt quá 100Wh; pin trên 100Wh đến 160Wh cần được hãng hàng không chấp thuận trước. Sạc dự phòng phải để trong hành lý xách tay, không ký gửi, không sạc lại và không dùng để sạc thiết bị khác trong suốt chuyến bay.",
        ],
      },
    ],
    tableTitle: "Thông tin mang vali điện Moco lên máy bay",
    tableIntro:
      "Vali điện Moco có thể được mang theo khi đi máy bay nếu đáp ứng đồng thời các điều kiện sau:",
    tableHeaders: ["Trường hợp", "Hướng dẫn"],
    rows: [
      [
        "Mang vali lên khoang hành khách",
        "Được phép nếu kích thước và trọng lượng vali đáp ứng quy định hành lý xách tay của hãng bay. Pin nên được lắp đúng vị trí, vali tắt nguồn hoàn toàn trong suốt chuyến bay.",
      ],
      [
        "Ký gửi vali",
        "Phải tháo pin ra khỏi vali trước khi ký gửi. Pin tháo rời phải mang theo hành lý xách tay.",
      ],
      [
        "Pin / sạc dự phòng",
        "Pin dưới 100Wh, mang theo người trong hành lý xách tay, bảo vệ đầu cực để tránh đoản mạch.",
      ],
      [
        "Trong suốt chuyến bay",
        "Không sử dụng pin để sạc điện thoại, không sạc lại pin bằng ổ điện trên máy bay, không bật chế độ tự hành/đi theo/chạy điện.",
      ],
      [
        "Trước chuyến bay",
        "Kiểm tra trước quy định của hãng hàng không vì từng hãng có thể có yêu cầu riêng về vali thông minh, pin lithium và hành lý xách tay.",
      ],
    ],
    airlineTitle: "Theo Vietnam Airlines",
    airlineText:
      "Theo Vietnam Airlines, vali/túi thông minh dùng pin lithium có thiết kế pin tháo rời, dung lượng tối đa 160Wh, có thể được vận chuyển dưới dạng hành lý xách tay hoặc ký gửi; nếu ký gửi thì pin phải được tháo khỏi vali và mang trong hành lý xách tay.",
    noteTitle: "Moco thân thiện với hành trình bay",
    noteParagraphs: [
      "Vali điện Moco được trang bị pin lithium-ion tháo rời, dung lượng <100Wh, phù hợp với quy định hàng không phổ biến cho thiết bị điện tử cá nhân. Khi đi máy bay, người dùng có thể mang pin theo hành lý xách tay; nếu vali cần ký gửi, chỉ cần tháo pin ra và bảo quản riêng trong cabin.",
      "Để đảm bảo an toàn, người dùng không sử dụng tính năng di chuyển, đi theo chủ nhân hoặc sạc thiết bị trong suốt chuyến bay. Trước khi khởi hành, vui lòng kiểm tra thêm quy định cụ thể của hãng hàng không về hành lý thông minh và pin lithium.",
    ],
    fineprint:
      "Quy định hàng không có thể thay đổi tùy quốc gia, sân bay và hãng bay. Hành khách nên kiểm tra chính sách của hãng hàng không trước chuyến bay. Pin cần có thông số Wh rõ ràng trên thân pin; công thức tính là Wh = V x Ah.",
  },
  en: {
    breadcrumb: ["Support Center", "Battery & Airline Policy"],
    eyebrow: "Flight safety information",
    title: "Battery & Airline Policy",
    intro:
      "Guidance for preparing Moco's removable lithium-ion battery when traveling by air.",
    sections: [
      {
        title: "Removable lithium-ion battery under 100Wh",
        paragraphs: [
          "Moco electric luggage uses a removable lithium-ion battery with a capacity under 100Wh, which fits the common threshold accepted for air transport of personal electronic devices. Under IATA guidance, spare batteries and power banks must be carried in carry-on baggage and must not be placed in checked baggage. If a smart suitcase with a lithium battery is checked in, the battery must be removed and carried in the passenger cabin.",
          "Moco's battery is designed for quick removal. It powers the suitcase and can also work as a power bank for a phone. When flying, users should remove the battery if the suitcase is checked, and keep the battery in a separate pouch or protective bag to prevent impact and short circuits.",
        ],
      },
      {
        title: "Rules applicable in Vietnam",
        paragraphs: [
          "In Vietnam, from 01/07/2026, the Civil Aviation Authority of Vietnam states that each passenger may carry no more than 02 power banks, lithium-ion batteries must not exceed 100Wh, and batteries over 100Wh up to 160Wh require prior airline approval. Power banks must be carried in carry-on baggage, not checked in, and must not be recharged or used to charge other devices during the flight.",
        ],
      },
    ],
    tableTitle: "Bringing Moco electric luggage on a flight",
    tableIntro:
      "Moco electric luggage can be taken on a flight when the following conditions are met:",
    tableHeaders: ["Situation", "Guidance"],
    rows: [
      [
        "Carry-on cabin baggage",
        "Allowed if the suitcase size and weight meet the airline's carry-on baggage rules. The battery should be installed correctly and the suitcase must remain fully powered off throughout the flight.",
      ],
      [
        "Checked baggage",
        "The battery must be removed before the suitcase is checked. The removable battery must be carried in carry-on baggage.",
      ],
      [
        "Battery / power bank",
        "Battery under 100Wh, carried with the passenger in carry-on baggage, with terminals protected to prevent short circuits.",
      ],
      [
        "During the flight",
        "Do not use the battery to charge a phone, do not recharge the battery from an aircraft outlet, and do not enable self-driving/follow/electric movement modes.",
      ],
      [
        "Before departure",
        "Check the airline's latest policy because each airline may have its own requirements for smart luggage, lithium batteries, and carry-on baggage.",
      ],
    ],
    airlineTitle: "According to Vietnam Airlines",
    airlineText:
      "According to Vietnam Airlines, smart suitcases/bags using removable lithium batteries with a maximum capacity of 160Wh may be transported as carry-on or checked baggage. If checked, the battery must be removed from the suitcase and carried in carry-on baggage.",
    noteTitle: "Moco is flight-friendly",
    noteParagraphs: [
      "Moco electric luggage is equipped with a removable lithium-ion battery under 100Wh, suitable for common airline rules for personal electronic devices. When flying, users can carry the battery in carry-on baggage; if the suitcase must be checked, simply remove the battery and keep it separately in the cabin.",
      "For safety, users should not use movement, follow mode, or device-charging functions during the flight. Before departure, please also check the specific airline policy for smart luggage and lithium batteries.",
    ],
    fineprint:
      "Airline regulations may vary by country, airport, and airline. Passengers should check airline policies before flying. The battery should clearly show its Wh rating; the formula is Wh = V x Ah.",
  },
} satisfies Record<Language, unknown>;

export default function BatteryAirlinePolicyPage() {
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

        <section>
          <h2>{text.tableTitle}</h2>
          <p>{text.tableIntro}</p>
          <div className="support-policy-table" role="table" aria-label={text.tableTitle}>
            <div className="support-policy-row support-policy-head" role="row">
              <strong role="columnheader">{text.tableHeaders[0]}</strong>
              <strong role="columnheader">{text.tableHeaders[1]}</strong>
            </div>
            {text.rows.map(([situation, guide]) => (
              <div className="support-policy-row" role="row" key={situation}>
                <strong role="cell">{situation}</strong>
                <span role="cell">{guide}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>{text.airlineTitle}</h2>
          <p>{text.airlineText}</p>
        </section>

        <section className="support-article-note">
          <h2>{text.noteTitle}</h2>
          {text.noteParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <p className="support-article-fineprint">{text.fineprint}</p>
      </article>
    </main>
  );
}
