import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { WARRANTY_EXTENSION_COLLECTION, WARRANTY_HISTORY_COLLECTION, WARRANTY_COLLECTION, serializeWarranty, synchronizeWarrantyStatus, updateWarrantyByAdmin } from "@/lib/warranty";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid warranty ID." }, { status: 400 });
  const db = await getDb();
  const warrantyId = new ObjectId(id);
  const warranty = await db.collection(WARRANTY_COLLECTION).findOne({ _id: warrantyId });
  if (!warranty) return NextResponse.json({ error: "Warranty not found." }, { status: 404 });
  const [history, extensions, product] = await Promise.all([
    db.collection(WARRANTY_HISTORY_COLLECTION).find({ warrantyId }).sort({ createdAt: -1 }).toArray(),
    db.collection(WARRANTY_EXTENSION_COLLECTION).find({ warrantyId }).sort({ createdAt: -1 }).toArray(),
    db.collection("products").findOne({ $or: [{ slug: warranty.productId }, { name: warranty.model }] }, { projection: { image: 1, name: 1, nameEn: 1, colors: 1 } }),
  ]);
  return NextResponse.json({ success: true, warranty: { ...serializeWarranty(await synchronizeWarrantyStatus(db, warranty)), productImage: product?.image || "", productName: product?.name || warranty.model || "", productColors: product?.colors || [] }, history, extensions });
}

async function handleUpdate(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const action = body.action || (String(body.status || "").toUpperCase() === "ACTIVE" ? "approve" : String(body.status || "").toUpperCase() === "REJECTED" ? "reject" : "");
    const warranty = await updateWarrantyByAdmin(await getDb(), id, { ...body, action });
    return NextResponse.json({ success: true, warranty, message: "Warranty updated." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 400 });
  }
}

export const PATCH = handleUpdate;
export const PUT = handleUpdate;
