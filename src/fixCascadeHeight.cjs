const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/h-\[calc\(100vh-220px\)\]/g, 'h-[calc(100vh-320px)]');

fs.writeFileSync('src/App.tsx', content);
console.log('Adjusted heights to 320px');
