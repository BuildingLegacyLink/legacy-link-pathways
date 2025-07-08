import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Asset {
  id: string;
  name: string;
  type: string;
  value: number;
}

interface WithdrawalRankingProps {
  withdrawalOrder: string[];
  onWithdrawalOrderChange: (order: string[]) => void;
}

interface SortableAssetItemProps {
  asset: Asset;
  rank: number;
}

const SortableAssetItem = ({ asset, rank }: SortableAssetItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: asset.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-2"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {rank}. {asset.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {asset.type} • {formatCurrency(asset.value)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WithdrawalRanking = ({ withdrawalOrder, onWithdrawalOrderChange }: WithdrawalRankingProps) => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch user's investment assets
  const { data: userAssets } = useQuery({
    queryKey: ['assets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Filter to only show investment/retirement accounts
  useEffect(() => {
    if (userAssets) {
      const investmentAccountTypes = ['roth_ira', 'traditional_ira', '401k', '403b', '457', 'brokerage', 'hsa'];
      const filteredAssets = userAssets.filter(asset => {
        const assetType = asset.type.toLowerCase();
        const assetName = asset.name.toLowerCase();
        
        // Include specific investment account types
        if (investmentAccountTypes.includes(assetType)) return true;
        if (assetType.includes('ira') || assetType.includes('401') || assetType.includes('403') || assetType.includes('457')) return true;
        if (assetType.includes('brokerage') || assetType.includes('investment')) return true;
        if (assetType.includes('hsa') && (assetName.includes('investment') || assetName.includes('invest'))) return true;
        
        // Only include savings if it's clearly for investment/emergency fund
        if (assetType.includes('savings') && (assetName.includes('emergency') || assetName.includes('investment'))) return true;
        
        return false;
      });
      
      setAssets(filteredAssets);
    }
  }, [userAssets]);

  // Initialize withdrawal order if empty
  useEffect(() => {
    if (assets.length > 0 && withdrawalOrder.length === 0) {
      onWithdrawalOrderChange(assets.map(asset => asset.id));
    }
  }, [assets, withdrawalOrder, onWithdrawalOrderChange]);

  // Create ordered assets list
  const orderedAssets = withdrawalOrder.map(assetId => 
    assets.find(asset => asset.id === assetId)
  ).filter(Boolean) as Asset[];

  // Add any new assets that aren't in the withdrawal order yet
  const unorderedAssets = assets.filter(asset => 
    !withdrawalOrder.includes(asset.id)
  );
  const allOrderedAssets = [...orderedAssets, ...unorderedAssets];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = allOrderedAssets.findIndex(asset => asset.id === active.id);
      const newIndex = allOrderedAssets.findIndex(asset => asset.id === over?.id);

      const newOrder = arrayMove(allOrderedAssets, oldIndex, newIndex);
      onWithdrawalOrderChange(newOrder.map(asset => asset.id));
    }
  };

  if (assets.length === 0) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No investment accounts found. Add some assets to set up withdrawal order.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold dark:text-white">
          Withdraw from Accounts in This Order
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Drag to reorder. During retirement, we'll withdraw from these accounts in the order shown.
        </p>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={allOrderedAssets.map(asset => asset.id)}
            strategy={verticalListSortingStrategy}
          >
            {allOrderedAssets.map((asset, index) => (
              <SortableAssetItem
                key={asset.id}
                asset={asset}
                rank={index + 1}
              />
            ))}
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
};

export default WithdrawalRanking;