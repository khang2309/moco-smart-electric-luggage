"use client";

import Image from "next/image";
import { useLanguage } from "../providers";

const aboutCopy = {
  vi: {
    title: "ABOUT US",
    brand: "MOCO",
    subtitle:
      "Vali điện thông minh cho những chuyến đi hiện đại và trải nghiệm di chuyển tiện lợi",
    storyTitle: "OUR STORY",
    story:
      "MOCO ra đời từ một câu hỏi đơn giản: tại sao việc mang hành lý lại luôn nặng nề và bất tiện? Chúng tôi nhận thấy việc di chuyển tại sân bay, nhà ga hay\ntrong các chuyến đi xa luôn tốn nhiều sức lực, đặc biệt với hành lý cồng kềnh. Từ đó, MOCO được tạo ra với mục tiêu biến hành lý thành một phương tiện di chuyển thông minh.",
    visionTitle: "OUR VISION",
    vision:
      "Trở thành một trong những giải pháp dẫn đầu trong lĩnh vực hành lý thông minh và di chuyển cá nhân.",
    missionTitle: "OUR MISSION",
    mission:
      "Mang đến trải nghiệm di chuyển hiện đại, tiện lợi và thông minh hơn cho mọi người.",
    teamTitle: "OUR TEAM",
    team:
      "Nhóm sinh viên trường đại học FPT campus Cần Thơ với định hướng phát triển sản phẩm công nghệ ứng dụng thực tiễn.",
  },
  en: {
    title: "ABOUT US",
    brand: "MOCO",
    subtitle:
      "Smart electric luggage for modern journeys and convenient mobility experiences",
    storyTitle: "OUR STORY",
    story:
      "MOCO began with a simple question: why does carrying luggage always feel heavy and inconvenient? We saw that moving through airports, stations, and\nlong trips often consumes too much energy, especially with bulky luggage. MOCO was created to turn luggage into a smart personal mobility solution.",
    visionTitle: "OUR VISION",
    vision: "Become a leading solution in smart luggage and personal mobility.",
    missionTitle: "OUR MISSION",
    mission:
      "Deliver a modern, convenient, and smarter travel experience for everyone.",
    teamTitle: "OUR TEAM",
    team:
      "We are a team of students from FPT University, Can Tho Campus, dedicated to developing innovative technology solutions with practical real-world applications.",
  },
} as const;

export default function AboutPage() {
  const { language } = useLanguage();
  const copy = aboutCopy[language];

  return (
    <main className="about-page">
      <section className="about-team-photo-wrapper">
        <Image
          src="/assets/about-team.png"
          alt={language === "vi" ? "Đội ngũ MOCO" : "MOCO team"}
          width={5120}
          height={1506}
          className="about-team-photo-img"
          priority
        />
      </section>

      <h1 className="about-title-below-photo">{copy.title}</h1>
      <h2 style={{ textAlign: "center", fontSize: "22px", fontWeight: "900", fontFamily: "var(--font-title)", color: "#111827", margin: "10px auto 0" }}>{copy.brand}</h2>
      <p className="about-subtitle-below-photo">{copy.subtitle}</p>

      <section className="about-page-content">
        <article>
          <h2>{copy.storyTitle}</h2>
          <p>{copy.story}</p>
        </article>
        <article>
          <h2>{copy.visionTitle}</h2>
          <p>{copy.vision}</p>
        </article>
        <article>
          <h2>{copy.missionTitle}</h2>
          <p>{copy.mission}</p>
        </article>
        <article>
          <h2>{copy.teamTitle}</h2>
          <p>{copy.team}</p>
        </article>
      </section>
    </main>
  );
}
