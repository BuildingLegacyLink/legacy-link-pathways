
import { formatCurrency } from '@/utils/currency';
import { PlanData } from '../PlanBuilderComparison';

interface CurrentSituationColumnProps {
  planData: PlanData;
}

const CurrentSituationColumn = ({ planData }: CurrentSituationColumnProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Monthly Income
        </label>
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-white">
          {formatCurrency(planData.monthly_income)}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Monthly Expenses
        </label>
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-white">
          {formatCurrency(planData.monthly_expenses)}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Monthly Savings
        </label>
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-white">
          {formatCurrency(planData.monthly_savings)}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Current Savings Rate
        </label>
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-white">
          {planData.monthly_income > 0 ? 
            ((planData.monthly_savings / planData.monthly_income) * 100).toFixed(1) : 0}%
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Retirement Age
        </label>
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-white">
          {planData.target_retirement_age}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Total Assets
        </label>
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-white">
          {formatCurrency(planData.total_assets)}
        </div>
      </div>
    </div>
  );
};

export default CurrentSituationColumn;
