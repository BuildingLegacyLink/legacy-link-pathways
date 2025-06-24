import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useLearningProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's learning progress
  const { data: userProgress, isLoading: progressLoading, refetch: refetchProgress } = useQuery({
    queryKey: ['learning-progress', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Get all topics
  const { data: topics = [], isLoading: topicsLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data;
    }
  });

  // Get all modules
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data.map(module => ({
        ...module,
        questions: Array.isArray(module.questions) ? module.questions : []
      }));
    }
  });

  // Update learning progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({ moduleId, score, xpEarned, completed }: {
      moduleId: string;
      score: number;
      xpEarned: number;
      completed: boolean;
    }) => {
      if (!user) throw new Error('No user');
      
      const module = modules.find(m => m.id === moduleId);
      if (!module) throw new Error('Module not found');

      console.log('Updating progress for module:', moduleId, { score, xpEarned, completed });

      const { data: existingProgress } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .single();

      if (existingProgress) {
        const { error } = await supabase
          .from('learning_progress')
          .update({
            score,
            xp_earned: xpEarned,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
            attempts: (existingProgress.attempts || 0) + 1,
            total_xp: xpEarned,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('module_id', moduleId);
        
        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('learning_progress')
          .insert({
            user_id: user.id,
            module_id: moduleId,
            topic_id: module.topic_id,
            level: module.level,
            score,
            xp_earned: xpEarned,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
            attempts: 1,
            total_xp: xpEarned
          });
        
        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }
      }
      
      console.log('Progress updated successfully in database');
    },
    onSuccess: () => {
      console.log('Mutation onSuccess called, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['learning-progress'] });
      toast({ title: 'Progress saved!', description: 'Your learning progress has been updated.' });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({ 
        title: 'Error saving progress', 
        description: 'Failed to save your progress. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Calculate user's current level and XP with CUMULATIVE XP
  const calculateUserStats = () => {
    if (!userProgress || !modules.length) return { 
      currentLevel: 'beginner', 
      totalXP: 0, 
      levelProgress: 0, 
      nextLevel: 'intermediate',
      nextLevelXP: 0 
    };
    
    // Calculate total XP earned by user
    const totalXP = userProgress.reduce((sum, progress) => sum + (progress.xp_earned || 0), 0);
    
    // Get completed modules by user
    const completedModuleIds = userProgress.filter(p => p.completed).map(p => p.module_id);
    
    // Group modules by level and calculate XP per level
    const beginnerModules = modules.filter(m => m.level === 'beginner');
    const intermediateModules = modules.filter(m => m.level === 'intermediate');
    const advancedModules = modules.filter(m => m.level === 'advanced');
    const expertModules = modules.filter(m => m.level === 'expert');
    
    // Calculate total XP needed for each level (CUMULATIVE)
    const beginnerTotalXP = beginnerModules.reduce((sum, m) => sum + (m.xp_value || 0), 0);
    const intermediateTotalXP = beginnerTotalXP + intermediateModules.reduce((sum, m) => sum + (m.xp_value || 0), 0);
    const advancedTotalXP = intermediateTotalXP + advancedModules.reduce((sum, m) => sum + (m.xp_value || 0), 0);
    const expertTotalXP = advancedTotalXP + expertModules.reduce((sum, m) => sum + (m.xp_value || 0), 0);
    
    // Count completed modules per level
    const completedBeginnerCount = beginnerModules.filter(m => completedModuleIds.includes(m.id)).length;
    const completedIntermediateCount = intermediateModules.filter(m => completedModuleIds.includes(m.id)).length;
    const completedAdvancedCount = advancedModules.filter(m => completedModuleIds.includes(m.id)).length;
    const completedExpertCount = expertModules.filter(m => completedModuleIds.includes(m.id)).length;
    
    // Determine current level and progress
    let currentLevel = 'beginner';
    let levelProgress = 0;
    let nextLevel = 'intermediate';
    let nextLevelXP = intermediateTotalXP;
    
    // Expert level (all modules completed)
    if (expertModules.length > 0 && completedExpertCount === expertModules.length) {
      currentLevel = 'expert';
      levelProgress = 100;
      nextLevel = null;
      nextLevelXP = expertTotalXP;
    } 
    // Advanced level (all advanced modules completed)
    else if (advancedModules.length > 0 && completedAdvancedCount === advancedModules.length) {
      currentLevel = 'advanced';
      nextLevel = 'expert';
      nextLevelXP = expertTotalXP;
      levelProgress = expertTotalXP > 0 ? (totalXP / expertTotalXP) * 100 : 0;
    } 
    // Intermediate level (all intermediate modules completed)
    else if (intermediateModules.length > 0 && completedIntermediateCount === intermediateModules.length) {
      currentLevel = 'intermediate';
      nextLevel = 'advanced';
      nextLevelXP = advancedTotalXP;
      levelProgress = advancedTotalXP > 0 ? (totalXP / advancedTotalXP) * 100 : 0;
    } 
    // Beginner level completed (all beginner modules completed) - auto advance to intermediate
    else if (beginnerModules.length > 0 && completedBeginnerCount === beginnerModules.length) {
      currentLevel = 'intermediate';
      nextLevel = 'advanced';
      nextLevelXP = advancedTotalXP;
      levelProgress = advancedTotalXP > 0 ? (totalXP / advancedTotalXP) * 100 : 0;
    } 
    // Still working on beginner level
    else {
      currentLevel = 'beginner';
      nextLevel = 'intermediate';
      nextLevelXP = intermediateTotalXP;
      levelProgress = intermediateTotalXP > 0 ? (totalXP / intermediateTotalXP) * 100 : 0;
    }
    
    console.log('Level calculation:', {
      currentLevel,
      totalXP,
      levelProgress,
      nextLevel,
      nextLevelXP,
      beginnerTotalXP,
      intermediateTotalXP,
      advancedTotalXP,
      expertTotalXP
    });
    
    return { currentLevel, totalXP, levelProgress, nextLevel, nextLevelXP };
  };

  // Check if module is unlocked
  const isModuleUnlocked = (moduleId: string) => {
    if (!modules.length) return false;
    
    const module = modules.find(m => m.id === moduleId);
    if (!module) return false;
    
    const { currentLevel } = calculateUserStats();
    
    // Module must be at current level or below
    const levelHierarchy = ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentLevelIndex = levelHierarchy.indexOf(currentLevel);
    const moduleLevelIndex = levelHierarchy.indexOf(module.level);
    
    if (moduleLevelIndex > currentLevelIndex) return false;
    
    // Get modules for the same topic and level, ordered by sort_order
    const topicModules = modules
      .filter(m => m.topic_id === module.topic_id && m.level === module.level)
      .sort((a, b) => a.sort_order - b.sort_order);
    
    const moduleIndex = topicModules.findIndex(m => m.id === moduleId);
    if (moduleIndex === 0) return true; // First module is always unlocked
    
    // Check if previous module is completed
    if (!userProgress) return false;
    
    const previousModule = topicModules[moduleIndex - 1];
    const previousProgress = userProgress.find(p => p.module_id === previousModule.id);
    
    return previousProgress?.completed || false;
  };

  return {
    userProgress,
    topics,
    modules,
    updateProgress: (params: any, options?: any) => {
      console.log('updateProgress called with:', params, options);
      return updateProgressMutation.mutate(params, options);
    },
    isUpdating: updateProgressMutation.isPending,
    calculateUserStats,
    isModuleUnlocked,
    isLoading: progressLoading || topicsLoading || modulesLoading,
    refetchProgress
  };
};
