
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/currency';

interface Asset {
  id: string;
  name: string;
  type: string;
  value: number;
}

interface Liability {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface NetWorthBreakdownProps {
  assets: Asset[];
  totalAssets: number;
  liabilities?: Liability[];
}

const NetWorthBreakdown = ({ assets, totalAssets, liabilities = [] }: NetWorthBreakdownProps) => {
  const formatPercent = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const getAssetTypeDisplay = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getLiabilityTypeDisplay = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.balance, 0);
  const netWorth = totalAssets - totalLiabilities;

  // Generate historical data for the last 6 months (example data)
  const generateHistoricalData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => {
      // Simulate growth in assets and reduction in liabilities
      const assetMultiplier = 0.85 + (index * 0.03);
      const liabilityMultiplier = 1.15 - (index * 0.025);
      
      return {
        month,
        assets: Math.round(totalAssets * assetMultiplier),
        liabilities: Math.round(totalLiabilities * liabilityMultiplier)
      };
    });
  };

  const historicalData = generateHistoricalData();

  const chartConfig = {
    assets: {
      label: "Assets",
      color: "hsl(142, 71%, 45%)"
    },
    liabilities: {
      label: "Liabilities", 
      color: "hsl(0, 84%, 60%)"
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Net Worth Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total Assets</div>
              <div className="text-xl font-bold text-green-600">{formatCurrency(totalAssets)}</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total Liabilities</div>
              <div className="text-xl font-bold text-red-600">{formatCurrency(totalLiabilities)}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Net Worth</div>
              <div className={`text-xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netWorth)}
              </div>
            </div>
          </div>

          {(assets.length > 0 || liabilities.length > 0) ? (
            <div className="space-y-6">
              {/* Assets Table */}
              {assets.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Assets</h4>
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
              )}

              {/* Liabilities Table */}
              {liabilities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Liabilities</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead className="text-right">% of Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {liabilities.map((liability) => (
                        <TableRow key={liability.id}>
                          <TableCell className="font-medium">{liability.name}</TableCell>
                          <TableCell className="text-gray-600">
                            {getLiabilityTypeDisplay(liability.type)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(liability.balance)}
                          </TableCell>
                          <TableCell className="text-right text-gray-600">
                            {formatPercent(liability.balance, totalLiabilities)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2">
                        <TableCell colSpan={2} className="font-bold">Total Liabilities</TableCell>
                        <TableCell className="text-right font-bold text-red-600">
                          {formatCurrency(totalLiabilities)}
                        </TableCell>
                        <TableCell className="text-right font-bold">100%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Bar Chart - Assets vs Liabilities Over Time */}
              <div>
                <h4 className="font-medium mb-3 text-center">Assets vs Liabilities Trend</h4>
                <div className="h-64">
                  <ChartContainer config={chartConfig}>
                    <BarChart data={historicalData}>
                      <XAxis dataKey="month" />
                      <YAxis 
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value) => [formatCurrency(Number(value)), '']}
                      />
                      <Bar 
                        dataKey="assets" 
                        fill="var(--color-assets)" 
                        name="Assets"
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar 
                        dataKey="liabilities" 
                        fill="var(--color-liabilities)" 
                        name="Liabilities"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No assets or liabilities recorded yet.</p>
              <p className="text-sm mt-2">Add your first asset or liability to see the breakdown.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NetWorthBreakdown;
