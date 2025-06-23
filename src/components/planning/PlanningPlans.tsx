
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
      <h2 className="text-2xl font-bold text-gray-900">Financial Planning Scenarios</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Scenario */}
        <Card>
          <CardHeader>
            <CardTitle>Current Scenario</CardTitle>
            <CardDescription>Based on your current financial facts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Monthly Income:</span>
                <span className="font-semibold">{formatCurrency(monthlyIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Expenses:</span>
                <span className="font-semibold">{formatCurrency(monthlyExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Savings:</span>
                <span className="font-semibold text-green-600">{formatCurrency(currentSavings)}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Savings Rate:</span>
                <span className="font-semibold">{monthlyIncome > 0 ? ((currentSavings / monthlyIncome) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Total Assets:</span>
                <span className="font-bold">{formatCurrency(totalAssets)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scenario Planning */}
        <Card>
          <CardHeader>
            <CardTitle>Scenario Planning</CardTitle>
            <CardDescription>Adjust variables to see impact on your future</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Target Savings Rate: {savingsRate[0]}%</Label>
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
              <Label>Target Retirement Age: {retirementAge[0]}</Label>
              <Slider
                value={retirementAge}
                onValueChange={setRetirementAge}
                max={75}
                min={55}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span>Projected Monthly Savings:</span>
                <span className="font-semibold text-blue-600">{formatCurrency(projectedSavings)}</span>
              </div>
              <div className="flex justify-between">
                <span>Years to Retirement:</span>
                <span className="font-semibold">{yearsToRetirement} years</span>
              </div>
              <div className="flex justify-between">
                <span>Projected Retirement Savings:</span>
                <span className="font-bold text-green-600">{formatCurrency(projectedRetirementSavings)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Impact Analysis</CardTitle>
          <CardDescription>How changes affect your financial future</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(projectedSavings - currentSavings)}
              </div>
              <div className="text-sm text-gray-600">Monthly Savings Change</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency((projectedSavings - currentSavings) * 12 * yearsToRetirement)}
              </div>
              <div className="text-sm text-gray-600">Additional Retirement Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {retirementAge[0] - 67}
              </div>
              <div className="text-sm text-gray-600">Years Earlier/Later Retirement</div>
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
