import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface Holding {
  ticker: string;
  allocation: number;
}

interface HoldingsInputProps {
  value: Holding[];
  onChange: (holdings: Holding[]) => void;
  tickerReturns: Array<{ ticker: string; name: string; avg_annual_return: number }>;
}

const HoldingsInput = ({ value, onChange, tickerReturns }: HoldingsInputProps) => {
  const [newHolding, setNewHolding] = useState<Holding>({ ticker: '', allocation: 0 });

  const addHolding = () => {
    if (newHolding.ticker && newHolding.allocation > 0) {
      onChange([...value, newHolding]);
      setNewHolding({ ticker: '', allocation: 0 });
    }
  };

  const removeHolding = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateHolding = (index: number, field: keyof Holding, newValue: string | number) => {
    const updated = value.map((holding, i) => 
      i === index ? { ...holding, [field]: newValue } : holding
    );
    onChange(updated);
  };

  const totalAllocation = value.reduce((sum, holding) => sum + holding.allocation, 0);
  const isOverAllocated = totalAllocation > 100;

  return (
    <div className="space-y-4">
      <Label className="text-gray-900 dark:text-white">Holdings Breakdown</Label>
      
      {/* Existing Holdings */}
      {value.map((holding, index) => (
        <div key={index} className="flex gap-2 items-end">
          <div className="flex-1">
            <Label className="text-xs text-gray-600 dark:text-gray-400">Ticker</Label>
            <Select 
              value={holding.ticker} 
              onValueChange={(ticker) => updateHolding(index, 'ticker', ticker)}
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
          <div className="w-24">
            <Label className="text-xs text-gray-600 dark:text-gray-400">%</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={holding.allocation || ''}
              onChange={(e) => updateHolding(index, 'allocation', parseFloat(e.target.value) || 0)}
              className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeHolding(index)}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {/* Add New Holding */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label className="text-xs text-gray-600 dark:text-gray-400">Ticker</Label>
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
        <div className="w-24">
          <Label className="text-xs text-gray-600 dark:text-gray-400">%</Label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={newHolding.allocation || ''}
            onChange={(e) => setNewHolding({ ...newHolding, allocation: parseFloat(e.target.value) || 0 })}
            className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
          />
        </div>
        <Button
          onClick={addHolding}
          disabled={!newHolding.ticker || newHolding.allocation <= 0}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Allocation Summary */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Total Allocation: 
        <span className={`ml-1 font-semibold ${isOverAllocated ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
          {totalAllocation.toFixed(1)}%
        </span>
        {isOverAllocated && <span className="text-red-600 ml-2">⚠️ Over 100%</span>}
      </div>
    </div>
  );
};

export default HoldingsInput;
