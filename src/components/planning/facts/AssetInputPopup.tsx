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
    
    setAssetData(updatedAsset);
    
    if (editingAsset) {
      // Save to database but don't trigger onSave (which closes popup)
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
  };

  const calculateTotalValue = () => {
    if (assetData.growth_method === 'holdings' && assetData.holdings.length > 0) {
      return assetData.holdings.reduce((sum, holding) => sum + (holding.market_value || 0), 0);
    }
    return parseFloat(assetData.value) || 0;
  };

  const isSubmitDisabled = !assetData.name || (!assetData.value && assetData.growth_method === 'manual');

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
