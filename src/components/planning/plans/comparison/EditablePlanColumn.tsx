
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

  // Simple local state for input values as strings - allow empty strings
  const [localInputs, setLocalInputs] = useState<{ [key: string]: string }>({});

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

  // Initialize local inputs when data loads
  useEffect(() => {
    if ((income.length > 0 || expenses.length > 0 || savingsContributions.length > 0) && Object.keys(localInputs).length === 0) {
      const newLocalInputs: { [key: string]: string } = {};
      
      // Calculate original totals
      let totalOriginalIncome = 0;
      let totalOriginalExpenses = 0;
      let totalOriginalSavings = 0;
      
      income.forEach((item) => {
        totalOriginalIncome += Number(item.amount) * getFrequencyMultiplier(item.frequency);
      });
      
      expenses.forEach((item) => {
        totalOriginalExpenses += Number(item.amount) * getFrequencyMultiplier(item.frequency);
      });
      
      savingsContributions.forEach((item) => {
        totalOriginalSavings += Number(item.amount) * getFrequencyMultiplier(item.frequency);
      });
      
      // Set initial values directly from plan data
      income.forEach((item) => {
        const originalAmount = Number(item.amount) * getFrequencyMultiplier(item.frequency);
        const proportion = totalOriginalIncome > 0 ? originalAmount / totalOriginalIncome : 1 / income.length;
        const distributedAmount = planData.monthly_income * proportion;
        newLocalInputs[`income_${item.id}`] = Math.round(distributedAmount).toString();
      });
      
      expenses.forEach((item) => {
        const originalAmount = Number(item.amount) * getFrequencyMultiplier(item.frequency);
        const proportion = totalOriginalExpenses > 0 ? originalAmount / totalOriginalExpenses : 1 / expenses.length;
        const distributedAmount = planData.monthly_expenses * proportion;
        newLocalInputs[`expense_${item.id}`] = Math.round(distributedAmount).toString();
      });
      
      savingsContributions.forEach((item) => {
        const originalAmount = Number(item.amount) * getFrequencyMultiplier(item.frequency);
        const proportion = totalOriginalSavings > 0 ? originalAmount / totalOriginalSavings : 1 / savingsContributions.length;
        const distributedAmount = planData.monthly_savings * proportion;
        newLocalInputs[`saving_${item.id}`] = Math.round(distributedAmount).toString();
      });
      
      setLocalInputs(newLocalInputs);
    }
  }, [income, expenses, savingsContributions]);

  // Reset inputs when plan data is reset externally (like "Reset to Current Situation")
  useEffect(() => {
    // Only reset if we have existing inputs and the plan data appears to be reset to original values
    if (Object.keys(localInputs).length > 0 && income.length > 0 && expenses.length > 0) {
      const originalIncome = income.reduce((sum, item) => sum + Number(item.amount) * getFrequencyMultiplier(item.frequency), 0);
      const originalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount) * getFrequencyMultiplier(item.frequency), 0);
      const originalSavings = savingsContributions.reduce((sum, item) => sum + Number(item.amount) * getFrequencyMultiplier(item.frequency), 0);
      
      // If plan data matches original data, reset inputs
      if (Math.abs(planData.monthly_income - originalIncome) < 1 && 
          Math.abs(planData.monthly_expenses - originalExpenses) < 1 &&
          Math.abs(planData.monthly_savings - originalSavings) < 1) {
        
        const newLocalInputs: { [key: string]: string } = {};
        
        income.forEach((item) => {
          const monthlyAmount = Number(item.amount) * getFrequencyMultiplier(item.frequency);
          newLocalInputs[`income_${item.id}`] = Math.round(monthlyAmount).toString();
        });
        
        expenses.forEach((item) => {
          const monthlyAmount = Number(item.amount) * getFrequencyMultiplier(item.frequency);
          newLocalInputs[`expense_${item.id}`] = Math.round(monthlyAmount).toString();
        });
        
        savingsContributions.forEach((item) => {
          const monthlyAmount = Number(item.amount) * getFrequencyMultiplier(item.frequency);
          newLocalInputs[`saving_${item.id}`] = Math.round(monthlyAmount).toString();
        });
        
        setLocalInputs(newLocalInputs);
      }
    }
  }, [planData.monthly_income, planData.monthly_expenses, planData.monthly_savings]);

  // Handle input changes - allow empty string and numbers only
  const handleInputChange = (key: string, value: string) => {
    // Allow empty string or numbers only
    if (value === '' || /^\d*$/.test(value)) {
      setLocalInputs(prev => ({ ...prev, [key]: value }));
    }
  };

  // Handle input blur - calculate totals and update plan
  const handleInputBlur = () => {
    let newIncomeTotal = 0;
    let newExpenseTotal = 0;
    let newSavingsTotal = 0;
    
    // Calculate totals from local inputs, treating empty strings as 0
    income.forEach((item) => {
      const inputValue = localInputs[`income_${item.id}`];
      newIncomeTotal += inputValue === '' ? 0 : (Number(inputValue) || 0);
    });
    
    expenses.forEach((item) => {
      const inputValue = localInputs[`expense_${item.id}`];
      newExpenseTotal += inputValue === '' ? 0 : (Number(inputValue) || 0);
    });
    
    savingsContributions.forEach((item) => {
      const inputValue = localInputs[`saving_${item.id}`];
      newSavingsTotal += inputValue === '' ? 0 : (Number(inputValue) || 0);
    });
    
    // Update plan data
    onPlanChange({
      ...planData,
      monthly_income: newIncomeTotal,
      monthly_expenses: newExpenseTotal,
      monthly_savings: newSavingsTotal,
    });
  };

  const updatePlan = (field: keyof PlanData, value: number) => {
    onPlanChange({
      ...planData,
      [field]: value,
    });
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
                    type="text"
                    value={localInputs[`income_${incomeItem.id}`] || ''}
                    onChange={(e) => handleInputChange(`income_${incomeItem.id}`, e.target.value)}
                    onBlur={handleInputBlur}
                    className="w-20 h-7 text-xs"
                    placeholder="0"
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
                    type="text"
                    value={localInputs[`expense_${expense.id}`] || ''}
                    onChange={(e) => handleInputChange(`expense_${expense.id}`, e.target.value)}
                    onBlur={handleInputBlur}
                    className="w-20 h-7 text-xs"
                    placeholder="0"
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
                      type="text"
                      value={localInputs[`saving_${saving.id}`] || ''}
                      onChange={(e) => handleInputChange(`saving_${saving.id}`, e.target.value)}
                      onBlur={handleInputBlur}
                      className="w-20 h-7 text-xs"
                      placeholder="0"
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
