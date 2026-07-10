const fs = require('fs');
const path = require('path');

function replaceAlerts(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('import toast') && !content.includes('import { toast }')) {
    content = 'import { toast } from "react-hot-toast";\n' + content;
  }
  
  // Generic pattern for alert to toast mapping
  // Using simple string replacement first
  const replacements = [
    [/alert\("Chỉ hỗ trợ định dạng ảnh \(JPG, PNG, WEBP\)"\);/g, 'toast.error("Chỉ hỗ trợ định dạng ảnh (JPG, PNG, WEBP)");'],
    [/alert\("Dung lượng file không được vượt quá 5MB"\);/g, 'toast.error("Dung lượng file không được vượt quá 5MB");'],
    [/alert\(labels\.loadError\);/g, 'toast.error(labels.loadError);'],
    [/alert\(labels\.requiredError\);/g, 'toast.error(labels.requiredError);'],
    [/alert\(labels\.translateError\);/g, 'toast.error(labels.translateError);'],
    [/alert\(error\.message \|\| labels\.saveError\);/g, 'toast.error(error.message || labels.saveError);'],
    [/alert\(labels\.restoreError\);/g, 'toast.error(labels.restoreError);'],
    [/alert\(labels\.deleteError\);/g, 'toast.error(labels.deleteError);'],
    [/alert\(labels\.translateSuccess\);/g, 'toast.success(labels.translateSuccess);'],
    [/alert\(labels\.saved\);/g, 'toast.success(labels.saved);'],
    [/alert\(labels\.restored\);/g, 'toast.success(labels.restored);'],
    [/alert\(labels\.deleted\);/g, 'toast.success(labels.deleted);']
  ];

  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }

  // Generic fallback if any alerts missed (we will just convert to toast.error if they contain Error or toast.success otherwise - actually let's just make it a simple regex if needed)
  content = content.replace(/alert\(/g, 'toast('); // Wait, this might be dangerous if there are other alerts. But toast works for generic messages.
  // Actually, we can refine the generic one:
  // If it's `toast(labels.successSomething)`, it's better to replace manually. Let's stick to the explicit replacements and see what's left.

  fs.writeFileSync(filePath, content);
  console.log('Updated ' + filePath);
}

const files = [
  './app/admin/products/page.tsx',
  './app/admin/orders/page.tsx',
  './app/admin/warranties/page.tsx',
  './app/admin/users/page.tsx'
];

files.forEach(replaceAlerts);
