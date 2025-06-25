
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
  const isPositive = change >= 0;

  const chartConfig = {
    value: {
      label: "Portfolio Value",
      color: isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)",
    },
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-green-50/50" />
      <CardHeader className="relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Investment Overview</CardTitle>
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-24 border-gray-200 bg-white/80 backdrop-blur-sm">
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
      <CardContent className="relative">
        <div className="space-y-6">
          {/* Portfolio Value Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm font-medium text-gray-600 mb-1">Portfolio Value</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(currentValue)}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm font-medium text-gray-600 mb-1">Change ({timeframe})</p>
              <div className="flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <p className={`text-xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{formatCurrency(change)}
                </p>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  isPositive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {changePercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <h4 className="font-semibold text-gray-900 mb-4">Performance Trend</h4>
            <div className="h-64">
              <ChartContainer config={chartConfig}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop 
                        offset="5%" 
                        stopColor={isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"} 
                        stopOpacity={0.3}
                      />
                      <stop 
                        offset="95%" 
                        stopColor={isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"} 
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    tick={{ fill: '#6B7280' }}
                  />
                  <YAxis 
                    hide
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) => `Date: ${value}`}
                    formatter={(value) => [formatCurrency(Number(value)), 'Portfolio Value']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                    strokeWidth={3}
                    fill="url(#valueGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentOverview;
