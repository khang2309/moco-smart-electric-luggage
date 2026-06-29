#!/usr/bin/env node

/**
 * Admin Setup Script
 * Giúp phân quyền admin cho một người dùng
 * 
 * Sử dụng:
 * node scripts/setup-admin.js admin@example.com your-admin-secret-key
 */

const http = require('http');

async function makeRequest(method, path, body, secretKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': secretKey,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data),
          });
        } catch {
          resolve({
            status: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function setupAdmin(email, secretKey) {
  console.log('🔐 MOCO Admin Setup');
  console.log('==================\n');

  if (!email || !secretKey) {
    console.error('❌ Error: Email and secret key are required');
    console.error('Usage: node scripts/setup-admin.js <email> <secret-key>');
    process.exit(1);
  }

  try {
    console.log(`📧 Setting admin role for: ${email}`);

    const response = await makeRequest(
      'POST',
      '/api/admin/set-admin',
      { email, makeAdmin: true },
      secretKey
    );

    if (response.status === 200) {
      console.log('✅ Success!');
      console.log(`Admin role assigned to ${email}`);
      console.log('\nNext steps:');
      console.log('1. Go to http://localhost:3000/login');
      console.log('2. Login with your admin account');
      console.log('3. Access http://localhost:3000/admin');
    } else {
      console.error('❌ Error:', response.body.error || response.body);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nMake sure:');
    console.error('- Your Next.js dev server is running on http://localhost:3000');
    console.error('- You have ADMIN_SECRET_KEY set in your .env.local');
    console.error('- The email belongs to an existing user account');
    process.exit(1);
  }
}

const email = process.argv[2];
const secretKey = process.argv[3] || process.env.ADMIN_SECRET_KEY;

setupAdmin(email, secretKey);
