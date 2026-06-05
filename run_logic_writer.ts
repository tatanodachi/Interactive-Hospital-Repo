import fs from 'fs';

const lines = fs.readFileSync('./logic_clean.ts', 'utf-8').split('\n');

const startIndex = lines.findIndex(l => l.includes('const runConsolidatedEngine'));
let brackets = 0;
let endIndex = -1;
for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    for (const char of line) {
        if (char === '{') brackets++;
        if (char === '}') brackets--;
    }
    if (brackets === 0 && i > startIndex) {
        endIndex = i;
        break;
    }
}

const cleanedLogic = lines.slice(0, endIndex + 1).join('\n');

const runCode = `
${cleanedLogic}
const projConfig = { exitYear: 10, projYears: 10 };
const opCoData = runOpCoEngine(DEFAULT_OPCO_ASSUMPTIONS, projConfig);
const propCoData = runPropCoEngine(DEFAULT_PROPCO_ASSUMPTIONS, opCoData, projConfig);
const consolidatedData = runConsolidatedEngine(opCoData, propCoData, DEFAULT_OPCO_ASSUMPTIONS);

console.log('OpCo Metrics:', opCoData.metrics);
console.log('OpCo Totals:', opCoData.totals);
console.log('PropCo Metrics:', propCoData.metrics);
console.log('PropCo Totals:', propCoData.totals);
console.log('Consolidated Metrics:', consolidatedData.metrics);

`;

fs.writeFileSync('./simulate.ts', runCode);
