"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../providers";

type ProductFeature = {
  id: string;
  icon: "ride" | "follow" | "obstacle" | "gps" | "alarm" | "battery" | "phone" | "airline" | "brake" | "lock" | "light" | "app";
  vi: {
    title: string;
    short: string;
    benefit: string;
    usage?: string;
    safety?: string;
  };
  en: {
    title: string;
    short: string;
    benefit: string;
    usage?: string;
    safety?: string;
  };
};

const commonProductFeatures = {
  ride: {
    id: "ride-control",
    icon: "ride",
    vi: {
      title: "Ngồi lên vali và điều khiển bằng tay lái",
      short: "Hệ thống lái điện giúp người dùng ngồi lên vali và điều hướng như một phương tiện cá nhân nhỏ gọn.",
      benefit: "Giảm sức kéo hành lý trong sân bay, nhà ga hoặc khuôn viên rộng.",
      usage: "Bật nguồn, kiểm tra tay lái và di chuyển ở tốc độ vừa phải.",
      safety: "Không dùng ở khu vực đông người, mặt đường trơn, đường dốc hoặc nơi có nhiều chướng ngại vật.",
    },
    en: {
      title: "Ride-on handlebar control",
      short: "The electric drive lets users sit on the suitcase and steer it like a compact personal mobility device.",
      benefit: "Reduces the effort of pulling luggage in airports, stations, and large spaces.",
      usage: "Power on, check the handlebar, and move at a moderate speed.",
      safety: "Avoid crowded areas, slippery surfaces, slopes, and obstacle-heavy paths.",
    },
  },
  removableBattery: {
    id: "removable-battery",
    icon: "battery",
    vi: {
      title: "Pin tháo rời",
      short: "Pin lithium-ion được thiết kế tháo rời nhanh để sạc, bảo quản hoặc mang theo khi di chuyển.",
      benefit: "Thuận tiện khi sạc riêng, bảo trì và xử lý hành lý lúc đi máy bay.",
      usage: "Tắt nguồn vali trước khi tháo pin, sau đó bảo quản pin trong túi riêng.",
      safety: "Tránh va đập mạnh, nước, nhiệt cao và chập mạch ở đầu cực pin.",
    },
    en: {
      title: "Removable battery",
      short: "The lithium-ion battery is designed for quick removal for charging, storage, or travel.",
      benefit: "Makes separate charging, maintenance, and airport handling easier.",
      usage: "Turn off the suitcase before removing the battery, then keep it in a separate pouch.",
      safety: "Avoid impact, water, high heat, and terminal short circuits.",
    },
  },
  phoneCharge: {
    id: "phone-charge",
    icon: "phone",
    vi: {
      title: "Pin có thể sạc điện thoại",
      short: "Pin của Moco có thể dùng như pin sạc dự phòng cho điện thoại trong trường hợp cần thiết.",
      benefit: "Giữ thiết bị cá nhân luôn có năng lượng khi di chuyển dài.",
      usage: "Kết nối điện thoại với cổng sạc phù hợp trên pin theo đúng hướng dẫn.",
      safety: "Không sử dụng tính năng sạc thiết bị trong suốt chuyến bay.",
    },
    en: {
      title: "Phone charging battery",
      short: "Moco's battery can work as a power bank for a phone when needed.",
      benefit: "Keeps personal devices powered during long trips.",
      usage: "Connect the phone to the suitable battery charging port as instructed.",
      safety: "Do not use device charging functions during a flight.",
    },
  },
  airlineBattery: {
    id: "airline-battery",
    icon: "airline",
    vi: {
      title: "Pin dưới 100Wh, phù hợp hàng không",
      short: "Pin tháo rời có dung lượng dưới 100Wh, phù hợp ngưỡng phổ biến cho thiết bị điện tử cá nhân khi đi máy bay.",
      benefit: "Dễ chuẩn bị cho hành trình bay: tháo pin khi ký gửi vali và mang pin theo hành lý xách tay.",
      usage: "Kiểm tra thông số Wh trên thân pin và quy định của hãng bay trước chuyến đi.",
      safety: "Không ký gửi pin rời; cần bảo vệ đầu cực để tránh đoản mạch.",
    },
    en: {
      title: "Under-100Wh airline-ready battery",
      short: "The removable battery is under 100Wh, matching the common threshold for personal electronic devices on flights.",
      benefit: "Makes air travel preparation easier: remove the battery when checking the suitcase and carry it in cabin baggage.",
      usage: "Check the Wh rating on the battery and the airline policy before departure.",
      safety: "Do not check spare batteries; protect terminals to prevent short circuits.",
    },
  },
  brake: {
    id: "hand-brake",
    icon: "brake",
    vi: {
      title: "Thắng tay / thắng cơ",
      short: "Cơ chế thắng hỗ trợ giảm tốc hoặc dừng vali khi người dùng đang di chuyển.",
      benefit: "Tăng cảm giác kiểm soát và an toàn trong các khu vực cần giảm tốc.",
      usage: "Giữ tốc độ vừa phải và dùng thắng khi cần dừng hoặc tránh người đi bộ.",
      safety: "Luôn kiểm tra thắng trước khi vận hành.",
    },
    en: {
      title: "Hand / mechanical brake",
      short: "The brake mechanism helps slow down or stop the suitcase while riding.",
      benefit: "Adds control and confidence in areas where speed must be reduced.",
      usage: "Keep a moderate speed and brake when stopping or avoiding pedestrians.",
      safety: "Always check the brake before operating.",
    },
  },
  lock: {
    id: "safe-lock",
    icon: "lock",
    vi: {
      title: "Khóa an toàn",
      short: "Khóa hỗ trợ bảo vệ hành lý cá nhân trong quá trình di chuyển.",
      benefit: "Giúp người dùng yên tâm hơn khi mang theo đồ dùng quan trọng.",
      usage: "Kiểm tra khóa trước khi rời vali hoặc trước khi gửi hành lý.",
      safety: "Không để vật sắc nhọn hoặc chất cấm trong hành lý.",
    },
    en: {
      title: "Safety lock",
      short: "The lock helps protect personal belongings while traveling.",
      benefit: "Gives users more confidence when carrying important items.",
      usage: "Check the lock before leaving the suitcase or checking baggage.",
      safety: "Do not carry sharp objects or prohibited items inside luggage.",
    },
  },
  gps: {
    id: "gps-tracking",
    icon: "gps",
    vi: {
      title: "Định vị GPS",
      short: "GPS hỗ trợ theo dõi vị trí vali qua ứng dụng.",
      benefit: "Giảm rủi ro thất lạc hành lý và giúp người dùng kiểm tra vị trí nhanh hơn.",
      usage: "Kết nối vali với ứng dụng Moco và bật quyền vị trí theo hướng dẫn.",
    },
    en: {
      title: "GPS tracking",
      short: "GPS helps track suitcase location through the app.",
      benefit: "Reduces the risk of lost luggage and makes location checks faster.",
      usage: "Connect the suitcase with the Moco app and enable location permissions as instructed.",
    },
  },
  follow: {
    id: "auto-follow",
    icon: "follow",
    vi: {
      title: "Tính năng đi theo chủ nhân",
      short: "Vali nhận diện và di chuyển theo người dùng thông qua kết nối gần và ứng dụng.",
      benefit: "Rảnh tay hơn khi di chuyển trong không gian rộng, ít chướng ngại.",
      usage: "Kích hoạt chế độ đi theo trên ứng dụng khi môi trường đủ an toàn.",
      safety: "Không dùng ở khu vực đông người, cầu thang, thang cuốn hoặc gần mép cao.",
    },
    en: {
      title: "Automatic follow mode",
      short: "The suitcase recognizes and follows the user through nearby connection and the app.",
      benefit: "Keeps your hands freer in open spaces with fewer obstacles.",
      usage: "Enable follow mode in the app when the environment is safe enough.",
      safety: "Do not use near crowds, stairs, escalators, or high edges.",
    },
  },
  obstacle: {
    id: "obstacle-avoidance",
    icon: "obstacle",
    vi: {
      title: "Tránh vật cản tự động",
      short: "Cảm biến giúp vali nhận biết chướng ngại vật và hỗ trợ phản ứng an toàn hơn.",
      benefit: "Hạn chế va chạm khi di chuyển ở khu vực có nhiều người hoặc vật cản.",
      usage: "Bật chế độ cảm biến trong ứng dụng hoặc bảng điều khiển trước khi sử dụng.",
      safety: "Cảm biến chỉ là tính năng hỗ trợ; người dùng vẫn cần quan sát xung quanh.",
    },
    en: {
      title: "Automatic obstacle avoidance",
      short: "Sensors help the suitcase detect obstacles and respond more safely.",
      benefit: "Helps reduce collisions in spaces with people or objects nearby.",
      usage: "Enable the sensor mode in the app or control panel before use.",
      safety: "Sensors are assistive; users still need to watch their surroundings.",
    },
  },
  alarm: {
    id: "warning-alarm",
    icon: "alarm",
    vi: {
      title: "Còi cảnh báo",
      short: "Còi cảnh báo giúp thu hút chú ý khi cần tìm vali hoặc cảnh báo tình huống bất thường.",
      benefit: "Hỗ trợ bảo vệ hành lý và tìm thiết bị nhanh hơn trong môi trường đông người.",
      usage: "Kích hoạt cảnh báo từ ứng dụng hoặc nút điều khiển tùy phiên bản.",
      safety: "Không kích hoạt còi ở nơi yêu cầu yên tĩnh hoặc khi có thể gây hoảng loạn.",
    },
    en: {
      title: "Warning alarm",
      short: "The alarm helps draw attention when locating the suitcase or warning about unusual situations.",
      benefit: "Supports luggage security and makes the device easier to find in busy areas.",
      usage: "Trigger the alarm from the app or control button depending on the version.",
      safety: "Do not trigger the alarm in quiet areas or where it may cause panic.",
    },
  },
  light: {
    id: "warning-light",
    icon: "light",
    vi: {
      title: "Đèn cảnh báo",
      short: "Đèn cảnh báo tăng khả năng nhận diện vali khi di chuyển hoặc trong môi trường thiếu sáng.",
      benefit: "Giúp người xung quanh dễ nhận biết vali hơn.",
      usage: "Bật đèn khi di chuyển ở khu vực thiếu sáng hoặc nơi cần tăng nhận diện.",
    },
    en: {
      title: "Warning lights",
      short: "Warning lights make the suitcase easier to notice while moving or in low-light areas.",
      benefit: "Helps people nearby recognize the suitcase more clearly.",
      usage: "Turn on the lights in darker areas or whenever visibility is needed.",
    },
  },
  app: {
    id: "app-control",
    icon: "app",
    vi: {
      title: "Kết nối ứng dụng Moco",
      short: "Ứng dụng hỗ trợ theo dõi trạng thái, pin, định vị và các tính năng thông minh của vali.",
      benefit: "Quản lý thiết bị thuận tiện từ điện thoại.",
      usage: "Ghép nối vali qua Bluetooth và làm theo hướng dẫn trong ứng dụng.",
    },
    en: {
      title: "Moco app connection",
      short: "The app helps monitor status, battery, location, and smart suitcase features.",
      benefit: "Makes device management convenient from your phone.",
      usage: "Pair the suitcase through Bluetooth and follow the in-app instructions.",
    },
  },
} satisfies Record<string, ProductFeature>;

