import * as XLSX from 'xlsx';

export const exportToExcel = (
  opCoAssumptions: any,
  propCoAssumptions: any,
  opCoData: any,
  propCoData: any,
  consolidatedData: any
) => {
  const wb = XLSX.utils.book_new();

  // 1. Assumptions Sheet
  const assumptionsSheetData = [
    ["Project Assumptions"],
    [],
    ["OpCo Assumptions"],
    ...Object.entries(opCoAssumptions).map(([key, value]) => [key, value]),
    [],
    ["PropCo Assumptions"],
    ...Object.entries(propCoAssumptions).map(([key, value]) => [key, value])
  ];
  const wsAssumptions = XLSX.utils.aoa_to_sheet(assumptionsSheetData);
  XLSX.utils.book_append_sheet(wb, wsAssumptions, "Assumptions");

  // Helper to format annual data
  const formatCascadeData = (title: string, annualData: any[], extractKeys: {label: string, key: string}[]) => {
    if (!annualData || annualData.length === 0) {
      return XLSX.utils.aoa_to_sheet([["No Data"]]);
    }
    
    // Header row
    const headers = ["Metric", ...annualData.map(d => `Year ${d.year}`)];
    const rows = [
      [title],
      [],
      headers
    ];

    extractKeys.forEach(({label, key}) => {
      const row = [label, ...annualData.map(d => {
        const val = d[key];
        return typeof val === 'number' ? Number(val.toFixed(2)) : val;
      })];
      rows.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    // Auto-size columns to be a bit wider
    const colWidths = [{ wch: 35 }, ...annualData.map(() => ({ wch: 15 }))];
    ws['!cols'] = colWidths;
    return ws;
  };

  // 2. OpCo Cascade
  const opCoKeys = [
    { label: 'Beds', key: 'beds' },
    { label: 'BOR (%)', key: 'bor' },
    { label: 'Inpatient Cases', key: 'ipCases' },
    { label: 'Outpatient Visits', key: 'opVisits' },
    { label: 'Total Revenue', key: 'totalRevenue' },
    { label: 'EBITDA', key: 'ebitda' },
    { label: 'Net Income', key: 'netIncome' },
    { label: 'Free Cash Flow', key: 'fcf' },
  ];
  const wsOpCo = formatCascadeData("OpCo Cascade", opCoData.annualData || [], opCoKeys);
  XLSX.utils.book_append_sheet(wb, wsOpCo, "OpCo Cascade");

  // 3. PropCo Cascade
  const propCoKeys = [
    { label: 'Total Capex', key: 'capex' },
    { label: 'Debt Drawdown', key: 'debtDraw' },
    { label: 'Equity Drawdown', key: 'eqDraw' },
    { label: 'Interest Expense', key: 'interest' },
    { label: 'Principal Repayment', key: 'principal' },
    { label: 'Lease Revenue', key: 'leaseRev' },
    { label: 'EBITDA', key: 'ebitda' },
    { label: 'Net Income', key: 'netIncome' },
    { label: 'FCFE', key: 'fcfe' },
    { label: 'FCFE (Ex-Land)', key: 'fcfeExLand' },
  ];
  const wsPropCo = formatCascadeData("PropCo Cascade", propCoData.annualData || [], propCoKeys);
  XLSX.utils.book_append_sheet(wb, wsPropCo, "PropCo Cascade");

  // 4. Consolidated
  const consKeys = [
    { label: 'PropCo Operating Flow', key: 'propCoOperatingFlow' },
    { label: 'PropCo Exit Flow', key: 'propCoExitFlow' },
    { label: 'PropCo Flow (Total)', key: 'propCoFlow' },
    { label: 'OpCo Investment Flow', key: 'opCoInvestmentFlow' },
    { label: 'OpCo Operating Flow', key: 'opCoOperatingFlow' },
    { label: 'OpCo Operating Dividend Flow', key: 'opCoOperatingDividendFlow' },
    { label: 'OpCo Exit Flow', key: 'opCoExitFlow' },
    { label: 'OpCo Flow (Total)', key: 'opCoFlow' },
    { label: 'Total Net Cash Flow (Project FCF)', key: 'netFlow' },
  ];
  const wsCons = formatCascadeData("Consolidated Cascade", consolidatedData.annualData || [], consKeys);
  XLSX.utils.book_append_sheet(wb, wsCons, "Consolidated");

  // Generate binary string and trigger download
  XLSX.writeFile(wb, "Healthcare_Project_Model.xlsx");
};
