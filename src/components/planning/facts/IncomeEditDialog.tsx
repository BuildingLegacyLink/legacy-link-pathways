
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface IncomeEditDialogProps {
  income: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const IncomeEditDialog = ({ income, open, onOpenChange }: IncomeEditDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [editData, setEditData] = useState({
    name: income?.name || '',
    type: income?.type || 'salary',
    amount: income?.amount?.toString() || '',
    frequency: income?.frequency || 'monthly',
    start_date: income?.start_date || '',
    end_date: income?.end_date || '',
    is_current: income?.is_current ?? true,
    start_date_type: income?.start_date_type || 'none',
    start_date_value: income?.start_date_value,
    end_date_type: income?.end_date_type || 'none',
    end_date_value: income?.end_date_value
  });

  // Fetch user profile for first name
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const firstName = profile?.first_name || 'User';

  // Generate year options (current year + 50 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 51 }, (_, i) => currentYear + i);

  // Generate age options (current age to 100)
  const ageOptions = Array.from({ length: 71 }, (_, i) => 30 + i);

  const updateIncomeMutation = useMutation({
    mutationFn: async (data: typeof editData) => {
      const { error } = await supabase
        .from('income')
        .update({ 
          ...data, 
          amount: parseFloat(data.amount),
          start_date: data.start_date || null,
          end_date: data.end_date || null
        })
        .eq('id', income.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      onOpenChange(false);
      toast({ title: 'Success', description: 'Income updated successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update income: ' + error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData.name || !editData.amount) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    updateIncomeMutation.mutate(editData);
  };

  const renderDateDropdowns = (
    dateType: string,
    dateValue: number | null,
    onDateTypeChange: (value: string) => void,
    onDateValueChange: (value: number | null) => void,
    label: string
  ) => (
    <div className="space-y-2">
      <Label className="text-gray-900 dark:text-white">{label}</Label>
      <Select value={dateType} onValueChange={onDateTypeChange}>
        <SelectTrigger className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
          <SelectItem value="none" className="dark:text-white">Not Set</SelectItem>
          <SelectItem value="retirement" className="dark:text-white">At {firstName}'s Retirement</SelectItem>
          <SelectItem value="death" className="dark:text-white">At {firstName}'s Death</SelectItem>
          <SelectItem value="calendar_year" className="dark:text-white">Calendar Year</SelectItem>
          <SelectItem value="age" className="dark:text-white">At Age</SelectItem>
        </SelectContent>
      </Select>
      
      {dateType === 'calendar_year' && (
        <Select value={dateValue?.toString() || ''} onValueChange={(value) => onDateValueChange(value ? parseInt(value) : null)}>
          <SelectTrigger className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
            {yearOptions.map(year => (
              <SelectItem key={year} value={year.toString()} className="dark:text-white">{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {dateType === 'age' && (
        <Select value={dateValue?.toString() || ''} onValueChange={(value) => onDateValueChange(value ? parseInt(value) : null)}>
          <SelectTrigger className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white">
            <SelectValue placeholder="Select age" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
            {ageOptions.map(age => (
              <SelectItem key={age} value={age.toString()} className="dark:text-white">{age}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Edit Income</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-900 dark:text-white">Name</Label>
              <Input
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
                required
              />
            </div>
            <div>
              <Label className="text-gray-900 dark:text-white">Type</Label>
              <Select value={editData.type} onValueChange={(value) => setEditData({ ...editData, type: value })}>
                <SelectTrigger className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                  <SelectItem value="salary" className="dark:text-white">Salary</SelectItem>
                  <SelectItem value="bonus" className="dark:text-white">Bonus</SelectItem>
                  <SelectItem value="rental" className="dark:text-white">Rental Income</SelectItem>
                  <SelectItem value="business" className="dark:text-white">Business Income</SelectItem>
                  <SelectItem value="investment" className="dark:text-white">Investment Income</SelectItem>
                  <SelectItem value="social_security" className="dark:text-white">Social Security</SelectItem>
                  <SelectItem value="pension" className="dark:text-white">Pension</SelectItem>
                  <SelectItem value="other" className="dark:text-white">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-900 dark:text-white">Amount ($)</Label>
              <Input
                type="number"
                value={editData.amount}
                onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
                required
              />
            </div>
            <div>
              <Label className="text-gray-900 dark:text-white">Frequency</Label>
              <Select value={editData.frequency} onValueChange={(value) => setEditData({ ...editData, frequency: value })}>
                <SelectTrigger className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                  <SelectItem value="weekly" className="dark:text-white">Weekly</SelectItem>
                  <SelectItem value="monthly" className="dark:text-white">Monthly</SelectItem>
                  <SelectItem value="annual" className="dark:text-white">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderDateDropdowns(
              editData.start_date_type,
              editData.start_date_value,
              (value) => setEditData({ ...editData, start_date_type: value }),
              (value) => setEditData({ ...editData, start_date_value: value }),
              'Start Date'
            )}
            
            {renderDateDropdowns(
              editData.end_date_type,
              editData.end_date_value,
              (value) => setEditData({ ...editData, end_date_type: value }),
              (value) => setEditData({ ...editData, end_date_value: value }),
              'End Date'
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="is_current_edit"
              checked={editData.is_current}
              onChange={(e) => setEditData({ ...editData, is_current: e.target.checked })}
              className="dark:bg-gray-600"
            />
            <Label htmlFor="is_current_edit" className="text-gray-900 dark:text-white">Current Income</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={updateIncomeMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {updateIncomeMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IncomeEditDialog;
