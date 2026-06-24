"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useLanguage, type Language } from "./providers";

type IconName =
  | "mobility"
  | "app"
  | "security"
  | "design"
  | "lifestyle"
  | "travel"
  | "business"
  | "student"
  | "tech"
  | "global"
  | "guide"
  | "warranty"
  | "faq"
  | "order"
  | "repair"
  | "manual"
  | "flight";

const pageCopy = {
  vi: {
    hero: {
      subtitle: "SMART ELECTRIC LUGGAGE",
      description: (
        <>
          Vali điện thông minh cho những chuyến đi hiện đại<br />
          và trải nghiệm di chuyển tiện lợi.
        </>
      ),
      primary: "Khám phá sản phẩm",
      secondary: "Đăng ký quan tâm",
    },
    newArrival: {
      badge: "Sản phẩm mới",
      title: "Vali điện cho hành trình hiện đại",
      paragraphs: [
        "MOCO là vali điện thông minh thế hệ mới, được thiết kế để đồng hành cùng những người yêu thích sự tiện lợi, công nghệ và trải nghiệm di chuyển hiện đại.",
        "Không chỉ là một chiếc vali, MOCO kết hợp giữa hành lý, phương tiện di chuyển cá nhân và công nghệ thông minh trong một sản phẩm duy nhất.",
        "Từ sân bay, nhà ga đến các khu du lịch hay đô thị hiện đại, MOCO giúp mỗi hành trình trở nên nhẹ nhàng, linh hoạt và thú vị hơn.",
      ],
    },
    why: {
      kicker: "Smart Travel. Smarter Movement.",
      title: "Vì sao chọn MOCO?",
      description:
        "Công nghệ thông minh - trải nghiệm di chuyển tự do và an tâm hơn trong mọi hành trình hiện đại.",
      benefits: [
        ["mobility", "Di chuyển dễ dàng với hệ thống lái điện thông minh"],
        ["app", "Kết nối ứng dụng theo thời gian thực"],
        ["security", "Theo dõi và bảo vệ hành lý mọi lúc mọi nơi"],
        ["design", "Thiết kế hiện đại, tối ưu cho nhu cầu di chuyển hằng ngày"],
        [
          "lifestyle",
          "Kết hợp hài hòa giữa công nghệ, tiện ích và phong cách sống",
        ],
      ] as [IconName, string][],
    },
    audience: {
      title: "MOCO dành cho ai?",
      description:
        "Dù bạn là ai, MOCO luôn là người bạn đồng hành đáng tin cậy trên mọi hành trình.",
      items: [
        ["travel", "Người thường xuyên\ndi du lịch và khám phá"],
        ["business", "Người đi công tác\nvà di chuyển nhiều"],
        ["student", "Sinh viên và\nngười trẻ năng động"],
        ["tech", "Người yêu thích công nghệ\nvà lifestyle hiện đại"],
        [
          "global",
          "Những ai tìm kiếm giải pháp\nSmart Travel thông minh\nvà khác biệt",
        ],
      ] as [IconName, string][],
    },
    content: {
      highlights: [
        "Di chuyển bằng điện",
        "GPS Tracking",
        "Khóa thông minh",
        "Pin sạc bền bỉ",
      ],
      products: [
        {
          name: "MOCO Go",
          description:
            "Phiên bản tiêu chuẩn với hệ thống lái điện tích hợp cho sân bay, nhà ga và khu du lịch.",
        },
        {
          name: "MOCO Plus",
          description:
            "Tích hợp GPS, Bluetooth và chế độ tự động đi theo người dùng qua ứng dụng.",
        },
        {
          name: "MOCO Pro",
          description:
            "Bổ sung cảm biến tránh vật cản thông minh, an toàn hơn trong môi trường đông người.",
        },
        {
          name: "MOCO Max",
          description:
            "Phiên bản cao cấp nhất với GPS, Bluetooth, app và cảm biến toàn diện.",
        },
      ],
      features: [
        [
          "Smart Mobility System",
          "Cho phép vali tự di chuyển, hỗ trợ người dùng trong quá trình di chuyển.",
        ],
        [
          "Battery & Charging",
          "Pin tích hợp có thể sạc lại và hỗ trợ năng lượng cho thiết bị cá nhân.",
        ],
        [
          "GPS Tracking",
          "Hỗ trợ định vị hành lý, giảm nguy cơ thất lạc trong chuyến đi.",
        ],
        [
          "Smart Security",
          "Hệ thống khóa an toàn bảo vệ hành lý trong mọi tình huống.",
        ],
      ],
      cases: [
        ["Sân bay", "Di chuyển nhanh hơn mà không cần kéo hành lý nặng."],
        ["Du lịch", "Thoải mái hơn trong các chuyến đi dài và lịch trình dày."],
        ["Công tác", "Tiết kiệm thời gian khi di chuyển giữa nhiều địa điểm."],
        [
          "Sinh viên",
          "Hỗ trợ di chuyển hành lý trong ký túc xá và môi trường học tập.",
        ],
      ],
      faqs: [
        [
          "MOCO có nặng không?",
          "MOCO được thiết kế tối ưu trọng lượng để đảm bảo tính tiện dụng.",
        ],
        [
          "Có được mang lên máy bay không?",
          "Tùy theo quy định từng hãng hàng không, MOCO có thể được mang như hành lý cabin.",
        ],
        [
          "Pin sử dụng được bao lâu?",
          "Thời gian sử dụng phụ thuộc vào mức độ vận hành, phù hợp cho các chuyến di chuyển ngắn trong ngày.",
        ],
        [
          "Cách điều khiển như thế nào?",
          "Thiết kế đơn giản, dễ dùng với nút điều khiển cơ bản hoặc tùy chọn kết nối ứng dụng.",
        ],
      ],
    },
    about: {
      eyebrow: "About us",
      title: "Câu chuyện của MOCO",
      story:
        "MOCO ra đời từ một câu hỏi đơn giản: tại sao việc mang hành lý lại luôn nặng nề và bất tiện? Từ đó, nhóm sinh viên FPT Cần Thơ tạo nên một giải pháp biến hành lý thành phương tiện di chuyển thông minh.",
      cards: [
        [
          "Sứ mệnh",
          "Mang đến trải nghiệm di chuyển hiện đại, tiện lợi và thông minh hơn.",
        ],
        [
          "Tầm nhìn",
          "Trở thành giải pháp dẫn đầu về hành lý thông minh và di chuyển cá nhân.",
        ],
        [
          "Đội ngũ",
          "Nhóm sinh viên FPT Cần Thơ phát triển sản phẩm công nghệ ứng dụng thực tiễn.",
        ],
      ],
    },
    product: {
      eyebrow: "Sản phẩm",
      title: "MOCO Smart Electric Luggage",
      description:
        "Vali điện thông minh tích hợp khả năng di chuyển, sạc và định vị, phù hợp cho du lịch, công tác và cuộc sống năng động.",
      badge: "Lựa chọn tốt nhất",
    },
    headings: {
      featuresEyebrow: "Tính năng",
      features: "Công nghệ của MOCO",
      useCasesEyebrow: "Tình huống sử dụng",
      useCases: "MOCO đồng hành ở mọi nơi",
      faqEyebrow: "Hỏi đáp",
      faq: "Câu hỏi thường gặp",
      contactEyebrow: "Liên hệ",
      preorderEyebrow: "Đăng ký trước",
      preorder: "Đăng ký quan tâm MOCO",
    },
    support: {
      kicker: "Hỗ trợ MOCO",
      title: "Trung tâm hỗ trợ MOCO",
      description: "Tìm hướng dẫn, bảo hành và hỗ trợ cho vali điện của bạn.",
      searchPlaceholder: "Tìm theo model, số serial hoặc từ khóa...",
      searchButton: "Tìm kiếm",
      modelHelp: "Không biết model của bạn ở đâu?",
      tabs: [
        ["guide", "Hướng dẫn sử dụng"],
        ["app", "Kết nối app"],
        ["warranty", "Bảo hành"],
        ["faq", "Câu hỏi thường gặp"],
      ] as [IconName, string][],
      needHelp: "Bạn cần hỗ trợ gì?",
      cards: [
        ["order", "Đăng ký sản phẩm", "Kích hoạt bảo hành cho vali MOCO."],
        [
          "repair",
          "Bảo hành & sửa chữa",
          "Kiểm tra tình trạng và gửi yêu cầu hỗ trợ.",
        ],
        [
          "manual",
          "Hướng dẫn sử dụng",
          "Xem cách vận hành, sạc pin và an toàn khi dùng.",
        ],
        [
          "app",
          "Thiết lập MOCO App",
          "Kết nối GPS, theo dõi pin và quản lý thiết bị.",
        ],
        [
          "flight",
          "Chính sách pin & hàng không",
          "Thông tin mang vali điện lên máy bay.",
        ],
        ["faq", "Câu hỏi thường gặp", "Giải đáp các thắc mắc phổ biến."],
      ] as [IconName, string, string][],
      tip: "Mẹo: Hãy chuẩn bị số serial hoặc tên model để được hỗ trợ nhanh hơn.",
      quickInfo: "Thông tin nhanh",
      supportTime: "Thời gian hỗ trợ: 8:00 - 21:00",
      directTitle: "Cần hỗ trợ trực tiếp?",
      directText:
        "Đội ngũ MOCO sẵn sàng hỗ trợ bạn về bảo hành, app và kỹ thuật.",
      contactNow: "Liên hệ ngay",
      chat: "Chat với MOCO",
      topics: [
        ["app", "Sạc và pin"],
        ["warranty", "Khóa & bảo mật"],
        ["faq", "GPS & theo dõi"],
      ] as [IconName, string][],
    },
    contact: {
      title: "Liên hệ MOCO",
      description:
        "Để lại thông tin, đội ngũ MOCO sẽ phản hồi về sản phẩm, bảo hành hoặc hợp tác trong thời gian sớm nhất.",
      name: "Họ và tên *",
      email: "Email *",
      phone: "Số điện thoại *",
      message: "Để lại yêu cầu cần lưu ý *",
      policy: [
        "Dữ liệu cá nhân của bạn sẽ được chúng tôi sử dụng cho các mục đích liên quan đến dịch vụ được yêu cầu.",
        "Chúng tôi sẽ không sử dụng thông tin cá nhân được thu thập cho các mục đích khác ngoài những mục đích này.",
        "Vui lòng tham khảo chính sách quyền riêng tư của chúng tôi để biết thêm thông tin.",
      ],
      submit: "Liên hệ",
      pending: "Đang gửi...",
    },
    preorder: {
      description:
        "MOCO đang trong giai đoạn phát triển. Đăng ký để nhận cập nhật về phiên bản đầu tiên, tiến trình sản phẩm và cơ hội trải nghiệm sớm.",
      namePlaceholder: "Họ và tên",
      button: "Đăng ký quan tâm ngay",
      pending: "Đang đăng ký...",
    },
    footer: {
      title: "VỀ CHÚNG TÔI",
      subtitle:
        "Vali điện thông minh cho những chuyến đi hiện đại và trải nghiệm di chuyển tiện lợi.",
      storyTitle: "CÂU CHUYỆN",
      story: [
        "MOCO ra đời từ một câu hỏi đơn giản: tại sao việc mang hành lý lại luôn nặng nề và bất tiện?",
        "Chúng tôi nhận thấy việc di chuyển tại sân bay, nhà ga hay trong các chuyến đi xa luôn tốn nhiều sức lực, đặc biệt với hành lý cồng kềnh. Từ đó, MOCO được tạo ra với mục tiêu biến hành lý thành một phương tiện di chuyển thông minh.",
      ],
      visionTitle: "TẦM NHÌN",
      vision:
        "Trở thành một trong những giải pháp dẫn đầu trong lĩnh vực hành lý thông minh và di chuyển cá nhân.",
      missionTitle: "SỨ MỆNH",
      mission:
        "Mang đến trải nghiệm di chuyển hiện đại, tiện lợi và thông minh hơn cho mọi người.",
      teamTitle: "ĐỘI NGŨ",
      team: "Nhóm sinh viên FPT Cần Thơ với định hướng phát triển sản phẩm công nghệ ứng dụng thực tiễn.",
    },
    formThanks: "Cảm ơn bạn. MOCO sẽ liên hệ lại sớm nhất.",
  },
  en: {
    hero: {
      subtitle: "SMART ELECTRIC LUGGAGE",
      description: (
        <>
          Smart electric luggage for modern trips<br />
          and a more convenient travel experience.
        </>
      ),
      primary: "Explore product",
      secondary: "Register interest",
    },
    newArrival: {
      badge: "New arrival",
      title: "Electric luggage for modern journeys",
      paragraphs: [
        "MOCO is a next-generation smart electric suitcase designed for people who value convenience, technology, and modern mobility.",
        "More than luggage, MOCO combines a suitcase, a personal mobility device, and smart technology in one product.",
        "From airports and train stations to travel destinations and modern cities, MOCO makes every journey lighter, more flexible, and more enjoyable.",
      ],
    },
    why: {
      kicker: "Smart Travel. Smarter Movement.",
      title: "Why choose MOCO?",
      description:
        "Smart technology for freer, calmer, and more confident movement on every modern journey.",
      benefits: [
        ["mobility", "Move easily with an intelligent electric driving system"],
        ["app", "Connect to the app in real time"],
        ["security", "Track and protect your luggage wherever you go"],
        ["design", "Modern design optimized for daily mobility needs"],
        ["lifestyle", "A balanced blend of technology, utility, and lifestyle"],
      ] as [IconName, string][],
    },
    audience: {
      title: "Who is MOCO for?",
      description:
        "Whoever you are, MOCO is a reliable travel companion for every journey.",
      items: [
        ["travel", "Frequent travelers\nand explorers"],
        ["business", "Business travelers\nwho move often"],
        ["student", "Students and\nyoung active users"],
        ["tech", "Technology lovers\nwith a modern lifestyle"],
        [
          "global",
          "People looking for\na smarter and distinctive\nSmart Travel solution",
        ],
      ] as [IconName, string][],
    },
    content: {
      highlights: [
        "Electric mobility",
        "GPS Tracking",
        "Smart lock",
        "Durable rechargeable battery",
      ],
      products: [
        {
          name: "MOCO Go",
          description:
            "The standard edition with integrated electric driving for airports, stations, and travel areas.",
        },
        {
          name: "MOCO Plus",
          description:
            "Adds GPS, Bluetooth, and automatic follow mode through the mobile app.",
        },
        {
          name: "MOCO Pro",
          description:
            "Adds intelligent obstacle avoidance sensors for safer movement in crowded spaces.",
        },
        {
          name: "MOCO Max",
          description:
            "The premium edition with GPS, Bluetooth, app control, and complete sensing.",
        },
      ],
      features: [
        [
          "Smart Mobility System",
          "Allows the suitcase to move electrically and support users during travel.",
        ],
        [
          "Battery & Charging",
          "Integrated rechargeable battery that can also support personal devices.",
        ],
        [
          "GPS Tracking",
          "Helps locate luggage and reduce the risk of losing it during trips.",
        ],
        [
          "Smart Security",
          "A secure lock system that protects your belongings in different situations.",
        ],
      ],
      cases: [
        ["Airport", "Move faster without pulling heavy luggage."],
        ["Travel", "Stay comfortable on long trips and packed schedules."],
        ["Business", "Save time while moving between multiple locations."],
        [
          "Students",
          "Support luggage movement in dorms and learning environments.",
        ],
      ],
      faqs: [
        [
          "Is MOCO heavy?",
          "MOCO is designed with optimized weight to remain practical and easy to use.",
        ],
        [
          "Can I bring it on a plane?",
          "Depending on airline rules, MOCO can be treated like cabin luggage.",
        ],
        [
          "How long does the battery last?",
          "Battery life depends on usage level and is suitable for short daily movements.",
        ],
        [
          "How do I control it?",
          "MOCO is simple to use with basic controls and optional app connectivity.",
        ],
      ],
    },
    about: {
      eyebrow: "About us",
      title: "The MOCO story",
      story:
        "MOCO started from a simple question: why does carrying luggage always feel heavy and inconvenient? From there, a team of FPT Can Tho students built a solution that turns luggage into a smart mobility companion.",
      cards: [
        [
          "Mission",
          "Deliver a smarter, more convenient, and more modern travel experience.",
        ],
        [
          "Vision",
          "Become a leading solution for smart luggage and personal mobility.",
        ],
        [
          "Team",
          "A group of FPT Can Tho students building practical technology products.",
        ],
      ],
    },
    product: {
      eyebrow: "Product",
      title: "MOCO Smart Electric Luggage",
      description:
        "Smart electric luggage with mobility, charging, and tracking features for travel, business, and active living.",
      badge: "Best choice",
    },
    headings: {
      featuresEyebrow: "Features",
      features: "MOCO technology",
      useCasesEyebrow: "Use cases",
      useCases: "MOCO goes everywhere with you",
      faqEyebrow: "FAQ",
      faq: "Frequently asked questions",
      contactEyebrow: "Contact",
      preorderEyebrow: "Pre-order",
      preorder: "Register your interest in MOCO",
    },
    support: {
      kicker: "MOCO Support",
      title: "MOCO Support Center",
      description:
        "Find guides, warranty information, and support for your electric luggage.",
      searchPlaceholder: "Search by model, serial number, or keyword...",
      searchButton: "Search",
      modelHelp: "Not sure where your model number is?",
      tabs: [
        ["guide", "User guide"],
        ["app", "App connection"],
        ["warranty", "Warranty"],
        ["faq", "FAQ"],
      ] as [IconName, string][],
      needHelp: "What do you need help with?",
      cards: [
        [
          "order",
          "Product registration",
          "Activate warranty for your MOCO suitcase.",
        ],
        [
          "repair",
          "Warranty & repair",
          "Check status and send a support request.",
        ],
        ["manual", "User guide", "Learn operation, charging, and safe usage."],
        [
          "app",
          "Set up MOCO App",
          "Connect GPS, track battery, and manage the device.",
        ],
        [
          "flight",
          "Battery & airline policy",
          "Information about bringing electric luggage on flights.",
        ],
        ["faq", "FAQ", "Answers to common questions."],
      ] as [IconName, string, string][],
      tip: "Tip: Prepare your serial number or model name for faster support.",
      quickInfo: "Quick information",
      supportTime: "Support hours: 8:00 - 21:00",
      directTitle: "Need direct support?",
      directText:
        "The MOCO team is ready to help with warranty, app, and technical questions.",
      contactNow: "Contact now",
      chat: "Chat with MOCO",
      topics: [
        ["app", "Charging & battery"],
        ["warranty", "Lock & security"],
        ["faq", "GPS & tracking"],
      ] as [IconName, string][],
    },
    contact: {
      title: "Contact MOCO",
      description:
        "Leave your information and the MOCO team will respond about products, warranty, or collaboration soon.",
      name: "Full name *",
      email: "Email *",
      phone: "Phone number *",
      message: "Your request *",
      policy: [
        "Your personal data will be used for purposes related to the requested service.",
        "We will not use collected personal information for other unrelated purposes.",
        "Please refer to our privacy policy for more information.",
      ],
      submit: "Contact",
      pending: "Sending...",
    },
    preorder: {
      description:
        "MOCO is currently in development. Register to receive updates about the first version, product progress, and early experience opportunities.",
      namePlaceholder: "Full name",
      button: "Register interest now",
      pending: "Registering...",
    },
    footer: {
      title: "ABOUT US",
      subtitle:
        "Smart electric luggage for modern trips and a convenient mobility experience.",
      storyTitle: "OUR STORY",
      story: [
        "MOCO was born from a simple question: why does carrying luggage always feel heavy and inconvenient?",
        "We saw that moving through airports, stations, and long trips often takes unnecessary effort, especially with bulky luggage. MOCO was created to turn luggage into a smart mobility solution.",
      ],
      visionTitle: "OUR VISION",
      vision:
        "Become one of the leading solutions in smart luggage and personal mobility.",
      missionTitle: "OUR MISSION",
      mission:
        "Deliver a modern, convenient, and smarter travel experience for everyone.",
      teamTitle: "OUR TEAM",
      team: "A team of FPT Can Tho students focused on practical technology products.",
    },
    formThanks: "Thank you. MOCO will contact you soon.",
  },
} as const;

