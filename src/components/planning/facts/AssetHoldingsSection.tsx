
import HoldingsTable from './HoldingsTable';
import AssetSummary from './AssetSummary';

interface AssetHoldingsSectionProps {
  assetData: {
    holdings: any[];
  };
  tickerReturns: any[];
  editingAsset?: any;
  onHoldingsChange: (holdings: any[]) => void;
  onSaveHoldingsOnly: (holdings: any[]) => void;
  calculateTotalValue: () => number;
}

const AssetHoldingsSection = ({ 
  assetData, 
  tickerReturns, 
  editingAsset, 
  onHoldingsChange, 
  onSaveHoldingsOnly, 
  calculateTotalValue 
}: AssetHoldingsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
        Holdings breakdown
      </h3>
      <HoldingsTable
        holdings={assetData.holdings}
        onChange={onHoldingsChange}
        tickerReturns={tickerReturns}
        onSaveHolding={editingAsset?.id ? onSaveHoldingsOnly : undefined}
      />
      
      {assetData.holdings.length > 0 && (
        <AssetSummary totalValue={calculateTotalValue()} />
      )}
    </div>
  );
};

export default AssetHoldingsSection;
