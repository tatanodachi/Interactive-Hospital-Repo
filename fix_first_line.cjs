const fs = require('fs');

function fixFirstLine(file, originalFirstLine) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/export const [a-zA-Z]+ = memo\(/, 'export const ' + originalFirstLine);
    fs.writeFileSync(file, content);
}

fixFirstLine('src/views/OpCoSensitivityView.tsx', 'OpCoSensitivityView = memo(({ assumptions }: any) => {');
fixFirstLine('src/views/PropCoSensitivityView.tsx', 'PropCoSensitivityView = memo(({ assumptions, opCoModelData, groups }: any) => {');
fixFirstLine('src/views/ProjectOverviewView.tsx', 'ProjectOverviewView = memo(({ info, setInfo, isLocked }: any) => (');
fixFirstLine('src/views/CollaborationStrategyView.tsx', 'CollaborationStrategyView = memo(({ isPresenting }: any) => (');
