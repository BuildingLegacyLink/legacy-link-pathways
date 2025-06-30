import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from 'use-debounce';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { supabase } from '@/integrations/supabase/client';

interface Holding {
  ticker: string;
  description?: string;
  units?: number;
  cost_basis?: number;
  market_value: number;
  allocation?: number;
  current_price?: number;
  price_updated_at?: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);

  // Filter ticker suggestions based on search
  const filteredTickers = tickerReturns.filter(
    ticker => 
      ticker.ticker.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      ticker.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  ).slice(0, 10);

  const fetchLivePrice = async (ticker: string) => {
    try {
      setIsLoadingPrice(true);
      const upperTicker = ticker.toUpperCase();
      console.log(`Fetching live price for ${upperTicker} via Edge Function`);
      
      // Call our Supabase Edge Function instead of Yahoo Finance directly
      const { data, error } = await supabase.functions.invoke('get-ticker-price', {
        body: { ticker: upperTicker }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Price lookup failed: ${error.message}`);
      }

      if (data.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }

      console.log(`Live price for ${upperTicker}: $${data.price}`);
      return {
        price: data.price,
        timestamp: data.timestamp,
        source: data.source,
        name: data.name
      };
      
    } catch (error) {
      console.error(`Error fetching price for ${ticker}:`, error);
      throw new Error(`Unable to fetch price for ${ticker}. ${error.message}`);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const handleTickerSelect = async (ticker: string, description: string) => {
    setNewHolding(prev => ({ 
      ...prev, 
      ticker, 
      description 
    }));
    setSearchQuery(ticker);
    setShowSuggestions(false);

    // If units are entered, fetch live price and calculate market value
    if (newHolding.units && newHolding.units > 0) {
      try {
        const priceData = await fetchLivePrice(ticker);
        if (priceData) {
          const marketValue = newHolding.units * priceData.price;
          setNewHolding(prev => ({
            ...prev,
            market_value: marketValue,
            current_price: priceData.price,
            price_updated_at: priceData.timestamp,
            description: priceData.name
          }));
        }
      } catch (error) {
        console.error('Error fetching price:', error);
        // Don't set market value if price fetch fails
      }
    }
  };

  const handleUnitsChange = async (units: number) => {
    setNewHolding(prev => ({ ...prev, units }));
    
    // If ticker is selected and units entered, fetch live price
    if (newHolding.ticker && units > 0) {
      try {
        const priceData = await fetchLivePrice(newHolding.ticker);
        if (priceData) {
          const marketValue = units * priceData.price;
          setNewHolding(prev => ({
            ...prev,
            market_value: marketValue,
            current_price: priceData.price,
            price_updated_at: priceData.timestamp,
            description: priceData.name
          }));
        }
      } catch (error) {
        console.error('Error fetching price:', error);
        // Don't auto-fill market value if price fetch fails
      }
    }
  };

  const addHolding = () => {
    if (newHolding.ticker && newHolding.market_value > 0) {
      const holdingWithAllocation = {
        ...newHolding,
        allocation: calculateAllocation(newHolding.market_value)
      };
      const updatedHoldings = [...holdings, holdingWithAllocation];
      onChange(updatedHoldings);
      setNewHolding({ ticker: '', market_value: 0 });
      setSearchQuery('');
    }
  };

  const removeHolding = (index: number) => {
    const updated = holdings.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateHolding = async (index: number, field: keyof Holding, value: string | number) => {
    const updated = holdings.map((holding, i) => {
      if (i === index) {
        const updatedHolding = { ...holding, [field]: value };
        
        // Recalculate allocation when market value changes
        if (field === 'market_value') {
          updatedHolding.allocation = calculateAllocation(Number(value));
        }
        
        // If units changed and ticker exists, fetch new price
        if (field === 'units' && holding.ticker && Number(value) > 0) {
          fetchLivePrice(holding.ticker).then(priceData => {
            if (priceData) {
              const marketValue = Number(value) * priceData.price;
              const finalUpdated = holdings.map((h, idx) => 
                idx === index ? {
                  ...h,
                  units: Number(value),
                  market_value: marketValue,
                  current_price: priceData.price,
                  price_updated_at: priceData.timestamp,
                  allocation: calculateAllocation(marketValue)
                } : h
              );
              onChange(finalUpdated);
            }
          }).catch(error => {
            console.error('Error updating price:', error);
          });
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

  const hasValidationErrors = () => {
    return !newHolding.ticker || (newHolding.market_value <= 0 && (!newHolding.units || newHolding.units <= 0));
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
                <TableHead className="dark:text-gray-300">Description</TableHead>
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
                      {holding.current_price && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          @${holding.current_price.toFixed(2)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="dark:text-gray-300 text-sm max-w-32 truncate">
                      {holding.description || '-'}
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
                      {holding.price_updated_at && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Price updated
                        </div>
                      )}
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
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Searchable Ticker Input */}
          <div className="relative">
            <Label className="text-xs text-gray-600 dark:text-gray-400">Ticker *</Label>
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  setNewHolding(prev => ({ ...prev, ticker: e.target.value }));
                }}
                onFocus={() => setShowSuggestions(true)}
                className={`dark:bg-gray-600/50 dark:border-gray-500 dark:text-white pr-8 ${
                  hasValidationErrors() && !newHolding.ticker ? 'border-red-500' : ''
                }`}
                placeholder="Search ticker..."
              />
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && searchQuery && filteredTickers.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                <Command className="max-h-48">
                  <CommandList>
                    <CommandGroup>
                      {filteredTickers.map((ticker) => (
                        <CommandItem
                          key={ticker.ticker}
                          onSelect={() => handleTickerSelect(ticker.ticker, ticker.name)}
                          className="cursor-pointer dark:text-white"
                        >
                          <div>
                            <div className="font-medium">{ticker.ticker}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {ticker.name}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            )}
          </div>
          
          {/* Description (Auto-filled) */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400">Description</Label>
            <Input
              value={newHolding.description || ''}
              readOnly
              className="dark:bg-gray-600/30 dark:border-gray-500 dark:text-gray-300 bg-gray-100"
              placeholder="Auto-filled"
            />
          </div>
          
          {/* Units */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400">Units</Label>
            <Input
              type="number"
              step="0.001"
              value={newHolding.units || ''}
              onChange={(e) => handleUnitsChange(parseFloat(e.target.value) || 0)}
              className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
              placeholder="0"
              disabled={isLoadingPrice}
            />
          </div>
          
          {/* Cost Basis */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400">Cost Basis</Label>
            <Input
              type="number"
              step="0.01"
              value={newHolding.cost_basis || ''}
              onChange={(e) => setNewHolding({ ...newHolding, cost_basis: parseFloat(e.target.value) || undefined })}
              className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
              placeholder="0.00"
            />
          </div>
          
          {/* Market Value */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400">Market Value *</Label>
            <Input
              type="number"
              step="0.01"
              value={newHolding.market_value || ''}
              onChange={(e) => setNewHolding({ ...newHolding, market_value: parseFloat(e.target.value) || 0 })}
              className={`dark:bg-gray-600/50 dark:border-gray-500 dark:text-white ${
                hasValidationErrors() && newHolding.market_value <= 0 ? 'border-red-500' : ''
              }`}
              placeholder="0.00"
              disabled={isLoadingPrice}
            />
            {newHolding.current_price && (
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                Live price: ${newHolding.current_price.toFixed(2)}
              </div>
            )}
          </div>
        </div>
        
        {/* Add Button */}
        <div className="mt-3 flex justify-end">
          <Button
            onClick={addHolding}
            disabled={hasValidationErrors() || isLoadingPrice}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            {isLoadingPrice ? 'Loading Price...' : 'Add Holding'}
          </Button>
        </div>
        
        {/* Validation Errors */}
        {hasValidationErrors() && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            Please enter a ticker and either units or market value.
          </div>
        )}
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
