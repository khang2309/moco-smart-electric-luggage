import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      hasSerial,
      serial,
      model,
      purchaseDate, // expected YYYY-MM-DD
      location,
      contact, // Phone or email
      invoiceImage, // base64 string
      userEmail, // The logged in user's email to associate with
      language = "vi",
    } = body;

    if (!model || !purchaseDate || !location || !contact) {
      return NextResponse.json(
        { error: language === "vi" ? "Vui lòng điền đầy đủ các trường bắt buộc." : "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (hasSerial === "yes" && !serial) {
      return NextResponse.json(
        { error: language === "vi" ? "Vui lòng nhập số serial." : "Please enter the serial number." },
        { status: 400 }
      );
    }

    // Calculate warranty expiry (1 year)
    let warrantyExpiry = "";
    try {
      const pDate = new Date(purchaseDate);
      if (!isNaN(pDate.getTime())) {
        const eDate = new Date(pDate);
        eDate.setFullYear(eDate.getFullYear() + 1);
        // Format as DD/MM/YYYY for readability
        warrantyExpiry = eDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      } else {
        warrantyExpiry = "12 " + (language === "vi" ? "tháng từ ngày mua" : "months from purchase");
      }
    } catch {
      warrantyExpiry = "12 " + (language === "vi" ? "tháng từ ngày mua" : "months from purchase");
    }

    // Format purchase date for display if it's a valid date
    let formattedPurchaseDate = purchaseDate;
    try {
      const pDate = new Date(purchaseDate);
      if (!isNaN(pDate.getTime())) {
        formattedPurchaseDate = pDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    } catch {}

    const db = await getDb();

    const registrationDoc = {
      hasSerial,
      serial: hasSerial === "yes" ? serial : "",
      model,
      purchaseDate: formattedPurchaseDate,
      warrantyExpiry,
      location,
      contact,
      invoiceImage: invoiceImage || null, // Might be a data URI
      userEmail: userEmail || null, // Associate with account if logged in
      status: "pending", // Default to pending approval
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection("registrations").insertOne(registrationDoc);

    if (!result.insertedId) {
      throw new Error("Failed to insert registration into database");
    }

    // Send confirmation email
    const emailToSend = userEmail || (contact.includes("@") ? contact : null);
    
    if (emailToSend) {
      try {
        const origin = new URL(request.url).origin;
        await fetch(`${origin}/api/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "registration",
            to: emailToSend,
            name: userEmail ? undefined : "Khách hàng",
            language,
            model,
            serial: hasSerial === "yes" ? serial : "Không có",
            purchaseDate: formattedPurchaseDate,
            warrantyExpiry,
          }),
        });
      } catch (err) {
        console.error("Failed to send registration email:", err);
        // We don't fail the registration if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: language === "vi" ? "Đăng ký sản phẩm thành công." : "Product registered successfully.",
      registrationId: result.insertedId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
