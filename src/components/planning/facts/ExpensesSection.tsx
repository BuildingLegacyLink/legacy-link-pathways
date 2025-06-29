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

const ExpensesSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    name: '',
    category: 'housing',
    type: 'essential',
    amount: '',
    frequency: 'monthly'
  });
  const [editData, setEditData] = useState({
    name: '',
    category: 'housing',
    type: 'essential',
    amount: '',
    frequency: 'monthly'
  });

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

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: typeof newExpense) => {
      if (!user) throw new Error('No user');
      const { error } = await supabase
        .from('expenses')
        .insert([{ ...expense, user_id: user.id, amount: parseFloat(expense.amount) }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setNewExpense({
        name: '',
        category: 'housing',
        type: 'essential',
        amount: '',
        frequency: 'monthly'
      });
      setIsAdding(false);
      toast({ title: 'Success', description: 'Expense added successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to add expense: ' + error.message, variant: 'destructive' });
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: 'Success', description: 'Expense deleted successfully!' });
    }
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof editData }) => {
      const { error } = await supabase
        .from('expenses')
        .update({ ...data, amount: parseFloat(data.amount) })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setEditingId(null);
      toast({ title: 'Success', description: 'Expense updated successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update expense: ' + error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.name || !newExpense.amount) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    addExpenseMutation.mutate(newExpense);
  };

  const handleEdit = (expense: any) => {
    setEditingId(expense.id);
    setEditData({
      name: expense.name,
      category: expense.category,
      type: expense.type,
      amount: expense.amount.toString(),
      frequency: expense.frequency
    });
  };

  const handleUpdate = (id: string) => {
    if (!editData.name || !editData.amount) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    updateExpenseMutation.mutate({ id, data: editData });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const essentialExpenses = expenses.filter(expense => expense.type === 'essential');
  const discretionaryExpenses = expenses.filter(expense => expense.type === 'discretionary');

  const totalEssential = essentialExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalDiscretionary = discretionaryExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const renderExpenseItem = (expense: any) => (
    <div key={expense.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      {editingId === expense.id ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-900 dark:text-white">Name</Label>
              <Input
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
              />
            </div>
            <div>
              <Label className="text-gray-900 dark:text-white">Category</Label>
              <Select value={editData.category} onValueChange={(value) => setEditData({ ...editData, category: value })}>
                <SelectTrigger className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                  <SelectItem value="housing" className="dark:text-white">Housing</SelectItem>
                  <SelectItem value="food" className="dark:text-white">Food</SelectItem>
                  <SelectItem value="transportation" className="dark:text-white">Transportation</SelectItem>
                  <SelectItem value="utilities" className="dark:text-white">Utilities</SelectItem>
                  <SelectItem value="healthcare" className="dark:text-white">Healthcare</SelectItem>
                  <SelectItem value="insurance" className="dark:text-white">Insurance</SelectItem>
                  <SelectItem value="entertainment" className="dark:text-white">Entertainment</SelectItem>
                  <SelectItem value="shopping" className="dark:text-white">Shopping</SelectItem>
                  <SelectItem value="travel" className="dark:text-white">Travel</SelectItem>
                  <SelectItem value="education" className="dark:text-white">Education</SelectItem>
                  <SelectItem value="taxes" className="dark:text-white">Taxes</SelectItem>
                  <SelectItem value="other" className="dark:text-white">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-900 dark:text-white">Type</Label>
              <Select value={editData.type} onValueChange={(value) => setEditData({ ...editData, type: value })}>
                <SelectTrigger className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                  <SelectItem value="essential" className="dark:text-white">Essential</SelectItem>
                  <SelectItem value="discretionary" className="dark:text-white">Discretionary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-900 dark:text-white">Amount</Label>
              <Input
                type="number"
                value={editData.amount}
                onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleUpdate(expense.id)}
              disabled={updateExpenseMutation.isPending}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {updateExpenseMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => setEditingId(null)}
              variant="outline"
              size="sm"
              className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{expense.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
              {expense.category} • {formatCurrency(expense.amount)} {expense.frequency}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(expense)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteExpenseMutation.mutate(expense.id)}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return <div className="text-gray-600 dark:text-gray-300">Loading expenses data...</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Expenses & Taxes</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Essential Expenses */}
        <Card className="dark:bg-gray-800/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg flex justify-between text-gray-900 dark:text-white">
              Essential Expenses
              <span className="text-green-600">{formatCurrency(totalEssential)}/month</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {essentialExpenses.map(renderExpenseItem)}
              {essentialExpenses.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No essential expenses
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Discretionary Expenses */}
        <Card className="dark:bg-gray-800/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg flex justify-between text-gray-900 dark:text-white">
              Discretionary Expenses
              <span className="text-blue-600">{formatCurrency(totalDiscretionary)}/month</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {discretionaryExpenses.map(renderExpenseItem)}
              {discretionaryExpenses.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No discretionary expenses
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Expense */}
      <div className="mt-6">
        {!isAdding ? (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Expense Name</Label>
                    <Input
                      id="name"
                      value={newExpense.name}
                      onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                      placeholder="e.g., Rent, Groceries"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newExpense.category} onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="housing">Housing</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="taxes">Taxes</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={newExpense.type} onValueChange={(value) => setNewExpense({ ...newExpense, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="essential">Essential</SelectItem>
                        <SelectItem value="discretionary">Discretionary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="1"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="1500"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={addExpenseMutation.isPending}>
                    {addExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
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

export default ExpensesSection;
