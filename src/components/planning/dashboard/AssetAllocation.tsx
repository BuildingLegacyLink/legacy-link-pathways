
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Asset {
  id: string;
  name: string;
  type: string;
  value: number;
}

interface AssetAllocationProps {
  assets: Asset[];
  totalAssets: number;
}

const AssetAllocation = ({ assets, totalAssets }: AssetAllocationProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Group assets by type for the main allocation chart
  const assetsByType = assets.reduce((acc, asset) => {
    const type = asset.type;
    if (!acc[type]) {
      acc[type] = { type, value: 0, accounts: [] };
    }
    acc[type].value += asset.value;
    acc[type].accounts.push(asset);
    return acc;
  }, {} as Record<string, { type: string; value: number; accounts: Asset[] }>);

  // Prepare data for main pie chart
  const mainAllocationData = Object.values(assetsByType).map((typeData, index) => ({
    name: typeData.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: typeData.value,
    fill: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
  }));

  // Group assets by account type for individual account charts
  const accountTypes = ['checking', 'savings', 'roth_ira', 'crypto_wallet', 'brokerage'];
  const accountCharts = accountTypes.map(accountType => {
    const accountAssets = assets.filter(asset => asset.type === accountType);
    if (accountAssets.length === 0) return null;

    const accountData = accountAssets.map((asset, index) => ({
      name: asset.name,
      value: asset.value,
      fill: `hsl(${(index * 137.5 + 60) % 360}, 60%, 45%)`
    }));

    const accountTotal = accountAssets.reduce((sum, asset) => sum + asset.value, 0);

    return {
      type: accountType,
      displayName: accountType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      data: accountData,
      total: accountTotal
    };
  }).filter(Boolean);

  const mainChartConfig = mainAllocationData.reduce((config, item, index) => {
    config[item.name] = {
      label: item.name,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
    };
    return config;
  }, {} as any);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Asset Allocation Chart */}
          <div>
            <h4 className="font-medium mb-3 text-center">Overall Allocation</h4>
            <div className="h-64 flex justify-center">
              <ChartContainer config={mainChartConfig}>
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    formatter={(value) => [formatCurrency(Number(value)), 'Value']}
                  />
                  <Pie
                    data={mainAllocationData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {mainAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          </div>

          {/* Individual Account Charts */}
          {accountCharts.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 text-center">By Account</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accountCharts.map((account) => {
                  const accountConfig = account!.data.reduce((config, item, index) => {
                    config[item.name] = {
                      label: item.name,
                      color: item.fill
                    };
                    return config;
                  }, {} as any);

                  return (
                    <div key={account!.type} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium text-sm">{account!.displayName}</h5>
                        <span className="text-xs text-gray-600">{formatCurrency(account!.total)}</span>
                      </div>
                      <div className="h-32 flex justify-center">
                        <ChartContainer config={accountConfig}>
                          <PieChart>
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent hideLabel />}
                              formatter={(value) => [formatCurrency(Number(value)), 'Value']}
                            />
                            <Pie
                              data={account!.data}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={40}
                              innerRadius={15}
                              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {account!.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ChartContainer>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetAllocation;
