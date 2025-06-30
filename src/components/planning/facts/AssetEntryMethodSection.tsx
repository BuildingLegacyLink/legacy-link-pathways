
import AssetGrowthInput from './AssetGrowthInput';

interface AssetEntryMethodSectionProps {
  assetData: {
    growth_method: string;
    growth_rate: number;
    holdings: any[];
    type: string;
  };
  onGrowthChange: (growthData: { growth_method: string; growth_rate: number; holdings: any[] }) => void;
}

const AssetEntryMethodSection = ({ assetData, onGrowthChange }: AssetEntryMethodSectionProps) => {
  return (
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
        onChange={onGrowthChange}
        assetType={assetData.type}
      />
    </div>
  );
};

export default AssetEntryMethodSection;
