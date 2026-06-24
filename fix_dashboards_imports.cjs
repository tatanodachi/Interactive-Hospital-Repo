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

const files = [
    'src/views/OpCoDashboardView.tsx',
    'src/views/PropCoDashboardView.tsx',
    'src/views/ConsolidatedDashboardView.tsx',
    'src/views/OpCoSettingsView.tsx',
    'src/views/PropCoSettingsView.tsx'
];

files.forEach(fixImports);
console.log('Fixed dashboard imports');
