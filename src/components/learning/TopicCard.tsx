
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Lock, Play } from 'lucide-react';

interface Module {
  id: string;
  name: string;
  description: string;
  topic_id: string;
  level: string;
  sort_order: number;
  xp_value: number;
  questions: any[];
}

interface TopicCardProps {
  topic: {
    id: string;
    name: string;
    description: string;
    icon: string;
  };
  modules: Module[];
  userProgress: any[];
  currentLevel: string;
  isModuleUnlocked: (moduleId: string) => boolean;
  onStartQuiz: (module: Module) => void;
}

const TopicCard = ({ topic, modules, userProgress, currentLevel, isModuleUnlocked, onStartQuiz }: TopicCardProps) => {
  const topicModules = modules.filter(m => m.topic_id === topic.id);
  const completedModules = topicModules.filter(m => 
    userProgress.find(p => p.module_id === m.id && p.completed)
  );

  const getModuleStatus = (module: Module) => {
    const progress = userProgress.find(p => p.module_id === module.id);
    const unlocked = isModuleUnlocked(module.id);
    
    if (progress?.completed) return 'completed';
    if (unlocked) return 'unlocked';
    return 'locked';
  };

  // Sort modules: unlocked/completed first, then locked ones
  const sortedModules = [...topicModules].sort((a, b) => {
    const statusA = getModuleStatus(a);
    const statusB = getModuleStatus(b);
    
    // Priority: completed > unlocked > locked
    const priorityMap = { completed: 3, unlocked: 2, locked: 1 };
    const priorityDiff = priorityMap[statusB] - priorityMap[statusA];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same status, sort by sort_order
    return a.sort_order - b.sort_order;
  });

  return (
    <Card className="h-full bg-gray-800/50 border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gray-800/70">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{topic.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-white">{topic.name}</h3>
              <p className="text-sm text-gray-400 font-light">{topic.description}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-3">
            <span className="font-medium">Progress</span>
            <span>{completedModules.length} / {topicModules.length} modules</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${topicModules.length > 0 ? (completedModules.length / topicModules.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {sortedModules.map((module) => {
            const status = getModuleStatus(module);
            return (
              <div
                key={module.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  status === 'locked' 
                    ? 'bg-gray-900/30 border-gray-700/30 opacity-60 cursor-not-allowed' 
                    : status === 'completed'
                      ? 'bg-green-900/20 border-green-500/20 hover:bg-green-900/30 cursor-pointer'
                      : 'bg-blue-900/20 border-blue-500/20 hover:bg-blue-900/30 cursor-pointer'
                }`}
                onClick={() => status !== 'locked' && onStartQuiz(module)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {status === 'completed' && <CheckCircle className="h-5 w-5 text-green-400" />}
                    {status === 'unlocked' && <Play className="h-5 w-5 text-blue-400" />}
                    {status === 'locked' && <Lock className="h-5 w-5 text-gray-500" />}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-white">{module.name}</div>
                    <div className="text-xs text-gray-400 font-light">{module.description}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  +{module.xp_value} XP
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopicCard;
