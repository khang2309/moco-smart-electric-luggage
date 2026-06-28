import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const mocoEmail = "mocoluggage@gmail.com";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderParagraphs(lines: string[]) {
  return lines
    .map((line) => `<p style="margin:0 0 14px;">${line || "&nbsp;"}</p>`)
    .join("");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customerName = String(body.name || "").trim();
    const customerEmail = String(body.email || "").trim();
    const customerPhone = String(body.phone || "").trim();
    const message = String(body.message || "").trim();

    if (!customerName || !customerEmail || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Vui lòng nhập đầy đủ họ tên, email và nội dung liên hệ.",
        },
        { status: 400 },
      );
    }

    if (!isEmail(customerEmail)) {
      return NextResponse.json(
        { success: false, error: "Email không hợp lệ." },
        { status: 400 },
      );
    }

    const emailUser = process.env.EMAIL_USER || mocoEmail;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailPass) {
      return NextResponse.json(
        {
          success: false,
          error: "Chưa cấu hình EMAIL_PASS trong file .env.local.",
        },
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

    const safeName = escapeHtml(customerName);
    const safeEmail = escapeHtml(customerEmail);
    const safePhone = escapeHtml(customerPhone || "Không cung cấp");
    const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

    const customerSubject = "Đăng ký tư vấn MOCO";
    const teamSubject = "Yêu cầu liên hệ mới từ website MOCO";

    const customerText = [
      `Xin chào ${customerName},`,
      "",
      "Cảm ơn bạn đã liên hệ với MOCO.",
      "",
      "Chúng tôi đã nhận được yêu cầu của bạn với các thông tin sau:",
      "",
      `* Họ và tên: ${customerName}`,
      `* Email: ${customerEmail}`,
      `* Số điện thoại: ${customerPhone || "Không cung cấp"}`,
      `* Nội dung liên hệ: ${message}`,
      "",
      "Đội ngũ MOCO sẽ xem xét và phản hồi bạn trong thời gian sớm nhất.",
      "",
      "Nếu cần bổ sung thông tin, bạn chỉ cần trả lời trực tiếp email này.",
      "",
      "Cảm ơn bạn đã quan tâm đến MOCO.",
      "",
      "Trân trọng,",
      "",
      "MOCO Team",
    ].join("\n");

    const teamText = [
      "Bạn vừa nhận được một yêu cầu liên hệ mới từ website MOCO.",
      "",
      "Thông tin khách hàng",
      "",
      `* Họ và tên: ${customerName}`,
      `* Email: ${customerEmail}`,
      `* Số điện thoại: ${customerPhone || "Không cung cấp"}`,
      "",
      "Nội dung liên hệ",
      "",
      message,
      "",
      "Vui lòng liên hệ và phản hồi khách hàng trong thời gian sớm nhất.",
      "",
      "---",
      "",
      "Email này được gửi tự động từ biểu mẫu liên hệ trên website MOCO.",
    ].join("\n");

    const baseEmailStyle =
      "font-family:'Quicksand','Segoe UI',Arial,sans-serif;color:#172033;line-height:1.65;font-size:15px;";

    const customerHtml = `
      <div style="margin:0;padding:0;background:#f5f7fb;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:28px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;background:#ffffff;border:1px solid #e5eaf2;border-radius:8px;overflow:hidden;${baseEmailStyle}">
                <tr>
                  <td style="padding:28px 32px;border-bottom:1px solid #eef2f7;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;color:#667085;">MOCO</p>
                    <h1 style="margin:0;font-size:26px;line-height:1.2;color:#101114;">Đăng ký tư vấn MOCO</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 32px;">
                    ${renderParagraphs([
                      `Xin chào ${safeName},`,
                      "Cảm ơn bạn đã liên hệ với MOCO.",
                      "Chúng tôi đã nhận được yêu cầu của bạn với các thông tin sau:",
                    ])}
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:6px 0 20px;border:1px solid #e8edf5;border-radius:8px;background:#f8fafc;">
                      <tr><td style="padding:12px 14px;"><strong>Họ và tên:</strong> ${safeName}</td></tr>
                      <tr><td style="padding:12px 14px;border-top:1px solid #e8edf5;"><strong>Email:</strong> ${safeEmail}</td></tr>
                      <tr><td style="padding:12px 14px;border-top:1px solid #e8edf5;"><strong>Số điện thoại:</strong> ${safePhone}</td></tr>
                      <tr><td style="padding:12px 14px;border-top:1px solid #e8edf5;"><strong>Nội dung liên hệ:</strong><br />${safeMessage}</td></tr>
                    </table>
                    ${renderParagraphs([
                      "Đội ngũ MOCO sẽ xem xét và phản hồi bạn trong thời gian sớm nhất.",
                      "Nếu cần bổ sung thông tin, bạn chỉ cần trả lời trực tiếp email này.",
                      "Cảm ơn bạn đã quan tâm đến MOCO.",
                      "Trân trọng,",
                    ])}
                    <p style="margin:0;font-weight:800;">MOCO Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    const teamHtml = `
      <div style="margin:0;padding:0;background:#f5f7fb;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:28px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;background:#ffffff;border:1px solid #e5eaf2;border-radius:8px;overflow:hidden;${baseEmailStyle}">
                <tr>
                  <td style="padding:28px 32px;border-bottom:1px solid #eef2f7;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;color:#667085;">MOCO Website</p>
                    <h1 style="margin:0;font-size:24px;line-height:1.2;color:#101114;">Yêu cầu liên hệ mới</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 32px;">
                    <p style="margin:0 0 18px;">Bạn vừa nhận được một yêu cầu liên hệ mới từ website MOCO.</p>
                    <h2 style="margin:0 0 12px;font-size:18px;">Thông tin khách hàng</h2>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;border:1px solid #e8edf5;border-radius:8px;background:#f8fafc;">
                      <tr><td style="padding:12px 14px;"><strong>Họ và tên:</strong> ${safeName}</td></tr>
                      <tr><td style="padding:12px 14px;border-top:1px solid #e8edf5;"><strong>Email:</strong> ${safeEmail}</td></tr>
                      <tr><td style="padding:12px 14px;border-top:1px solid #e8edf5;"><strong>Số điện thoại:</strong> ${safePhone}</td></tr>
                    </table>
                    <h2 style="margin:0 0 12px;font-size:18px;">Nội dung liên hệ</h2>
                    <div style="padding:14px 16px;border:1px solid #e8edf5;border-radius:8px;background:#ffffff;margin-bottom:20px;">${safeMessage}</div>
                    <p style="margin:0 0 18px;">Vui lòng liên hệ và phản hồi khách hàng trong thời gian sớm nhất.</p>
                    <hr style="border:none;border-top:1px solid #e5eaf2;margin:20px 0;" />
                    <p style="margin:0;color:#667085;font-size:13px;">Email này được gửi tự động từ biểu mẫu liên hệ trên website MOCO.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    await transporter.sendMail({
      from: `"MOCO Team" <${emailUser}>`,
      sender: emailUser,
      replyTo: mocoEmail,
      to: customerEmail,
      subject: customerSubject,
      text: customerText,
      html: customerHtml,
      headers: {
        "X-Entity-Ref-ID": `moco-contact-customer-${Date.now()}`,
      },
    });

    await transporter.sendMail({
      from: `"MOCO Website" <${emailUser}>`,
      sender: emailUser,
      replyTo: customerEmail,
      to: mocoEmail,
      subject: teamSubject,
      text: teamText,
      html: teamHtml,
      headers: {
        "X-Entity-Ref-ID": `moco-contact-team-${Date.now()}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("MOCO contact email error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể xử lý liên hệ.",
      },
      { status: 500 },
    );
  }
}
