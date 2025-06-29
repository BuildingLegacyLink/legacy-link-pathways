
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface PlanInputsSummaryProps {
  plan: {
    monthly_income: number;
    monthly_expenses: number;
    monthly_savings: number;
    current_savings_rate: number;
    total_assets: number;
    target_retirement_age: number;
    target_savings_rate: number;
  };
  onEditInputs: () => void;
}

const PlanInputsSummary = ({ plan, onEditInputs }: PlanInputsSummaryProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50 dark:shadow-lg dark:shadow-black/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-gray-900 dark:text-white">Plan Inputs Summary</CardTitle>
        <Button variant="outline" size="sm" onClick={onEditInputs}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Plan Inputs
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(plan.monthly_income)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Expenses</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(plan.monthly_expenses)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Savings</div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(plan.monthly_savings)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Savings Rate</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {plan.current_savings_rate.toFixed(1)}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Assets</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(plan.total_assets)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">Target Retirement Age</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {plan.target_retirement_age}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">Target Savings Rate</div>
            <div className="text-lg font-semibold text-blue-600">
              {plan.target_savings_rate.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanInputsSummary;
