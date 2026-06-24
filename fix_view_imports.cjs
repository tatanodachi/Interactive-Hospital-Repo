const fs = require('fs');

function fixImports(file) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Remove OPCO_FORMULAS, PROPCO_FORMULAS, CONSOLIDATED_FORMULAS from App.tsx imports
    content = content.replace(/OPCO_FORMULAS,?\s*/g, '');
    content = content.replace(/PROPCO_FORMULAS,?\s*/g, '');
    content = content.replace(/CONSOLIDATED_FORMULAS,?\s*/g, '');

    // Add import for them
    content = content.replace(/import \{.*\} from '\.\.\/App';/g, (match) => {
        return `import { OPCO_FORMULAS, PROPCO_FORMULAS, CONSOLIDATED_FORMULAS } from '../formulaTooltips';\n${match}`;
    });

    fs.writeFileSync(file, content);
}

['src/views/OpCoCascadeView.tsx', 'src/views/PropCoCascadeView.tsx', 'src/views/ConsolidatedCascadeView.tsx'].forEach(fixImports);
console.log('Fixed imports in views');
