
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PlanData {
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  target_retirement_age: number;
  target_savings_rate: number;
  total_assets: number;
}

interface EditablePlanColumnProps {
  planData: PlanData;
  onPlanChange: (data: PlanData) => void;
}

const EditablePlanColumn = ({ planData, onPlanChange }: EditablePlanColumnProps) => {
  const { user } = useAuth();

  // Fetch user's income
  const { data: income = [] } = useQuery({
    queryKey: ['income', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user's expenses
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user's savings contributions
  const { data: savingsContributions = [] } = useQuery({
    queryKey: ['savings_contributions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('savings')
        .select(`
          *,
          destination_asset:assets(id, name, type),
          goal:goals(id, name)
        `)
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updatePlan = (field: keyof PlanData, value: number) => {
    onPlanChange({
      ...planData,
      [field]: value,
    });
  };

  const formatCurrency = (value: number) => {
    return value.toFixed(0);
  };

  const getFrequencyMultiplier = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 4.33;
      case 'monthly': return 1;
      case 'quarterly': return 0.25;
      case 'annual': return 1/12;
      default: return 1;
    }
  };

  // Calculate total income, expenses and savings when individual items change
  const calculateTotals = (incomeAmounts: { [key: string]: number }, expenseAmounts: { [key: string]: number }, savingsAmounts: { [key: string]: number }) => {
    const totalIncome = Object.values(incomeAmounts).reduce((sum, amount) => sum + amount, 0);
    const totalExpenses = Object.values(expenseAmounts).reduce((sum, amount) => sum + amount, 0);
    const totalSavings = Object.values(savingsAmounts).reduce((sum, amount) => sum + amount, 0);
    
    onPlanChange({
      ...planData,
      monthly_income: totalIncome,
      monthly_expenses: totalExpenses,
      monthly_savings: totalSavings,
    });
  };

  // State for individual income, expense and savings amounts
  const [incomeAmounts, setIncomeAmounts] = React.useState<{ [key: string]: number }>({});
  const [expenseAmounts, setExpenseAmounts] = React.useState<{ [key: string]: number }>({});
  const [savingsAmounts, setSavingsAmounts] = React.useState<{ [key: string]: number }>({});

  // Initialize amounts from original data
  React.useEffect(() => {
    const initialIncomeAmounts: { [key: string]: number } = {};
    income.forEach((incomeItem) => {
      const monthlyAmount = Number(incomeItem.amount) * getFrequencyMultiplier(incomeItem.frequency);
      initialIncomeAmounts[incomeItem.id] = monthlyAmount;
    });

    const initialExpenseAmounts: { [key: string]: number } = {};
    expenses.forEach((expense) => {
      const monthlyAmount = Number(expense.amount) * getFrequencyMultiplier(expense.frequency);
      initialExpenseAmounts[expense.id] = monthlyAmount;
    });

    const initialSavingsAmounts: { [key: string]: number } = {};
    savingsContributions.forEach((saving) => {
      const monthlyAmount = Number(saving.amount) * getFrequencyMultiplier(saving.frequency);
      initialSavingsAmounts[saving.id] = monthlyAmount;
    });

    // Only update state if there are actual changes
    if (Object.keys(initialIncomeAmounts).length > 0 || Object.keys(initialExpenseAmounts).length > 0 || Object.keys(initialSavingsAmounts).length > 0) {
      setIncomeAmounts(initialIncomeAmounts);
      setExpenseAmounts(initialExpenseAmounts);
      setSavingsAmounts(initialSavingsAmounts);
      
      // Calculate totals immediately after setting the amounts
      calculateTotals(initialIncomeAmounts, initialExpenseAmounts, initialSavingsAmounts);
    }
  }, [income, expenses, savingsContributions]);

  const updateIncomeAmount = (incomeId: string, amount: number) => {
    const newIncomeAmounts = { ...incomeAmounts, [incomeId]: amount };
    setIncomeAmounts(newIncomeAmounts);
    calculateTotals(newIncomeAmounts, expenseAmounts, savingsAmounts);
  };

  const updateExpenseAmount = (expenseId: string, amount: number) => {
    const newExpenseAmounts = { ...expenseAmounts, [expenseId]: amount };
    setExpenseAmounts(newExpenseAmounts);
    calculateTotals(incomeAmounts, newExpenseAmounts, savingsAmounts);
  };

  const updateSavingsAmount = (savingId: string, amount: number) => {
    const newSavingsAmounts = { ...savingsAmounts, [savingId]: amount };
    setSavingsAmounts(newSavingsAmounts);
    calculateTotals(incomeAmounts, expenseAmounts, newSavingsAmounts);
  };

  // Calculate surplus/shortfall
  const monthlySurplusShortfall = planData.monthly_income - planData.monthly_expenses - planData.monthly_savings;
  
  // Check if value is within $1 of $0
  const isBalanced = Math.abs(monthlySurplusShortfall) <= 1;
  const textColor = isBalanced ? "text-green-600" : "text-red-600";

  return (
    <div className="space-y-6">
      {/* Individual Income Streams */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Monthly Income</Label>
        {income.length > 0 ? (
          <div className="space-y-3">
            {income.map((incomeItem) => (
              <div key={incomeItem.id} className="flex justify-between items-center text-sm h-8">
                <span className="text-gray-600 dark:text-gray-400 flex-1">{incomeItem.name}</span>
                <div className="flex items-center space-x-2">
                  <span>$</span>
                  <Input
                    type="number"
                    value={incomeAmounts[incomeItem.id]?.toFixed(0) || '0'}
                    onChange={(e) => updateIncomeAmount(incomeItem.id, Number(e.target.value) || 0)}
                    className="w-20 h-7 text-xs"
                  />
                  <span className="text-xs">/mo</span>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t dark:border-gray-700">
              <div className="flex justify-between items-center font-semibold h-8">
                <span>Total Monthly Income</span>
                <span>${formatCurrency(planData.monthly_income)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No income added yet. Add them in Facts to see them here.
          </div>
        )}
      </div>

      {/* Individual Expenses */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Monthly Expenses</Label>
        {expenses.length > 0 ? (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center text-sm h-8">
                <span className="text-gray-600 dark:text-gray-400 flex-1">{expense.name}</span>
                <div className="flex items-center space-x-2">
                  <span>$</span>
                  <Input
                    type="number"
                    value={expenseAmounts[expense.id]?.toFixed(0) || '0'}
                    onChange={(e) => updateExpenseAmount(expense.id, Number(e.target.value) || 0)}
                    className="w-20 h-7 text-xs"
                  />
                  <span className="text-xs">/mo</span>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t dark:border-gray-700">
              <div className="flex justify-between items-center font-semibold h-8">
                <span>Total Monthly Expenses</span>
                <span>${formatCurrency(planData.monthly_expenses)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No expenses added yet. Add them in Facts to see them here.
          </div>
        )}
      </div>

      {/* Individual Savings Contributions */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Savings</Label>
        {savingsContributions.length > 0 ? (
          <div className="space-y-3">
            {savingsContributions.map((saving) => {
              const destinationName = saving.destination_asset?.name || 'General Savings';
              const goalName = saving.goal?.name;
              const description = goalName 
                ? `Contribution to ${destinationName} for ${goalName}`
                : `Contribution to ${destinationName}`;
              
              return (
                <div key={saving.id} className="flex justify-between items-center text-sm h-8">
                  <span className="text-gray-600 dark:text-gray-400 flex-1">
                    {description}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span>$</span>
                    <Input
                      type="number"
                      value={savingsAmounts[saving.id]?.toFixed(0) || '0'}
                      onChange={(e) => updateSavingsAmount(saving.id, Number(e.target.value) || 0)}
                      className="w-20 h-7 text-xs"
                    />
                    <span className="text-xs">/mo</span>
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t dark:border-gray-700">
              <div className="flex justify-between items-center font-semibold h-8">
                <span>Total Monthly Savings</span>
                <span>${formatCurrency(planData.monthly_savings)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center font-semibold h-8">
                <span className={textColor}>
                  {monthlySurplusShortfall >= 0 ? "Monthly Surplus" : "Monthly Shortfall"}
                </span>
                <span className={textColor}>
                  ${formatCurrency(Math.abs(monthlySurplusShortfall))}
                </span>
              </div>
              {!isBalanced && (
                <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200 text-xs">
                    Please make this value $0 by adjusting income/expenses/savings amount
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No savings contributions added yet. Add them in Facts to see them here.
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Retirement Age: {planData.target_retirement_age}
        </Label>
        <div className="h-8 flex items-center">
          <Slider
            value={[planData.target_retirement_age]}
            onValueChange={([value]) => updatePlan('target_retirement_age', value)}
            max={75}
            min={30}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default EditablePlanColumn;
