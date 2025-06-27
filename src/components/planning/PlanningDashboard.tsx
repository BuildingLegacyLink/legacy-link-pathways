
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import TopSnapshotCards from './dashboard/TopSnapshotCards';
import GoalsOverview from './dashboard/GoalsOverview';
import NetWorthBreakdown from './dashboard/NetWorthBreakdown';
import CashFlowDetails from './dashboard/CashFlowDetails';
import InvestmentOverview from './dashboard/InvestmentOverview';
import AssetAllocation from './dashboard/AssetAllocation';
import SmartMoneyMoves from './dashboard/SmartMoneyMoves';

const PlanningDashboard = () => {
  const { user } = useAuth();

  const { data: assets = [] } = useQuery({
    queryKey: ['assets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('assets').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: liabilities = [] } = useQuery({
    queryKey: ['liabilities', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('liabilities').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: income = [] } = useQuery({
    queryKey: ['income', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('income').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('expenses').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Calculate metrics
  const totalAssets = assets.reduce((sum, asset) => sum + Number(asset.value), 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + Number(liability.balance), 0);
  const netWorth = totalAssets - totalLiabilities;
  
  // Filter to only current income for monthly cash flow calculation
  const currentIncome = income.filter(inc => inc.is_current);
  
  const monthlyIncome = currentIncome.reduce((sum, inc) => {
    const amount = Number(inc.amount);
    if (inc.frequency === 'annual') return sum + (amount / 12);
    if (inc.frequency === 'weekly') return sum + (amount * 4.33);
    return sum + amount; // monthly
  }, 0);

  const monthlyExpenses = expenses.reduce((sum, exp) => {
    const amount = Number(exp.amount);
    if (exp.frequency === 'annual') return sum + (amount / 12);
    if (exp.frequency === 'weekly') return sum + (amount * 4.33);
    return sum + amount; // monthly
  }, 0);

  const monthlyCashFlow = monthlyIncome - monthlyExpenses;

  // Calculate financial readiness score (simplified)
  const getFinancialScore = () => {
    let score = 0;
    if (netWorth > 0) score += 25;
    if (monthlyCashFlow > 0) score += 25;
    if (totalAssets > monthlyExpenses * 6) score += 25; // Emergency fund
    if (assets && assets.length > 2) score += 25; // Diversification
    return score;
  };

  const financialScore = getFinancialScore();

  return (
    <div className="space-y-8">
      {/* Top Snapshot Cards */}
      <TopSnapshotCards 
        netWorth={netWorth}
        monthlyCashFlow={monthlyCashFlow}
        financialScore={financialScore}
      />

      {/* Goals Section */}
      <GoalsOverview />

      {/* Financial Overview Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📑 Financial Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NetWorthBreakdown assets={assets} totalAssets={totalAssets} liabilities={liabilities} />
          <CashFlowDetails 
            monthlyIncome={monthlyIncome}
            monthlyExpenses={monthlyExpenses}
            monthlyCashFlow={monthlyCashFlow}
            expenses={expenses}
          />
        </div>
      </div>

      {/* Investments + Asset Allocation Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">💼 Investments + Asset Allocation</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InvestmentOverview totalAssets={totalAssets} />
          <AssetAllocation assets={assets} totalAssets={totalAssets} />
        </div>
      </div>

      {/* Smart Money Moves */}
      <SmartMoneyMoves />
    </div>
  );
};

export default PlanningDashboard;
