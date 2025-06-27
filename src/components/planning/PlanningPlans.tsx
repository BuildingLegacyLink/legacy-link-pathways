
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const PlanningPlans = () => {
  const [savingsRate, setSavingsRate] = useState([20]);
  const [retirementAge, setRetirementAge] = useState([67]);

  const { data: income } = useQuery({
    queryKey: ['income'],
    queryFn: async () => {
      const { data, error } = await supabase.from('income').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expenses').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: assets } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('assets').select('*');
      if (error) throw error;
      return data;
    },
  });

  // Calculate current metrics
  const monthlyIncome = income?.reduce((sum, inc) => {
    const amount = Number(inc.amount);
    if (inc.frequency === 'annual') return sum + (amount / 12);
    if (inc.frequency === 'weekly') return sum + (amount * 4.33);
    return sum + amount;
  }, 0) || 0;

  const monthlyExpenses = expenses?.reduce((sum, exp) => {
    const amount = Number(exp.amount);
    if (exp.frequency === 'annual') return sum + (amount / 12);
    if (exp.frequency === 'weekly') return sum + (amount * 4.33);
    return sum + amount;
  }, 0) || 0;

  const currentSavings = monthlyIncome - monthlyExpenses;
  const projectedSavings = monthlyIncome * (savingsRate[0] / 100);
  const totalAssets = assets?.reduce((sum, asset) => sum + Number(asset.value), 0) || 0;

  // Simple retirement projection
  const yearsToRetirement = retirementAge[0] - 30; // Assuming current age 30
  const projectedRetirementSavings = totalAssets + (projectedSavings * 12 * yearsToRetirement * 1.07); // 7% growth

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Planning Scenarios</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Scenario */}
        <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50 dark:shadow-lg dark:shadow-black/20">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Current Scenario</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Based on your current financial facts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Monthly Income:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(monthlyIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Monthly Expenses:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(monthlyExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Monthly Savings:</span>
                <span className="font-semibold text-green-600">{formatCurrency(currentSavings)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Current Savings Rate:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{monthlyIncome > 0 ? ((currentSavings / monthlyIncome) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="flex justify-between border-t dark:border-gray-700 pt-2">
                <span className="text-gray-700 dark:text-gray-300">Total Assets:</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(totalAssets)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scenario Planning */}
        <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50 dark:shadow-lg dark:shadow-black/20">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Scenario Planning</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Adjust variables to see impact on your future</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-gray-900 dark:text-white">Target Savings Rate: {savingsRate[0]}%</Label>
              <Slider
                value={savingsRate}
                onValueChange={setSavingsRate}
                max={50}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-gray-900 dark:text-white">Target Retirement Age: {retirementAge[0]}</Label>
              <Slider
                value={retirementAge}
                onValueChange={setRetirementAge}
                max={75}
                min={55}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2 pt-4 border-t dark:border-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Projected Monthly Savings:</span>
                <span className="font-semibold text-blue-600">{formatCurrency(projectedSavings)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Years to Retirement:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{yearsToRetirement} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Projected Retirement Savings:</span>
                <span className="font-bold text-green-600">{formatCurrency(projectedRetirementSavings)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Analysis */}
      <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50 dark:shadow-lg dark:shadow-black/20">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Impact Analysis</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">How changes affect your financial future</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(projectedSavings - currentSavings)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Savings Change</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency((projectedSavings - currentSavings) * 12 * yearsToRetirement)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Additional Retirement Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {retirementAge[0] - 67}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Years Earlier/Later Retirement</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button size="lg" className="bg-green-600 hover:bg-green-700">
          Save This Scenario
        </Button>
      </div>
    </div>
  );
};

export default PlanningPlans;
