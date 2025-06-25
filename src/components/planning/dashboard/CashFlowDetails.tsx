
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

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

  // Group expenses by category for the chart
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    const amount = Number(expense.amount);
    
    // Convert to monthly amount
    let monthlyAmount = amount;
    if (expense.frequency === 'annual') {
      monthlyAmount = amount / 12;
    } else if (expense.frequency === 'weekly') {
      monthlyAmount = amount * 4.33;
    }
    
    acc[category] = (acc[category] || 0) + monthlyAmount;
    return acc;
  }, {});

  const chartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cash Flow Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Monthly Summary */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Monthly Income</span>
              <span className="font-semibold text-green-600">{formatCurrency(monthlyIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Monthly Expenses</span>
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

          {/* Expenses Chart */}
          {chartData.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Spending by Category</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CashFlowDetails;
