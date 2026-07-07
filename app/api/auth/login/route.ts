import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getDatabaseErrorMessage } from "@/lib/api-error";
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

    // Track login count to determine if this is the first login
    const isFirstLogin = !user.loginCount || user.loginCount === 0;

    await users.updateOne(
      { _id: user._id },
      { 
        $inc: { loginCount: 1 }, 
        $set: { lastLoginAt: new Date() } 
      }
    );

    // Return user info without password
    const { password: _, _id, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: userWithoutPassword, isFirstLogin });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 },
    );
  }
}
