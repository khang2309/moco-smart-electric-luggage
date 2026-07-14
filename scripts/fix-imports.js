const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./app').concat(walk('./components'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('providers')) {
    const updatedContent = content.replace(/import\s+\{([^}]*useLanguage[^}]*)\}\s+from\s+['"](.*)providers['"]/g, (match, p1, p2) => {
      return `import {${p1}} from '${p2}LanguageProvider'`;
    });
    if (updatedContent !== content) {
      console.log(`Updated ${file}`);
      fs.writeFileSync(file, updatedContent);
    }
  }
});
