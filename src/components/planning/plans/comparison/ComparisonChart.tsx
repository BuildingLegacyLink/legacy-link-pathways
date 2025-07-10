import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Scatter, ScatterChart, ReferenceDot } from 'recharts';
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
  const queryClient = useQueryClient();
  const [selectedAccount, setSelectedAccount] = useState<string>('total');

  // Set up real-time subscriptions to invalidate queries when facts change
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('facts-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Invalidate relevant queries when goals change (including withdrawal order)
          queryClient.invalidateQueries({ queryKey: ['goals', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assets',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Invalidate assets queries when assets change
          queryClient.invalidateQueries({ queryKey: ['assets', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'savings',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Invalidate savings queries when savings allocations change
          queryClient.invalidateQueries({ queryKey: ['savings', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Invalidate expenses queries when expenses change
          queryClient.invalidateQueries({ queryKey: ['expenses', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Fetch user profile to get date of birth
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch goals for timeline indicators
  const { data: goals } = useQuery({
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

  // Fetch all goals to get withdrawal orders
  const { data: allGoals } = useQuery({
    queryKey: ['goals', user?.id, 'all'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);
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

  // Fetch savings allocations to see how monthly savings are distributed
  const { data: savings } = useQuery({
    queryKey: ['savings', user?.id],
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

  // Calculate individual expense projections with their own growth rates
  const calculateIndividualExpenses = (yearsFromStart: number) => {
    if (!expenses || expenses.length === 0) return [];
    
    return expenses.map(expense => {
      const amount = Number(expense.amount);
      const growthRate = (expense.growth_rate != null ? Number(expense.growth_rate) : 3.0) / 100;
      
      // Convert to annual amount
      let annualAmount = amount;
      if (expense.frequency === 'monthly') annualAmount = amount * 12;
      if (expense.frequency === 'weekly') annualAmount = amount * 52;
      if (expense.frequency === 'quarterly') annualAmount = amount * 4;
      
      // Apply individual growth rate
      const inflatedAmount = annualAmount * Math.pow(1 + growthRate, yearsFromStart);
      
      return {
        ...expense,
        inflatedAnnualAmount: inflatedAmount
      };
    });
  };

  // Get withdrawal order from retirement goal
  const getWithdrawalOrder = () => {
    if (!retirementGoal?.withdrawal_order || !Array.isArray(retirementGoal.withdrawal_order)) {
      return [];
    }
    return retirementGoal.withdrawal_order as string[];
  };

  // Track accumulated withdrawals by account for proper order enforcement
  const accountWithdrawals = new Map<string, number>();

  // Calculate total withdrawals needed per year for each account following withdrawal order
  const calculateYearlyWithdrawals = (totalAnnualExpenses: number, availableAccounts: { id: string; value: number }[]) => {
    const withdrawalOrder = getWithdrawalOrder();
    const yearlyWithdrawals = new Map<string, number>();
    
    if (withdrawalOrder.length === 0) {
      // If no withdrawal order specified, distribute proportionally
      const totalValue = availableAccounts.reduce((sum, acc) => sum + acc.value, 0);
      if (totalValue > 0) {
        availableAccounts.forEach(account => {
          yearlyWithdrawals.set(account.id, totalAnnualExpenses * (account.value / totalValue));
        });
      }
      return yearlyWithdrawals;
    }

    // Apply withdrawal order - withdraw from accounts sequentially according to priority
    let remainingExpenses = totalAnnualExpenses;
    
    for (const accountId of withdrawalOrder) {
      if (remainingExpenses <= 0) break;
      
      const account = availableAccounts.find(acc => acc.id === accountId);
      if (!account || account.value <= 0) continue;
      
      const withdrawal = Math.min(remainingExpenses, account.value);
      yearlyWithdrawals.set(accountId, withdrawal);
      remainingExpenses -= withdrawal;
    }
    
    return yearlyWithdrawals;
  };

  // Calculate monthly contributions allocated to a specific asset
  const getMonthlyContributionToAsset = (assetId: string, totalMonthlySavings: number) => {
    if (!savings || savings.length === 0) {
      // If no savings allocations defined, distribute proportionally based on current asset values
      if (!assets || assets.length === 0) return 0;
      const asset = assets.find(a => a.id === assetId);
      if (!asset) return 0;
      
      const totalAssetValue = assets.reduce((sum, a) => sum + Number(a.value), 0);
      if (totalAssetValue === 0) return totalMonthlySavings / assets.length; // Equal distribution if no assets
      
      return totalMonthlySavings * (Number(asset.value) / totalAssetValue);
    }
    
    // Find savings allocations for this asset
    const assetSavings = savings.filter(s => s.destination_asset_id === assetId);
    return assetSavings.reduce((sum, s) => {
      let monthlyAmount = Number(s.amount);
      if (s.frequency === 'annual') monthlyAmount = monthlyAmount / 12;
      if (s.frequency === 'weekly') monthlyAmount = monthlyAmount * 4.33;
      if (s.frequency === 'quarterly') monthlyAmount = monthlyAmount / 3;
      return sum + monthlyAmount;
    }, 0);
  };

  // Projection function using monthly future value calculations
  const generateProjections = (plan: PlanData, planType: 'current' | 'editable') => {
    const projections = [];
    const currentAge = calculateCurrentAge();
    
    // Use correct retirement age source for each plan type
    const retirementAge = planType === 'current' 
      ? (retirementGoal?.retirement_age || 67)  // Current situation uses goal from facts
      : plan.target_retirement_age;             // Editable plan uses its own target
    
    const deathAge = 100;
    
    if (selectedAccount !== 'total' && assets) {
      // Individual account calculation requires tracking ALL accounts to follow withdrawal order properly
      const selectedAsset = assets.find(asset => asset.id === selectedAccount);
      if (selectedAsset) {
        // Initialize all account balances for simulation
        const accountBalances = new Map<string, number[]>(); // Array to track balance at each age
        
        // Calculate future values for ALL accounts first (without withdrawals)
        assets.forEach(asset => {
          const startingValue = Number(asset.value);
          const annualGrowthRate = Number(asset.growth_rate) || 0.07;
          const monthlyGrowthRate = annualGrowthRate / 12;
          const monthlyContribution = getMonthlyContributionToAsset(asset.id, plan.monthly_savings);
          
          const balances: number[] = [];
          
          for (let age = currentAge; age <= deathAge; age++) {
            const isRetired = age > retirementAge;
            const monthsFromStart = (age - currentAge) * 12;
            
            let assetValue = startingValue;
            
            if (!isRetired && monthsFromStart > 0) {
              // Pre-retirement: Future value with monthly contributions
              const growthFactor = Math.pow(1 + monthlyGrowthRate, monthsFromStart);
              const presentValueGrowth = startingValue * growthFactor;
              
              let contributionGrowth = 0;
              if (monthlyContribution > 0 && monthlyGrowthRate > 0) {
                contributionGrowth = monthlyContribution * ((growthFactor - 1) / monthlyGrowthRate);
              } else if (monthlyContribution > 0) {
                contributionGrowth = monthlyContribution * monthsFromStart;
              }
              
              assetValue = presentValueGrowth + contributionGrowth;
            } else if (isRetired) {
              // At retirement, calculate the accumulated value
              const monthsToRetirement = (retirementAge - currentAge) * 12;
              
              if (monthsToRetirement > 0) {
                const growthFactorToRetirement = Math.pow(1 + monthlyGrowthRate, monthsToRetirement);
                const presentValueGrowthToRetirement = startingValue * growthFactorToRetirement;
                
                let contributionGrowthToRetirement = 0;
                if (monthlyContribution > 0 && monthlyGrowthRate > 0) {
                  contributionGrowthToRetirement = monthlyContribution * ((growthFactorToRetirement - 1) / monthlyGrowthRate);
                } else if (monthlyContribution > 0) {
                  contributionGrowthToRetirement = monthlyContribution * monthsToRetirement;
                }
                
                assetValue = presentValueGrowthToRetirement + contributionGrowthToRetirement;
              }
              
              // Then apply post-retirement growth (will be adjusted for withdrawals below)
              const monthsInRetirement = (age - retirementAge) * 12;
              if (monthsInRetirement > 0) {
                assetValue *= Math.pow(1 + monthlyGrowthRate, monthsInRetirement);
              }
            }
            
            balances.push(Math.max(0, assetValue));
          }
          
          accountBalances.set(asset.id, balances);
        });
        
        // Now simulate year-by-year withdrawals during retirement following the proper order
        for (let age = retirementAge + 1; age <= deathAge; age++) {
          const ageIndex = age - currentAge;
          const yearsFromStart = age - currentAge;
          
          // Calculate expenses for this year
          const individualExpenses = calculateIndividualExpenses(yearsFromStart);
          const totalAnnualExpenses = individualExpenses.reduce((sum, exp) => sum + exp.inflatedAnnualAmount, 0);
          
          // Get current account balances at this age (before withdrawals)
          const currentBalances = new Map<string, number>();
          assets.forEach(asset => {
            const balances = accountBalances.get(asset.id) || [];
            currentBalances.set(asset.id, Math.max(0, balances[ageIndex] || 0));
          });
          
          // Apply withdrawals following the withdrawal order
          const withdrawalOrder = getWithdrawalOrder();
          let remainingExpenses = totalAnnualExpenses;
          
          if (withdrawalOrder.length > 0) {
            // Follow the specified withdrawal order
            for (const accountId of withdrawalOrder) {
              if (remainingExpenses <= 0) break;
              
              const currentBalance = currentBalances.get(accountId) || 0;
              if (currentBalance > 0) {
                const withdrawal = Math.min(remainingExpenses, currentBalance);
                currentBalances.set(accountId, currentBalance - withdrawal);
                remainingExpenses -= withdrawal;
              }
            }
          } else {
            // If no order specified, withdraw proportionally
            const totalValue = Array.from(currentBalances.values()).reduce((sum, val) => sum + val, 0);
            if (totalValue > 0) {
              currentBalances.forEach((balance, accountId) => {
                if (balance > 0) {
                  const proportionalWithdrawal = totalAnnualExpenses * (balance / totalValue);
                  const actualWithdrawal = Math.min(proportionalWithdrawal, balance);
                  currentBalances.set(accountId, balance - actualWithdrawal);
                }
              });
            }
          }
          
          // Update the account balances for this age and all subsequent ages
          currentBalances.forEach((newBalance, accountId) => {
            const balances = accountBalances.get(accountId) || [];
            
            // Update this age and apply growth to future ages
            for (let futureAge = age; futureAge <= deathAge; futureAge++) {
              const futureAgeIndex = futureAge - currentAge;
              if (futureAgeIndex < balances.length) {
                if (futureAge === age) {
                  // This is the year we're calculating - set the post-withdrawal balance
                  balances[futureAgeIndex] = newBalance;
                } else {
                  // Future years - apply growth from the withdrawal year balance
                  const asset = assets.find(a => a.id === accountId);
                  if (asset) {
                    const annualGrowthRate = Number(asset.growth_rate) || 0.07;
                    const monthlyGrowthRate = annualGrowthRate / 12;
                    const yearsOfGrowth = futureAge - age;
                    const monthsOfGrowth = yearsOfGrowth * 12;
                    balances[futureAgeIndex] = newBalance * Math.pow(1 + monthlyGrowthRate, monthsOfGrowth);
                  }
                }
              }
            }
            
            accountBalances.set(accountId, balances);
          });
        }
        
        // Apply goal-specific withdrawals (e.g., travel goals from savings accounts)
        if (allGoals && allGoals.length > 0) {
          allGoals.forEach(goal => {
            if (goal.withdrawal_account_id && goal.target_date && !goal.is_recurring) {
              const goalDate = new Date(goal.target_date);
              const currentDate = new Date();
              const birthDate = new Date(profile?.date_of_birth || '1995-01-01');
              
              // Calculate precise age at goal date
              let goalAge = goalDate.getFullYear() - birthDate.getFullYear();
              const monthDiff = goalDate.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && goalDate.getDate() < birthDate.getDate())) {
                goalAge--;
              }
              
              if (goalAge >= currentAge && goalAge <= deathAge) {
                const goalAgeIndex = goalAge - currentAge;
                const targetAccountBalances = accountBalances.get(goal.withdrawal_account_id);
                
                if (targetAccountBalances && targetAccountBalances[goalAgeIndex] > 0) {
                  const goalAmount = Number(goal.target_amount) || 0;
                  const currentBalance = targetAccountBalances[goalAgeIndex];
                  const withdrawalAmount = Math.min(goalAmount, currentBalance);
                  
                  // Subtract the withdrawal from this age forward
                  for (let futureAge = goalAge; futureAge <= deathAge; futureAge++) {
                    const futureAgeIndex = futureAge - currentAge;
                    if (futureAgeIndex < targetAccountBalances.length) {
                      if (futureAge === goalAge) {
                        // Year of withdrawal - subtract the amount
                        targetAccountBalances[futureAgeIndex] = Math.max(0, targetAccountBalances[futureAgeIndex] - withdrawalAmount);
                      } else {
                        // Future years - recalculate growth from the reduced balance
                        const asset = assets?.find(a => a.id === goal.withdrawal_account_id);
                        if (asset) {
                          const annualGrowthRate = Number(asset.growth_rate) || 0.07;
                          const monthlyGrowthRate = annualGrowthRate / 12;
                          const yearsOfGrowth = futureAge - goalAge;
                          const monthsOfGrowth = yearsOfGrowth * 12;
                          const baseBalance = targetAccountBalances[goalAge - currentAge];
                          targetAccountBalances[futureAgeIndex] = baseBalance * Math.pow(1 + monthlyGrowthRate, monthsOfGrowth);
                        }
                      }
                    }
                  }
                  
                  accountBalances.set(goal.withdrawal_account_id, targetAccountBalances);
                }
              }
            }
          });
        }
        
        // Get the final balances for the selected account
        const selectedAccountBalances = accountBalances.get(selectedAccount) || [];
        
        for (let age = currentAge; age <= deathAge; age++) {
          const year = new Date().getFullYear() + (age - currentAge);
          const ageIndex = age - currentAge;
          const accountValue = selectedAccountBalances[ageIndex] || 0;
          
          projections.push({
            age,
            year,
            [`${planType}Value`]: Math.round(accountValue),
          });
        }
      }
    } else {
      // Total portfolio calculation - use the same comprehensive withdrawal simulation as individual accounts
      
      // Initialize all account balances for simulation
      const accountBalances = new Map<string, number[]>(); // Array to track balance at each age
      
      if (assets && assets.length > 0) {
        // Calculate future values for ALL accounts first (without withdrawals)
        assets.forEach(asset => {
          const startingValue = Number(asset.value);
          const annualGrowthRate = Number(asset.growth_rate) || 0.07;
          const monthlyGrowthRate = annualGrowthRate / 12;
          const monthlyContribution = getMonthlyContributionToAsset(asset.id, plan.monthly_savings);
          
          const balances: number[] = [];
          
          for (let age = currentAge; age <= deathAge; age++) {
            const isRetired = age > retirementAge;
            const monthsFromStart = (age - currentAge) * 12;
            
            let assetValue = startingValue;
            
            if (!isRetired && monthsFromStart > 0) {
              // Pre-retirement: Future value with monthly contributions
              const growthFactor = Math.pow(1 + monthlyGrowthRate, monthsFromStart);
              const presentValueGrowth = startingValue * growthFactor;
              
              let contributionGrowth = 0;
              if (monthlyContribution > 0 && monthlyGrowthRate > 0) {
                contributionGrowth = monthlyContribution * ((growthFactor - 1) / monthlyGrowthRate);
              } else if (monthlyContribution > 0) {
                contributionGrowth = monthlyContribution * monthsFromStart;
              }
              
              assetValue = presentValueGrowth + contributionGrowth;
            } else if (isRetired) {
              // At retirement, calculate the accumulated value
              const monthsToRetirement = (retirementAge - currentAge) * 12;
              
              if (monthsToRetirement > 0) {
                const growthFactorToRetirement = Math.pow(1 + monthlyGrowthRate, monthsToRetirement);
                const presentValueGrowthToRetirement = startingValue * growthFactorToRetirement;
                
                let contributionGrowthToRetirement = 0;
                if (monthlyContribution > 0 && monthlyGrowthRate > 0) {
                  contributionGrowthToRetirement = monthlyContribution * ((growthFactorToRetirement - 1) / monthlyGrowthRate);
                } else if (monthlyContribution > 0) {
                  contributionGrowthToRetirement = monthlyContribution * monthsToRetirement;
                }
                
                assetValue = presentValueGrowthToRetirement + contributionGrowthToRetirement;
              }
              
              // Then apply post-retirement growth (will be adjusted for withdrawals below)
              const monthsInRetirement = (age - retirementAge) * 12;
              if (monthsInRetirement > 0) {
                assetValue *= Math.pow(1 + monthlyGrowthRate, monthsInRetirement);
              }
            }
            
            balances.push(Math.max(0, assetValue));
          }
          
          accountBalances.set(asset.id, balances);
        });
        
        // Now simulate year-by-year withdrawals during retirement following the proper order
        for (let age = retirementAge + 1; age <= deathAge; age++) {
          const ageIndex = age - currentAge;
          const yearsFromStart = age - currentAge;
          
          // Calculate expenses for this year
          const individualExpenses = calculateIndividualExpenses(yearsFromStart);
          const totalAnnualExpenses = individualExpenses.reduce((sum, exp) => sum + exp.inflatedAnnualAmount, 0);
          
          // Get current account balances at this age (before withdrawals)
          const currentBalances = new Map<string, number>();
          assets.forEach(asset => {
            const balances = accountBalances.get(asset.id) || [];
            currentBalances.set(asset.id, Math.max(0, balances[ageIndex] || 0));
          });
          
          // Apply withdrawals following the withdrawal order
          const withdrawalOrder = getWithdrawalOrder();
          let remainingExpenses = totalAnnualExpenses;
          
          if (withdrawalOrder.length > 0) {
            // Follow the specified withdrawal order
            for (const accountId of withdrawalOrder) {
              if (remainingExpenses <= 0) break;
              
              const currentBalance = currentBalances.get(accountId) || 0;
              if (currentBalance > 0) {
                const withdrawal = Math.min(remainingExpenses, currentBalance);
                currentBalances.set(accountId, currentBalance - withdrawal);
                remainingExpenses -= withdrawal;
              }
            }
          }
          
          // Update the account balances array with post-withdrawal amounts
          assets.forEach(asset => {
            const balances = accountBalances.get(asset.id) || [];
            const newBalance = currentBalances.get(asset.id) || 0;
            
            // Update this age and all future ages with the new balance as starting point
            for (let futureAge = age; futureAge <= deathAge; futureAge++) {
              const futureAgeIndex = futureAge - currentAge;
              const monthsFromWithdrawal = (futureAge - age) * 12;
              
              if (futureAgeIndex < balances.length) {
                const annualGrowthRate = Number(asset.growth_rate) || 0.07;
                const monthlyGrowthRate = annualGrowthRate / 12;
                
                // Apply growth from the withdrawal point forward
                const grownBalance = monthsFromWithdrawal > 0 
                  ? newBalance * Math.pow(1 + monthlyGrowthRate, monthsFromWithdrawal)
                  : newBalance;
                
                balances[futureAgeIndex] = Math.max(0, grownBalance);
              }
            }
          });
        }
        
        // Apply goal-specific withdrawals (e.g., travel goals from savings accounts)
        if (allGoals && allGoals.length > 0) {
          allGoals.forEach(goal => {
            if (goal.withdrawal_account_id && goal.target_date && !goal.is_recurring) {
              const goalDate = new Date(goal.target_date);
              const currentDate = new Date();
              const birthDate = new Date(profile?.date_of_birth || '1995-01-01');
              
              // Calculate precise age at goal date
              let goalAge = goalDate.getFullYear() - birthDate.getFullYear();
              const monthDiff = goalDate.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && goalDate.getDate() < birthDate.getDate())) {
                goalAge--;
              }
              
              if (goalAge >= currentAge && goalAge <= deathAge) {
                const goalAgeIndex = goalAge - currentAge;
                const targetAccountBalances = accountBalances.get(goal.withdrawal_account_id);
                
                if (targetAccountBalances && targetAccountBalances[goalAgeIndex] > 0) {
                  const goalAmount = Number(goal.target_amount) || 0;
                  const currentBalance = targetAccountBalances[goalAgeIndex];
                  const withdrawalAmount = Math.min(goalAmount, currentBalance);
                  
                  // Subtract the withdrawal from this age forward
                  for (let futureAge = goalAge; futureAge <= deathAge; futureAge++) {
                    const futureAgeIndex = futureAge - currentAge;
                    if (futureAgeIndex < targetAccountBalances.length) {
                      if (futureAge === goalAge) {
                        // Year of withdrawal - subtract the amount
                        targetAccountBalances[futureAgeIndex] = Math.max(0, targetAccountBalances[futureAgeIndex] - withdrawalAmount);
                      } else {
                        // Future years - recalculate growth from the reduced balance
                        const asset = assets?.find(a => a.id === goal.withdrawal_account_id);
                        if (asset) {
                          const annualGrowthRate = Number(asset.growth_rate) || 0.07;
                          const monthlyGrowthRate = annualGrowthRate / 12;
                          const yearsOfGrowth = futureAge - goalAge;
                          const monthsOfGrowth = yearsOfGrowth * 12;
                          const baseBalance = targetAccountBalances[goalAge - currentAge];
                          targetAccountBalances[futureAgeIndex] = baseBalance * Math.pow(1 + monthlyGrowthRate, monthsOfGrowth);
                        }
                      }
                    }
                  }
                  
                  accountBalances.set(goal.withdrawal_account_id, targetAccountBalances);
                }
              }
            }
          });
        }
      }
      
      // Generate projections using the final calculated balances
      for (let age = currentAge; age <= deathAge; age++) {
        const year = new Date().getFullYear() + (age - currentAge);
        const ageIndex = age - currentAge;
        
        // Sum all account balances at this age
        let totalPortfolioValue = 0;
        if (assets && assets.length > 0) {
          assets.forEach(asset => {
            const balances = accountBalances.get(asset.id) || [];
            const balance = balances[ageIndex] || 0;
            totalPortfolioValue += Math.max(0, balance);
          });
        }
        
        projections.push({
          age,
          year,
          [`${planType}Value`]: Math.round(totalPortfolioValue),
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

  // Calculate when goals occur based on their timing
  const calculateGoalAges = () => {
    if (!goals || !profile) return [];
    
    const getCurrentAge = () => {
      if (!profile?.date_of_birth) return 25; // fallback
      const birthDate = new Date(profile.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };
    
    const currentAge = getCurrentAge();
    const currentYear = new Date().getFullYear();
    const retirementAge = profile.retirement_age || 67;
    const deathAge = profile.projected_death_age || 85;
    
    return goals.map(goal => {
      let goalAge = null;
      
      if (goal.target_date) {
        // Traditional date-based goal - calculate age from target date
        const targetDate = new Date(goal.target_date);
        const targetYear = targetDate.getFullYear();
        const birthDate = new Date(profile.date_of_birth);
        goalAge = targetYear - birthDate.getFullYear();
        
        // Adjust for birth month/day
        const targetMonth = targetDate.getMonth();
        const targetDay = targetDate.getDate();
        const birthMonth = birthDate.getMonth();
        const birthDay = birthDate.getDate();
        
        if (targetMonth < birthMonth || (targetMonth === birthMonth && targetDay < birthDay)) {
          goalAge--;
        }
      } else if (goal.retirement_age) {
        // Retirement goal
        goalAge = goal.retirement_age;
      } else if (goal.start_timing_type && goal.start_timing_value) {
        // New timing system
        switch (goal.start_timing_type) {
          case 'calendar_year':
            const birthYear = new Date(profile.date_of_birth).getFullYear();
            goalAge = goal.start_timing_value - birthYear;
            break;
          case 'age':
            goalAge = goal.start_timing_value;
            break;
          case 'retirement':
            goalAge = retirementAge;
            break;
          case 'death':
            goalAge = deathAge;
            break;
        }
      }
      
      return {
        ...goal,
        goalAge,
        color: getGoalColor(goal.goal_type)
      };
    }).filter(goal => goal.goalAge && goal.goalAge >= currentAge && goal.goalAge <= 100);
  };

  const getGoalColor = (goalType: string) => {
    const colors = {
      retirement: '#10b981',
      travel: '#3b82f6', 
      wedding: '#ec4899',
      home: '#f59e0b',
      education: '#8b5cf6',
      celebration: '#eab308',
      heirs: '#6366f1',
      custom: '#6b7280'
    };
    return colors[goalType as keyof typeof colors] || colors.custom;
  };

  const goalMarkers = calculateGoalAges();

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
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="age" 
              className="text-gray-600 dark:text-gray-400"
              interval="preserveStartEnd"
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Age', 
                position: 'insideBottom', 
                offset: -10,
                style: { textAnchor: 'middle' }
              }}
            />
            <YAxis 
              className="text-gray-600 dark:text-gray-400"
              tickFormatter={formatCurrency}
              tick={{ fontSize: 11 }}
              width={50}
              label={{ 
                value: selectedAccount === 'total' ? 'Portfolio Value' : `${getSelectedAccountName()} Value`, 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length && label) {
                  const age = Number(label);
                  const matchingGoals = goalMarkers.filter(g => g.goalAge === age);
                  
                  return (
                    <div className="bg-black bg-opacity-90 text-white p-3 rounded-lg shadow-lg">
                      <div className="text-sm font-medium mb-2">Age {age}</div>
                      {payload.map((entry: any, index: number) => (
                        <div key={index} className="text-sm mb-1">
                          <span style={{ color: entry.color }}>{entry.name}: </span>
                          {formatCurrency(entry.value)}
                        </div>
                      ))}
                      {matchingGoals.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-600">
                          <div className="text-xs text-gray-300 mb-1">Goals:</div>
                          {matchingGoals.map(goal => (
                            <div key={goal.id} className="flex items-center gap-2 text-sm">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: goal.color }}
                              />
                              <span>{goal.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
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
            {/* Current situation line with retirement goal markers */}
            <Line 
              type="monotone" 
              dataKey="currentValue" 
              stroke="#9ca3af" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (!payload) return null;
                
                // Only show retirement goal on current situation line at current retirement age
                const currentRetirementAge = retirementGoal?.retirement_age || 67;
                if (payload.age === currentRetirementAge) {
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={8} 
                      fill="#10b981" 
                      stroke="#fff" 
                      strokeWidth={3}
                      style={{ cursor: 'pointer' }}
                    />
                  );
                }
                return null;
              }}
              name="Current Situation"
            />
            
            {/* New plan line with goal markers (excluding current retirement) */}
            <Line 
              type="monotone" 
              dataKey="editableValue" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (!payload || !goalMarkers) return null;
                
                const currentRetirementAge = retirementGoal?.retirement_age || 67;
                
                // Check if this age has any goals (excluding current retirement goal)
                const goalsAtThisAge = goalMarkers.filter(goal => 
                  goal.goalAge === payload.age && 
                  !(goal.goal_type === 'retirement' && goal.goalAge === currentRetirementAge)
                );
                
                // Show new plan retirement goal at new retirement age
                if (payload.age === editablePlan.target_retirement_age) {
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={8} 
                      fill="#3b82f6" 
                      stroke="#fff" 
                      strokeWidth={3}
                      style={{ cursor: 'pointer' }}
                    />
                  );
                }
                
                if (goalsAtThisAge.length === 0) {
                  return <circle cx={cx} cy={cy} r={4} fill="#3b82f6" stroke="#fff" strokeWidth={2} />;
                }
                
                // Render goal marker
                const goal = goalsAtThisAge[0]; // Use first goal if multiple
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={8} 
                    fill={goal.color} 
                    stroke="#fff" 
                    strokeWidth={3}
                    style={{ cursor: 'pointer' }}
                  />
                );
              }}
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
