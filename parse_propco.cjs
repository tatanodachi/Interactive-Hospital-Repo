const fs = require('fs');
const code = fs.readFileSync('src/views/PropCoSettingsView.tsx', 'utf8');

const startMarker = `<div\n          className={\`grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-10 \${isPresenting ? "lg:grid-cols-4 2xl:grid-cols-5" : "lg:grid-cols-3"}\`}\n        >`;
const endMarker = `      </div>\n    );\n  },\n);`;

const startIndex = code.indexOf(startMarker);
const endIndex = code.lastIndexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find markers.");
  process.exit(1);
}

const mainContent = code.slice(startIndex + startMarker.length, endIndex);
console.log("Main content length:", mainContent.length);

// I'll extract sections using regex
const getSection = (title) => {
  const titleIndex = code.indexOf(`title="${title}"`);
  if (titleIndex === -1) return null;
  // find the closest preceding <div className="space-y-4">
  const divStart = code.lastIndexOf('<div className="space-y-4">', titleIndex);
  // naive way to find matching closing div (we know they are not deeply nested or we can just split by `<div className="space-y-4">`)
  return divStart;
}

