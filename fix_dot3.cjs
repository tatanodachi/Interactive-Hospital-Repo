const fs = require('fs');

function fixViews(file) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Replace tooltip={.prop}
    content = content.replace(/tooltip=\{\.([a-zA-Z0-9_]+)\}/g, (match, p1) => {
        if (file.includes('OpCo')) return `tooltip={OPCO_FORMULAS.${p1}}`;
        if (file.includes('PropCo')) return `tooltip={PROPCO_FORMULAS.${p1}}`;
        if (file.includes('Consolidated')) return `tooltip={CONSOLIDATED_FORMULAS.${p1}}`;
        return match;
    });
    
    // Also cover tooltip={
    //   .prop
    // }
    content = content.replace(/\{\s*\.([a-zA-Z0-9_]+)\s*\}/g, (match, p1) => {
        if (file.includes('OpCo')) return `{OPCO_FORMULAS.${p1}}`;
        if (file.includes('PropCo')) return `{PROPCO_FORMULAS.${p1}}`;
        if (file.includes('Consolidated')) return `{CONSOLIDATED_FORMULAS.${p1}}`;
        return match;
    });

    fs.writeFileSync(file, content);
}

fixViews('src/views/OpCoCascadeView.tsx');
fixViews('src/views/PropCoCascadeView.tsx');
fixViews('src/views/ConsolidatedCascadeView.tsx');
console.log('Fixed');
