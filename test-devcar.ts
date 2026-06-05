import { simulatePropCo } from './simulate2.ts';
import fs from 'fs';

const props = JSON.parse(fs.readFileSync('metadata.json', 'utf8') || '{}');
// Just manually run with defaults inside simulate2.ts
// simulate2.ts defines `export const simulatePropCo = (customAssumptions: Partial<Assumptions> = {}) => { ... }`
// The default is `initialAssumptions`

let data = simulatePropCo();
console.log("devCar total:", data.totals.devCar);
console.log("devGa total:", data.totals.devGa);