const fixedViCopy = {
  ...pageCopy.vi,
  hero: {
    subtitle: "SMART ELECTRIC LUGGAGE",
    description: (
      <>
        Vali điện thông minh cho những chuyến đi hiện đại<br />
        và trải nghiệm di chuyển tiện lợi.
      </>
    ),
    primary: "Khám phá sản phẩm",
    secondary: "Đăng ký quan tâm",
  },
  newArrival: {
    badge: "Sản phẩm mới",
    title: "Vali điện cho hành trình hiện đại",
    paragraphs: [
      "MOCO là vali điện thông minh thế hệ mới, được thiết kế để đồng hành cùng những người yêu thích sự tiện lợi, công nghệ và trải nghiệm di chuyển hiện đại.",
      "Không chỉ là một chiếc vali, MOCO kết hợp giữa hành lý, phương tiện di chuyển cá nhân và công nghệ thông minh trong một sản phẩm duy nhất.",
      "Từ sân bay, nhà ga đến các khu du lịch hay đô thị hiện đại, MOCO giúp mỗi hành trình trở nên nhẹ nhàng, linh hoạt và thú vị hơn.",
    ],
  },
  why: {
    kicker: "Smart Travel. Smarter Movement.",
    title: "Vì sao chọn MOCO?",
    description:
      "Công nghệ thông minh - trải nghiệm di chuyển tự do và an tâm hơn trong mọi hành trình hiện đại.",
    benefits: [
      ["mobility", "Di chuyển dễ dàng với hệ thống lái điện thông minh"],
      ["app", "Kết nối ứng dụng theo thời gian thực"],
      ["security", "Theo dõi và bảo vệ hành lý mọi lúc mọi nơi"],
      ["design", "Thiết kế hiện đại, tối ưu cho nhu cầu di chuyển hằng ngày"],
      [
        "lifestyle",
        "Kết hợp hài hòa giữa công nghệ, tiện ích và phong cách sống",
      ],
    ] as [IconName, string][],
  },
  audience: {
    title: "MOCO dành cho ai?",
    description:
      "Dù bạn là ai, MOCO luôn là người bạn đồng hành đáng tin cậy trên mọi hành trình.",
    items: [
      ["travel", "Người thường xuyên\ndi du lịch và khám phá"],
      ["business", "Người đi công tác\nvà di chuyển nhiều"],
      ["student", "Sinh viên và\nngười trẻ năng động"],
      ["tech", "Người yêu thích công nghệ\nvà lifestyle hiện đại"],
      [
        "global",
        "Những ai tìm kiếm giải pháp\nSmart Travel thông minh\nvà khác biệt",
      ],
    ] as [IconName, string][],
  },
  content: {
    highlights: [
      "Di chuyển bằng điện",
      "GPS Tracking",
      "Khóa thông minh",
      "Pin sạc bền bỉ",
    ],
    products: [
      {
        name: "MOCO Go",
        description:
          "Phiên bản tiêu chuẩn với hệ thống lái điện tích hợp cho sân bay, nhà ga và khu du lịch.",
      },
      {
        name: "MOCO Plus",
        description:
          "Tích hợp GPS, Bluetooth và chế độ tự động đi theo người dùng qua ứng dụng.",
      },
      {
        name: "MOCO Pro",
        description:
          "Bổ sung cảm biến tránh vật cản thông minh, an toàn hơn trong môi trường đông người.",
      },
      {
        name: "MOCO Max",
        description:
          "Phiên bản cao cấp nhất với GPS, Bluetooth, app và cảm biến toàn diện.",
      },
    ],
    features: [
      [
        "Hệ thống lái điện thông minh",
        "Vali hỗ trợ di chuyển chủ động, giảm sức kéo và phù hợp với sân bay, nhà ga, khu du lịch.",
      ],
      [
        "Pin và sạc tiện lợi",
        "Pin tích hợp có thể sạc lại, hỗ trợ năng lượng cho thiết bị cá nhân trong hành trình.",
      ],
      [
        "GPS Tracking",
        "Theo dõi vị trí hành lý, giảm rủi ro thất lạc trong các chuyến đi.",
      ],
      [
        "Bảo mật thông minh",
        "Khóa an toàn giúp bảo vệ hành lý trong nhiều tình huống di chuyển.",
      ],
    ],
    cases: [
      ["Sân bay", "Di chuyển nhanh hơn mà không cần kéo hành lý nặng."],
      ["Du lịch", "Thoải mái hơn trong các chuyến đi dài và lịch trình dày."],
      ["Công tác", "Tiết kiệm thời gian khi di chuyển giữa nhiều địa điểm."],
      [
        "Sinh viên",
        "Hỗ trợ di chuyển hành lý trong ký túc xá và môi trường học tập.",
      ],
    ],
    faqs: [
      [
        "MOCO có nặng không?",
        "MOCO được thiết kế tối ưu trọng lượng để đảm bảo tính tiện dụng.",
      ],
      [
        "Có được mang lên máy bay không?",
        "Tùy theo quy định từng hãng hàng không, MOCO có thể được mang như hành lý cabin.",
      ],
      [
        "Pin sử dụng được bao lâu?",
        "Thời gian sử dụng phụ thuộc vào mức độ vận hành, phù hợp cho các chuyến di chuyển ngắn trong ngày.",
      ],
      [
        "Cách điều khiển như thế nào?",
        "Thiết kế đơn giản, dễ dùng với nút điều khiển cơ bản hoặc tùy chọn kết nối ứng dụng.",
      ],
    ],
  },
  headings: {
    featuresEyebrow: "Tính năng",
    features: "Công nghệ của MOCO",
    useCasesEyebrow: "Tình huống sử dụng",
    useCases: "MOCO đồng hành ở mọi nơi",
    faqEyebrow: "Hỏi đáp",
    faq: "Câu hỏi thường gặp",
    contactEyebrow: "Liên hệ",
    preorderEyebrow: "Đăng ký trước",
    preorder: "Đăng ký quan tâm MOCO",
  },
  support: {
    ...pageCopy.vi.support,
    kicker: "Hỗ trợ MOCO",
    title: "Trung tâm hỗ trợ MOCO",
    description: "Tìm hướng dẫn, bảo hành và hỗ trợ cho vali điện của bạn.",
    searchPlaceholder: "Tìm theo model, số serial hoặc từ khóa...",
    searchButton: "Tìm kiếm",
    modelHelp: "Không biết model của bạn ở đâu?",
    needHelp: "Bạn cần hỗ trợ gì?",
    quickInfo: "Thông tin nhanh",
    supportTime: "Thời gian hỗ trợ: 8:00 - 21:00",
    tabs: [
      ["guide", "Hướng dẫn sử dụng"],
      ["app", "Kết nối app"],
      ["warranty", "Bảo hành"],
      ["faq", "Câu hỏi thường gặp"],
    ] as [IconName, string][],
    cards: [
      ["order", "Đăng ký sản phẩm", "Kích hoạt bảo hành cho vali MOCO."],
      [
        "repair",
        "Bảo hành & sửa chữa",
        "Kiểm tra tình trạng và gửi yêu cầu hỗ trợ.",
      ],
      [
        "manual",
        "Hướng dẫn sử dụng",
        "Xem cách vận hành, sạc pin và an toàn khi dùng.",
      ],
      [
        "app",
        "Thiết lập MOCO App",
        "Kết nối GPS, theo dõi pin và quản lý thiết bị.",
      ],
      [
        "flight",
        "Chính sách pin & hàng không",
        "Thông tin mang vali điện lên máy bay.",
      ],
      ["faq", "Câu hỏi thường gặp", "Giải đáp các thắc mắc phổ biến."],
    ] as [IconName, string, string][],
    tip: "Mẹo: Hãy chuẩn bị số serial hoặc tên model để được hỗ trợ nhanh hơn.",
    directTitle: "Cần hỗ trợ trực tiếp?",
    directText:
      "Đội ngũ MOCO sẵn sàng hỗ trợ bạn về bảo hành, app và kỹ thuật.",
    contactNow: "Liên hệ ngay",
    chat: "Chat với MOCO",
    topics: [
      ["app", "Sạc và pin"],
      ["warranty", "Khóa & bảo mật"],
      ["faq", "GPS & theo dõi"],
    ] as [IconName, string][],
  },
  contact: {
    title: "Liên hệ MOCO",
    description:
      "Để lại thông tin, đội ngũ MOCO sẽ phản hồi về sản phẩm, bảo hành hoặc hợp tác trong thời gian sớm nhất.",
    name: "Họ và tên *",
    email: "Email *",
    phone: "Số điện thoại *",
    message: "Để lại yêu cầu cần lưu ý *",
    policy: [
      "Dữ liệu cá nhân của bạn sẽ được chúng tôi sử dụng cho các mục đích liên quan đến dịch vụ được yêu cầu.",
      "Chúng tôi sẽ không sử dụng thông tin cá nhân được thu thập cho các mục đích khác ngoài những mục đích này.",
      "Vui lòng tham khảo chính sách quyền riêng tư của chúng tôi để biết thêm thông tin.",
    ],
    submit: "Liên hệ",
    pending: "Đang gửi...",
  },
  preorder: {
    description:
      "MOCO đang trong giai đoạn phát triển. Đăng ký để nhận cập nhật về phiên bản đầu tiên, tiến trình sản phẩm và cơ hội trải nghiệm sớm.",
    namePlaceholder: "Họ và tên",
    button: "Đăng ký quan tâm ngay",
    pending: "Đang đăng ký...",
  },
  footer: {
    ...pageCopy.vi.footer,
    subtitle:
      "Vali điện thông minh cho những chuyến đi hiện đại và trải nghiệm di chuyển tiện lợi.",
  },
  formThanks: "Cảm ơn bạn. MOCO sẽ liên hệ lại sớm nhất.",
};

