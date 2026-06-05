import fs from 'fs';

const oldLogic = fs.readFileSync('./simulate.ts', 'utf8');
const newLogic = fs.readFileSync('./simulate2.ts', 'utf8');
