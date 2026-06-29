import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getDatabaseErrorMessage } from "@/lib/api-error";

export async function GET() {
  try {
    const db = await getDb();
    const orders = db.collection("orders");

    const ordersList = await orders
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      orders: ordersList,
      total: ordersList.length,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 }
    );
  }
}
