
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Settings } from 'lucide-react';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

interface TaxAssumption {
  id?: string;
  federal_tax_method: '1040' | 'flat';
  flat_federal_rate?: number;
  state_tax_method: 'none' | 'stateRules' | 'flat';
  state?: string;
  flat_state_rate?: number;
}

const TaxAssumptions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TaxAssumption>({
    federal_tax_method: '1040',
    state_tax_method: 'stateRules',
    state: 'Wisconsin'
  });

  // Fetch existing tax assumptions
  const { data: taxAssumptions, isLoading } = useQuery({
    queryKey: ['tax_assumptions', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('tax_assumptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user
  });

  // Initialize form with existing data
  useState(() => {
    if (taxAssumptions) {
      setFormData({
        federal_tax_method: taxAssumptions.federal_tax_method as '1040' | 'flat',
        flat_federal_rate: taxAssumptions.flat_federal_rate || undefined,
        state_tax_method: taxAssumptions.state_tax_method as 'none' | 'stateRules' | 'flat',
        state: taxAssumptions.state || 'Wisconsin',
        flat_state_rate: taxAssumptions.flat_state_rate || undefined
      });
    }
  });

  // Save tax assumptions
  const saveMutation = useMutation({
    mutationFn: async (data: TaxAssumption) => {
      if (!user) throw new Error('User not authenticated');
      
      const payload = {
        user_id: user.id,
        federal_tax_method: data.federal_tax_method,
        flat_federal_rate: data.flat_federal_rate,
        state_tax_method: data.state_tax_method,
        state: data.state,
        flat_state_rate: data.flat_state_rate,
        updated_at: new Date().toISOString()
      };

      if (taxAssumptions?.id) {
        const { data: result, error } = await supabase
          .from('tax_assumptions')
          .update(payload)
          .eq('id', taxAssumptions.id)
          .select()
          .single();
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('tax_assumptions')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_assumptions'] });
      toast({ title: "Tax assumptions saved successfully!" });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error saving tax assumptions", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const getCurrentSettings = () => {
    const current = taxAssumptions || formData;
    const federal = current.federal_tax_method === 'flat' 
      ? `Flat Tax (${current.flat_federal_rate || 0}%)`
      : 'Form 1040';
    
    let state = '';
    switch (current.state_tax_method) {
      case 'none':
        state = 'No Taxes';
        break;
      case 'flat':
        state = `Flat Tax (${current.flat_state_rate || 0}%)`;
        break;
      default:
        state = `By State Rules (${current.state || 'Wisconsin'})`;
    }
    
    return { federal, state };
  };

  const settings = getCurrentSettings();

  if (isLoading) {
    return <div className="text-sm text-gray-600 dark:text-gray-400">Loading tax assumptions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Tax Assumptions</h4>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tax Assumptions</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Federal Taxes */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Federal Taxes</Label>
                <Select 
                  value={formData.federal_tax_method} 
                  onValueChange={(value: '1040' | 'flat') => 
                    setFormData({ ...formData, federal_tax_method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1040">Form 1040</SelectItem>
                    <SelectItem value="flat">Flat Tax</SelectItem>
                  </SelectContent>
                </Select>
                {formData.federal_tax_method === 'flat' && (
                  <div className="space-y-2">
                    <Label htmlFor="flat-federal-rate">Flat Federal Rate (%)</Label>
                    <Input
                      id="flat-federal-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="22"
                      value={formData.flat_federal_rate || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        flat_federal_rate: e.target.value ? Number(e.target.value) : undefined 
                      })}
                    />
                  </div>
                )}
              </div>

              {/* State Taxes */}
              <div className="space-y-3">
                <Label className="text-base font-medium">State Taxes</Label>
                <Select 
                  value={formData.state_tax_method} 
                  onValueChange={(value: 'none' | 'stateRules' | 'flat') => 
                    setFormData({ ...formData, state_tax_method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Taxes</SelectItem>
                    <SelectItem value="stateRules">By State Rules</SelectItem>
                    <SelectItem value="flat">Flat Tax</SelectItem>
                  </SelectContent>
                </Select>
                
                {formData.state_tax_method === 'stateRules' && (
                  <div className="space-y-2">
                    <Label htmlFor="state-select">State</Label>
                    <Select 
                      value={formData.state} 
                      onValueChange={(value) => setFormData({ ...formData, state: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {formData.state_tax_method === 'flat' && (
                  <div className="space-y-2">
                    <Label htmlFor="flat-state-rate">Flat State Rate (%)</Label>
                    <Input
                      id="flat-state-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="5"
                      value={formData.flat_state_rate || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        flat_state_rate: e.target.value ? Number(e.target.value) : undefined 
                      })}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dark:bg-gray-800/50 dark:border-gray-700/50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Federal Taxes:</span>
              <span className="text-sm text-gray-900 dark:text-white">{settings.federal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">State Taxes:</span>
              <span className="text-sm text-gray-900 dark:text-white">{settings.state}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxAssumptions;
