
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProjectionData {
  year: number;
  age: number;
  net_worth: number;
  portfolio_value: number;
  annual_expenses: number;
  cash_flow: number;
  account_values?: { [key: string]: number }; // Individual account values by account ID
  total_contributions?: number; // Total contributions for the year
  account_contributions?: { [key: string]: number }; // Contributions by account ID
}

interface Asset {
  id: string;
  name: string;
  type: string;
  value: number;
}

interface ProjectionTableProps {
  data: ProjectionData[];
  planName?: string;
  assets?: Asset[];
}

const ProjectionTable = ({ data, planName, assets }: ProjectionTableProps) => {
  const [selectedAccount, setSelectedAccount] = useState<string>('portfolio');

  // Filter assets to include investment, retirement, and savings accounts
  const filteredAssets = assets?.filter(asset => {
    const assetType = asset.type.toLowerCase();
    const assetName = asset.name.toLowerCase();
    
    // Include retirement account types
    if (['roth_ira', 'traditional_ira', '401k', '403b', '457', 'pension', 'sep_ira', 'simple_ira'].includes(assetType)) return true;
    if (assetType.includes('ira') || assetType.includes('401') || assetType.includes('403') || assetType.includes('457')) return true;
    if (assetType.includes('retirement') || assetType.includes('pension')) return true;
    
    // Include investment account types
    if (['brokerage', 'investment', 'mutual_fund', 'etf', 'stocks', 'bonds'].includes(assetType)) return true;
    if (assetType.includes('brokerage') || assetType.includes('investment') || assetType.includes('mutual')) return true;
    if (assetType.includes('stock') || assetType.includes('bond') || assetType.includes('fund')) return true;
    
    // Include savings account types
    if (['savings', 'high_yield_savings', 'money_market', 'cd', 'certificate_of_deposit'].includes(assetType)) return true;
    if (assetType.includes('savings') || assetType.includes('money_market') || assetType.includes('certificate')) return true;
    
    // Include HSA if it has investment component
    if (assetType.includes('hsa')) return true;
    
    // Exclude personal assets, checking accounts, vehicles, property, etc.
    if (assetType.includes('checking') || assetType.includes('vehicle') || assetType.includes('car') || 
        assetType.includes('property') || assetType.includes('real_estate') || assetType.includes('home') ||
        assetType.includes('auto') || assetType.includes('personal')) return false;
    
    // If it's not explicitly excluded and contains investment-related keywords in name, include it
    if (assetName.includes('investment') || assetName.includes('retirement') || assetName.includes('savings') ||
        assetName.includes('portfolio') || assetName.includes('fund') || assetName.includes('account')) return true;
    
    return false;
  }) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get current selected account name for display
  const getSelectedAccountName = () => {
    if (selectedAccount === 'portfolio') return 'Portfolio Value';
    if (selectedAccount === 'net_worth') return 'Net Worth';
    if (assets) {
      const asset = assets.find(a => a.id === selectedAccount);
      return asset ? asset.name : 'Portfolio Value';
    }
    return 'Portfolio Value';
  };

  // Get the value to display for the selected account
  const getDisplayValue = (row: ProjectionData) => {
    if (selectedAccount === 'portfolio') return row.portfolio_value;
    if (selectedAccount === 'net_worth') return row.net_worth;
    if (row.account_values && selectedAccount in row.account_values) {
      return row.account_values[selectedAccount];
    }
    return row.portfolio_value;
  };

  // Get the contributions for the selected account
  const getContributions = (row: ProjectionData) => {
    if (selectedAccount === 'portfolio' || selectedAccount === 'net_worth') {
      return row.total_contributions || 0;
    }
    if (row.account_contributions && selectedAccount in row.account_contributions) {
      return row.account_contributions[selectedAccount];
    }
    return 0;
  };

  return (
    <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-gray-900 dark:text-white">
            Year-by-Year Projections{planName ? `: ${planName}` : ''}
          </CardTitle>
          <div className="w-64">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="portfolio" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  Portfolio Value
                </SelectItem>
                <SelectItem value="net_worth" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  Net Worth
                </SelectItem>
                {filteredAssets && filteredAssets.map((asset) => (
                  <SelectItem 
                    key={asset.id} 
                    value={asset.id}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-gray-700">
                <TableHead className="text-gray-900 dark:text-white">Year</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Age</TableHead>
                <TableHead className="text-gray-900 dark:text-white">{getSelectedAccountName()}</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Annual Expenses</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Contributions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} className="dark:border-gray-700">
                  <TableCell className="text-gray-900 dark:text-white">{row.year}</TableCell>
                  <TableCell className="text-gray-900 dark:text-white">{row.age}</TableCell>
                  <TableCell className="text-gray-900 dark:text-white">{formatCurrency(getDisplayValue(row))}</TableCell>
                  <TableCell className="text-gray-900 dark:text-white">{formatCurrency(row.annual_expenses)}</TableCell>
                  <TableCell className="text-green-600">
                    {formatCurrency(getContributions(row))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectionTable;
