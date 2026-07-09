import { NextRequest, NextResponse } from "next/server";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/lib/cloudinary-upload";

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
    const { secureUrl, publicId } = await uploadImageToCloudinary(file);

    // Return the public Cloudinary URL and publicId
    return NextResponse.json({ success: true, url: secureUrl, publicId });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: "Có lỗi xảy ra khi upload file lên Cloudinary" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json({ success: false, error: "Missing publicId" }, { status: 400 });
    }

    const success = await deleteImageFromCloudinary(publicId);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Failed to delete image" }, { status: 500 });
    }
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    return NextResponse.json({ success: false, error: "Có lỗi xảy ra khi xóa file trên Cloudinary" }, { status: 500 });
  }
}
