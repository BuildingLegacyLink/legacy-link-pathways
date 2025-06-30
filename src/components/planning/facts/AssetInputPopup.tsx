
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import AssetInputForm from './AssetInputForm';

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
  const handleClose = () => {
    console.log('handleClose called');
    onClose();
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

        <AssetInputForm
          editingAsset={editingAsset}
          isLoading={isLoading}
          onSave={onSave}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AssetInputPopup;
