
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const GoalsSection = () => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const addGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      if (!user) throw new Error('No user');
      const { data, error } = await supabase.from('goals').insert({ ...goalData, user_id: user.id });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsDialogOpen(false);
      setEditingGoal(null);
      toast({ title: 'Success', description: 'Goal saved successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to save goal: ' + error.message, variant: 'destructive' });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, ...goalData }: any) => {
      const { data, error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsDialogOpen(false);
      setEditingGoal(null);
      toast({ title: 'Success', description: 'Goal updated successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update goal: ' + error.message, variant: 'destructive' });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase.from('goals').delete().eq('id', goalId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Success', description: 'Goal deleted successfully!' });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const goalData = {
      name: formData.get('name') as string,
      target_amount: parseFloat(formData.get('target_amount') as string),
      target_date: formData.get('target_date') as string || null,
      priority: parseInt(formData.get('priority') as string) || 1,
      description: formData.get('description') as string || null,
    };

    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, ...goalData });
    } else {
      addGoalMutation.mutate(goalData);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const openEditDialog = (goal: any) => {
    setEditingGoal(goal);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingGoal(null);
    setIsDialogOpen(true);
  };

  if (isLoading) return <div>Loading goals...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Financial Goals</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Goal' : 'Add New Financial Goal'}</DialogTitle>
              <DialogDescription>
                {editingGoal ? 'Update your financial goal details.' : 'Set a new financial goal to track your progress.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingGoal?.name || ''}
                  placeholder="Emergency Fund"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_amount">Target Amount</Label>
                <Input
                  id="target_amount"
                  name="target_amount"
                  type="number"
                  step="1"
                  defaultValue={editingGoal?.target_amount || ''}
                  placeholder="50000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_date">Target Date</Label>
                <Input
                  id="target_date"
                  name="target_date"
                  type="date"
                  defaultValue={editingGoal?.target_date || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority (1-5)</Label>
                <Input
                  id="priority"
                  name="priority"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue={editingGoal?.priority || 1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingGoal?.description || ''}
                  placeholder="6 months of living expenses"
                />
              </div>
              <Button type="submit" className="w-full" disabled={addGoalMutation.isPending || updateGoalMutation.isPending}>
                {(addGoalMutation.isPending || updateGoalMutation.isPending) ? 'Saving...' : editingGoal ? 'Update Goal' : 'Add Goal'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals && goals.length > 0 ? (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(Number(goal.target_amount))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(goal)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoalMutation.mutate(goal.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {goal.description && (
                    <p className="text-gray-600">{goal.description}</p>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Priority: {goal.priority}</span>
                    {goal.target_date && (
                      <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">No financial goals set yet.</p>
            <p className="text-sm text-gray-400">Add your first goal to start tracking your financial progress.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoalsSection;
