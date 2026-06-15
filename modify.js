const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');

const table1Start = content.indexOf('            {/* TABLE 1: ACCOUNTING STANDARD STATEMENT OF CASH FLOWS */}');
if (table1Start === -1) throw new Error("Table 1 not found");

const table2Start = content.indexOf('            {/* TABLE 2: MANAGERIAL LOOK-THROUGH INCOME STATEMENT (P&L) */}', table1Start);
if (table2Start === -1) throw new Error("Table 2 not found");

const table3Start = content.indexOf('            {/* TABLE 3: CAPITAL CASCADE & WATERFALL WATERFALL */}', table2Start);
if (table3Start === -1) throw new Error("Table 3 not found");

const table1Chunk = content.substring(table1Start, table2Start);
const table2Chunk = content.substring(table2Start, table3Start);

// Rename labels logic
const renamedTable1 = table2Chunk
  .replace('{/* TABLE 2: MANAGERIAL LOOK-THROUGH INCOME STATEMENT (P&L) */}', '{/* TABLE 1: MANAGERIAL LOOK-THROUGH INCOME STATEMENT (P&L) */}');

const renamedTable2 = table1Chunk
  .replace('{/* TABLE 1: ACCOUNTING STANDARD STATEMENT OF CASH FLOWS */}', '{/* TABLE 2: ACCOUNTING STANDARD STATEMENT OF CASH FLOWS */}');

const newContent = content.substring(0, table1Start) + renamedTable1 + renamedTable2 + content.substring(table3Start);

fs.writeFileSync('src/App.tsx', newContent, 'utf8');
console.log("Successfully swapped tables");
