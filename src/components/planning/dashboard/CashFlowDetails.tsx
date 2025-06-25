
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
      { name: 'Electricity', category: 'Utilities', amount: 120, frequency: 'monthly' },
      { name: 'Water/Sewer', category: 'Utilities', amount: 80, frequency: 'monthly' },
      { name: 'Groceries', category: 'Groceries', amount: 600, frequency: 'monthly' },
      { name: 'Car Payment', category: 'Transportation', amount: 450, frequency: 'monthly' },
      { name: 'Gas', category: 'Transportation', amount: 200, frequency: 'monthly' },
      { name: 'Health Insurance', category: 'Insurance', amount: 350, frequency: 'monthly' },
      { name: 'Student Loan', category: 'Debt Payments', amount: 300, frequency: 'monthly' },
    ];

    const discretionaryExamples = [
      { name: 'Dining Out', category: 'Entertainment', amount: 300, frequency: 'monthly' },
      { name: 'Gym Membership', category: 'Health & Fitness', amount: 50, frequency: 'monthly' },
      { name: 'Streaming Services', category: 'Entertainment', amount: 45, frequency: 'monthly' },
      { name: 'Coffee Shop', category: 'Dining', amount: 80, frequency: 'monthly' },
      { name: 'Shopping', category: 'Personal', amount: 250, frequency: 'monthly' },
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

  // Group expenses by category for the chart
  const expensesByCategory = categorizedExpenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    acc[category] = (acc[category] || 0) + expense.trackedAmount;
    return acc;
  }, {});

  const chartData = Object.entries(expensesByCategory).map(([category, amount], index) => ({
    name: category,
    value: amount,
    fill: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
  }));

  const chartConfig = chartData.reduce((config, item, index) => {
    config[item.name] = {
      label: item.name,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
    };
    return config;
  }, {} as any);

  const ExpenseTable = ({ expenses, title }: { expenses: any[], title: string }) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Expense</TableHead>
            <TableHead className="text-right">Budgeted</TableHead>
            <TableHead className="text-right">Tracked</TableHead>
            <TableHead className="text-right">Difference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense, index) => {
            const difference = expense.trackedAmount - expense.monthlyAmount;
            return (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <div>
                    <div>{expense.name}</div>
                    <div className="text-xs text-gray-500">{expense.category}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(expense.monthlyAmount)}</TableCell>
                <TableCell className="text-right">{formatCurrency(expense.trackedAmount)}</TableCell>
                <TableCell className={`text-right font-medium ${
                  difference > 0 ? 'text-red-600' : difference < 0 ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

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

          {/* Budget Summary - Reorganized */}
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900">Budget Summary</h4>
            
            {/* Essential Expenses Summary */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-left">
                <div className="font-semibold text-gray-900">Essential Expenses</div>
                <div className="font-semibold text-gray-900 text-center">Budgeted</div>
                <div className="font-semibold text-gray-900 text-center">Tracked</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-left pb-2 border-b border-gray-200">
                <div className="font-medium text-gray-700">Total</div>
                <div className="text-center text-gray-700">{formatCurrency(totalEssentialBudgeted)}</div>
                <div className="text-center text-gray-700">{formatCurrency(totalEssentialTracked)}</div>
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
            </div>

            {/* Discretionary Expenses Summary */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-left">
                <div className="font-semibold text-gray-900">Discretionary Expenses</div>
                <div className="font-semibold text-gray-900 text-center">Budgeted</div>
                <div className="font-semibold text-gray-900 text-center">Tracked</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-left pb-2 border-b border-gray-200">
                <div className="font-medium text-gray-700">Total</div>
                <div className="text-center text-gray-700">{formatCurrency(totalDiscretionaryBudgeted)}</div>
                <div className="text-center text-gray-700">{formatCurrency(totalDiscretionaryTracked)}</div>
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
            </div>

            {/* Spending Chart - Moved under budget summary */}
            {chartData.length > 0 && (
              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 text-center mb-3">Spending by Category</h4>
                <div className="h-48 flex justify-center">
                  <ChartContainer config={chartConfig}>
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
                        outerRadius={70}
                        innerRadius={30}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        fontSize={10}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
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
