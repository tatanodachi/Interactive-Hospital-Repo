const fs = require('fs');

function fixViews(file) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Replace any remaining \n spaces .prop with OPCO/PROPCO
    content = content.replace(/\s+\.([a-zA-Z0-9_]+)/g, (match, p1) => {
        if (p1 === 'map' || p1 === 'length' || p1 === 'reduce' || p1 === 'filter' || p1 === 'toFixed') {
            return match; // don't touch standard methods
        }
        if (file.includes('OpCo')) return match.replace('.'+p1, 'OPCO_FORMULAS.'+p1);
        if (file.includes('PropCo')) return match.replace('.'+p1, 'PROPCO_FORMULAS.'+p1);
        if (file.includes('Consolidated')) return match.replace('.'+p1, 'CONSOLIDATED_FORMULAS.'+p1);
        return match;
    });

    fs.writeFileSync(file, content);
}

fixViews('src/views/OpCoCascadeView.tsx');
fixViews('src/views/PropCoCascadeView.tsx');
fixViews('src/views/ConsolidatedCascadeView.tsx');
console.log('Fixed');
