
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AssetBasicInfoProps {
  assetData: {
    name: string;
    type: string;
    value: string;
    growth_method: string;
  };
  onUpdate: (field: string, value: any) => void;
}

const AssetBasicInfo = ({ assetData, onUpdate }: AssetBasicInfoProps) => {
  return (
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
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="e.g., Fidelity 401k"
            required
            className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="asset-type" className="dark:text-white">Asset Type *</Label>
          <Select value={assetData.type} onValueChange={(value) => onUpdate('type', value)}>
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
            onChange={(e) => onUpdate('value', e.target.value)}
            placeholder="25000"
            required
            className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
          />
        </div>
      )}
    </div>
  );
};

export default AssetBasicInfo;
