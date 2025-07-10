
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2, ArrowLeft, GripVertical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/currency';
import { goalTemplates, GoalTemplate, getGoalTemplate } from '@/utils/goalTemplates';
import GoalTypeSelector from './GoalTypeSelector';
import TimingSelector from './TimingSelector';
import WithdrawalRanking from './WithdrawalRanking';
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

const GoalsSection = () => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);
  const [withdrawalOrder, setWithdrawalOrder] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
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
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id, 'retirement'] });
      resetDialog();
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
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id, 'retirement'] });
      resetDialog();
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

  const reorderGoalsMutation = useMutation({
    mutationFn: async (reorderedGoals: any[]) => {
      const updates = reorderedGoals.map((goal, index) => 
        supabase
          .from('goals')
          .update({ priority: index + 1 })
          .eq('id', goal.id)
      );
      
      const results = await Promise.all(updates);
      const errors = results.filter(result => result.error);
      if (errors.length > 0) throw errors[0].error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const resetDialog = () => {
    setIsDialogOpen(false);
    setEditingGoal(null);
    setSelectedTemplate(null);
    setShowTemplateSelector(true);
    setWithdrawalOrder([]);
    setIsRecurring(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Handle retirement age for retirement goals
    let targetDate = null;
    let retirementAge = null;
    
    if (selectedTemplate?.id === 'retirement' || editingGoal?.goal_type === 'retirement') {
      retirementAge = parseInt(formData.get('target_age') as string) || 67;
    } else {
      targetDate = formData.get('target_date') as string || null;
    }
    
    // Handle recurring travel timing data
    const isRecurringTravel = formData.get('is_recurring') === 'true';
    let startTimingType = null;
    let startTimingValue = null;
    let endTimingType = null;
    let endTimingValue = null;
    let frequency = null;
    
    if (isRecurringTravel) {
      startTimingType = formData.get('start_type') as string || null;
      startTimingValue = parseInt(formData.get('start_value') as string) || null;
      endTimingType = formData.get('end_type') as string || null;
      endTimingValue = parseInt(formData.get('end_value') as string) || null;
      frequency = formData.get('frequency') as string || null;
    }

    const goalData = {
      name: formData.get('name') as string,
      target_amount: (selectedTemplate?.id !== 'retirement' && editingGoal?.goal_type !== 'retirement') 
        ? parseFloat(formData.get('target_amount') as string) 
        : 0,
      target_date: isRecurringTravel ? null : targetDate,
      retirement_age: retirementAge,
      priority: (selectedTemplate?.id !== 'retirement' && selectedTemplate?.id !== 'heirs' && 
                selectedTemplate?.id !== 'travel' &&
                editingGoal?.goal_type !== 'retirement' && editingGoal?.goal_type !== 'heirs' &&
                editingGoal?.goal_type !== 'travel') 
        ? parseInt(formData.get('priority') as string) || 1
        : 1,
      description: (selectedTemplate?.id !== 'retirement' && selectedTemplate?.id !== 'travel' &&
                   editingGoal?.goal_type !== 'retirement' && editingGoal?.goal_type !== 'travel')
        ? formData.get('description') as string || null
        : null,
      goal_type: selectedTemplate?.id || editingGoal?.goal_type || 'custom',
      withdrawal_order: (selectedTemplate?.id === 'retirement' || editingGoal?.goal_type === 'retirement') 
        ? withdrawalOrder 
        : [],
      is_recurring: isRecurringTravel,
      start_timing_type: startTimingType,
      start_timing_value: startTimingValue,
      end_timing_type: endTimingType,
      end_timing_value: endTimingValue,
      frequency: frequency,
    };

    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, ...goalData });
    } else {
      addGoalMutation.mutate(goalData);
    }
  };

  const handleTemplateSelect = (template: GoalTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
  };

  const handleCustomGoal = () => {
    setSelectedTemplate(null);
    setShowTemplateSelector(false);
  };

  const handleBackToTemplates = () => {
    setShowTemplateSelector(true);
    setSelectedTemplate(null);
  };

  const openEditDialog = (goal: any) => {
    setEditingGoal(goal);
    setSelectedTemplate(getGoalTemplate(goal.goal_type));
    setShowTemplateSelector(false);
    setWithdrawalOrder(goal.withdrawal_order || []);
    setIsRecurring(goal.is_recurring || false);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingGoal(null);
    setSelectedTemplate(null);
    setShowTemplateSelector(true);
    setWithdrawalOrder([]);
    setIsDialogOpen(true);
  };

  const renderGoalForm = () => {
    if (showTemplateSelector && !editingGoal) {
      return (
        <GoalTypeSelector
          selectedTemplate={selectedTemplate}
          onTemplateSelect={handleTemplateSelect}
          onCustomGoal={handleCustomGoal}
        />
      );
    }

    const template = selectedTemplate || getGoalTemplate(editingGoal?.goal_type);
    const targetDate = new Date();
    if (template?.suggestedTimeline) {
      targetDate.setFullYear(targetDate.getFullYear() + template.suggestedTimeline);
    }

    return (
      <div className="space-y-4">
        {!editingGoal && (
          <div className="flex items-center gap-2 mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBackToTemplates}
              className="p-0 h-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Templates
            </Button>
            {template && (
              <div className="flex items-center gap-2 ml-4">
                <div className={`w-6 h-6 rounded-full ${template.color} flex items-center justify-center`}>
                  <template.icon className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-medium">{template.name}</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={editingGoal?.name || template?.name || ''}
              placeholder={template?.name || "Emergency Fund"}
              required
            />
          </div>
          
          {/* Target Amount - hide for retirement goals */}
          {selectedTemplate?.id !== 'retirement' && editingGoal?.goal_type !== 'retirement' && (
            <div className="space-y-2">
              <Label htmlFor="target_amount">Target Amount ($)</Label>
              <Input
                id="target_amount"
                name="target_amount"
                type="number"
                step="1"
                defaultValue={editingGoal?.target_amount || template?.defaultAmount || ''}
                placeholder={template?.defaultAmount?.toString() || "50000"}
                required
              />
            </div>
          )}
          
          {/* Recurring Travel Option for Travel Goals */}
          {(selectedTemplate?.id === 'travel' || editingGoal?.goal_type === 'travel') && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Recurring travel?</Label>
                <RadioGroup
                  name="is_recurring"
                  value={isRecurring ? 'true' : 'false'}
                  onValueChange={(value) => setIsRecurring(value === 'true')}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="no-recurring" />
                    <Label htmlFor="no-recurring" className="cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="yes-recurring" />
                    <Label htmlFor="yes-recurring" className="cursor-pointer">Yes</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {isRecurring ? (
                <div className="space-y-4">
                  <TimingSelector
                    label="Starts"
                    name="start"
                    defaultType={editingGoal?.start_timing_type}
                    defaultValue={editingGoal?.start_timing_value}
                    profile={profile}
                    required
                  />
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select name="frequency" defaultValue={editingGoal?.frequency || 'annually'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
                        <SelectItem value="annually">Annually</SelectItem>
                        <SelectItem value="biannually">Twice a year</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <TimingSelector
                    label="Ends (Optional)"
                    name="end"
                    defaultType={editingGoal?.end_timing_type}
                    defaultValue={editingGoal?.end_timing_value}
                    profile={profile}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="target_date">Target Date</Label>
                  <Input
                    id="target_date"
                    name="target_date"
                    type="date"
                    defaultValue={editingGoal?.target_date || targetDate.toISOString().split('T')[0]}
                    required
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Target Date/Age for Non-Travel Goals */}
          {(selectedTemplate?.id === 'retirement' || editingGoal?.goal_type === 'retirement') ? (
            <div className="space-y-2">
              <Label htmlFor="target_age">Target Retirement Age</Label>
              <Input
                id="target_age"
                name="target_age"
                type="number"
                min="50"
                max="100"
                defaultValue={editingGoal?.retirement_age || 67}
                placeholder="67"
              />
            </div>
          ) : (selectedTemplate?.id !== 'travel' && editingGoal?.goal_type !== 'travel') && (
            <div className="space-y-2">
              <Label htmlFor="target_date">Target Date</Label>
              <Input
                id="target_date"
                name="target_date"
                type="date"
                defaultValue={editingGoal?.target_date || targetDate.toISOString().split('T')[0]}
              />
            </div>
          )}
          
          {/* Priority - hide for retirement, heirs, and travel goals */}
          {selectedTemplate?.id !== 'retirement' && 
           selectedTemplate?.id !== 'heirs' && 
           selectedTemplate?.id !== 'travel' &&
           editingGoal?.goal_type !== 'retirement' && 
           editingGoal?.goal_type !== 'heirs' &&
           editingGoal?.goal_type !== 'travel' && (
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
          )}
          
          {/* Description - hide for retirement and travel goals */}
          {selectedTemplate?.id !== 'retirement' && selectedTemplate?.id !== 'travel' && 
           editingGoal?.goal_type !== 'retirement' && editingGoal?.goal_type !== 'travel' && (
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingGoal?.description || template?.description || ''}
                placeholder={template?.description || "6 months of living expenses"}
              />
            </div>
          )}

          {(selectedTemplate?.id === 'retirement' || editingGoal?.goal_type === 'retirement') && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <WithdrawalRanking
                withdrawalOrder={withdrawalOrder}
                onWithdrawalOrderChange={setWithdrawalOrder}
              />
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={addGoalMutation.isPending || updateGoalMutation.isPending}
          >
            {(addGoalMutation.isPending || updateGoalMutation.isPending) 
              ? 'Saving...' 
              : editingGoal 
                ? 'Update Goal' 
                : 'Add Goal'
            }
          </Button>
        </form>
      </div>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && goals) {
      const oldIndex = goals.findIndex(goal => goal.id === active.id);
      const newIndex = goals.findIndex(goal => goal.id === over?.id);

      const newOrder = arrayMove(goals, oldIndex, newIndex);
      reorderGoalsMutation.mutate(newOrder);
    }
  };

  if (isLoading) return <div>Loading goals...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Goals</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) resetDialog();
          else setIsDialogOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Edit Goal' : 'Add New Financial Goal'}
              </DialogTitle>
              <DialogDescription>
                {editingGoal 
                  ? 'Update your financial goal details.' 
                  : showTemplateSelector 
                    ? 'Choose a goal type or create a custom goal.'
                    : 'Set up your financial goal details.'
                }
              </DialogDescription>
            </DialogHeader>
            {renderGoalForm()}
          </DialogContent>
        </Dialog>
      </div>

      {goals && goals.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={goals.map(goal => goal.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {goals.map((goal) => (
                <SortableGoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => openEditDialog(goal)}
                  onDelete={() => deleteGoalMutation.mutate(goal.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No financial goals set yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Add your first goal to start tracking your financial progress.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface SortableGoalCardProps {
  goal: any;
  onEdit: () => void;
  onDelete: () => void;
}

const SortableGoalCard = ({ goal, onEdit, onDelete }: SortableGoalCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const template = getGoalTemplate(goal.goal_type);
  const IconComponent = template?.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTiming = (timingType: string, timingValue: number, prefix: string = '') => {
    if (!timingType || !timingValue) return null;
    
    switch (timingType) {
      case 'calendar_year':
        return `${prefix}${timingValue}`;
      case 'age':
        return `${prefix}Age ${timingValue}`;
      case 'retirement':
        return `${prefix}Retirement`;
      case 'death':
        return `${prefix}Death`;
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group"
    >
      <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
              >
                <GripVertical className="h-5 w-5" />
              </div>
              {template && IconComponent && (
                <div className={`w-10 h-10 rounded-full ${template.color} flex items-center justify-center flex-shrink-0 mt-1`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg dark:text-white">{goal.name}</CardTitle>
                <div className="text-2xl font-bold text-green-600">
                  {goal.goal_type === 'retirement' && goal.retirement_age
                    ? `Retire by Age ${goal.retirement_age}`
                    : formatCurrency(Number(goal.target_amount))}
                </div>
                {template && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {template.name}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {goal.description && (
              <p className="text-gray-600 dark:text-gray-300">{goal.description}</p>
            )}
            <div className="flex justify-end text-sm">
              {goal.goal_type === 'travel' && goal.is_recurring ? (
                <div className="text-right space-y-1 dark:text-gray-400">
                  <div>Recurring: {goal.frequency || 'annually'}</div>
                  {goal.start_timing_type && goal.start_timing_value && (
                    <div>From: {formatTiming(goal.start_timing_type, goal.start_timing_value)}</div>
                  )}
                  {goal.end_timing_type && goal.end_timing_value && (
                    <div>Until: {formatTiming(goal.end_timing_type, goal.end_timing_value)}</div>
                  )}
                </div>
              ) : goal.target_date && (
                <span className="dark:text-gray-400">
                  Target: {new Date(goal.target_date).toLocaleDateString()}
                </span>
              )}
            </div>
            {goal.goal_type === 'retirement' && Array.isArray(goal.withdrawal_order) && goal.withdrawal_order.length > 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="font-medium">Withdrawal Order:</span> {goal.withdrawal_order.length} accounts configured
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalsSection;
