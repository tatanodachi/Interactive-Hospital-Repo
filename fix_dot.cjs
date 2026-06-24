const fs = require('fs');

function fixViews(file) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/tooltip=\{\./g, 'tooltip={CONSOLIDATED_FORMULAS.');
    fs.writeFileSync(file, content);
}

fixViews('src/views/ConsolidatedCascadeView.tsx');
console.log('Fixed');
