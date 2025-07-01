import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Label } from '@/components/ui/label';

interface PlanData {
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  target_retirement_age: number;
  target_savings_rate: number;
  total_assets: number;
}

interface CurrentSituationColumnProps {
  planData: PlanData;
}

const CurrentSituationColumn = ({ planData }: CurrentSituationColumnProps) => {
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

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(0)}`;
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

  // Calculate surplus/shortfall
  const monthlySurplusShortfall = planData.monthly_income - planData.monthly_expenses - planData.monthly_savings;
  
  // Check if value is within $1 of $0
  const isBalanced = Math.abs(monthlySurplusShortfall) <= 1;
  const textColor = isBalanced ? "text-green-600" : "text-red-600";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Monthly Income</Label>
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatCurrency(planData.monthly_income)}
        </div>
      </div>

      {/* Individual Expenses */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Monthly Expenses</Label>
        {expenses.length > 0 ? (
          <div className="space-y-2">
            {expenses.map((expense) => {
              const monthlyAmount = Number(expense.amount) * getFrequencyMultiplier(expense.frequency);
              return (
                <div key={expense.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{expense.name}</span>
                  <span className="font-medium">${monthlyAmount.toFixed(0)}/mo</span>
                </div>
              );
            })}
            <div className="pt-2 border-t dark:border-gray-700">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Monthly Expenses</span>
                <span>{formatCurrency(planData.monthly_expenses)}</span>
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
              const monthlyAmount = Number(saving.amount) * getFrequencyMultiplier(saving.frequency);
              const destinationName = saving.destination_asset?.name || 'General Savings';
              return (
                <div key={saving.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Contribution to {destinationName}
                  </span>
                  <span className="font-medium">${monthlyAmount.toFixed(0)}/mo</span>
                </div>
              );
            })}
            <div className="pt-2 border-t dark:border-gray-700">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Monthly Savings</span>
                <span>{formatCurrency(planData.monthly_savings)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center font-semibold">
                <span className={textColor}>
                  {monthlySurplusShortfall >= 0 ? "Monthly Surplus" : "Monthly Shortfall"}
                </span>
                <span className={textColor}>
                  {formatCurrency(Math.abs(monthlySurplusShortfall))}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No savings contributions added yet. Add them in Facts to see them here.
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Target Retirement Age</Label>
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          {planData.target_retirement_age}
        </div>
      </div>
    </div>
  );
};

export default CurrentSituationColumn;
