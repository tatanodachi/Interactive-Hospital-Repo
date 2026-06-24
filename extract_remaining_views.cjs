const fs = require('fs');

function extractView(viewName, fileName) {
    let content = fs.readFileSync('src/App.tsx', 'utf-8');
    const lines = content.split('\n');

    const startStr = `export const ${viewName} = memo(`;
    let startIdx = lines.findIndex(line => line.startsWith(startStr));
    if (startIdx === -1) {
        startIdx = lines.findIndex(line => line.startsWith(`const ${viewName} = memo(`));
    }
    
    if (startIdx === -1) {
        console.error(`Could not find ${viewName}`);
        return;
    }

    let endIdx = -1;
    let openBraces = 0;
    let started = false;

    for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i];
        openBraces += (line.match(/\{/g) || []).length;
        openBraces -= (line.match(/\}/g) || []).length;
        openBraces += (line.match(/\(/g) || []).length;
        openBraces -= (line.match(/\)/g) || []).length;
        
        if (openBraces > 0) started = true;
        if (started && openBraces === 0) {
            endIdx = i;
            if (lines[i].endsWith(');')) {
                endIdx = i;
                break;
            }
        }
    }

    if (endIdx === -1) {
        console.error(`Could not find end of ${viewName}`);
        return;
    }

    const extractedLines = lines.slice(startIdx, endIdx + 1);
    
    // Add export to the extracted component
    extractedLines[0] = `export const ${viewName} = memo(`;
    
    // Add imports for the new file
    const newFileContent = `import React, { memo, useState, useRef, useMemo, useEffect } from 'react';
import { Briefcase, Target, Settings, Maximize2, Minimize2, ChevronDown, ChevronRight, Calculator, PieChart, Activity, TrendingUp, Info, Users, Clock, ArrowRight, Lock, Unlock, RefreshCw } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { 
  useMonthlyColumns, formatCurrency, formatNumber, formatPercent,
  StatefulTooltipIcon, LazyResponsiveContainer, TableRow, ExpandableSectionHeader,
  NavButton, TimelineNode, Tooltip as CustomTooltip
} from '../App';
import { OPCO_FORMULAS, PROPCO_FORMULAS, CONSOLIDATED_FORMULAS } from '../formulaTooltips';

${extractedLines.join('\n')}
`;

    fs.writeFileSync(`src/views/${fileName}.tsx`, newFileContent);
    console.log(`Extracted ${viewName} to src/views/${fileName}.tsx`);

    // Remove from App.tsx and add import
    const newAppContent = [
        ...lines.slice(0, startIdx),
        ...lines.slice(endIdx + 1)
    ];

    // Find where to insert the import
    const importIdx = newAppContent.findIndex(line => line.includes('import { MasterTimelineView }'));
    if (importIdx !== -1) {
        newAppContent.splice(importIdx + 1, 0, `import { ${viewName} } from './views/${fileName}';`);
    } else {
        newAppContent.unshift(`import { ${viewName} } from './views/${fileName}';`);
    }
    
    fs.writeFileSync('src/App.tsx', newAppContent.join('\n'));
    console.log(`Removed ${viewName} from App.tsx`);
}

extractView('ProjectOverviewView', 'ProjectOverviewView');
extractView('CollaborationStrategyView', 'CollaborationStrategyView');
extractView('StudyView', 'StudyView');
extractView('OpCoSensitivityView', 'OpCoSensitivityView');
extractView('PropCoSensitivityView', 'PropCoSensitivityView');
