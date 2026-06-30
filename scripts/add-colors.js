const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://mocoluggage_admin:mocoluggageadmin123@cluster.5wetm3b.mongodb.net/moco?retryWrites=true&w=majority";

if (!uri) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    const db = client.db("moco");
    const products = db.collection("products");

    const defaultColors = [
      { name: "Đen", hex: "#1A1A1A", image: "/assets/Product/mocoPLUS.png" },
      { name: "Trắng", hex: "#F8F9FA", image: "/assets/Product/mocoGO.png" },
      { name: "Hồng", hex: "#F7CAD0", image: "/assets/Product/mocoMAX.png" },
      { name: "Xanh", hex: "#2A4365", image: "/assets/Product/mocoPRO.png" }
    ];

    const result = await products.updateMany(
      {}, // all products
      {
        $set: { colors: defaultColors }
      }
    );

    console.log(`Updated ${result.modifiedCount} products with colors.`);
  } catch (error) {
    console.error("Error updating products:", error);
  } finally {
    await client.close();
  }
}

main();
