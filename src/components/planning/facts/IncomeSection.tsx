
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const IncomeSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newIncome, setNewIncome] = useState({
    name: '',
    type: 'salary',
    amount: '',
    frequency: 'monthly',
    start_date: '',
    end_date: '',
    is_current: true
  });

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
      const { error } = await supabase
        .from('income')
        .insert([{ 
          ...income, 
          user_id: user.id, 
          amount: parseFloat(income.amount),
          start_date: income.start_date || null,
          end_date: income.end_date || null
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
        is_current: true
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const currentIncomes = incomes.filter(income => income.is_current);
  const futureIncomes = incomes.filter(income => !income.is_current);

  if (isLoading) {
    return <div>Loading income data...</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Income</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Income */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentIncomes.map((income) => (
                <div key={income.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{income.name}</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(income.amount)} {income.frequency}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteIncomeMutation.mutate(income.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {currentIncomes.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No current income entries
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Future Income */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Future Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {futureIncomes.map((income) => (
                <div key={income.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{income.name}</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(income.amount)} {income.frequency}
                    </div>
                    {income.start_date && (
                      <div className="text-xs text-gray-500">
                        Starts: {new Date(income.start_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteIncomeMutation.mutate(income.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {futureIncomes.length === 0 && (
                <div className="text-center py-4 text-gray-500">
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
                    <Label htmlFor="amount">Amount</Label>
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
                
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="is_current"
                    checked={newIncome.is_current}
                    onChange={(e) => setNewIncome({ ...newIncome, is_current: e.target.checked })}
                  />
                  <Label htmlFor="is_current">Current Income</Label>
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
    </div>
  );
};

export default IncomeSection;
