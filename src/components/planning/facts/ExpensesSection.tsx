
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Trash2, Plus, Edit2 } from 'lucide-react';
import TaxAssumptions from './TaxAssumptions';

interface Expense {
  id?: string;
  name: string;
  category: string;
  type: string;
  amount: number;
  frequency: string;
}

const ExpensesSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<Expense>({
    name: '',
    category: 'living',
    type: 'expense',
    amount: 0,
    frequency: 'monthly'
  });

  // Fetch expenses
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Save expense mutation
  const saveMutation = useMutation({
    mutationFn: async (expense: Expense) => {
      if (!user) throw new Error('User not authenticated');
      
      const payload = {
        ...expense,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (expense.id) {
        const { data, error } = await supabase
          .from('expenses')
          .update(payload)
          .eq('id', expense.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('expenses')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: editingExpense ? "Expense updated!" : "Expense added!" });
      handleCloseDialog();
    }
  });

  // Delete expense mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: "Expense deleted!" });
    }
  });

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      id: expense.id,
      name: expense.name,
      category: expense.category,
      type: expense.type,
      amount: expense.amount,
      frequency: expense.frequency
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingExpense(null);
    setFormData({
      name: '',
      category: 'living',
      type: 'expense',
      amount: 0,
      frequency: 'monthly'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getFrequencyDisplay = (frequency: string) => {
    const displays: Record<string, string> = {
      weekly: '/week',
      monthly: '/month',
      quarterly: '/quarter',
      annual: '/year'
    };
    return displays[frequency] || '/month';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading expenses...</div>
      </div>
    );
  }

  const totalMonthlyExpenses = expenses.reduce((total, expense) => {
    const multiplier = expense.frequency === 'weekly' ? 4.33 : 
                      expense.frequency === 'quarterly' ? 0.33 : 
                      expense.frequency === 'annual' ? 0.083 : 1;
    return total + (expense.amount * multiplier);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Expenses</h3>
          <p className="text-gray-600 dark:text-gray-300">Track your monthly expenses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Expense Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Rent, Groceries"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="living">Living</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="tax">Tax</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : editingExpense ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card className="dark:bg-gray-800/50 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg">Monthly Expense Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalMonthlyExpenses)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total estimated monthly expenses
          </p>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <Card className="dark:bg-gray-800/50 dark:border-gray-700/50">
            <CardContent className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No expenses added yet.</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Click "Add Expense" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id} className="dark:bg-gray-800/50 dark:border-gray-700/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">{expense.name}</h4>
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                        {expense.category}
                      </span>
                      {expense.type === 'tax' && (
                        <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                          Tax
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-semibold text-green-600 mt-1">
                      {formatCurrency(expense.amount)}{getFrequencyDisplay(expense.frequency)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(expense)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(expense.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <TaxAssumptions />
    </div>
  );
};

export default ExpensesSection;
