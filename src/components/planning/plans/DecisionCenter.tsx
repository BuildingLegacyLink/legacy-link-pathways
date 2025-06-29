
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, Copy, FileText, Edit2 } from 'lucide-react';
import PlanInputsSummary from './PlanInputsSummary';
import ProjectionChart from './ProjectionChart';
import ProjectionTable from './ProjectionTable';

interface DecisionCenterProps {
  planId: string;
  onBack: () => void;
}

const DecisionCenter = ({ planId, onBack }: DecisionCenterProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewType, setViewType] = useState<'cash_flow' | 'portfolio' | 'goals'>('cash_flow');
  const [isEditing, setIsEditing] = useState(false);

  // Fetch plan data
  const { data: plan, isLoading } = useQuery({
    queryKey: ['financial_plan', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_plans')
        .select('*')
        .eq('id', planId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!planId,
  });

  // Generate projections (simplified calculation)
  const generateProjections = (planData: any) => {
    const projections = [];
    const currentYear = new Date().getFullYear();
    const currentAge = 30; // Assuming current age of 30 for demo
    const retirementAge = planData.target_retirement_age;
    const deathAge = planData.assets_last_until_age;
    
    for (let age = currentAge; age <= deathAge; age++) {
      const year = currentYear + (age - currentAge);
      const isRetired = age >= retirementAge;
      
      // Simplified projection calculations
      const yearsFromNow = age - currentAge;
      const annualSavings = planData.monthly_savings * 12;
      const annualExpenses = planData.monthly_expenses * 12;
      const annualIncome = isRetired ? annualSavings * 0.04 : planData.monthly_income * 12; // 4% withdrawal rule
      
      const portfolioValue = planData.total_assets + (annualSavings * yearsFromNow * 1.07); // 7% growth
      const netWorth = portfolioValue;
      const cashFlow = annualIncome - annualExpenses;
      
      projections.push({
        year,
        age,
        net_worth: netWorth,
        portfolio_value: portfolioValue,
        annual_expenses: annualExpenses,
        cash_flow: cashFlow,
      });
    }
    
    return projections;
  };

  const projections = plan ? generateProjections(plan) : [];

  // Summary metrics
  const summaryMetrics = {
    yearsToRetirement: plan ? plan.target_retirement_age - 30 : 0,
    assetsLastUntil: plan ? plan.assets_last_until_age : 0,
    projectedSavings: plan ? plan.projected_retirement_savings : 0,
  };

  // Save plan mutation
  const savePlanMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { data, error } = await supabase
        .from('financial_plans')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', planId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_plans'] });
      queryClient.invalidateQueries({ queryKey: ['financial_plan', planId] });
      toast({ title: "Plan saved successfully!" });
    },
  });

  // Duplicate plan mutation
  const duplicatePlanMutation = useMutation({
    mutationFn: async () => {
      if (!plan) return;
      const { data, error } = await supabase
        .from('financial_plans')
        .insert({
          ...plan,
          id: undefined,
          name: `${plan.name} (Copy)`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_plans'] });
      toast({ title: "Plan duplicated successfully!" });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading || !plan) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading plan...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h2>
            <Badge variant={plan.status === 'on_track' ? "default" : "destructive"} className="mt-1">
              {plan.status === 'on_track' ? "On Track" : "Needs Attention"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Plan Inputs Summary */}
      <PlanInputsSummary 
        plan={plan}
        onEditInputs={() => setIsEditing(true)}
      />

      {/* Summary Metrics */}
      <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summaryMetrics.yearsToRetirement}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Years to Retirement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Age {summaryMetrics.assetsLastUntil}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Assets Last Until</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(summaryMetrics.projectedSavings)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Projected Retirement Savings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projection Views */}
      <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-gray-900 dark:text-white">Financial Projections</CardTitle>
            <Select value={viewType} onValueChange={(value: any) => setViewType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash_flow">Cash Flow Overview</SelectItem>
                <SelectItem value="portfolio">Lifetime Portfolio Value</SelectItem>
                <SelectItem value="goals">Goal Funding Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ProjectionChart data={projections} viewType={viewType} />
        </CardContent>
      </Card>

      {/* Projection Table */}
      <ProjectionTable data={projections} />

      {/* Plan Controls */}
      <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">Plan Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => savePlanMutation.mutate({})}
              disabled={savePlanMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Plan
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Rename Plan
            </Button>
            <Button 
              variant="outline"
              onClick={() => duplicatePlanMutation.mutate()}
              disabled={duplicatePlanMutation.isPending}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate Plan
            </Button>
            <Button variant="outline" disabled>
              <FileText className="h-4 w-4 mr-2" />
              Export Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DecisionCenter;
