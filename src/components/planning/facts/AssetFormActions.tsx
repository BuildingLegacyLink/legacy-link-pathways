
import { Button } from '@/components/ui/button';

interface AssetFormActionsProps {
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitDisabled: boolean;
  isLoading?: boolean;
  isEditing: boolean;
}

const AssetFormActions = ({ 
  onSubmit, 
  onCancel, 
  isSubmitDisabled, 
  isLoading, 
  isEditing 
}: AssetFormActionsProps) => {
  return (
    <div className="flex gap-3 pt-4 border-t">
      <Button
        type="submit"
        disabled={isSubmitDisabled || isLoading}
        onClick={onSubmit}
        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
      >
        {isLoading ? 'Saving...' : isEditing ? 'Update Asset' : 'Add Asset'}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="px-8 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
      >
        Cancel
      </Button>
    </div>
  );
};

export default AssetFormActions;
