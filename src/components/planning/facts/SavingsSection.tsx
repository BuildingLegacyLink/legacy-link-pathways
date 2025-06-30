
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

const SavingsSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSaving, setNewSaving] = useState({
    name: '',
    goal_id: 'none',
    amount: '',
    frequency: 'monthly',
    destination_asset_id: 'none'
  });
  const [editData, setEditData] = useState({
    name: '',
    goal_id: 'none',
    amount: '',
    frequency: 'monthly',
    destination_asset_id: 'none'
  });

  const { data: savings = [], isLoading: savingsLoading } = useQuery({
    queryKey: ['savings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('savings')
        .select('*, goals(name), assets(name, type)')
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

  const { data: assets = [] } = useQuery({
    queryKey: ['assets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .not('type', 'in', '(real_estate,vehicle,other)')
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
          goal_id: saving.goal_id === 'none' ? null : saving.goal_id,
          destination_asset_id: saving.destination_asset_id === 'none' ? null : saving.destination_asset_id
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      setNewSaving({
        name: '',
        goal_id: 'none',
        amount: '',
        frequency: 'monthly',
        destination_asset_id: 'none'
      });
      setIsAdding(false);
      toast({ title: 'Success', description: 'Savings contribution added successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to add savings: ' + error.message, variant: 'destructive' });
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
      toast({ title: 'Success', description: 'Savings contribution deleted successfully!' });
    }
  });

  const updateSavingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof editData }) => {
      const { error } = await supabase
        .from('savings')
        .update({ 
          ...data, 
          amount: parseFloat(data.amount),
          goal_id: data.goal_id === 'none' ? null : data.goal_id,
          destination_asset_id: data.destination_asset_id === 'none' ? null : data.destination_asset_id
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      setEditingId(null);
      toast({ title: 'Success', description: 'Savings contribution updated successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update savings: ' + error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSaving.name || !newSaving.amount) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    addSavingMutation.mutate(newSaving);
  };

  const totalSavings = savings.reduce((sum, saving) => sum + saving.amount, 0);

  const handleEdit = (saving: any) => {
    setEditingId(saving.id);
    setEditData({
      name: saving.name,
      goal_id: saving.goal_id || 'none',
      amount: saving.amount.toString(),
      frequency: saving.frequency,
      destination_asset_id: saving.destination_asset_id || 'none'
    });
  };

  const handleUpdate = (id: string) => {
    if (!editData.name || !editData.amount) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    updateSavingMutation.mutate({ id, data: editData });
  };

  if (savingsLoading) {
    return <div className="text-gray-600 dark:text-gray-300">Loading savings data...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Savings</h3>
      
      <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50">
        <CardHeader>
          <CardTitle className="text-lg flex justify-between items-center text-gray-900 dark:text-white">
            Savings Contributions
            <span className="text-green-600">Total: {formatCurrency(totalSavings)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {savings.map((saving) => (
              <div key={saving.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {editingId === saving.id ? (
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
                        <Label className="text-gray-900 dark:text-white">Goal</Label>
                        <Select value={editData.goal_id} onValueChange={(value) => setEditData({ ...editData, goal_id: value })}>
                          <SelectTrigger className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                            <SelectItem value="none" className="dark:text-white">No specific goal</SelectItem>
                            {goals.map((goal) => (
                              <SelectItem key={goal.id} value={goal.id} className="dark:text-white">
                                {goal.name}
                              </SelectItem>
                            ))}
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
                      <div className="md:col-span-2">
                        <Label className="text-gray-900 dark:text-white">Saving To</Label>
                        <Select value={editData.destination_asset_id} onValueChange={(value) => setEditData({ ...editData, destination_asset_id: value })}>
                          <SelectTrigger className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                            <SelectItem value="none" className="dark:text-white">No specific account</SelectItem>
                            {assets.map((asset) => (
                              <SelectItem key={asset.id} value={asset.id} className="dark:text-white">
                                {asset.name} – {asset.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdate(saving.id)}
                        disabled={updateSavingMutation.isPending}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {updateSavingMutation.isPending ? 'Saving...' : 'Save'}
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
                      <div className="font-medium text-gray-900 dark:text-white">{saving.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {formatCurrency(saving.amount)} {saving.frequency}
                        {saving.goals && (
                          <span className="ml-2 text-blue-600 dark:text-blue-400">→ {saving.goals.name}</span>
                        )}
                        {saving.assets && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ↳ Saved to: {saving.assets.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(saving)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSavingMutation.mutate(saving.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {savings.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No savings contributions yet. Add one to get started!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add New Saving Section */}
      <div className="space-y-4">
        {!isAdding ? (
          <Button 
            onClick={() => setIsAdding(true)} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Savings Contribution
          </Button>
        ) : (
          <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Add New Savings Contribution</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-900 dark:text-white">Account/Contribution Name</Label>
                    <Input
                      id="name"
                      value={newSaving.name}
                      onChange={(e) => setNewSaving({ ...newSaving, name: e.target.value })}
                      placeholder="e.g., 401k, Roth IRA, Emergency Fund"
                      required
                      className="dark:bg-gray-700/50 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal_id" className="text-gray-900 dark:text-white">Linked Goal (Optional)</Label>
                    <Select value={newSaving.goal_id} onValueChange={(value) => setNewSaving({ ...newSaving, goal_id: value })}>
                      <SelectTrigger className="dark:bg-gray-700/50 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Select a goal..." />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                        <SelectItem value="none" className="dark:text-white dark:hover:bg-gray-700">No specific goal</SelectItem>
                        {goals.map((goal) => (
                          <SelectItem key={goal.id} value={goal.id} className="dark:text-white dark:hover:bg-gray-700">
                            {goal.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount" className="text-gray-900 dark:text-white">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="1"
                      value={newSaving.amount}
                      onChange={(e) => setNewSaving({ ...newSaving, amount: e.target.value })}
                      placeholder="500"
                      required
                      className="dark:bg-gray-700/50 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency" className="text-gray-900 dark:text-white">Frequency</Label>
                    <Select value={newSaving.frequency} onValueChange={(value) => setNewSaving({ ...newSaving, frequency: value })}>
                      <SelectTrigger className="dark:bg-gray-700/50 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                        <SelectItem value="weekly" className="dark:text-white dark:hover:bg-gray-700">Weekly</SelectItem>
                        <SelectItem value="monthly" className="dark:text-white dark:hover:bg-gray-700">Monthly</SelectItem>
                        <SelectItem value="annual" className="dark:text-white dark:hover:bg-gray-700">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="destination_asset_id" className="text-gray-900 dark:text-white">Saving To</Label>
                    <Select value={newSaving.destination_asset_id} onValueChange={(value) => setNewSaving({ ...newSaving, destination_asset_id: value })}>
                      <SelectTrigger className="dark:bg-gray-700/50 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Select an account..." />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                        <SelectItem value="none" className="dark:text-white dark:hover:bg-gray-700">No specific account</SelectItem>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id} className="dark:text-white dark:hover:bg-gray-700">
                            {asset.name} – {asset.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={addSavingMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {addSavingMutation.isPending ? 'Adding...' : 'Add Savings'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAdding(false)}
                    className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                  >
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