const localizedCopy = {
  ...pageCopy,
  vi: fixedViCopy,
} as const;

async function getMocoContent(language: Language) {
  return localizedCopy[language].content;
}

async function submitLead(language: Language) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return localizedCopy[language].formThanks;
}

function SimpleIcon({ type }: { type: IconName }) {
  const commonProps = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (["mobility", "travel", "flight"].includes(type)) {
    return (
      <svg {...commonProps} aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4v5.5" />
        <path d="m5.2 15.8 4.8-2.8" />
        <path d="m18.8 15.8-4.8-2.8" />
      </svg>
    );
  }

  if (["app", "manual", "guide"].includes(type)) {
    return (
      <svg {...commonProps} aria-hidden="true">
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <path d="M10 7h4" />
        <path d="M12 17.5h.01" />
      </svg>
    );
  }

  if (["security", "warranty", "repair"].includes(type)) {
    return (
      <svg {...commonProps} aria-hidden="true">
        <path d="M12 3.2 19 6v5.2c0 4.5-2.8 7.9-7 9.6-4.2-1.7-7-5.1-7-9.6V6l7-2.8Z" />
        <path d="m9.5 12 1.8 1.8 3.5-4" />
      </svg>
    );
  }

  if (["business", "order"].includes(type)) {
    return (
      <svg {...commonProps} aria-hidden="true">
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <path d="M8.4 7V5.2A2.2 2.2 0 0 1 10.6 3h2.8a2.2 2.2 0 0 1 2.2 2.2V7" />
        <path d="M3 12h18" />
      </svg>
    );
  }

  if (type === "student") {
    return (
      <svg {...commonProps} aria-hidden="true">
        <path d="M3 8.2 12 4l9 4.2-9 4.2-9-4.2Z" />
        <path d="M7 10.2v4.1c1.7 1.5 3.4 2.2 5 2.2s3.3-.7 5-2.2v-4.1" />
      </svg>
    );
  }

  if (type === "tech") {
    return (
      <svg {...commonProps} aria-hidden="true">
        <rect x="7" y="7" width="10" height="10" rx="1.5" />
        <path d="M9.5 3v4" />
        <path d="M14.5 3v4" />
        <path d="M3 9.5h4" />
        <path d="M17 14.5h4" />
      </svg>
    );
  }

  if (type === "global") {
    return (
      <svg {...commonProps} aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17" />
        <path d="M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5s-1.1 6.2-3.3 8.5" />
        <path d="M12 3.5C9.8 5.8 8.7 8.6 8.7 12s1.1 6.2 3.3 8.5" />
      </svg>
    );
  }

  return (
    <svg {...commonProps} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.7 9.6a2.4 2.4 0 0 1 4.6.9c0 1.8-2.3 2-2.3 3.7" />
      <path d="M12 17.5h.01" />
    </svg>
  );
}

