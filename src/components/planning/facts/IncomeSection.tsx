import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/currency';
import IncomeEditDialog from './IncomeEditDialog';

const IncomeSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [newIncome, setNewIncome] = useState({
    name: '',
    type: 'salary',
    amount: '',
    frequency: 'monthly',
    start_date: '',
    end_date: '',
    start_date_type: 'none',
    start_date_value: null as number | null,
    end_date_type: 'none',
    end_date_value: null as number | null
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, date_of_birth, retirement_age')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const firstName = profile?.first_name || 'User';

  // Calculate current age
  const getCurrentAge = () => {
    if (!profile?.date_of_birth) return 25; // Default age assumption
    const today = new Date();
    const birthDate = new Date(profile.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Logic to determine if income is current
  const determineIsCurrentIncome = (incomeData: typeof newIncome) => {
    const currentYear = new Date().getFullYear();
    const currentAge = getCurrentAge();
    const retirementAge = profile?.retirement_age || 67;

    // If no start date is set, assume it's current
    if (incomeData.start_date_type === 'none') {
      return true;
    }

    // Check start date conditions
    let hasStarted = true;
    switch (incomeData.start_date_type) {
      case 'calendar_year':
        hasStarted = incomeData.start_date_value ? currentYear >= incomeData.start_date_value : true;
        break;
      case 'age':
        hasStarted = incomeData.start_date_value ? currentAge >= incomeData.start_date_value : true;
        break;
      case 'retirement':
        hasStarted = currentAge >= retirementAge;
        break;
      case 'death':
        hasStarted = false; // Income starting at death is never current
        break;
    }

    // Check end date conditions
    let hasEnded = false;
    if (incomeData.end_date_type !== 'none') {
      switch (incomeData.end_date_type) {
        case 'calendar_year':
          hasEnded = incomeData.end_date_value ? currentYear > incomeData.end_date_value : false;
          break;
        case 'age':
          hasEnded = incomeData.end_date_value ? currentAge > incomeData.end_date_value : false;
          break;
        case 'retirement':
          hasEnded = currentAge > retirementAge;
          break;
        case 'death':
          hasEnded = false; // Income ending at death is still current until death
          break;
      }
    }

    return hasStarted && !hasEnded;
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 51 }, (_, i) => currentYear + i);

  const currentAge = getCurrentAge();
  const ageOptions = Array.from({ length: 71 }, (_, i) => Math.max(currentAge, 30) + i);

  const { data: incomes = [], isLoading } = useQuery({
    queryKey: ['income', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const addIncomeMutation = useMutation({
    mutationFn: async (income: typeof newIncome) => {
      if (!user) throw new Error('No user');
      const isCurrentIncome = determineIsCurrentIncome(income);
      
      const { error } = await supabase
        .from('income')
        .insert([{ 
          ...income, 
          user_id: user.id, 
          amount: parseFloat(income.amount),
          start_date: income.start_date || null,
          end_date: income.end_date || null,
          is_current: isCurrentIncome
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      setNewIncome({
        name: '',
        type: 'salary',
        amount: '',
        frequency: 'monthly',
        start_date: '',
        end_date: '',
        start_date_type: 'none',
        start_date_value: null,
        end_date_type: 'none',
        end_date_value: null
      });
      setIsAdding(false);
      toast({ title: 'Success', description: 'Income added successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to add income: ' + error.message, variant: 'destructive' });
    }
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      toast({ title: 'Success', description: 'Income deleted successfully!' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncome.name || !newIncome.amount) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    addIncomeMutation.mutate(newIncome);
  };

  const currentIncomes = incomes.filter(income => income.is_current);
  const futureIncomes = incomes.filter(income => !income.is_current);

  const formatDateDescription = (dateType: string, dateValue: number | null) => {
    switch (dateType) {
      case 'retirement':
        return `At ${firstName}'s Retirement`;
      case 'death':
        return `At ${firstName}'s Death`;
      case 'calendar_year':
        return dateValue ? `Year ${dateValue}` : 'Calendar Year';
      case 'age':
        return dateValue ? `At Age ${dateValue}` : 'At Age';
      default:
        return 'Not Set';
    }
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

  const renderIncomeItem = (income: any) => (
    <div key={income.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{income.name}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {formatCurrency(income.amount)} {income.frequency}
          </div>
          {(income.start_date_type && income.start_date_type !== 'none') && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Starts: {formatDateDescription(income.start_date_type, income.start_date_value)}
            </div>
          )}
          {(income.end_date_type && income.end_date_type !== 'none') && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Ends: {formatDateDescription(income.end_date_type, income.end_date_value)}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingIncome(income)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteIncomeMutation.mutate(income.id)}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="text-gray-600 dark:text-gray-300">Loading income data...</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Income</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Income */}
        <Card className="dark:bg-gray-800/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Current Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentIncomes.map(renderIncomeItem)}
              {currentIncomes.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No current income entries
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Future Income */}
        <Card className="dark:bg-gray-800/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Future Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {futureIncomes.map(renderIncomeItem)}
              {futureIncomes.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No future income entries
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Income */}
      <div className="mt-6">
        {!isAdding ? (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Income Source
          </Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Add New Income</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Income Name</Label>
                    <Input
                      id="name"
                      value={newIncome.name}
                      onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })}
                      placeholder="e.g., Salary, Bonus"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={newIncome.type} onValueChange={(value) => setNewIncome({ ...newIncome, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salary">Salary</SelectItem>
                        <SelectItem value="bonus">Bonus</SelectItem>
                        <SelectItem value="rental">Rental Income</SelectItem>
                        <SelectItem value="business">Business Income</SelectItem>
                        <SelectItem value="investment">Investment Income</SelectItem>
                        <SelectItem value="social_security">Social Security</SelectItem>
                        <SelectItem value="pension">Pension</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="1"
                      value={newIncome.amount}
                      onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                      placeholder="5000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={newIncome.frequency} onValueChange={(value) => setNewIncome({ ...newIncome, frequency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderDateDropdowns(
                    newIncome.start_date_type,
                    newIncome.start_date_value,
                    (value) => setNewIncome({ ...newIncome, start_date_type: value }),
                    (value) => setNewIncome({ ...newIncome, start_date_value: value }),
                    'Start Date'
                  )}
                  
                  {renderDateDropdowns(
                    newIncome.end_date_type,
                    newIncome.end_date_value,
                    (value) => setNewIncome({ ...newIncome, end_date_type: value }),
                    (value) => setNewIncome({ ...newIncome, end_date_value: value }),
                    'End Date'
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={addIncomeMutation.isPending}>
                    {addIncomeMutation.isPending ? 'Adding...' : 'Add Income'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Income Dialog */}
      <IncomeEditDialog 
        income={editingIncome}
        open={!!editingIncome}
        onOpenChange={(open) => !open && setEditingIncome(null)}
      />
    </div>
  );
};

export default IncomeSection;
