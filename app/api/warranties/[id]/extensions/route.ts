import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { WARRANTY_COLLECTION, updateWarrantyByAdmin } from "@/lib/warranty";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    if (!email || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid warranty extension request." }, { status: 400 });
    if (!String(body.paymentReference || "").trim()) return NextResponse.json({ error: "A completed payment reference is required." }, { status: 400 });

    const db = await getDb();
    const warranty = await db.collection(WARRANTY_COLLECTION).findOne({ _id: new ObjectId(id), $or: [{ customerEmail: email }, { userEmail: email }, { contact: email }] });
    if (!warranty) return NextResponse.json({ error: "Warranty not found." }, { status: 404 });

    const updated = await updateWarrantyByAdmin(db, id, { action: "extend", months: body.months, price: body.price, performedBy: email });
    return NextResponse.json({ success: true, warranty: updated });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to extend warranty." }, { status: 400 });
  }
}
