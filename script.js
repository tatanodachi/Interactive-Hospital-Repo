import fs from 'fs';
import * as esbuild from 'esbuild';

async function test() {
  const content = fs.readFileSync('src/App.tsx', 'utf8');
  try {
    const res = await esbuild.transform(content, { loader: 'tsx' });
    console.log('Build passed locally!');
  } catch(e) {
    console.log('Error snippet:', e.errors[0]?.text);
    console.log('Location:', e.errors[0]?.location);
  }
}
test();









