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

      const { error } = await supabase
        .from('learning_progress')
        .upsert({
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
        console.error('Supabase error:', error);
        throw error;
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

  // Calculate user's current level and XP
  const calculateUserStats = () => {
    if (!userProgress) return { currentLevel: 'beginner', totalXP: 0, levelProgress: 0 };
    
    const totalXP = userProgress.reduce((sum, progress) => sum + (progress.xp_earned || 0), 0);
    
    // Level thresholds based on total XP needed for each level
    const levelThresholds = {
      beginner: 0,
      intermediate: 150, // 6 beginner modules * 25 XP
      advanced: 400,     // 150 + (5 intermediate modules * 50 XP)
      expert: 750        // 400 + (7 advanced modules * 50 XP)
    };
    
    let currentLevel = 'beginner';
    if (totalXP >= levelThresholds.expert) currentLevel = 'expert';
    else if (totalXP >= levelThresholds.advanced) currentLevel = 'advanced';
    else if (totalXP >= levelThresholds.intermediate) currentLevel = 'intermediate';
    
    const nextLevel = currentLevel === 'beginner' ? 'intermediate' : 
                     currentLevel === 'intermediate' ? 'advanced' : 
                     currentLevel === 'advanced' ? 'expert' : null;
    
    const currentLevelXP = levelThresholds[currentLevel as keyof typeof levelThresholds];
    const nextLevelXP = nextLevel ? levelThresholds[nextLevel as keyof typeof levelThresholds] : totalXP;
    const levelProgress = nextLevel ? ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 : 100;
    
    return { currentLevel, totalXP, levelProgress, nextLevel, nextLevelXP };
  };

  // Check if module is unlocked
  const isModuleUnlocked = (moduleId: string) => {
    if (!userProgress || !modules.length) return false;
    
    const module = modules.find(m => m.id === moduleId);
    if (!module) return false;
    
    const { currentLevel } = calculateUserStats();
    
    // If module is from a higher level, it's locked
    if (module.level !== currentLevel) return false;
    
    // Get modules for the same topic and level, ordered by sort_order
    const topicModules = modules
      .filter(m => m.topic_id === module.topic_id && m.level === module.level)
      .sort((a, b) => a.sort_order - b.sort_order);
    
    const moduleIndex = topicModules.findIndex(m => m.id === moduleId);
    if (moduleIndex === 0) return true; // First module is always unlocked
    
    // Check if previous module is completed
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
