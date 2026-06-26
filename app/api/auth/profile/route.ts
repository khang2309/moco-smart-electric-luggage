import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const users = db.collection("users");
    const normalizedEmail = email.trim().toLowerCase();

    const user = await users.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 },
      );
    }

    const { password: _, _id, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { email, name, phone, city, address } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const users = db.collection("users");
    const normalizedEmail = email.trim().toLowerCase();

    const updateFields: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (city !== undefined) updateFields.city = city;
    if (address !== undefined) updateFields.address = address;

    const result = await users.findOneAndUpdate(
      { email: normalizedEmail },
      { $set: updateFields },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 },
      );
    }

    const { password: _, _id, ...userWithoutPassword } = result;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
