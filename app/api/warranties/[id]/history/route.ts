import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { WARRANTY_COLLECTION, WARRANTY_HISTORY_COLLECTION } from "@/lib/warranty";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase();
  if (!email || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid warranty request." }, { status: 400 });
  const db = await getDb();
  const warrantyId = new ObjectId(id);
  const warranty = await db.collection(WARRANTY_COLLECTION).findOne({ _id: warrantyId, $or: [{ customerEmail: email }, { userEmail: email }, { contact: email }] });
  if (!warranty) return NextResponse.json({ error: "Warranty not found." }, { status: 404 });
  const history = await db.collection(WARRANTY_HISTORY_COLLECTION).find({ warrantyId }).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ success: true, history });
}
