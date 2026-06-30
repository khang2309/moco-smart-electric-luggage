import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const copy = {
  vi: {
    missing: "Thiếu thông tin gửi email.",
    config: "Chưa cấu hình EMAIL_PASS trong file .env.local.",
    hello: "Xin chào",
    greetingFallback: "bạn",
    
    // Reset password
    resetSubject: "Xác nhận đặt lại mật khẩu MOCO",
    resetIntro: "MOCO nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.",
    resetInstruction: "Vui lòng mở liên kết bên dưới để tạo mật khẩu mới. Liên kết có hiệu lực trong 30 phút.",
    resetCta: "Đặt lại mật khẩu",
    resetIgnore: "Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này.",
    
    // Registration
    regSubject: "Xác nhận đăng ký sản phẩm MOCO",
    regIntro: "Chúc mừng bạn đã kích hoạt bảo hành điện tử thành công cho vali MOCO.",
    regInstruction: "Dưới đây là thông tin chi tiết về sản phẩm bạn đã đăng ký:",
    regIgnore: "Vui lòng lưu lại email này để làm căn cứ bảo hành. Cảm ơn bạn đã đồng hành cùng MOCO!",
    
    success: "Đã gửi email.",
  },
  en: {
    missing: "Missing email information.",
    config: "EMAIL_PASS has not been configured in .env.local.",
    hello: "Hello",
    greetingFallback: "there",
    
    // Reset password
    resetSubject: "MOCO password reset confirmation",
    resetIntro: "MOCO received a request to reset the password for your account.",
    resetInstruction: "Please open the link below to create a new password. The link is valid for 30 minutes.",
    resetCta: "Reset password",
    resetIgnore: "If you did not request a password reset, you can safely ignore this email.",
    
    // Registration
    regSubject: "MOCO Product Registration Confirmation",
    regIntro: "Congratulations, you have successfully activated the e-warranty for your MOCO luggage.",
    regInstruction: "Below are the details of your registered product:",
    regIgnore: "Please keep this email for warranty claims. Thank you for choosing MOCO!",
    
    success: "Email sent.",
  },
} as const;

export async function POST(request: Request) {
  try {
    const { type = "reset", to, name, resetLink, language, model, serial, purchaseDate, warrantyExpiry } = await request.json();
    const lang: "vi" | "en" = language === "en" ? "en" : "vi";
    const currentCopy = copy[lang];
    const emailUser = process.env.EMAIL_USER || "mocoluggage@gmail.com";
    const emailPass = process.env.EMAIL_PASS;

    if (!to || (type === "reset" && !resetLink)) {
      return NextResponse.json(
        { success: false, error: currentCopy.missing },
        { status: 400 },
      );
    }

    if (!emailPass) {
      return NextResponse.json(
        { success: false, error: currentCopy.config },
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

    const greetingName = name || currentCopy.greetingFallback;
    const safeName = escapeHtml(greetingName);
    const safeResetLink = resetLink ? escapeHtml(resetLink) : "";

    let subject = "";
    let html = "";
    let text = "";

    if (type === "registration") {
      subject = currentCopy.regSubject;
      
      const details = [
        `Model: ${escapeHtml(model || "")}`,
        `Serial: ${escapeHtml(serial || "Không có")}`,
        `Ngày mua (Purchase date): ${escapeHtml(purchaseDate || "")}`,
        `Hạn bảo hành (Warranty expiry): ${escapeHtml(warrantyExpiry || "")}`
      ].join("\n");

      text = [
        `${currentCopy.hello} ${greetingName},`,
        "",
        currentCopy.regIntro,
        currentCopy.regInstruction,
        "",
        details,
        "",
        currentCopy.regIgnore,
        "",
        "MOCO Support",
      ].join("\n");

      html = `
        <div style="font-family: 'Quicksand','Segoe UI',system-ui,-apple-system,sans-serif; max-width: 600px; margin: 0 auto; color: #172033;">
          <div style="padding: 24px 0; border-bottom: 1px solid #e5e7eb;">
            <h1 style="margin: 0; font-size: 24px;">${subject}</h1>
          </div>
          <div style="padding: 24px 0; line-height: 1.65;">
            <p>${currentCopy.hello} ${safeName},</p>
            <p>${currentCopy.regIntro}</p>
            <p>${currentCopy.regInstruction}</p>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0 0 8px;"><strong>Model:</strong> ${escapeHtml(model || "")}</p>
              <p style="margin: 0 0 8px;"><strong>Serial:</strong> ${escapeHtml(serial || "Không có")}</p>
              <p style="margin: 0 0 8px;"><strong>${lang === 'vi' ? 'Ngày mua' : 'Purchase date'}:</strong> ${escapeHtml(purchaseDate || "")}</p>
              <p style="margin: 0;"><strong>${lang === 'vi' ? 'Hạn bảo hành' : 'Warranty expiry'}:</strong> ${escapeHtml(warrantyExpiry || "")}</p>
            </div>
            <p style="font-size: 13px; color: #667085;">${currentCopy.regIgnore}</p>
          </div>
          <div style="padding-top: 16px; border-top: 1px solid #e5e7eb; color: #667085; font-size: 12px;">
            MOCO Support · mocoluggage@gmail.com
          </div>
        </div>
      `;
    } else {
      // type === "reset"
      subject = currentCopy.resetSubject;
      text = [
        `${currentCopy.hello} ${greetingName},`,
        "",
        currentCopy.resetIntro,
        currentCopy.resetInstruction,
        "",
        resetLink,
        "",
        currentCopy.resetIgnore,
        "",
        "MOCO Support",
      ].join("\n");

      html = `
        <div style="font-family: 'Quicksand','Segoe UI',system-ui,-apple-system,sans-serif; max-width: 600px; margin: 0 auto; color: #172033;">
          <div style="padding: 24px 0; border-bottom: 1px solid #e5e7eb;">
            <h1 style="margin: 0; font-size: 24px;">${subject}</h1>
          </div>
          <div style="padding: 24px 0; line-height: 1.65;">
            <p>${currentCopy.hello} ${safeName},</p>
            <p>${currentCopy.resetIntro} ${currentCopy.resetInstruction}</p>
            <p style="text-align: center; margin: 28px 0;">
              <a href="${safeResetLink}" style="background: #101114; color: #ffffff; padding: 13px 24px; text-decoration: none; border-radius: 999px; font-weight: 700;">${currentCopy.resetCta}</a>
            </p>
            <p style="font-size: 13px; color: #667085;">${currentCopy.resetIgnore}</p>
          </div>
          <div style="padding-top: 16px; border-top: 1px solid #e5e7eb; color: #667085; font-size: 12px;">
            MOCO Support · mocoluggage@gmail.com
          </div>
        </div>
      `;
    }

    await transporter.sendMail({
      from: `"MOCO Support" <${emailUser}>`,
      sender: emailUser,
      replyTo: emailUser,
      to,
      subject,
      text,
      html,
      headers: {
        "X-Entity-Ref-ID": `moco-${type}-${Date.now()}`,
        "List-Unsubscribe": `<mailto:${emailUser}?subject=unsubscribe>`,
      },
    });

    return NextResponse.json({
      success: true,
      message: currentCopy.success,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