const products = [
  {
    slug: "moco-go",
    name: "MOCO Go",
    image: "/assets/Product/mocoGO.png",
    features: [
      commonProductFeatures.ride,
      commonProductFeatures.removableBattery,
      commonProductFeatures.phoneCharge,
      commonProductFeatures.airlineBattery,
      commonProductFeatures.brake,
      commonProductFeatures.lock,
    ],
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
    image: "/assets/Product/mocoPLUS.png",
    features: [
      commonProductFeatures.ride,
      commonProductFeatures.follow,
      commonProductFeatures.gps,
      commonProductFeatures.app,
      commonProductFeatures.removableBattery,
      commonProductFeatures.phoneCharge,
      commonProductFeatures.airlineBattery,
      commonProductFeatures.brake,
      commonProductFeatures.lock,
    ],
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
    image: "/assets/Product/mocoPRO.png",
    features: [
      commonProductFeatures.ride,
      commonProductFeatures.follow,
      commonProductFeatures.obstacle,
      commonProductFeatures.gps,
      commonProductFeatures.alarm,
      commonProductFeatures.app,
      commonProductFeatures.removableBattery,
      commonProductFeatures.phoneCharge,
      commonProductFeatures.airlineBattery,
      commonProductFeatures.brake,
      commonProductFeatures.lock,
    ],
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
    image: "/assets/Product/mocoMAX.png",
    features: [
      commonProductFeatures.ride,
      commonProductFeatures.follow,
      commonProductFeatures.obstacle,
      commonProductFeatures.gps,
      commonProductFeatures.alarm,
      commonProductFeatures.light,
      commonProductFeatures.app,
      commonProductFeatures.removableBattery,
      commonProductFeatures.phoneCharge,
      commonProductFeatures.airlineBattery,
      commonProductFeatures.brake,
      commonProductFeatures.lock,
    ],
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

function FeatureIcon({ title }: { title: string }) {
  const normalizedTitle = title.toLowerCase();
  let icon = (
    <>
      <path d="M12 3.5 19 7v5.2c0 4.5-2.9 7.1-7 8.3-4.1-1.2-7-3.8-7-8.3V7l7-3.5Z"></path>
      <path d="m9.5 12 1.7 1.7 3.6-4"></path>
    </>
  );

  if (normalizedTitle.includes("gps") || normalizedTitle.includes("định vị")) {
    icon = (
      <>
        <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"></path>
        <circle cx="12" cy="10" r="2.2"></circle>
      </>
    );
  } else if (normalizedTitle.includes("bluetooth") || normalizedTitle.includes("kết nối") || normalizedTitle.includes("app")) {
    icon = (
      <>
        <path d="m8 7 8 5-8 5V7Z"></path>
        <path d="m16 7-8 5 8 5V7Z"></path>
        <path d="M5 8.5a5 5 0 0 0 0 7"></path>
        <path d="M19 8.5a5 5 0 0 1 0 7"></path>
      </>
    );
  } else if (normalizedTitle.includes("pin") || normalizedTitle.includes("battery")) {
    icon = (
      <>
        <rect x="7" y="6" width="10" height="14" rx="2"></rect>
        <path d="M10 4h4"></path>
        <path d="M10 15h4"></path>
        <path d="M10 12h4"></path>
      </>
    );
  } else if (normalizedTitle.includes("cảm biến") || normalizedTitle.includes("sensor") || normalizedTitle.includes("obstacle")) {
    icon = (
      <>
        <path d="M12 3.5 19 7v5.2c0 4.5-2.9 7.1-7 8.3-4.1-1.2-7-3.8-7-8.3V7l7-3.5Z"></path>
        <path d="M8.5 12h7"></path>
        <path d="M12 8.5v7"></path>
      </>
    );
  } else if (normalizedTitle.includes("lái điện") || normalizedTitle.includes("drive")) {
    icon = (
      <>
        <circle cx="12" cy="12" r="8.5"></circle>
        <circle cx="12" cy="12" r="2.1"></circle>
        <path d="M12 14.2v6"></path>
        <path d="m9.8 10.9-5.2-3"></path>
        <path d="m14.2 10.9 5.2-3"></path>
      </>
    );
  } else if (normalizedTitle.includes("nhỏ gọn") || normalizedTitle.includes("compact") || normalizedTitle.includes("thiết kế")) {
    icon = (
      <>
        <rect x="7" y="6" width="10" height="14" rx="2"></rect>
        <path d="M9.5 6V4.8A1.8 1.8 0 0 1 11.3 3h1.4a1.8 1.8 0 0 1 1.8 1.8V6"></path>
        <path d="M9.5 9.5h5"></path>
        <path d="M9.5 16.5h5"></path>
      </>
    );
  } else if (normalizedTitle.includes("theo") || normalizedTitle.includes("follow")) {
    icon = (
      <>
        <circle cx="8" cy="8" r="3"></circle>
        <path d="M3.8 19a4.2 4.2 0 0 1 8.4 0"></path>
        <path d="M15 7h5"></path>
        <path d="m17.5 4.5 2.5 2.5-2.5 2.5"></path>
        <path d="M15 15h5"></path>
        <path d="m17.5 12.5 2.5 2.5-2.5 2.5"></path>
      </>
    );
  } else if (normalizedTitle.includes("premium") || normalizedTitle.includes("cao cấp") || normalizedTitle.includes("pro")) {
    icon = (
      <>
        <path d="m12 3 2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9 5.5-.8L12 3Z"></path>
      </>
    );
  }

  return (
    <svg className="feature-row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icon}
    </svg>
  );
}

function ShowcaseFeatureIcon({ type }: { type: ProductFeature["icon"] }) {
  const paths: Record<ProductFeature["icon"], ReactNode> = {
    ride: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="2.1" />
        <path d="M12 14.2v6" />
        <path d="m9.8 10.9-5.2-3" />
        <path d="m14.2 10.9 5.2-3" />
      </>
    ),
    follow: (
      <>
        <circle cx="8" cy="8" r="3" />
        <path d="M3.8 19a4.2 4.2 0 0 1 8.4 0" />
        <path d="M15 7h5" />
        <path d="m17.5 4.5 2.5 2.5-2.5 2.5" />
        <path d="M15 15h5" />
      </>
    ),
    obstacle: (
      <>
        <path d="M12 3.2 19 6.6v5.1c0 4.5-2.9 7.2-7 8.5-4.1-1.3-7-4-7-8.5V6.6l7-3.4Z" />
        <path d="M8.5 12h7" />
        <path d="M12 8.5v7" />
      </>
    ),
    gps: (
      <>
        <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2.2" />
      </>
    ),
    alarm: (
      <>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 2 7 2 9H4c0-2 2-2 2-9" />
        <path d="M10 20a2.4 2.4 0 0 0 4 0" />
        <path d="M4 4 2.8 2.8" />
        <path d="M20 4 21.2 2.8" />
      </>
    ),
    battery: (
      <>
        <rect x="7" y="6" width="10" height="14" rx="2" />
        <path d="M10 4h4" />
        <path d="M10 15h4" />
        <path d="M10 12h4" />
      </>
    ),
    phone: (
      <>
        <rect x="8" y="3" width="8" height="18" rx="2" />
        <path d="M10.5 7h3" />
        <path d="M11 16.5h2" />
        <path d="m17.5 9 2-2" />
        <path d="m17.5 13 2 2" />
      </>
    ),
    airline: (
      <>
        <path d="M3 16.5 21 7l-2 10-5-3-4 5-1-7-6-2Z" />
        <path d="m9 12 10-5" />
      </>
    ),
    brake: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 3" />
        <path d="M5 19 19 5" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <path d="M12 14v2" />
      </>
    ),
    light: (
      <>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M8 14a6 6 0 1 1 8 0c-.8.7-1 1.3-1 2H9c0-.7-.2-1.3-1-2Z" />
        <path d="M4 8H2" />
        <path d="M22 8h-2" />
      </>
    ),
    app: (
      <>
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <path d="M10 7h4" />
        <path d="M12 17.5h.01" />
        <path d="M3.5 9.5a9 9 0 0 1 0 5" />
        <path d="M20.5 9.5a9 9 0 0 0 0 5" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[type]}
    </svg>
  );
}

