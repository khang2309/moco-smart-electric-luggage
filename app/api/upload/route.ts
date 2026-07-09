import { NextRequest, NextResponse } from "next/server";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "Không tìm thấy file" }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Định dạng file không hợp lệ (hỗ trợ JPG, PNG, WEBP)" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Dung lượng quá lớn, tối đa 5MB" }, { status: 400 });
    }

    // Upload to Cloudinary instead of local filesystem
    const secureUrl = await uploadImageToCloudinary(file);

    // Return the public Cloudinary URL
    return NextResponse.json({ success: true, url: secureUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: "Có lỗi xảy ra khi upload file lên Cloudinary" }, { status: 500 });
  }
}
