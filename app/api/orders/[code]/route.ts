import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getDatabaseErrorMessage } from "@/lib/api-error";
import { canModifyOrder, getBlockedOrderMessage } from "@/lib/order-state";

type RecipientInfo = {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
};

function sanitizeRecipient(recipient: RecipientInfo) {
  return {
    fullName: String(recipient.fullName || "").trim(),
    phone: String(recipient.phone || "").trim(),
    email: String(recipient.email || "").trim(),
    address: String(recipient.address || "").trim(),
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const normalizedCode = decodeURIComponent(code || "").trim();
    const body = await request.json();
    const db = await getDb();
    const orders = db.collection("orders");
    const order = await orders.findOne({ code: normalizedCode });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const stateSource = {
      status: typeof order.status === "string" ? order.status : undefined,
      fulfillmentStatus:
        typeof order.fulfillmentStatus === "string" ? order.fulfillmentStatus : undefined,
      paymentStatus: typeof order.paymentStatus === "string" ? order.paymentStatus : undefined,
    };

    if (!canModifyOrder(stateSource)) {
      return NextResponse.json({ error: getBlockedOrderMessage(stateSource) }, { status: 409 });
    }

    if (body.action === "cancel") {
      const now = new Date();
      const result = await orders.findOneAndUpdate(
        { code: normalizedCode },
        {
          $set: {
            status: "CANCELLED",
            fulfillmentStatus: "cancelled",
            updatedAt: now,
            cancelledAt: now,
          },
        },
        { returnDocument: "after" },
      );

      return NextResponse.json({
        success: true,
        order: result,
      });
    }

    if (body.action === "update") {
      const recipient = sanitizeRecipient(body.recipient || {});

      if (!recipient.fullName || !recipient.phone || !recipient.address) {
        return NextResponse.json(
          { error: "Recipient name, phone, and address are required." },
          { status: 400 },
        );
      }

      const result = await orders.findOneAndUpdate(
        { code: normalizedCode },
        {
          $set: {
            ...recipient,
            customer: recipient,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" },
      );

      return NextResponse.json({
        success: true,
        order: result,
      });
    }

    return NextResponse.json({ error: "Unsupported order action." }, { status: 400 });
  } catch (error) {
    console.error("Update user order error:", error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 },
    );
  }
}
