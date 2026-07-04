# Project Profile: Healthcare pre-feasibility and Capital Cascade Model

This document serves as permanent instructions and context memory for the AI coding agent working on this workspace. It ensures that the application's unique visual design, financial engine logic, and custom feature implementations are kept intact across chat sessions.

---

## 1. Application Architecture

This is a comprehensive, multi-entity, interactive financial underwriting and feasibility model for a specialized healthcare hospital facility. It models three cascade entities:
1. **OpCo Cascade (Operating Company)**: Models clinical operations, inpatient/outpatient cases, bed occupancy rates (BOR), clinical revenues, staffing OPEX, clinical supplies, and physician variables.
2. **PropCo Cascade (Property Company)**: Models physical construction, lands, development budgets, lease structures, maintenance capital, interest curves, debt schedules, and asset yields.
3. **Consolidated Cascade**: Provides a look-through combined dashboard tracking cumulative capital flows, IRR, and combined margins.

---

## 2. Core Financial Engine Logic (CRITICAL)

To maintain absolute quantitative precision, these mathematical formulas and date alignment guidelines must be strictly preserved:

### Calendar and Date Alignments
- **Year 1 is 2026**. Subsequent projection years align sequentially (Year 2 = 2027, Year 3 = 2028, etc.).
- **Dynamic Leap Year Handling**: The engine must inspect the calendar year (`2025 + i` for operating year `i`) to find the total leap/non-leap year days (`366` or `365`).
- **Days-in-Month Proximity**: Clinical volume and operational totals must not be flat across months. They must strictly scale with the exact number of calendar days in each sequential month:
  - Monthly days extracted dynamically: `new Date(currentYear, m, 0).getDate()` (e.g. 31, 28/29, 31, 30...).
  - Active days multiplier: `days / daysInYear`.

### Clinical Capacity Calculations
- `Bed Days = beds * daysInYear * BOR` (accounting for custom `borStart`, `borIncrement` and `borMax`).
- `Inpatient Cases = bedDays / alos`
- `Outpatient Visits = ipCases * opIpRatio`
- Each individual monthly operational line (e.g., `m_ipCases`, `m_opVisits`, revenues, supplies, and staff costs) is calculated sequentially inside the projection loop by multiplying the yearly aggregate by `(days / daysInYear)`.

### Operational Revenues & Supply Costs
- **Price Escalation**: Price multipliers compound at `priceIncYears1_6` (for Years 1-6) and `priceIncYears7_plus` (for Year 7 and beyond) over year indexes.
- **Supply costs**: Compound using medical inflation benchmarks (`medSupplyInf`).

---

## 3. Design System & Visual Guidelines

The UI uses a customized, high-end professional aesthetic designed to feel clinical, tactile, and highly authoritative.

- **Branding & Core Color Slate**:
  - Primary Clinical Accents: `#1C6048` (Deep Forest Clinical Teal)
  - Dark Slate Surfaces: `#1E2F31` (Rich Dark Emerald-Slate for primary bento blocks and main text panels)
  - Page Backgrounds: `#F9F8F6` and `#EFEBE7` (Earthy sand and warm parchment hues supporting high-contrast reading)
  - Borders: `#D8D8D8` (Clean, subtle dividers)
- **Anti-AI-Telemetry Rule**: Avoid larping or cluttering elements. Keep margins and indicators pristine:
  - strictly NO unrequested network status indicators (e.g., "● ONLINE"), live port numbers (e.g., "Port 3000"), or mock command logs. 
  - Standard, literal, and clean human-readable text labels.
- **Typography Pairing**:
  - Sans display headings: `"Jost"` or `"League Spartan"` for sharp modern numbers and structures.
  - Body text: Sans-serif (highly readable weights) paired with `"JetBrains Mono"` for financial tables, cash flow dates, percentages, and currencies.

---

## 4. Key Interactive Layout Components

Ensure these special custom layout features are maintained in the UI:

### PropCo Cascade: Collapsible Development Budget
- The PropCo Cascade View splits the screen into a layout containing the **Development Budget table** and the **PropCo Cash Flow Detail**.
- **Interactive State**: Toggleable state `showDevBudget` (boolean) manages layout:
  - If **visible**: The outermost container uses grid styling `md:grid-cols-3`. The Development Budget sits in a sidebar (`md:col-span-1`), and the PropCo Cash Flow Detail spans `md:col-span-2`.
  - If **hidden**: The grid shifts to a clean full-width block `md:grid-cols-1`. The PropCo Cash Flow Detail spans the entire layout (`md:col-span-1`).
  - An elegant **Show Dev Budget / Hide** button exists on the header of these panels to toggle this state on the fly.

---

## 5. Indonesian Accounting & Regulatory Compliance (PSAK 19 / PSAK 16)

To ensure ongoing alignment with Indonesian financial accounting standards, the engine must balance the treatment of pre-operating and development expenditures under **PSAK 19 (Aset Tidak Berwujud)** and **PSAK 16 (Aset Tetap)**:

### Expense vs. Capitalization Treatment
- **Direct Construction & Hard Costs (PSAK 16)**: Standard site preparation, hardware, build costs, and medical equipment procurement are capitalized directly into Property, Plant, and Equipment (Aset Tetap).
- **Pre-opening costs / Start-up costs (PSAK 19)**: Direct pre-operating start-up costs, administrative expenditures (such as Dev G&A), and non-capital insurance elements (such as Contractor's All Risk - Dev CAR) incurred during pre-construction phases must be handled strictly in compliance with PSAK 19.43:
  - Under **PSAK 19.43**, start-up, pre-opening, and pre-operating expenses that do not qualify as part of the acquisition cost of an asset under PSAK 16 must be expensed immediately when incurred.
  - **Actual Engine Behavior (PSAK 19 Compliant)**: The engine correctly models these by expensing them immediately as `preOpeningDev` in the month/year they are incurred during the development/pre-operating phase (Years 1 and 2), creating negative pre-operating EBITDA, GOP, and EBT. They are included in the overall `totalCapex` for funding and debt sizing purposes, but they are **never** capitalized into the asset bases and are **never** depreciated during the operating phase (Years 3+).
  - **Audit Rule**: The agent must recognize that the model already complies with PSAK 19 by expensing these costs immediately during development, rather than amortizing or depreciating them over the operating life of the facility. Do not claim that these items are depreciated.

