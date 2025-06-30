
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AssetGrowthInput from './AssetGrowthInput';
import HoldingsTable from './HoldingsTable';
import AssetBasicInfo from './AssetBasicInfo';
import AssetSummary from './AssetSummary';
import AssetFormActions from './AssetFormActions';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  // Get default growth rates for different asset types
  const getDefaultGrowthRate = (type: string) => {
    const defaults: Record<string, number> = {
      'savings': 0.01,      // 1% - low savings rate
      'checking': 0.01,     // 1% - minimal growth
      'real_estate': 0.035, // 3.5% - inflation + property appreciation
      'retirement': 0.07,   // 7% - stock market average
      'investment': 0.07,   // 7% - stock market average
      'vehicle': -0.05,     // -5% - depreciation
      'other': 0.025        // 2.5% - inflation rate
    };
    return defaults[type] || 0.025; // Default to inflation rate
  };

  useEffect(() => {
    if (editingAsset) {
      setAssetData({
        name: editingAsset.name,
        type: editingAsset.type,
        value: editingAsset.value.toString(),
        growth_method: editingAsset.growth_method || 'manual',
        growth_rate: editingAsset.growth_rate || getDefaultGrowthRate(editingAsset.type),
        holdings: editingAsset.holdings || []
      });
    } else {
      setAssetData({
        name: '',
        type: 'checking',
        value: '',
        growth_method: 'manual',
        growth_rate: getDefaultGrowthRate('checking'),
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
      growth_rate: getDefaultGrowthRate('checking'),
      holdings: []
    });
    onClose();
  };

  const updateAssetData = (field: keyof AssetData, value: any) => {
    if (field === 'type') {
      // Update growth rate to default for new asset type
      setAssetData(prev => ({ 
        ...prev, 
        [field]: value,
        growth_rate: getDefaultGrowthRate(value),
        growth_method: 'manual',
        holdings: []
      }));
    } else {
      setAssetData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleGrowthChange = (growthData: { growth_method: string; growth_rate: number; holdings: any[] }) => {
    setAssetData(prev => ({ ...prev, ...growthData }));
  };

  const handleGrowthRateChange = (rate: string) => {
    const numericRate = parseFloat(rate) / 100;
    setAssetData(prev => ({ ...prev, growth_rate: isNaN(numericRate) ? 0 : numericRate }));
  };

  // Handle immediate saving of holdings changes without closing popup
  const handleSaveHoldingsOnly = async (holdings: any[]) => {
    const updatedAsset = {
      ...assetData,
      holdings
    };
    
    // Calculate total value from holdings if using holdings method
    if (assetData.growth_method === 'holdings') {
      const totalValue = holdings.reduce((sum, holding) => sum + (holding.market_value || 0), 0);
      updatedAsset.value = totalValue.toString();
    }
    
    // Always update local state first
    setAssetData(updatedAsset);
    
    // Only save to database if we're editing an existing asset
    // DO NOT call the parent's onSave callback here as it closes the popup
    if (editingAsset) {
      try {
        const { error } = await supabase
          .from('assets')
          .update({
            holdings: updatedAsset.holdings,
            value: parseFloat(updatedAsset.value) || 0,
            growth_rate: updatedAsset.growth_rate
          })
          .eq('id', editingAsset.id);
          
        if (error) throw error;
        console.log('Holdings saved successfully');
      } catch (error) {
        console.error('Error saving holdings:', error);
      }
    }
    // For new assets, we just keep the state updated - it will be saved when the user clicks "Add Asset"
  };

  const calculateTotalValue = () => {
    if (assetData.growth_method === 'holdings' && assetData.holdings.length > 0) {
      return assetData.holdings.reduce((sum, holding) => sum + (holding.market_value || 0), 0);
    }
    return parseFloat(assetData.value) || 0;
  };

  const isSubmitDisabled = !assetData.name || (!assetData.value && assetData.growth_method === 'manual');

  // Check if the current asset type supports entry methods
  const supportsEntryMethods = assetData.type === 'investment' || assetData.type === 'retirement';

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
          <AssetBasicInfo
            assetData={assetData}
            onUpdate={updateAssetData}
          />

          {/* Asset Entry Method Section - Only for investment accounts */}
          {supportsEntryMethods && (
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
          )}

          {/* Growth Rate Section - For non-investment accounts */}
          {!supportsEntryMethods && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Growth Rate
              </h3>
              <div>
                <Label className="text-gray-900 dark:text-white">Expected Annual Growth Rate (%)</Label>
                <Select 
                  value={(assetData.growth_rate * 100).toFixed(1)} 
                  onValueChange={handleGrowthRateChange}
                >
                  <SelectTrigger className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="0.0" className="dark:text-white">0.0% (No growth)</SelectItem>
                    <SelectItem value="1.0" className="dark:text-white">1.0% (Low savings)</SelectItem>
                    <SelectItem value="2.5" className="dark:text-white">2.5% (Inflation rate)</SelectItem>
                    <SelectItem value="3.5" className="dark:text-white">3.5% (Real estate)</SelectItem>
                    <SelectItem value="4.0" className="dark:text-white">4.0% (Conservative)</SelectItem>
                    <SelectItem value="6.0" className="dark:text-white">6.0% (Moderate)</SelectItem>
                    <SelectItem value="-5.0" className="dark:text-white">-5.0% (Depreciation)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Suggested for {assetData.type}: {(getDefaultGrowthRate(assetData.type) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          )}

          {/* Holdings Section - Only for investment accounts using holdings method */}
          {supportsEntryMethods && assetData.growth_method === 'holdings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Holdings breakdown
              </h3>
              <HoldingsTable
                holdings={assetData.holdings}
                onChange={(holdings) => updateAssetData('holdings', holdings)}
                tickerReturns={tickerReturns}
                onSaveHolding={handleSaveHoldingsOnly}
              />
              
              {assetData.holdings.length > 0 && (
                <AssetSummary totalValue={calculateTotalValue()} />
              )}
            </div>
          )}

          {/* Action Buttons */}
          <AssetFormActions
            onSubmit={() => onSave(assetData)}
            onCancel={handleClose}
            isSubmitDisabled={isSubmitDisabled}
            isLoading={isLoading}
            isEditing={!!editingAsset}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssetInputPopup;
