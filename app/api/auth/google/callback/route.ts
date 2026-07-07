import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const error = request.nextUrl.searchParams.get("error");
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/auth/google/callback`;

    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${error}`, request.nextUrl.origin));
    }

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Missing Google OAuth credentials" }, { status: 500 });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Google Token Error:", tokenData);
      return NextResponse.json({ error: "Failed to exchange token" }, { status: 400 });
    }

    // Get user info
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const googleUser = await userResponse.json();

    if (!userResponse.ok || !googleUser.email) {
      console.error("Google User Info Error:", googleUser);
      return NextResponse.json({ error: "Failed to get user info" }, { status: 400 });
    }

    const db = await getDb();
    const users = db.collection("users");
    const normalizedEmail = googleUser.email.trim().toLowerCase();

    // Find or create user
    let user = await users.findOne({ email: normalizedEmail });
    let isFirstLogin = false;

    if (!user) {
      // Create new user
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const now = new Date();

      const newUser = {
        email: normalizedEmail,
        name: googleUser.name || googleUser.given_name || "Google User",
        password: hashedPassword,
        phone: "",
        city: "",
        address: "",
        role: "customer",
        googleId: googleUser.id,
        createdAt: now,
        updatedAt: now,
        loginCount: 1,
        lastLoginAt: now,
      };

      const insertResult = await users.insertOne(newUser);
      user = { ...newUser, _id: insertResult.insertedId } as any;
      isFirstLogin = true;
    } else {
      isFirstLogin = !user.loginCount || user.loginCount === 0;
      
      // Update googleId if missing, and increment loginCount
      const updateDoc: any = {
        $set: { lastLoginAt: new Date(), updatedAt: new Date() },
        $inc: { loginCount: 1 }
      };
      if (!user.googleId) {
        updateDoc.$set.googleId = googleUser.id;
      }
      
      await users.updateOne({ _id: user._id }, updateDoc);
    }

    const { password: _, _id, ...userWithoutPassword } = user as any;

    // Return HTML page to set localStorage and redirect
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authenticating...</title>
      </head>
      <body>
        <script>
          const user = ${JSON.stringify(userWithoutPassword)};
          const isFirstLogin = ${isFirstLogin};
          window.localStorage.setItem('moco-user', JSON.stringify(user));
          window.localStorage.setItem('moco-auth', 'true');
          window.dispatchEvent(new Event('moco-auth-updated'));
          window.location.href = isFirstLogin ? '/account' : '/';
        </script>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });

  } catch (err: any) {
    console.error("Google Auth Error:", err);
    return NextResponse.json({ error: "Internal Server Error", details: err.message, stack: err.stack }, { status: 500 });
  }
}
