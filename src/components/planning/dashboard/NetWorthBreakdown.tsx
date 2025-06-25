
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Asset {
  id: string;
  name: string;
  type: string;
  value: number;
}

interface NetWorthBreakdownProps {
  assets: Asset[];
  totalAssets: number;
}

const NetWorthBreakdown = ({ assets, totalAssets }: NetWorthBreakdownProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const getAssetTypeDisplay = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Prepare data for pie chart
  const pieChartData = assets.map((asset, index) => ({
    name: asset.name,
    value: asset.value,
    type: getAssetTypeDisplay(asset.type),
    fill: `hsl(${(index * 137.5) % 360}, 70%, 50%)` // Generate colors
  }));

  const chartConfig = assets.reduce((config, asset, index) => {
    config[asset.name] = {
      label: asset.name,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
    };
    return config;
  }, {} as any);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Net Worth Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {assets.length > 0 ? (
          <div className="space-y-6">
            {/* Pie Chart */}
            <div className="h-64">
              <ChartContainer config={chartConfig}>
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell className="text-gray-600">
                      {getAssetTypeDisplay(asset.type)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(asset.value)}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {formatPercent(asset.value, totalAssets)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell colSpan={2} className="font-bold">Total Assets</TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(totalAssets)}
                  </TableCell>
                  <TableCell className="text-right font-bold">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No assets recorded yet.</p>
            <p className="text-sm mt-2">Add your first asset to see the breakdown.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NetWorthBreakdown;
