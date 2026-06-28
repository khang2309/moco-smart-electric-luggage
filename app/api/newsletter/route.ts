import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const company = {
  name: "MOCO",
  hotline: "mocoluggage@gmail.com",
  email: "mocoluggage@gmail.com",
  website: "https://moco-smart-electric-luggage.vercel.app",
};

export async function POST(request: Request) {
  try {
    const { email, name, type } = await request.json();
    const emailUser = process.env.EMAIL_USER || company.email;
    const emailPass = process.env.EMAIL_PASS;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Thiếu email đăng ký." },
        { status: 400 },
      );
    }

    if (!emailPass) {
      return NextResponse.json(
        { success: false, error: "Chưa cấu hình EMAIL_PASS trong file .env.local." },
        { status: 500 },
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const displayName = name || "Quý Khách";
    const subject =
      type === "interest"
        ? "MOCO đã ghi nhận đăng ký quan tâm của Quý Khách"
        : "MOCO đã ghi nhận đăng ký nhận tin của Quý Khách";

    await transporter.sendMail({
      from: `"MOCO Customer Care" <${emailUser}>`,
      sender: emailUser,
      replyTo: company.email,
      to: email,
      subject,
      text: [
        `Kính gửi ${displayName},`,
        "",
        `Cảm ơn Quý Khách đã đăng ký nhận thông tin từ ${company.name}.`,
        "",
        "Chúng tôi đã ghi nhận đăng ký của Quý Khách thành công. Trong thời gian tới, Quý Khách sẽ nhận được các thông tin mới nhất về:",
        "- Chương trình khuyến mãi và ưu đãi hấp dẫn.",
        "- Sản phẩm, dịch vụ mới.",
        "- Tin tức, sự kiện và các hoạt động nổi bật của công ty.",
        "- Những nội dung hữu ích và cập nhật dành riêng cho khách hàng.",
        "",
        "Chúng tôi cam kết bảo mật thông tin cá nhân của Quý Khách và chỉ gửi những nội dung có giá trị.",
        "",
        `Trân trọng,`,
        company.name,
        `Hotline: ${company.hotline}`,
        `Email: ${company.email}`,
        `Website: ${company.website}`,
      ].join("\n"),
      html: `
        <div style="margin:0;padding:0;background:#f5f8fc;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f8fc;padding:28px 12px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e3ebf5;box-shadow:0 24px 70px rgba(17,24,39,.10);font-family:'Be Vietnam Pro','Segoe UI',system-ui,-apple-system,sans-serif;color:#172033;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#1681f5,#52d3c7);padding:30px 34px;color:#ffffff;">
                      <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">${company.name} Newsletter</p>
                      <h1 style="margin:0;font-size:28px;line-height:1.2;">Đăng ký thành công</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px 34px 10px;line-height:1.7;font-size:15px;">
                      <p style="margin:0 0 16px;"><strong>Kính gửi ${displayName},</strong></p>
                      <p style="margin:0 0 16px;">Cảm ơn Quý Khách đã đăng ký nhận thông tin từ <strong>${company.name}</strong>.</p>
                      <p style="margin:0 0 16px;">Chúng tôi đã ghi nhận đăng ký của Quý Khách thành công. Trong thời gian tới, Quý Khách sẽ nhận được các thông tin mới nhất về:</p>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0;">
                        ${[
                          "Chương trình khuyến mãi và ưu đãi hấp dẫn.",
                          "Sản phẩm, dịch vụ mới.",
                          "Tin tức, sự kiện và các hoạt động nổi bật của công ty.",
                          "Những nội dung hữu ích và cập nhật dành riêng cho khách hàng.",
                        ]
                          .map(
                            (item) => `
                              <tr>
                                <td style="width:28px;padding:7px 0;vertical-align:top;">
                                  <span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#e8f3ff;color:#1681f5;text-align:center;line-height:18px;font-size:12px;font-weight:700;">✓</span>
                                </td>
                                <td style="padding:7px 0;color:#24324a;">${item}</td>
                              </tr>
                            `,
                          )
                          .join("")}
                      </table>
                      <p style="margin:0 0 16px;">Chúng tôi cam kết bảo mật thông tin cá nhân của Quý Khách và chỉ gửi những nội dung có giá trị. Quý Khách có thể hủy đăng ký nhận tin bất cứ lúc nào thông qua liên kết ở cuối mỗi email.</p>
                      <p style="margin:0 0 20px;">Xin chân thành cảm ơn Quý Khách đã quan tâm và đồng hành cùng <strong>${company.name}</strong>.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 34px 32px;">
                      <div style="border-radius:14px;background:#f8fbff;border:1px solid #e2eaf5;padding:18px 20px;">
                        <p style="margin:0 0 6px;font-weight:700;">Trân trọng,</p>
                        <p style="margin:0 0 10px;font-weight:800;color:#111827;">${company.name}</p>
                        <p style="margin:0;color:#667085;font-size:13px;line-height:1.7;">
                          Hotline: ${company.hotline}<br/>
                          Email: <a href="mailto:${company.email}" style="color:#1681f5;text-decoration:none;">${company.email}</a><br/>
                          Website: <a href="${company.website}" style="color:#1681f5;text-decoration:none;">${company.website}</a>
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
      headers: {
        "List-Unsubscribe": `<mailto:${company.email}?subject=unsubscribe>`,
        "X-Entity-Ref-ID": `moco-newsletter-${Date.now()}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter email error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Không thể gửi email." },
      { status: 500 },
    );
  }
}
