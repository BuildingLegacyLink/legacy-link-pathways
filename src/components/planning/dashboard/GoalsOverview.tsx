
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GoalsOverview = () => {
  const { user } = useAuth();

  const { data: goals = [] } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getRetirementAge = (targetDate: string) => {
    const retirementYear = new Date(targetDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const currentAge = 25; // Default assumption
    return currentAge + (retirementYear - currentYear);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="h-6 w-6" />
          My Goals
        </h2>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            // For demo purposes, assuming 25% progress on each goal
            const currentAmount = Number(goal.target_amount) * 0.25;
            const progress = calculateProgress(currentAmount, Number(goal.target_amount));
            
            return (
              <Card key={goal.id} className="hover:shadow-lg transition-shadow dark:bg-black dark:border-gray-800">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-lg dark:text-white">{goal.name}</CardTitle>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Target: {goal.goal_type === 'retirement' && goal.retirement_age
                        ? `Retire by Age ${goal.retirement_age}`
                        : formatCurrency(Number(goal.target_amount))}
                    </div>
                 </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="dark:text-gray-300">Progress</span>
                        <span className="dark:text-gray-300">{formatCurrency(currentAmount)} / {formatCurrency(Number(goal.target_amount))}</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{progress.toFixed(0)}% complete</div>
                    </div>
                    
                    {goal.target_date && (
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Target Date: </span>
                        <span className="font-medium dark:text-gray-300">
                          {new Date(goal.target_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {goal.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{goal.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="dark:bg-black dark:border-gray-800">
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Goals Set Yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Start by setting your first financial goal to track your progress.</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Set Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoalsOverview;
