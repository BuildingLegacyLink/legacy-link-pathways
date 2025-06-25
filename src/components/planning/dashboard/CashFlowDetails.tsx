
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface CashFlowDetailsProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  expenses: any[];
}

const CashFlowDetails = ({ monthlyIncome, monthlyExpenses, monthlyCashFlow, expenses }: CashFlowDetailsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Add example essential expenses if the expenses array is empty or lacks essential items
  const getExampleExpenses = () => {
    const essentialExamples = [
      { name: 'Mortgage/Rent', category: 'Housing', amount: 2500, frequency: 'monthly' },
      { name: 'Property Insurance', category: 'Insurance', amount: 150, frequency: 'monthly' },
      { name: 'HOA Fees', category: 'Housing', amount: 200, frequency: 'monthly' },
      { name: 'Electricity', category: 'Utilities', amount: 120, frequency: 'monthly' },
      { name: 'Water/Sewer', category: 'Utilities', amount: 80, frequency: 'monthly' },
      { name: 'Internet', category: 'Utilities', amount: 75, frequency: 'monthly' },
      { name: 'Groceries', category: 'Groceries', amount: 600, frequency: 'monthly' },
      { name: 'Car Payment', category: 'Transportation', amount: 450, frequency: 'monthly' },
      { name: 'Gas', category: 'Transportation', amount: 200, frequency: 'monthly' },
      { name: 'Car Insurance', category: 'Insurance', amount: 120, frequency: 'monthly' },
      { name: 'Health Insurance', category: 'Insurance', amount: 350, frequency: 'monthly' },
      { name: 'Student Loan', category: 'Debt Payments', amount: 300, frequency: 'monthly' },
      { name: 'Credit Card Payment', category: 'Debt Payments', amount: 150, frequency: 'monthly' },
    ];

    const discretionaryExamples = [
      { name: 'Dining Out', category: 'Entertainment', amount: 300, frequency: 'monthly' },
      { name: 'Gym Membership', category: 'Health & Fitness', amount: 50, frequency: 'monthly' },
      { name: 'Streaming Services', category: 'Entertainment', amount: 45, frequency: 'monthly' },
      { name: 'Coffee Shop', category: 'Dining', amount: 80, frequency: 'monthly' },
      { name: 'Shopping', category: 'Personal', amount: 250, frequency: 'monthly' },
      { name: 'Travel', category: 'Travel', amount: 200, frequency: 'monthly' },
      { name: 'Hobbies', category: 'Personal', amount: 100, frequency: 'monthly' },
    ];

    // If user has provided expenses, use those, otherwise use examples
    if (expenses && expenses.length > 0) {
      return expenses;
    }

    return [...essentialExamples, ...discretionaryExamples];
  };

  // Categorize expenses as essential or discretionary
  const categorizeExpenses = (expenses: any[]) => {
    const essentialCategories = ['Housing', 'Utilities', 'Groceries', 'Transportation', 'Insurance', 'Healthcare', 'Debt Payments'];
    
    return expenses.map(expense => {
      const isEssential = essentialCategories.some(cat => 
        expense.category?.toLowerCase().includes(cat.toLowerCase())
      );
      
      // Convert to monthly amount
      let monthlyAmount = Number(expense.amount);
      if (expense.frequency === 'annual') {
        monthlyAmount = monthlyAmount / 12;
      } else if (expense.frequency === 'weekly') {
        monthlyAmount = monthlyAmount * 4.33;
      }
      
      return {
        ...expense,
        monthlyAmount,
        isEssential,
        // For demo purposes, add some variation to tracked amounts
        trackedAmount: monthlyAmount * (0.85 + Math.random() * 0.3)
      };
    });
  };

  const allExpenses = getExampleExpenses();
  const categorizedExpenses = categorizeExpenses(allExpenses);
  const essentialExpenses = categorizedExpenses.filter(exp => exp.isEssential);
  const discretionaryExpenses = categorizedExpenses.filter(exp => !exp.isEssential);

  // Calculate totals
  const totalEssentialBudgeted = essentialExpenses.reduce((sum, exp) => sum + exp.monthlyAmount, 0);
  const totalEssentialTracked = essentialExpenses.reduce((sum, exp) => sum + exp.trackedAmount, 0);
  const totalDiscretionaryBudgeted = discretionaryExpenses.reduce((sum, exp) => sum + exp.monthlyAmount, 0);
  const totalDiscretionaryTracked = discretionaryExpenses.reduce((sum, exp) => sum + exp.trackedAmount, 0);

  // Group expenses by category for the chart with better colors
  const expensesByCategory = categorizedExpenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    acc[category] = (acc[category] || 0) + expense.trackedAmount;
    return acc;
  }, {});

  // Define a beautiful color palette for the pie chart
  const colorPalette = [
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
  ];

  const chartData = Object.entries(expensesByCategory).map(([category, amount], index) => ({
    name: category,
    value: amount,
    fill: colorPalette[index % colorPalette.length]
  }));

  const chartConfig = chartData.reduce((config, item, index) => {
    config[item.name] = {
      label: item.name,
      color: colorPalette[index % colorPalette.length]
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

          {/* Budget Summary */}
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900">Budget Summary</h4>
            
            {/* Essential Expenses Summary */}
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
                      <div className="text-xs text-gray-500">{expense.category}</div>
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

            {/* Discretionary Expenses Summary */}
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
                      <div className="text-xs text-gray-500">{expense.category}</div>
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

            {/* Spending Chart - Enhanced and larger */}
            {chartData.length > 0 && (
              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 mb-6">Spending by Category</h4>
                <div className="h-96 w-full">
                  <ChartContainer config={chartConfig} className="w-full h-full">
                    <PieChart width="100%" height="100%">
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
                        outerRadius={140}
                        innerRadius={60}
                        paddingAngle={2}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        labelLine={false}
                        fontSize={12}
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
                  </ChartContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashFlowDetails;
