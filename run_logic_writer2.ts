import fs from 'fs';
const base = fs.readFileSync('./simulate.ts', 'utf-8');
const append = `
console.log('OpCo partnerA:', opCoData.partnerA);
`;
fs.writeFileSync('./simulate2.ts', base + append);
