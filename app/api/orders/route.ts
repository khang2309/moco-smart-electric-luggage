import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getDatabaseErrorMessage } from "@/lib/api-error";
import { decreaseInventoryForOrder } from "@/lib/inventory";

type OrderItem = {
  slug?: string;
  name?: string;
  image?: string;
  quantity?: number;
  price?: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      code,
      items,
      total,
      paymentStatus,
      fulfillmentStatus,
      shipping,
      payment,
      createdAt,
      estimatedDelivery,
      customer,
      email,
      phone,
      fullName,
      address,
    } = body;

    if (!code || !Array.isArray(items) || typeof total !== "number") {
      return NextResponse.json(
        { error: "Order code, items, and total are required." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const orders = db.collection("orders");
    const existingOrder = await orders.findOne({ code });
    const now = new Date();
    const normalizedCreatedAt = createdAt ? new Date(createdAt) : now;
    const normalizedEstimatedDelivery = estimatedDelivery
      ? new Date(estimatedDelivery)
      : null;
    const normalizedItems = items.map((item: OrderItem) => ({
      slug: item.slug || "",
      name: item.name || "",
      image: item.image || "",
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
    }));

    const order = {
      code,
      items: normalizedItems,
      total: Number(total),
      paymentStatus: paymentStatus === "paid" ? "paid" : "pending",
      fulfillmentStatus: fulfillmentStatus || "processing",
      status: paymentStatus === "paid" ? "processing" : "pending",
      shipping: shipping || "",
      payment: payment || "",
      email: customer?.email || email || "",
      phone: customer?.phone || phone || "",
      fullName: customer?.fullName || fullName || "",
      address: customer?.address || address || "",
      createdAt: normalizedCreatedAt,
      estimatedDelivery: normalizedEstimatedDelivery,
      updatedAt: now,
    };

    await orders.updateOne(
      { code },
      { $set: order, $setOnInsert: { insertedAt: now } },
      { upsert: true },
    );

    if (!existingOrder) {
      await decreaseInventoryForOrder(db, normalizedItems, code);
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 },
    );
  }
}
