
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LinkedSaving {
  id: string;
  name: string;
  frequency: string;
}

interface AssetDeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  assetName: string;
  linkedSavings: LinkedSaving[];
  isLoading: boolean;
}

const AssetDeleteConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
  assetName,
  linkedSavings,
  isLoading
}: AssetDeleteConfirmationProps) => {
  const hasLinkedSavings = linkedSavings.length > 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Asset</AlertDialogTitle>
          <AlertDialogDescription>
            {hasLinkedSavings ? (
              <div className="space-y-2">
                <p>
                  <strong>{assetName}</strong> is linked to the following savings contributions:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {linkedSavings.map((saving) => (
                    <li key={saving.id}>
                      {saving.name} ({saving.frequency})
                    </li>
                  ))}
                </ul>
                <p className="text-red-600 font-medium">
                  Deleting this asset will unlink these savings contributions. 
                  The savings will remain but will no longer be associated with an asset.
                </p>
              </div>
            ) : (
              <p>
                Are you sure you want to delete <strong>{assetName}</strong>? 
                This action cannot be undone.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Deleting...' : 'Delete Asset'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AssetDeleteConfirmation;
