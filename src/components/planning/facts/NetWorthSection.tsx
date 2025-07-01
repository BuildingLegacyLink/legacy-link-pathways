
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import AssetInputPopup from './AssetInputPopup';
import LiabilityInputPopup from './LiabilityInputPopup';

const NetWorthSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAssetPopupOpen, setIsAssetPopupOpen] = useState(false);
  const [isLiabilityPopupOpen, setIsLiabilityPopupOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [editingLiability, setEditingLiability] = useState<any>(null);

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
    mutationFn: async (asset: any) => {
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
      setIsAssetPopupOpen(false);
      toast({ title: 'Success', description: 'Asset added successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to add asset: ' + error.message, variant: 'destructive' });
    }
  });

  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
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
      setEditingAsset(null);
      setIsAssetPopupOpen(false);
      toast({ title: 'Success', description: 'Asset updated successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update asset: ' + error.message, variant: 'destructive' });
    }
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      // First, check if any savings records reference this asset
      const { data: linkedSavings, error: checkError } = await supabase
        .from('savings')
        .select('id, name')
        .eq('destination_asset_id', id);
      
      if (checkError) throw checkError;
      
      if (linkedSavings && linkedSavings.length > 0) {
        // Unlink the savings records by setting destination_asset_id to null
        const { error: unlinkError } = await supabase
          .from('savings')
          .update({ destination_asset_id: null })
          .eq('destination_asset_id', id);
        
        if (unlinkError) throw unlinkError;
      }
      
      // Now delete the asset
      const { error } = await supabase.from('assets').delete().eq('id', id);
      if (error) throw error;
      
      return linkedSavings;
    },
    onSuccess: (linkedSavings) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      
      let message = 'Asset deleted successfully!';
      if (linkedSavings && linkedSavings.length > 0) {
        const savingsNames = linkedSavings.map(s => s.name).join(', ');
        message += ` Note: Unlinked from savings: ${savingsNames}`;
      }
      
      toast({ title: 'Success', description: message });
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete asset: ' + error.message, 
        variant: 'destructive' 
      });
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
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete liability: ' + error.message, 
        variant: 'destructive' 
      });
    }
  });

  const handleAssetSave = (assetData: any) => {
    if (editingAsset) {
      updateAssetMutation.mutate({ id: editingAsset.id, data: assetData });
    } else {
      addAssetMutation.mutate(assetData);
    }
  };

  const handleEditAsset = (asset: any) => {
    setEditingAsset(asset);
    setIsAssetPopupOpen(true);
  };

  const handleCloseAssetPopup = () => {
    setIsAssetPopupOpen(false);
    setEditingAsset(null);
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
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{asset.name}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
            {asset.type.replace('_', ' ')} • {formatCurrency(asset.value)}
            {asset.growth_rate && (
              <span className="ml-2 text-green-600 dark:text-green-400">
                ({(asset.growth_rate * 100).toFixed(1)}% growth)
              </span>
            )}
            {asset.holdings && asset.holdings.length > 0 && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                • {asset.holdings.length} holdings
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
            disabled={deleteAssetMutation.isPending}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderLiabilityItem = (liability: any) => (
    <div key={liability.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
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
            onClick={() => {
              setEditingLiability(liability);
              setIsLiabilityPopupOpen(true);
            }}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteLiabilityMutation.mutate(liability.id)}
            disabled={deleteLiabilityMutation.isPending}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
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
                onClick={() => setIsAssetPopupOpen(true)} 
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
            </div>
          </CardContent>
        </Card>

        {/* Liabilities */}
        <Card className="dark:bg-gray-800/50 dark:border-gray-700/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg text-gray-900 dark:text-white">Liabilities</CardTitle>
              <Button 
                onClick={() => setIsLiabilityPopupOpen(true)} 
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Input Popup */}
      <AssetInputPopup
        isOpen={isAssetPopupOpen}
        onClose={handleCloseAssetPopup}
        onSave={handleAssetSave}
        editingAsset={editingAsset}
        isLoading={addAssetMutation.isPending || updateAssetMutation.isPending}
      />

      {/* Liability Input Popup */}
      <LiabilityInputPopup
        isOpen={isLiabilityPopupOpen}
        onClose={() => {
          setIsLiabilityPopupOpen(false);
          setEditingLiability(null);
        }}
        editingLiability={editingLiability}
      />
    </div>
  );
};

export default NetWorthSection;
