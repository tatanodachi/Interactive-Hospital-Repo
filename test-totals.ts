import { simulatePropCo } from './simulate.ts';
import fs from 'fs';

const p = simulatePropCo();
console.log(p.totals.devCar);
console.log(p.totals);
