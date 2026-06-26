import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/** POST — Create a password-reset token */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const normalizedEmail = email.trim().toLowerCase();

    // Check user exists
    const user = await db.collection("users").findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { error: "No account found for this email." },
        { status: 404 },
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    await db.collection("password_resets").updateOne(
      { email: normalizedEmail },
      { $set: { token, expiresAt } },
      { upsert: true },
    );

    return NextResponse.json({ success: true, email: normalizedEmail, token });
  } catch (error) {
    console.error("Reset-password POST error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

/** PUT — Validate token & update password */
export async function PUT(request: Request) {
  try {
    const { email, token, newPassword } = await request.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: "Email, token, and newPassword are required." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const normalizedEmail = email.trim().toLowerCase();

    // Validate token
    const reset = await db.collection("password_resets").findOne({ email: normalizedEmail });

    if (!reset || reset.token !== token || new Date(reset.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400 },
      );
    }

    // Hash new password & update user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.collection("users").updateOne(
      { email: normalizedEmail },
      { $set: { password: hashedPassword, updatedAt: new Date() } },
    );

    // Remove used token
    await db.collection("password_resets").deleteOne({ email: normalizedEmail });

    // Return updated user
    const user = await db.collection("users").findOne({ email: normalizedEmail });
    if (user) {
      const { password: _, _id, ...userWithoutPassword } = user;
      return NextResponse.json({ success: true, user: userWithoutPassword });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset-password PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
