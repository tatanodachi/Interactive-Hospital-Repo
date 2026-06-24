const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// List of components/constants to export
const toExport = [
    'TableRow',
    'ExpandableSectionHeader',
    'LazyResponsiveContainer',
    'OPCO_FORMULAS',
    'PROPCO_FORMULAS',
    'CONSOLIDATED_FORMULAS',
    'useMonthlyColumns',
    'NavButton',
    'TimelineNode',
    'StatefulTooltipIcon'
];

toExport.forEach(name => {
    // Replace 'const Name = ' with 'export const Name = '
    const regex1 = new RegExp(`^const ${name} = `, 'gm');
    content = content.replace(regex1, `export const ${name} = `);
    
    // Replace 'const Name: ' with 'export const Name: '
    const regex2 = new RegExp(`^const ${name}: `, 'gm');
    content = content.replace(regex2, `export const ${name}: `);
});

fs.writeFileSync('src/App.tsx', content);
console.log('Exported missing components');
