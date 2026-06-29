import type { Db, Document, ObjectId, WithId } from "mongodb";

type InventoryItem = {
  slug?: string;
  quantity?: number;
};

type ProductDocument = WithId<Document> & {
  _id: ObjectId;
  slug?: string;
  name?: string;
  stock?: number;
  price?: number;
  image?: string;
};

function getInventoryStatus(stock: number) {
  if (stock <= 0) return "out_of_stock";
  if (stock <= 5) return "low_stock";
  return "in_stock";
}

export async function ensureInventoryIndexes(db: Db) {
  const inventory = db.collection("inventory");
  await inventory.createIndex({ productId: 1 }, { unique: true, sparse: true });
  await inventory.createIndex({ slug: 1 }, { sparse: true });
}

export async function syncInventoryForProduct(db: Db, product: ProductDocument | null) {
  if (!product) return null;

  await ensureInventoryIndexes(db);
  const inventory = db.collection("inventory");
  const now = new Date();
  const stock = Number(product.stock) || 0;
  const productId = product._id.toString();

  await inventory.updateOne(
    { productId },
    {
      $set: {
        productId,
        slug: product.slug || "",
        productName: product.name || "",
        stock,
        price: Number(product.price) || 0,
        image: product.image || "",
        status: getInventoryStatus(stock),
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );

  return inventory.findOne({ productId });
}

export async function syncInventoryForProducts(db: Db, products: ProductDocument[]) {
  await Promise.all(products.map((product) => syncInventoryForProduct(db, product)));
}

export async function deleteInventoryForProduct(db: Db, productId: string) {
  await db.collection("inventory").deleteOne({ productId });
}

export async function decreaseInventoryForOrder(
  db: Db,
  items: InventoryItem[],
  orderCode: string,
) {
  const products = db.collection("products");
  const inventory = db.collection("inventory");
  await ensureInventoryIndexes(db);

  for (const item of items) {
    if (!item.slug) continue;

    const quantity = Math.max(1, Number(item.quantity) || 1);
    const updatedProduct = await products.findOneAndUpdate(
      { slug: item.slug },
      {
        $inc: { stock: -quantity },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" },
    );

    if (updatedProduct) {
      const syncedInventory = await syncInventoryForProduct(db, updatedProduct as ProductDocument);
      if (syncedInventory) {
        await inventory.updateOne(
          { _id: syncedInventory._id },
          {
            $set: {
              lastOrderCode: orderCode,
              lastMovement: "order_decrease",
              lastMovementQuantity: -quantity,
              updatedAt: new Date(),
            },
          },
        );
      }
    }
  }
}
