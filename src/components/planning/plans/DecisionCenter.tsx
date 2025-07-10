import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Check, X, RotateCcw, Pen, Trash } from 'lucide-react';
import ProjectionTable from './ProjectionTable';
import CurrentSituationColumn from './comparison/CurrentSituationColumn';
import EditablePlanColumn from './comparison/EditablePlanColumn';
import ComparisonChart from './comparison/ComparisonChart';
import { calculateProbabilityOfSuccess } from '@/utils/planCalculations';

interface DecisionCenterProps {
  planId: string;
  onBack: () => void;
}

interface PlanData {
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  target_retirement_age: number;
  target_savings_rate: number;
  total_assets: number;
}

const DecisionCenter = ({ planId, onBack }: DecisionCenterProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewType, setViewType] = useState<'cash_flow' | 'portfolio' | 'goals'>('cash_flow');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editablePlan, setEditablePlan] = useState<PlanData | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Fetch user profile for age calculation
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

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

  // Fetch goals for expense calculations
  const { data: goals = [] } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch user's current financial data for comparison
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

  const { data: currentAssets } = useQuery({
    queryKey: ['current_assets', user?.id],
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

  const { data: currentSavingsContributions } = useQuery({
    queryKey: ['current_savings_contributions', user?.id],
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

  // Calculate current situation from user's actual data
  const currentSituation: PlanData = {
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
    monthly_savings: currentSavingsContributions?.reduce((sum, saving) => {
      const amount = Number(saving.amount);
      if (saving.frequency === 'annual') return sum + (amount / 12);
      if (saving.frequency === 'weekly') return sum + (amount * 4.33);
      return sum + amount;
    }, 0) || 0,
    target_retirement_age: 67,
    target_savings_rate: 20,
    total_assets: currentAssets?.reduce((sum, asset) => sum + Number(asset.value), 0) || 0,
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

  // Calculate probability of success for both plans
  const currentPoS = calculateProbabilityOfSuccess(currentSituation);
  const editablePoS = editablePlan ? calculateProbabilityOfSuccess(editablePlan) : 0;

  // Initialize editable plan with plan data when available
  useEffect(() => {
    if (plan && !editablePlan) {
      setEditablePlan({
        monthly_income: plan.monthly_income,
        monthly_expenses: plan.monthly_expenses,
        monthly_savings: plan.monthly_savings,
        target_retirement_age: plan.target_retirement_age,
        target_savings_rate: plan.target_savings_rate,
        total_assets: plan.total_assets,
      });
    }
  }, [plan, editablePlan]);

  // Track changes to editable plan
  const handlePlanChange = (newPlan: PlanData) => {
    setEditablePlan(newPlan);
    if (plan) {
      const hasChanges = (
        newPlan.monthly_income !== plan.monthly_income ||
        newPlan.monthly_expenses !== plan.monthly_expenses ||
        newPlan.monthly_savings !== plan.monthly_savings ||
        newPlan.target_retirement_age !== plan.target_retirement_age ||
        newPlan.target_savings_rate !== plan.target_savings_rate ||
        newPlan.total_assets !== plan.total_assets
      );
      setHasUnsavedChanges(hasChanges);
    }
  };

  // Save changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const saveChanges = async () => {
      if (hasUnsavedChanges && editablePlan) {
        try {
          await supabase
            .from('financial_plans')
            .update({ 
              ...editablePlan, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', planId);
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error('Failed to save changes:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Save when component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (hasUnsavedChanges) {
        saveChanges();
      }
    };
  }, [hasUnsavedChanges, editablePlan, planId]);

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

  // Calculate current age from profile
  const calculateCurrentAge = () => {
    if (!profile?.date_of_birth) return 25; // Default fallback
    
    const today = new Date();
    const birthDate = new Date(profile.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Generate projections with savings contributions factored in
  const generateProjections = (planData: any) => {
    const projections = [];
    const currentYear = new Date().getFullYear();
    const currentAge = calculateCurrentAge();
    const retirementAge = planData.target_retirement_age;
    const deathAge = 95; // Extended to age 95
    const expenseGrowthRate = calculateExpenseGrowthRate();
    
    // Initialize asset balances from current assets - these will track running balances
    const runningAssetBalances = new Map();
    assets.forEach(asset => {
      runningAssetBalances.set(asset.id, Number(asset.value));
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
      
      // Apply expense growth over time
      const baseAnnualExpenses = planData.monthly_expenses * 12;
      let inflatedAnnualExpenses = baseAnnualExpenses * Math.pow(1 + expenseGrowthRate, yearsFromNow);
      
      // Add goal expenses for this year (like travel goals)
      if (goals && goals.length > 0) {
        goals.forEach(goal => {
          if (goal.target_date && !goal.is_recurring && goal.target_amount) {
            const goalDate = new Date(goal.target_date);
            const goalYear = goalDate.getFullYear();
            
            if (goalYear === year) {
              inflatedAnnualExpenses += Number(goal.target_amount);
            }
          }
        });
      }
      
      // Base calculations from plan
      const baseSavings = planData.monthly_savings * 12;
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
      
      // Apply growth to running balances first
      runningAssetBalances.forEach((balance, assetId) => {
        const asset = assets.find(a => a.id === assetId);
        const growthRate = asset?.growth_rate || 0.07;
        const annualContribution = contributionsByDestination.get(assetId) || 0;
        
        // Apply growth for one year
        let newBalance = balance * (1 + growthRate);
        
        // Add contributions if not retired
        if (!isRetired) {
          newBalance += annualContribution;
        }
        
        runningAssetBalances.set(assetId, newBalance);
      });

      // Calculate asset-specific values
      let totalAssetValue = 0;
      runningAssetBalances.forEach((balance) => {
        totalAssetValue += balance;
      });
      
      // Calculate individual account values and contributions for the table
      const accountValues: { [key: string]: number } = {};
      const accountContributions: { [key: string]: number } = {};
      const accountWithdrawals: { [key: string]: number } = {};
      let totalWithdrawals = 0;

      runningAssetBalances.forEach((balance, assetId) => {
        const annualContribution = contributionsByDestination.get(assetId) || 0;
        
        accountValues[assetId] = Math.max(0, balance);
        accountContributions[assetId] = isRetired ? 0 : annualContribution;
        accountWithdrawals[assetId] = 0; // Initialize
      });

      // Calculate withdrawals for goals (like travel goals)
      if (goals && goals.length > 0) {
        goals.forEach(goal => {
          if (goal.withdrawal_account_id && goal.target_date && !goal.is_recurring && goal.target_amount) {
            const goalDate = new Date(goal.target_date);
            const goalYear = goalDate.getFullYear();
            
            if (goalYear === year && goal.withdrawal_account_id) {
              const withdrawAmount = Number(goal.target_amount);
              accountWithdrawals[goal.withdrawal_account_id] = (accountWithdrawals[goal.withdrawal_account_id] || 0) + withdrawAmount;
              totalWithdrawals += withdrawAmount;
              
              // Update running balance
              const currentBalance = runningAssetBalances.get(goal.withdrawal_account_id) || 0;
              runningAssetBalances.set(goal.withdrawal_account_id, Math.max(0, currentBalance - withdrawAmount));
              accountValues[goal.withdrawal_account_id] = Math.max(0, currentBalance - withdrawAmount);
            }
          }
        });
      }

      // Calculate retirement withdrawals based on withdrawal order
      if (isRetired && goals && goals.length > 0) {
        const retirementGoal = goals.find(g => g.goal_type === 'retirement');
        if (retirementGoal && retirementGoal.withdrawal_order) {
          const withdrawalOrder = Array.isArray(retirementGoal.withdrawal_order) 
            ? retirementGoal.withdrawal_order 
            : [];

          let remainingWithdrawal = inflatedAnnualExpenses;
          
          withdrawalOrder.forEach((accountId: string) => {
            if (remainingWithdrawal > 0) {
              const currentBalance = runningAssetBalances.get(accountId) || 0;
              const withdrawAmount = Math.min(remainingWithdrawal, currentBalance);
              
              if (withdrawAmount > 0) {
                accountWithdrawals[accountId] = (accountWithdrawals[accountId] || 0) + withdrawAmount;
                totalWithdrawals += withdrawAmount;
                remainingWithdrawal -= withdrawAmount;
                
                // Update running balance
                const newBalance = Math.max(0, currentBalance - withdrawAmount);
                runningAssetBalances.set(accountId, newBalance);
                accountValues[accountId] = newBalance;
              }
            }
          });
        }
      }
      // Calculate portfolio value from running balances (which already account for withdrawals)
      portfolioValue = 0;
      runningAssetBalances.forEach((balance) => {
        portfolioValue += balance;
      });
      
      const netWorth = portfolioValue;
      const cashFlow = annualIncome - inflatedAnnualExpenses + (isRetired ? 0 : totalAnnualContributions);
      
      projections.push({
        year,
        age,
        net_worth: netWorth,
        portfolio_value: portfolioValue, // Now properly accounts for withdrawals
        annual_expenses: inflatedAnnualExpenses, // Now includes goal expenses
        cash_flow: cashFlow,
        account_values: accountValues,
        total_contributions: isRetired ? 0 : totalAnnualContributions,
        account_contributions: accountContributions,
        total_withdrawals: totalWithdrawals,
        account_withdrawals: accountWithdrawals,
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

  // Auto-save plan mutation (silent, no toast)
  const autoSavePlanMutation = useMutation({
    mutationFn: async (updates: PlanData) => {
      const { data, error } = await supabase
        .from('financial_plans')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', planId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_plans'] });
      queryClient.invalidateQueries({ queryKey: ['financial_plan', planId] });
      // No toast for auto-save to keep it unobtrusive
    },
    onError: (error) => {
      console.error('Auto-save failed:', error);
      // Could show a subtle indicator that auto-save failed
    },
  });

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
      setHasUnsavedChanges(false);
      toast({ title: "Plan saved successfully!" });
    },
  });

  // Manual save function
  const handleSaveChanges = () => {
    if (editablePlan && hasUnsavedChanges) {
      savePlanMutation.mutate(editablePlan);
    }
  };

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
          is_main_plan: false, // Copies should not be main plans by default
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

  // Update plan name mutation
  const updatePlanNameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const { data, error } = await supabase
        .from('financial_plans')
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq('id', planId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_plans'] });
      queryClient.invalidateQueries({ queryKey: ['financial_plan', planId] });
      setIsEditingName(false);
      toast({ title: "Plan name updated successfully!" });
    },
  });

  // Toggle main plan mutation
  const toggleMainPlanMutation = useMutation({
    mutationFn: async (isMainPlan: boolean) => {
      if (isMainPlan) {
        // First, set all other plans as not main
        await supabase
          .from('financial_plans')
          .update({ is_main_plan: false })
          .eq('user_id', user?.id);
      }
      
      // Then set this plan as main or not main
      const { data, error } = await supabase
        .from('financial_plans')
        .update({ is_main_plan: isMainPlan, updated_at: new Date().toISOString() })
        .eq('id', planId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_plans'] });
      queryClient.invalidateQueries({ queryKey: ['financial_plan', planId] });
      toast({ title: `Plan ${plan?.is_main_plan ? 'removed as' : 'set as'} main plan!` });
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('financial_plans')
        .delete()
        .eq('id', planId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_plans'] });
      toast({ title: "Plan deleted successfully!" });
      onBack(); // Navigate back to plans list
    },
    onError: (error) => {
      toast({ 
        title: "Error deleting plan", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleNameEdit = () => {
    setEditedName(plan?.name || '');
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    if (editedName.trim() && editedName !== plan?.name) {
      updatePlanNameMutation.mutate(editedName.trim());
    } else {
      setIsEditingName(false);
    }
  };

  const handleNameCancel = () => {
    setEditedName('');
    setIsEditingName(false);
  };

  const resetToCurrentSituation = () => {
    setEditablePlan(currentSituation);
    setHasUnsavedChanges(true);
  };

  const getProbabilityBadge = (probability: number) => {
    if (probability >= 80) {
      return <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">{probability}% 📈</Badge>;
    } else if (probability >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800 text-lg px-3 py-1">{probability}% ⚠️</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 text-lg px-3 py-1">{probability}% 📉</Badge>;
    }
  };

  if (isLoading || !plan || !editablePlan) {
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
          <div className="flex items-center space-x-3">
            <div>
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-2xl font-bold h-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameSave();
                      if (e.key === 'Escape') handleNameCancel();
                    }}
                  />
                  <Button size="sm" onClick={handleNameSave} disabled={updatePlanNameMutation.isPending}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleNameCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h2>
                  <Button size="sm" variant="ghost" onClick={handleNameEdit}>
                    <Pen className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{plan.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deletePlanMutation.mutate()}
                          disabled={deletePlanMutation.isPending}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deletePlanMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
              <div className="flex items-center space-x-3 mt-1">
                <Badge variant={plan.status === 'on_track' ? "default" : "destructive"}>
                  {plan.status === 'on_track' ? "On Track" : "Needs Attention"}
                </Badge>
                {plan.is_main_plan && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Main Plan
                  </Badge>
                )}
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Unsaved Changes
                  </Badge>
                )}
                {savePlanMutation.isPending && (
                  <Badge variant="outline" className="text-gray-500">
                    Saving...
                  </Badge>
                )}
              </div>
            </div>
          </div>
        
          <div className="flex items-center space-x-3">
            {hasUnsavedChanges && (
              <Button 
                onClick={handleSaveChanges}
                disabled={savePlanMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Set as Main Plan</span>
              <Switch
                checked={plan.is_main_plan || false}
                onCheckedChange={(checked) => toggleMainPlanMutation.mutate(checked)}
                disabled={toggleMainPlanMutation.isPending}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plan Comparison Split View */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Plan Builder: Compare Current vs. {plan?.name || 'Your Plan'}
        </h3>
        
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
                  {plan?.name || 'Your Plan'}
                </CardTitle>
                <div title="Success means your plan's assets are likely to last through retirement in most market scenarios.">
                  {getProbabilityBadge(editablePoS)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EditablePlanColumn 
                planData={editablePlan} 
                onPlanChange={handlePlanChange}
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
              Portfolio Value: Current Situation vs {plan?.name || 'Your Plan'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ComparisonChart 
              currentPlan={currentSituation}
              editablePlan={editablePlan}
              planName={plan?.name}
            />
          </CardContent>
        </Card>
      </div>

      {/* Projection Table */}
      <ProjectionTable data={projections} planName={plan.name} assets={assets} />
    </div>
  );
};

export default DecisionCenter;
