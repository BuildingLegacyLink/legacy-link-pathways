
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AssetGrowthInput from './AssetGrowthInput';
import HoldingsTable from './HoldingsTable';
import AssetBasicInfo from './AssetBasicInfo';
import AssetSummary from './AssetSummary';
import AssetFormActions from './AssetFormActions';
import AssetEntryMethodSection from './AssetEntryMethodSection';
import AssetGrowthRateSection from './AssetGrowthRateSection';
import AssetHoldingsSection from './AssetHoldingsSection';

interface AssetData {
  name: string;
  type: string;
  value: string;
  growth_method: string;
  growth_rate: number;
  holdings: any[];
}

interface AssetInputFormProps {
  editingAsset?: any;
  isLoading?: boolean;
  onSave: (asset: AssetData) => void;
  onCancel: () => void;
}

const AssetInputForm = ({ editingAsset, isLoading, onSave, onCancel }: AssetInputFormProps) => {
  const [assetData, setAssetData] = useState<AssetData>({
    name: '',
    type: 'checking',
    value: '',
    growth_method: 'manual',
    growth_rate: 0.025,
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
  }, [editingAsset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted - calling onSave with asset data:', assetData);
    onSave(assetData);
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
    
    // Only save to database if we're editing an existing asset with an ID
    if (editingAsset?.id) {
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
        console.log('Holdings saved successfully for existing asset');
      } catch (error) {
        console.error('Error saving holdings:', error);
      }
    } else {
      console.log('New asset: holdings updated in state only, will be saved with full asset');
    }
  };

  // Handle holdings changes for local state only (used by new assets and when not auto-saving)
  const handleHoldingsChange = (holdings: any[]) => {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Asset Info Section */}
      <AssetBasicInfo
        assetData={assetData}
        onUpdate={updateAssetData}
      />

      {/* Asset Entry Method Section - Only for investment accounts */}
      {supportsEntryMethods && (
        <AssetEntryMethodSection
          assetData={assetData}
          onGrowthChange={handleGrowthChange}
        />
      )}

      {/* Growth Rate Section - For non-investment accounts */}
      {!supportsEntryMethods && (
        <AssetGrowthRateSection
          assetData={assetData}
          getDefaultGrowthRate={getDefaultGrowthRate}
          onUpdate={updateAssetData}
        />
      )}

      {/* Holdings Section - Only for investment accounts using holdings method */}
      {supportsEntryMethods && assetData.growth_method === 'holdings' && (
        <AssetHoldingsSection
          assetData={assetData}
          tickerReturns={tickerReturns}
          editingAsset={editingAsset}
          onHoldingsChange={handleHoldingsChange}
          onSaveHoldingsOnly={handleSaveHoldingsOnly}
          calculateTotalValue={calculateTotalValue}
        />
      )}

      {/* Action Buttons */}
      <AssetFormActions
        onSubmit={() => {}} // Empty function since form submission handles the save
        onCancel={onCancel}
        isSubmitDisabled={isSubmitDisabled}
        isLoading={isLoading}
        isEditing={!!editingAsset}
      />
    </form>
  );
};

export default AssetInputForm;