function ProductFeatureShowcase({
  product,
  language,
}: {
  product: (typeof products)[number];
  language: "vi" | "en";
}) {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const selectedFeature = product.features.find((feature) => feature.id === selectedFeatureId) ?? null;
  const selectedCopy = selectedFeature ? (selectedFeature[language] as ProductFeature["vi"]) : null;
  const labels = {
    vi: {
      eyebrow: "Tính năng sản phẩm",
      title: "Tất cả tính năng",
      intro: "Khám phá các tính năng được trang bị riêng cho mẫu vali bạn đang xem.",
      back: "Quay lại tất cả tính năng",
      benefit: "Lợi ích",
      usage: "Cách sử dụng",
      safety: "Lưu ý an toàn",
      productAlt: "Vali điện MOCO",
    },
    en: {
      eyebrow: "Product features",
      title: "All Features",
      intro: "Explore the features included with the suitcase model you are viewing.",
      back: "Back to all features",
      benefit: "Benefit",
      usage: "How to use",
      safety: "Safety note",
      productAlt: "MOCO electric luggage",
    },
  }[language];

  return (
    <section className={`product-feature-showcase${selectedFeature ? " is-focused" : ""}`} aria-labelledby="product-feature-title">
      <div className="product-feature-heading">
        <span>{labels.eyebrow}</span>
        <h2 id="product-feature-title">{labels.title}</h2>
        <p>{labels.intro}</p>
      </div>

      <div className="product-feature-stage">
        <div className="feature-product-cluster">
          <div className="feature-product-image">
            <Image src={product.image} alt={labels.productAlt} fill sizes="(max-width: 760px) 78vw, 34vw" />
          </div>

          <div className="feature-orbit" aria-label={labels.title}>
            {product.features.map((feature, index) => {
              const isSelected = selectedFeature?.id === feature.id;
              const angle = (index / product.features.length) * Math.PI * 2 - Math.PI / 2;
              const radiusX = 42;
              const radiusY = 36;
              const x = 50 + Math.cos(angle) * radiusX;
              const y = 50 + Math.sin(angle) * radiusY;

              return (
                <button
                  className={`feature-orbit-item${isSelected ? " is-selected" : ""}`}
                  style={{ "--feature-x": `${x}%`, "--feature-y": `${y}%` } as CSSProperties}
                  type="button"
                  key={feature.id}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedFeatureId(feature.id)}
                >
                  <span className="feature-orbit-icon">
                    <ShowcaseFeatureIcon type={feature.icon} />
                  </span>
                  <strong>{feature[language].title}</strong>
                </button>
              );
            })}
          </div>
        </div>

        <div className="feature-detail-panel" aria-live="polite">
          {selectedFeature && selectedCopy ? (
            <>
              <button className="feature-reset-button" type="button" onClick={() => setSelectedFeatureId(null)}>
                {labels.back}
              </button>
              <div className="feature-detail-icon">
                <ShowcaseFeatureIcon type={selectedFeature.icon} />
              </div>
              <h3>{selectedCopy.title}</h3>
              <p>{selectedCopy.short}</p>
              <dl>
                <div>
                  <dt>{labels.benefit}</dt>
                  <dd>{selectedCopy.benefit}</dd>
                </div>
                {selectedCopy.usage ? (
                  <div>
                    <dt>{labels.usage}</dt>
                    <dd>{selectedCopy.usage}</dd>
                  </div>
                ) : null}
                {selectedCopy.safety ? (
                  <div>
                    <dt>{labels.safety}</dt>
                    <dd>{selectedCopy.safety}</dd>
                  </div>
                ) : null}
              </dl>
            </>
          ) : (
            <div className="feature-detail-empty">
              <h3>{product.name}</h3>
              <p>{labels.intro}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [openIndex, setOpenIndex] = useState(0);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const [showCartFlyer, setShowCartFlyer] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const [liveStatus, setLiveStatus] = useState<"active" | "draft" | "deleted" | null>(null);
  const [liveStock, setLiveStock] = useState<number | null>(null);
  const [isFetchingStatus, setIsFetchingStatus] = useState(true);

  const product = products.find((item) => item.slug === params?.slug) ?? products[0];
  const details = product[language];

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        const dbProduct = data.products?.find((p: any) => p.slug === product.slug);
        if (dbProduct) {
          setLiveStatus(dbProduct.status || "active");
          setLiveStock(dbProduct.stock ?? 0);
        } else {
          setLiveStatus("deleted");
        }
      } catch {
        // Fallback silently
      } finally {
        setIsFetchingStatus(false);
      }
    };
    fetchStatus();
  }, [product.slug]);

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

          {isFetchingStatus ? (
             <div className="rounded-lg bg-gray-50 p-4 text-center text-sm font-semibold text-gray-500">
               {language === "vi" ? "Đang kiểm tra tình trạng kho..." : "Checking availability..."}
             </div>
          ) : liveStatus === "deleted" || liveStatus === "draft" ? (
             <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-center text-sm font-bold text-red-700">
               {language === "vi" ? "Sản phẩm này đã ngừng bán." : "This product is no longer available."}
             </div>
          ) : liveStock !== null && liveStock <= 0 ? (
             <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-center text-sm font-bold text-amber-700">
               {language === "vi" ? "Sản phẩm đang tạm hết hàng." : "Product is temporarily out of stock."}
             </div>
          ) : (
            <>
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
                <svg className="add-cart-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="20" r="1.6"></circle>
                  <circle cx="18" cy="20" r="1.6"></circle>
                  <path d="M3.4 4H5l2.2 11.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 1.9-1.4L21 8H7"></path>
                  <path d="M12 11h4"></path>
                  <path d="M14 9v4"></path>
                </svg>
                {t.add}
              </button>
            </>
          )}

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
                  <FeatureIcon title={title} />
                  <span>{title}</span>
                  <svg className="feature-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={openIndex === index ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"}></path>
                  </svg>
                </button>
                {openIndex === index && <p>{body}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>
      <ProductFeatureShowcase product={product} language={language} />
    </main>
  );
}
