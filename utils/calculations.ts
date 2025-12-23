
import { CalcMethod, SimulationResult, AmortizationRow } from '../types';

/**
 * Main simulation engine.
 */
export const calculateInstallment = (
  otr: number,
  dpNominal: number,
  tenor: number,
  annualInterestRate: number,
  adminFee: number,
  insurance: number,
  method: CalcMethod
): SimulationResult => {
  const principal = otr - dpNominal;
  const totalFees = adminFee + insurance;
  const totalFinancing = principal + totalFees;
  const monthlyInterestRate = (annualInterestRate / 100) / 12;
  
  let monthlyInstallment = 0;
  const amortization: AmortizationRow[] = [];

  if (method === CalcMethod.FLAT) {
    // FLAT: cicilan = (total_pinjaman + bunga_total) / tenor
    const totalInterest = totalFinancing * (annualInterestRate / 100) * (tenor / 12);
    monthlyInstallment = (totalFinancing + totalInterest) / tenor;
    
    // Flat amortization is simple, but we generate it for consistency
    let remaining = totalFinancing;
    const principalPerMonth = totalFinancing / tenor;
    const interestPerMonth = totalInterest / tenor;
    
    for (let i = 1; i <= tenor; i++) {
      remaining -= principalPerMonth;
      amortization.push({
        month: i,
        interest: interestPerMonth,
        principal: principalPerMonth,
        installment: monthlyInstallment,
        remainingBalance: Math.max(0, remaining)
      });
    }
  } else {
    // ANNUITY: cicilan = P * r * (1+r)^n / ((1+r)^n - 1)
    if (monthlyInterestRate === 0) {
      monthlyInstallment = totalFinancing / tenor;
    } else {
      monthlyInstallment = totalFinancing * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenor) / 
                           (Math.pow(1 + monthlyInterestRate, tenor) - 1);
    }

    let remaining = totalFinancing;
    for (let i = 1; i <= tenor; i++) {
      const interestPayment = remaining * monthlyInterestRate;
      const principalPayment = monthlyInstallment - interestPayment;
      remaining -= principalPayment;
      
      amortization.push({
        month: i,
        interest: interestPayment,
        principal: principalPayment,
        installment: monthlyInstallment,
        remainingBalance: Math.max(0, remaining)
      });
    }
  }

  const totalPayment = monthlyInstallment * tenor;

  /* The return object literal now correctly matches the updated SimulationResult interface */
  return {
    otr,
    dpNominal,
    dpPercent: (dpNominal / otr) * 100,
    principal,
    totalFees,
    totalFinancing,
    monthlyInstallment,
    totalPayment,
    amortization
  };
};
