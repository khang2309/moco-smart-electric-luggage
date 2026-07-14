import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase();
  if (!email) return NextResponse.json({ success: false, error: "Sign in is required." }, { status: 401 });
  const count = await (await getDb()).collection("wishlists").countDocuments({ userEmail: email });
  return NextResponse.json({ success: true, count });
}
