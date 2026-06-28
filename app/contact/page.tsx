import type { Metadata } from "next";
import ContactPageContent from "./ContactPageContent";

export const metadata: Metadata = {
  title: "Liên hệ MOCO | Đăng ký tư vấn",
  description:
    "Liên hệ MOCO để nhận tư vấn sản phẩm, đăng ký nhận tin hoặc gửi yêu cầu hỗ trợ.",
};

export default function ContactPage() {
  return (
    <main className="moco-page">
      <ContactPageContent />
    </main>
  );
}
