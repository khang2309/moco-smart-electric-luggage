#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const catalogProducts = [
  {
    slug: "moco-go",
    name: "MOCO Go",
    nameEn: "MOCO Go",
    description: "Phiên bản tiêu chuẩn với hệ thống lái điện tích hợp, hỗ trợ người dùng di chuyển thuận tiện tại sân bay, nhà ga, khu du lịch và các không gian rộng lớn.",
    descriptionEn: "The standard edition with integrated electric driving for airports, stations, travel areas, and large spaces.",
    subtitle: "Vali điện thông minh (Tiêu chuẩn)",
    subtitleEn: "Smart electric luggage (Standard)",
    image: "/assets/Product/mocoGO.png",
    price: 12900000,
    oldPrice: 15900000,
    stock: 24,
    store: "MOCO Official",
    features: ["ride", "removableBattery", "phoneCharge", "airlineBattery", "brake", "lock"]
  },
  {
    slug: "moco-plus",
    name: "MOCO Plus",
    nameEn: "MOCO Plus",
    description: "Phiên bản vali điện có thể lái được, tích hợp hệ thống định vị GPS và chế độ tự động đi theo người dùng, cho phép vali nhận diện và di chuyển theo chủ sở hữu thông qua kết nối Bluetooth và ứng dụng trên điện thoại.",
    descriptionEn: "A rideable electric luggage edition with GPS positioning and automatic follow mode, allowing the suitcase to recognize and move with its owner through Bluetooth and the mobile app.",
    subtitle: "Vali điện tự động đi theo (GPS)",
    subtitleEn: "Auto-follow electric luggage (GPS)",
    image: "/assets/Product/mocoPLUS.png",
    price: 16900000,
    oldPrice: 19900000,
    stock: 18,
    store: "MOCO Official",
    features: ["ride", "follow", "gps", "app", "removableBattery", "phoneCharge", "airlineBattery", "brake", "lock"]
  },
  {
    slug: "moco-pro",
    name: "MOCO Pro",
    nameEn: "MOCO Pro",
    description: "Phiên bản vali điện có thể lái được, tích hợp GPS, chế độ tự động đi theo người dùng thông qua Bluetooth và ứng dụng điện thoại, đồng thời được trang bị hệ thống cảm biến tránh vật cản thông minh giúp vali di chuyển an toàn hơn trong môi trường đông người.",
    descriptionEn: "A rideable electric luggage edition with GPS, Bluetooth app follow mode, and intelligent obstacle avoidance sensors for safer movement in crowded environments.",
    subtitle: "Cảm biến tránh vật cản",
    subtitleEn: "Obstacle avoidance sensors",
    image: "/assets/Product/mocoPRO.png",
    price: 20900000,
    oldPrice: 24900000,
    stock: 12,
    store: "MOCO Official",
    features: ["ride", "follow", "obstacle", "gps", "alarm", "app", "removableBattery", "phoneCharge", "airlineBattery", "brake", "lock"]
  },
  {
    slug: "moco-max",
    name: "MOCO Max",
    nameEn: "MOCO Max",
    description: "Phiên bản vali điện cao cấp nhất, tích hợp GPS, chế độ tự động đi theo người dùng thông qua Bluetooth và ứng dụng điện thoại, cùng hệ thống cảm biến tránh vật cản thông minh, mang đến trải nghiệm di chuyển toàn diện.",
    descriptionEn: "The most advanced electric luggage edition with GPS, Bluetooth app follow mode, and intelligent obstacle avoidance sensors for a complete mobility experience.",
    subtitle: "Trải nghiệm di chuyển toàn diện",
    subtitleEn: "Full smart mobility suite",
    image: "/assets/Product/mocoMAX.png",
    price: 24900000,
    oldPrice: 29900000,
    stock: 8,
    store: "MOCO Official",
    features: ["ride", "follow", "obstacle", "gps", "alarm", "light", "app", "removableBattery", "phoneCharge", "airlineBattery", "brake", "lock"]
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
