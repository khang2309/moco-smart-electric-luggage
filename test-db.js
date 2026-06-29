const fs = require('fs');
const { MongoClient } = require('mongodb');

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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function run() {
  loadEnvFile('.env.local');
  const uri = process.env.MONGODB_URI;
  console.log("URI starts with:", uri.substring(0, 30));
  const client = new MongoClient(uri);
  await client.connect();
  const user = await client.db().collection('users').findOne({ email: 'admin@moco.com' });
  console.log('USER:', user);
  await client.close();
}

run().catch(console.error);
