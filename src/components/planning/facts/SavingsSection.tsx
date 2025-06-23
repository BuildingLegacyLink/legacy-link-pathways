
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

const SavingsSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newSaving, setNewSaving] = useState({
    name: '',
    goal_id: '',
    amount: '',
    frequency: 'monthly'
  });

  const { data: savings = [], isLoading: savingsLoading } = useQuery({
    queryKey: ['savings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('savings')
        .select('*, goals(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const addSavingMutation = useMutation({
    mutationFn: async (saving: typeof newSaving) => {
      if (!user) throw new Error('No user');
      const { error } = await supabase
        .from('savings')
        .insert([{ 
          ...saving, 
          user_id: user.id, 
          amount: parseFloat(saving.amount),
          goal_id: saving.goal_id || null
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      setNewSaving({
        name: '',
        goal_id: '',
        amount: '',
        frequency: 'monthly'
      });
      setIsAdding(false);
    }
  });

  const deleteSavingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('savings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSaving.name || !newSaving.amount) return;
    addSavingMutation.mutate(newSaving);
  };

  const totalSavings = savings.reduce((sum, saving) => sum + saving.amount, 0);

  if (savingsLoading) {
    return <div>Loading savings data...</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Savings</h3>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex justify-between">
            Monthly Savings Contributions
            <span className="text-green-600">${totalSavings.toLocaleString()}/month</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {savings.map((saving) => (
              <div key={saving.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{saving.name}</div>
                  <div className="text-sm text-gray-600">
                    ${saving.amount.toLocaleString()} {saving.frequency}
                    {saving.goals && (
                      <span className="ml-2 text-blue-600">→ {saving.goals.name}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSavingMutation.mutate(saving.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {savings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No savings contributions yet. Add one to get started!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add New Saving */}
      <div>
        {!isAdding ? (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Savings Contribution
          </Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Add New Savings Contribution</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Contribution Name</Label>
                    <Input
                      id="name"
                      value={newSaving.name}
                      onChange={(e) => setNewSaving({ ...newSaving, name: e.target.value })}
                      placeholder="e.g., 401k, Emergency Fund"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal_id">Linked Goal (Optional)</Label>
                    <Select value={newSaving.goal_id} onValueChange={(value) => setNewSaving({ ...newSaving, goal_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No specific goal</SelectItem>
                        {goals.map((goal) => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newSaving.amount}
                      onChange={(e) => setNewSaving({ ...newSaving, amount: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={newSaving.frequency} onValueChange={(value) => setNewSaving({ ...newSaving, frequency: value })}>
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

                <div className="flex gap-2">
                  <Button type="submit" disabled={addSavingMutation.isPending}>
                    {addSavingMutation.isPending ? 'Adding...' : 'Add Savings'}
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

export default SavingsSection;
