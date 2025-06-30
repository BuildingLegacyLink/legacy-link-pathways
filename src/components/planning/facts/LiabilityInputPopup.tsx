
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface LiabilityData {
  name: string;
  type: string;
  balance: string;
  interest_rate: string;
  minimum_payment: string;
}

interface LiabilityInputPopupProps {
  isOpen: boolean;
  onClose: () => void;
  editingLiability?: any;
}

const LiabilityInputPopup = ({ isOpen, onClose, editingLiability }: LiabilityInputPopupProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [liabilityData, setLiabilityData] = useState<LiabilityData>({
    name: '',
    type: 'credit_card',
    balance: '',
    interest_rate: '',
    minimum_payment: ''
  });

  useEffect(() => {
    if (editingLiability) {
      setLiabilityData({
        name: editingLiability.name,
        type: editingLiability.type,
        balance: editingLiability.balance.toString(),
        interest_rate: editingLiability.interest_rate?.toString() || '',
        minimum_payment: editingLiability.minimum_payment?.toString() || ''
      });
    } else {
      setLiabilityData({
        name: '',
        type: 'credit_card',
        balance: '',
        interest_rate: '',
        minimum_payment: ''
      });
    }
  }, [editingLiability, isOpen]);

  const addLiabilityMutation = useMutation({
    mutationFn: async (liability: LiabilityData) => {
      if (!user) throw new Error('No user');
      const { error } = await supabase
        .from('liabilities')
        .insert([{ 
          ...liability, 
          user_id: user.id, 
          balance: parseFloat(liability.balance),
          interest_rate: liability.interest_rate ? parseFloat(liability.interest_rate) : 0,
          minimum_payment: liability.minimum_payment ? parseFloat(liability.minimum_payment) : 0
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      onClose();
      toast({ title: 'Success', description: 'Liability added successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to add liability: ' + error.message, variant: 'destructive' });
    }
  });

  const updateLiabilityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LiabilityData }) => {
      const { error } = await supabase
        .from('liabilities')
        .update({ 
          ...data, 
          balance: parseFloat(data.balance),
          interest_rate: data.interest_rate ? parseFloat(data.interest_rate) : 0,
          minimum_payment: data.minimum_payment ? parseFloat(data.minimum_payment) : 0
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      onClose();
      toast({ title: 'Success', description: 'Liability updated successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update liability: ' + error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liabilityData.name || !liabilityData.balance) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    if (editingLiability) {
      updateLiabilityMutation.mutate({ id: editingLiability.id, data: liabilityData });
    } else {
      addLiabilityMutation.mutate(liabilityData);
    }
  };

  const updateLiabilityData = (field: keyof LiabilityData, value: string) => {
    setLiabilityData(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = addLiabilityMutation.isPending || updateLiabilityMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold dark:text-white">
            {editingLiability ? 'Edit Liability' : 'Add New Liability'}
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
              💳 Liability Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="liability-name" className="dark:text-white">Liability Name *</Label>
                <Input
                  id="liability-name"
                  value={liabilityData.name}
                  onChange={(e) => updateLiabilityData('name', e.target.value)}
                  placeholder="e.g., Credit Card"
                  required
                  className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="liability-type" className="dark:text-white">Type *</Label>
                <Select value={liabilityData.type} onValueChange={(value) => updateLiabilityData('type', value)}>
                  <SelectTrigger className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="credit_card" className="dark:text-white">Credit Card</SelectItem>
                    <SelectItem value="mortgage" className="dark:text-white">Mortgage</SelectItem>
                    <SelectItem value="student_loan" className="dark:text-white">Student Loan</SelectItem>
                    <SelectItem value="auto_loan" className="dark:text-white">Auto Loan</SelectItem>
                    <SelectItem value="personal_loan" className="dark:text-white">Personal Loan</SelectItem>
                    <SelectItem value="other" className="dark:text-white">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="liability-balance" className="dark:text-white">Balance *</Label>
                <Input
                  id="liability-balance"
                  type="number"
                  step="0.01"
                  value={liabilityData.balance}
                  onChange={(e) => updateLiabilityData('balance', e.target.value)}
                  placeholder="5000"
                  required
                  className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="interest-rate" className="dark:text-white">Interest Rate (%)</Label>
                <Input
                  id="interest-rate"
                  type="number"
                  step="0.01"
                  value={liabilityData.interest_rate}
                  onChange={(e) => updateLiabilityData('interest_rate', e.target.value)}
                  placeholder="18.99"
                  className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="minimum-payment" className="dark:text-white">Minimum Payment</Label>
                <Input
                  id="minimum-payment"
                  type="number"
                  step="0.01"
                  value={liabilityData.minimum_payment}
                  onChange={(e) => updateLiabilityData('minimum_payment', e.target.value)}
                  placeholder="150"
                  className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={!liabilityData.name || !liabilityData.balance || isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? 'Saving...' : editingLiability ? 'Update Liability' : 'Add Liability'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-8 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LiabilityInputPopup;
