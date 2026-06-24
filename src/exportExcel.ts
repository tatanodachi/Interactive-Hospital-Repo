import ExcelJS from "exceljs";

/**
 * Format string for Indonesian Rupiah in Billions (Rp B) with parenthesis for negative values.
 */
const FORMAT_IDR_BILLIONS = '"Rp "#,##0.0" B";("(Rp "#,##0.0" B)");"Rp 0.0 B"';
const FORMAT_PERCENT = "0.0%";
const FORMAT_NUMBER = "#,##0";

/**
 * Generates and formats the Assumptions sheet.
 */
function generateAssumptionsSheet(
  workbook: ExcelJS.Workbook,
  opCoAssumptions: any,
  propCoAssumptions: any,
) {
  const sheet = workbook.addWorksheet("Assumptions", {
    views: [{ showGridLines: true }],
  });

  sheet.columns = [
    { header: "Assumption Name", key: "name", width: 45 },
    { header: "Assumed Value", key: "value", width: 25 },
    { header: "Unit / Reference", key: "unit", width: 40 },
  ];

  // Title Row
  const titleRow = sheet.addRow([]);
  titleRow.height = 36;
  const titleCell = titleRow.getCell(1);
  titleCell.value =
    "Healthcare Project Model - Financial & Clinical Assumptions";
  titleCell.font = {
    name: "Inter",
    size: 13,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E2F31" }, // Dark Emerald Slate
  };
  titleCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sheet.mergeCells(1, 1, 1, 3);

  // Metadata / Compliant block
  sheet.addRow([]); // empty line

  const meta1 = sheet.addRow(["Export Date:", new Date().toLocaleDateString()]);
  meta1.getCell(1).font = {
    name: "Inter",
    size: 9,
    bold: true,
    color: { argb: "FF4C4A4B" },
  };
  meta1.getCell(2).font = {
    name: "Inter",
    size: 9,
    color: { argb: "FF4C4A4B" },
  };

  const meta2 = sheet.addRow(["Currency:", "IDR (Billions - Rp B)"]);
  meta2.getCell(1).font = {
    name: "Inter",
    size: 9,
    bold: true,
    color: { argb: "FF4C4A4B" },
  };
  meta2.getCell(2).font = {
    name: "Inter",
    size: 9,
    color: { argb: "FF4C4A4B" },
  };

  const meta3 = sheet.addRow([
    "Accounting Standards:",
    "PSAK 16 (Aset Tetap) & PSAK 19 (Aset Tidak Berwujud) Compliance Frame",
  ]);
  meta3.getCell(1).font = {
    name: "Inter",
    size: 9,
    bold: true,
    color: { argb: "FF4C4A4B" },
  };
  meta3.getCell(2).font = {
    name: "Inter",
    size: 9,
    color: { argb: "FF4C4A4B" },
  };

  sheet.addRow([]); // empty spacing

  // Section 1: OpCo Assumptions
  const opCoHeaderIdx = sheet.lastRow.number + 1;
  sheet.addRow(["OpCo Assumptions (Clinical Operations)"]);
  sheet.mergeCells(opCoHeaderIdx, 1, opCoHeaderIdx, 3);
  sheet.getRow(opCoHeaderIdx).getCell(1).font = {
    name: "Inter",
    size: 11,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  sheet.getRow(opCoHeaderIdx).getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1C6048" }, // Deep Forest Teal
  };
  sheet.getRow(opCoHeaderIdx).height = 24;

  const opCoLabels: Record<
    string,
    { label: string; unit: string; format?: string }
  > = {
    bedsCount: { label: "Beds Capacity", unit: "Beds", format: FORMAT_NUMBER },
    borStart: {
      label: "Starting Bed Occupancy Rate (BOR)",
      unit: "%",
      format: FORMAT_PERCENT,
    },
    borIncrement: {
      label: "Annual BOR Increment",
      unit: "%",
      format: FORMAT_PERCENT,
    },
    borMax: { label: "Maximum BOR Limit", unit: "%", format: FORMAT_PERCENT },
    alos: {
      label: "Average Length of Stay (ALOS)",
      unit: "Days",
      format: "0.0",
    },
    opIpRatio: {
      label: "Outpatient to Inpatient Case Ratio",
      unit: "x",
      format: '0.0"x"',
    },
    tariffIp: {
      label: "Inpatient Tariff (Base Price)",
      unit: "Rp Million / case",
      format: '"Rp "#,##0.0" M"',
    },
    tariffOp: {
      label: "Outpatient Tariff (Base Price)",
      unit: "Rp Thousand / visit",
      format: '"Rp "#,##0',
    },
    priceIncYears1_6: {
      label: "Price Escalation (Years 1-6)",
      unit: "%",
      format: FORMAT_PERCENT,
    },
    priceIncYears7_plus: {
      label: "Price Escalation (Years 7+)",
      unit: "%",
      format: FORMAT_PERCENT,
    },
    medSupplyInf: {
      label: "Medical Supplies Cost Inflation",
      unit: "%",
      format: FORMAT_PERCENT,
    },
    operatorFeeRate: {
      label: "Hospital Operator Fee Rate",
      unit: "%",
      format: FORMAT_PERCENT,
    },
  };

  Object.entries(opCoAssumptions).forEach(([key, val]) => {
    const config = opCoLabels[key];
    if (!config) return;

    let writeVal = val;
    if (config.unit === "%" && typeof val === "number" && val > 1) {
      writeVal = val / 100;
    }

    const row = sheet.addRow([config.label, writeVal, config.unit]);
    row.height = 20;
    row.getCell(1).font = {
      name: "Inter",
      size: 10,
      color: { argb: "FF4C4A4B" },
    };
    row.getCell(2).font = {
      name: "JetBrains Mono",
      size: 10,
      bold: true,
      color: { argb: "FF1E2F31" },
    };
    row.getCell(3).font = {
      name: "Inter",
      size: 10,
      italic: true,
      color: { argb: "FF9B8B70" },
    };

    if (config.format) {
      row.getCell(2).numFmt = config.format;
    }

    for (let col = 1; col <= 3; col++) {
      row.getCell(col).border = {
        top: { style: "thin", color: { argb: "FFD8D8D8" } },
        bottom: { style: "thin", color: { argb: "FFD8D8D8" } },
        left: { style: "thin", color: { argb: "FFD8D8D8" } },
        right: { style: "thin", color: { argb: "FFD8D8D8" } },
      };
    }
  });

  sheet.addRow([]); // empty spacing

  // Section 2: PropCo Assumptions
  const propCoHeaderIdx = sheet.lastRow.number + 1;
  sheet.addRow(["PropCo Assumptions (Property & Development)"]);
  sheet.mergeCells(propCoHeaderIdx, 1, propCoHeaderIdx, 3);
  sheet.getRow(propCoHeaderIdx).getCell(1).font = {
    name: "Inter",
    size: 11,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  sheet.getRow(propCoHeaderIdx).getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1C6048" }, // Deep Forest Teal
  };
  sheet.getRow(propCoHeaderIdx).height = 24;

  const propCoLabels: Record<
    string,
    { label: string; unit: string; format?: string }
  > = {
    landCost: {
      label: "Land Acquisition Cost",
      unit: "Rp Billion",
      format: FORMAT_IDR_BILLIONS,
    },
    buildCost: {
      label: "Building Construction Cost (PSAK 16 Cap)",
      unit: "Rp Billion",
      format: FORMAT_IDR_BILLIONS,
    },
    equipCost: {
      label: "Medical Equipment Procurement (PSAK 16 Cap)",
      unit: "Rp Billion",
      format: FORMAT_IDR_BILLIONS,
    },
    infraCost: {
      label: "Infrastructure & Site Development",
      unit: "Rp Billion",
      format: FORMAT_IDR_BILLIONS,
    },
    ffeCost: {
      label: "Furniture, Fixtures & Equipment (FF&E)",
      unit: "Rp Billion",
      format: FORMAT_IDR_BILLIONS,
    },
    ltv: {
      label: "Loan-to-Value (LTV Debt Fraction)",
      unit: "%",
      format: FORMAT_PERCENT,
    },
    interestRate: {
      label: "Bank Construction & Term Loan Rate",
      unit: "%",
      format: FORMAT_PERCENT,
    },
    loanTerm: {
      label: "Loan Term / Amortization Span",
      unit: "Years",
      format: '#,##0" Years"',
    },
    leaseYield: {
      label: "Base Yield on Capital Cost",
      unit: "%",
      format: FORMAT_PERCENT,
    },
    constructionMonths: {
      label: "Construction & Development Phase",
      unit: "Months",
      format: '#,##0" Months"',
    },
  };

  Object.entries(propCoAssumptions).forEach(([key, val]) => {
    const config = propCoLabels[key];
    if (!config) return;

    let writeVal = val;
    if (config.unit === "%" && typeof val === "number" && val > 1) {
      writeVal = val / 100;
    }

    const row = sheet.addRow([config.label, writeVal, config.unit]);
    row.height = 20;
    row.getCell(1).font = {
      name: "Inter",
      size: 10,
      color: { argb: "FF4C4A4B" },
    };
    row.getCell(2).font = {
      name: "JetBrains Mono",
      size: 10,
      bold: true,
      color: { argb: "FF1E2F31" },
    };
    row.getCell(3).font = {
      name: "Inter",
      size: 10,
      italic: true,
      color: { argb: "FF9B8B70" },
    };

    if (config.format) {
      row.getCell(2).numFmt = config.format;
    }

    for (let col = 1; col <= 3; col++) {
      row.getCell(col).border = {
        top: { style: "thin", color: { argb: "FFD8D8D8" } },
        bottom: { style: "thin", color: { argb: "FFD8D8D8" } },
        left: { style: "thin", color: { argb: "FFD8D8D8" } },
        right: { style: "thin", color: { argb: "FFD8D8D8" } },
      };
    }
  });
}

