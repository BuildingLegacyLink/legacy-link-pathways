
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
  const { user } = useAuth();

  // Fetch expenses to get growth rates
  const { data: expenses } = useQuery({
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate weighted average expense growth rate
  const calculateExpenseGrowthRate = () => {
    if (!expenses || expenses.length === 0) return 0.03; // Default 3% inflation
    
    let totalWeightedGrowth = 0;
    let totalExpenses = 0;
    
    expenses.forEach(expense => {
      const amount = Number(expense.amount);
      // Use the growth_rate from the expense if available, otherwise default to 3%
      const growthRate = (expense.growth_rate != null ? Number(expense.growth_rate) : 3.0) / 100;
      
      // Convert to monthly if needed
      let monthlyAmount = amount;
      if (expense.frequency === 'annual') monthlyAmount = amount / 12;
      if (expense.frequency === 'weekly') monthlyAmount = amount * 4.33;
      if (expense.frequency === 'quarterly') monthlyAmount = amount / 3;
      
      totalWeightedGrowth += monthlyAmount * growthRate;
      totalExpenses += monthlyAmount;
    });
    
    return totalExpenses > 0 ? totalWeightedGrowth / totalExpenses : 0.03;
  };

  // Generate projection data for both plans
  const generateProjections = (plan: PlanData, planType: 'current' | 'editable') => {
    const projections = [];
    const currentAge = 30; // Assuming current age
    const retirementAge = plan.target_retirement_age;
    const deathAge = 85;
    const annualGrowthRate = 0.07; // 7% annual growth
    const expenseGrowthRate = calculateExpenseGrowthRate();
    let annualExpenses = plan.monthly_expenses * 12;
    const annualSavings = plan.monthly_savings * 12;
    
    let portfolioValue = plan.total_assets;
    
    for (let age = currentAge; age <= deathAge; age++) {
      const year = new Date().getFullYear() + (age - currentAge);
      const isRetired = age >= retirementAge;
      const yearsFromStart = age - currentAge;
      
      // Apply expense growth over time
      const inflatedAnnualExpenses = annualExpenses * Math.pow(1 + expenseGrowthRate, yearsFromStart);
      
      if (!isRetired) {
        // Pre-retirement: Add savings and apply growth
        portfolioValue += annualSavings;
        portfolioValue *= (1 + annualGrowthRate);
      } else {
        // Post-retirement: Apply growth first, then subtract inflated expenses
        portfolioValue *= (1 + annualGrowthRate);
        portfolioValue -= inflatedAnnualExpenses;
        
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
