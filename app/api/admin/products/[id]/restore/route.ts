import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getDatabaseErrorMessage } from "@/lib/api-error";
import { ObjectId } from "mongodb";
import { syncInventoryForProduct } from "@/lib/inventory";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const products = db.collection("products");

    const result = await products.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: "active", 
          deletedAt: null,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }
    
    // Khôi phục đồng bộ tồn kho nếu cần
    await syncInventoryForProduct(db, result);

    return NextResponse.json({
      success: true,
      message: "Product restored successfully",
      product: result
    });
  } catch (error) {
    console.error("Restore product error:", error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 }
    );
  }
}
