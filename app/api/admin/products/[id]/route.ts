import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getDatabaseErrorMessage } from "@/lib/api-error";
import { deleteInventoryForProduct, syncInventoryForProduct } from "@/lib/inventory";
import { ObjectId } from "mongodb";

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// PUT /api/admin/products/:id - Update product
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { slug, name, description, price, oldPrice, image, stock, store, subtitle } = await request.json();

    if (!name || !price) {
      return NextResponse.json(
        { error: "Name and price are required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const products = db.collection("products");
    const normalizedSlug = slug ? createSlug(String(slug)) : createSlug(String(name));

    const result = await products.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          slug: normalizedSlug,
          name,
          description: description || "",
          price: Number(price),
          oldPrice: Number(oldPrice) || 0,
          image: image || "",
          stock: Number(stock) || 0,
          store: store || "MOCO Official",
          subtitle: subtitle || description || "",
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }
    await syncInventoryForProduct(db, result);

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: result,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/:id - Delete product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const products = db.collection("products");

    const result = await products.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }
    await deleteInventoryForProduct(db, id);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 }
    );
  }
}

// GET /api/admin/products/:id - Get single product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const products = db.collection("products");

    const product = await products.findOne({ _id: new ObjectId(id) });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 }
    );
  }
}