function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, index) => (
        <span key={`${line}-${index}`}>
          {line}
          {index < text.split("\n").length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

export default function Home() {
  const { language } = useLanguage();
  const text = localizedCopy[language];
  const { data } = useQuery({
    queryKey: ["moco-content", language],
    queryFn: () => getMocoContent(language),
    initialData: text.content,
  });
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const leadMutation = useMutation({ mutationFn: () => submitLead(language) });
  const activeHomeProduct =
    data.products[activeProductIndex % data.products.length];
  const getProductSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, "-");

  const getHomeProductOffset = (index: number) => {
    const rawOffset = index - activeProductIndex;
    const half = data.products.length / 2;

    if (rawOffset > half) return rawOffset - data.products.length;
    if (rawOffset < -half) return rawOffset + data.products.length;

    return rawOffset;
  };

  const moveHomeProduct = (direction: "next" | "previous") => {
    setActiveProductIndex((current) => {
      if (direction === "next") {
        return (current + 1) % data.products.length;
      }

      return (current - 1 + data.products.length) % data.products.length;
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

      window.localStorage.setItem(
        "moco-favorites",
        JSON.stringify(nextFavorites),
      );
      return nextFavorites;
    });
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    leadMutation.mutate();
    event.currentTarget.reset();
  }

  return (
    <>
      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <h1 className="hero-title-main">MOCO</h1>
            <h2 className="hero-subtitle">{text.hero.subtitle}</h2>
            <div className="hero-divider"></div>
            <p className="hero-description">{text.hero.description}</p>
            <div className="hero-actions">
              <a className="button primary glow" href="#product">
                {text.hero.primary}
              </a>
              <a className="button white glow-light" href="#preorder">
                {text.hero.secondary}
              </a>
            </div>
          </div>
        </section>

        <section className="new-arrival" id="new-arrival">
          <div className="new-arrival-content">
            <span className="badge-outline">{text.newArrival.badge}</span>
            <h2 className="new-arrival-title">{text.newArrival.title}</h2>
            <div className="new-arrival-text">
              {text.newArrival.paragraphs.map((paragraph, index) => (
                <p
                  className={index === 0 ? "highlight-text" : ""}
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section
          className="home-showcase"
          aria-labelledby="home-showcase-title"
        >
          <div className="home-showcase-panel">
            <div className="home-showcase-copy">
              <p className="home-showcase-kicker">{text.why.kicker}</p>
              <h2 id="home-showcase-title">{text.why.title}</h2>
              <p>{text.why.description}</p>
              <div className="home-benefit-list">
                {text.why.benefits.map(([icon, label]) => (
                  <article key={label}>
                    <span className="benefit-icon">
                      <SimpleIcon type={icon} />
                    </span>
                    <p>{label}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className="home-audience"
          aria-labelledby="home-audience-title"
        >
          <div className="home-audience-heading">
            <h2 id="home-audience-title">{text.audience.title}</h2>
            <p>{text.audience.description}</p>
          </div>
          <div className="home-audience-grid">
            {text.audience.items.map(([icon, label]) => (
              <article key={label}>
                <span className="audience-icon">
                  <SimpleIcon type={icon} />
                </span>
                <p>
                  <Lines text={label} />
                </p>
              </article>
            ))}
          </div>
        </section>

        <div className="feature-strip-container">
          <div
            className="feature-strip"
            aria-label={language === "vi" ? "Điểm nổi bật" : "Highlights"}
          >
            {data.highlights.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <section
          className="product-carousel-stage home-product-stage-copy"
          id="product"
          aria-label="MOCO product carousel"
        >
          <div className="product-stage-vignette" aria-hidden="true" />

          <button
            className="product-arrow product-arrow-left"
            type="button"
            aria-label={
              language === "vi"
                ? "S\u1ea3n ph\u1ea9m tr\u01b0\u1edbc"
                : "Previous product"
            }
            onClick={() => moveHomeProduct("previous")}
          >
            <span />
          </button>
          <button
            className="product-arrow product-arrow-right"
            type="button"
            aria-label={
              language === "vi"
                ? "S\u1ea3n ph\u1ea9m ti\u1ebfp theo"
                : "Next product"
            }
            onClick={() => moveHomeProduct("next")}
          >
            <span />
          </button>

          <div className="product-option-label">
            option {activeProductIndex + 1}
          </div>

          <div className="product-wheel" aria-live="polite">
            {data.products.map((product, index) => {
              const offset = getHomeProductOffset(index);
              const isActive = offset === 0;
              const productSlug = getProductSlug(product.name);

              return (
                <div
                  className="product-card-shell"
                  data-position={offset}
                  key={product.name}
                >
                  <button
                    className="product-3d-card"
                    type="button"
                    style={{ position: "absolute" }}
                    aria-label={product.name}
                    aria-current={isActive}
                    onClick={() => {
                      if (isActive) {
                        window.location.href = `/product/${productSlug}`;
                        return;
                      }

                      setActiveProductIndex(index);
                    }}
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
                    className={`product-favorite-button${favoriteProducts.includes(productSlug) ? " active" : ""}`}
                    type="button"
                    aria-label={
                      language === "vi"
                        ? "Th\u00eam v\u00e0o y\u00eau th\u00edch"
                        : "Add to favorites"
                    }
                    onClick={() => toggleFavoriteProduct(productSlug)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={
                        favoriteProducts.includes(productSlug)
                          ? "currentColor"
                          : "none"
                      }
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="product-carousel-copy">
            <p>{activeHomeProduct.description}</p>
            <Link
              href={`/product/${getProductSlug(activeHomeProduct.name)}`}
              className="product-stage-title"
            >
              {activeHomeProduct.name}
            </Link>
            <span>
              {language === "vi"
                ? "B\u1ea5m v\u00e0o t\u00ean s\u1ea3n ph\u1ea9m \u0111\u1ec3 xem th\u00f4ng tin v\u00e0 mua h\u00e0ng"
                : "Click the product name to view details and purchase"}
            </span>
          </div>
        </section>

        <section
          className="section product home-product-showcase home-product-legacy"
          aria-hidden="true"
        >
          <div className="home-product-visual" style={{ position: "relative" }}>
            <Image
              src="/assets/product-carousel.png"
              alt="MOCO Smart Electric Luggage"
              fill
              sizes="(max-width: 920px) 100vw, 48vw"
            />
          </div>
          <div className="home-product-content">
            <div className="section-heading">
              <p className="eyebrow">{text.product.eyebrow}</p>
              <h2>{text.product.title}</h2>
              <p>{text.product.description}</p>
            </div>
            <Link className="home-product-link" href="/product">
              {language === "vi"
                ? "Xem bộ sưu tập sản phẩm"
                : "View product collection"}
            </Link>
            <div className="product-layout">
              {data.products.map((product) => {
                const productSlug = product.name
                  .toLowerCase()
                  .replace(/\s+/g, "-");

                return (
                  <Link
                    href={`/product/${productSlug}`}
                    key={product.name}
                    className="product-card"
                  >
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section features" id="features">
          <div className="section-heading">
            <p className="eyebrow">{text.headings.featuresEyebrow}</p>
            <h2>{text.headings.features}</h2>
          </div>
          <div className="features-showcase">
            <div
              className="feature-visual feature-visual-large"
              style={{ position: "relative" }}
            >
              <Image
                src="/assets/moco-ui-reference.png"
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 36vw"
              />
            </div>
            <div
              className="feature-visual feature-visual-stack"
              style={{ position: "relative" }}
            >
              <Image
                src="/assets/product-carousel.png"
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 28vw"
              />
            </div>
            <div className="feature-example">
              <span>{language === "vi" ? "ví dụ" : "example"}</span>
              <div className="feature-mini-list">
                {data.features.map(([title, description], index) => (
                  <article key={title}>
                    <strong>
                      {String(index + 1).padStart(2, "0")} / {title}
                    </strong>
                    <p>{description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className="support-center"
          id="support"
          aria-labelledby="support-title"
        >
          <div className="support-hero">
            <div className="support-copy">
              <p className="support-kicker">{text.support.kicker}</p>
              <h2 id="support-title">{text.support.title}</h2>
              <p>{text.support.description}</p>
              <form className="support-search" role="search">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  placeholder={text.support.searchPlaceholder}
                />
                <button type="submit">{text.support.searchButton}</button>
              </form>
              <a className="support-model-link" href="#contact">
                {text.support.modelHelp}
              </a>
            </div>
            <div className="support-visual" aria-hidden="true">
              <div className="support-suitcase"></div>
            </div>
          </div>

          <div
            className="support-tabs"
            aria-label={
              language === "vi" ? "Lối tắt hỗ trợ" : "Support shortcuts"
            }
          >
            {text.support.tabs.map(([icon, label]) => (
              <a href="#features" key={label}>
                <SimpleIcon type={icon} />
                {label}
              </a>
            ))}
          </div>

          <div className="support-layout">
            <div className="support-main">
              <h3>{text.support.needHelp}</h3>
              <div className="support-card-grid">
                {text.support.cards.map(([icon, title, description]) => (
                  <a href="#contact" key={title}>
                    <SimpleIcon type={icon} />
                    <span>
                      <strong>{title}</strong>
                      {description}
                    </span>
                  </a>
                ))}
              </div>
              <p className="support-tip">{text.support.tip}</p>
            </div>

            <aside className="support-side">
              <h3>{text.support.quickInfo}</h3>
              <p>{text.support.supportTime}</p>
              <p>
                {language === "vi" ? "Đường dây nóng" : "Hotline"}: 1900 6868
              </p>
              <p>
                {language === "vi" ? "Email hỗ trợ" : "Support email"}:
                support@moco.vn
              </p>
              <div className="direct-support">
                <strong>{text.support.directTitle}</strong>
                <span>{text.support.directText}</span>
                <a className="support-contact-button" href="#contact">
                  {text.support.contactNow}
                </a>
                <a className="support-chat-button" href="#contact">
                  {text.support.chat}
                </a>
              </div>
            </aside>
          </div>

          <div className="support-topics">
            {text.support.topics.map(([icon, label]) => (
              <a href="#features" key={label}>
                <SimpleIcon type={icon} />
                {label}
              </a>
            ))}
          </div>
        </section>

        <section className="section faq" id="faq">
          <div className="section-heading">
            <p className="eyebrow">{text.headings.faqEyebrow}</p>
            <h2>{text.headings.faq}</h2>
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

        <section
          className="contact-page"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="contact-shell">
            <div className="contact-intro">
              <p className="support-kicker">{text.headings.contactEyebrow}</p>
              <h2 id="contact-title">{text.contact.title}</h2>
              <p>{text.contact.description}</p>
            </div>
            <form className="contact-form" onSubmit={handleSubmit}>
              <label>
                {text.contact.name}
                <input type="text" name="name" required />
              </label>
              <label>
                {text.contact.email}
                <input type="email" name="email" required />
              </label>
              <label>
                {text.contact.phone}
                <input type="tel" name="phone" required />
              </label>
              <label>
                {text.contact.message}
                <textarea name="message" required />
              </label>
              <div className="contact-policy">
                {text.contact.policy.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <button className="contact-submit" type="submit">
                {leadMutation.isPending
                  ? text.contact.pending
                  : text.contact.submit}
              </button>
              <p className="form-note" aria-live="polite">
                {leadMutation.data}
              </p>
            </form>
          </div>
        </section>

        <section className="section preorder" id="preorder">
          <div>
            <p className="eyebrow">{text.headings.preorderEyebrow}</p>
            <h2>{text.headings.preorder}</h2>
            <p>{text.preorder.description}</p>
          </div>
          <form className="form compact" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder={text.preorder.namePlaceholder}
              required
            />
            <input
              type="email"
              name="email"
              placeholder={text.contact.email.replace(" *", "")}
              required
            />
            <button className="button primary" type="submit">
              {leadMutation.isPending
                ? text.preorder.pending
                : text.preorder.button}
            </button>
            <p className="form-note" aria-live="polite">
              {leadMutation.data}
            </p>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <section>
            <h2>MOCO</h2>
            <p>{text.footer.subtitle}</p>
          </section>
          <section>
            <h2>{language === "vi" ? "Kh\u00e1m ph\u00e1" : "Explore"}</h2>
            <a href="/about">About Us</a>
            <a href="/#product">
              {language === "vi" ? "S\u1ea3n ph\u1ea9m" : "Products"}
            </a>
            <a href="/#features">
              {language === "vi" ? "T\u00ednh n\u0103ng" : "Features"}
            </a>
          </section>
          <section>
            <h2>{language === "vi" ? "Li\u00ean h\u1ec7" : "Contact"}</h2>
            <p>mocoluggage@gmail.com</p>
            <p>Can Tho, Vietnam</p>
            <a href="/#support">Support Center</a>
            <a href="/#contact">Contact</a>
            <a href="/login">Account</a>
          </section>
        </div>
        <div className="footer-bottom">
          <span>© 2026 MOCO</span>
          <span>Smart Electric Luggage</span>
        </div>
      </footer>
    </>
  );
}
