import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getEligibleWarrantyOrders, listWarranties } from "@/lib/warranty";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = String(searchParams.get("email") || "").trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

    const db = await getDb();
    if (searchParams.get("eligible") === "true") {
      return NextResponse.json({ success: true, orders: await getEligibleWarrantyOrders(db, email) });
    }

    const warranties = await listWarranties(db, { $or: [{ customerEmail: email }, { userEmail: email }, { contact: email }] });
    return NextResponse.json({ success: true, warranties });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
