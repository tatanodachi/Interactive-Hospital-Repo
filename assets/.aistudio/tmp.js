const fs = require('fs');

const opCoAssumptions = {
  includeTerminalValue: true,
  exitMultiple: 8,
  discountRate: 11,
  corporateTax: 22,
  inflation: 2.5,
  partnerAEquity: 51,
  partnerBEquity: 49,
  sharingPercentA: 70,
};

const propCoAssumptions = {
  landSize: 5000,
  landPrice: 10,
  bedCount: 200,
  buildCostReq: 1000,
  devYears: 2,
  includeFinancing: true,
  ltv: 70,
  interestRate: 8.5,
  loanTenor: 15,
  ioGracePeriodYears: 3,
};
// I won't run the full App.tsx logic here, I'll just explain the math conceptually.
