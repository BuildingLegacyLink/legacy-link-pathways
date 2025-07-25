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
  growth_rate?: number;
}

const ExpensesSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<Expense>({
    name: '',
    category: 'essential',
    type: 'expense',
    amount: 0,
    frequency: 'monthly',
    growth_rate: 3.0 // Default inflation rate of 3%
  });
  const [amountInput, setAmountInput] = useState('');
  const [growthRateInput, setGrowthRateInput] = useState('3.0');

  // Common expense names grouped by category
  const commonExpenses = {
    essential: [
      'Rent/Mortgage',
      'Utilities (Electric)',
      'Utilities (Water)',
      'Utilities (Gas)',
      'Utilities (Internet)',
      'Phone Bill',
      'Insurance (Health)',
      'Insurance (Auto)',
      'Insurance (Home/Renters)',
      'Transportation (Gas)',
      'Transportation (Public)',
      'Car Payment',
      'Student Loans',
      'Childcare',
      'Healthcare/Medical'
    ],
    discretionary: [
      'Food (Groceries)',
      'Food (Dining Out)',
      'Entertainment',
      'Subscriptions (Netflix, etc)',
      'Gym Membership',
      'Shopping (Clothing)',
      'Shopping (General)',
      'Hobbies',
      'Travel',
      'Personal Care',
      'Gifts',
      'Charity/Donations'
    ]
  };

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
      frequency: expense.frequency,
      growth_rate: expense.growth_rate || 3.0
    });
    setAmountInput(expense.amount.toString());
    setGrowthRateInput((expense.growth_rate || 3.0).toString());
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingExpense(null);
    setFormData({
      name: '',
      category: 'essential',
      type: 'expense',
      amount: 0,
      frequency: 'monthly',
      growth_rate: 3.0
    });
    setAmountInput('');
    setGrowthRateInput('3.0');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountInput) || 0;
    const growthRate = parseFloat(growthRateInput) || 3.0;
    saveMutation.mutate({ ...formData, amount, growth_rate: growthRate });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountInput(e.target.value);
  };

  const handleGrowthRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGrowthRateInput(e.target.value);
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

  const renderExpenseItem = (expense: any) => (
    <div key={expense.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{expense.name}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {formatCurrency(expense.amount)} {getFrequencyDisplay(expense.frequency)}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(expense)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteMutation.mutate(expense.id)}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="text-gray-600 dark:text-gray-300">Loading expenses data...</div>;
  }

  // Categorize expenses
  const essentialExpenses = expenses.filter(expense => expense.category === 'essential');
  const discretionaryExpenses = expenses.filter(expense => expense.category === 'discretionary');

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Expenses</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Essential Expenses */}
          <Card className="dark:bg-gray-800/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white">Essential Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {essentialExpenses.map(renderExpenseItem)}
                {essentialExpenses.length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No essential expenses added yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Discretionary Expenses */}
          <Card className="dark:bg-gray-800/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white">Discretionary Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {discretionaryExpenses.map(renderExpenseItem)}
                {discretionaryExpenses.length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No discretionary expenses added yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add New Expense */}
        <div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="essential">Essential</SelectItem>
                      <SelectItem value="discretionary">Discretionary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="common-expense">Common Expense (Optional)</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, name: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a common expense or type your own below" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {commonExpenses[formData.category as keyof typeof commonExpenses].map((expenseName) => (
                        <SelectItem key={expenseName} value={expenseName}>
                          {expenseName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={amountInput}
                      onChange={handleAmountChange}
                      placeholder="0.00"
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

                <div className="space-y-2">
                  <Label htmlFor="growth-rate">Annual Growth Rate (%)</Label>
                  <Input
                    id="growth-rate"
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={growthRateInput}
                    onChange={handleGrowthRateChange}
                    placeholder="3.0"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Default is 3% (typical inflation rate). This helps project how expenses will grow over time.
                  </p>
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
      </div>

      {/* Tax Section */}
      <div className="border-t pt-8">
        <TaxAssumptions />
      </div>
    </div>
  );
};

export default ExpensesSection;
