import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/auth/google/callback`;

  if (!clientId) {
    return NextResponse.json({ error: "Missing GOOGLE_CLIENT_ID" }, { status: 500 });
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  return NextResponse.redirect(url.toString());
}
