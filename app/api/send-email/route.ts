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
    missing: "Thiếu email hoặc liên kết xác nhận.",
    config: "Chưa cấu hình EMAIL_PASS trong file .env.local.",
    subject: "Xác nhận đặt lại mật khẩu MOCO",
    greetingFallback: "bạn",
    hello: "Xin chào",
    intro: "MOCO nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.",
    instruction: "Vui lòng mở liên kết bên dưới để tạo mật khẩu mới. Liên kết có hiệu lực trong 30 phút.",
    cta: "Đặt lại mật khẩu",
    ignore: "Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này.",
    success: "Đã gửi email xác nhận.",
  },
  en: {
    missing: "Email or confirmation link is missing.",
    config: "EMAIL_PASS has not been configured in .env.local.",
    subject: "MOCO password reset confirmation",
    greetingFallback: "there",
    hello: "Hello",
    intro: "MOCO received a request to reset the password for your account.",
    instruction: "Please open the link below to create a new password. The link is valid for 30 minutes.",
    cta: "Reset password",
    ignore: "If you did not request a password reset, you can safely ignore this email.",
    success: "Confirmation email sent.",
  },
} as const;

export async function POST(request: Request) {
  try {
    const { to, name, resetLink, language } = await request.json();
    const lang: "vi" | "en" = language === "en" ? "en" : "vi";
    const currentCopy = copy[lang];
    const emailUser = process.env.EMAIL_USER || "mocoluggage@gmail.com";
    const emailPass = process.env.EMAIL_PASS;

    if (!to || !resetLink) {
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
    const safeResetLink = escapeHtml(resetLink);
    const text = [
      `${currentCopy.hello} ${greetingName},`,
      "",
      currentCopy.intro,
      currentCopy.instruction,
      "",
      resetLink,
      "",
      currentCopy.ignore,
      "",
      "MOCO Support",
    ].join("\n");

    await transporter.sendMail({
      from: `"MOCO Support" <${emailUser}>`,
      sender: emailUser,
      replyTo: emailUser,
      to,
      subject: currentCopy.subject,
      text,
      html: `
        <div style="font-family: 'Quicksand','Segoe UI',system-ui,-apple-system,sans-serif; max-width: 600px; margin: 0 auto; color: #172033;">
          <div style="padding: 24px 0; border-bottom: 1px solid #e5e7eb;">
            <h1 style="margin: 0; font-size: 24px;">${currentCopy.subject}</h1>
          </div>
          <div style="padding: 24px 0; line-height: 1.65;">
            <p>${currentCopy.hello} ${safeName},</p>
            <p>${currentCopy.intro} ${currentCopy.instruction}</p>
            <p style="text-align: center; margin: 28px 0;">
              <a href="${safeResetLink}" style="background: #101114; color: #ffffff; padding: 13px 24px; text-decoration: none; border-radius: 999px; font-weight: 700;">${currentCopy.cta}</a>
            </p>
            <p style="font-size: 13px; color: #667085;">${currentCopy.ignore}</p>
          </div>
          <div style="padding-top: 16px; border-top: 1px solid #e5e7eb; color: #667085; font-size: 12px;">
            MOCO Support · mocoluggage@gmail.com
          </div>
        </div>
      `,
      headers: {
        "X-Entity-Ref-ID": `moco-reset-${Date.now()}`,
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
