import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getDatabaseErrorMessage } from "@/lib/api-error";

export async function GET() {
  try {
    const db = await getDb();
    const users = db.collection("users");

    const usersList = await users
      .find({})
      .project({ password: 0 })
      .toArray();

    return NextResponse.json({
      success: true,
      users: usersList,
      total: usersList.length,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 }
    );
  }
}
