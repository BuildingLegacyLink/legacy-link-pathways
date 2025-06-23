
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const NetWorthSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [isAddingLiability, setIsAddingLiability] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', type: 'checking', value: '' });
  const [newLiability, setNewLiability] = useState({ 
    name: '', 
    type: 'credit_card', 
    balance: '', 
    interest_rate: '', 
    minimum_payment: '' 
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['assets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: liabilities = [], isLoading: liabilitiesLoading } = useQuery({
    queryKey: ['liabilities', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const addAssetMutation = useMutation({
    mutationFn: async (asset: typeof newAsset) => {
      if (!user) throw new Error('No user');
      const { error } = await supabase
        .from('assets')
        .insert([{ ...asset, user_id: user.id, value: parseFloat(asset.value) }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setNewAsset({ name: '', type: 'checking', value: '' });
      setIsAddingAsset(false);
      toast({ title: 'Success', description: 'Asset added successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to add asset: ' + error.message, variant: 'destructive' });
    }
  });

  const addLiabilityMutation = useMutation({
    mutationFn: async (liability: typeof newLiability) => {
      if (!user) throw new Error('No user');
      const { error } = await supabase
        .from('liabilities')
        .insert([{ 
          ...liability, 
          user_id: user.id, 
          balance: parseFloat(liability.balance),
          interest_rate: liability.interest_rate ? parseFloat(liability.interest_rate) : 0,
          minimum_payment: liability.minimum_payment ? parseFloat(liability.minimum_payment) : 0
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      setNewLiability({ 
        name: '', 
        type: 'credit_card', 
        balance: '', 
        interest_rate: '', 
        minimum_payment: '' 
      });
      setIsAddingLiability(false);
      toast({ title: 'Success', description: 'Liability added successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to add liability: ' + error.message, variant: 'destructive' });
    }
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('assets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({ title: 'Success', description: 'Asset deleted successfully!' });
    }
  });

  const deleteLiabilityMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('liabilities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      toast({ title: 'Success', description: 'Liability deleted successfully!' });
    }
  });

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.value) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    addAssetMutation.mutate(newAsset);
  };

  const handleLiabilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLiability.name || !newLiability.balance) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    addLiabilityMutation.mutate(newLiability);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.balance, 0);
  const netWorth = totalAssets - totalLiabilities;

  if (assetsLoading || liabilitiesLoading) {
    return <div>Loading net worth data...</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Net Worth</h3>
      
      {/* Net Worth Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">
            <div className="text-3xl font-bold mb-2">
              <span className={netWorth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(netWorth)}
              </span>
            </div>
            <div className="text-lg text-gray-600">Net Worth</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xl font-semibold text-green-600">
                {formatCurrency(totalAssets)}
              </div>
              <div className="text-sm text-gray-600">Total Assets</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-red-600">
                {formatCurrency(totalLiabilities)}
              </div>
              <div className="text-sm text-gray-600">Total Liabilities</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Assets</CardTitle>
              <Button 
                onClick={() => setIsAddingAsset(true)} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Asset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {asset.type} • {formatCurrency(asset.value)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAssetMutation.mutate(asset.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {assets.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No assets added yet
                </div>
              )}

              {isAddingAsset && (
                <Card className="mt-4">
                  <CardContent className="pt-4">
                    <form onSubmit={handleAssetSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="asset-name">Asset Name</Label>
                        <Input
                          id="asset-name"
                          value={newAsset.name}
                          onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                          placeholder="e.g., Checking Account"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="asset-type">Type</Label>
                        <Select value={newAsset.type} onValueChange={(value) => setNewAsset({ ...newAsset, type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="checking">Checking Account</SelectItem>
                            <SelectItem value="savings">Savings Account</SelectItem>
                            <SelectItem value="investment">Investment Account</SelectItem>
                            <SelectItem value="retirement">Retirement Account</SelectItem>
                            <SelectItem value="real_estate">Real Estate</SelectItem>
                            <SelectItem value="vehicle">Vehicle</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="asset-value">Value</Label>
                        <Input
                          id="asset-value"
                          type="number"
                          step="1"
                          value={newAsset.value}
                          onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                          placeholder="25000"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={addAssetMutation.isPending}>
                          {addAssetMutation.isPending ? 'Adding...' : 'Add Asset'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsAddingAsset(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Liabilities */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Liabilities</CardTitle>
              <Button 
                onClick={() => setIsAddingLiability(true)} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Liability
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {liabilities.map((liability) => (
                <div key={liability.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{liability.name}</div>
                    <div className="text-sm text-gray-600">
                      {liability.type.replace('_', ' ')} • {formatCurrency(liability.balance)}
                      {liability.interest_rate > 0 && (
                        <span className="ml-1">@ {liability.interest_rate}%</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteLiabilityMutation.mutate(liability.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {liabilities.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No liabilities added yet
                </div>
              )}

              {isAddingLiability && (
                <Card className="mt-4">
                  <CardContent className="pt-4">
                    <form onSubmit={handleLiabilitySubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="liability-name">Liability Name</Label>
                        <Input
                          id="liability-name"
                          value={newLiability.name}
                          onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })}
                          placeholder="e.g., Credit Card"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="liability-type">Type</Label>
                        <Select value={newLiability.type} onValueChange={(value) => setNewLiability({ ...newLiability, type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="credit_card">Credit Card</SelectItem>
                            <SelectItem value="mortgage">Mortgage</SelectItem>
                            <SelectItem value="student_loan">Student Loan</SelectItem>
                            <SelectItem value="auto_loan">Auto Loan</SelectItem>
                            <SelectItem value="personal_loan">Personal Loan</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="liability-balance">Balance</Label>
                        <Input
                          id="liability-balance"
                          type="number"
                          step="1"
                          value={newLiability.balance}
                          onChange={(e) => setNewLiability({ ...newLiability, balance: e.target.value })}
                          placeholder="5000"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                        <Input
                          id="interest-rate"
                          type="number"
                          step="0.01"
                          value={newLiability.interest_rate}
                          onChange={(e) => setNewLiability({ ...newLiability, interest_rate: e.target.value })}
                          placeholder="18.99"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={addLiabilityMutation.isPending}>
                          {addLiabilityMutation.isPending ? 'Adding...' : 'Add Liability'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsAddingLiability(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetWorthSection;
