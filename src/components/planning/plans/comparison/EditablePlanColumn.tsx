
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
  const updatePlan = (field: keyof PlanData, value: number) => {
    onPlanChange({
      ...planData,
      [field]: value,
    });
  };

  const formatCurrency = (value: number) => {
    return value.toFixed(0);
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

      <div className="space-y-2">
        <Label htmlFor="monthly_expenses" className="text-sm font-medium">
          Monthly Expenses
        </Label>
        <Input
          id="monthly_expenses"
          type="number"
          value={formatCurrency(planData.monthly_expenses)}
          onChange={(e) => updatePlan('monthly_expenses', Number(e.target.value) || 0)}
          placeholder="Enter monthly expenses"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthly_savings" className="text-sm font-medium">
          Monthly Savings
        </Label>
        <Input
          id="monthly_savings"
          type="number"
          value={formatCurrency(planData.monthly_savings)}
          onChange={(e) => updatePlan('monthly_savings', Number(e.target.value) || 0)}
          placeholder="Enter monthly savings"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Target Savings Rate: {planData.target_savings_rate}%
        </Label>
        <Slider
          value={[planData.target_savings_rate]}
          onValueChange={([value]) => updatePlan('target_savings_rate', value)}
          max={50}
          min={0}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Retirement Age: {planData.target_retirement_age}
        </Label>
        <Slider
          value={[planData.target_retirement_age]}
          onValueChange={([value]) => updatePlan('target_retirement_age', value)}
          max={75}
          min={55}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="total_assets" className="text-sm font-medium">
          Total Assets
        </Label>
        <Input
          id="total_assets"
          type="number"
          value={formatCurrency(planData.total_assets)}
          onChange={(e) => updatePlan('total_assets', Number(e.target.value) || 0)}
          placeholder="Enter total assets"
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