/**
 * Helper to translate a 1-based column index to an Excel column letter (e.g. 1 -> A, 2 -> B, 27 -> AA).
 */
function getColLetter(colIdx: number): string {
  let temp = colIdx;
  let letter = "";
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
}

/**
 * Generates a detailed cascade sheet with live formula calculations and custom styling.
 */
function generateCascadeSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  title: string,
  annualData: any[],
  rowsConfig: Array<{
    label: string;
    key?: string;
    type:
      | "header"
      | "subheader"
      | "number"
      | "percent"
      | "currency"
      | "formula";
    indent?: number;
    highlight?: boolean;
    emerald?: boolean;
    indigo?: boolean;
    bold?: boolean;
    isSubtractor?: boolean;
    formulaCreator?: (
      colLetter: string,
      rowIndices: Record<string, number>,
    ) => string;
  }>,
) {
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }],
  });

  // Setup Column Widths
  sheet.columns = [
    { header: "", key: "metric", width: 44 },
    ...annualData.map((d, i) => ({ header: "", key: `yr_${i}`, width: 18 })),
  ];

  // Title block
  const titleRow = sheet.addRow([]);
  titleRow.height = 36;
  const titleCell = titleRow.getCell(1);
  titleCell.value = title;
  titleCell.font = {
    name: "Inter",
    size: 13,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E2F31" }, // Dark Emerald Slate
  };
  titleCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sheet.mergeCells(1, 1, 1, annualData.length + 1);

  // Metadata block
  sheet.addRow([]); // space

  const meta1 = sheet.addRow(["Export Date:", new Date().toLocaleDateString()]);
  meta1.getCell(1).font = {
    name: "Inter",
    size: 9,
    bold: true,
    color: { argb: "FF4C4A4B" },
  };
  meta1.getCell(2).font = {
    name: "Inter",
    size: 9,
    color: { argb: "FF4C4A4B" },
  };

  const meta2 = sheet.addRow(["Model Currency:", "IDR (Billions - Rp B)"]);
  meta2.getCell(1).font = {
    name: "Inter",
    size: 9,
    bold: true,
    color: { argb: "FF4C4A4B" },
  };
  meta2.getCell(2).font = {
    name: "Inter",
    size: 9,
    color: { argb: "FF4C4A4B" },
  };

  const meta3 = sheet.addRow([
    "PSAK Compliance:",
    "In line with PSAK 16 Capitalization & PSAK 19 Development Expense allocation",
  ]);
  meta3.getCell(1).font = {
    name: "Inter",
    size: 9,
    bold: true,
    color: { argb: "FF4C4A4B" },
  };
  meta3.getCell(2).font = {
    name: "Inter",
    size: 9,
    color: { argb: "FF4C4A4B" },
  };

  sheet.addRow([]); // spacing before table

  // Table Headers (Metric, Year 1, Year 2...)
  const headerRowIdx = sheet.lastRow.number + 1;
  const headerRow = sheet.addRow([
    "Financial Metric",
    ...annualData.map((d) => d.year),
  ]);
  headerRow.height = 28;

  headerRow.eachCell((cell, colNumber) => {
    cell.font = {
      name: "Inter",
      size: 10,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1C6048" }, // Deep Forest Teal
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: colNumber === 1 ? "left" : "right",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFD8D8D8" } },
      bottom: { style: "medium", color: { argb: "FF1E2F31" } },
      left: { style: "thin", color: { argb: "FFD8D8D8" } },
      right: { style: "thin", color: { argb: "FFD8D8D8" } },
    };
  });

  const rowIndices: Record<string, number> = {};

  // Fill Row by Row
  rowsConfig.forEach((rowConf) => {
    const currentRowIdx = sheet.lastRow.number + 1;

    if (rowConf.type === "subheader") {
      const row = sheet.addRow([rowConf.label]);
      row.height = 24;
      const cell = row.getCell(1);
      cell.font = {
        name: "Inter",
        size: 10,
        bold: true,
        color: { argb: "FF1E2F31" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEFEBE7" }, // Warm Sand background shade
      };
      cell.alignment = { vertical: "middle", horizontal: "left" };

      sheet.mergeCells(currentRowIdx, 1, currentRowIdx, annualData.length + 1);

      // Apply borders to the full subheader bar
      for (let c = 1; c <= annualData.length + 1; c++) {
        row.getCell(c).border = {
          top: { style: "thin", color: { argb: "FFD8D8D8" } },
          bottom: { style: "thin", color: { argb: "FFD8D8D8" } },
        };
      }
      return;
    }

    // Normal Row Configuration
    // Add hierarchical indent connectors to the label
    let formattedLabel = rowConf.label;
    if (rowConf.indent === 1) {
      formattedLabel = "  └─ " + formattedLabel;
    } else if (rowConf.indent === 2) {
      formattedLabel = "    │  └─ " + formattedLabel;
    }

    const values: any[] = [formattedLabel];

    annualData.forEach((d) => {
      if (rowConf.key) {
        const rawVal = d[rowConf.key];
        const val = rowConf.isSubtractor ? -Math.abs(rawVal || 0) : rawVal || 0;

        if (rowConf.type === "percent") {
          values.push(typeof val === "number" ? val / 100 : val);
        } else {
          values.push(val);
        }
      } else {
        values.push(0); // Formula placeholder
      }
    });

    const row = sheet.addRow(values);
    row.height = 20;

    // Register row indices
    if (rowConf.key) {
      rowIndices[rowConf.key.toLowerCase()] = currentRowIdx;
    }
    if (rowConf.label) {
      const normLabel = rowConf.label.toLowerCase().replace(/[^a-z0-9]/g, "");
      rowIndices[normLabel] = currentRowIdx;
    }

    // Apply formatting, borders, and dynamic formulas
    row.eachCell((cell, colIdx) => {
      const isMetricLabel = colIdx === 1;

      // Determine Colors from the Design System
      let fontColor = "FF1E2F31"; // Dark Emerald Slate
      let bgColor: string | null = null;
      let isBold =
        rowConf.type === "formula" || rowConf.highlight || rowConf.bold;

      if (rowConf.highlight) {
        if (rowConf.emerald) {
          fontColor = "FF1C6048"; // Deep Clinical Teal
          bgColor = "FFE8EFEA"; // Light Emerald highlight
        } else if (rowConf.indigo) {
          fontColor = "FF1E2F31"; // Dark Slate
          bgColor = "FFEBEFEE"; // Light Indigo/Gray highlight
        } else {
          fontColor = "FF1E2F31";
          bgColor = "FFEFEBE7"; // Sand highlight
        }
      } else if (rowConf.type === "formula") {
        bgColor = "FFF9F8F6"; // Warm parchment
      }

      if (isMetricLabel) {
        cell.font = {
          name: "Inter",
          size: 9.5,
          color: { argb: fontColor },
          bold: isBold,
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
        cell.border = {
          left: { style: "thin", color: { argb: "FFD8D8D8" } },
          right: { style: "thin", color: { argb: "FFD8D8D8" } },
          top: { style: "thin", color: { argb: "FFD8D8D8" } },
          bottom: {
            style: isBold ? "double" : "thin",
            color: { argb: "FFD8D8D8" },
          },
        };

        if (bgColor) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: bgColor },
          };
        }
        return;
      }

      const yearIdx = colIdx - 2;
      const colLetter = getColLetter(colIdx);

      // Handle custom formula injection
      if (rowConf.type === "formula" && rowConf.formulaCreator) {
        let rawResult = 0;
        if (rowConf.key && annualData[yearIdx]) {
          const rVal = annualData[yearIdx][rowConf.key] || 0;
          rawResult = rowConf.isSubtractor ? -Math.abs(rVal) : rVal;
        }
        cell.value = {
          formula: rowConf.formulaCreator(colLetter, rowIndices),
          result: rawResult,
        };
      }

      // Format custom styles
      if (rowConf.type === "percent") {
        cell.numFmt = FORMAT_PERCENT;
      } else if (rowConf.type === "currency" || rowConf.type === "formula") {
        const lowerLabel = rowConf.label.toLowerCase();
        if (
          lowerLabel.includes("bed") ||
          lowerLabel.includes("cases") ||
          lowerLabel.includes("visits") ||
          lowerLabel.includes("rate") ||
          lowerLabel.includes("dscr")
        ) {
          cell.numFmt = FORMAT_NUMBER;
        } else {
          cell.numFmt = FORMAT_IDR_BILLIONS;
        }
      } else if (rowConf.type === "number") {
        cell.numFmt = FORMAT_NUMBER;
      }

      // Custom typography system: Inter for text, JetBrains Mono for clean tables
      cell.font = {
        name: "JetBrains Mono",
        size: 9,
        bold: isBold,
        color: { argb: fontColor },
      };

      cell.alignment = { vertical: "middle", horizontal: "right" };

      // Table lines & cell frames
      cell.border = {
        top: { style: "thin", color: { argb: "FFD8D8D8" } },
        bottom: {
          style: isBold ? "double" : "thin",
          color: { argb: "FFD8D8D8" },
        },
        left: { style: "thin", color: { argb: "FFD8D8D8" } },
        right: { style: "thin", color: { argb: "FFD8D8D8" } },
      };

      if (bgColor) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: bgColor },
        };
      }
    });
  });
}

