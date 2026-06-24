const fs = require('fs');
const glob = require('fs');

const files = [
    'src/views/OpCoDashboardView.tsx',
    'src/views/PropCoDashboardView.tsx',
    'src/views/ConsolidatedDashboardView.tsx',
    'src/views/OpCoSettingsView.tsx',
    'src/views/PropCoSettingsView.tsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/PRformatCurrency/g, 'formatCurrency');
    fs.writeFileSync(file, content);
});

// also check App.tsx to export formatCurrency, formatNumber, formatPercent
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
['formatCurrency', 'formatNumber', 'formatPercent'].forEach(name => {
    const regex1 = new RegExp(`^const ${name} = `, 'gm');
    appContent = appContent.replace(regex1, `export const ${name} = `);
});
fs.writeFileSync('src/App.tsx', appContent);
console.log('Fixed');
