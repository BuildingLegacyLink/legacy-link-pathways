
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AssetGrowthRateSectionProps {
  assetData: {
    growth_rate: number;
    type: string;
  };
  getDefaultGrowthRate: (type: string) => number;
  onUpdate: (field: string, value: any) => void;
}

const AssetGrowthRateSection = ({ assetData, getDefaultGrowthRate, onUpdate }: AssetGrowthRateSectionProps) => {
  const handleGrowthRateChange = (rate: string) => {
    const numericRate = parseFloat(rate) / 100;
    onUpdate('growth_rate', isNaN(numericRate) ? 0 : numericRate);
  };

  return (
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
  );
};

export default AssetGrowthRateSection;
