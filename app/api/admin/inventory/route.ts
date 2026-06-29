import { NextResponse } from "next/server";
import { getDatabaseErrorMessage } from "@/lib/api-error";
import { syncInventoryForProducts } from "@/lib/inventory";
import { getDb } from "@/lib/mongodb";
import type { Document, WithId } from "mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const products = await db.collection("products").find({}).toArray();
    await syncInventoryForProducts(db, products as WithId<Document>[]);

    const inventory = await db
      .collection("inventory")
      .find({})
      .sort({ status: 1, productName: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      inventory,
      total: inventory.length,
    });
  } catch (error) {
    console.error("Get inventory error:", error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 },
    );
  }
}
