
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Holding {
  ticker: string;
  units?: number;
  cost_basis?: number;
  market_value: number;
  allocation?: number;
}

interface HoldingsTableProps {
  holdings: Holding[];
  onChange: (holdings: Holding[]) => void;
  tickerReturns: Array<{ ticker: string; name: string; avg_annual_return: number }>;
}

const HoldingsTable = ({ holdings, onChange, tickerReturns }: HoldingsTableProps) => {
  const [newHolding, setNewHolding] = useState<Holding>({
    ticker: '',
    market_value: 0
  });

  const addHolding = () => {
    if (newHolding.ticker && newHolding.market_value > 0) {
      const holdingWithAllocation = {
        ...newHolding,
        allocation: calculateAllocation(newHolding.market_value)
      };
      const updatedHoldings = [...holdings, holdingWithAllocation];
      onChange(updatedHoldings);
      setNewHolding({ ticker: '', market_value: 0 });
    }
  };

  const removeHolding = (index: number) => {
    const updated = holdings.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateHolding = (index: number, field: keyof Holding, value: string | number) => {
    const updated = holdings.map((holding, i) => {
      if (i === index) {
        const updatedHolding = { ...holding, [field]: value };
        // Recalculate allocation when market value changes
        if (field === 'market_value') {
          updatedHolding.allocation = calculateAllocation(Number(value));
        }
        return updatedHolding;
      }
      return holding;
    });
    onChange(updated);
  };

  const calculateAllocation = (marketValue: number) => {
    const totalValue = holdings.reduce((sum, h) => sum + h.market_value, 0) + marketValue;
    return totalValue > 0 ? (marketValue / totalValue) * 100 : 0;
  };

  const getTotalValue = () => {
    return holdings.reduce((sum, holding) => sum + holding.market_value, 0);
  };

  const getUnrealizedGain = (holding: Holding) => {
    if (holding.cost_basis && holding.market_value) {
      return holding.market_value - holding.cost_basis;
    }
    return null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Holdings Table */}
      {holdings.length > 0 && (
        <div className="border rounded-lg dark:border-gray-600">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-gray-600">
                <TableHead className="dark:text-gray-300">Ticker</TableHead>
                <TableHead className="dark:text-gray-300">Units</TableHead>
                <TableHead className="dark:text-gray-300">Cost Basis</TableHead>
                <TableHead className="dark:text-gray-300">Market Value</TableHead>
                <TableHead className="dark:text-gray-300">Allocation</TableHead>
                <TableHead className="dark:text-gray-300">Gain/Loss</TableHead>
                <TableHead className="dark:text-gray-300"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding, index) => {
                const unrealizedGain = getUnrealizedGain(holding);
                return (
                  <TableRow key={index} className="dark:border-gray-600">
                    <TableCell className="font-medium dark:text-white">
                      {holding.ticker}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.001"
                        value={holding.units || ''}
                        onChange={(e) => updateHolding(index, 'units', parseFloat(e.target.value) || 0)}
                        className="w-20 dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={holding.cost_basis || ''}
                        onChange={(e) => updateHolding(index, 'cost_basis', parseFloat(e.target.value) || 0)}
                        className="w-24 dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={holding.market_value || ''}
                        onChange={(e) => updateHolding(index, 'market_value', parseFloat(e.target.value) || 0)}
                        className="w-28 dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="dark:text-gray-300 dark:border-gray-500">
                        {holding.allocation?.toFixed(1) || '0.0'}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {unrealizedGain !== null && (
                        <span className={`font-medium ${unrealizedGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {unrealizedGain >= 0 ? '+' : ''}{formatCurrency(unrealizedGain)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHolding(index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add New Holding */}
      <div className="border rounded-lg p-4 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
          Add New Holding
        </Label>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400">Ticker *</Label>
            <Select 
              value={newHolding.ticker} 
              onValueChange={(ticker) => setNewHolding({ ...newHolding, ticker })}
            >
              <SelectTrigger className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white">
                <SelectValue placeholder="Select ticker" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                {tickerReturns.map((ticker) => (
                  <SelectItem key={ticker.ticker} value={ticker.ticker} className="dark:text-white">
                    {ticker.ticker} - {ticker.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400">Units</Label>
            <Input
              type="number"
              step="0.001"
              value={newHolding.units || ''}
              onChange={(e) => setNewHolding({ ...newHolding, units: parseFloat(e.target.value) || undefined })}
              className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
              placeholder="0"
            />
          </div>
          
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400">Market Value *</Label>
            <Input
              type="number"
              step="0.01"
              value={newHolding.market_value || ''}
              onChange={(e) => setNewHolding({ ...newHolding, market_value: parseFloat(e.target.value) || 0 })}
              className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
              placeholder="0.00"
            />
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={addHolding}
              disabled={!newHolding.ticker || newHolding.market_value <= 0}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Summary */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-blue-700 dark:text-blue-300 font-medium">Total Holdings</div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {holdings.length} positions
            </div>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-green-700 dark:text-green-300 font-medium">Total Value</div>
            <div className="text-lg font-bold text-green-700 dark:text-green-300">
              {formatCurrency(getTotalValue())}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoldingsTable;
