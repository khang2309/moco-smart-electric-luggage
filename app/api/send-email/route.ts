import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { to, name, resetLink } = await request.json();

    // EMAIL_PASS MUST be an App Password, not your regular Gmail password.
    if (!process.env.EMAIL_PASS) {
      return NextResponse.json(
        {
          success: false,
          error: "Chưa cấu hình EMAIL_PASS trong file .env.local",
        },
        { status: 500 },
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "mocoluggage@gmail.com",
        pass: process.env.EMAIL_PASS || "eyjeyrscxioscstu",
      },
    });

    const mailOptions = {
      from: `"MOCO Security" <${process.env.EMAIL_USER || "mocoluggage@gmail.com"}>`,
      to,
      subject: "Yêu cầu thay đổi mật khẩu tài khoản MOCO",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f9f9f9; padding: 16px 24px; border-bottom: 1px solid #eaeaea;">
            <h2 style="margin: 0; color: #333;">Yêu cầu thay đổi mật khẩu</h2>
          </div>
          <div style="padding: 24px; color: #333; line-height: 1.6;">
            <p>Xin chào ${name || "bạn"},</p>
            <p>Hệ thống bảo mật của MOCO vừa nhận được yêu cầu thay đổi mật khẩu từ tài khoản của bạn. Cảnh báo bảo mật: Hãy kiểm tra kỹ xem người yêu cầu có đúng là bạn không.</p>
            <p>Nếu bạn là người yêu cầu, vui lòng nhấn vào nút bên dưới để tiếp tục đổi mật khẩu.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Xác nhận đổi mật khẩu</a>
            </div>
            <p style="font-size: 12px; color: #888; font-style: italic; margin-top: 32px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Đã gửi email xác nhận!",
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
