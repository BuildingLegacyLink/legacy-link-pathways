
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import CurrentSituationColumn from './comparison/CurrentSituationColumn';
import EditablePlanColumn from './comparison/EditablePlanColumn';
import ComparisonChart from './comparison/ComparisonChart';
import { calculateProbabilityOfSuccess } from '@/utils/planCalculations';

interface PlanBuilderComparisonProps {
  onBack: () => void;
}

export interface PlanData {
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  target_retirement_age: number;
  target_savings_rate: number;
  total_assets: number;
}

const PlanBuilderComparison = ({ onBack }: PlanBuilderComparisonProps) => {
  const { user } = useAuth();
  const [editablePlan, setEditablePlan] = useState<PlanData>({
    monthly_income: 0,
    monthly_expenses: 0,
    monthly_savings: 0,
    target_retirement_age: 67,
    target_savings_rate: 20,
    total_assets: 0,
  });

  // Fetch user's current financial data
  const { data: income } = useQuery({
    queryKey: ['income', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

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

  const { data: savingsContributions } = useQuery({
    queryKey: ['savings_contributions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('savings')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

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

  // Get target retirement age directly from retirement goal
  const getTargetRetirementAge = () => {
    return retirementGoal?.retirement_age || 67;
  };

  // Calculate current situation from user data
  const currentSituation: PlanData = useMemo(() => ({
    monthly_income: income?.reduce((sum, inc) => {
      const amount = Number(inc.amount);
      if (inc.frequency === 'annual') return sum + (amount / 12);
      if (inc.frequency === 'weekly') return sum + (amount * 4.33);
      return sum + amount;
    }, 0) || 0,
    monthly_expenses: expenses?.reduce((sum, exp) => {
      const amount = Number(exp.amount);
      if (exp.frequency === 'annual') return sum + (amount / 12);
      if (exp.frequency === 'weekly') return sum + (amount * 4.33);
      return sum + amount;
    }, 0) || 0,
    monthly_savings: savingsContributions?.reduce((sum, saving) => {
      const amount = Number(saving.amount);
      if (saving.frequency === 'annual') return sum + (amount / 12);
      if (saving.frequency === 'weekly') return sum + (amount * 4.33);
      return sum + amount;
    }, 0) || 0,
    target_retirement_age: getTargetRetirementAge(),
    target_savings_rate: 20,
    total_assets: assets?.reduce((sum, asset) => sum + Number(asset.value), 0) || 0,
  }), [income, expenses, savingsContributions, assets, retirementGoal]);

  // Initialize editable plan with current situation data
  useEffect(() => {
    if (currentSituation.monthly_income > 0 || retirementGoal) {
      setEditablePlan({
        ...currentSituation,
        target_retirement_age: currentSituation.target_retirement_age,
      });
    }
  }, [currentSituation, retirementGoal]);

  // Calculate probability of success for both plans
  const currentPoS = calculateProbabilityOfSuccess(currentSituation);
  const editablePoS = calculateProbabilityOfSuccess(editablePlan);

  const getProbabilityBadge = (probability: number) => {
    if (probability >= 80) {
      return <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">{probability}% 📈</Badge>;
    } else if (probability >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800 text-lg px-3 py-1">{probability}% ⚠️</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 text-lg px-3 py-1">{probability}% 📉</Badge>;
    }
  };

  const resetToCurrentSituation = () => {
    setEditablePlan(currentSituation);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Plan Builder: Compare Current vs. Your Plan
          </h2>
        </div>
      </div>

      {/* Split View Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Situation Column */}
        <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                Current Situation
              </CardTitle>
              <div title="Success means your plan's assets are likely to last through retirement in most market scenarios.">
                {getProbabilityBadge(currentPoS)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CurrentSituationColumn planData={currentSituation} />
          </CardContent>
        </Card>

        {/* Editable Plan Column */}
        <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                Your Plan
              </CardTitle>
              <div title="Success means your plan's assets are likely to last through retirement in most market scenarios.">
                {getProbabilityBadge(editablePoS)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <EditablePlanColumn 
              planData={editablePlan} 
              onPlanChange={setEditablePlan}
            />
            <div className="mt-6 pt-4 border-t dark:border-gray-700">
              <Button 
                variant="outline" 
                onClick={resetToCurrentSituation}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Current Situation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 dark:text-white">
            Portfolio Value: Current Situation vs Your Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ComparisonChart 
            currentPlan={currentSituation}
            editablePlan={editablePlan}
            planName="Your Plan"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanBuilderComparison;
