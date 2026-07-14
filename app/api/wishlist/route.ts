import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getDatabaseErrorMessage } from "@/lib/api-error";

function emailFrom(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function GET(request: Request) {
  try {
    const email = emailFrom(new URL(request.url).searchParams.get("email"));
    if (!email) return NextResponse.json({ success: false, error: "Sign in is required." }, { status: 401 });
    const db = await getDb();
    const items = await db.collection("wishlists").aggregate([
      { $match: { userEmail: email } },
      { $sort: { createdAt: -1 } },
      { $lookup: { from: "products", localField: "productSlug", foreignField: "slug", as: "product" } },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      { $project: { userEmail: 0 } },
    ]).toArray();
    const staleIds = items.filter((item) => !item.product || item.product.hidden || item.product.status === "deleted").map((item) => item._id);
    if (staleIds.length) await db.collection("wishlists").deleteMany({ _id: { $in: staleIds }, userEmail: email });
    return NextResponse.json({ success: true, items: items.filter((item) => !staleIds.some((id) => id.equals(item._id))).map((item) => ({ ...item, id: item._id.toString(), _id: undefined })) });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return NextResponse.json({ success: false, error: getDatabaseErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email: rawEmail, productSlug } = await request.json();
    const email = emailFrom(rawEmail);
    const slug = typeof productSlug === "string" ? productSlug.trim() : "";
    if (!email) return NextResponse.json({ success: false, error: "Sign in is required." }, { status: 401 });
    if (!slug) return NextResponse.json({ success: false, error: "Product is required." }, { status: 400 });
    const db = await getDb();
    const product = await db.collection("products").findOne({ slug, status: { $ne: "deleted" }, hidden: { $ne: true } }, { projection: { slug: 1 } });
    if (!product) return NextResponse.json({ success: false, error: "Product is no longer available." }, { status: 404 });
    const wishlists = db.collection("wishlists");
    await wishlists.createIndex({ userEmail: 1, productSlug: 1 }, { unique: true });
    const now = new Date();
    await wishlists.updateOne({ userEmail: email, productSlug: slug }, { $set: { updatedAt: now }, $setOnInsert: { userEmail: email, productSlug: slug, createdAt: now } }, { upsert: true });
    const item = await wishlists.findOne({ userEmail: email, productSlug: slug });
    return NextResponse.json({ success: true, item: item ? { ...item, id: item._id.toString(), _id: undefined } : null });
  } catch (error) {
    console.error("Create wishlist item error:", error);
    return NextResponse.json({ success: false, error: getDatabaseErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { email: rawEmail, itemIds } = await request.json();
    const email = emailFrom(rawEmail);
    if (!email) return NextResponse.json({ success: false, error: "Sign in is required." }, { status: 401 });
    if (!Array.isArray(itemIds) || itemIds.length === 0) return NextResponse.json({ success: false, error: "Wishlist items are required." }, { status: 400 });
    const { ObjectId } = await import("mongodb");
    const ids = itemIds.filter((id): id is string => typeof id === "string" && ObjectId.isValid(id)).map((id) => new ObjectId(id));
    if (!ids.length) return NextResponse.json({ success: false, error: "No valid wishlist items were provided." }, { status: 400 });
    const result = await (await getDb()).collection("wishlists").deleteMany({ _id: { $in: ids }, userEmail: email });
    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Delete wishlist items error:", error);
    return NextResponse.json({ success: false, error: getDatabaseErrorMessage(error) }, { status: 500 });
  }
}
