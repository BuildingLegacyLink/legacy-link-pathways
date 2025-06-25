
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

interface InvestmentOverviewProps {
  totalAssets: number;
}

const InvestmentOverview = ({ totalAssets }: InvestmentOverviewProps) => {
  const [timeframe, setTimeframe] = useState('1M');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Sample data - in a real app, this would come from your backend
  const generatePerformanceData = (timeframe: string) => {
    const dataPoints = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : timeframe === '1Y' ? 365 : 1095;
    const baseValue = totalAssets * 0.7; // Assume 70% is invested
    
    return Array.from({ length: Math.min(dataPoints, 30) }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (dataPoints - i));
      const variance = (Math.random() - 0.5) * 0.1; // Random variance
      const trend = i * 0.002; // Slight upward trend
      
      return {
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          ...(timeframe === '1Y' || timeframe === '3Y' ? { year: '2-digit' } : {})
        }),
        value: Math.round(baseValue * (1 + variance + trend))
      };
    });
  };

  const performanceData = generatePerformanceData(timeframe);
  const currentValue = performanceData[performanceData.length - 1]?.value || 0;
  const previousValue = performanceData[0]?.value || 0;
  const change = currentValue - previousValue;
  const changePercent = previousValue ? ((change / previousValue) * 100).toFixed(2) : '0.00';

  const chartConfig = {
    value: {
      label: "Portfolio Value",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Investment Overview</CardTitle>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1D">1D</SelectItem>
              <SelectItem value="1W">1W</SelectItem>
              <SelectItem value="1M">1M</SelectItem>
              <SelectItem value="3M">3M</SelectItem>
              <SelectItem value="1Y">1Y</SelectItem>
              <SelectItem value="3Y">3Y</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Portfolio Value Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Portfolio Value</p>
              <p className="text-2xl font-bold">{formatCurrency(currentValue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Change ({timeframe})</p>
              <p className={`text-lg font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{formatCurrency(change)} ({changePercent}%)
              </p>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="h-64">
            <ChartContainer config={chartConfig}>
              <LineChart data={performanceData}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                />
                <YAxis 
                  hide
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => `Date: ${value}`}
                  formatter={(value) => [formatCurrency(Number(value)), 'Portfolio Value']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>

          {/* Risk & Performance Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Risk Tolerance</p>
              <p className="font-medium">Moderate</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Asset Allocation</p>
              <p className="font-medium">70% Stocks, 30% Bonds</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentOverview;
