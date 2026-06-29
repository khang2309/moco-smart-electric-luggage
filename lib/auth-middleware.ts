import { NextRequest, NextResponse } from "next/server";
import { getDb } from "./mongodb";
import { ObjectId } from "mongodb";

export type UserRole = "admin" | "customer";

export async function verifyAdminRole(userId: string): Promise<boolean> {
  try {
    const db = await getDb();
    const users = db.collection("users");
    
    const user = await users.findOne({ _id: new ObjectId(userId) });
    return user?.role === "admin";
  } catch {
    return false;
  }
}

export function getAuthTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

export function createUnauthorizedResponse(message: string = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function createForbiddenResponse(message: string = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function createBadRequestResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
