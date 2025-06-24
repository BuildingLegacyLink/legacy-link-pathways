
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
      // Convert questions from Json to array format and ensure they exist
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

      // First check if progress already exists
      const { data: existingProgress } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .single();

      if (existingProgress) {
        // Update existing record
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
        // Insert new record
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
      // Invalidate queries to ensure fresh data
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

  // Calculate user's current level and XP - SIMPLIFIED
  const calculateUserStats = () => {
    if (!userProgress || !modules.length) return { 
      currentLevel: 'beginner', 
      totalXP: 0, 
      levelProgress: 0, 
      nextLevel: 'intermediate',
      nextLevelXP: 0 
    };
    
    const totalXP = userProgress.reduce((sum, progress) => sum + (progress.xp_earned || 0), 0);
    
    // Get completed modules by level
    const completedModuleIds = userProgress.filter(p => p.completed).map(p => p.module_id);
    
    const beginnerModules = modules.filter(m => m.level === 'beginner');
    const intermediateModules = modules.filter(m => m.level === 'intermediate');
    const advancedModules = modules.filter(m => m.level === 'advanced');
    const expertModules = modules.filter(m => m.level === 'expert');
    
    const completedBeginnerCount = beginnerModules.filter(m => completedModuleIds.includes(m.id)).length;
    const completedIntermediateCount = intermediateModules.filter(m => completedModuleIds.includes(m.id)).length;
    const completedAdvancedCount = advancedModules.filter(m => completedModuleIds.includes(m.id)).length;
    const completedExpertCount = expertModules.filter(m => completedModuleIds.includes(m.id)).length;
    
    // Determine current level based on completion
    let currentLevel = 'beginner';
    let levelProgress = 0;
    let nextLevel = 'intermediate';
    let nextLevelXP = 0;
    
    // Check level progression
    if (expertModules.length > 0 && completedExpertCount === expertModules.length) {
      currentLevel = 'expert';
      levelProgress = 100;
      nextLevel = null;
    } else if (advancedModules.length > 0 && completedAdvancedCount === advancedModules.length) {
      currentLevel = 'advanced';
      nextLevel = 'expert';
      if (expertModules.length > 0) {
        const expertTotalXP = expertModules.reduce((sum, m) => sum + (m.xp_value || 0), 0);
        const expertEarnedXP = expertModules.filter(m => completedModuleIds.includes(m.id))
          .reduce((sum, m) => sum + (m.xp_value || 0), 0);
        levelProgress = expertTotalXP > 0 ? (expertEarnedXP / expertTotalXP) * 100 : 0;
        nextLevelXP = expertTotalXP;
      }
    } else if (intermediateModules.length > 0 && completedIntermediateCount === intermediateModules.length) {
      currentLevel = 'intermediate';
      nextLevel = 'advanced';
      if (advancedModules.length > 0) {
        const advancedTotalXP = advancedModules.reduce((sum, m) => sum + (m.xp_value || 0), 0);
        const advancedEarnedXP = advancedModules.filter(m => completedModuleIds.includes(m.id))
          .reduce((sum, m) => sum + (m.xp_value || 0), 0);
        levelProgress = advancedTotalXP > 0 ? (advancedEarnedXP / advancedTotalXP) * 100 : 0;
        nextLevelXP = advancedTotalXP;
      }
    } else if (beginnerModules.length > 0 && completedBeginnerCount === beginnerModules.length) {
      currentLevel = 'beginner';
      nextLevel = 'intermediate';
      if (intermediateModules.length > 0) {
        const intermediateTotalXP = intermediateModules.reduce((sum, m) => sum + (m.xp_value || 0), 0);
        const intermediateEarnedXP = intermediateModules.filter(m => completedModuleIds.includes(m.id))
          .reduce((sum, m) => sum + (m.xp_value || 0), 0);
        levelProgress = intermediateTotalXP > 0 ? (intermediateEarnedXP / intermediateTotalXP) * 100 : 0;
        nextLevelXP = intermediateTotalXP;
      }
    } else {
      // Still working on beginner level
      currentLevel = 'beginner';
      nextLevel = 'intermediate';
      const beginnerTotalXP = beginnerModules.reduce((sum, m) => sum + (m.xp_value || 0), 0);
      const beginnerEarnedXP = beginnerModules.filter(m => completedModuleIds.includes(m.id))
        .reduce((sum, m) => sum + (m.xp_value || 0), 0);
      levelProgress = beginnerTotalXP > 0 ? (beginnerEarnedXP / beginnerTotalXP) * 100 : 0;
      nextLevelXP = beginnerTotalXP;
    }
    
    console.log('Level calculation:', {
      currentLevel,
      totalXP,
      levelProgress,
      nextLevel,
      nextLevelXP,
      completedBeginnerCount,
      totalBeginnerCount: beginnerModules.length,
      completedIntermediateCount,
      totalIntermediateCount: intermediateModules.length
    });
    
    return { currentLevel, totalXP, levelProgress, nextLevel, nextLevelXP };
  };

  // Check if module is unlocked
  const isModuleUnlocked = (moduleId: string) => {
    if (!modules.length) return false;
    
    const module = modules.find(m => m.id === moduleId);
    if (!module) return false;
    
    const { currentLevel } = calculateUserStats();
    
    // Define level hierarchy
    const levelHierarchy = ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentLevelIndex = levelHierarchy.indexOf(currentLevel);
    const moduleLevelIndex = levelHierarchy.indexOf(module.level);
    
    // If module is from a higher level than user's current level, it's locked
    if (moduleLevelIndex > currentLevelIndex) return false;
    
    // Get modules for the same topic and level, ordered by sort_order
    const topicModules = modules
      .filter(m => m.topic_id === module.topic_id && m.level === module.level)
      .sort((a, b) => a.sort_order - b.sort_order);
    
    const moduleIndex = topicModules.findIndex(m => m.id === moduleId);
    if (moduleIndex === 0) return true; // First module of each topic/level is always unlocked
    
    // For subsequent modules, check if previous module is completed
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
