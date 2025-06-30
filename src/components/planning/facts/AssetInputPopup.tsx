
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AssetGrowthInput from './AssetGrowthInput';
import HoldingsTable from './HoldingsTable';

interface AssetData {
  name: string;
  type: string;
  value: string;
  growth_method: string;
  growth_rate: number;
  holdings: any[];
}

interface AssetInputPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: AssetData) => void;
  editingAsset?: any;
  isLoading?: boolean;
}

const AssetInputPopup = ({ isOpen, onClose, onSave, editingAsset, isLoading }: AssetInputPopupProps) => {
  const [assetData, setAssetData] = useState<AssetData>({
    name: '',
    type: 'checking',
    value: '',
    growth_method: 'manual',
    growth_rate: 0.06,
    holdings: []
  });

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

  useEffect(() => {
    if (editingAsset) {
      setAssetData({
        name: editingAsset.name,
        type: editingAsset.type,
        value: editingAsset.value.toString(),
        growth_method: editingAsset.growth_method || 'manual',
        growth_rate: editingAsset.growth_rate || 0.06,
        holdings: editingAsset.holdings || []
      });
    } else {
      setAssetData({
        name: '',
        type: 'checking',
        value: '',
        growth_method: 'manual',
        growth_rate: 0.06,
        holdings: []
      });
    }
  }, [editingAsset, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(assetData);
  };

  const handleClose = () => {
    setAssetData({
      name: '',
      type: 'checking',
      value: '',
      growth_method: 'manual',
      growth_rate: 0.06,
      holdings: []
    });
    onClose();
  };

  const updateAssetData = (field: keyof AssetData, value: any) => {
    setAssetData(prev => ({ ...prev, [field]: value }));
  };

  const handleGrowthChange = (growthData: { growth_method: string; growth_rate: number; holdings: any[] }) => {
    setAssetData(prev => ({ ...prev, ...growthData }));
  };

  const calculateTotalValue = () => {
    if (assetData.growth_method === 'holdings' && assetData.holdings.length > 0) {
      return assetData.holdings.reduce((sum, holding) => sum + (holding.market_value || 0), 0);
    }
    return parseFloat(assetData.value) || 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold dark:text-white">
            {editingAsset ? 'Edit Asset' : 'Add New Asset'}
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Asset Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
              Asset Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="asset-name" className="dark:text-white">Asset Name *</Label>
                <Input
                  id="asset-name"
                  value={assetData.name}
                  onChange={(e) => updateAssetData('name', e.target.value)}
                  placeholder="e.g., Fidelity 401k"
                  required
                  className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="asset-type" className="dark:text-white">Asset Type *</Label>
                <Select value={assetData.type} onValueChange={(value) => updateAssetData('type', value)}>
                  <SelectTrigger className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="checking" className="dark:text-white">Checking Account</SelectItem>
                    <SelectItem value="savings" className="dark:text-white">Savings Account</SelectItem>
                    <SelectItem value="investment" className="dark:text-white">Investment Account</SelectItem>
                    <SelectItem value="retirement" className="dark:text-white">Retirement Account</SelectItem>
                    <SelectItem value="real_estate" className="dark:text-white">Real Estate</SelectItem>
                    <SelectItem value="vehicle" className="dark:text-white">Vehicle</SelectItem>
                    <SelectItem value="other" className="dark:text-white">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {assetData.growth_method === 'manual' && (
              <div>
                <Label htmlFor="asset-value" className="dark:text-white">Total Value *</Label>
                <Input
                  id="asset-value"
                  type="number"
                  step="1"
                  value={assetData.value}
                  onChange={(e) => updateAssetData('value', e.target.value)}
                  placeholder="25000"
                  required
                  className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Asset Entry Method Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
              Entry Method
            </h3>
            <AssetGrowthInput
              value={{
                growth_method: assetData.growth_method,
                growth_rate: assetData.growth_rate,
                holdings: assetData.holdings
              }}
              onChange={handleGrowthChange}
              assetType={assetData.type}
            />
          </div>

          {/* Holdings Section */}
          {assetData.growth_method === 'holdings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Holdings breakdown
              </h3>
              <HoldingsTable
                holdings={assetData.holdings}
                onChange={(holdings) => updateAssetData('holdings', holdings)}
                tickerReturns={tickerReturns}
              />
              
              {assetData.holdings.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      Total Portfolio Value:
                    </span>
                    <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
                      ${calculateTotalValue().toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={!assetData.name || (!assetData.value && assetData.growth_method === 'manual') || isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? 'Saving...' : editingAsset ? 'Update Asset' : 'Add Asset'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-8 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssetInputPopup;
