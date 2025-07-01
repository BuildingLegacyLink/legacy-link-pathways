
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

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
          destination_asset:assets(id, name, type)
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

  // Calculate total expenses and savings when individual items change
  const calculateTotals = (expenseAmounts: { [key: string]: number }, savingsAmounts: { [key: string]: number }) => {
    const totalExpenses = Object.values(expenseAmounts).reduce((sum, amount) => sum + amount, 0);
    const totalSavings = Object.values(savingsAmounts).reduce((sum, amount) => sum + amount, 0);
    
    onPlanChange({
      ...planData,
      monthly_expenses: totalExpenses,
      monthly_savings: totalSavings,
    });
  };

  // State for individual expense and savings amounts
  const [expenseAmounts, setExpenseAmounts] = React.useState<{ [key: string]: number }>({});
  const [savingsAmounts, setSavingsAmounts] = React.useState<{ [key: string]: number }>({});

  // Initialize amounts from original data
  React.useEffect(() => {
    const initialExpenseAmounts: { [key: string]: number } = {};
    expenses.forEach((expense) => {
      const monthlyAmount = Number(expense.amount) * getFrequencyMultiplier(expense.frequency);
      initialExpenseAmounts[expense.id] = monthlyAmount;
    });
    setExpenseAmounts(initialExpenseAmounts);

    const initialSavingsAmounts: { [key: string]: number } = {};
    savingsContributions.forEach((saving) => {
      const monthlyAmount = Number(saving.amount) * getFrequencyMultiplier(saving.frequency);
      initialSavingsAmounts[saving.id] = monthlyAmount;
    });
    setSavingsAmounts(initialSavingsAmounts);
  }, [expenses, savingsContributions]);

  const updateExpenseAmount = (expenseId: string, amount: number) => {
    const newExpenseAmounts = { ...expenseAmounts, [expenseId]: amount };
    setExpenseAmounts(newExpenseAmounts);
    calculateTotals(newExpenseAmounts, savingsAmounts);
  };

  const updateSavingsAmount = (savingId: string, amount: number) => {
    const newSavingsAmounts = { ...savingsAmounts, [savingId]: amount };
    setSavingsAmounts(newSavingsAmounts);
    calculateTotals(expenseAmounts, newSavingsAmounts);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="monthly_income" className="text-sm font-medium">
          Monthly Income
        </Label>
        <Input
          id="monthly_income"
          type="number"
          value={formatCurrency(planData.monthly_income)}
          onChange={(e) => updatePlan('monthly_income', Number(e.target.value) || 0)}
          placeholder="Enter monthly income"
        />
      </div>

      {/* Individual Expenses */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Monthly Expenses</Label>
        {expenses.length > 0 ? (
          <div className="space-y-2">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex-1">{expense.name}</span>
                <div className="flex items-center space-x-2">
                  <span>$</span>
                  <Input
                    type="number"
                    value={expenseAmounts[expense.id]?.toFixed(0) || '0'}
                    onChange={(e) => updateExpenseAmount(expense.id, Number(e.target.value) || 0)}
                    className="w-20 h-8 text-xs"
                  />
                  <span className="text-xs">/mo</span>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t dark:border-gray-700">
              <div className="flex justify-between items-center font-semibold">
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
        <Label className="text-sm font-medium">Investment Contributions</Label>
        {savingsContributions.length > 0 ? (
          <div className="space-y-2">
            {savingsContributions.map((saving) => {
              const destinationName = saving.destination_asset?.name || 'General Savings';
              return (
                <div key={saving.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex-1">
                    Contribution to {destinationName}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span>$</span>
                    <Input
                      type="number"
                      value={savingsAmounts[saving.id]?.toFixed(0) || '0'}
                      onChange={(e) => updateSavingsAmount(saving.id, Number(e.target.value) || 0)}
                      className="w-20 h-8 text-xs"
                    />
                    <span className="text-xs">/mo</span>
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t dark:border-gray-700">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Monthly Savings</span>
                <span>${formatCurrency(planData.monthly_savings)}</span>
              </div>
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
        <Slider
          value={[planData.target_retirement_age]}
          onValueChange={([value]) => updatePlan('target_retirement_age', value)}
          max={75}
          min={30}
          step={1}
          className="w-full"
        />
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
        <strong>Current Savings Rate:</strong> {' '}
        {planData.monthly_income > 0 ? 
          ((planData.monthly_savings / planData.monthly_income) * 100).toFixed(1) : 0}%
      </div>
    </div>
  );
};

export default EditablePlanColumn;
