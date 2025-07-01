
import { PlanData } from '@/components/planning/plans/PlanBuilderComparison';

export const calculateProbabilityOfSuccess = (plan: PlanData): number => {
  // Simplified rule-based probability calculation
  // In a real implementation, this would use Monte Carlo simulation
  
  const {
    monthly_income,
    monthly_expenses,
    monthly_savings,
    target_retirement_age,
    total_assets
  } = plan;

  if (monthly_income === 0) return 0;

  // Base probability factors
  let probability = 50; // Start at 50%

  // Savings rate factor (most important)
  const savingsRate = (monthly_savings / monthly_income) * 100;
  if (savingsRate >= 20) probability += 25;
  else if (savingsRate >= 15) probability += 15;
  else if (savingsRate >= 10) probability += 5;
  else if (savingsRate >= 5) probability -= 10;
  else probability -= 25;

  // Time to retirement factor
  const currentAge = 30; // Assuming current age
  const yearsToRetirement = target_retirement_age - currentAge;
  if (yearsToRetirement >= 35) probability += 15;
  else if (yearsToRetirement >= 25) probability += 10;
  else if (yearsToRetirement >= 15) probability += 5;
  else if (yearsToRetirement >= 10) probability -= 5;
  else probability -= 15;

  // Current assets factor
  const assetsToIncomeRatio = total_assets / (monthly_income * 12);
  if (assetsToIncomeRatio >= 3) probability += 10;
  else if (assetsToIncomeRatio >= 1) probability += 5;
  else if (assetsToIncomeRatio >= 0.5) probability += 2;
  else probability -= 5;

  // Expense management factor
  const expenseRatio = monthly_expenses / monthly_income;
  if (expenseRatio <= 0.5) probability += 10;
  else if (expenseRatio <= 0.7) probability += 5;
  else if (expenseRatio <= 0.8) probability += 0;
  else if (expenseRatio <= 0.9) probability -= 5;
  else probability -= 15;

  // Ensure probability is within valid range
  return Math.max(0, Math.min(100, Math.round(probability)));
};
