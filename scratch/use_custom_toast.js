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
  
  content = content.replace(/import \{ toast \} from "react-hot-toast";/g, 'import { showToast } from "@/app/toast";');
  content = content.replace(/toast\.success\(([^)]+)\)/g, 'showToast($1, "success")');
  content = content.replace(/toast\.error\(([^)]+)\)/g, 'showToast($1, "error")');
  // For toast(message) without success/error, like in orders/page.tsx and warranties/page.tsx
  // We need to match toast(...) but NOT showToast(...)
  // So match \btoast\(
  content = content.replace(/\btoast\(([^)]+)\)/g, 'showToast($1)');
  
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
});
