import fs from 'fs';

const lines = fs.readFileSync('./logic.ts', 'utf-8').split('\n');
const cleaned = lines.map(l => l.replace(/^[0-9]+[:-]/, ''));
fs.writeFileSync('./logic_clean.ts', cleaned.join('\n'));
