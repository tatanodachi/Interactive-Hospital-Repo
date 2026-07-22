const fs = require('fs');
let content = fs.readFileSync('src/financialEngine.ts', 'utf8');

const targetStr = `        if (pData.isOperating) {
          if (!hasStartedHoldCoAmortization) {
            const ioMonths = (holdCoAssumptions?.ioGracePeriodYears || 0) * 12;
            const tenorMonths = (holdCoAssumptions?.loanTenor || 15) * 12;
            const amortMonths = Math.max(1, tenorMonths - ioMonths);
            const rMonthly = (holdCoAssumptions?.interestRate || 0) / 100 / 12;
            holdCoPmt =
              holdCoOutstandingDebt > 0 && rMonthly > 0
                ? (holdCoOutstandingDebt * rMonthly) /
                  (1 - Math.pow(1 + rMonthly, -amortMonths))
                : holdCoOutstandingDebt > 0
                  ? holdCoOutstandingDebt / amortMonths
                  : 0;
            hasStartedHoldCoAmortization = true;
          }
          const ioMonths = (holdCoAssumptions?.ioGracePeriodYears || 0) * 12;
          const tenorMonths = (holdCoAssumptions?.loanTenor || 15) * 12;
          const totalDevMonths = opCoAssumptions.devDurationMonths || 24;
          const elapsedProjectMonth = totalDevMonths + operatingMonthCounter + 1;
          if (elapsedProjectMonth <= ioMonths) {
            m_holdCoPrincipal = 0;
          } else if (elapsedProjectMonth <= tenorMonths) {
            m_holdCoPrincipal = Math.min(
              holdCoOutstandingDebt,
              holdCoPmt - m_holdCoInterest,
            );
          } else {
            m_holdCoPrincipal = holdCoOutstandingDebt;
          }
          if (m_holdCoPrincipal < 0) m_holdCoPrincipal = 0;
          operatingMonthCounter++;
        }`;

const replacementStr = `        if (pData.isOperating) {
          if (!hasStartedHoldCoAmortization) {
            holdCoInitialDebtAtStartOfOperations = holdCoOutstandingDebt;
            const ioMonths = (holdCoAssumptions?.ioGracePeriodYears || 0) * 12;
            const tenorMonths = (holdCoAssumptions?.loanTenor || 15) * 12;
            const amortMonths = Math.max(1, tenorMonths - ioMonths);
            const rMonthly = (holdCoAssumptions?.interestRate || 0) / 100 / 12;
            holdCoPmt =
              holdCoOutstandingDebt > 0 && rMonthly > 0
                ? (holdCoOutstandingDebt * rMonthly) /
                  (1 - Math.pow(1 + rMonthly, -amortMonths))
                : holdCoOutstandingDebt > 0
                  ? holdCoOutstandingDebt / amortMonths
                  : 0;
            hasStartedHoldCoAmortization = true;
          }
          const ioMonths = (holdCoAssumptions?.ioGracePeriodYears || 0) * 12;
          const tenorMonths = (holdCoAssumptions?.loanTenor || 15) * 12;
          const totalDevMonths = opCoAssumptions.devDurationMonths || 24;
          const elapsedProjectMonth = totalDevMonths + operatingMonthCounter + 1;
          if (elapsedProjectMonth <= ioMonths) {
            m_holdCoPrincipal = 0;
          } else if (repaymentType === "step_up") {
            const amortYearIdx = Math.floor((elapsedProjectMonth - 1 - ioMonths) / 12);
            if (elapsedProjectMonth >= tenorMonths) {
              m_holdCoPrincipal = holdCoOutstandingDebt;
            } else {
              const yearPct = stepUpPercentages[amortYearIdx] || 0;
              const annualPrincipal = holdCoInitialDebtAtStartOfOperations * (yearPct / 100);
              m_holdCoPrincipal = Math.min(holdCoOutstandingDebt, annualPrincipal / 12);
            }
          } else if (elapsedProjectMonth <= tenorMonths) {
            m_holdCoPrincipal = Math.min(
              holdCoOutstandingDebt,
              holdCoPmt - m_holdCoInterest,
            );
          } else {
            m_holdCoPrincipal = holdCoOutstandingDebt;
          }
          if (m_holdCoPrincipal < 0) m_holdCoPrincipal = 0;
          operatingMonthCounter++;
        }`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/financialEngine.ts', content.replace(targetStr, replacementStr));
  console.log("Success");
} else {
  console.log("Target not found");
}
