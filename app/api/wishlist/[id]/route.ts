import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getDatabaseErrorMessage } from "@/lib/api-error";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase();
    const { id } = await params;
    if (!email) return NextResponse.json({ success: false, error: "Sign in is required." }, { status: 401 });
    if (!ObjectId.isValid(id)) return NextResponse.json({ success: false, error: "Invalid wishlist item." }, { status: 400 });
    const result = await (await getDb()).collection("wishlists").deleteOne({ _id: new ObjectId(id), userEmail: email });
    if (!result.deletedCount) return NextResponse.json({ success: false, error: "Wishlist item was not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete wishlist item error:", error);
    return NextResponse.json({ success: false, error: getDatabaseErrorMessage(error) }, { status: 500 });
  }
}
