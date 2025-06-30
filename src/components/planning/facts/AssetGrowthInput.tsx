
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface AssetGrowthInputProps {
  value: {
    growth_method: string;
    growth_rate: number;
    holdings: any[];
  };
  onChange: (value: { growth_method: string; growth_rate: number; holdings: any[] }) => void;
  assetType: string;
}

const AssetGrowthInput = ({ value, onChange, assetType }: AssetGrowthInputProps) => {
  const { data: tickerReturns = [] } = useQuery({
    queryKey: ['ticker_returns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticker_returns')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const getDefaultGrowthRate = (type: string) => {
    const defaults: Record<string, number> = {
      'savings': 0.01,
      'checking': 0.01,
      'real_estate': 0.035,
      'retirement': 0.07,
      'investment': 0.07,
      'vehicle': -0.05,
      'other': 0.06
    };
    return defaults[type] || 0.06;
  };

  // Calculate estimated growth rate from holdings
  useEffect(() => {
    if (value.growth_method === 'holdings' && value.holdings?.length > 0) {
      let totalAllocation = 0;
      let weightedReturn = 0;

      value.holdings.forEach(holding => {
        const allocation = holding.allocation / 100;
        const tickerData = tickerReturns.find(t => t.ticker === holding.ticker);
        const returnRate = tickerData?.avg_annual_return || 0.06;
        
        totalAllocation += allocation;
        weightedReturn += allocation * returnRate;
      });

      if (totalAllocation > 0) {
        const estimated = weightedReturn / totalAllocation;
        onChange({
          ...value,
          growth_rate: estimated
        });
      }
    }
  }, [value.holdings, value.growth_method, tickerReturns, onChange]);

  const handleMethodChange = (method: string) => {
    const newValue = {
      ...value,
      growth_method: method
    };

    if (method === 'manual') {
      newValue.growth_rate = getDefaultGrowthRate(assetType);
      newValue.holdings = [];
    } else {
      newValue.holdings = [];
      newValue.growth_rate = 0.06;
    }

    onChange(newValue);
  };

  const handleManualRateChange = (rate: string) => {
    const numericRate = parseFloat(rate) / 100;
    onChange({
      ...value,
      growth_rate: isNaN(numericRate) ? 0 : numericRate
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-gray-900 dark:text-white">Entry Method</Label>
        <Select value={value.growth_method} onValueChange={handleMethodChange}>
          <SelectTrigger className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
            <SelectItem value="manual" className="dark:text-white">Manual Rate</SelectItem>
            <SelectItem value="holdings" className="dark:text-white">Enter Holdings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {value.growth_method === 'manual' && (
        <div>
          <Label className="text-gray-900 dark:text-white">Expected Annual Growth Rate (%)</Label>
          <Input
            type="number"
            step="0.1"
            placeholder="6.5"
            value={value.growth_rate ? (value.growth_rate * 100).toFixed(1) : ''}
            onChange={(e) => handleManualRateChange(e.target.value)}
            className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Suggested for {assetType}: {(getDefaultGrowthRate(assetType) * 100).toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetGrowthInput;
