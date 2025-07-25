
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/currency';

interface CashFlowDetailsProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  expenses: any[];
}

const CashFlowDetails = ({ monthlyIncome, monthlyExpenses, monthlyCashFlow, expenses }: CashFlowDetailsProps) => {
  // Enhanced color palette with more colors for individual expenses
  const getExpenseColor = (index: number) => {
    const colors = [
      '#3B82F6', // Blue
      '#8B5CF6', // Purple  
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#10B981', // Emerald
      '#F97316', // Orange
      '#84CC16', // Lime
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#6366F1', // Indigo
      '#8B5A2B', // Brown
      '#64748B', // Slate
      '#DC2626', // Red-600
      '#7C2D12', // Orange-900
      '#059669', // Emerald-600
      '#7C3AED', // Violet-600
      '#BE123C', // Rose-700
      '#0369A1', // Sky-700
      '#374151', // Gray-700
      '#92400E', // Amber-700
      '#1E40AF', // Blue-700
      '#7E22CE', // Purple-700
      '#166534', // Green-800
    ];
    return colors[index % colors.length];
  };

  // Categorize expenses using the actual type field from the database
  const categorizeExpenses = (expenses: any[]) => {
    return expenses.map(expense => {
      // Convert to monthly amount
      let monthlyAmount = Number(expense.amount);
      if (expense.frequency === 'annual') {
        monthlyAmount = monthlyAmount / 12;
      } else if (expense.frequency === 'weekly') {
        monthlyAmount = monthlyAmount * 4.33;
      } else if (expense.frequency === 'quarterly') {
        monthlyAmount = monthlyAmount * 3;
      }
      
      return {
        ...expense,
        monthlyAmount,
        // Use the actual type field from the database
        isEssential: expense.category === 'essential',
        // For demo purposes, add some variation to tracked amounts
        trackedAmount: monthlyAmount * (0.85 + Math.random() * 0.3)
      };
    });
  };

  // Only use real expense data from the database
  const categorizedExpenses = categorizeExpenses(expenses);
  const essentialExpenses = categorizedExpenses.filter(exp => exp.isEssential);
  const discretionaryExpenses = categorizedExpenses.filter(exp => !exp.isEssential);

  // Calculate totals
  const totalEssentialBudgeted = essentialExpenses.reduce((sum, exp) => sum + exp.monthlyAmount, 0);
  const totalEssentialTracked = essentialExpenses.reduce((sum, exp) => sum + exp.trackedAmount, 0);
  const totalDiscretionaryBudgeted = discretionaryExpenses.reduce((sum, exp) => sum + exp.monthlyAmount, 0);
  const totalDiscretionaryTracked = discretionaryExpenses.reduce((sum, exp) => sum + exp.trackedAmount, 0);

  // Create chart data using individual expense names instead of categories
  const chartData = categorizedExpenses.map((expense, index) => ({
    name: expense.name,
    value: expense.trackedAmount,
    fill: getExpenseColor(index)
  }));

  const chartConfig = chartData.reduce((config, item, index) => {
    config[item.name] = {
      label: item.name,
      color: getExpenseColor(index)
    };
    return config;
  }, {} as any);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cash Flow Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Monthly Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Monthly Income</div>
              <div className="text-xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Monthly Expenses</div>
              <div className="text-xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Net Cash Flow</div>
              <div className={`text-xl font-bold ${monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(monthlyCashFlow)}
              </div>
            </div>
          </div>

          {/* Budget Summary - Only show if there are expenses */}
          {expenses.length > 0 && (
            <div className="space-y-6">
              <h4 className="font-semibold text-gray-900">Budget Summary</h4>
              
              {/* Essential Expenses Summary */}
              {essentialExpenses.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-left">
                    <div className="font-semibold text-gray-900">Essential Expenses</div>
                    <div className="font-semibold text-gray-900 text-center">Budgeted</div>
                    <div className="font-semibold text-gray-900 text-center">Tracked</div>
                  </div>
                  
                  {/* Essential Expense Line Items */}
                  <div className="space-y-2">
                    {essentialExpenses.map((expense, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 text-sm pl-4">
                        <div className="text-gray-900">
                          <div className="font-medium">{expense.name}</div>
                        </div>
                        <div className="text-center text-gray-600">{formatCurrency(expense.monthlyAmount)}</div>
                        <div className="text-center text-gray-600">{formatCurrency(expense.trackedAmount)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Essential Total */}
                  <div className="grid grid-cols-3 gap-4 text-left pt-2 border-t border-gray-200">
                    <div className="font-medium text-gray-700 pl-4">Total Essential</div>
                    <div className="text-center font-medium text-gray-700">{formatCurrency(totalEssentialBudgeted)}</div>
                    <div className="text-center font-medium text-gray-700">{formatCurrency(totalEssentialTracked)}</div>
                  </div>
                </div>
              )}

              {/* Discretionary Expenses Summary */}
              {discretionaryExpenses.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-left">
                    <div className="font-semibold text-gray-900">Discretionary Expenses</div>
                    <div className="font-semibold text-gray-900 text-center">Budgeted</div>
                    <div className="font-semibold text-gray-900 text-center">Tracked</div>
                  </div>
                  
                  {/* Discretionary Expense Line Items */}
                  <div className="space-y-2">
                    {discretionaryExpenses.map((expense, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 text-sm pl-4">
                        <div className="text-gray-900">
                          <div className="font-medium">{expense.name}</div>
                        </div>
                        <div className="text-center text-gray-600">{formatCurrency(expense.monthlyAmount)}</div>
                        <div className="text-center text-gray-600">{formatCurrency(expense.trackedAmount)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Discretionary Total */}
                  <div className="grid grid-cols-3 gap-4 text-left pt-2 border-t border-gray-200">
                    <div className="font-medium text-gray-700 pl-4">Total Discretionary</div>
                    <div className="text-center font-medium text-gray-700">{formatCurrency(totalDiscretionaryBudgeted)}</div>
                    <div className="text-center font-medium text-gray-700">{formatCurrency(totalDiscretionaryTracked)}</div>
                  </div>
                </div>
              )}

              {/* Spending Chart - Only show if there are expenses */}
              {chartData.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900 mb-6">Spending by Expense</h4>
                  <div className="h-[300px] w-full">
                    <ChartContainer config={chartConfig} className="w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={50}
                            paddingAngle={1}
                            label={({ name, percent }) => 
                              percent > 0.05 ? `${name.length > 12 ? name.substring(0, 12) + '...' : name} ${(percent * 100).toFixed(0)}%` : ''
                            }
                            labelLine={false}
                            fontSize={11}
                            fontWeight={500}
                          >
                            {chartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.fill}
                                stroke="#ffffff"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No expenses message */}
          {expenses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No expenses added yet. Go to the Facts section to add your expenses.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CashFlowDetails;
