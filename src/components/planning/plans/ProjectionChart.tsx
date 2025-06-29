
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProjectionData {
  year: number;
  age: number;
  net_worth: number;
  portfolio_value: number;
  annual_expenses: number;
  cash_flow: number;
}

interface ProjectionChartProps {
  data: ProjectionData[];
  viewType: 'cash_flow' | 'portfolio' | 'goals';
}

const ProjectionChart = ({ data, viewType }: ProjectionChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getChartConfig = () => {
    switch (viewType) {
      case 'cash_flow':
        return {
          title: 'Cash Flow Overview',
          dataKey: 'cash_flow',
          color: '#10b981',
          yAxisLabel: 'Annual Cash Flow'
        };
      case 'portfolio':
        return {
          title: 'Lifetime Portfolio Value',
          dataKey: 'portfolio_value',
          color: '#3b82f6',
          yAxisLabel: 'Portfolio Value'
        };
      case 'goals':
        return {
          title: 'Net Worth Growth',
          dataKey: 'net_worth',
          color: '#8b5cf6',
          yAxisLabel: 'Net Worth'
        };
      default:
        return {
          title: 'Cash Flow Overview',
          dataKey: 'cash_flow',
          color: '#10b981',
          yAxisLabel: 'Annual Cash Flow'
        };
    }
  };

  const config = getChartConfig();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{config.title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="age" 
              className="text-gray-600 dark:text-gray-400"
              label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              className="text-gray-600 dark:text-gray-400"
              tickFormatter={formatCurrency}
              label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), config.yAxisLabel]}
              labelFormatter={(age) => `Age: ${age}`}
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Line 
              type="monotone" 
              dataKey={config.dataKey} 
              stroke={config.color} 
              strokeWidth={2}
              dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProjectionChart;
