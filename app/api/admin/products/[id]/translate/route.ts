import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getDatabaseErrorMessage } from "@/lib/api-error";
import { ObjectId } from "mongodb";
import { translateViToEn } from "@/lib/translate";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const products = db.collection("products");

    const existingProduct = await products.findOne({ _id: new ObjectId(id) });
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Tự động dịch các trường tiếng Việt sang tiếng Anh
    const nameEn = await translateViToEn(existingProduct.name || "");
    const descriptionEn = await translateViToEn(existingProduct.description || "");
    
    // Subtitle có fallback là description (trước đây)
    let subtitleEn = "";
    if (existingProduct.subtitle) {
      subtitleEn = await translateViToEn(existingProduct.subtitle);
    } else if (existingProduct.description) {
      subtitleEn = await translateViToEn(existingProduct.description);
    }

    // Dịch các tên màu (nếu có)
    let updatedColors = [];
    if (Array.isArray(existingProduct.colors)) {
      updatedColors = await Promise.all(
        existingProduct.colors.map(async (color: any) => ({
          ...color,
          nameEn: await translateViToEn(color.name || "")
        }))
      );
    } else {
      updatedColors = existingProduct.colors || [];
    }

    // Cập nhật lại sản phẩm
    const result = await products.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          nameEn,
          descriptionEn,
          subtitleEn,
          colors: updatedColors,
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    return NextResponse.json({
      success: true,
      message: "Product translated successfully",
      product: result
    });
  } catch (error) {
    console.error("Translate product error:", error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 }
    );
  }
}
