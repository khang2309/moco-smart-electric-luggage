import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const users = db.collection("users");
    const normalizedEmail = email.trim().toLowerCase();

    const user = await users.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { error: "No account found for this email." },
        { status: 404 },
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 401 },
      );
    }

    // Return user info without password
    const { password: _, _id, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
