import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

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

    // Find registrations by email. 
    // If the user registered without being logged in, they might have put their email in 'contact'.
    // So we check both userEmail and contact.
    const registrations = await db
      .collection("registrations")
      .find({
        $or: [
          { userEmail: email },
          { contact: email }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

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
