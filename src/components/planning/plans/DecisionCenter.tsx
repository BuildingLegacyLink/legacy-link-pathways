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

  // Fetch savings contributions
  const { data: savingsContributions = [] } = useQuery({
    queryKey: ['savings_contributions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('savings')
        .select(`
          *,
          destination_asset:assets(id, name, type),
          goal:goals(id, name)
        `)
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch assets for destination routing
  const { data: assets = [] } = useQuery({
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
    enabled: !!user
  });

  // Helper function to convert frequency to annual multiplier
  const getAnnualMultiplier = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 52;
      case 'monthly': return 12;
      case 'quarterly': return 4;
      case 'annual': return 1;
      default: return 12; // Default to monthly
    }
  };

  // Generate projections with savings contributions factored in
  const generateProjections = (planData: any) => {
    const projections = [];
    const currentYear = new Date().getFullYear();
    const currentAge = 30; // Assuming current age of 30 for demo
    const retirementAge = planData.target_retirement_age;
    const deathAge = planData.assets_last_until_age;
    
    // Initialize asset balances from current assets
    const assetBalances = new Map();
    assets.forEach(asset => {
      assetBalances.set(asset.id, Number(asset.value));
    });
    
    // Calculate total annual contributions by destination
    const contributionsByDestination = new Map();
    let totalAnnualContributions = 0;
    
    savingsContributions.forEach(contribution => {
      const annualAmount = Number(contribution.amount) * getAnnualMultiplier(contribution.frequency);
      totalAnnualContributions += annualAmount;
      
      if (contribution.destination_asset_id) {
        const current = contributionsByDestination.get(contribution.destination_asset_id) || 0;
        contributionsByDestination.set(contribution.destination_asset_id, current + annualAmount);
      }
    });
    
    for (let age = currentAge; age <= deathAge; age++) {
      const year = currentYear + (age - currentAge);
      const isRetired = age >= retirementAge;
      const yearsFromNow = age - currentAge;
      
      // Base calculations from plan
      const baseSavings = planData.monthly_savings * 12;
      const annualExpenses = planData.monthly_expenses * 12;
      const annualIncome = isRetired ? baseSavings * 0.04 : planData.monthly_income * 12; // 4% withdrawal rule
      
      // Calculate portfolio value with contributions
      let portfolioValue = planData.total_assets;
      
      // Add base savings growth
      portfolioValue += baseSavings * yearsFromNow * Math.pow(1.07, yearsFromNow);
      
      // Add savings contributions growth
      if (yearsFromNow > 0) {
        // Calculate contributions with compound growth
        const contributionGrowth = totalAnnualContributions * 
          ((Math.pow(1.07, yearsFromNow) - 1) / 0.07);
        portfolioValue += contributionGrowth;
      }
      
      // Calculate asset-specific values
      let totalAssetValue = 0;
      assetBalances.forEach((balance, assetId) => {
        const asset = assets.find(a => a.id === assetId);
        const growthRate = asset?.growth_rate || 0.07;
        const annualContribution = contributionsByDestination.get(assetId) || 0;
        
        // Apply growth and contributions
        let assetValue = balance * Math.pow(1 + growthRate, yearsFromNow);
        if (yearsFromNow > 0 && annualContribution > 0) {
          assetValue += annualContribution * ((Math.pow(1 + growthRate, yearsFromNow) - 1) / growthRate);
        }
        
        totalAssetValue += assetValue;
      });
      
      // Use the higher of calculated portfolio value or asset-specific calculation
      portfolioValue = Math.max(portfolioValue, totalAssetValue);
      
      const netWorth = portfolioValue;
      const cashFlow = annualIncome - annualExpenses + (isRetired ? 0 : totalAnnualContributions);
      
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
