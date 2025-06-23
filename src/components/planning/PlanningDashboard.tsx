
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, DollarSign, PieChart, Target } from 'lucide-react';

const PlanningDashboard = () => {
  const { data: assets } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('assets').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: liabilities } = useQuery({
    queryKey: ['liabilities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('liabilities').select('*');
      if (error) throw error;
      return data;
    },
  });

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

  // Calculate metrics
  const totalAssets = assets?.reduce((sum, asset) => sum + Number(asset.value), 0) || 0;
  const totalLiabilities = liabilities?.reduce((sum, liability) => sum + Number(liability.balance), 0) || 0;
  const netWorth = totalAssets - totalLiabilities;
  
  const monthlyIncome = income?.reduce((sum, inc) => {
    const amount = Number(inc.amount);
    if (inc.frequency === 'annual') return sum + (amount / 12);
    if (inc.frequency === 'weekly') return sum + (amount * 4.33);
    return sum + amount; // monthly
  }, 0) || 0;

  const monthlyExpenses = expenses?.reduce((sum, exp) => {
    const amount = Number(exp.amount);
    if (exp.frequency === 'annual') return sum + (amount / 12);
    if (exp.frequency === 'weekly') return sum + (amount * 4.33);
    return sum + amount; // monthly
  }, 0) || 0;

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const metrics = [
    {
      title: 'Net Worth',
      value: formatCurrency(netWorth),
      icon: TrendingUp,
      color: netWorth >= 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      title: 'Monthly Cash Flow',
      value: formatCurrency(monthlyCashFlow),
      icon: DollarSign,
      color: monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      title: 'Total Assets',
      value: formatCurrency(totalAssets),
      icon: PieChart,
      color: 'text-blue-600',
    },
    {
      title: 'Financial Score',
      value: `${getFinancialScore()}/100`,
      icon: Target,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Financial Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.title} className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
              </div>
              <metric.icon className={`h-8 w-8 ${metric.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
          {assets && assets.length > 0 ? (
            <div className="space-y-3">
              {assets.map((asset) => (
                <div key={asset.id} className="flex justify-between items-center">
                  <span className="text-gray-700">{asset.name}</span>
                  <span className="font-semibold">{formatCurrency(Number(asset.value))}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No assets recorded yet. Add your first asset in the Facts section.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Monthly Cash Flow</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Income</span>
              <span className="font-semibold text-green-600">{formatCurrency(monthlyIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Expenses</span>
              <span className="font-semibold text-red-600">{formatCurrency(monthlyExpenses)}</span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Net Cash Flow</span>
              <span className={`font-bold ${monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(monthlyCashFlow)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningDashboard;
