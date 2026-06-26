import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getDatabaseErrorMessage } from "@/lib/api-error";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const users = db.collection("users");
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await users.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const now = new Date();
    const newUser = {
      email: normalizedEmail,
      name,
      password: hashedPassword,
      phone: phone || "",
      city: "",
      address: "",
      createdAt: now,
      updatedAt: now,
    };

    await users.insertOne(newUser);

    // Return user info without password
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 },
    );
  }
}
