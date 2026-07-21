const fs = require('fs');

const code = fs.readFileSync('src/views/PropCoSettingsView.tsx', 'utf8');

// We can just use string replacements.
// Find the main div that contains the grid:
// <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-10 ${isPresenting ? "lg:grid-cols-4 2xl:grid-cols-5" : "lg:grid-cols-3"}`}>

const startMarker = `<div\n          className={\`grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-10 \${isPresenting ? "lg:grid-cols-4 2xl:grid-cols-5" : "lg:grid-cols-3"}\`}\n        >`;
const endMarker = `        </div>\n      </div>\n    );\n  },\n);`;

const startIndex = code.indexOf(startMarker);
const endIndex = code.lastIndexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find markers.");
  process.exit(1);
}

const mainContent = code.slice(startIndex + startMarker.length, endIndex);

// Just to see what we are dealing with
console.log("Main content length:", mainContent.length);

