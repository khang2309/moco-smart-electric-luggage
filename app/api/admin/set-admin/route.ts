import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getDatabaseErrorMessage } from "@/lib/api-error";
import { ObjectId } from "mongodb";

/**
 * POST /api/admin/set-admin
 * Phân quyền Admin cho một người dùng (cần password của người dùng đó)
 * Body: { email: string, makeAdmin: boolean }
 */
export async function POST(request: Request) {
  try {
    const { email, makeAdmin } = await request.json();
    const adminSecret = request.headers.get("x-admin-secret");
    const serverSecret = process.env.ADMIN_SECRET_KEY || "your-secret-key-123";

    // Kiểm tra secret key
    if (adminSecret !== serverSecret) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid secret key" },
        { status: 401 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection("users");
    const normalizedEmail = email.trim().toLowerCase();

    const result = await users.updateOne(
      { email: normalizedEmail },
      { $set: { role: makeAdmin ? "admin" : "customer" } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User role updated to ${makeAdmin ? "admin" : "customer"}`,
    });
  } catch (error) {
    console.error("Set admin error:", error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/check-admin?email=user@example.com
 * Kiểm tra xem một người dùng có phải admin không
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection("users");
    const normalizedEmail = email.trim().toLowerCase();

    const user = await users.findOne(
      { email: normalizedEmail },
      { projection: { role: 1, email: 1, name: 1 } }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isAdmin: user.role === "admin",
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Check admin error:", error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 }
    );
  }
}
