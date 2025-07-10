import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Tables } from '@/integrations/supabase/types';

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

type ExpenseData = Tables<'expenses'>;

const ComparisonChart = ({ currentPlan, editablePlan, planName }: ComparisonChartProps) => {
  const { user } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<string>('total');

  // Fetch user profile to get date of birth
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('date_of_birth')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch retirement goal to get the target retirement age for current situation
  const { data: retirementGoal } = useQuery({
    queryKey: ['goals', user?.id, 'retirement'],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('goal_type', 'retirement')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

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
      return data as ExpenseData[];
    },
    enabled: !!user,
  });

  // Fetch user's assets for account selection
  const { data: assets } = useQuery({
    queryKey: ['assets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Filter assets to include investment, retirement, and savings accounts
  const filteredAssets = assets?.filter(asset => {
    const assetType = asset.type.toLowerCase();
    const assetName = asset.name.toLowerCase();
    
    // Include retirement account types
    if (['roth_ira', 'traditional_ira', '401k', '403b', '457', 'pension', 'sep_ira', 'simple_ira'].includes(assetType)) return true;
    if (assetType.includes('ira') || assetType.includes('401') || assetType.includes('403') || assetType.includes('457')) return true;
    if (assetType.includes('retirement') || assetType.includes('pension')) return true;
    
    // Include investment account types
    if (['brokerage', 'investment', 'mutual_fund', 'etf', 'stocks', 'bonds'].includes(assetType)) return true;
    if (assetType.includes('brokerage') || assetType.includes('investment') || assetType.includes('mutual')) return true;
    if (assetType.includes('stock') || assetType.includes('bond') || assetType.includes('fund')) return true;
    
    // Include savings account types
    if (['savings', 'high_yield_savings', 'money_market', 'cd', 'certificate_of_deposit'].includes(assetType)) return true;
    if (assetType.includes('savings') || assetType.includes('money_market') || assetType.includes('certificate')) return true;
    
    // Include HSA if it has investment component
    if (assetType.includes('hsa')) return true;
    
    // Exclude personal assets, checking accounts, vehicles, property, etc.
    if (assetType.includes('checking') || assetType.includes('vehicle') || assetType.includes('car') || 
        assetType.includes('property') || assetType.includes('real_estate') || assetType.includes('home') ||
        assetType.includes('auto') || assetType.includes('personal')) return false;
    
    // If it's not explicitly excluded and contains investment-related keywords in name, include it
    if (assetName.includes('investment') || assetName.includes('retirement') || assetName.includes('savings') ||
        assetName.includes('portfolio') || assetName.includes('fund') || assetName.includes('account')) return true;
    
    return false;
  }) || [];

  // Calculate current age from date of birth
  const calculateCurrentAge = () => {
    if (!profile?.date_of_birth) return 30; // Default fallback
    
    const today = new Date();
    const birthDate = new Date(profile.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

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

  // Projection function that uses the appropriate data for each plan
  const generateProjections = (plan: PlanData, planType: 'current' | 'editable') => {
    const projections = [];
    const currentAge = calculateCurrentAge();
    
    // Use correct retirement age source for each plan type
    const retirementAge = planType === 'current' 
      ? (retirementGoal?.retirement_age || 67)  // Current situation uses goal from facts
      : plan.target_retirement_age;             // Editable plan uses its own target
    
    const deathAge = 85;
    const annualGrowthRate = 0.07;
    const expenseGrowthRate = calculateExpenseGrowthRate();
    let annualExpenses = plan.monthly_expenses * 12;
    const annualSavings = plan.monthly_savings * 12;
    
    // Debug logging to see the differences
    console.log(`${planType} plan data:`, {
      monthlyIncome: plan.monthly_income,
      monthlyExpenses: plan.monthly_expenses,
      monthlySavings: plan.monthly_savings,
      totalAssets: plan.total_assets,
      retirementAge: retirementAge,
      annualSavings: annualSavings,
      annualExpenses: annualExpenses,
      dataSource: planType === 'current' ? 'retirement goal from facts' : 'editable plan inputs'
    });
    
    // Calculate starting values based on selected account
    let portfolioValue = plan.total_assets;
    let selectedAsset = null;
    
    if (selectedAccount !== 'total' && assets) {
      selectedAsset = assets.find(asset => asset.id === selectedAccount);
      if (selectedAsset) {
        portfolioValue = Number(selectedAsset.value);
        // For individual accounts, allocate savings proportionally based on current asset allocation
        // Use the current plan's total assets for proportion calculation to maintain consistency
        const referenceAssets = currentPlan.total_assets; // Use current plan as reference for both
        const assetProportion = referenceAssets > 0 ? portfolioValue / referenceAssets : 0;
        const allocatedSavings = annualSavings * assetProportion;
        
        for (let age = currentAge; age <= deathAge; age++) {
          const year = new Date().getFullYear() + (age - currentAge);
          const isRetired = age > retirementAge;
          const yearsFromStart = age - currentAge;
          
          // Apply expense growth over time
          const inflatedAnnualExpenses = annualExpenses * Math.pow(1 + expenseGrowthRate, yearsFromStart);
          
          if (!isRetired) {
            // Pre-retirement: Add proportional savings and apply growth
            portfolioValue += allocatedSavings;
            portfolioValue *= (1 + annualGrowthRate);
          } else {
            // Post-retirement: Apply growth first, then subtract proportional expenses
            portfolioValue *= (1 + annualGrowthRate);
            portfolioValue -= inflatedAnnualExpenses * assetProportion;
            
            // Don't let portfolio go negative
            portfolioValue = Math.max(0, portfolioValue);
          }
          
          projections.push({
            age,
            year,
            [`${planType}Value`]: Math.round(portfolioValue),
          });
        }
      }
    } else {
      // Total portfolio calculation - uses each plan's own data
      for (let age = currentAge; age <= deathAge; age++) {
        const year = new Date().getFullYear() + (age - currentAge);
        const isRetired = age > retirementAge;
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
        
        // Debug logging for key ages
        if (age === retirementAge || age === retirementAge + 1) {
          console.log(`${planType} plan at age ${age}:`, {
            isRetired,
            portfolioValue,
            annualSavings,
            inflatedAnnualExpenses,
            retirementAge
          });
        }
        
        projections.push({
          age,
          year,
          [`${planType}Value`]: Math.round(portfolioValue),
        });
      }
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

  // Get current selected account name for display
  const getSelectedAccountName = () => {
    if (selectedAccount === 'total') return 'Total Portfolio Value';
    if (assets) {
      const asset = assets.find(a => a.id === selectedAccount);
      return asset ? asset.name : 'Total Portfolio Value';
    }
    return 'Total Portfolio Value';
  };

  return (
    <div className="space-y-4">
      {/* Account Selection Dropdown */}
      <div className="flex justify-end">
        <div className="w-48">
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem value="total" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                Total Portfolio Value
              </SelectItem>
              {filteredAssets && filteredAssets.map((asset) => (
                <SelectItem 
                  key={asset.id} 
                  value={asset.id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Chart */}
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
              label={{ 
                value: selectedAccount === 'total' ? 'Portfolio Value' : `${getSelectedAccountName()} Value`, 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                formatCurrency(value), 
                name
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
              x={retirementGoal?.retirement_age || 67} 
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
              name={planName || 'New Plan'}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComparisonChart;
