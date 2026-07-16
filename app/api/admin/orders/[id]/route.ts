import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const statusUpdates = {
  pending: { status: "PENDING", fulfillmentStatus: "pending" },
  processing: { status: "CONFIRMED", fulfillmentStatus: "processing" },
  shipped: { status: "SHIPPING", fulfillmentStatus: "shipping" },
  delivered: { status: "DELIVERED", fulfillmentStatus: "delivered" },
  cancelled: { status: "CANCELLED", fulfillmentStatus: "cancelled" },
} as const;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    const normalizedStatus = String(status || "").trim().toLowerCase() as keyof typeof statusUpdates;

    if (!Object.hasOwn(statusUpdates, normalizedStatus)) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const db = await getDb();
    const orders = db.collection("orders");
    const orderId = new ObjectId(id);
    const existingOrder = await orders.findOne({ _id: orderId });
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const now = new Date();
    const updateData: Record<string, unknown> = { ...statusUpdates[normalizedStatus], updatedAt: now };
    if (normalizedStatus === "delivered") {
      // The first delivered timestamp is the immutable invoice/warranty start date.
      updateData.deliveredAt = existingOrder.deliveredAt || now;
      updateData.invoiceDate = existingOrder.invoiceDate || existingOrder.deliveredAt || now;
    }
    if (normalizedStatus === "cancelled") updateData.cancelledAt = existingOrder.cancelledAt || now;

    const result = await db.collection("orders").updateOne(
      { _id: orderId },
      { $set: updateData }
    );

    return NextResponse.json({ success: true, message: "Order updated successfully" });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
