
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import SavedPlanCard from './plans/SavedPlanCard';
import DecisionCenter from './plans/DecisionCenter';

const PlanningPlans = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [savingsRate, setSavingsRate] = useState([20]);
  const [retirementAge, setRetirementAge] = useState([67]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showDecisionCenter, setShowDecisionCenter] = useState(false);

  // Fetch saved plans
  const { data: savedPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['financial_plans'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('financial_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user's financial data for plan creation
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

  // Create new plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const newPlan = {
        user_id: user.id,
        name: 'New Plan',
        monthly_income: monthlyIncome,
        monthly_expenses: monthlyExpenses,
        monthly_savings: projectedSavings,
        current_savings_rate: monthlyIncome > 0 ? (currentSavings / monthlyIncome) * 100 : 0,
        total_assets: totalAssets,
        target_retirement_age: retirementAge[0],
        target_savings_rate: savingsRate[0],
        projected_retirement_savings: projectedRetirementSavings,
        assets_last_until_age: 85,
        status: projectedRetirementSavings > monthlyExpenses * 12 * 25 ? 'on_track' : 'needs_attention',
      };

      const { data, error } = await supabase
        .from('financial_plans')
        .insert(newPlan)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newPlan) => {
      queryClient.invalidateQueries({ queryKey: ['financial_plans'] });
      setSelectedPlanId(newPlan.id);
      setShowDecisionCenter(true);
      toast({ title: "Plan created successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Error creating plan", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleOpenPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setShowDecisionCenter(true);
  };

  const handleBackToPlans = () => {
    setShowDecisionCenter(false);
    setSelectedPlanId(null);
  };

  if (showDecisionCenter && selectedPlanId) {
    return (
      <DecisionCenter 
        planId={selectedPlanId} 
        onBack={handleBackToPlans}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Planning Scenarios</h2>
      
      {/* Saved Plans Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Your Saved Plans</h3>
          <Button 
            onClick={() => createPlanMutation.mutate()}
            disabled={createPlanMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create a Plan
          </Button>
        </div>

        {plansLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-lg text-gray-600 dark:text-gray-300">Loading your plans...</div>
          </div>
        ) : savedPlans && savedPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPlans.map((plan) => (
              <SavedPlanCard 
                key={plan.id}
                plan={plan}
                onOpenPlan={handleOpenPlan}
              />
            ))}
          </div>
        ) : (
          <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50 dark:shadow-lg dark:shadow-black/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  You haven't built a plan yet.
                </h4>
                <p className="text-gray-600 dark:text-gray-300 max-w-md">
                  Start your personalized plan below and visualize your financial future with our Decision Center.
                </p>
                <Button 
                  onClick={() => createPlanMutation.mutate()}
                  disabled={createPlanMutation.isPending}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create a Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Current Scenario Builder */}
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
    </div>
  );
};

export default PlanningPlans;
