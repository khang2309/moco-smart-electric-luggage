import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { registerWarranty } from "@/lib/warranty";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await registerWarranty(await getDb(), body);
    const language = body.language === "en" ? "en" : "vi";

    return NextResponse.json({
      success: true,
      warranty: result.warranty,
      registrationId: result.id,
      message: language === "vi"
        ? "Yêu cầu đăng ký bảo hành đã được gửi và đang chờ duyệt."
        : "Your warranty registration has been submitted for approval.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
