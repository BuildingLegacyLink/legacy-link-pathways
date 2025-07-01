
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import SavedPlanCard from './plans/SavedPlanCard';
import DecisionCenter from './plans/DecisionCenter';

const PlanningPlans = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
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
  const totalAssets = assets?.reduce((sum, asset) => sum + Number(asset.value), 0) || 0;

  // Create new plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const newPlan = {
        user_id: user.id,
        name: 'New Plan',
        monthly_income: monthlyIncome,
        monthly_expenses: monthlyExpenses,
        monthly_savings: currentSavings,
        current_savings_rate: monthlyIncome > 0 ? (currentSavings / monthlyIncome) * 100 : 0,
        total_assets: totalAssets,
        target_retirement_age: 67,
        target_savings_rate: 20,
        projected_retirement_savings: totalAssets + (currentSavings * 12 * 37 * 1.07), // Simple projection
        assets_last_until_age: 85,
        status: currentSavings > 0 ? 'on_track' : 'needs_attention',
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
          <div className="flex space-x-3">
            <Button 
              onClick={() => createPlanMutation.mutate()}
              disabled={createPlanMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create a Plan
            </Button>
          </div>
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
    </div>
  );
};

export default PlanningPlans;
