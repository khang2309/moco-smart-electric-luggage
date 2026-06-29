import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getDatabaseErrorMessage } from "@/lib/api-error";
import { syncInventoryForProduct, syncInventoryForProducts } from "@/lib/inventory";
import type { Collection, Document, WithId } from "mongodb";

type CatalogProduct = {
  slug: string;
  name: string;
  description: string;
  image: string;
  price: number;
  oldPrice: number;
  stock: number;
  store: string;
  subtitle: string;
};

const catalogProducts: CatalogProduct[] = [
  {
    slug: "moco-go",
    name: "MOCO Go",
    description: "Smart electric luggage",
    image: "/assets/Product/mocoGO.png",
    price: 12900000,
    oldPrice: 15900000,
    stock: 24,
    store: "MOCO Official",
    subtitle: "Smart electric luggage",
  },
  {
    slug: "moco-plus",
    name: "MOCO Plus",
    description: "GPS and auto-follow",
    image: "/assets/Product/mocoPLUS.png",
    price: 16900000,
    oldPrice: 19900000,
    stock: 18,
    store: "MOCO Official",
    subtitle: "GPS and auto-follow",
  },
  {
    slug: "moco-pro",
    name: "MOCO Pro",
    description: "Obstacle avoidance sensors",
    image: "/assets/Product/mocoPRO.png",
    price: 20900000,
    oldPrice: 24900000,
    stock: 12,
    store: "MOCO Official",
    subtitle: "Obstacle avoidance sensors",
  },
  {
    slug: "moco-max",
    name: "MOCO Max",
    description: "Full smart mobility suite",
    image: "/assets/Product/mocoMAX.png",
    price: 24900000,
    oldPrice: 29900000,
    stock: 8,
    store: "MOCO Official",
    subtitle: "Full smart mobility suite",
  },
];

async function seedMissingCatalogProducts(products: Collection<Document>) {
  const catalogSlugs = catalogProducts.map((product) => product.slug);
  const existingCatalog = await products
    .find({ slug: { $in: catalogSlugs } }, { projection: { slug: 1 } })
    .toArray();
  const existingSlugs = new Set(existingCatalog.map((product) => product.slug));
  const missingProducts = catalogProducts.filter((product) => !existingSlugs.has(product.slug));

  if (missingProducts.length === 0) {
    return 0;
  }

  const now = new Date();
  await products.createIndex({ slug: 1 }, { unique: true, sparse: true });
  await products.bulkWrite(
    missingProducts.map((product) => ({
      updateOne: {
        filter: { slug: product.slug },
        update: {
          $setOnInsert: {
            ...product,
            createdAt: now,
            updatedAt: now,
          },
        },
        upsert: true,
      },
    })),
  );

  return missingProducts.length;
}

export async function GET() {
  try {
    const db = await getDb();
    const products = db.collection("products");
    const seededCount = await seedMissingCatalogProducts(products);

    const productsList = await products
      .find({})
      .sort({ createdAt: 1, name: 1 })
      .toArray();
    await syncInventoryForProducts(db, productsList as WithId<Document>[]);

    return NextResponse.json({
      success: true,
      products: productsList,
      total: productsList.length,
      seeded: seededCount,
      source: seededCount > 0 ? "seeded" : "database",
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { slug, name, description, price, oldPrice, image, stock, store, subtitle } = await request.json();

    if (!name || !price) {
      return NextResponse.json(
        { error: "Name and price are required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const products = db.collection("products");
    const normalizedSlug = slug || String(name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const newProduct = {
      slug: normalizedSlug,
      name,
      description: description || "",
      price: Number(price),
      oldPrice: Number(oldPrice) || 0,
      image: image || "",
      stock: Number(stock) || 0,
      store: store || "MOCO Official",
      subtitle: subtitle || description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await products.insertOne(newProduct);
    const product = { _id: result.insertedId, ...newProduct };
    await syncInventoryForProduct(db, product);

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 }
    );
  }
}
