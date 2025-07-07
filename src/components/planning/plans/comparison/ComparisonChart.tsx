
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface PlanData {
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  target_retirement_age: number;
  target_savings_rate: number;
  total_assets: number;
}

interface ComparisonChartProps {
  currentPlan: PlanData;
  editablePlan: PlanData;
  planName?: string;
}

const ComparisonChart = ({ currentPlan, editablePlan, planName }: ComparisonChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Generate projection data for both plans
  const generateProjections = (plan: PlanData, planType: 'current' | 'editable') => {
    const projections = [];
    const currentAge = 30; // Assuming current age
    const retirementAge = plan.target_retirement_age;
    const deathAge = 85;
    const annualGrowthRate = 0.07; // 7% annual growth
    const annualExpenses = plan.monthly_expenses * 12;
    const annualSavings = plan.monthly_savings * 12;
    
    let portfolioValue = plan.total_assets;
    
    for (let age = currentAge; age <= deathAge; age++) {
      const year = new Date().getFullYear() + (age - currentAge);
      const isRetired = age >= retirementAge;
      
      if (!isRetired) {
        // Pre-retirement: Add savings and apply growth
        portfolioValue += annualSavings;
        portfolioValue *= (1 + annualGrowthRate);
      } else {
        // Post-retirement: Apply growth first, then subtract expenses
        portfolioValue *= (1 + annualGrowthRate);
        portfolioValue -= annualExpenses;
        
        // Don't let portfolio go negative
        portfolioValue = Math.max(0, portfolioValue);
      }
      
      projections.push({
        age,
        year,
        [`${planType}Value`]: Math.round(portfolioValue),
      });
    }
    
    return projections;
  };

  const currentProjections = generateProjections(currentPlan, 'current');
  const editableProjections = generateProjections(editablePlan, 'editable');

  // Combine the data
  const combinedData = currentProjections.map((current, index) => ({
    ...current,
    ...editableProjections[index],
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis 
            dataKey="age" 
            className="text-gray-600 dark:text-gray-400"
            label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            className="text-gray-600 dark:text-gray-400"
            tickFormatter={formatCurrency}
            label={{ value: 'Portfolio Value', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              formatCurrency(value), 
              name === 'currentValue' ? 'Current Situation' : planName || 'Your Plan'
            ]}
            labelFormatter={(age) => `Age: ${age}`}
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              border: 'none',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <ReferenceLine 
            x={currentPlan.target_retirement_age} 
            stroke="#10b981" 
            strokeDasharray="5 5"
            label={{ value: "Current Retirement", position: "top" }}
          />
          <ReferenceLine 
            x={editablePlan.target_retirement_age} 
            stroke="#3b82f6" 
            strokeDasharray="5 5"
            label={{ value: "Plan Retirement", position: "top" }}
          />
          <Line 
            type="monotone" 
            dataKey="currentValue" 
            stroke="#9ca3af" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Current Situation"
          />
          <Line 
            type="monotone" 
            dataKey="editableValue" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            name={planName || 'Your Plan'}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComparisonChart;
