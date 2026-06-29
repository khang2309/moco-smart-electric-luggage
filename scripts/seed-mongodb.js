#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const catalogProducts = [
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

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getInventoryStatus(stock) {
  if (stock <= 0) return "out_of_stock";
  if (stock <= 5) return "low_stock";
  return "in_stock";
}

async function seedProductsAndInventory(db) {
  const products = db.collection("products");
  const inventory = db.collection("inventory");
  const now = new Date();

  await products.createIndex({ slug: 1 }, { unique: true, sparse: true });
  await inventory.createIndex({ productId: 1 }, { unique: true, sparse: true });
  await inventory.createIndex({ slug: 1 }, { sparse: true });

  let productCount = 0;
  let inventoryCount = 0;

  for (const product of catalogProducts) {
    const result = await products.findOneAndUpdate(
      { slug: product.slug },
      {
        $set: {
          ...product,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    const savedProduct = result;
    if (!savedProduct) continue;

    productCount += 1;
    const stock = Number(savedProduct.stock) || 0;
    await inventory.updateOne(
      { productId: savedProduct._id.toString() },
      {
        $set: {
          productId: savedProduct._id.toString(),
          slug: savedProduct.slug || "",
          productName: savedProduct.name || "",
          stock,
          price: Number(savedProduct.price) || 0,
          image: savedProduct.image || "",
          status: getInventoryStatus(stock),
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true },
    );
    inventoryCount += 1;
  }

  return { productCount, inventoryCount };
}

async function upsertAdminUser(db) {
  const adminEmail = process.env.ADMIN_EMAIL || process.argv[2];
  const adminPassword = process.env.ADMIN_PASSWORD || process.argv[3];

  if (!adminEmail || !adminPassword) {
    return { skipped: true };
  }

  const users = db.collection("users");
  const normalizedEmail = adminEmail.trim().toLowerCase();
  const existing = await users.findOne({ email: normalizedEmail });
  const password = await bcrypt.hash(adminPassword, 10);
  const now = new Date();

  if (existing) {
    await users.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          role: "admin",
          password,
          updatedAt: now,
        },
      },
    );
    return { email: normalizedEmail, created: false };
  }

  await users.insertOne({
    email: normalizedEmail,
    name: "MOCO Admin",
    phone: "",
    city: "",
    address: "",
    role: "admin",
    password,
    createdAt: now,
    updatedAt: now,
  });

  return { email: normalizedEmail, created: true };
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env.local"));

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI. Add it to .env.local or the deployment environment.");
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db();
    const { productCount, inventoryCount } = await seedProductsAndInventory(db);
    const adminResult = await upsertAdminUser(db);

    console.log(`Seeded products: ${productCount}`);
    console.log(`Synced inventory: ${inventoryCount}`);
    if (adminResult.skipped) {
      console.log("Admin user: skipped. Pass ADMIN_EMAIL/ADMIN_PASSWORD or CLI args to create one.");
    } else {
      console.log(`Admin user: ${adminResult.created ? "created" : "updated"} ${adminResult.email}`);
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
