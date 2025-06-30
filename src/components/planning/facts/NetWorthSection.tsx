import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import AssetGrowthInput from './AssetGrowthInput';

const NetWorthSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [isAddingLiability, setIsAddingLiability] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editingLiabilityId, setEditingLiabilityId] = useState<string | null>(null);
  const [newAsset, setNewAsset] = useState({ 
    name: '', 
    type: 'checking', 
    value: '',
    growth_method: 'manual',
    growth_rate: 0.06,
    holdings: []
  });
  const [newLiability, setNewLiability] = useState({ 
    name: '', 
    type: 'credit_card', 
    balance: '', 
    interest_rate: '', 
    minimum_payment: '' 
  });
  const [editAssetData, setEditAssetData] = useState({ 
    name: '', 
    type: 'checking', 
    value: '',
    growth_method: 'manual',
    growth_rate: 0.06,
    holdings: []
  });
  const [editLiabilityData, setEditLiabilityData] = useState({ 
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
        .insert([{ 
          ...asset, 
          user_id: user.id, 
          value: parseFloat(asset.value),
          growth_rate: asset.growth_rate,
          growth_method: asset.growth_method,
          holdings: asset.holdings
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setNewAsset({ 
        name: '', 
        type: 'checking', 
        value: '',
        growth_method: 'manual',
        growth_rate: 0.06,
        holdings: []
      });
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

  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof editAssetData }) => {
      const { error } = await supabase
        .from('assets')
        .update({ 
          ...data, 
          value: parseFloat(data.value),
          growth_rate: data.growth_rate,
          growth_method: data.growth_method,
          holdings: data.holdings
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setEditingAssetId(null);
      toast({ title: 'Success', description: 'Asset updated successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update asset: ' + error.message, variant: 'destructive' });
    }
  });

  const updateLiabilityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof editLiabilityData }) => {
      const { error } = await supabase
        .from('liabilities')
        .update({ 
          ...data, 
          balance: parseFloat(data.balance),
          interest_rate: data.interest_rate ? parseFloat(data.interest_rate) : 0,
          minimum_payment: data.minimum_payment ? parseFloat(data.minimum_payment) : 0
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      setEditingLiabilityId(null);
      toast({ title: 'Success', description: 'Liability updated successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update liability: ' + error.message, variant: 'destructive' });
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

  const handleEditAsset = (asset: any) => {
    setEditingAssetId(asset.id);
    setEditAssetData({
      name: asset.name,
      type: asset.type,
      value: asset.value.toString(),
      growth_method: asset.growth_method || 'manual',
      growth_rate: asset.growth_rate || 0.06,
      holdings: asset.holdings || []
    });
  };

  const handleEditLiability = (liability: any) => {
    setEditingLiabilityId(liability.id);
    setEditLiabilityData({
      name: liability.name,
      type: liability.type,
      balance: liability.balance.toString(),
      interest_rate: liability.interest_rate?.toString() || '',
      minimum_payment: liability.minimum_payment?.toString() || ''
    });
  };

  const handleUpdateAsset = (id: string) => {
    if (!editAssetData.name || !editAssetData.value) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    updateAssetMutation.mutate({ id, data: editAssetData });
  };

  const handleUpdateLiability = (id: string) => {
    if (!editLiabilityData.name || !editLiabilityData.balance) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    updateLiabilityMutation.mutate({ id, data: editLiabilityData });
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

  const renderAssetItem = (asset: any) => (
    <div key={asset.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      {editingAssetId === asset.id ? (
        <div className="space-y-3">
          <div>
            <Label className="text-gray-900 dark:text-white">Asset Name</Label>
            <Input
              value={editAssetData.name}
              onChange={(e) => setEditAssetData({ ...editAssetData, name: e.target.value })}
              className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
            />
          </div>
          <div>
            <Label className="text-gray-900 dark:text-white">Type</Label>
            <Select value={editAssetData.type} onValueChange={(value) => setEditAssetData({ ...editAssetData, type: value })}>
              <SelectTrigger className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                <SelectItem value="checking" className="dark:text-white">Checking Account</SelectItem>
                <SelectItem value="savings" className="dark:text-white">Savings Account</SelectItem>
                <SelectItem value="investment" className="dark:text-white">Investment Account</SelectItem>
                <SelectItem value="retirement" className="dark:text-white">Retirement Account</SelectItem>
                <SelectItem value="real_estate" className="dark:text-white">Real Estate</SelectItem>
                <SelectItem value="vehicle" className="dark:text-white">Vehicle</SelectItem>
                <SelectItem value="other" className="dark:text-white">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-900 dark:text-white">Value</Label>
            <Input
              type="number"
              value={editAssetData.value}
              onChange={(e) => setEditAssetData({ ...editAssetData, value: e.target.value })}
              className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
            />
          </div>
          <AssetGrowthInput
            value={{
              growth_method: editAssetData.growth_method,
              growth_rate: editAssetData.growth_rate,
              holdings: editAssetData.holdings
            }}
            onChange={(growthData) => setEditAssetData({ ...editAssetData, ...growthData })}
            assetType={editAssetData.type}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => handleUpdateAsset(asset.id)}
              disabled={updateAssetMutation.isPending}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {updateAssetMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => setEditingAssetId(null)}
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
            <div className="font-medium text-gray-900 dark:text-white">{asset.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
              {asset.type} • {formatCurrency(asset.value)}
              {asset.growth_rate && (
                <span className="ml-2 text-green-600 dark:text-green-400">
                  ({(asset.growth_rate * 100).toFixed(1)}% growth)
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditAsset(asset)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteAssetMutation.mutate(asset.id)}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderLiabilityItem = (liability: any) => (
    <div key={liability.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      {editingLiabilityId === liability.id ? (
        <div className="space-y-3">
          <div>
            <Label className="text-gray-900 dark:text-white">Liability Name</Label>
            <Input
              value={editLiabilityData.name}
              onChange={(e) => setEditLiabilityData({ ...editLiabilityData, name: e.target.value })}
              className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
            />
          </div>
          <div>
            <Label className="text-gray-900 dark:text-white">Type</Label>
            <Select value={editLiabilityData.type} onValueChange={(value) => setEditLiabilityData({ ...editLiabilityData, type: value })}>
              <SelectTrigger className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                <SelectItem value="credit_card" className="dark:text-white">Credit Card</SelectItem>
                <SelectItem value="mortgage" className="dark:text-white">Mortgage</SelectItem>
                <SelectItem value="student_loan" className="dark:text-white">Student Loan</SelectItem>
                <SelectItem value="auto_loan" className="dark:text-white">Auto Loan</SelectItem>
                <SelectItem value="personal_loan" className="dark:text-white">Personal Loan</SelectItem>
                <SelectItem value="other" className="dark:text-white">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-900 dark:text-white">Balance</Label>
            <Input
              type="number"
              value={editLiabilityData.balance}
              onChange={(e) => setEditLiabilityData({ ...editLiabilityData, balance: e.target.value })}
              className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
            />
          </div>
          <div>
            <Label className="text-gray-900 dark:text-white">Interest Rate (%)</Label>
            <Input
              type="number"
              step="0.01"
              value={editLiabilityData.interest_rate}
              onChange={(e) => setEditLiabilityData({ ...editLiabilityData, interest_rate: e.target.value })}
              className="dark:bg-gray-600/50 dark:border-gray-500 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleUpdateLiability(liability.id)}
              disabled={updateLiabilityMutation.isPending}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {updateLiabilityMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => setEditingLiabilityId(null)}
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
            <div className="font-medium text-gray-900 dark:text-white">{liability.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {liability.type.replace('_', ' ')} • {formatCurrency(liability.balance)}
              {liability.interest_rate > 0 && (
                <span className="ml-1">@ {liability.interest_rate}%</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditLiability(liability)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteLiabilityMutation.mutate(liability.id)}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (assetsLoading || liabilitiesLoading) {
    return <div className="text-gray-600 dark:text-gray-300">Loading net worth data...</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Net Worth</h3>
      
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
        <Card className="dark:bg-gray-800/50 dark:border-gray-700/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg text-gray-900 dark:text-white">Assets</CardTitle>
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
              {assets.map(renderAssetItem)}
              
              {assets.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
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
                      <AssetGrowthInput
                        value={{
                          growth_method: newAsset.growth_method,
                          growth_rate: newAsset.growth_rate,
                          holdings: newAsset.holdings
                        }}
                        onChange={(growthData) => setNewAsset({ ...newAsset, ...growthData })}
                        assetType={newAsset.type}
                      />
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
        <Card className="dark:bg-gray-800/50 dark:border-gray-700/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg text-gray-900 dark:text-white">Liabilities</CardTitle>
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
              {liabilities.map(renderLiabilityItem)}
              
              {liabilities.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
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
