
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const GoalsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase.from('goals').select('*').order('priority', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      const { data, error } = await supabase.from('goals').insert(goalData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsDialogOpen(false);
      toast({ title: 'Success', description: 'Goal added successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to add goal: ' + error.message, variant: 'destructive' });
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
      user_id: (await supabase.auth.getUser()).data.user?.id,
    };

    addGoalMutation.mutate(goalData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) return <div>Loading goals...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Financial Goals</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Financial Goal</DialogTitle>
              <DialogDescription>
                Set a new financial goal to track your progress.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  name="name"
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
                  step="0.01"
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
                  defaultValue="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="6 months of living expenses"
                />
              </div>
              <Button type="submit" className="w-full" disabled={addGoalMutation.isPending}>
                {addGoalMutation.isPending ? 'Adding...' : 'Add Goal'}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGoalMutation.mutate(goal.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
