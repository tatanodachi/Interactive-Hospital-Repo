import fs from 'fs';

let content = fs.readFileSync('./src/App.tsx', 'utf8');

const regex = /const buildCost =([\s\S]*?)const devYears = Math.max/m;
const match = content.match(regex);
if (match) {
  let code = match[1];
  console.log("Extracted code snippet length:", code.length);
} else {
  console.log("No match");
}
