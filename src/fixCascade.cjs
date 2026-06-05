const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden sticky top-4 z-10 max-h-[calc(100vh-2rem)] flex flex-col"`;
const replacementStr = `className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden h-[calc(100vh-220px)] flex flex-col"`;

content = content.split(targetStr).join(replacementStr);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed Cascade heights.');
