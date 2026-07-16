const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const files = glob.sync('src/**/*.jsx');

files.forEach((f) => {
  const content = fs.readFileSync(f, 'utf8');
  if (!content.includes('tailwind-motion')) return;

  const rel = path.relative('src', f);
  const depth = rel.split(path.sep).length - 1;
  const prefix = '../'.repeat(depth);
  const correctImport = `${prefix}lib/tailwind-motion`.replace(/\/+/g, '/');

  let fixed = content;
  const importRegex = /from\s+['"].*?lib\/tailwind-motion['"]/g;
  const matches = content.match(importRegex);
  
  if (matches) {
    matches.forEach((m) => {
      fixed = fixed.replace(m, `from '${correctImport}'`);
    });
    fs.writeFileSync(f, fixed);
    console.log(`Fixed ${f} -> ${correctImport}`);
  }
});

console.log('Done');