/**
 * Main export controller.
 */
export const exportToExcel = async (
  opCoAssumptions: any,
  propCoAssumptions: any,
  opCoData: any,
  propCoData: any,
  consolidatedData: any,
) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Healthcare Financial Cascade System";
  workbook.lastModifiedBy = "User";
  workbook.created = new Date();
  workbook.modified = new Date();

  // 1. Generate Assumptions Sheet
  generateAssumptionsSheet(workbook, opCoAssumptions, propCoAssumptions);

  // 2. Generate OpCo Cascade Sheet
  const opCoRowsConfig = [
    { label: "Clinical Operational Drivers", type: "subheader" as const },
    { label: "Licensed Bed Capacity", key: "beds", type: "number" as const },
    { label: "Bed Occupancy Rate (BOR)", key: "bor", type: "percent" as const },
    { label: "Inpatient Cases", key: "ipCases", type: "number" as const },
    { label: "Outpatient Visits", key: "opVisits", type: "number" as const },

    { label: "Operating Revenue Items", type: "subheader" as const },
    {
      label: "Inpatient Clinical Revenue",
      key: "ipRev",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "Outpatient Clinical Revenue",
      key: "opRev",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "Total Net Revenue",
      key: "totalRev",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.inpatientclinicalrevenue} + ${col}${rows.outpatientclinicalrevenue}`,
    },

    { label: "Direct Costs (COGS)", type: "subheader" as const },
    {
      label: "Medical Supplies & Consumables",
      key: "totalMedSupp",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Doctor Professional Fees",
      key: "totalDocFee",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Gross Profit Margin",
      key: "grossProfit",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.totalnetrevenue} - ${col}${rows.medicalsuppliesconsumables} - ${col}${rows.doctorprofessionalfees}`,
    },

    { label: "Operating Expenditures (OPEX)", type: "subheader" as const },
    {
      label: "Clinical & Administrative Staffing",
      key: "staffCost",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Administrative Expense",
      key: "adminOpex",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Utilities Expense",
      key: "utilOpex",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Marketing Expense",
      key: "mktgOpex",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Hospital Operator Fee",
      key: "operatorOpex",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Operational Insurance",
      key: "insOpex",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "EBITDAR",
      key: "ebitdar",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.grossprofitmargin} - ${col}${rows.clinicaladministrativestaffing} - ${col}${rows.administrativeexpense} - ${col}${rows.utilitiesexpense} - ${col}${rows.marketingexpense} - ${col}${rows.hospitaloperatorfee} - ${col}${rows.operationalinsurance}`,
    },
    {
      label: "EBITDAR Margin (%)",
      key: "ebitdarMargin",
      type: "formula" as const,
      highlight: true,
      percent: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `IF(${col}${rows.totalnetrevenue}=0, 0, ${col}${rows.ebitdar} / ${col}${rows.totalnetrevenue})`,
    },

    { label: "Rent & Taxes", type: "subheader" as const },
    {
      label: "Building Rental",
      key: "rent",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "EBITDA",
      key: "ebitda",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.ebitdar} - ${col}${rows.buildingrental}`,
    },
    {
      label: "Corporate Income Tax",
      key: "tax",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Net Operating Income",
      key: "netIncome",
      type: "formula" as const,
      highlight: true,
      emerald: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.ebitda} - ${col}${rows.corporateincometax}`,
    },
    {
      label: "Net Profit Margin (%)",
      key: "netMargin",
      type: "formula" as const,
      highlight: true,
      emerald: true,
      percent: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `IF(${col}${rows.totalnetrevenue}=0, 0, ${col}${rows.netoperatingincome} / ${col}${rows.totalnetrevenue})`,
    },

    {
      label: "Clinical Cash Flows (Statement of Cash Flows)",
      type: "subheader" as const,
    },
    {
      label: "Net Cash from Operating (CFO)",
      key: "cfo",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.netoperatingincome}`,
    },
    {
      label: "Cash Inflows (Clinical Revenues)",
      key: "cfo_in",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "  └─ Clinical Revenue Receipts",
      key: "cfo_in",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "Cash Outflows (Operating OPEX & Tax)",
      key: "cfo_out",
      type: "formula" as const,
      indent: 1,
      isSubtractor: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.netcashfromoperatingcfo} - ${col}${rows.cashinflowsclinicalrevenues}`,
    },
    {
      label: "Net Cash from Investing (CFI)",
      key: "cfi",
      type: "currency" as const,
      highlight: true,
    },
    {
      label: "Cash Inflows (Exit Proceeds)",
      key: "cfi_in",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "  └─ Clinical Enterprise Value",
      key: "exitEv",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "  └─ Clinical Retained Cash Sweep",
      key: "exitRetained",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "Cash Outflows (Setup & Working Capital CapEx)",
      key: "cfi_out",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Net Cash from Financing (CFF)",
      key: "cff",
      type: "currency" as const,
      highlight: true,
    },
    {
      label: "Cash Inflows (Sponsor Equity)",
      key: "cff_in",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "Cash Outflows (Partner Dividends & Exit)",
      key: "cff_out",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Project Free Cash Flow (FCF)",
      key: "fcf",
      type: "currency" as const,
      highlight: true,
      indigo: true,
    },
    {
      label: "Total Net Cash Flow",
      key: "netFlow",
      type: "formula" as const,
      highlight: true,
      emerald: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.netcashfromoperatingcfo} + ${col}${rows.netcashfrominvestingcfi} + ${col}${rows.netcashfromfinancingcff}`,
    },
    {
      label: "Cumulative Cash Balance",
      key: "endCash",
      type: "formula" as const,
      highlight: true,
      indigo: true,
      bold: true,
      formulaCreator: (col: string, rows: Record<string, number>) => {
        if (col === "B") {
          return `${col}${rows.totalnetcashflow}`;
        }
        const prevCol = String.fromCharCode(col.charCodeAt(0) - 1);
        return `${prevCol}${rows.cumulativecashbalance} + ${col}${rows.totalnetcashflow}`;
      },
    },

    { label: "Sponsor Cascade & Returns", type: "subheader" as const },
    {
      label: "Cumulative Net Income",
      key: "cumNI",
      type: "formula" as const,
      highlight: true,
      indigo: true,
      formulaCreator: (col: string, rows: Record<string, number>) => {
        if (col === "B") {
          return `${col}${rows.netoperatingincome}`;
        }
        const prevCol = String.fromCharCode(col.charCodeAt(0) - 1);
        return `${prevCol}${rows.cumulativenetincome} + ${col}${rows.netoperatingincome}`;
      },
    },
    {
      label: "Distributable Profit",
      key: "distributableProfit",
      type: "currency" as const,
      highlight: true,
    },
    {
      label: "Retained Earnings",
      key: "retainedThisYear",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "Cumulative Retained Cash",
      key: "cumulativeRetainedEarnings",
      type: "formula" as const,
      highlight: true,
      indigo: true,
      formulaCreator: (col: string, rows: Record<string, number>) => {
        if (col === "B") {
          return `${col}${rows.retainedearnings}`;
        }
        const prevCol = String.fromCharCode(col.charCodeAt(0) - 1);
        return `${prevCol}${rows.cumulativeretainedcash} + ${col}${rows.retainedearnings}`;
      },
    },
    { label: "Terminal Value (Exit)", type: "subheader" as const },
    {
      label: "OpCo Enterprise Value (EV)",
      key: "ev",
      type: "currency" as const,
      highlight: true,
    },
    {
      label: "+ Retained Cash Sweep",
      key: "cumulativeRetainedEarnings",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "Total Exit Equity Value",
      key: "opCoExit",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.opcoenterprisevalueev} + ${col}${rows.retainedcashsweep}`,
    },
    {
      label: "Strategic Ptnr Proceeds (51%)",
      key: "pA_Exit",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "Vasanta Proceeds (49%)",
      key: "pB_Exit",
      type: "currency" as const,
      indent: 1,
    },

    { label: "Vasanta Returns (49%)", type: "subheader" as const },
    {
      label: "Partner B Investment",
      key: "pB_Outlay",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Partner B Dividend",
      key: "shareB",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "Terminal Exit Proceeds",
      key: "pB_Exit",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "VG NET CASH FLOW",
      key: "pB_Net",
      type: "formula" as const,
      highlight: true,
      emerald: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.partnerbinvestment} + ${col}${rows.partnerbdividend} + ${col}${rows.terminalexitproceeds}`,
    },
  ];

  generateCascadeSheet(
    workbook,
    "OpCo Cascade",
    "OpCo Cascade Model - Detailed Clinical and Operational Cash Flows",
    opCoData.annualData || [],
    opCoRowsConfig,
  );

  // 3. Generate PropCo Cascade Sheet
  const propCoRowsConfig = [
    { label: "Revenues & Operating Yields", type: "subheader" as const },
    {
      label: "Lease Revenue (PropCo Lease)",
      key: "revenue",
      type: "currency" as const,
    },
    {
      label: "Pre-Opening & Dev Expenses",
      key: "preOpeningDev",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "  └─ Dev. G&A Expense",
      key: "devGa",
      type: "currency" as const,
      indent: 2,
      isSubtractor: true,
    },
    {
      label: "  └─ Dev. CAR Expense",
      key: "devCar",
      type: "currency" as const,
      indent: 2,
      isSubtractor: true,
    },
    {
      label: "Facility Maintenance OPEX",
      key: "maintOpex",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Property Tax",
      key: "taxOpex",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Management / Overhead OPEX",
      key: "overheadOpex",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Equipment Lease OPEX",
      key: "medEqLeaseOpex",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Gross Operating Profit (GOP)",
      key: "gop",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.leaserevenuepropcolease} - ${col}${rows.preopeningdevexpenses} - ${col}${rows.facilitymaintenanceopex} - ${col}${rows.propertytax} - ${col}${rows.managementoverheadopex} - ${col}${rows.equipmentleaseopex}`,
    },
    {
      label: "FF&E Reserve Allocation",
      key: "ffeReserve",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "EBITDA",
      key: "ebitda",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.grossoperatingprofitgop} - ${col}${rows.ffereserveallocation}`,
    },

    { label: "Depreciation (D&A)", type: "subheader" as const },
    {
      label: "Total Depreciation & Amortization",
      key: "dep",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `SUM(${col}${rows.construction}:${col}${rows.contingency})`,
    },
    {
      label: "Construction",
      key: "depBuild",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "Medical Equipment",
      key: "depMedEq",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "Infrastructure",
      key: "depInfra",
      type: "currency" as const,
      indent: 1,
    },
    { label: "FF&E", key: "depFfe", type: "currency" as const, indent: 1 },
    {
      label: "Sharing Dev.",
      key: "depSharing",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "Consultant",
      key: "depConsultant",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "License",
      key: "depLicense",
      type: "currency" as const,
      indent: 1,
    },
    { label: "VAT", key: "depVat", type: "currency" as const, indent: 1 },
    {
      label: "Contingency",
      key: "depContingency",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "EBIT",
      key: "ebit",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.ebitda} - ${col}${rows.totaldepreciationamortization}`,
    },
    {
      label: "Interest Expense (Debt)",
      key: "interest",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Earnings Before Tax (EBT)",
      key: "ebt",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.ebit} - ${col}${rows.interestexpensedebt}`,
    },
    {
      label: "Corporate Income Tax",
      key: "corpTax",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Net Profit",
      key: "netIncome",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.ebt} - ${col}${rows.corporateincometax}`,
    },

    { label: "Debt Service & Exit", type: "subheader" as const },
    {
      label: "Principal Repayment",
      key: "principal",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    { label: "DSCR (Coverage Ratio)", key: "dscr", type: "number" as const },

    {
      label: "Property Cash Flows (Statement of Cash Flows)",
      type: "subheader" as const,
    },
    {
      label: "Net Cash from Operating (CFO)",
      key: "cfo",
      type: "currency" as const,
      highlight: true,
    },
    {
      label: "Cash Inflows (OpCo Lease Rentals)",
      key: "cfo_in",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "  └─ Lease Rental Receipts",
      key: "cfo_in",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "Cash Outflows (Maint, Reserves, Interest & Taxes)",
      key: "cfo_out",
      type: "formula" as const,
      indent: 1,
      isSubtractor: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.netcashfromoperatingcfo} - ${col}${rows.cashinflowsopcoleaserentals}`,
    },
    {
      label: "Net Cash from Investing (CFI)",
      key: "cfi",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.cashinflowsexitproceeds} + ${col}${rows.cashoutflowsdevelopmentcapex}`,
    },
    {
      label: "Cash Inflows (Exit Proceeds)",
      key: "cfi_in",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "  └─ Property Liquidations & Exits",
      key: "cfi_in",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "Cash Outflows (Development Capex)",
      key: "cfi_out",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Net Cash from Financing (CFF)",
      key: "cff",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.cashinflowsdebtdrawsshortfallcontributions} + ${col}${rows.cashoutflowssponsordistributionsprincipalrepayments}`,
    },
    {
      label: "Cash Inflows (Debt Draws & Shortfall Contributions)",
      key: "cff_in",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "  └─ Debt Drawdown",
      key: "debtDraw",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "  └─ Sponsor Shortfall Equity",
      key: "shortfallEquity",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "Cash Outflows (Sponsor Distributions & Principal Repayments)",
      key: "cff_out",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "  └─ Debt Principal Repayments",
      key: "principal",
      type: "currency" as const,
      indent: 2,
      isSubtractor: true,
    },
    {
      label: "  └─ Sponsor Distributions (FCFE)",
      key: "fcfe",
      type: "currency" as const,
      indent: 2,
      isSubtractor: true,
    },
    {
      label: "Total Net Cash Flow",
      key: "netFlow",
      type: "formula" as const,
      highlight: true,
      emerald: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.netcashfromoperatingcfo} + ${col}${rows.netcashfrominvestingcfi} + ${col}${rows.netcashfromfinancingcff}`,
    },
    {
      label: "Cumulative Cash Balance",
      key: "endCash",
      type: "formula" as const,
      highlight: true,
      indigo: true,
      bold: true,
      formulaCreator: (col: string, rows: Record<string, number>) => {
        if (col === "B") {
          return `${col}${rows.totalnetcashflow}`;
        }
        const prevCol = String.fromCharCode(col.charCodeAt(0) - 1);
        return `${prevCol}${rows.cumulativecashbalance} + ${col}${rows.totalnetcashflow}`;
      },
    },

    { label: "Project Development Spending", type: "subheader" as const },
    {
      label: "Land Cost",
      key: "landSpend",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "Total Hard Costs",
      key: "hardSpend",
      type: "currency" as const,
      highlight: true,
    },
    {
      label: "  └─ Construction",
      key: "buildSpend",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "  └─ Medical Equip.",
      key: "eqSpend",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "  └─ Infrastructure",
      key: "infraSpend",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "  └─ FF&E",
      key: "ffeSpend",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "  └─ Sharing Dev.",
      key: "sharingSpend",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "Total Soft Costs",
      key: "softSpend",
      type: "currency" as const,
      highlight: true,
    },
    {
      label: "  └─ Consultant",
      key: "consultantSpend",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "  └─ License",
      key: "licenseSpend",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "  └─ VAT",
      key: "vatSpend",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "  └─ Contingency",
      key: "contingencySpend",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "Pre-Operating Costs",
      key: "preOpeningDev",
      type: "currency" as const,
      highlight: true,
    },
    {
      label: "  └─ Dev. G&A",
      key: "devGa",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "  └─ Dev. CAR",
      key: "devCar",
      type: "currency" as const,
      indent: 2,
    },
    {
      label: "PROJECT DEVELOPMENT SPEND",
      key: "totalSpend",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.landcost} + ${col}${rows.totalhardcosts} + ${col}${rows.totalsoftcosts} + ${col}${rows.preoperatingcosts}`,
    },
    {
      label: "Debt Drawdown",
      key: "debtDraw",
      type: "currency" as const,
      indent: 1,
    },

    { label: "Return Metrics", type: "subheader" as const },
    {
      label: "Deferred MedEq Purchase",
      key: "deferredCapex",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "FCFE (Operating)",
      key: "opFcfe",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "Shortfall Equity",
      key: "shortfallEquity",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "Gross Exit Proceeds",
      key: "grossExitValue",
      type: "currency" as const,
      indent: 1,
    },
    {
      label: "Loan Settlement at Exit",
      key: "loanSettledAtExit",
      type: "currency" as const,
      indent: 1,
      isSubtractor: true,
    },
    {
      label: "Net Exit Proceeds",
      key: "netExitProceeds",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.grossexitproceeds} + ${col}${rows.loansettlementatexit}`,
    },
    {
      label: "FCFE (Levered)",
      key: "fcfe",
      type: "currency" as const,
      highlight: true,
      emerald: true,
    },
    {
      label: "Cumulative FCFE",
      key: "cumFcfe",
      type: "formula" as const,
      highlight: true,
      indigo: true,
      bold: true,
      formulaCreator: (col: string, rows: Record<string, number>) => {
        if (col === "B") {
          return `${col}${rows.fcfelevered}`;
        }
        const prevCol = String.fromCharCode(col.charCodeAt(0) - 1);
        return `${prevCol}${rows.cumulativefcfe} + ${col}${rows.fcfelevered}`;
      },
    },
  ];

  generateCascadeSheet(
    workbook,
    "PropCo Cascade",
    "PropCo Cascade Model - Physical Infrastructure Underwriting & Debt Schedule",
    propCoData.annualData || [],
    propCoRowsConfig,
  );

  // 4. Generate Consolidated Cascade Sheet
  const consRowsConfig = [
    {
      label: "PropCo Cascade look-through cash flows",
      type: "subheader" as const,
    },
    {
      label: "PropCo Investment Capital Flows",
      key: "propCoInvestmentFlow",
      type: "currency" as const,
    },
    {
      label: "PropCo Operating Lease Flows",
      key: "propCoOperatingFlow",
      type: "currency" as const,
    },
    {
      label: "PropCo Exit Event Liquidity",
      key: "propCoExitFlow",
      type: "currency" as const,
    },
    {
      label: "PropCo Flow (Total Look-through)",
      key: "propCoFlow",
      type: "formula" as const,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.propcoinvestmentcapitalflows} + ${col}${rows.propcooperatingleaseflows} + ${col}${rows.propcoexiteventliquidity}`,
    },

    {
      label: "OpCo Cascade look-through cash flows",
      type: "subheader" as const,
    },
    {
      label: "OpCo Inception & Working Capital Outlay",
      key: "opCoInvestmentFlow",
      type: "currency" as const,
    },
    {
      label: "OpCo Operating Dividend Dividends",
      key: "opCoOperatingDividendFlow",
      type: "currency" as const,
    },
    {
      label: "OpCo Exit & Business Valuation Liquidity",
      key: "opCoExitFlow",
      type: "currency" as const,
    },
    {
      label: "OpCo Flow (Total Look-through)",
      key: "opCoFlow",
      type: "formula" as const,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.opcoinceptionworkingcapitaloutlay} + ${col}${rows.opcooperatingdividenddividends} + ${col}${rows.opcoexitbusinessvaluationliquidity}`,
    },

    { label: "Combined Consolidated Cash Flows", type: "subheader" as const },
    {
      label: "Total Net Cash Flow (Project FCF)",
      key: "netFlow",
      type: "formula" as const,
      highlight: true,
      formulaCreator: (col: string, rows: Record<string, number>) =>
        `${col}${rows.propcoflowtotallookthrough} + ${col}${rows.opcoflowtotallookthrough}`,
    },
    {
      label: "Cumulative Cash Flow",
      key: "cumCf",
      type: "formula" as const,
      highlight: true,
      indigo: true,
      bold: true,
      formulaCreator: (col: string, rows: Record<string, number>) => {
        if (col === "B") {
          return `${col}${rows.totalnetcashflowprojectfcf}`;
        }
        const prevCol = String.fromCharCode(col.charCodeAt(0) - 1);
        return `${prevCol}${rows.cumulativecashflow} + ${col}${rows.totalnetcashflowprojectfcf}`;
      },
    },

    {
      label: "Combined Look-through Performance Metrics",
      type: "subheader" as const,
    },
    {
      label: "Consolidated Pro-Forma Revenue",
      key: "lookThroughRevenue",
      type: "currency" as const,
    },
    {
      label: "Consolidated Look-through EBITDA",
      key: "lookThroughEbitda",
      type: "currency" as const,
    },
    {
      label: "Consolidated Look-through Net Income",
      key: "lookThroughNetIncome",
      type: "currency" as const,
    },
    {
      label: "Consolidated Look-through Margin (%)",
      key: "lookThroughMargin",
      type: "percent" as const,
      highlight: true,
    },
  ];

  generateCascadeSheet(
    workbook,
    "Consolidated",
    "Consolidated Cascade Model - Multi-Entity Look-Through Performance",
    consolidatedData.annualData || [],
    consRowsConfig,
  );

  // Trigger File Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Healthcare_Facility_Financial_Model.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
