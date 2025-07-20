const fs = require('fs');
const path = require('path');

function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Update relative imports to include .ts extension
  const importRegex = /from\s+['"](\.\.\/[^'"]+)['"]/g;
  const matches = content.match(importRegex);
  
  if (matches) {
    matches.forEach(match => {
      const importPath = match.match(/from\s+['"]([^'"]+)['"]/)[1];
      
      // Skip if already has .ts extension or is a package import
      if (!importPath.endsWith('.ts') && !importPath.startsWith('@') && !importPath.startsWith('three')) {
        const newImport = `from '${importPath}.ts'`;
        content = content.replace(match, newImport);
        updated = true;
      }
    });
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      updateImportsInFile(filePath);
    }
  });
}

console.log('Updating import statements to include .ts extensions...');
walkDir('./src');
console.log('Done!'); 