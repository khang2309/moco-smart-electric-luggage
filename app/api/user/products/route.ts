import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { listWarranties } from "@/lib/warranty";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Legacy callers still receive `products`, now enriched with live warranty status.
    const registrations = await listWarranties(db, {
      $or: [{ customerEmail: email }, { userEmail: email }, { contact: email }],
    });

    return NextResponse.json({
      success: true,
      products: registrations,
    });
  } catch (error) {
    console.error("Fetch user products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
