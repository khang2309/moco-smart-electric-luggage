import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { to, name, resetLink } = await request.json();
    const emailUser = process.env.EMAIL_USER || "mocoluggage@gmail.com";
    const emailPass = process.env.EMAIL_PASS;

    if (!to || !resetLink) {
      return NextResponse.json(
        { success: false, error: "Thiếu email hoặc liên kết xác nhận." },
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

    const greetingName = name || "bạn";
    const subject = "Xác nhận đặt lại mật khẩu MOCO";
    const text = [
      `Xin chào ${greetingName},`,
      "",
      "MOCO nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.",
      "Vui lòng mở liên kết bên dưới để tạo mật khẩu mới. Liên kết có hiệu lực trong 30 phút.",
      "",
      resetLink,
      "",
      "Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này.",
      "",
      "MOCO Support",
    ].join("\n");

    await transporter.sendMail({
      from: `"MOCO Support" <${emailUser}>`,
      sender: emailUser,
      replyTo: emailUser,
      to,
      subject,
      text,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #172033;">
          <div style="padding: 24px 0; border-bottom: 1px solid #e5e7eb;">
            <h1 style="margin: 0; font-size: 24px;">Xác nhận đặt lại mật khẩu MOCO</h1>
          </div>
          <div style="padding: 24px 0; line-height: 1.65;">
            <p>Xin chào ${greetingName},</p>
            <p>MOCO nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấn nút bên dưới để tạo mật khẩu mới.</p>
            <p style="text-align: center; margin: 28px 0;">
              <a href="${resetLink}" style="background: #1681f5; color: #ffffff; padding: 13px 24px; text-decoration: none; border-radius: 8px; font-weight: 700;">Đặt lại mật khẩu</a>
            </p>
            <p style="font-size: 13px; color: #667085;">Liên kết có hiệu lực trong 30 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này.</p>
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
      message: "Đã gửi email xác nhận.",
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
