const fs = require('fs');

const files = [
  './app/admin/products/page.tsx',
  './app/admin/orders/page.tsx',
  './app/admin/warranties/page.tsx',
  './app/admin/users/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Find "use client"; and remove it
  const hasUseClient = content.includes('"use client";');
  if (hasUseClient) {
    content = content.replace(/"use client";\r?\n?/g, '');
    // Prepend it to the top
    content = '"use client";\n' + content;
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  }
});
