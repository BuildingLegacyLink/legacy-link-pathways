
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const NetWorthSection = () => {
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isLiabilityDialogOpen, setIsLiabilityDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: assets } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('assets').select('*').order('value', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: liabilities } = useQuery({
    queryKey: ['liabilities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('liabilities').select('*').order('balance', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addAssetMutation = useMutation({
    mutationFn: async (assetData: any) => {
      const { data, error } = await supabase.from('assets').insert(assetData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setIsAssetDialogOpen(false);
      toast({ title: 'Success', description: 'Asset added successfully!' });
    },
  });

  const addLiabilityMutation = useMutation({
    mutationFn: async (liabilityData: any) => {
      const { data, error } = await supabase.from('liabilities').insert(liabilityData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      setIsLiabilityDialogOpen(false);
      toast({ title: 'Success', description: 'Liability added successfully!' });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: string) => {
      const { error } = await supabase.from('assets').delete().eq('id', assetId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({ title: 'Success', description: 'Asset deleted successfully!' });
    },
  });

  const deleteLiabilityMutation = useMutation({
    mutationFn: async (liabilityId: string) => {
      const { error } = await supabase.from('liabilities').delete().eq('id', liabilityId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      toast({ title: 'Success', description: 'Liability deleted successfully!' });
    },
  });

  const handleAssetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const assetData = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      value: parseFloat(formData.get('value') as string),
      user_id: (await supabase.auth.getUser()).data.user?.id,
    };

    addAssetMutation.mutate(assetData);
  };

  const handleLiabilitySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const liabilityData = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      balance: parseFloat(formData.get('balance') as string),
      interest_rate: parseFloat(formData.get('interest_rate') as string) || null,
      minimum_payment: parseFloat(formData.get('minimum_payment') as string) || null,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    };

    addLiabilityMutation.mutate(liabilityData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalAssets = assets?.reduce((sum, asset) => sum + Number(asset.value), 0) || 0;
  const totalLiabilities = liabilities?.reduce((sum, liability) => sum + Number(liability.balance), 0) || 0;
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Net Worth</h2>
      </div>

      {/* Net Worth Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAssets)}</div>
            <div className="text-sm text-gray-600">Total Assets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalLiabilities)}</div>
            <div className="text-sm text-gray-600">Total Liabilities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className={`text-3xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netWorth)}
            </div>
            <div className="text-sm text-gray-600">Net Worth</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Assets</h3>
            <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Asset</DialogTitle>
                  <DialogDescription>
                    Add an asset to track your wealth.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAssetSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Asset Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Checking Account"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Asset Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset type" />
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
                  <div className="space-y-2">
                    <Label htmlFor="value">Current Value</Label>
                    <Input
                      id="value"
                      name="value"
                      type="number"
                      step="0.01"
                      placeholder="10000"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={addAssetMutation.isPending}>
                    {addAssetMutation.isPending ? 'Adding...' : 'Add Asset'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {assets && assets.length > 0 ? (
            <div className="space-y-2">
              {assets.map((asset) => (
                <Card key={asset.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{asset.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{asset.type.replace('_', ' ')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(Number(asset.value))}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAssetMutation.mutate(asset.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No assets recorded yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="liabilities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Liabilities</h3>
            <Dialog open={isLiabilityDialogOpen} onOpenChange={setIsLiabilityDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Liability
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Liability</DialogTitle>
                  <DialogDescription>
                    Add a debt or liability to track.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLiabilitySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Liability Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Credit Card"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Liability Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select liability type" />
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
                  <div className="space-y-2">
                    <Label htmlFor="balance">Current Balance</Label>
                    <Input
                      id="balance"
                      name="balance"
                      type="number"
                      step="0.01"
                      placeholder="5000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                    <Input
                      id="interest_rate"
                      name="interest_rate"
                      type="number"
                      step="0.01"
                      placeholder="18.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimum_payment">Minimum Payment</Label>
                    <Input
                      id="minimum_payment"
                      name="minimum_payment"
                      type="number"
                      step="0.01"
                      placeholder="150"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={addLiabilityMutation.isPending}>
                    {addLiabilityMutation.isPending ? 'Adding...' : 'Add Liability'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {liabilities && liabilities.length > 0 ? (
            <div className="space-y-2">
              {liabilities.map((liability) => (
                <Card key={liability.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{liability.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{liability.type.replace('_', ' ')}</p>
                        {liability.interest_rate && (
                          <p className="text-sm text-gray-500">{liability.interest_rate}% APR</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">
                            {formatCurrency(Number(liability.balance))}
                          </div>
                          {liability.minimum_payment && (
                            <div className="text-sm text-gray-600">
                              Min: {formatCurrency(Number(liability.minimum_payment))}
                            </div>
                          )}
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No liabilities recorded yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetWorthSection;
