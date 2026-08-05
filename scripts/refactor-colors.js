const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./app');

files.forEach(f => {
  if (f.includes('colors.js')) return; // Skip the colors file itself
  
  let content = fs.readFileSync(f, 'utf8');
  
  // Find the C object declaration
  const regex = /const C = \{[\s\S]*?\};/g;
  
  if (content.match(regex)) {
    // Determine relative path to app/lib/colors.js
    // relative to the current file
    const fileDepth = f.split(path.sep).length - 2; // app/ is depth 0
    let prefix = '';
    if (fileDepth === 0) {
      prefix = './lib/';
    } else {
      prefix = '../'.repeat(fileDepth) + 'lib/';
    }
    
    // Replace the object with an import statement
    const importStmt = `import { C } from '${prefix}colors';`;
    content = content.replace(regex, importStmt);
    
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Updated: ${f}`);
  }
});

console.log('Refactor complete!');
